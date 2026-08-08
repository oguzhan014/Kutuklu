"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { limitByIp, getClientIp } from "@/lib/rate-limit";
import { CheckoutError, priceCart, type CartLineInput } from "@/lib/pricing";
import {
  createOrder,
  releaseOrderReservation,
  releaseStaleReservations,
} from "@/lib/orders";
import {
  createPaymentToken,
  generateMerchantOid,
  isPayTRConfigured,
} from "@/lib/paytr";
import { getSettings, settingBool } from "@/lib/settings";
import { checkoutSchemaWithBilling } from "@/lib/checkout-schema";
import { isValidIl } from "@/lib/turkiye-iller";
import { kurusToNumber } from "@/lib/money";

/**
 * ─────────────────────────────────────────────────────────────
 * ÖDEME AKIŞI — SUNUCU EYLEMLERİ
 * ─────────────────────────────────────────────────────────────
 *
 * Server Action'lar tarayıcıdan doğrudan POST edilebilir. Bu yüzden burada
 * arayüzde ne olduğu varsayılmaz: her çağrıda girdi yeniden doğrulanır,
 * fiyat yeniden hesaplanır, hız sınırı uygulanır.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export type CartSummary = {
  ok: true;
  lines: {
    productId: string;
    variantId: string | null;
    variantLabel: string | null;
    name: string;
    slug: string;
    volume: number | null;
    imageUrl: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    stock: number;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  coupon: { code: string; type: string; value: number } | null;
  couponError: string | null;
};

export type CartSummaryResult = CartSummary | { ok: false; error: string; code: string };

/**
 * Sepetin sunucu tarafından hesaplanmış özetini döner.
 * Ödeme ekranında gösterilen TÜM tutarlar buradan gelir — istemci kendi
 * hesapladığı bir toplamı asla göstermez veya göndermez.
 */
export async function getCartSummary(
  items: CartLineInput[],
  couponCode?: string | null
): Promise<CartSummaryResult> {
  const limit = await limitByIp("cart-summary", 60, 60_000);
  if (!limit.ok) {
    return {
      ok: false,
      code: "RATE_LIMIT",
      error: "Çok fazla istek gönderildi. Lütfen biraz bekleyin.",
    };
  }

  try {
    // Kişi başı kupon limiti uyarısını erken gösterebilmek için oturum
    // sahibinin e-postası kullanılır. Misafirde kimlik henüz bilinmediğinden
    // uyarı sipariş anında çıkar (asıl koruma zaten orada).
    const session = await auth();

    // Önizlemede stok hatası fırlatmıyoruz; kalan stok satır bazında gösterilir.
    const priced = await priceCart(items, {
      couponCode,
      checkStock: false,
      buyerEmail: session?.user?.email ?? null,
    });

    return {
      ok: true,
      lines: priced.lines.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        variantLabel: line.variantLabel,
        name: line.name,
        slug: line.slug,
        volume: line.volume,
        imageUrl: line.imageUrl,
        quantity: line.quantity,
        unitPrice: kurusToNumber(line.unitPriceKurus),
        lineTotal: kurusToNumber(line.lineTotalKurus),
        stock: line.stock,
      })),
      subtotal: kurusToNumber(priced.subtotalKurus),
      discount: kurusToNumber(priced.discountKurus),
      shipping: kurusToNumber(priced.shippingKurus),
      total: kurusToNumber(priced.totalKurus),
      freeShippingThreshold: kurusToNumber(priced.freeShippingThresholdKurus),
      coupon: priced.coupon
        ? {
            code: priced.coupon.code,
            type: priced.coupon.type,
            value: priced.coupon.value,
          }
        : null,
      couponError: priced.couponError,
    };
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { ok: false, code: error.code, error: error.message };
    }
    console.error("[getCartSummary] beklenmeyen hata:", error);
    return {
      ok: false,
      code: "UNKNOWN",
      error: "Sepet hesaplanamadı. Lütfen sayfayı yenileyin.",
    };
  }
}

export type PlaceOrderResult =
  | {
      ok: true;
      orderNumber: string;
      accessToken: string;
      paymentMethod: "card" | "transfer";
      /** Kart ödemesinde PayTR güvenli ödeme iframe'inin adresi. */
      paymentIframeUrl: string | null;
      total: number;
    }
  | { ok: false; error: string; code: string; fieldErrors?: Record<string, string> };

/**
 * Siparişi oluşturur.
 *
 * Güvenlik zinciri:
 *  1. Hız sınırı (sipariş spam'i / kart deneme saldırısı)
 *  2. Zod ile katı girdi doğrulaması
 *  3. Fiyat/kargo/indirim SUNUCUDA veritabanından hesaplanır
 *  4. Stok ve kupon atomik rezerve edilir
 *  5. PayTR ödeme tutarı sunucunun hesabından üretilir ve imzalanır
 *  6. Ödeme "başarılı" bilgisi asla istemciden kabul edilmez (bkz. bildirim)
 */
