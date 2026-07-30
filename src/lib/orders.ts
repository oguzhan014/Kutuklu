import "server-only";
import { randomBytes } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toKurus, kurusToDecimalString, kurusToNumber } from "@/lib/money";
import { CheckoutError, priceCart, type CartLineInput } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import {
  orderPaidEmail,
  orderPendingTransferEmail,
  orderCancelledEmail,
  orderShippedEmail,
  orderRefundedEmail,
} from "@/lib/email-templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function orderUrl(orderNumber: string, accessToken: string): string {
  return `${SITE_URL}/siparis/${orderNumber}?token=${encodeURIComponent(accessToken)}`;
}

/**
 * ─────────────────────────────────────────────────────────────
 * SİPARİŞ YAŞAM DÖNGÜSÜ
 * ─────────────────────────────────────────────────────────────
 *
 * 1. createOrder()       → Fiyat sunucuda hesaplanır, stok ve kupon hakkı
 *                          ATOMİK olarak rezerve edilir, sipariş PENDING/UNPAID
 *                          olarak yazılır.
 * 2. Ödeme               → Kart: Stripe PaymentIntent (tutar sunucudan).
 *                          Havale: ödeme beklenir.
 * 3. markOrderPaid()     → YALNIZCA Stripe'ın kendisinden gelen doğrulanmış
 *                          bilgiyle (imzalı webhook veya sunucudan API sorgusu)
 *                          çağrılır. Tutar ve para birimi yeniden doğrulanır.
 * 4. releaseReservation()→ Ödeme başarısız/iptal olursa stok ve kupon hakkı
 *                          geri verilir. `stockReserved` bayrağı sayesinde
 *                          iki kez uygulanmaz.
 */

/** Okunması kolay, tahmin edilmesi zor sipariş numarası: KTK-260728-7F3QA */
function generateOrderNumber(): string {
  const now = new Date();
  const datePart =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  // Karıştırılabilir karakterler (0/O, 1/I) çıkarıldı.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(5);
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += alphabet[bytes[i]! % alphabet.length];
  }

  return `KTK-${datePart}-${suffix}`;
}

/**
 * Misafir siparişinin takip bağlantısı için kriptografik rastgele anahtar.
 * Tahmin edilemez olmalıdır: sipariş detayına erişim yetkisi verir.
 */
function generateAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export type CustomerInfo = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string | null;
  notes?: string | null;
  billingSameAsShipping: boolean;
  billingFullName?: string | null;
  billingTaxId?: string | null;
  billingCompany?: string | null;
  billingAddress?: string | null;
  billingCity?: string | null;
  billingDistrict?: string | null;
  billingPostalCode?: string | null;
};

export type CreateOrderInput = {
  items: CartLineInput[];
  couponCode?: string | null;
  paymentMethod: "card" | "transfer";
  customer: CustomerInfo;
  userId?: string | null;
};

export type CreatedOrder = {
  id: string;
  orderNumber: string;
  accessToken: string;
  totalKurus: number;
  paymentMethod: string;
};

