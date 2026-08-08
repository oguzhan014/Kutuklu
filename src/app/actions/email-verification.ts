"use server";

import { requireUser, AuthError } from "@/lib/auth-guards";
import { limitByIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email-verification";

/**
 * Doğrulama bağlantısını yeniden gönderme.
 *
 * Hız sınırı önemlidir: aksi hâlde bu uç, başkasının adresine sürekli
 * e-posta yollamak için kullanılabilirdi (mail bombing).
 */

export type ResendResult =
  | { ok: true; delivered: boolean }
  | { ok: false; error: string };

export async function resendVerificationEmail(): Promise<ResendResult> {
  try {
    const user = await requireUser();

    const limit = await limitByIp("resend-verification", 3, 10 * 60_000);
    if (!limit.ok) {
      return {
        ok: false,
        error: `Çok fazla istek gönderildi. ${limit.retryAfterSeconds} saniye sonra tekrar deneyin.`,
      };
    }

    const result = await sendVerificationEmail(user.id);

    if (!result.ok) {
      return {
        ok: false,
        error:
          result.reason === "already_verified"
            ? "E-posta adresiniz zaten doğrulanmış."
            : "Hesap bulunamadı.",
      };
    }

    return { ok: true, delivered: result.delivered };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    console.error("[resendVerificationEmail] gönderilemedi:", error);
    return { ok: false, error: "Doğrulama e-postası gönderilemedi." };
  }
}
