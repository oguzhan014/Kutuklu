"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { deleteAccount } from "@/app/actions/account";
import { DELETE_ACCOUNT_PHRASE } from "@/lib/account-schema";

/**
 * Hesap silme bölümü.
 *
 * Silme geri alınamaz olduğu için akış kasıtlı olarak yavaştır: önce bölüm
 * açılır, sonra şifre ve onay ifadesi istenir. Kullanıcının neyin silinip
 * neyin (yasal olarak) saklandığı açıkça yazılır.
 */

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid var(--color-border)",
  borderRadius: "4px",
  fontSize: "0.95rem",
  fontFamily: "inherit",
};

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ retainedOrders: number } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    const result = await deleteAccount({ password, confirmation });

    if (!result.ok) {
      setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      setPending(false);
      return;
    }

    setDone({ retainedOrders: result.retainedOrders });

    // Hesap artık giriş yapamaz; oturumu kapatıp ana sayfaya al.
    setTimeout(() => {
      void signOut({ callbackUrl: "/" });
    }, 4000);
  };

  if (done) {
    return (
      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "28px",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "10px" }}>
          Hesabınız silindi
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)", lineHeight: 1.7 }}>
          Kişisel bilgileriniz kaldırıldı ve hesabınız kapatıldı.
          {done.retainedOrders > 0 && (
            <>
              {" "}
              Yasal saklama yükümlülüğü nedeniyle <strong>{done.retainedOrders} siparişinizin</strong>{" "}
              fatura kaydı korunmaktadır.
            </>
          )}{" "}
          Birkaç saniye içinde çıkış yapılacak.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--color-white)",
        border: "1px solid #FCA5A5",
        borderRadius: "var(--radius-lg)",
        padding: "28px",
      }}
    >
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "#991B1B",
          marginBottom: "10px",
        }}
      >
        <AlertTriangle size={18} /> Hesabımı Sil
      </h2>

      <p
        style={{
          fontSize: "0.88rem",
          color: "var(--color-gray-600)",
          lineHeight: 1.75,
          marginBottom: "16px",
        }}
      >
        Hesabınızı sildiğinizde adınız, e-postanız, telefonunuz, adresleriniz ve
        yorumlarınız kaldırılır. <strong>Bu işlem geri alınamaz.</strong>
        <br />
        Vergi mevzuatı gereği geçmiş siparişlerinizin fatura kayıtları saklanmaya
        devam eder; bu kayıtlar yalnızca yasal yükümlülük için tutulur.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            border: "1px solid #DC2626",
            color: "#DC2626",
            padding: "10px 20px",
            borderRadius: "4px",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Trash2 size={15} /> Hesabımı silmek istiyorum
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px", maxWidth: "420px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "6px" }}>
              Şifreniz
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              style={inputStyle}
            />
            {fieldErrors.password && (
              <span style={{ fontSize: "0.75rem", color: "#DC2626" }}>{fieldErrors.password}</span>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "6px" }}>
              Onaylamak için <strong>{DELETE_ACCOUNT_PHRASE}</strong> yazın
            </label>
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={DELETE_ACCOUNT_PHRASE}
              style={inputStyle}
            />
            {fieldErrors.confirmation && (
              <span style={{ fontSize: "0.75rem", color: "#DC2626" }}>
                {fieldErrors.confirmation}
              </span>
            )}
          </div>

          {error && (
            <div
              style={{
                background: "#FEE2E2",
                border: "1px solid #FCA5A5",
                color: "#991B1B",
                padding: "10px 14px",
                borderRadius: "6px",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={pending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: pending ? "var(--color-gray-400)" : "#DC2626",
                color: "white",
                border: "none",
                padding: "11px 22px",
                borderRadius: "4px",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: pending ? "not-allowed" : "pointer",
              }}
            >
              {pending ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
              Hesabımı kalıcı olarak sil
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPassword("");
                setConfirmation("");
                setError(null);
                setFieldErrors({});
              }}
              disabled={pending}
              style={{
                background: "transparent",
                border: "1px solid var(--color-border)",
                color: "var(--color-gray-700)",
                padding: "11px 22px",
                borderRadius: "4px",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
