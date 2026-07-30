"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Pencil, Star, Loader2, AlertCircle, X } from "lucide-react";
import { TURKIYE_ILLERI } from "@/lib/turkiye-iller";
import {
  saveAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/app/actions/account";

export type AddressRecord = {
  id: string;
  title: string;
  fullName: string;
  phone: string | null;
  address: string;
  city: string;
  district: string | null;
  postalCode: string | null;
  isDefault: boolean;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "0.92rem",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 500,
  color: "var(--color-gray-600)",
  display: "block",
  marginBottom: "6px",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span style={{ fontSize: "0.74rem", color: "#DC2626", display: "block", marginTop: "4px" }}>
      {message}
    </span>
  );
}

export function AddressManager({ addresses }: { addresses: AddressRecord[] }) {
  const [editing, setEditing] = useState<AddressRecord | "new" | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.8rem",
            fontWeight: 600,
            color: "var(--color-black)",
          }}
        >
          Adreslerim
        </h1>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--color-green)",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> Yeni Adres
          </button>
        )}
      </div>

      {editing !== null && (
        <AddressForm
          initial={editing === "new" ? null : editing}
          onDone={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      )}

      {addresses.length === 0 && editing === null ? (
        <div
          style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <MapPin size={44} color="var(--color-gray-400)" strokeWidth={1.5} />
          <p style={{ color: "var(--color-gray-600)", marginTop: "14px" }}>
            Henüz kayıtlı adresiniz yok.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {addresses.map((item) => (
            <div
              key={item.id}
              style={{
                background: "var(--color-white)",
                border: `1px solid ${item.isDefault ? "var(--color-green)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                position: "relative",
              }}
            >
              {item.isDefault && (
                <span
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    background: "rgba(47,79,47,0.1)",
                    color: "var(--color-green)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: "100px",
                  }}
                >
                  Varsayılan
                </span>
              )}

              <div style={{ fontWeight: 700, color: "var(--color-black)", marginBottom: "8px" }}>
                {item.title}
              </div>
              <div style={{ fontSize: "0.86rem", color: "var(--color-gray-600)", lineHeight: 1.7 }}>
                {item.fullName}
                <br />
                {item.phone}
                <br />
                {item.address}
                <br />
                {item.district} / {item.city}
                {item.postalCode ? ` · ${item.postalCode}` : ""}
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setEditing(item)}
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
                  <Pencil size={13} /> Düzenle
                </button>

                {!item.isDefault && (
                  <button
                    type="button"
                    disabled={pendingId === item.id}
                    onClick={async () => {
                      setPendingId(item.id);
                      await setDefaultAddress(item.id);
                      setPendingId(null);
                    }}
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
                    <Star size={13} /> Varsayılan Yap
                  </button>
                )}

                <button
                  type="button"
                  disabled={pendingId === item.id}
                  onClick={async () => {
                    if (!confirm(`"${item.title}" adresi silinsin mi?`)) return;
                    setPendingId(item.id);
                    await deleteAddress(item.id);
                    setPendingId(null);
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
                  {pendingId === item.id ? <Loader2 size={13} className="spin" /> : <Trash2 size={13} />} Sil
                </button>
              </div>
            </div>
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

function AddressForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: AddressRecord | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    const result = await saveAddress({
      id: initial?.id,
      title,
      fullName,
      phone,
      city,
      district,
      address,
      postalCode,
      isDefault,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }

    onDone();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-black)" }}>
          {initial ? "Adresi Düzenle" : "Yeni Adres Ekle"}
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Adres Başlığı *</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ev, İş…"
            style={inputStyle}
          />
          <FieldError message={fieldErrors.title} />
        </div>
        <div>
          <label style={labelStyle}>Ad Soyad *</label>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            style={inputStyle}
          />
          <FieldError message={fieldErrors.fullName} />
        </div>
        <div>
          <label style={labelStyle}>Telefon *</label>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="05550000000"
            style={inputStyle}
          />
          <FieldError message={fieldErrors.phone} />
        </div>
        <div>
          <label style={labelStyle}>İl *</label>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            style={{ ...inputStyle, background: "white" }}
          >
            <option value="">Seçiniz</option>
            {TURKIYE_ILLERI.map((il) => (
              <option key={il} value={il}>
                {il}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.city} />
        </div>
        <div>
          <label style={labelStyle}>İlçe *</label>
          <input
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            style={inputStyle}
          />
          <FieldError message={fieldErrors.district} />
        </div>
        <div>
          <label style={labelStyle}>Posta Kodu</label>
          <input
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 5))}
            style={inputStyle}
          />
          <FieldError message={fieldErrors.postalCode} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Açık Adres *</label>
          <textarea
            rows={3}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <FieldError message={fieldErrors.address} />
        </div>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          marginTop: "16px",
        }}
      >
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(event) => setIsDefault(event.target.checked)}
          style={{ width: 16, height: 16, accentColor: "var(--color-green)" }}
        />
        <span style={{ fontSize: "0.86rem", color: "var(--color-gray-600)" }}>
          Varsayılan teslimat adresim olsun
        </span>
      </label>

      <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: "var(--color-green)",
            color: "white",
            border: "none",
            padding: "12px 26px",
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
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            color: "var(--color-gray-700)",
            padding: "12px 26px",
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