/**
 * Siparişi oluşturur ve stok/kupon rezervasyonunu atomik olarak yapar.
 *
 * Stok düşümü `updateMany` + `stock >= quantity` koşuluyla yapılır; bu tek
 * ifade veritabanı seviyesinde atomiktir. İki müşteri son ürün için aynı anda
 * sipariş verirse yalnızca biri başarılı olur, diğerinin işlemi geri alınır.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const settings = await getSettings();

  const order = await prisma.$transaction(
    async (tx) => {
      // 1) Fiyatlar transaction İÇİNDE, veritabanından yeniden hesaplanır.
      const priced = await priceCart(input.items, {
        couponCode: input.couponCode,
        client: tx,
        checkStock: true,
        settings,
      });

      // Kupon geçersizse sessizce yok sayılmaz; kullanıcı yanlış tutar görmüş
      // olabileceği için işlem durdurulur ve tekrar denemesi istenir.
      if (priced.couponError) {
        throw new CheckoutError("INVALID_COUPON", priced.couponError);
      }

      // 2) Stok rezervasyonu — her satır için koşullu atomik düşüm.
      // Varyasyonlu üründe stok ProductVariant satırında, basit üründe
      // Product satırında tutulur; düşüm doğru tabloya uygulanır.
      for (const line of priced.lines) {
        const label = line.variantLabel ? `${line.name} (${line.variantLabel})` : line.name;

        const result = line.variantId
          ? await tx.productVariant.updateMany({
              where: { id: line.variantId, stock: { gte: line.quantity } },
              data: { stock: { decrement: line.quantity } },
            })
          : await tx.product.updateMany({
              where: {
                id: line.productId,
                isActive: true,
                stock: { gte: line.quantity },
              },
              data: { stock: { decrement: line.quantity } },
            });

        if (result.count !== 1) {
          throw new CheckoutError(
            "OUT_OF_STOCK",
            `"${label}" ürününde yeterli stok kalmadı. Lütfen sepetinizi güncelleyin.`
          );
        }
      }

      // 3) Kupon kullanım hakkı rezervasyonu — yarış koşuluna karşı koşullu.
      if (priced.coupon) {
        const couponRecord = await tx.coupon.findUnique({
          where: { id: priced.coupon.id },
          select: { maxUses: true },
        });

        const where: Prisma.CouponWhereInput = {
          id: priced.coupon.id,
          isActive: true,
        };

        if (couponRecord?.maxUses !== null && couponRecord?.maxUses !== undefined) {
          where.usedCount = { lt: couponRecord.maxUses };
        }

        const couponResult = await tx.coupon.updateMany({
          where,
          data: { usedCount: { increment: 1 } },
        });

        if (couponResult.count !== 1) {
          throw new CheckoutError(
            "COUPON_EXHAUSTED",
            "Kupon kullanım hakkı az önce doldu. Lütfen kuponu kaldırıp tekrar deneyin."
          );
        }
      }

      // 4) Siparişi yaz. Tüm tutarlar sunucunun hesapladığı değerlerdir.
      const { customer } = input;
      const shippingName = `${customer.firstName} ${customer.lastName}`.trim();

      // Sipariş numarası çakışması pratikte imkânsıza yakın; yine de kontrollü.
      let created = null as Awaited<ReturnType<typeof tx.order.create>> | null;
      let lastError: unknown = null;

      for (let attempt = 0; attempt < 5 && !created; attempt++) {
        try {
          created = await tx.order.create({
            data: {
              orderNumber: generateOrderNumber(),
              accessToken: generateAccessToken(),
              userId: input.userId ?? null,
              guestEmail: customer.email,
              status: "PENDING",
              paymentStatus: "UNPAID",
              paymentMethod: input.paymentMethod,
              stockReserved: true,

              subtotal: kurusToDecimalString(priced.subtotalKurus),
              shippingCost: kurusToDecimalString(priced.shippingKurus),
              discountAmount: kurusToDecimalString(priced.discountKurus),
              total: kurusToDecimalString(priced.totalKurus),

              couponId: priced.coupon?.id ?? null,
              couponCode: priced.coupon?.code ?? null,

              shippingName,
              shippingPhone: customer.phone,
              shippingAddress: customer.address,
              shippingCity: customer.city,
              shippingDistrict: customer.district,
              shippingPostalCode: customer.postalCode ?? null,

              billingSameAsShipping: customer.billingSameAsShipping,
              billingFullName: customer.billingSameAsShipping
                ? null
                : customer.billingFullName ?? null,
              billingTaxId: customer.billingTaxId ?? null,
              billingCompany: customer.billingCompany ?? null,
              billingAddress: customer.billingSameAsShipping
                ? null
                : customer.billingAddress ?? null,
              billingCity: customer.billingSameAsShipping
                ? null
                : customer.billingCity ?? null,
              billingDistrict: customer.billingSameAsShipping
                ? null
                : customer.billingDistrict ?? null,
              billingPostalCode: customer.billingSameAsShipping
                ? null
                : customer.billingPostalCode ?? null,

              notes: customer.notes ?? null,

              items: {
                create: priced.lines.map((line) => ({
                  productId: line.productId,
                  productName: line.name,
                  productSlug: line.slug,
                  productSku: line.sku,
                  productImage: line.imageUrl,
                  productVolume: line.volume,
                  variantId: line.variantId,
                  variantLabel: line.variantLabel,
                  unitPrice: kurusToDecimalString(line.unitPriceKurus),
                  quantity: line.quantity,
                  totalPrice: kurusToDecimalString(line.lineTotalKurus),
                })),
              },
            },
          });
        } catch (error) {
          lastError = error;
          const code = (error as { code?: string })?.code;
          // P2002 = unique ihlali (orderNumber/accessToken çakışması) → tekrar dene
          if (code !== "P2002") throw error;
        }
      }

      if (!created) {
        throw lastError ?? new CheckoutError("ORDER_FAILED", "Sipariş oluşturulamadı.");
      }

      return {
        id: created.id,
        orderNumber: created.orderNumber,
        accessToken: created.accessToken,
        totalKurus: priced.totalKurus,
        paymentMethod: input.paymentMethod,
        lines: priced.lines,
      };
    },
    { timeout: 20_000 }
  );

  // Havale/EFT siparişinde ödeme henüz yok; müşteriye banka bilgilerini
  // içeren bir "sipariş alındı" e-postası gönderilir. Kart siparişinde
  // e-posta ödeme onaylandığında (markOrderPaid) gönderilir.
  if (order.paymentMethod === "transfer") {
    const customerName = `${input.customer.firstName} ${input.customer.lastName}`.trim();

    void sendEmail({
      to: input.customer.email,
      subject: `Siparişiniz alındı — ${order.orderNumber}`,
      html: orderPendingTransferEmail({
        orderNumber: order.orderNumber,
        customerName,
        totalLabel: formatPrice(kurusToNumber(order.totalKurus)),
        orderUrl: orderUrl(order.orderNumber, order.accessToken),
        siteUrl: SITE_URL,
        lines: order.lines.map((line) => ({
          name: line.variantLabel ? `${line.name} (${line.variantLabel})` : line.name,
          quantity: line.quantity,
          totalLabel: formatPrice(kurusToNumber(line.lineTotalKurus)),
        })),
        bankName: settings["bank.name"],
        bankIban: settings["bank.iban"],
        bankAccountHolder: settings["bank.accountHolder"],
      }),
    }).catch((error) => console.error("[createOrder] e-posta gönderilemedi:", error));
  }

  return order;
}

/**
 * Rezerve edilen stok ve kupon hakkını geri verir.
 * `stockReserved` bayrağı koşullu güncellendiği için iki kez çalışsa bile
 * stok yalnızca bir kez iade edilir (idempotent).
 */
