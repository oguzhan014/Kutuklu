import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toKurus } from "@/lib/money";
import { formatVariantLabel } from "@/lib/variants";
import { getSettings, settingInt, type Settings } from "@/lib/settings";

/**
 * ─────────────────────────────────────────────────────────────
 * SEPET FİYATLANDIRMA — TEK GÜVENİLİR KAYNAK
 * ─────────────────────────────────────────────────────────────
 *
 * TEMEL KURAL: İstemciden yalnızca `productId`, `variantId` (varsa) ve
 * `quantity` kabul edilir. Fiyat, ürün adı, kargo, indirim ve toplam DAİMA
 * veritabanından yeniden hesaplanır. Tarayıcıdan gelen hiçbir tutar hiçbir
 * aşamada kullanılmaz.
 *
 * Varyasyonlu ürünlerde (`type: VARIABLE`) fiyat ve stok Product satırında
 * DEĞİL, seçilen ProductVariant satırında tutulur. `variantId` sunucuda
 * ürünün gerçek varyant listesiyle doğrulanır; istemcinin uydurduğu bir
 * varyant kimliği veya SIMPLE bir ürüne eklenmiş sahte varyant asla kabul
 * edilmez.
 *
 * Bu fonksiyon hem ödeme ekranındaki önizleme hem de siparişin gerçek
 * oluşturulması için kullanılır; böylece gösterilen tutar ile tahsil edilen
 * tutarın aynı kodla üretilmesi garanti altına alınır.
 */

export const FALLBACK_PRODUCT_IMAGE = "/images/product-bottle.png";

/** Bir sepette en fazla kaç farklı ürün satırı olabilir. */
const MAX_CART_LINES = 50;

export class CheckoutError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "CheckoutError";
    this.code = code;
  }
}

export type CartLineInput = {
  productId: string;
  /** Yalnızca VARIABLE tipi ürünlerde gereklidir; SIMPLE üründe yok sayılır. */
  variantId?: string | null;
  quantity: number;
};

export type PricedLine = {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  slug: string;
  sku: string | null;
  volume: number | null;
  imageUrl: string;
  quantity: number;
  unitPriceKurus: number;
  lineTotalKurus: number;
  stock: number;
};

export type AppliedCoupon = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotalKurus: number;
  discountKurus: number;
  shippingKurus: number;
  totalKurus: number;
  coupon: AppliedCoupon | null;
  couponError: string | null;
  freeShippingThresholdKurus: number;
};

type DbClient = Prisma.TransactionClient | typeof prisma;

type MergedLine = { productId: string; variantId: string | null; quantity: number };

/** Bir satır için birleştirme anahtarı: aynı ürün+varyant tek satırda toplanır. */
function lineKey(productId: string, variantId: string | null): string {
  return `${productId}::${variantId ?? ""}`;
}

/**
 * İstemciden gelen ham sepet verisini normalize eder.
 * Aynı ürün+varyant birden fazla satırda gelirse birleştirilir, adet
 * sınırlandırılır.
 */
function normalizeLines(
  rawLines: CartLineInput[],
  maxQuantityPerItem: number
): Map<string, MergedLine> {
  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    throw new CheckoutError("EMPTY_CART", "Sepetiniz boş.");
  }

  if (rawLines.length > MAX_CART_LINES) {
    throw new CheckoutError(
      "TOO_MANY_LINES",
      "Sepetinizde çok fazla farklı ürün var."
    );
  }

  const merged = new Map<string, MergedLine>();

  for (const line of rawLines) {
    const productId = typeof line?.productId === "string" ? line.productId.trim() : "";
    const rawVariantId = line?.variantId;
    const variantId =
      typeof rawVariantId === "string" && rawVariantId.trim() !== ""
        ? rawVariantId.trim()
        : null;
    const quantity = Number(line?.quantity);

    if (!productId || productId.length > 100) {
      throw new CheckoutError("INVALID_PRODUCT", "Sepette geçersiz bir ürün var.");
    }

    if (variantId && variantId.length > 100) {
      throw new CheckoutError("INVALID_PRODUCT", "Sepette geçersiz bir ürün seçeneği var.");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new CheckoutError("INVALID_QUANTITY", "Ürün adedi geçersiz.");
    }

    const key = lineKey(productId, variantId);
    const existing = merged.get(key);
    const next = (existing?.quantity ?? 0) + quantity;

    if (next > maxQuantityPerItem) {
      throw new CheckoutError(
        "QUANTITY_LIMIT",
        `Bir üründen en fazla ${maxQuantityPerItem} adet sipariş verebilirsiniz.`
      );
    }

    merged.set(key, { productId, variantId, quantity: next });
  }

  return merged;
}

