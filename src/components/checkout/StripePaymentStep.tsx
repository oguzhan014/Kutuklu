"use client";

import { useMemo, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { ArrowLeft, Lock, Loader2, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

/**
 * KART ÖDEME ADIMI
 *
 * Kart bilgileri Stripe'ın kendi iframe'inde (PaymentElement) toplanır ve
 * doğrudan Stripe'a gönderilir. Kart numarası:
 *   - bu React ağacına hiç girmez,
 *   - bizim sunucumuza hiç ulaşmaz,
 *   - hiçbir log'a düşmez.
 * Bu sayede sistem PCI-DSS SAQ-A kapsamında kalır.
 *
 * `clientSecret` yalnızca ilgili PaymentIntent'i onaylama yetkisi verir;
 * tutarı değiştirme yetkisi VERMEZ. Tutar sunucuda belirlendi ve webhook'ta
 * yeniden doğrulanıyor.
 */

// loadStripe modül seviyesinde önbelleklenmeli; her render'da çağrılmamalı.
const stripeCache = new Map<string, Promise<Stripe | null>>();

function getStripePromise(publishableKey: string) {
  let cached = stripeCache.get(publishableKey);
  if (!cached) {
    cached = loadStripe(publishableKey);
    stripeCache.set(publishableKey, cached);
  }
  return cached;
}

type Props = {
  publishableKey: string;
  clientSecret: string;
  orderNumber: string;
  accessToken: string;
  total: number;
  onBack: () => void;
};

export function StripePaymentStep({
  publishableKey,
  clientSecret,
  orderNumber,
  accessToken,
  total,
  onBack,
}: Props) {
  const stripePromise = useMemo(
    () => getStripePromise(publishableKey),
    [publishableKey]
  );

  return (
    <div style={{ background: "var(--color-gray-100)", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: "640px" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            color: "var(--color-gray-600)",
            cursor: "pointer",
            fontSize: "0.9rem",
            marginBottom: "24px",
            padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Adres bilgilerine dön
        </button>

        <div
          style={{
            background: "var(--color-white)",
            padding: "32px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.6rem",
                fontWeight: 600,
                color: "var(--color-black)",
                marginBottom: "8px",
              }}
            >
              Ödeme
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)" }}>
              Sipariş No: <strong>{orderNumber}</strong>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              background: "var(--color-cream)",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--color-black)" }}>Ödenecek Tutar</span>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.6rem",
                fontWeight: 600,
                color: "var(--color-black)",
              }}
            >
              {formatPrice(total)}
            </span>
          </div>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              locale: "tr",
              appearance: {
                theme: "flat",
                variables: {
                  colorPrimary: "#2F4F2F",
                  colorBackground: "#FFFFFF",
                  colorText: "#1C1C1C",
                  borderRadius: "4px",
                  fontFamily: "Montserrat, system-ui, sans-serif",
                },
              },
            }}
          >
            <PaymentForm orderNumber={orderNumber} accessToken={accessToken} />
          </Elements>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({
  orderNumber,
  accessToken,
}: {
  orderNumber: string;
  accessToken: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    // Ödeme sonrası dönülecek adres. Sipariş durumu bu sayfada SUNUCUDAN
    // okunur; adrese elle gidilmesi ödeme yapıldığı anlamına gelmez.
    const returnUrl = `${window.location.origin}/siparis/${orderNumber}?token=${encodeURIComponent(
      accessToken
    )}`;

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    // Buraya ulaşıldıysa yönlendirme olmadı → bir hata var.
    if (stripeError) {
      setError(
        stripeError.message ??
          "Ödeme tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyin."
      );
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <div
          style={{
            marginTop: "16px",
            background: "#FEE2E2",
            border: "1px solid #FCA5A5",
            color: "#991B1B",
            padding: "12px 16px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        style={{
          width: "100%",
          marginTop: "24px",
          background: processing ? "var(--color-gray-400)" : "var(--color-green)",
          color: "var(--color-white)",
          border: "none",
          padding: "16px",
          borderRadius: "4px",
          fontSize: "1rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          cursor: processing ? "not-allowed" : "pointer",
        }}
      >
        {processing ? (
          <>
            <Loader2 size={18} className="spin" /> Ödeme işleniyor…
          </>
        ) : (
          <>
            <Lock size={18} /> Ödemeyi Tamamla
          </>
        )}
      </button>

      <p
        style={{
          textAlign: "center",
          marginTop: "16px",
          fontSize: "0.75rem",
          color: "var(--color-gray-500)",
          lineHeight: 1.6,
        }}
      >
        Kart bilgileriniz Stripe tarafından şifrelenerek işlenir ve sunucularımızda
        saklanmaz.
      </p>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}
