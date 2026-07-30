"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError } from "@/lib/auth-guards";
import {
  cancelOrder,
  releaseOrderReservation,
  sendPaidConfirmationEmail,
  sendShippedEmail,
  sendRefundedEmail,
} from "@/lib/orders";
import { updateSettings, type SettingKey } from "@/lib/settings";
import { couponSchema, orderStatusSchema, trackingSchema } from "@/lib/product-schema";

/**
 * Yönetim paneli eylemleri.
 * Tümü `requireAdmin()` ile korunur; rol veritabanından doğrulanır.
 */

export type AdminResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function handleError(error: unknown, fallback: string): AdminResult {
  if (error instanceof AuthError) return { ok: false, error: error.message };
  console.error(fallback, error);
  return { ok: false, error: fallback };
}

// ─────────────────────────────────────────
// SİPARİŞ YÖNETİMİ
// ─────────────────────────────────────────

/** Sipariş durumunu değiştirir. İptalde stok rezervasyonu geri verilir. */
export async function updateOrderStatus(rawInput: unknown): Promise<AdminResult> {
  try {
    await requireAdmin();

    const parsed = orderStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: "Geçersiz sipariş durumu." };
    }

    const { orderId, status } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, orderNumber: true },
    });

    if (!order) return { ok: false, error: "Sipariş bulunamadı." };

    if (status === "CANCELLED") {
      // İptal, stok ve kupon hakkını geri vermelidir. Müşteri bu sipariş
      // hakkında zaten bir e-posta almış olduğundan (havale bekleniyor veya
      // ödendi) iptal de kendisine bildirilir.
      await cancelOrder(orderId, "Yönetici tarafından iptal edildi.", true);
    } else if (status === "REFUNDED") {
      await releaseOrderReservation(orderId);
      await prisma.order.update({
        where: { id: orderId },
        data: { status, paymentStatus: "REFUNDED" },
      });
      await sendRefundedEmail(orderId).catch((error) =>
        console.error("[updateOrderStatus] iade e-postası gönderilemedi:", error)
      );
    } else if (status === "SHIPPED") {
      await prisma.order.update({ where: { id: orderId }, data: { status } });
      await sendShippedEmail(orderId).catch((error) =>
        console.error("[updateOrderStatus] kargo e-postası gönderilemedi:", error)
      );
    } else {
      await prisma.order.update({ where: { id: orderId }, data: { status } });
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { ok: true, message: "Sipariş durumu güncellendi." };
  } catch (error) {
    return handleError(error, "Sipariş durumu güncellenemedi.");
  }
}

/** Kargo firması ve takip numarasını kaydeder. */
export async function updateOrderTracking(rawInput: unknown): Promise<AdminResult> {
  try {
    await requireAdmin();

    const parsed = trackingSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Kargo bilgileri geçersiz.",
        fieldErrors: collectFieldErrors(parsed.error.issues),
      };
    }

    const { orderId, shippingCarrier, trackingNumber } = parsed.data;

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, trackingNumber: true },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingCarrier: shippingCarrier ?? null,
        trackingNumber: trackingNumber ?? null,
        // Takip numarası girildiyse sipariş kargoya verilmiş demektir.
        ...(trackingNumber ? { status: "SHIPPED" as const } : {}),
      },
    });

    // Takip numarası bu istekte İLK KEZ eklendiyse bildirim gönder; aynı
    // takip numarasını tekrar kaydetmek e-postayı tekrar tetiklemesin.
    const isNewTracking =
      Boolean(trackingNumber) && existing?.trackingNumber !== trackingNumber;

    if (isNewTracking) {
      await sendShippedEmail(orderId).catch((error) =>
        console.error("[updateOrderTracking] kargo e-postası gönderilemedi:", error)
      );
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { ok: true, message: "Kargo bilgileri kaydedildi." };
  } catch (error) {
    return handleError(error, "Kargo bilgileri kaydedilemedi.");
  }
}

/**
 * Havale/EFT ile gelen ödemeyi elle onaylar.
 *
 * Yalnızca `transfer` yöntemli siparişler için kullanılabilir. Kart
 * ödemeleri ASLA elle "ödendi" yapılamaz — onların tek kaynağı Stripe'ın
 * imzalı webhook'udur. Bu ayrım, panele erişen birinin kart ödemesini
 * doğrulamadan onaylamasını engeller.
 */
