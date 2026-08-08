import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

/**
 * Site haritası.
 *
 * Ürün, kategori ve blog sayfaları veritabanından üretilir; yeni ürün
 * eklendiğinde harita kendiliğinden güncellenir.
 *
 * Kişiye özel sayfalar (sepet, ödeme, hesabım, sipariş takibi) BİLEREK
 * dışarıda bırakılmıştır — arama motorunda indekslenmemeleri gerekir.
 */

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Herkese açık, sabit sayfalar.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/urunler`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/hikayemiz`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/iletisim`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/sikca-sorulan-sorular`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/kargo-ve-teslimat`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/iade-degisim`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/kullanim-kosullari`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/gizlilik-politikasi`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [products, categories, posts] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: `${SITE_URL}/urunler/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...categories.map((category) => ({
        url: `${SITE_URL}/urunler?kategori=${encodeURIComponent(category.slug)}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch (error) {
    // Veritabanına ulaşılamazsa site haritası boş dönmemeli; en azından
    // sabit sayfalar taranabilsin.
    console.error("[sitemap] dinamik yollar alınamadı:", error);
    return staticRoutes;
  }
}
