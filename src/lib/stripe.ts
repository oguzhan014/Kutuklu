import "server-only";
import Stripe from "stripe";

/**
 * Stripe sunucu istemcisi.
 *
 * Gizli anahtar YALNIZCA sunucuda kullanılır (`server-only` ile istemci
 * paketine sızması derleme zamanında engellenir).
 *
 * Anahtarlar henüz girilmemişse (.env'de placeholder değerler varsa) uygulama
 * çökmez; kredi kartı ödemesi kapalı kabul edilir ve havale/EFT ile sipariş
 * verilmeye devam edilebilir.
 */

const PLACEHOLDER_MARKERS = ["your_stripe", "your_webhook", "xxx", ""];

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => marker && lower.includes(marker));
}

/** Kredi kartı ödemesi için Stripe yapılandırması tam mı? */
export function isStripeConfigured(): boolean {
  return (
    !isPlaceholder(process.env.STRIPE_SECRET_KEY) &&
    !isPlaceholder(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  );
}

/** Webhook imza doğrulaması yapılabilir mi? */
export function isWebhookConfigured(): boolean {
  return !isPlaceholder(process.env.STRIPE_WEBHOOK_SECRET);
}

let cachedClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error(
      "Stripe yapılandırılmamış. .env dosyasına geçerli STRIPE_SECRET_KEY ve NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY girin."
    );
  }

  if (!cachedClient) {
    cachedClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // Ağ hatalarında sınırlı otomatik yeniden deneme.
      maxNetworkRetries: 2,
      timeout: 20_000,
      appInfo: { name: "Kutuklu Zeytinyagi", version: "1.0.0" },
    });
  }

  return cachedClient;
}

/** Stripe para birimi kodu. TRY iki ondalıklıdır → tutar kuruş cinsindendir. */
export const STRIPE_CURRENCY = "try";
