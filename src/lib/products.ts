import "server-only";
import { prisma } from "@/lib/prisma";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/pricing";
import { getVariantPriceRange } from "@/lib/variants";

/**
 * Ürün listeleme/detay için ortak yardımcılar.
 *
 * Puanlar YALNIZCA onaylanmış (`isApproved`) yorumlardan hesaplanır;
 * daha önce arayüzde sabit 4.8 puan ve `Math.random()` ile üretilen sahte
 * yorum sayısı gösteriliyordu.
 */

export type Rating = { average: number; count: number };

/** Verilen ürünler için onaylı yorum ortalaması ve sayısını döner. */
export async function getRatings(productIds: string[]): Promise<Map<string, Rating>> {
  const result = new Map<string, Rating>();
  if (productIds.length === 0) return result;

  const grouped = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  for (const row of grouped) {
    result.set(row.productId, {
      average: row._avg.rating ?? 0,
      count: row._count.rating,
    });
  }

  return result;
}

/**
 * Aynı ürünün farklı hacimlerdeki kardeş kayıtlarını bulur.
 *
 * Veri modelinde her hacim AYRI bir üründür (ör. "klasik-sizma-500ml" ve
 * "klasik-sizma-1000ml"). Bu yüzden hacim seçimi fiyatı değiştiren bir
 * seçenek değil, başka bir ürüne geçiştir. Bu ayrım, 1 litreyi 500 ml
 * fiyatına sipariş etmeyi imkânsız kılar.
 */
export async function getVolumeOptions(product: {
  id: string;
  name: string;
  volume: number | null;
  price: unknown;
  stock: number;
  slug: string;
}) {
  const siblings = await prisma.product.findMany({
    where: { name: product.name, isActive: true, volume: { not: null } },
    select: { id: true, slug: true, volume: true, price: true, stock: true },
    orderBy: { volume: "asc" },
  });

  // Kardeş yoksa yalnızca bu ürünün kendi hacmi listelenir.
  if (siblings.length === 0 && product.volume) {
    return [
      {
        volume: product.volume,
        slug: product.slug,
        productId: product.id,
        price: Number(product.price),
        stock: product.stock,
      },
    ];
  }

  return siblings.map((sibling) => ({
    volume: sibling.volume!,
    slug: sibling.slug,
    productId: sibling.id,
    price: Number(sibling.price),
    stock: sibling.stock,
  }));
}

/** Onaylı yorumları, "doğrulanmış alıcı" rozetiyle birlikte getirir. */
export async function getApprovedReviews(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: { select: { id: true, name: true } } },
  });

  if (reviews.length === 0) return [];

  // Bu ürünü gerçekten satın almış kullanıcılar.
  const buyers = await prisma.order.findMany({
    where: {
      paymentStatus: "PAID",
      userId: { in: reviews.map((review) => review.user.id) },
      items: { some: { productId } },
    },
    select: { userId: true },
  });

  const buyerIds = new Set(buyers.map((order) => order.userId));

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    createdAt: review.createdAt.toISOString(),
    // Soyadı kısaltılarak gizlilik korunur: "Ayşe Y."
    authorName: maskName(review.user.name),
    isVerifiedBuyer: buyerIds.has(review.user.id),
  }));
}

/** "Ayşe Yılmaz" → "Ayşe Y." */
function maskName(name: string | null): string {
  if (!name) return "Kütüklü Müşterisi";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!;
  return `${parts[0]} ${parts[parts.length - 1]![0]!.toUpperCase()}.`;
}

/** Ürünün birincil görselini döner. */
export function primaryImageUrl(images: { url: string; isPrimary: boolean }[]): string {
  const primary = images.find((image) => image.isPrimary) ?? images[0];
  return primary?.url ?? FALLBACK_PRODUCT_IMAGE;
}

export type DisplayPricing = {
  price: number;
  comparePrice: number | null;
  stock: number;
  /** true ise fiyat "X TL'den başlayan" olarak gösterilmelidir (VARIABLE ürün). */
  isRange: boolean;
};

/**
 * Listeleme kartlarında gösterilecek fiyat/stok bilgisini hesaplar.
 *
 * VARIABLE ürünlerde Product satırının `price`/`stock` alanları her zaman
 * 0'dır — gerçek değerler ProductVariant satırlarındadır. Bu fonksiyon
 * olmadan varyasyonlu ürünler listelerde "0,00 TL" ve "Tükendi" olarak
 * görünürdü.
 */
export function resolveDisplayPricing(product: {
  type: "SIMPLE" | "VARIABLE";
  price: unknown;
  comparePrice: unknown;
  stock: number;
  variants: { price: unknown; stock: number }[];
}): DisplayPricing {
  if (product.type !== "VARIABLE") {
    return {
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      stock: product.stock,
      isRange: false,
    };
  }

  const { minPrice, totalStock } = getVariantPriceRange(
    product.variants.map((v) => ({ price: Number(v.price), stock: v.stock }))
  );

  return { price: minPrice, comparePrice: null, stock: totalStock, isRange: true };
}
