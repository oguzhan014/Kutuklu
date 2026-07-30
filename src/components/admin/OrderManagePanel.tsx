"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, CheckCircle2, AlertCircle, BadgeCheck } from "lucide-react";
import {
  updateOrderStatus,
  updateOrderTracking,
  markTransferPaid,
  saveAdminNote,
} from "@/app/actions/admin";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Beklemede" },
  { value: "PROCESSING", label: "Hazırlanıyor" },
  { value: "SHIPPED", label: "Kargoda" },
  { value: "DELIVERED", label: "Teslim Edildi" },
  { value: "CANCELLED", label: "İptal Edildi" },
  { value: "REFUNDED", label: "İade Edildi" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "0.9rem",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--color-gray-600)",
  marginBottom: "6px",
};

const buttonStyle: React.CSSProperties = {
  background: "var(--color-green)",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "6px",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
};

function Feedback({ message, isError }: { message: string; isError: boolean }) {
  if (!message) return null;
  return (
    <div
      style={{
        marginTop: "10px",
        fontSize: "0.8rem",
        color: isError ? "#B91C1C" : "#047857",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {isError ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />} {message}
    </div>
  );
}

export function OrderManagePanel({
  orderId,
  currentStatus,
  paymentMethod,
  paymentStatus,
  shippingCarrier,
  trackingNumber,
  adminNote,
}: {
  orderId: string;
  currentStatus: string;
  paymentMethod: string | null;
  paymentStatus: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  adminNote: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [status, setStatus] = useState(currentStatus);
  const [carrier, setCarrier] = useState(shippingCarrier ?? "");
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [note, setNote] = useState(adminNote ?? "");

  const [statusMsg, setStatusMsg] = useState({ text: "", error: false });
  const [trackingMsg, setTrackingMsg] = useState({ text: "", error: false });
  const [noteMsg, setNoteMsg] = useState({ text: "", error: false });
  const [payMsg, setPayMsg] = useState({ text: "", error: false });

  const run = (
    action: () => Promise<{ ok: boolean; error?: string; message?: string }>,
    setMsg: (value: { text: string; error: boolean }) => void
  ) => {
    startTransition(async () => {
      const result = await action();
      setMsg({
        text: result.ok ? result.message ?? "Kaydedildi." : result.error ?? "Hata oluştu.",
        error: !result.ok,
      });
      if (result.ok) router.refresh();
    });
  };

  const canConfirmTransfer = paymentMethod === "transfer" && paymentStatus === "UNPAID";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Ödeme onayı (yalnızca havale) */}
      {canConfirmTransfer && (
        <div
          style={{
            background: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: "10px",
            padding: "18px",
          }}
        >
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#92400E", marginBottom: "8px" }}>
            Havale Ödemesi Bekliyor
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#92400E", lineHeight: 1.6, marginBottom: "14px" }}>
            Banka hesabınıza ödemenin geçtiğini doğruladıktan sonra onaylayın.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => markTransferPaid(orderId), setPayMsg)}
            style={{ ...buttonStyle, background: "#B45309" }}
          >
            {pending ? <Loader2 size={15} className="spin" /> : <BadgeCheck size={15} />}
            Ödemeyi Onayla
          </button>
          <Feedback message={payMsg.text} isError={payMsg.error} />
        </div>
      )}

      {paymentMethod === "card" && (
        <div
          style={{
            background: "var(--color-gray-100)",
            border: "1px solid var(--color-border)",
            borderRadius: "10px",
            padding: "14px 16px",
            fontSize: "0.8rem",
            color: "var(--color-gray-600)",
            lineHeight: 1.6,
          }}
        >
          Kart ödemelerinin durumu Stripe tarafından doğrulanır ve panelden elle
          değiştirilemez.
        </div>
      )}

      {/* Durum */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--color-border)",
          borderRadius: "10px",
          padding: "18px",
        }}
      >
        <label style={labelStyle}>Sipariş Durumu</label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          style={{ ...inputStyle, marginBottom: "12px" }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending || status === currentStatus}
          onClick={() => run(() => updateOrderStatus({ orderId, status }), setStatusMsg)}
          style={{
            ...buttonStyle,
            opacity: status === currentStatus ? 0.5 : 1,
            cursor: status === currentStatus ? "not-allowed" : "pointer",
          }}
        >
          {pending ? <Loader2 size={15} className="spin" /> : <Save size={15} />} Durumu Güncelle
        </button>
        <Feedback message={statusMsg.text} isError={statusMsg.error} />

        <p
          style={{
            marginTop: "12px",
            fontSize: "0.75rem",
            color: "var(--color-gray-500)",
            lineHeight: 1.5,
          }}
        >
          İptal ve iade işlemlerinde ürün stokları otomatik olarak geri eklenir.
        </p>
      </div>

      {/* Kargo */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--color-border)",
          borderRadius: "10px",
          padding: "18px",
        }}
      >
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "14px" }}>
          Kargo Bilgileri
        </h3>

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Kargo Firması</label>
          <input
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            placeholder="Örn: Yurtiçi Kargo"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Takip Numarası</label>
          <input
            value={tracking}
            onChange={(event) => setTracking(event.target.value)}
            placeholder="Örn: 1234567890"
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              () =>
                updateOrderTracking({
                  orderId,
                  shippingCarrier: carrier,
                  trackingNumber: tracking,
                }),
              setTrackingMsg
            )
          }
          style={buttonStyle}
        >
          {pending ? <Loader2 size={15} className="spin" /> : <Save size={15} />} Kargo Bilgilerini
          Kaydet
        </button>
        <Feedback message={trackingMsg.text} isError={trackingMsg.error} />
      </div>

      {/* Yönetici notu */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--color-border)",
          borderRadius: "10px",
          padding: "18px",
        }}
      >
        <label style={labelStyle}>Yönetici Notu (müşteriye gösterilmez)</label>
        <textarea
          rows={4}
          value={note}
          maxLength={2000}
          onChange={(event) => setNote(event.target.value)}
          style={{ ...inputStyle, resize: "vertical", marginBottom: "12px" }}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => saveAdminNote(orderId, note), setNoteMsg)}
          style={buttonStyle}
        >
          {pending ? <Loader2 size={15} className="spin" /> : <Save size={15} />} Notu Kaydet
        </button>
        <Feedback message={noteMsg.text} isError={noteMsg.error} />
      </div>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
