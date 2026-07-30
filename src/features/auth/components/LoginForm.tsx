"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { AuthCard, authInputStyle, authLabelStyle } from "./AuthCard";

/** Müşteri girişi. */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/hesabim";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Tek ve genel mesaj: e-postanın kayıtlı olup olmadığı sızdırılmaz.
        setError("E-posta veya şifre hatalı.");
        return;
      }

      // Açık yönlendirme (open redirect) engeli: yalnızca site içi yollar.
      const safeUrl = callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : "/hesabim";

      router.push(safeUrl);
      router.refresh();
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Giriş Yap"
      subtitle="Siparişlerinizi takip etmek ve adreslerinizi yönetmek için giriş yapın."
      footer={
        <>
          Hesabınız yok mu?{" "}
          <Link
            href="/kayit"
            style={{ color: "var(--color-green)", fontWeight: 600, textDecoration: "none" }}
          >
            Ücretsiz üye olun
          </Link>
        </>
      }
    >
      {error && (
        <div
          style={{
            background: "#FEE2E2",
            color: "#B91C1C",
            padding: "12px",
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={authLabelStyle} htmlFor="login-email">
            E-posta Adresi
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ornek@mail.com"
            style={authInputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={authLabelStyle} htmlFor="login-password">
              Şifre
            </label>
            <Link
              href="/sifremi-unuttum"
              style={{ fontSize: "0.8rem", color: "var(--color-green)", textDecoration: "none", fontWeight: 500 }}
            >
              Şifremi unuttum
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
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
              <Loader2 size={18} className="spin" /> Giriş yapılıyor…
            </>
          ) : (
            <>
              Giriş Yap <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "18px" }}>
        <Link
          href="/siparis-takibi"
          style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", textDecoration: "none" }}
        >
          Üye olmadan sipariş sorgula
        </Link>
      </div>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </AuthCard>
  );
}
