"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { resetPassword } from "@/app/actions/password-reset";
import { AuthCard, authInputStyle, authLabelStyle } from "./AuthCard";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span style={{ fontSize: "0.75rem", color: "#DC2626", display: "flex", alignItems: "center", gap: "4px" }}>
      <AlertCircle size={12} /> {message}
    </span>
  );
}

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <AuthCard title="Geçersiz Bağlantı" subtitle="Şifre sıfırlama bağlantısı eksik veya geçersiz.">
        <div
          style={{
            background: "#FEE2E2",
            color: "#B91C1C",
            padding: "12px 14px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            marginBottom: "16px",
          }}
        >
          Bu sayfaya doğrudan erişilemez. Lütfen e-postanızdaki bağlantıyı kullanın veya
          şifremi unuttum işlemini tekrar başlatın.
        </div>
        <Link
          href="/sifremi-unuttum"
          style={{
            display: "block",
            textAlign: "center",
            background: "var(--color-green)",
            color: "white",
            padding: "12px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Şifremi Unuttum
        </Link>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard title="Şifreniz Güncellendi" subtitle="Yeni şifrenizle giriş yapabilirsiniz.">
        <div
          style={{
            background: "#D1FAE5",
            color: "#047857",
            padding: "14px 16px",
            borderRadius: "6px",
            fontSize: "0.88rem",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={17} /> Şifreniz başarıyla değiştirildi.
        </div>
        <button
          type="button"
          onClick={() => router.push("/giris")}
          style={{
            width: "100%",
            background: "var(--color-green)",
            color: "white",
            border: "none",
            padding: "14px",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Giriş Yap
        </button>
      </AuthCard>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    const result = await resetPassword({ token, newPassword, newPasswordConfirm });

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }

    setSuccess(true);
  };

  return (
    <AuthCard title="Yeni Şifre Belirle" subtitle="Hesabınız için yeni bir şifre oluşturun.">
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
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={authLabelStyle} htmlFor="new-password">
            Yeni Şifre
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="En az 8 karakter, harf ve rakam"
            style={authInputStyle}
          />
          <FieldError message={fieldErrors.newPassword} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={authLabelStyle} htmlFor="new-password-confirm">
            Yeni Şifre (Tekrar)
          </label>
          <input
            id="new-password-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={newPasswordConfirm}
            onChange={(event) => setNewPasswordConfirm(event.target.value)}
            style={authInputStyle}
          />
          <FieldError message={fieldErrors.newPasswordConfirm} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: "6px",
            background: "var(--color-green)",
            color: "var(--color-white)",
            border: "none",
            padding: "14px",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="spin" /> Kaydediliyor…
            </>
          ) : (
            <>
              <KeyRound size={18} /> Şifreyi Güncelle
            </>
          )}
        </button>
      </form>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </AuthCard>
  );
}
