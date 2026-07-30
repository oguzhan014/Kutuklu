import Link from "next/link";
import { Star, Quote } from "lucide-react";
import { prisma } from "@/lib/prisma";

/**
 * Müşteri yorumları — yalnızca yönetici tarafından ONAYLANMIŞ gerçek yorumlar.
 * Onaylı yorum yoksa bölüm hiç gösterilmez (uydurma yorum yayınlanmaz).
 */

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={14}
          color="var(--color-gold)"
          fill={index < rating ? "var(--color-gold)" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/** "Ayşe Yılmaz" → "Ayşe Y." */
function maskName(name: string | null): string {
  if (!name) return "Kütüklü Müşterisi";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!;
  return `${parts[0]} ${parts[parts.length - 1]![0]!.toUpperCase()}.`;
}

export async function ReviewsSection() {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true, rating: { gte: 4 } },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      user: { select: { name: true } },
      product: { select: { name: true, slug: true } },
    },
  });

  if (reviews.length === 0) return null;

  return (
    <section
      style={{ background: "var(--color-cream)", padding: "80px 0" }}
      aria-label="Müşteri yorumları"
    >
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Yorumlar</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3vw, 2.8rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "16px",
            }}
          >
            Müşterilerimiz Ne Diyor?
          </h2>
          <span className="gold-divider" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {reviews.map((review) => {
            const authorName = maskName(review.user.name);

            return (
              <div
                key={review.id}
                style={{
                  background: "var(--color-white)",
                  borderRadius: "var(--radius-lg)",
                  padding: "32px",
                  border: "1px solid var(--color-border)",
                  position: "relative",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                }}
                className="review-card"
              >
                <Quote
                  size={32}
                  color="var(--color-gold)"
                  style={{ opacity: 0.3, marginBottom: "16px" }}
                />

                <StarRating rating={review.rating} />

                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--color-gray-600)",
                    lineHeight: 1.7,
                    margin: "16px 0 24px",
                    fontStyle: "italic",
                    flex: 1,
                  }}
                >
                  &ldquo;{review.body}&rdquo;
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "var(--color-green)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-gold)",
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {authorName.charAt(0)}
                  </div>
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "var(--color-black)",
                      }}
                    >
                      {authorName}
                    </span>
                    <Link
                      href={`/urunler/${review.product.slug}`}
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-gray-500)",
                        textDecoration: "none",
                      }}
                    >
                      {review.product.name}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