export async function placeOrder(rawInput: unknown): Promise<PlaceOrderResult> {
  const limit = await limitByIp("place-order", 10, 60_000);
  if (!limit.ok) {
    return {
      ok: false,
      code: "RATE_LIMIT",
      error: `Çok fazla sipariş denemesi. ${limit.retryAfterSeconds} saniye sonra tekrar deneyin.`,
    };
  }

  const parsed = checkoutSchemaWithBilling.safeParse(rawInput);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      code: "VALIDATION",
      error: "Lütfen formdaki hatalı alanları düzeltin.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  if (!isValidIl(data.city)) {
    return {
      ok: false,
      code: "VALIDATION",
      error: "Lütfen geçerli bir il seçin.",
      fieldErrors: { city: "Geçerli bir il seçin" },
    };
  }

  // Ödeme yönteminin sitede açık olduğunu doğrula.
  const settings = await getSettings();

  if (data.paymentMethod === "card") {
    if (!settingBool(settings, "payment.cardEnabled")) {
      return {
        ok: false,
        code: "METHOD_DISABLED",
        error: "Kredi kartı ile ödeme şu anda kullanılamıyor.",
      };
    }
    if (!isPayTRConfigured()) {
      return {
        ok: false,
        code: "PAYTR_NOT_CONFIGURED",
        error:
          "Kredi kartı ödemesi henüz etkin değil. Lütfen Havale/EFT ile devam edin.",
      };
    }
  }

  if (data.paymentMethod === "transfer" && !settingBool(settings, "payment.transferEnabled")) {
    return {
      ok: false,
      code: "METHOD_DISABLED",
      error: "Havale/EFT ile ödeme şu anda kullanılamıyor.",
    };
  }

  // Yarıda bırakılmış eski siparişlerin stoğunu serbest bırak (arka planda).
  releaseStaleReservations().catch((error) =>
    console.error("[placeOrder] eski rezervasyonlar temizlenemedi:", error)
  );

  // Oturum varsa siparişi kullanıcıya bağla. userId İSTEMCİDEN ALINMAZ.
  const session = await auth();
  const userId = session?.user?.id ?? null;

  let created;

  try {
    created = await createOrder({
      items: data.items,
      couponCode: data.couponCode ?? null,
      paymentMethod: data.paymentMethod,
      userId,
      customer: {
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city,
        district: data.district,
        address: data.address,
        postalCode: data.postalCode ?? null,
        notes: data.notes ?? null,
        billingSameAsShipping: data.billingSameAsShipping,
        billingFullName: data.billingFullName ?? null,
        billingTaxId: data.billingTaxId ?? null,
        billingCompany: data.billingCompany ?? null,
        billingAddress: data.billingAddress ?? null,
        billingCity: data.billingCity ?? null,
        billingDistrict: data.billingDistrict ?? null,
        billingPostalCode: data.billingPostalCode ?? null,
      },
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { ok: false, code: error.code, error: error.message };
    }
    console.error("[placeOrder] sipariş oluşturulamadı:", error);
    return {
      ok: false,
      code: "ORDER_FAILED",
      error: "Sipariş oluşturulamadı. Lütfen tekrar deneyin.",
    };
  }

  // Havale/EFT: ödeme beklenir, sipariş PENDING kalır.
  if (created.paymentMethod === "transfer") {
    return {
      ok: true,
      orderNumber: created.orderNumber,
      accessToken: created.accessToken,
      paymentMethod: "transfer",
      paymentIframeUrl: null,
      total: kurusToNumber(created.totalKurus),
    };
  }

  // Kart: PayTR'ye gönderilen tutar SUNUCUNUN hesapladığı toplamdır ve
  // merchant_key ile imzalanır; yolda değiştirilirse PayTR reddeder.
  try {
    const merchantOid = generateMerchantOid(created.orderNumber);

    // Referans önce yazılır: PayTR bildirimi token yanıtından ÖNCE gelse bile
    // siparişi bulabilelim.
    await prisma.order.update({
      where: { id: created.id },
      data: { paymentRef: merchantOid },
    });

    const orderUrl = `${SITE_URL}/siparis/${created.orderNumber}?token=${encodeURIComponent(
      created.accessToken
    )}`;

    const token = await createPaymentToken({
      merchantOid,
      amountKurus: created.totalKurus,
      email: data.email,
      userName: `${data.firstName} ${data.lastName}`.trim(),
      userPhone: data.phone,
      userAddress: `${data.address} ${data.district} ${data.city}`.trim(),
      userIp: await getClientIp(),
      basket: created.lines.map((line) => ({
        name: line.variantLabel ? `${line.name} (${line.variantLabel})` : line.name,
        unitPriceKurus: line.unitPriceKurus,
        quantity: line.quantity,
      })),
      okUrl: orderUrl,
      failUrl: orderUrl,
    });

    if (!token.ok) {
      throw new Error(token.error);
    }

    return {
      ok: true,
      orderNumber: created.orderNumber,
      accessToken: created.accessToken,
      paymentMethod: "card",
      paymentIframeUrl: token.iframeUrl,
      total: kurusToNumber(created.totalKurus),
    };
  } catch (error) {
    // Ödeme başlatılamadıysa rezerve edilen stok ve kupon hakkı geri verilir.
    console.error("[placeOrder] PayTR ödemesi başlatılamadı:", error);
    await releaseOrderReservation(created.id).catch((releaseError) =>
      console.error("[placeOrder] rezervasyon geri alınamadı:", releaseError)
    );
    await prisma.order
      .update({
        where: { id: created.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      })
      .catch(() => undefined);

    return {
      ok: false,
      code: "PAYMENT_INIT_FAILED",
      error: "Ödeme başlatılamadı. Lütfen tekrar deneyin.",
    };
  }
}
