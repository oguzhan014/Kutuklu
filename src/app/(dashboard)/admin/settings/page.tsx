import { getSettings } from "@/lib/settings";
import { isStripeConfigured, isWebhookConfigured } from "@/lib/stripe";
import { isEmailConfigured } from "@/lib/email";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Ayarlar | Kütüklü Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const stripeReady = isStripeConfigured();
  const webhookReady = isWebhookConfigured();
  const emailReady = isEmailConfigured();

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "24px" }}>
        Ayarlar
      </h1>

      {/* Ödeme altyapısı durumu */}
      <div
        style={{
          background: stripeReady && webhookReady ? "#D1FAE5" : "#FEF3C7",
          border: `1px solid ${stripeReady && webhookReady ? "#6EE7B7" : "#FCD34D"}`,
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
            color: stripeReady && webhookReady ? "#047857" : "#92400E",
            marginBottom: "10px",
          }}
        >
          {stripeReady && webhookReady ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
          Ödeme Altyapısı Durumu
        </h2>

        <ul
          style={{
            listStyle: "none",
            fontSize: "0.85rem",
            color: stripeReady && webhookReady ? "#047857" : "#92400E",
            lineHeight: 1.9,
            padding: 0,
            margin: 0,
          }}
        >
          <li>
            {stripeReady ? "✓" : "✕"} Stripe API anahtarları{" "}
            {stripeReady ? "tanımlı" : "tanımlı değil — kart ödemesi devre dışı"}
          </li>
          <li>
            {webhookReady ? "✓" : "✕"} Webhook imza anahtarı{" "}
            {webhookReady
              ? "tanımlı"
              : "tanımlı değil — ödemeler otomatik onaylanamaz"}
          </li>
        </ul>

        {(!stripeReady || !webhookReady) && (
          <p style={{ fontSize: "0.8rem", color: "#92400E", marginTop: "12px", lineHeight: 1.6 }}>
            <code>.env</code> dosyasına <code>STRIPE_SECRET_KEY</code>,{" "}
            <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> ve{" "}
            <code>STRIPE_WEBHOOK_SECRET</code> değerlerini girin. Yerel testte webhook
            anahtarını <code>stripe listen --forward-to localhost:3000/api/webhooks/stripe</code>{" "}
            komutu verir.
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
