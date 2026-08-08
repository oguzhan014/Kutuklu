"use client";

import { useState } from "react";
import { MailWarning, Check, Loader2 } from "lucide-react";
import { resendVerificationEmail } from "@/app/actions/email-verification";

/**
 * Ödeme adımında gösterilen e-posta doğrulama isteği.
 *
 * Sipariş vermeyi ENGELLEMEZ. Sebebi: site misafir siparişine izin veriyor;
 * engellemek kullanıcıyı çıkış yapıp misafir olarak aynı siparişi vermeye
 * iter, yani koruma sağlamaz, yalnızca hesaba bağlı siparişi kaybettirir.
 * Amaç, faturanın ulaşacağı adresin doğru olduğundan emin olmak.
 */

export function EmailVerificationNotice({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setState("sending");
    setError(null);

    const result = await resendVerificationEmail();

    if (!result.ok) {
      setError(result.error);
      setState("idle");
      return;
    }

    setState("sent");
  };

  return (
    <div
      style={{
        background: "#FEF3C7",
        border: "1px solid #FCD34D",
        borderRadius: "8px",
        padding: "16px 18px",
        marginBottom: "20px",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      {state === "sent" ? (
        <Check size={19} color="#047857" style={{ flexShrink: 0, marginTop: "2px" }} />
      ) : (
        <MailWarning size={19} color="#92400E" style={{ flexShrink: 0, marginTop: "2px" }} />
      )}

      <div style={{ fontSize: "0.86rem", color: "#92400E", lineHeight: 1.7 }}>
        {state === "sent" ? (
          <>
            <strong style={{ color: "#047857" }}>Doğrulama bağlantısı gönderildi.</strong>
            <br />
            <span style={{ color: "#5C5448" }}>
              {email} adresine gelen bağlantıya tıklayın. Gelen kutunuzda göremezseniz
              spam klasörünü kontrol edin. Siparişinizi vermek için beklemenize gerek yok.
            </span>
          </>
        ) : (
          <>
            <strong>E-posta adresiniz henüz doğrulanmadı.</strong>
            <br />
            Sipariş onayınız ve faturanız <strong>{email}</strong> adresine gönderilecek.
            Adresin size ait olduğundan emin olmak için doğrulamanızı öneririz.
            <br />
            <button
              type="button"
              onClick={handleSend}
              disabled={state === "sending"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "10px",
                background: "transparent",
                border: "1px solid #B45309",
                color: "#92400E",
                padding: "7px 14px",
                borderRadius: "4px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: state === "sending" ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {state === "sending" && <Loader2 size={13} className="spin" />}
              Doğrulama bağlantısı gönder
            </button>
            {error && (
              <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "#991B1B" }}>{error}</div>
            )}
          </>
        )}
      </div>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
