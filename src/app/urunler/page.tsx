import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UrunlerContent } from "@/components/urunler/UrunlerContent";
import { prisma } from "@/lib/prisma";
import { getRatings, resolveDisplayPricing } from "@/lib/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ürünlerimiz",
  description:
    "Kütüklü Zeytinyağı koleksiyonu — Erken Hasat, Organik, Klasik Sızma ve Gurme Limited ürünlerimizi keşfedin.",
};

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  // Yalnızca yayındaki ürünler listelenir.
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      variants: { select: { price: true, stock: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Puanlar gerçek, onaylanmış yorumlardan gelir (önceden sabit/rastgele değerdi).
  const ratings = await getRatings(dbProducts.map((product) => product.id));

  const urunler = dbProducts.map((product) => {
    const rating = ratings.get(product.id) ?? { average: 0, count: 0 };
    const pricing = resolveDisplayPricing(product);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDesc: product.shortDesc ?? "",
      price: pricing.price,
      comparePrice: pricing.comparePrice,
      priceIsRange: pricing.isRange,
      rating: rating.average,
      reviewCount: rating.count,
      stock: pricing.stock,
      isOrganic: product.isOrganic,
      harvestType: product.harvestType,
      category: product.category.name,
      badge: product.isFeatured ? "En Çok Satan" : null,
    };
  });

  return (
    <>
      <Navbar />
      <main>
        <UrunlerContent urunler={urunler} initialQuery={q ?? ""} />
      </main>
      <Footer />
    </>
  );
}
