"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { lookupGuestOrder } from "@/app/actions/auth";

/** Üye olmayan müşteriler için sipariş sorgulama. */
export function OrderLookupForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await lookupGuestOrder({ orderNumber, email });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    window.location.href = `/siparis/${result.orderNumber}?token=${encodeURIComponent(
      result.accessToken
    )}`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "32px",
        maxWidth: "460px",
        margin: "0 auto",
      }}
    >
      {error && (
        <div
          style={{
            background: "#FEE2E2",
            color: "#B91C1C",
            padding: "12px 14px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            lineHeight: 1.5,
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "2px" }} /> {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "var(--color-gray-700)",
              display: "block",
              marginBottom: "6px",
            }}
            htmlFor="lookup-order"
          >
            Sipariş Numarası
          </label>
          <input
            id="lookup-order"
            required
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
            placeholder="KTK-260728-XXXXX"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "var(--color-gray-700)",
              display: "block",
              marginBottom: "6px",
            }}
            htmlFor="lookup-email"
          >
            Sipariş E-postası
          </label>
          <input
            id="lookup-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ornek@mail.com"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontFamily: "inherit",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "6px",
            background: "var(--color-green)",
            color: "white",
            border: "none",
            padding: "14px",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {loading ? <Loader2 size={17} className="spin" /> : <Search size={17} />}
          {loading ? "Sorgulanıyor…" : "Siparişimi Sorgula"}
        </button>
      </div>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}
