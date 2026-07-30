"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { registerCustomer } from "@/app/actions/auth";
import { AuthCard, authInputStyle, authLabelStyle } from "./AuthCard";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span style={{ fontSize: "0.75rem", color: "#DC2626", display: "flex", alignItems: "center", gap: "4px" }}>
      <AlertCircle size={12} /> {message}
    </span>
  );
}

/** Müşteri kaydı. Başarılı kayıttan sonra otomatik giriş yapılır. */
export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const result = await registerCustomer({
        name,
        email,
        phone,
        password,
        passwordConfirm,
        acceptedTerms,
      });

      if (!result.ok) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      // Kayıt başarılı → otomatik giriş.
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        router.push("/giris");
        return;
      }

      router.push("/hesabim");
      router.refresh();
    } catch {
      setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Üye Ol"
      subtitle="Siparişlerinizi takip edin, adreslerinizi kaydedin, daha hızlı alışveriş yapın."
      footer={
        <>
          Zaten hesabınız var mı?{" "}
          <Link
            href="/giris"
            style={{ color: "var(--color-green)", fontWeight: 600, textDecoration: "none" }}
          >
            Giriş yapın
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={authLabelStyle} htmlFor="reg-name">
            Ad Soyad *
          </label>
          <input
            id="reg-name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            style={authInputStyle}
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={authLabelStyle} htmlFor="reg-email">
            E-posta Adresi *
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ornek@mail.com"
            style={authInputStyle}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={authLabelStyle} htmlFor="reg-phone">
            Cep Telefonu
          </label>
          <input
            id="reg-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="05550000000"
            style={authInputStyle}
          />
          <FieldError message={fieldErrors.phone} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={authLabelStyle} htmlFor="reg-password">
            Şifre *
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="En az 8 karakter, harf ve rakam"
            style={authInputStyle}
          />
          <FieldError message={fieldErrors.password} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={authLabelStyle} htmlFor="reg-password-confirm">
            Şifre (Tekrar) *
          </label>
          <input
            id="reg-password-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            style={authInputStyle}
          />
          <FieldError message={fieldErrors.passwordConfirm} />
        </div>

        <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            style={{ width: 16, height: 16, marginTop: 2, accentColor: "var(--color-green)" }}
          />
          <span style={{ fontSize: "0.8rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>
            Üyelik sözleşmesini ve kişisel verilerimin işlenmesine ilişkin aydınlatma
            metnini okudum, onaylıyorum. *
          </span>
        </label>
        <FieldError message={fieldErrors.acceptedTerms} />

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
              <Loader2 size={18} className="spin" /> Hesap oluşturuluyor…
            </>
          ) : (
            <>
              Hesap Oluştur <ArrowRight size={18} />
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
