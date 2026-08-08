import { prisma } from "@/lib/prisma";
import { isPayTRConfigured, verifyCallback } from "@/lib/paytr";
import { markOrderPaid, releaseOrderReservation } from "@/lib/orders";

/**
 * ─────────────────────────────────────────────────────────────
 * PAYTR BİLDİRİMİ — ÖDEMENİN TEK GÜVENİLİR KANITI
 * ─────────────────────────────────────────────────────────────
 *
 * Bir siparişin "ödendi" olarak işaretlenmesinin TEK yolu budur.
 * Tarayıcının başarı sayfasına yönlenmesi ödeme kanıtı DEĞİLDİR:
 * kullanıcı o adrese elle de gidebilir.
 *
 * Uygulanan kontroller:
 *  - HMAC imza doğrulaması (gövde değiştirilemez)
 *  - Tutar siparişin DB kaydıyla karşılaştırılır (markOrderPaid içinde)
 *  - merchant_oid siparişe kayıtlı referansla eşleşmeli
 *  - Tekrarlanan bildirimler idempotenttir
 *
 * PayTR, gövdede tam olarak "OK" metnini görmezse bildirimi tekrar tekrar
 * gönderir. Bu yüzden İŞLENEBİLEN her durumda "OK" döneriz; yalnızca
 * imza doğrulanamadığında veya beklenmeyen bir hata olduğunda dönmeyiz.
 *
 * NOT: Bildirim adresi PayTR mağaza panelinden şu şekilde tanımlanmalıdır:
 *   https://<alan-adiniz>/api/webhooks/paytr
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPayTRConfigured()) {
    console.error("[paytr-webhook] PayTR yapılandırılmamış.");
    return new Response("PayTR yapılandırılmamış", { status: 503 });
  }

  let form: URLSearchParams;

  try {
    // PayTR bildirimi application/x-www-form-urlencoded olarak gönderir.
    form = new URLSearchParams(await request.text());
  } catch (error) {
    console.error("[paytr-webhook] gövde okunamadı:", error);
    return new Response("Geçersiz istek", { status: 400 });
  }

  // İmza doğrulanamadı → istek PayTR'den gelmiyor olabilir. Reddet.
  const callback = verifyCallback(form);

  if (!callback) {
    console.error("[paytr-webhook] imza doğrulanamadı.");
    return new Response("İmza doğrulanamadı", { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { paymentRef: callback.merchantOid },
      select: { id: true, paymentStatus: true },
    });

    if (!order) {
      // Sipariş yoksa tekrar denemenin faydası yok; PayTR'yi susturmak için OK.
      console.error(`[paytr-webhook] sipariş bulunamadı: ${callback.merchantOid}`);
      return new Response("OK");
    }

    if (callback.status === "success") {
      await handlePaymentSucceeded(order.id, callback);
    } else {
      await handlePaymentFailed(order.id, callback);
    }
  } catch (error) {
    // Beklenmeyen hata: 500 dönerek PayTR'nin tekrar denemesini sağla.
    console.error("[paytr-webhook] bildirim işlenemedi:", error);
    return new Response("İşlenemedi", { status: 500 });
  }

  return new Response("OK");
}

type Callback = NonNullable<ReturnType<typeof verifyCallback>>;

async function handlePaymentSucceeded(orderId: string, callback: Callback) {
  // Taksit kapalı olduğu için `payment_amount` ile `total_amount` eşittir.
  // Yine de komisyon eklenmiş bir toplam gelirse sipariş tutarı olarak
  // komisyonsuz alanı tercih ederiz; yoksa toplam kullanılır.
  const amountKurus = callback.paymentAmountKurus ?? callback.totalAmountKurus;

  const result = await markOrderPaid({
    orderId,
    paymentRef: callback.merchantOid,
    amountReceivedKurus: amountKurus,
  });

  if (result.status === "mismatch") {
    console.error(`[paytr-webhook] Sipariş ${orderId} ödeme uyuşmazlığı: ${result.reason}`);
    return;
  }

  if (result.status === "not_found") {
    console.error(`[paytr-webhook] Sipariş bulunamadı: ${orderId}`);
    return;
  }

  if (result.status !== "paid") return;

  // Fatura üretimi ve müşteriye faturası ekli onay e-postası `markOrderPaid`
  // içinde (finalizePaidOrder) yapılır; hataları ödeme onayını geçersiz kılmaz.
  console.info(`[paytr-webhook] Sipariş ${orderId} ödendi olarak işaretlendi.`);
}

async function handlePaymentFailed(orderId: string, callback: Callback) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, paymentStatus: true, adminNote: true },
  });

  // Ödenmiş bir siparişe geç gelen "başarısız" bildirimi asla iptal etmemeli.
  if (!order || order.paymentStatus === "PAID") return;

  // Rezerve edilen stok ve kupon hakkı geri verilir (idempotent).
  await releaseOrderReservation(orderId);

  const stamp = new Date().toISOString();
  const reason = [callback.failedReasonCode, callback.failedReasonMsg]
    .filter(Boolean)
    .join(" — ");

  await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: "UNPAID" },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      adminNote: `${order.adminNote ? `${order.adminNote}\n` : ""}[${stamp}] PayTR ödemesi başarısız: ${
        reason || "sebep bildirilmedi"
      }`,
    },
  });

  console.info(`[paytr-webhook] Sipariş ${orderId} ödeme başarısız → iptal edildi.`);
}