export async function markTransferPaid(orderId: string): Promise<AdminResult> {
  try {
    const admin = await requireAdmin();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, paymentMethod: true, paymentStatus: true, adminNote: true },
    });

    if (!order) return { ok: false, error: "Sipariş bulunamadı." };

    if (order.paymentMethod !== "transfer") {
      return {
        ok: false,
        error:
          "Yalnızca havale/EFT siparişleri elle onaylanabilir. Kart ödemeleri Stripe tarafından doğrulanır.",
      };
    }

    if (order.paymentStatus === "PAID") {
      return { ok: false, error: "Bu sipariş zaten ödenmiş görünüyor." };
    }

    const stamp = new Date().toISOString();

    const updated = await prisma.order.updateMany({
      where: { id: orderId, paymentStatus: "UNPAID" },
      data: {
        paymentStatus: "PAID",
        status: "PROCESSING",
        paidAt: new Date(),
        adminNote: `${order.adminNote ? `${order.adminNote}\n` : ""}[${stamp}] Havale ödemesi ${admin.email} tarafından onaylandı.`,
      },
    });

    // Yalnızca bu istek durumu gerçekten değiştirdiyse e-posta gönder
    // (eşzamanlı çift tıklamada mükerrer mail gitmesin).
    if (updated.count === 1) {
      await sendPaidConfirmationEmail(orderId).catch((error) =>
        console.error("[markTransferPaid] e-posta gönderilemedi:", error)
      );
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { ok: true, message: "Ödeme onaylandı." };
  } catch (error) {
    return handleError(error, "Ödeme onaylanamadı.");
  }
}

/** Siparişe yönetici notu ekler. */
export async function saveAdminNote(orderId: string, note: string): Promise<AdminResult> {
  try {
    await requireAdmin();

    if (typeof note !== "string" || note.length > 2000) {
      return { ok: false, error: "Not çok uzun." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { adminNote: note.trim() === "" ? null : note.trim() },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true, message: "Not kaydedildi." };
  } catch (error) {
    return handleError(error, "Not kaydedilemedi.");
  }
}

// ─────────────────────────────────────────
// AYARLAR
// ─────────────────────────────────────────

export async function saveSettings(
  values: Record<string, string>
): Promise<AdminResult> {
  try {
    await requireAdmin();

    if (typeof values !== "object" || values === null) {
      return { ok: false, error: "Geçersiz ayar verisi." };
    }

    // Parasal ayarlar kuruş cinsinden tam sayı olmalı.
    const numericKeys: SettingKey[] = [
      "shipping.cost",
      "shipping.freeThreshold",
      "order.maxQuantityPerItem",
    ];

    for (const key of numericKeys) {
      if (key in values) {
        const parsed = Number(values[key]);
        if (!Number.isInteger(parsed) || parsed < 0) {
          return {
            ok: false,
            error: "Sayısal ayarlar negatif olmayan tam sayı olmalı.",
            fieldErrors: { [key]: "Geçerli bir sayı girin" },
          };
        }
      }
    }

    for (const [key, value] of Object.entries(values)) {
      if (typeof value !== "string" || value.length > 2000) {
        return { ok: false, error: `"${key}" ayarı geçersiz.` };
      }
    }

    await updateSettings(values as Partial<Record<SettingKey, string>>);

    revalidatePath("/admin/settings");
    revalidatePath("/checkout");

    return { ok: true, message: "Ayarlar kaydedildi." };
  } catch (error) {
    return handleError(error, "Ayarlar kaydedilemedi.");
  }
}

// ─────────────────────────────────────────
// KUPONLAR
// ─────────────────────────────────────────

export async function saveCoupon(rawInput: unknown): Promise<AdminResult> {
  try {
    await requireAdmin();

    const parsed = couponSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Lütfen formdaki hataları düzeltin.",
        fieldErrors: collectFieldErrors(parsed.error.issues),
      };
    }

    const data = parsed.data;
    let expiresAt: Date | null = null;

    if (data.expiresAt) {
      const parsedDate = new Date(data.expiresAt);
      if (Number.isNaN(parsedDate.getTime())) {
        return {
          ok: false,
          error: "Geçersiz tarih.",
          fieldErrors: { expiresAt: "Geçerli bir tarih seçin" },
        };
      }
      expiresAt = parsedDate;
    }

    const payload = {
      code: data.code,
      description: data.description ?? null,
      type: data.type,
      value: String(data.value),
      minOrderAmount:
        data.minOrderAmount !== null && data.minOrderAmount !== undefined
          ? String(data.minOrderAmount)
          : null,
      maxUses: data.maxUses,
      isActive: data.isActive,
      expiresAt,
    };

    if (data.id) {
      await prisma.coupon.update({ where: { id: data.id }, data: payload });
    } else {
      await prisma.coupon.create({ data: payload });
    }

    revalidatePath("/admin/coupons");
    return { ok: true, message: "Kupon kaydedildi." };
  } catch (error) {
    if ((error as { code?: string })?.code === "P2002") {
      return {
        ok: false,
        error: "Bu kupon kodu zaten kullanılıyor.",
        fieldErrors: { code: "Bu kod zaten kayıtlı" },
      };
    }
    return handleError(error, "Kupon kaydedilemedi.");
  }
}