export async function releaseOrderReservation(orderId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    // Bayrağı koşullu olarak indir; count === 0 ise başka bir istek zaten yapmış.
    const claimed = await tx.order.updateMany({
      where: { id: orderId, stockReserved: true },
      data: { stockReserved: false },
    });

    if (claimed.count !== 1) return false;

    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return false;

    for (const item of order.items) {
      if (item.variantId) {
        // variantId'nin FK'sı yok (ürün düzenlemesi varyantları yeniden
        // oluşturur, ID değişir); satır artık yoksa updateMany 0 satır
        // eşleştirir ve sessizce hiçbir şey yapmaz — bu, ürün yapısı
        // değiştiğinde stok iadesinin doğru bir hedefi kalmadığı anlamına
        // gelir ve kabul edilebilir bir sınırdır.
        await tx.productVariant.updateMany({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
        continue;
      }

      if (!item.productId) continue;
      await tx.product.updateMany({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    if (order.couponId) {
      await tx.coupon.updateMany({
        where: { id: order.couponId, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      });
    }

    return true;
  });
}

export type MarkPaidResult =
  | { status: "paid" }
  | { status: "already_paid" }
  | { status: "not_found" }
  | { status: "mismatch"; reason: string };

/**
 * Siparişi ödendi olarak işaretler.
 *
 * ÖNEMLİ: Bu fonksiyon YALNIZCA Stripe'tan doğrulanmış veriyle çağrılmalıdır
 * (imzası doğrulanmış webhook olayı veya sunucudan yapılan PaymentIntent
 * sorgusu). İstemcinin "ödeme başarılı" demesi asla yeterli değildir.
 *
 * Tutar ve para birimi burada BİR KEZ DAHA doğrulanır: PaymentIntent tutarı
 * siparişin veritabanındaki toplamıyla birebir eşleşmiyorsa sipariş ödenmiş
 * sayılmaz ve inceleme için işaretlenir.
 */
export async function markOrderPaid(params: {
  orderId: string;
  paymentIntentId: string;
  amountReceivedKurus: number;
  currency: string;
}): Promise<MarkPaidResult> {
  const { orderId, paymentIntentId, amountReceivedKurus, currency } = params;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { status: "not_found" };

  if (order.paymentStatus === "PAID") return { status: "already_paid" };

  const expectedKurus = toKurus(order.total);

  if (currency.toLowerCase() !== "try") {
    const reason = `Para birimi uyuşmuyor: beklenen TRY, gelen ${currency.toUpperCase()}`;
    await flagOrderForReview(orderId, reason);
    return { status: "mismatch", reason };
  }

  if (amountReceivedKurus !== expectedKurus) {
    const reason = `Tutar uyuşmuyor: beklenen ${expectedKurus} kuruş, tahsil edilen ${amountReceivedKurus} kuruş`;
    await flagOrderForReview(orderId, reason);
    return { status: "mismatch", reason };
  }

  if (order.stripePaymentId && order.stripePaymentId !== paymentIntentId) {
    const reason = `PaymentIntent eşleşmiyor: siparişe kayıtlı ${order.stripePaymentId}, gelen ${paymentIntentId}`;
    await flagOrderForReview(orderId, reason);
    return { status: "mismatch", reason };
  }

  // Koşullu güncelleme: eşzamanlı iki webhook gelirse yalnızca biri uygular.
  const updated = await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: "UNPAID" },
    data: {
      paymentStatus: "PAID",
      status: "PROCESSING",
      paidAt: new Date(),
      stripePaymentId: paymentIntentId,
    },
  });

  if (updated.count !== 1) return { status: "already_paid" };

  // `updated.count === 1` yalnızca BU çağrının durumu değiştirdiği anlamına
  // gelir; bu sayede ödeme onayı e-postası tam olarak bir kez gönderilir
  // (eşzamanlı webhook tekrarlarında ikinci çağrı buraya hiç ulaşmaz).
  await sendPaidConfirmationEmail(orderId).catch((error) =>
    console.error("[markOrderPaid] e-posta gönderilemedi:", error)
  );

  return { status: "paid" };
}

/** Ödeme onayı e-postasını gönderir. Kart (webhook) ve havale (admin onayı) akışlarının ortak noktası. */
export async function sendPaidConfirmationEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { email: true, name: true } } },
  });

  if (!order) return;

  const recipient = order.user?.email ?? order.guestEmail;
  if (!recipient) return;

  await sendEmail({
    to: recipient,
    subject: `Ödemeniz onaylandı — ${order.orderNumber}`,
    html: orderPaidEmail({
      orderNumber: order.orderNumber,
      customerName: order.user?.name ?? order.shippingName,
      totalLabel: formatPrice(Number(order.total)),
      orderUrl: orderUrl(order.orderNumber, order.accessToken),
      siteUrl: SITE_URL,
      lines: order.items.map((item) => ({
        name: item.variantLabel ? `${item.productName} (${item.variantLabel})` : item.productName,
        quantity: item.quantity,
        totalLabel: formatPrice(Number(item.totalPrice)),
      })),
    }),
  });
}

