"use server";

import { revalidatePath } from "next/cache";
import { limitByIp } from "@/lib/rate-limit";
import { getOrderForViewer } from "@/lib/order-access";
import { cancelOrder } from "@/lib/orders";

/**
 * Müşterinin kendi siparişini iptal etmesi.
 *
 * Yetkilendirme `getOrderForViewer` ile yapılır — aynı fonksiyon sipariş
 * detay sayfasında da kullanılır: ya oturum sahibi ya da doğru `accessToken`
 * gerekir. Sipariş numarasını bilmek tek başına yetki vermez.
 *
 * Yalnızca henüz kargoya verilmemiş (PENDING) siparişler iptal edilebilir;
 * hazırlanmaya başlanmış veya kargodaki siparişler için müşteriden bizimle
 * iletişime geçmesi istenir.
 */

export type CancelOrderResult = { ok: true } | { ok: false; error: string };

export async function cancelMyOrder(
  orderNumber: string,
  token?: string | null
): Promise<CancelOrderResult> {
  const limit = await limitByIp("cancel-order", 10, 10 * 60_000);
  if (!limit.ok) {
    return { ok: false, error: "Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin." };
  }

  const access = await getOrderForViewer(orderNumber, token);

  if (!access.ok) {
    return { ok: false, error: "Sipariş bulunamadı." };
  }

  if (access.order.status !== "PENDING") {
    return {
      ok: false,
      error:
        "Bu sipariş artık kendiniz iptal edemezsiniz çünkü hazırlanmaya başlanmış olabilir. Lütfen bizimle iletişime geçin.",
    };
  }

  await cancelOrder(access.order.id, "Müşteri tarafından iptal edildi.", true);

  revalidatePath(`/siparis/${orderNumber}`);
  revalidatePath("/hesabim/siparislerim");

  return { ok: true };
}
