"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, Trash2, Star, Loader2 } from "lucide-react";
import { setReviewApproval, deleteReview } from "@/app/actions/admin";

export type ReviewRecord = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isApproved: boolean;
  createdAt: string;
  userName: string;
  userEmail: string;
  productName: string;
  productSlug: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          size={13}
          fill={index <= rating ? "var(--color-gold)" : "none"}
          color={index <= rating ? "var(--color-gold)" : "var(--color-gray-300)"}
        />
      ))}
    </span>
  );
}

export function ReviewModeration({ reviews }: { reviews: ReviewRecord[] }) {
  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "8px" }}>
        Yorumlar
      </h1>
      <p style={{ fontSize: "0.88rem", color: "var(--color-gray-500)", marginBottom: "24px" }}>
        Yorumlar onaylanana kadar ürün sayfasında görünmez ve ürün puanına dâhil edilmez.
      </p>

      {reviews.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--color-gray-500)",
          }}
        >
          Henüz yorum bulunmuyor.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<unknown>) => {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  };

  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${review.isApproved ? "var(--color-border)" : "#FCD34D"}`,
        borderRadius: "12px",
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <Stars rating={review.rating} />
            <span
              style={{
                padding: "3px 9px",
                background: review.isApproved ? "#D1FAE5" : "#FEF3C7",
                color: review.isApproved ? "#059669" : "#D97706",
                borderRadius: "100px",
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              {review.isApproved ? "Yayında" : "Onay bekliyor"}
            </span>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--color-gray-600)" }}>
            <strong>{review.userName}</strong> ({review.userEmail}) ·{" "}
            <Link
              href={`/urunler/${review.productSlug}`}
              style={{ color: "var(--color-green)", textDecoration: "none", fontWeight: 600 }}
            >
              {review.productName}
            </Link>{" "}
            · {new Date(review.createdAt).toLocaleDateString("tr-TR")}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {review.isApproved ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setReviewApproval(review.id, false))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "var(--color-gray-100)",
                border: "none",
                color: "var(--color-gray-700)",
                padding: "7px 12px",
                borderRadius: "5px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <X size={13} /> Yayından Kaldır
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setReviewApproval(review.id, true))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "var(--color-green)",
                border: "none",
                color: "white",
                padding: "7px 12px",
                borderRadius: "5px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {pending ? <Loader2 size={13} className="spin" /> : <Check size={13} />} Onayla
            </button>
          )}

          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Yorum kalıcı olarak silinsin mi?")) return;
              run(() => deleteReview(review.id));
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "#FEE2E2",
              border: "none",
              color: "#DC2626",
              padding: "7px 12px",
              borderRadius: "5px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Trash2 size={13} /> Sil
          </button>
        </div>
      </div>

      {review.title && (
        <div style={{ fontWeight: 600, color: "var(--color-black)", marginBottom: "6px" }}>
          {review.title}
        </div>
      )}
      {review.body && (
        <p style={{ fontSize: "0.9rem", color: "var(--color-gray-700)", lineHeight: 1.7, margin: 0 }}>
          {review.body}
        </p>
      )}
    </div>
  );
}