/** Şüpheli/uyuşmayan ödemeyi admin notuna yazar. */
async function flagOrderForReview(orderId: string, reason: string) {
  const stamp = new Date().toISOString();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { adminNote: true },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      adminNote: `${order?.adminNote ? `${order.adminNote}\n` : ""}[${stamp}] ÖDEME UYUŞMAZLIĞI: ${reason}`,
    },
  });

  console.error(`[ödeme-uyuşmazlığı] order=${orderId} ${reason}`);
}

/**
 * Ödemesi tamamlanmayan eski kart siparişlerinin stok rezervasyonunu serbest
 * bırakır.
 *
 * Kullanıcı ödeme ekranını yarıda bırakırsa stok süresiz kilitli kalmamalıdır.
 * Bu fonksiyon yeni sipariş oluşturulurken arka planda tetiklenir.
 */
export async function releaseStaleReservations(olderThanMinutes = 60): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanMinutes * 60_000);

  const stale = await prisma.order.findMany({
    where: {
      stockReserved: true,
      paymentStatus: "UNPAID",
      paymentMethod: "card",
      createdAt: { lt: cutoff },
    },
    select: { id: true },
    take: 50,
  });

  let released = 0;

  for (const order of stale) {
    try {
      const didRelease = await releaseOrderReservation(order.id);
      if (didRelease) {
        await prisma.order.updateMany({
          where: { id: order.id, paymentStatus: "UNPAID" },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            adminNote: "Ödeme tamamlanmadığı için otomatik iptal edildi.",
          },
        });
        released++;
      }
    } catch (error) {
      console.error(`[releaseStaleReservations] ${order.id} serbest bırakılamadı:`, error);
    }
  }

  return released;
}

