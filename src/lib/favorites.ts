import "server-only";
import { prisma } from "@/lib/prisma";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/pricing";

/**
 * ─────────────────────────────────────────────────────────────
 * FAVORİLER — VERİ KATMANI
 * ─────────────────────────────────────────────────────────────
 *
 * Buradaki fonksiyonlar `userId`'yi PARAMETRE olarak alır ve oturum
 * doğrulaması YAPMAZ; bu iş `app/actions/favorites.ts` içindeki server
 * action'lara aittir. Ayrım sayesinde veri kuralları oturumdan bağımsız test
 * edilebilir.
 *
 * Ürün adı/fiyatı/görseli favori satırında SAKLANMAZ, her okumada Product'tan
 * taze okunur; böylece favorilerde eski fiyat görünmez.
 */

export type FavoriteItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  priceIsRange: boolean;
  imageUrl: string;
  volume: number | null;
  addedAt: number;
};

/** Bir üyenin tutabileceği azami favori sayısı. */
export const MAX_FAVORITES = 100;

/** İstemciden gelen kimlik listesini temizler ve sınırlar. */
export function sanitizeProductIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const ids = raw
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && value.length <= 100);

  return [...new Set(ids)].slice(0, MAX_FAVORITES);
}

/**
 * Üyenin favorilerini ürün bilgileriyle birlikte okur.
 * Pasif hâle gelen ürünler listede görünmez.
 */
export async function readFavorites(userId: string): Promise<FavoriteItem[]> {
  const rows = await prisma.favorite.findMany({
    where: { userId, product: { isActive: true } },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          type: true,
          volume: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { url: true },
          },
          variants: { select: { price: true } },
        },
      },
    },
  });

  return rows.map((row) => {
    const product = row.product;

    // Varyasyonlu üründe listede en düşük fiyat gösterilir ("…'den başlayan").
    const variantPrices = product.variants.map((variant) => Number(variant.price));
    const priceIsRange = product.type === "VARIABLE" && variantPrices.length > 0;

    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: priceIsRange ? Math.min(...variantPrices) : Number(product.price),
      priceIsRange,
      imageUrl: product.images[0]?.url ?? FALLBACK_PRODUCT_IMAGE,
      volume: product.volume,
      addedAt: row.createdAt.getTime(),
    };
  });
}

/**
 * Tarayıcıdaki favorileri hesaba taşır (birleştirme).
 * Zaten favoride olanlar ve satışta olmayan ürünler sessizce atlanır.
 */
export async function mergeFavorites(userId: string, productIds: string[]): Promise<void> {
  if (productIds.length === 0) return;

  const existing = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true },
  });

  if (existing.length === 0) return;

  // Birleştirme, üst sınırı aşmamalı.
  const current = await prisma.favorite.count({ where: { userId } });
  const room = Math.max(0, MAX_FAVORITES - current);
  if (room === 0) return;

  await prisma.favorite.createMany({
    data: existing.slice(0, room).map((product) => ({ userId, productId: product.id })),
    skipDuplicates: true,
  });
}

/**
 * Favoriye ekler/çıkarır; işlemden sonraki durumu döner.
 * Tüm sorgular `userId` ile sınırlıdır — başkasının favorisi etkilenemez.
 */
export async function toggleFavoriteFor(
  userId: string,
  productId: string
): Promise<boolean> {
  const removed = await prisma.favorite.deleteMany({ where: { userId, productId } });
  if (removed.count > 0) return false;

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true },
  });
  if (!product) return false;

  const count = await prisma.favorite.count({ where: { userId } });
  if (count >= MAX_FAVORITES) return false;

  await prisma.favorite.createMany({
    data: [{ userId, productId }],
    skipDuplicates: true,
  });

  return true;
}

/** Favoriden çıkarır. */
export async function removeFavoriteFor(userId: string, productId: string): Promise<void> {
  await prisma.favorite.deleteMany({ where: { userId, productId } });
}