export async function deleteCoupon(couponId: string): Promise<AdminResult> {
  try {
    await requireAdmin();

    const usedInOrders = await prisma.order.count({ where: { couponId } });

    if (usedInOrders > 0) {
      // Geçmiş siparişlerin kupon bağlantısı korunmalı → sadece pasife al.
      await prisma.coupon.update({ where: { id: couponId }, data: { isActive: false } });
      revalidatePath("/admin/coupons");
      return {
        ok: true,
        message: "Kupon siparişlerde kullanıldığı için silinmedi, pasife alındı.",
      };
    }

    await prisma.coupon.delete({ where: { id: couponId } });
    revalidatePath("/admin/coupons");

    return { ok: true, message: "Kupon silindi." };
  } catch (error) {
    return handleError(error, "Kupon silinemedi.");
  }
}

// ─────────────────────────────────────────
// YORUM MODERASYONU
// ─────────────────────────────────────────

export async function setReviewApproval(
  reviewId: string,
  isApproved: boolean
): Promise<AdminResult> {
  try {
    await requireAdmin();

    if (typeof reviewId !== "string" || !reviewId || typeof isApproved !== "boolean") {
      return { ok: false, error: "Geçersiz istek." };
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
      select: { product: { select: { slug: true } } },
    });

    revalidatePath("/admin/reviews");
    revalidatePath(`/urunler/${review.product.slug}`);
    revalidatePath("/urunler");

    return { ok: true, message: isApproved ? "Yorum yayınlandı." : "Yorum yayından kaldırıldı." };
  } catch (error) {
    return handleError(error, "Yorum güncellenemedi.");
  }
}

export async function deleteReview(reviewId: string): Promise<AdminResult> {
  try {
    await requireAdmin();

    const review = await prisma.review.delete({
      where: { id: reviewId },
      select: { product: { select: { slug: true } } },
    });

    revalidatePath("/admin/reviews");
    revalidatePath(`/urunler/${review.product.slug}`);

    return { ok: true, message: "Yorum silindi." };
  } catch (error) {
    return handleError(error, "Yorum silinemedi.");
  }
}

// ─────────────────────────────────────────
// İLETİŞİM MESAJLARI
// ─────────────────────────────────────────

export async function setMessageRead(messageId: string, isRead: boolean): Promise<AdminResult> {
  try {
    await requireAdmin();

    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead },
    });

    revalidatePath("/admin/messages");
    return { ok: true };
  } catch (error) {
    return handleError(error, "Mesaj güncellenemedi.");
  }
}

export async function deleteMessage(messageId: string): Promise<AdminResult> {
  try {
    await requireAdmin();

    await prisma.contactMessage.delete({ where: { id: messageId } });

    revalidatePath("/admin/messages");
    return { ok: true, message: "Mesaj silindi." };
  } catch (error) {
    return handleError(error, "Mesaj silinemedi.");
  }
}
