import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured, isWebhookConfigured } from "@/lib/stripe";
import { markOrderPaid, releaseOrderReservation, sendRefundedEmail } from "@/lib/orders";

/**
 * ─────────────────────────────────────────────────────────────
 * STRIPE WEBHOOK — ÖDEMENİN TEK GÜVENİLİR KANITI
 * ─────────────────────────────────────────────────────────────
 *
 * Bir siparişin "ödendi" olarak işaretlenmesinin TEK yolu budur.
 * Tarayıcının başarı sayfasına yönlenmesi ödeme kanıtı DEĞİLDİR:
 * kullanıcı o adrese elle de gidebilir.
 *
 * Uygulanan kontroller:
 *  - Ham gövde üzerinden Stripe imza doğrulaması (gövde değiştirilemez)
 *  - Tutar ve para birimi siparişin DB kaydıyla karşılaştırılır
 *  - PaymentIntent kimliği siparişe kayıtlı olanla eşleşmeli
 *  - Tekrarlanan olaylar idempotenttir (Stripe aynı olayı defalarca gönderir)
 */

// Ham gövdeye erişebilmek için Node.js çalışma zamanı gereklidir.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isWebhookConfigured()) {
    console.error("[stripe-webhook] Stripe/webhook yapılandırılmamış.");
    return new Response("Stripe yapılandırılmamış", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("İmza başlığı yok", { status: 400 });
  }

  // ÖNEMLİ: İmza doğrulaması ham gövde üzerinde yapılmalı; JSON.parse edilmiş
  // gövde yeniden serileştirildiğinde imza tutmaz.
  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    // İmza doğrulanamadı → istek Stripe'tan gelmiyor olabilir. Reddet.
    console.error("[stripe-webhook] imza doğrulanamadı:", error);
    return new Response("İmza doğrulanamadı", { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentSucceeded(event.data.object);
        break;
      }

      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        await handlePaymentFailed(event.data.object);
        break;
      }

      case "charge.refunded": {
        await handleRefund(event.data.object);
        break;
      }

      default:
        // İlgilenmediğimiz olaylar sessizce onaylanır.
        break;
    }
  } catch (error) {
    // Beklenmeyen hata: 500 dönerek Stripe'ın tekrar denemesini sağla.
    console.error(`[stripe-webhook] ${event.type} işlenemedi:`, error);
    return new Response("İşlenemedi", { status: 500 });
  }

  return Response.json({ received: true });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.error(
      `[stripe-webhook] PaymentIntent ${paymentIntent.id} metadata.orderId içermiyor.`
    );
    return;
  }

  const result = await markOrderPaid({
    orderId,
    paymentIntentId: paymentIntent.id,
    // amount_received tahsil edilen gerçek tutardır.
    amountReceivedKurus: paymentIntent.amount_received || paymentIntent.amount,
    currency: paymentIntent.currency,
  });

  if (result.status === "mismatch") {
    console.error(
      `[stripe-webhook] Sipariş ${orderId} ödeme uyuşmazlığı: ${result.reason}`
    );
    return;
  }

  if (result.status === "not_found") {
    console.error(`[stripe-webhook] Sipariş bulunamadı: ${orderId}`);
    return;
  }

  if (result.status === "paid") {
    console.info(`[stripe-webhook] Sipariş ${orderId} ödendi olarak işaretlendi.`);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, paymentStatus: true },
  });

  // Ödenmiş bir siparişe geç gelen "başarısız" olayı asla iptal etmemeli.
  if (!order || order.paymentStatus === "PAID") return;

  // Rezerve edilen stok ve kupon hakkı geri verilir (idempotent).
  await releaseOrderReservation(orderId);

  await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: "UNPAID" },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  console.info(`[stripe-webhook] Sipariş ${orderId} ödeme başarısız → iptal edildi.`);
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  const order = await prisma.order.findUnique({
    where: { stripePaymentId: paymentIntentId },
    select: { id: true, paymentStatus: true },
  });

  if (!order || order.paymentStatus === "REFUNDED") return;

  // Tam iade ise stok geri verilir; kısmi iadede stok dokunulmaz.
  const fullyRefunded = charge.amount_refunded >= charge.amount;

  if (fullyRefunded) {
    await releaseOrderReservation(order.id);
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "REFUNDED",
      status: fullyRefunded ? "REFUNDED" : undefined,
    },
  });

  // Kısmi iadede müşteriye bildirim göndermiyoruz; sipariş hâlâ sürüyor
  // olabilir. Tam iadede sipariş kapandığı için bilgilendirme yapılır.
  if (fullyRefunded) {
    await sendRefundedEmail(order.id).catch((error) =>
      console.error("[stripe-webhook] iade e-postası gönderilemedi:", error)
    );
  }

  console.info(`[stripe-webhook] Sipariş ${order.id} iade edildi.`);
}
