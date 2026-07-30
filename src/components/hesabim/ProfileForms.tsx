"use client";

import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateProfile, changePassword } from "@/app/actions/account";

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

const cardStyle: React.CSSProperties = {
  background: "var(--color-white)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
};

const buttonStyle: React.CSSProperties = {
  background: "var(--color-green)",
  color: "white",
  border: "none",
  padding: "12px 26px",
  borderRadius: "6px",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

function Alert({ kind, message }: { kind: "error" | "success"; message: string }) {
  const isError = kind === "error";
  return (
    <div
      style={{
        background: isError ? "#FEE2E2" : "#D1FAE5",
        color: isError ? "#B91C1C" : "#047857",
        padding: "11px 14px",
        borderRadius: "6px",
        fontSize: "0.85rem",
        marginBottom: "18px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />} {message}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span style={{ fontSize: "0.74rem", color: "#DC2626", display: "block", marginTop: "4px" }}>
      {message}
    </span>
  );
}

export function ProfileForms({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.8rem",
          fontWeight: 600,
          color: "var(--color-black)",
        }}
      >
        Profil &amp; Şifre
      </h1>

      <ProfileSection initialName={initialName} initialPhone={initialPhone} email={email} />
      <PasswordSection />

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ProfileSection({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    const result = await updateProfile({ name, phone });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }

    setSuccess("Profil bilgileriniz güncellendi.");
  };

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "18px" }}>
        Hesap Bilgileri
      </h2>

      {error && <Alert kind="error" message={error} />}
      {success && <Alert kind="success" message={success} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Ad Soyad *</label>
          <input value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} />
          <FieldError message={fieldErrors.name} />
        </div>
        <div>
          <label style={labelStyle}>Telefon</label>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="05550000000"
            style={inputStyle}
          />
          <FieldError message={fieldErrors.phone} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>E-posta</label>
          <input value={email} disabled style={{ ...inputStyle, background: "var(--color-gray-100)", color: "var(--color-gray-500)" }} />
          <span style={{ fontSize: "0.74rem", color: "var(--color-gray-500)", display: "block", marginTop: "4px" }}>
            E-posta adresi değiştirilemez. Değişiklik için bizimle iletişime geçin.
          </span>
        </div>
      </div>

      <button type="submit" disabled={saving} style={{ ...buttonStyle, marginTop: "20px" }}>
        {saving && <Loader2 size={15} className="spin" />}
        {saving ? "Kaydediliyor…" : "Bilgileri Güncelle"}
      </button>
    </form>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    const result = await changePassword({
      currentPassword,
      newPassword,
      newPasswordConfirm,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }

    setSuccess("Şifreniz güncellendi.");
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "18px" }}>
        Şifre Değiştir
      </h2>

      {error && <Alert kind="error" message={error} />}
      {success && <Alert kind="success" message={success} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Mevcut Şifre *</label>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            style={inputStyle}
          />
          <FieldError message={fieldErrors.currentPassword} />
        </div>
        <div>
          <label style={labelStyle}>Yeni Şifre *</label>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="En az 8 karakter, harf ve rakam"
            style={inputStyle}
          />
          <FieldError message={fieldErrors.newPassword} />
        </div>
        <div>
          <label style={labelStyle}>Yeni Şifre (Tekrar) *</label>
          <input
            type="password"
            autoComplete="new-password"
            value={newPasswordConfirm}
            onChange={(event) => setNewPasswordConfirm(event.target.value)}
            style={inputStyle}
          />
          <FieldError message={fieldErrors.newPasswordConfirm} />
        </div>
      </div>

      <button type="submit" disabled={saving} style={{ ...buttonStyle, marginTop: "20px" }}>
        {saving && <Loader2 size={15} className="spin" />}
        {saving ? "Güncelleniyor…" : "Şifreyi Değiştir"}
      </button>
    </form>
  );
}
