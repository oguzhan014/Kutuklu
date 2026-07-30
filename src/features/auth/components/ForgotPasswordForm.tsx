"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/password-reset";
import { AuthCard, authInputStyle, authLabelStyle } from "./AuthCard";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);

    const response = await requestPasswordReset({ email });

    setIsLoading(false);
    setResult({ ok: response.ok, message: response.ok ? response.message : response.error });
  };

  return (
    <AuthCard
      title="Şifremi Unuttum"
      subtitle="Hesabınıza kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim."
      footer={
        <Link href="/giris" style={{ color: "var(--color-green)", fontWeight: 600, textDecoration: "none" }}>
          Girişe dön
        </Link>
      }
    >
      {result && (
        <div
          style={{
            background: result.ok ? "#D1FAE5" : "#FEE2E2",
            color: result.ok ? "#047857" : "#B91C1C",
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
          {result.ok ? (
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
          ) : (
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
          )}
          {result.message}
        </div>
      )}

      {!result?.ok && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={authLabelStyle} htmlFor="forgot-email">
              E-posta Adresi
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ornek@mail.com"
              style={authInputStyle}
            />
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
                <Loader2 size={18} className="spin" /> Gönderiliyor…
              </>
            ) : (
              <>
                Sıfırlama Bağlantısı Gönder <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </AuthCard>
  );
}
