import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getRatings, primaryImageUrl, resolveDisplayPricing } from "@/lib/products";

/**
 * Öne çıkan ürünler — veriler veritabanından gelir.
 *
 * Önceki sürümde bu bölüm sabit bir dizi kullanıyordu: fiyatlar gerçek
 * ürünlerle uyuşmuyor ve linkler var olmayan sayfalara gidiyordu.
 */

type FeaturedProduct = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  price: number;
  comparePrice: number | null;
  priceIsRange: boolean;
  imageUrl: string;
  badge: string | null;
  badgeColor: string | null;
  rating: number;
  reviewCount: number;
  stock: number;
};

function ProductCard({ product }: { product: FeaturedProduct }) {
  return (
    <div
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      className="product-card"
    >
      {/* Ürün görseli */}
      <div
        style={{
          position: "relative",
          background:
            "linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {product.badge && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 2,
              background: product.badgeColor ?? "var(--color-gold)",
              color:
                !product.badgeColor || product.badgeColor === "var(--color-gold)"
                  ? "var(--color-black)"
                  : "var(--color-cream)",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "4px",
            }}
          >
            {product.badge}
          </div>
        )}

        {product.stock <= 0 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 2,
              background: "#DC2626",
              color: "white",
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "4px 9px",
              borderRadius: "4px",
            }}
          >
            TÜKENDİ
          </div>
        )}

        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            style={{ objectFit: "contain", padding: "24px" }}
          />
        </div>
      </div>

      {/* Bilgi */}
      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "8px",
            minHeight: "18px",
          }}
        >
          {product.reviewCount > 0 ? (
            <>
              <div style={{ display: "flex", gap: "2px" }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={12}
                    color="var(--color-gold)"
                    fill={index < Math.round(product.rating) ? "var(--color-gold)" : "none"}
                  />
                ))}
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>
                ({product.reviewCount})
              </span>
            </>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)" }}>
              Yeni ürün
            </span>
          )}
        </div>

        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "var(--color-black)",
            marginBottom: "4px",
          }}
        >
          {product.name}
        </h3>

        <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginBottom: "16px" }}>
          {product.shortDesc}
        </p>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {product.priceIsRange && (
              <span style={{ fontSize: "0.66rem", color: "var(--color-gray-500)" }}>
                Başlayan fiyatlarla
              </span>
            )}
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "var(--color-black)",
              }}
            >
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-gray-400)",
                  textDecoration: "line-through",
                }}
              >
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          </div>

          <span
            style={{
              background: "var(--color-green)",
              color: "var(--color-cream)",
              borderRadius: "var(--radius-sm)",
              padding: "9px 15px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.03em",
            }}
          >
            İncele <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

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

  const featured: FeaturedProduct[] = source.map((product) => {
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
      shortDesc: product.shortDesc || (product.volume ? `${product.volume} ml` : ""),
      price: pricing.price,
      comparePrice: pricing.comparePrice,
      priceIsRange: pricing.isRange,
      imageUrl: primaryImageUrl(product.images),
      badge,
      badgeColor: badge ? badgeColor : null,
      rating: rating.average,
      reviewCount: rating.count,
      stock: pricing.stock,
    };
  });

  return (
    <section
      style={{ background: "var(--color-gray-100)", padding: "80px 0" }}
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
            <span className="section-tag" style={{ textAlign: "left" }}>
              Koleksiyonumuz
            </span>
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
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--color-green)",
              textDecoration: "none",
              letterSpacing: "0.05em",
            }}
          >
            Tümünü Gör <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/urunler/${product.slug}`}
              style={{ textDecoration: "none" }}
            >
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
