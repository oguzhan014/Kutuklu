import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRatings, primaryImageUrl, resolveDisplayPricing } from "@/lib/products";
import { InteractiveProductCard, FeaturedProductData } from "./InteractiveProductCard";

/**
 * Öne çıkan ürünler — veriler veritabanından gelir ve zengin interaktif kartlarla sunulur.
 */
export async function FeaturedProductsSection() {
  const featuredRows = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 4,
    orderBy: { createdAt: "asc" },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      variants: { select: { price: true, stock: true } },
    },
  });

  // Hiçbir ürün "öne çıkan" işaretli değilse en yeni ürünleri göster.
  const source =
    featuredRows.length > 0
      ? featuredRows
      : await prisma.product.findMany({
          where: { isActive: true },
          take: 4,
          orderBy: { createdAt: "desc" },
          include: {
            images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
            variants: { select: { price: true, stock: true } },
          },
        });

  if (source.length === 0) return null;

  const ratings = await getRatings(source.map((product) => product.id));

  const featured: FeaturedProductData[] = source.map((product) => {
    const rating = ratings.get(product.id) ?? { average: 0, count: 0 };

    const badge =
      product.harvestType === "ORGANIC"
        ? "Organik"
        : product.harvestType === "GOURMET"
          ? "Limited Edition"
          : product.isFeatured
            ? "En Çok Satan"
            : null;

    const badgeColor =
      badge === "Organik"
        ? "var(--color-green)"
        : badge === "Limited Edition"
          ? "var(--color-black)"
          : "var(--color-gold)";

    const pricing = resolveDisplayPricing(product);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDesc: product.shortDesc || (product.volume ? `${product.volume} ml Cam Şişe` : "Ege'nin Saf Zeytinyağı"),
      price: pricing.price,
      comparePrice: pricing.comparePrice,
      priceIsRange: pricing.isRange,
      imageUrl: primaryImageUrl(product.images),
      badge,
      badgeColor: badge ? badgeColor : null,
      rating: rating.average,
      reviewCount: rating.count,
      stock: pricing.stock,
      harvestType: product.harvestType,
      volume: product.volume,
    };
  });

  return (
    <section
      style={{
        background: "linear-gradient(180deg, var(--color-white) 0%, var(--color-gray-100) 100%)",
        padding: "90px 0",
        position: "relative",
      }}
      aria-label="Öne çıkan ürünler"
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "48px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Sparkles size={14} color="var(--color-gold)" />
              <span className="section-tag" style={{ textAlign: "left", marginBottom: 0 }}>
                Koleksiyonumuz
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 3vw, 2.8rem)",
                fontWeight: 500,
                color: "var(--color-black)",
              }}
            >
              Öne Çıkan Ürünler
            </h2>
          </div>

          <Link
            href="/urunler"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--color-green)",
              textDecoration: "none",
              letterSpacing: "0.05em",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(47, 79, 47, 0.2)",
              background: "var(--color-white)",
              transition: "all 0.2s ease",
            }}
            className="btn-outline-hover"
          >
            Tüm Koleksiyonu Gör <ArrowRight size={15} />
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "28px",
          }}
        >
          {featured.map((product) => (
            <div key={product.id} style={{ height: "100%" }}>
              <InteractiveProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

