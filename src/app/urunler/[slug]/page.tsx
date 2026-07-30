import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UrunDetayContent } from "@/components/urunler/UrunDetayContent";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  getApprovedReviews,
  getRatings,
  getVolumeOptions,
  primaryImageUrl,
  resolveDisplayPricing,
} from "@/lib/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, shortDesc: true, isActive: true },
  });

  if (!product || !product.isActive) {
    return { title: "Ürün Bulunamadı" };
  }

  return {
    title: product.name,
    description: product.shortDesc ?? undefined,
  };
}

export const revalidate = 60;

const HARVEST_LABELS: Record<string, string> = {
  STANDARD: "Klasik Sızma",
  EARLY_HARVEST: "Erken Hasat",
  ORGANIC: "Organik",
  GOURMET: "Gurme / Limited",
};

export default async function UrunDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      attributes: true,
      variants: true,
    },
  });

  // Pasif ürünler müşteriye görünmez.
  if (!product || !product.isActive) notFound();

  const [similarProducts, volumeOptions, reviewItems, session] = await Promise.all([
    prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
        variants: { select: { price: true, stock: true } },
      },
    }),
    // Hacim kardeşleri yalnızca SIMPLE ürünlerde anlamlıdır (bkz. getVolumeOptions).
    product.type === "SIMPLE" ? getVolumeOptions(product) : Promise.resolve([]),
    getApprovedReviews(product.id),
    auth(),
  ]);

  const ratings = await getRatings([product.id, ...similarProducts.map((p) => p.id)]);

  // Giriş yapmış kullanıcının bu ürüne daha önce yazdığı yorum (düzenleyebilir).
  const existingReview = session?.user?.id
    ? await prisma.review.findUnique({
        where: { productId_userId: { productId: product.id, userId: session.user.id } },
        select: { rating: true, title: true, body: true },
      })
    : null;

  const mapSimilar = (item: (typeof similarProducts)[number]) => {
    const rating = ratings.get(item.id) ?? { average: 0, count: 0 };
    const pricing = resolveDisplayPricing(item);

    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      shortDesc: item.shortDesc ?? "",
      description: item.description ?? "",
      price: pricing.price,
      comparePrice: pricing.comparePrice,
      priceIsRange: pricing.isRange,
      rating: rating.average,
      reviewCount: rating.count,
      stock: pricing.stock,
      isOrganic: item.isOrganic,
      harvestType: item.harvestType,
      category: item.category?.name ?? "",
      badge: item.isFeatured ? "En Çok Satan" : null,
      volume: item.volume,
      imageUrl: primaryImageUrl(item.images),
      type: item.type,
      volumeOptions: [],
      variants: [],
      variantAttributes: [],
      specs: {
        "Üretim Yeri": "Kütüklü Köyü, Türkiye",
        "Hasat Dönemi": "Ekim – Kasım",
        "Sıkım Yöntemi": "Soğuk Sıkım (≤27°C)",
        "Hasat Tipi": HARVEST_LABELS[item.harvestType] ?? item.harvestType,
        Asitlik: "%0.3",
        "Net Miktar": item.volume ? `${item.volume}ml` : "—",
        "Raf Ömrü": "18 ay",
      },
    };
  };

  const rating = ratings.get(product.id) ?? { average: 0, count: 0 };
  const mainPricing = resolveDisplayPricing(product);

  const mainUrun = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDesc: product.shortDesc ?? "",
    description: product.description ?? "",
    price: mainPricing.price,
    comparePrice: mainPricing.comparePrice,
    priceIsRange: mainPricing.isRange,
    rating: rating.average,
    reviewCount: rating.count,
    stock: mainPricing.stock,
    isOrganic: product.isOrganic,
    harvestType: product.harvestType,
    category: product.category?.name ?? "",
    badge: product.isFeatured ? "En Çok Satan" : null,
    volume: product.volume,
    imageUrl: primaryImageUrl(product.images),
    type: product.type,
    volumeOptions,
    // Varyasyon seçici için: her varyantın gerçek fiyat/stok/özellikleri.
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: Number(variant.price),
      comparePrice: variant.comparePrice ? Number(variant.comparePrice) : null,
      stock: variant.stock,
      attributes: (variant.attributes ?? {}) as Record<string, string>,
    })),
    variantAttributes: product.attributes.map((attribute) => ({
      name: attribute.name,
      options: attribute.options,
    })),
    specs: {
      "Üretim Yeri": "Kütüklü Köyü, Türkiye",
      "Hasat Dönemi": "Ekim – Kasım",
      "Sıkım Yöntemi": "Soğuk Sıkım (≤27°C)",
      "Hasat Tipi": HARVEST_LABELS[product.harvestType] ?? product.harvestType,
      Asitlik: "%0.3",
      "Net Miktar": product.volume ? `${product.volume}ml` : "—",
      "Raf Ömrü": "18 ay",
    },
  };

  return (
    <>
      <Navbar />
      <main>
        <UrunDetayContent
          urun={mainUrun}
          benzerUrunler={similarProducts.map(mapSimilar)}
          reviews={{
            items: reviewItems,
            average: rating.average,
            count: rating.count,
            isLoggedIn: Boolean(session?.user),
            existing: existingReview,
          }}
        />
      </main>
      <Footer />
    </>
  );
}
