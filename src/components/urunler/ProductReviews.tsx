"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, BadgeCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { submitReview } from "@/app/actions/review";

export type PublicReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  authorName: string;
  isVerifiedBuyer: boolean;
};

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          color="var(--color-gold)"
          fill={index < Math.round(rating) ? "var(--color-gold)" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function ProductReviews({
  productId,
  reviews,
  average,
  count,
  isLoggedIn,
  existingReview,
}: {
  productId: string;
  reviews: PublicReview[];
  average: number;
  count: number;
  isLoggedIn: boolean;
  existingReview: { rating: number; title: string | null; body: string | null } | null;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.4rem",
            fontWeight: 600,
            color: "var(--color-black)",
            margin: 0,
          }}
        >
          Değerlendirmeler
        </h3>

        {count > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <StarRow rating={average} size={16} />
            <span style={{ fontWeight: 700, color: "var(--color-black)" }}>
              {average.toFixed(1)}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
              ({count} değerlendirme)
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div
          style={{
            background: "var(--color-gray-100)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "32px 24px",
            textAlign: "center",
            color: "var(--color-gray-600)",
            marginBottom: "32px",
          }}
        >
          Bu ürün için henüz değerlendirme yapılmamış. İlk yorumu siz yazın!
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "var(--color-gray-100)",
                borderRadius: "var(--radius-md)",
                padding: "20px",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "8px",
                }}
              >
                <StarRow rating={review.rating} size={13} />
                <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)" }}>
                  {new Date(review.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {review.title && (
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--color-black)",
                    fontSize: "0.92rem",
                    marginBottom: "6px",
                  }}
                >
                  {review.title}
                </div>
              )}

              {review.body && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-gray-600)",
                    lineHeight: 1.6,
                    marginBottom: "12px",
                  }}
                >
                  {review.body}
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-black)" }}>
                  {review.authorName}
                </span>
                {review.isVerifiedBuyer && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "var(--color-green)",
                      background: "rgba(47,79,47,0.08)",
                      padding: "2px 7px",
                      borderRadius: "100px",
                    }}
                  >
                    <BadgeCheck size={11} /> Doğrulanmış Alıcı
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <ReviewForm productId={productId} existingReview={existingReview} />
      ) : (
        <div
          style={{
            background: "var(--color-cream)",
            border: "1px solid var(--color-gold)",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
            fontSize: "0.9rem",
            color: "var(--color-gray-700)",
          }}
        >
          Değerlendirme yazabilmek için{" "}
          <Link href="/giris" style={{ color: "var(--color-green)", fontWeight: 700 }}>
            giriş yapın
          </Link>{" "}
          veya{" "}
          <Link href="/kayit" style={{ color: "var(--color-green)", fontWeight: 700 }}>
            üye olun
          </Link>
          .
        </div>
      )}
    </div>
  );
}

function ReviewForm({
  productId,
  existingReview,
}: {
  productId: string;
  existingReview: { rating: number; title: string | null; body: string | null } | null;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", error: false });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ text: "", error: false });
    setFieldErrors({});

    const result = await submitReview({ productId, rating, title, body });

    setSubmitting(false);

    if (!result.ok) {
      setFeedback({ text: result.error, error: true });
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }

    setFeedback({ text: result.message, error: false });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid var(--color-border)",
    borderRadius: "6px",
    fontSize: "0.92rem",
    fontFamily: "inherit",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "24px",
      }}
    >
      <h4
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.15rem",
          fontWeight: 600,
          color: "var(--color-black)",
          marginBottom: "16px",
        }}
      >
        {existingReview ? "Değerlendirmenizi Güncelleyin" : "Değerlendirme Yazın"}
      </h4>

      {feedback.text && (
        <div
          style={{
            background: feedback.error ? "#FEE2E2" : "#D1FAE5",
            color: feedback.error ? "#B91C1C" : "#047857",
            padding: "11px 14px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {feedback.error ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />} {feedback.text}
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--color-gray-600)",
            marginBottom: "8px",
          }}
        >
          Puanınız *
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${value} yıldız`}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
              }}
            >
              <Star
                size={26}
                color="var(--color-gold)"
                fill={value <= (hoverRating || rating) ? "var(--color-gold)" : "none"}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
        {fieldErrors.rating && (
          <span style={{ fontSize: "0.74rem", color: "#DC2626", display: "block", marginTop: "5px" }}>
            {fieldErrors.rating}
          </span>
        )}
      </div>

      <div style={{ marginBottom: "14px" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--color-gray-600)",
            marginBottom: "6px",
          }}
        >
          Başlık
        </label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder="Örn: Harika bir zeytinyağı"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: "18px" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--color-gray-600)",
            marginBottom: "6px",
          }}
        >
          Yorumunuz *
        </label>
        <textarea
          rows={4}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={2000}
          placeholder="Ürün hakkındaki düşüncelerinizi paylaşın…"
          style={{ ...inputStyle, resize: "vertical" }}
        />
        {fieldErrors.body && (
          <span style={{ fontSize: "0.74rem", color: "#DC2626", display: "block", marginTop: "5px" }}>
            {fieldErrors.body}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          background: "var(--color-green)",
          color: "white",
          border: "none",
          padding: "12px 26px",
          borderRadius: "6px",
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: submitting ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {submitting && <Loader2 size={15} className="spin" />}
        {submitting ? "Gönderiliyor…" : existingReview ? "Güncelle" : "Değerlendirmeyi Gönder"}
      </button>

      <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginTop: "12px", lineHeight: 1.5 }}>
        Yorumunuz yönetici onayından sonra yayınlanır.
      </p>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}