/**
 * Kupon kodunu sunucuda doğrular ve indirim tutarını (kuruş) hesaplar.
 * Geçersizse hata fırlatmaz; indirim 0 döner ve sebep `error` alanında verilir.
 * Böylece kullanıcı kupon yüzünden ödeme yapamaz duruma düşmez.
 */
async function resolveCoupon(
  client: DbClient,
  couponCode: string | null | undefined,
  subtotalKurus: number
): Promise<{ coupon: AppliedCoupon | null; discountKurus: number; error: string | null }> {
  const code = couponCode?.trim().toUpperCase();
  if (!code) return { coupon: null, discountKurus: 0, error: null };

  if (code.length > 50) {
    return { coupon: null, discountKurus: 0, error: "Kupon kodu geçersiz." };
  }

  const coupon = await client.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.isActive) {
    return { coupon: null, discountKurus: 0, error: "Kupon kodu geçersiz." };
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() <= Date.now()) {
    return { coupon: null, discountKurus: 0, error: "Bu kuponun süresi dolmuş." };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return {
      coupon: null,
      discountKurus: 0,
      error: "Bu kuponun kullanım hakkı dolmuş.",
    };
  }

  const minOrderKurus = coupon.minOrderAmount ? toKurus(coupon.minOrderAmount) : 0;
  if (subtotalKurus < minOrderKurus) {
    return {
      coupon: null,
      discountKurus: 0,
      error: `Bu kupon en az ${(minOrderKurus / 100).toFixed(2)} TL tutarındaki siparişlerde geçerli.`,
    };
  }

  let discountKurus: number;

  if (coupon.type === "PERCENTAGE") {
    // Yüzde değeri 0-100 aralığına sıkıştırılır: hatalı/kötü niyetli kupon
    // kaydı negatif toplam üretemez.
    const percent = Math.min(100, Math.max(0, Number(coupon.value.toString())));
    discountKurus = Math.round((subtotalKurus * percent) / 100);
  } else {
    discountKurus = Math.max(0, toKurus(coupon.value));
  }

  // İndirim hiçbir koşulda ara toplamı aşamaz (negatif toplam imkânsız).
  discountKurus = Math.min(discountKurus, subtotalKurus);

  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value.toString()),
    },
    discountKurus,
    error: null,
  };
}

/**
 * Sepeti veritabanına göre fiyatlandırır.
 *
 * @param client Transaction içinde çağrılıyorsa tx client verilmelidir;
 *               böylece fiyat okuma ve stok düşme aynı işlemde olur.
 * @param checkStock Stok yetersizse hata fırlatılsın mı (sipariş anında true).
 */
