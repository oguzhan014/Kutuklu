"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { saveCoupon, deleteCoupon } from "@/app/actions/admin";
import { formatPrice } from "@/lib/utils";

export type CouponRecord = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minOrderAmount: string | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "0.92rem",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--color-gray-600)",
  marginBottom: "6px",
};

const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontWeight: 600,
  color: "var(--color-gray-600)",
  borderBottom: "1px solid var(--color-border)",
  fontSize: "0.85rem",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span style={{ fontSize: "0.74rem", color: "#DC2626", display: "block", marginTop: "4px" }}>
      {message}
    </span>
  );
}

export function CouponManager({ coupons }: { coupons: CouponRecord[] }) {
  const [editing, setEditing] = useState<CouponRecord | "new" | null>(null);
  const [feedback, setFeedback] = useState({ text: "", error: false });
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", margin: 0 }}>
          Kuponlar
        </h1>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            style={{
              background: "var(--color-green)",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 500,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <Plus size={18} /> Yeni Kupon
          </button>
        )}
      </div>

      {feedback.text && (
        <div
          style={{
            background: feedback.error ? "#FEE2E2" : "#D1FAE5",
            color: feedback.error ? "#B91C1C" : "#047857",
            padding: "13px 16px",
            borderRadius: "8px",
            fontSize: "0.88rem",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {feedback.error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />} {feedback.text}
        </div>
      )}

      {editing !== null && (
        <CouponForm
          initial={editing === "new" ? null : editing}
          onDone={(message) => {
            setFeedback({ text: message, error: false });
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid var(--color-border)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.9rem",
            minWidth: "760px",
          }}
        >
          <thead style={{ background: "var(--color-gray-100)" }}>
            <tr>
              <th style={thStyle}>Kod</th>
              <th style={thStyle}>İndirim</th>
              <th style={thStyle}>Min. Sepet</th>
              <th style={thStyle}>Kullanım</th>
              <th style={thStyle}>Son Tarih</th>
              <th style={thStyle}>Durum</th>
              <th style={{ ...thStyle, textAlign: "right" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--color-gray-500)" }}>
                  Henüz kupon tanımlanmamış.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 700, color: "var(--color-black)" }}>{coupon.code}</div>
                    {coupon.description && (
                      <div style={{ fontSize: "0.78rem", color: "var(--color-gray-500)" }}>
                        {coupon.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                    {coupon.type === "PERCENTAGE"
                      ? `%${Number(coupon.value)}`
                      : formatPrice(Number(coupon.value))}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-gray-600)" }}>
                    {coupon.minOrderAmount ? formatPrice(Number(coupon.minOrderAmount)) : "—"}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-gray-600)" }}>
                    {coupon.usedCount}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-gray-600)" }}>
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString("tr-TR")
                      : "Süresiz"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "4px 9px",
                        background: coupon.isActive ? "#D1FAE5" : "#FEE2E2",
                        color: coupon.isActive ? "#059669" : "#DC2626",
                        borderRadius: "4px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                      }}
                    >
                      {coupon.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => setEditing(coupon)}
                        style={{
                          padding: "6px",
                          background: "var(--color-gray-100)",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "var(--color-gray-600)",
                          display: "inline-flex",
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <CouponDeleteButton
                        couponId={coupon.id}
                        code={coupon.code}
                        pendingId={pendingId}
                        setPendingId={setPendingId}
                        onDone={(message, error) => {
                          setFeedback({ text: message, error });
                          router.refresh();
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function CouponDeleteButton({
  couponId,
  code,
  pendingId,
  setPendingId,
  onDone,
}: {
  couponId: string;
  code: string;
  pendingId: string | null;
  setPendingId: (value: string | null) => void;
  onDone: (message: string, error: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || pendingId === couponId}
      onClick={() => {
        if (!confirm(`"${code}" kuponu silinsin mi?`)) return;
        setPendingId(couponId);
        startTransition(async () => {
          const result = await deleteCoupon(couponId);
          onDone(result.ok ? result.message ?? "Silindi." : result.error, !result.ok);
          setPendingId(null);
        });
      }}
      style={{
        padding: "6px",
        background: "#EF4444",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        color: "white",
        display: "inline-flex",
      }}
    >
      {pending ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
    </button>
  );
}

function CouponForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: CouponRecord | null;
  onDone: (message: string) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">(initial?.type ?? "PERCENTAGE");
  const [value, setValue] = useState(initial ? String(Number(initial.value)) : "");
  const [minOrderAmount, setMinOrderAmount] = useState(
    initial?.minOrderAmount ? String(Number(initial.minOrderAmount)) : ""
  );
  const [maxUses, setMaxUses] = useState(initial?.maxUses ? String(initial.maxUses) : "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [expiresAt, setExpiresAt] = useState(
    initial?.expiresAt ? new Date(initial.expiresAt).toISOString().slice(0, 10) : ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    const result = await saveCoupon({
      id: initial?.id,
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxUses,
      isActive,
      expiresAt,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }

    onDone(result.message ?? "Kupon kaydedildi.");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "white",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600 }}>
          {initial ? "Kuponu Düzenle" : "Yeni Kupon"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-gray-500)" }}
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#FEE2E2",
            color: "#B91C1C",
            padding: "11px 14px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            marginBottom: "18px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Kupon Kodu *</label>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="HOSGELDIN10"
            style={inputStyle}
          />
          <FieldError message={fieldErrors.code} />
        </div>

        <div>
          <label style={labelStyle}>İndirim Tipi *</label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as "PERCENTAGE" | "FIXED")}
            style={inputStyle}
          >
            <option value="PERCENTAGE">Yüzde (%)</option>
            <option value="FIXED">Sabit Tutar (₺)</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>{type === "PERCENTAGE" ? "Yüzde (%)" : "Tutar (₺)"} *</label>
          <input
            type="number"
            step="0.01"
            min={0}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            style={inputStyle}
          />
          <FieldError message={fieldErrors.value} />
        </div>

        <div>
          <label style={labelStyle}>Min. Sepet Tutarı (₺)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            value={minOrderAmount}
            onChange={(event) => setMinOrderAmount(event.target.value)}
            placeholder="Sınırsız"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Maks. Kullanım</label>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(event) => setMaxUses(event.target.value)}
            placeholder="Sınırsız"
            style={inputStyle}
          />
          <FieldError message={fieldErrors.maxUses} />
        </div>

        <div>
          <label style={labelStyle}>Son Kullanma Tarihi</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            style={inputStyle}
          />
          <FieldError message={fieldErrors.expiresAt} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Açıklama</label>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Panelde görünür, müşteriye gösterilmez"
            style={inputStyle}
          />
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginTop: "16px" }}>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          style={{ width: 17, height: 17, accentColor: "var(--color-green)" }}
        />
        <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>Kupon aktif</span>
      </label>

      <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: "var(--color-green)",
            color: "white",
            border: "none",
            padding: "11px 24px",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {saving && <Loader2 size={15} className="spin" />}
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            color: "var(--color-gray-700)",
            padding: "11px 24px",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}
