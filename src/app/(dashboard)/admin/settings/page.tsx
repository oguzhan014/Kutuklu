import { getSettings } from "@/lib/settings";
import { isPayTRConfigured, isPayTRTestMode } from "@/lib/paytr";
import { isEmailConfigured } from "@/lib/email";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Ayarlar | Kütüklü Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const paytrReady = isPayTRConfigured();
  const testMode = isPayTRTestMode();
  const emailReady = isEmailConfigured();

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "24px" }}>
        Ayarlar
      </h1>

      {/* Ödeme altyapısı durumu */}
      <div
        style={{
          background: paytrReady ? "#D1FAE5" : "#FEF3C7",
          border: `1px solid ${paytrReady ? "#6EE7B7" : "#FCD34D"}`,
          borderRadius: "12px",
          padding: "18px 22px",
          marginBottom: "24px",
          maxWidth: "820px",
        }}
      >
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: paytrReady ? "#047857" : "#92400E",
            marginBottom: "10px",
          }}
        >
          {paytrReady ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
          Ödeme Altyapısı Durumu (PayTR)
        </h2>

        <ul
          style={{
            listStyle: "none",
            fontSize: "0.85rem",
            color: paytrReady ? "#047857" : "#92400E",
            lineHeight: 1.9,
            padding: 0,
            margin: 0,
          }}
        >
          <li>
            {paytrReady ? "✓" : "✕"} PayTR mağaza bilgileri{" "}
            {paytrReady ? "tanımlı" : "tanımlı değil — kart ödemesi devre dışı"}
          </li>
          <li>
            {paytrReady && !testMode ? "✓" : "!"}{" "}
            {testMode
              ? "TEST MODU açık — gerçek para tahsil edilmez"
              : "Canlı mod açık — gerçek tahsilat yapılır"}
          </li>
        </ul>

        {!paytrReady && (
          <p style={{ fontSize: "0.8rem", color: "#92400E", marginTop: "12px", lineHeight: 1.6 }}>
            <code>.env</code> dosyasına <code>PAYTR_MERCHANT_ID</code>,{" "}
            <code>PAYTR_MERCHANT_KEY</code> ve <code>PAYTR_MERCHANT_SALT</code> değerlerini
            girin. Bu üç değeri PayTR mağaza panelindeki “Bilgi” sayfasından alabilirsiniz.
          </p>
        )}

        {paytrReady && (
          <p style={{ fontSize: "0.8rem", color: "#047857", marginTop: "12px", lineHeight: 1.6 }}>
            PayTR mağaza panelinde <strong>Bildirim URL</strong> alanı{" "}
            <code>{`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://alan-adiniz"}/api/webhooks/paytr`}</code>{" "}
            olarak tanımlı olmalıdır; ödemeler ancak bu adrese gelen imzalı bildirimle
            onaylanır.
          </p>
        )}
      </div>

      {/* E-posta altyapısı durumu */}
      <div
        style={{
          background: emailReady ? "#D1FAE5" : "#FEF3C7",
          border: `1px solid ${emailReady ? "#6EE7B7" : "#FCD34D"}`,
          borderRadius: "12px",
          padding: "18px 22px",
          marginBottom: "24px",
          maxWidth: "820px",
        }}
      >
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: emailReady ? "#047857" : "#92400E",
            marginBottom: "10px",
          }}
        >
          {emailReady ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
          E-posta Bildirimleri
        </h2>

        <p style={{ fontSize: "0.85rem", color: emailReady ? "#047857" : "#92400E", margin: 0 }}>
          {emailReady
            ? "Resend API anahtarı tanımlı. Sipariş onayı, kargo ve iptal/iade bildirimleri gönderiliyor."
            : "Resend API anahtarı tanımlı değil — sipariş e-postaları gönderilmiyor, yalnızca konsola loglanıyor."}
        </p>

        {!emailReady && (
          <p style={{ fontSize: "0.8rem", color: "#92400E", marginTop: "12px", lineHeight: 1.6 }}>
            <code>.env</code> dosyasına <code>RESEND_API_KEY</code> ve <code>EMAIL_FROM</code> değerlerini
            girin. Ücretsiz bir anahtar için{" "}
            <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: "#92400E", fontWeight: 700 }}>
              resend.com
            </a>{" "}
            adresini kullanabilirsiniz.
          </p>
        )}
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
