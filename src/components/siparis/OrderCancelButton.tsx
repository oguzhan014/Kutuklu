"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { XCircle, Loader2, AlertCircle } from "lucide-react";
import { cancelMyOrder } from "@/app/actions/order";

export function OrderCancelButton({
  orderNumber,
  token,
}: {
  orderNumber: string;
  token?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const handleCancel = () => {
    setError("");
    startTransition(async () => {
      const result = await cancelMyOrder(orderNumber, token);
      if (!result.ok) {
        setError(result.error);
        setConfirming(false);
        return;
      }
      router.refresh();
    });
  };

  if (confirming) {
    return (
      <div
        style={{
          background: "#FEF3C7",
          border: "1px solid #FCD34D",
          borderRadius: "10px",
          padding: "16px 18px",
          marginBottom: "24px",
        }}
      >
        <p style={{ fontSize: "0.88rem", color: "#92400E", marginBottom: "14px", lineHeight: 1.6 }}>
          Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={pending}
            style={{
              background: "#DC2626",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: pending ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            {pending && <Loader2 size={14} className="spin" />}
            {pending ? "İptal ediliyor…" : "Evet, İptal Et"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            style={{
              background: "white",
              border: "1px solid var(--color-border)",
              color: "var(--color-gray-700)",
              padding: "10px 20px",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Vazgeç
          </button>
        </div>

        <style>{`
          .spin { animation: kutuklu-spin 1s linear infinite; }
          @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        style={{
          background: "white",
          border: "1px solid #FCA5A5",
          color: "#DC2626",
          padding: "11px 20px",
          borderRadius: "6px",
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <XCircle size={16} /> Siparişi İptal Et
      </button>

      {error && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "0.82rem",
            color: "#B91C1C",
            display: "flex",
            alignItems: "flex-start",
            gap: "6px",
            lineHeight: 1.5,
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} /> {error}
        </div>
      )}
    </div>
  );
}