export async function priceCart(
  rawLines: CartLineInput[],
  options: {
    couponCode?: string | null;
    client?: DbClient;
    checkStock?: boolean;
    settings?: Settings;
  } = {}
): Promise<PricedCart> {
  const client = options.client ?? prisma;
  const checkStock = options.checkStock ?? true;
  const settings = options.settings ?? (await getSettings());

  const maxQuantityPerItem = Math.max(
    1,
    settingInt(settings, "order.maxQuantityPerItem")
  );

  const merged = normalizeLines(rawLines, maxQuantityPerItem);
  const productIds = [...new Set([...merged.values()].map((line) => line.productId))];

  const products = await client.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
      variants: true,
    },
  });

  const productById = new Map(products.map((p) => [p.id, p]));

  const lines: PricedLine[] = [];
  let subtotalKurus = 0;

  for (const { productId, variantId, quantity } of merged.values()) {
    const product = productById.get(productId);

    if (!product) {
      throw new CheckoutError(
        "PRODUCT_UNAVAILABLE",
        "Sepetinizdeki bir ürün artık satışta değil. Lütfen sepetinizi güncelleyin."
      );
    }

    // Fiyat ve stok DAİMA veritabanından okunur — SIMPLE üründe Product
    // satırından, VARIABLE üründe seçilen ProductVariant satırından.
    let unitPriceKurus: number;
    let stock: number;
    let sku: string | null;
    let variantLabel: string | null = null;
    let resolvedVariantId: string | null = null;

    if (product.type === "VARIABLE") {
      const variant = variantId
        ? product.variants.find((v) => v.id === variantId)
        : undefined;

      if (!variant) {
        throw new CheckoutError(
          "PRODUCT_UNAVAILABLE",
          `"${product.name}" için seçtiğiniz seçenek artık mevcut değil. Lütfen tekrar seçim yapın.`
        );
      }

      unitPriceKurus = toKurus(variant.price);
      stock = variant.stock;
      sku = variant.sku ?? product.sku;
      variantLabel = formatVariantLabel(variant.attributes) || null;
      resolvedVariantId = variant.id;
    } else {
      unitPriceKurus = toKurus(product.price);
      stock = product.stock;
      sku = product.sku;
    }

    if (checkStock && stock < quantity) {
      const label = variantLabel ? `${product.name} (${variantLabel})` : product.name;
      throw new CheckoutError(
        "OUT_OF_STOCK",
        stock === 0
          ? `"${label}" ürünü tükendi.`
          : `"${label}" ürününden yalnızca ${stock} adet kaldı.`
      );
    }

    if (unitPriceKurus < 0) {
      throw new CheckoutError("INVALID_PRICE", "Ürün fiyatı geçersiz.");
    }

    const lineTotalKurus = unitPriceKurus * quantity;
    subtotalKurus += lineTotalKurus;

    lines.push({
      productId: product.id,
      variantId: resolvedVariantId,
      variantLabel,
      name: product.name,
      slug: product.slug,
      sku,
      volume: product.volume,
      imageUrl: product.images[0]?.url ?? FALLBACK_PRODUCT_IMAGE,
      quantity,
      unitPriceKurus,
      lineTotalKurus,
      stock,
    });
  }

  const {
    coupon,
    discountKurus,
    error: couponError,
  } = await resolveCoupon(client, options.couponCode, subtotalKurus);

  const discountedSubtotal = subtotalKurus - discountKurus;

  // Ücretsiz kargo eşiği indirim SONRASI tutara göre değerlendirilir;
  // böylece kupon kullanarak bedava kargo elde etme boşluğu kapanır.
  const shippingCostKurus = Math.max(0, settingInt(settings, "shipping.cost"));
  const freeShippingThresholdKurus = Math.max(
    0,
    settingInt(settings, "shipping.freeThreshold")
  );

  const shippingKurus =
    discountedSubtotal <= 0 || discountedSubtotal >= freeShippingThresholdKurus
      ? 0
      : shippingCostKurus;

  const totalKurus = discountedSubtotal + shippingKurus;

  if (totalKurus < 0) {
    // Ulaşılamaz olmalı; yine de savunma amaçlı.
    throw new CheckoutError("INVALID_TOTAL", "Sipariş toplamı hesaplanamadı.");
  }

  return {
    lines,
    subtotalKurus,
    discountKurus,
    shippingKurus,
    totalKurus,
    coupon,
    couponError,
    freeShippingThresholdKurus,
  };
}
