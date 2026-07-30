"use client";

import { useState } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { saveSettings } from "@/app/actions/admin";

/**
 * Site ayarları formu.
 * Parasal alanlar kullanıcıya TL olarak gösterilir, sunucuya KURUŞ gönderilir.
 */

type Props = { settings: Record<string, string> };

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

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  padding: "24px",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.74rem",
  color: "var(--color-gray-500)",
  display: "block",
  marginTop: "5px",
};

function kurusToLira(value: string): string {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? (parsed / 100).toFixed(2) : "0.00";
}

function liraToKurus(value: string): string {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? String(Math.round(parsed * 100)) : "0";
}

export function SettingsForm({ settings }: Props) {
  const [values, setValues] = useState({
    shippingCost: kurusToLira(settings["shipping.cost"] ?? "0"),
    freeThreshold: kurusToLira(settings["shipping.freeThreshold"] ?? "0"),
    maxQuantity: settings["order.maxQuantityPerItem"] ?? "20",

    storeName: settings["store.name"] ?? "",
    storeEmail: settings["store.email"] ?? "",
    storePhone: settings["store.phone"] ?? "",
    storeAddress: settings["store.address"] ?? "",
    storeTaxOffice: settings["store.taxOffice"] ?? "",
    storeTaxNumber: settings["store.taxNumber"] ?? "",

    bankName: settings["bank.name"] ?? "",
    bankAccountHolder: settings["bank.accountHolder"] ?? "",
    bankIban: settings["bank.iban"] ?? "",

    cardEnabled: settings["payment.cardEnabled"] === "true",
    transferEnabled: settings["payment.transferEnabled"] === "true",
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", error: false });

  const update = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback({ text: "", error: false });

    const result = await saveSettings({
      "shipping.cost": liraToKurus(values.shippingCost),
      "shipping.freeThreshold": liraToKurus(values.freeThreshold),
      "order.maxQuantityPerItem": String(Number.parseInt(values.maxQuantity, 10) || 20),

      "store.name": values.storeName,
      "store.email": values.storeEmail,
      "store.phone": values.storePhone,
      "store.address": values.storeAddress,
      "store.taxOffice": values.storeTaxOffice,
      "store.taxNumber": values.storeTaxNumber,

      "bank.name": values.bankName,
      "bank.accountHolder": values.bankAccountHolder,
      "bank.iban": values.bankIban,

      "payment.cardEnabled": String(values.cardEnabled),
      "payment.transferEnabled": String(values.transferEnabled),
    });

    setSaving(false);
    setFeedback({
      text: result.ok ? result.message ?? "Ayarlar kaydedildi." : result.error,
      error: !result.ok,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "820px" }}>
      {feedback.text && (
        <div
          style={{
            background: feedback.error ? "#FEE2E2" : "#D1FAE5",
            color: feedback.error ? "#B91C1C" : "#047857",
            padding: "13px 16px",
            borderRadius: "8px",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {feedback.error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />} {feedback.text}
        </div>
      )}

      {/* Kargo & sipariş */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "18px" }}>
          Kargo &amp; Sipariş
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Kargo Ücreti (₺)</label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={values.shippingCost}
              onChange={(event) => update("shippingCost", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Ücretsiz Kargo Alt Sınırı (₺)</label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={values.freeThreshold}
              onChange={(event) => update("freeThreshold", event.target.value)}
              style={inputStyle}
            />
            <span style={hintStyle}>İndirim sonrası tutar bu değere ulaşırsa kargo bedava.</span>
          </div>
          <div>
            <label style={labelStyle}>Ürün Başına Maks. Adet</label>
            <input
              type="number"
              min={1}
              value={values.maxQuantity}
              onChange={(event) => update("maxQuantity", event.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Ödeme yöntemleri */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "18px" }}>
          Ödeme Yöntemleri
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={values.cardEnabled}
              onChange={(event) => update("cardEnabled", event.target.checked)}
              style={{ width: 18, height: 18, accentColor: "var(--color-green)" }}
            />
            <span style={{ fontWeight: 500 }}>Kredi / Banka Kartı (Stripe)</span>
          </label>
          <span style={{ ...hintStyle, marginTop: 0, marginLeft: "28px" }}>
            Etkin olması için .env dosyasında geçerli Stripe anahtarları tanımlı olmalıdır.
          </span>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={values.transferEnabled}
              onChange={(event) => update("transferEnabled", event.target.checked)}
              style={{ width: 18, height: 18, accentColor: "var(--color-green)" }}
            />
            <span style={{ fontWeight: 500 }}>Havale / EFT</span>
          </label>
        </div>
      </div>

      {/* Banka bilgileri */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "18px" }}>
          Banka Bilgileri (Havale/EFT)
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Banka Adı</label>
            <input
              value={values.bankName}
              onChange={(event) => update("bankName", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hesap Sahibi</label>
            <input
              value={values.bankAccountHolder}
              onChange={(event) => update("bankAccountHolder", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>IBAN</label>
            <input
              value={values.bankIban}
              onChange={(event) => update("bankIban", event.target.value)}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Firma bilgileri */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "8px" }}>
          Firma Bilgileri
        </h2>
        <p style={{ fontSize: "0.82rem", color: "var(--color-gray-500)", marginBottom: "18px", lineHeight: 1.6 }}>
          Bu bilgiler mesafeli satış sözleşmesi ve ön bilgilendirme formunda kullanılır.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Ticari Unvan</label>
            <input
              value={values.storeName}
              onChange={(event) => update("storeName", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>E-posta</label>
            <input
              type="email"
              value={values.storeEmail}
              onChange={(event) => update("storeEmail", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Telefon</label>
            <input
              value={values.storePhone}
              onChange={(event) => update("storePhone", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Adres</label>
            <input
              value={values.storeAddress}
              onChange={(event) => update("storeAddress", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Vergi Dairesi</label>
            <input
              value={values.storeTaxOffice}
              onChange={(event) => update("storeTaxOffice", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Vergi No</label>
            <input
              value={values.storeTaxNumber}
              onChange={(event) => update("storeTaxNumber", event.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: "var(--color-green)",
            color: "white",
            border: "none",
            padding: "13px 28px",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: saving ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {saving ? <Loader2 size={17} className="spin" /> : <Save size={17} />}
          {saving ? "Kaydediliyor…" : "Ayarları Kaydet"}
        </button>
      </div>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}