/**
 * Siparişi iptal eder ve rezervasyonu geri verir.
 *
 * @param notifyCustomer Müşteriye iptal e-postası gönderilsin mi. Terk
 *   edilmiş kart siparişlerinin sessiz otomatik iptalinde (müşteri hiçbir
 *   onay almadığı için) `false` geçilmelidir; yönetici tarafından bilinçli
 *   iptalde `true` olmalıdır.
 */
export async function cancelOrder(
  orderId: string,
  reason?: string,
  notifyCustomer = false
) {
  await releaseOrderReservation(orderId);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      ...(reason ? { adminNote: reason } : {}),
    },
  });

  if (notifyCustomer) {
    await sendOrderStatusEmail(orderId, "cancelled").catch((error) =>
      console.error("[cancelOrder] e-posta gönderilemedi:", error)
    );
  }
}

/** Kargoya verildi bildirimini gönderir. */
export async function sendShippedEmail(orderId: string) {
  await sendOrderStatusEmail(orderId, "shipped");
}

/** İade bildirimini gönderir (admin elle veya Stripe webhook'u üzerinden). */
export async function sendRefundedEmail(orderId: string) {
  await sendOrderStatusEmail(orderId, "refunded");
}

async function sendOrderStatusEmail(
  orderId: string,
  kind: "cancelled" | "shipped" | "refunded"
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { email: true, name: true } } },
  });

  if (!order) return;

  const recipient = order.user?.email ?? order.guestEmail;
  if (!recipient) return;

  const base = {
    orderNumber: order.orderNumber,
    customerName: order.user?.name ?? order.shippingName,
    totalLabel: formatPrice(Number(order.total)),
    orderUrl: orderUrl(order.orderNumber, order.accessToken),
    siteUrl: SITE_URL,
    lines: order.items.map((item) => ({
      name: item.variantLabel ? `${item.productName} (${item.variantLabel})` : item.productName,
      quantity: item.quantity,
      totalLabel: formatPrice(Number(item.totalPrice)),
    })),
  };

  if (kind === "cancelled") {
    await sendEmail({
      to: recipient,
      subject: `Siparişiniz iptal edildi — ${order.orderNumber}`,
      html: orderCancelledEmail(base),
    });
    return;
  }

  if (kind === "refunded") {
    await sendEmail({
      to: recipient,
      subject: `Ödemeniz iade edildi — ${order.orderNumber}`,
      html: orderRefundedEmail(base),
    });
    return;
  }

  await sendEmail({
    to: recipient,
    subject: `Siparişiniz kargoda — ${order.orderNumber}`,
    html: orderShippedEmail({
      ...base,
      carrier: order.shippingCarrier ?? "Kargo firması",
      trackingNumber: order.trackingNumber ?? "-",
    }),
  });
}
