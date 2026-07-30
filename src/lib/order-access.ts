import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders";

/**
 * Sipariş detayına erişim yetkilendirmesi.
 *
 * Sipariş numarası tek başına YETKİ DEĞİLDİR. Erişim için ya siparişin sahibi
 * olarak oturum açmış olmak ya da siparişle birlikte üretilen gizli
 * `accessToken` değerine sahip olmak gerekir. Aksi halde sipariş numarasını
 * deneyerek başkalarının adres ve iletişim bilgileri okunabilirdi.
 */

/** Uzunluk sızdırmayan, sabit zamanlı string karşılaştırması. */
function safeEquals(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export type OrderWithItems = NonNullable<
  Awaited<ReturnType<typeof findOrderByNumber>>
>;

function findOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { orderBy: { productName: "asc" } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export type OrderAccessResult =
  | { ok: true; order: OrderWithItems }
  | { ok: false; reason: "not_found" | "forbidden" };

/**
 * Siparişi, görüntüleyen kişinin yetkisini doğrulayarak döner.
 *
 * @param token Misafir siparişi için bağlantıdaki gizli anahtar.
 */
export async function getOrderForViewer(
  orderNumber: string,
  token?: string | null
): Promise<OrderAccessResult> {
  if (!orderNumber || orderNumber.length > 64) {
    return { ok: false, reason: "not_found" };
  }

  const order = await findOrderByNumber(orderNumber);
  if (!order) return { ok: false, reason: "not_found" };

  // 1) Siparişin sahibi mi?
  const session = await auth();
  const viewerId = session?.user?.id;

  if (viewerId && order.userId && viewerId === order.userId) {
    return { ok: true, order };
  }

  // 2) Yönetici her siparişi görebilir.
  if (session?.user?.role === "ADMIN") {
    return { ok: true, order };
  }

  // 3) Gizli erişim anahtarı doğru mu?
  if (token && safeEquals(token, order.accessToken)) {
    return { ok: true, order };
  }

  return { ok: false, reason: "forbidden" };
}

/**
 * Ödeme durumunu Stripe ile karşılaştırıp gerekirse günceller.
 *
 * Webhook birincil yoldur; bu fonksiyon yalnızca yedektir (ör. yerel
 * geliştirmede `stripe listen` çalışmıyorsa veya webhook gecikmişse).
 *
 * GÜVENLİ: Ödeme bilgisi istemciden değil, sunucudan Stripe API'sine yapılan
 * sorgudan alınır ve tutar doğrulaması `markOrderPaid` içinde yine yapılır.
 */
export async function reconcileOrderPayment(order: {
  id: string;
  paymentStatus: string;
  paymentMethod: string | null;
  stripePaymentId: string | null;
}): Promise<boolean> {
  if (order.paymentStatus === "PAID") return false;
  if (order.paymentMethod !== "card") return false;
  if (!order.stripePaymentId) return false;
  if (!isStripeConfigured()) return false;

  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(
      order.stripePaymentId
    );

    if (paymentIntent.status !== "succeeded") return false;

    const result = await markOrderPaid({
      orderId: order.id,
      paymentIntentId: paymentIntent.id,
      amountReceivedKurus: paymentIntent.amount_received || paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    return result.status === "paid";
  } catch (error) {
    console.error("[reconcileOrderPayment] Stripe sorgusu başarısız:", error);
    return false;
  }
}
