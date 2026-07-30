"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { limitByIp } from "@/lib/rate-limit";
import { passwordSchema } from "@/lib/account-schema";
import {
  createPasswordResetToken,
  validatePasswordResetToken,
  consumePasswordResetToken,
} from "@/lib/password-reset";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";

/**
 * Şifremi unuttum akışı.
 *
 * Güvenlik notları:
 * - `requestPasswordReset` HER ZAMAN aynı genel mesajı döner; e-postanın
 *   sistemde kayıtlı olup olmadığı bilgisi sızdırılmaz (user enumeration).
 * - Token tek kullanımlıktır ve 1 saat sonra geçersiz olur.
 * - Her iki uca da IP bazlı hız sınırı uygulanır.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin").max(255),
});

export type RequestResetResult = { ok: true; message: string } | { ok: false; error: string };

export async function requestPasswordReset(rawInput: unknown): Promise<RequestResetResult> {
  const limit = await limitByIp("password-reset-request", 5, 15 * 60_000);

  const genericMessage =
    "Bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.";

  if (!limit.ok) {
    // Hız sınırında bile genel mesaj döneriz; aksi hâlde limit aşımı bilgisi
    // e-postanın var/yok olduğuna dair dolaylı sinyal verebilir.
    return { ok: true, message: genericMessage };
  }

  const parsed = requestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Geçerli bir e-posta adresi girin." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, email: true, password: true },
  });

  // Kullanıcı yoksa veya şifre tabanlı giriş yapmıyorsa (örn. yalnızca OAuth)
  // sessizce aynı mesajı dön.
  if (user?.password) {
    const rawToken = await createPasswordResetToken(user.id);
    const resetUrl = `${SITE_URL}/sifre-sifirla?token=${encodeURIComponent(rawToken)}`;

    await sendEmail({
      to: user.email,
      subject: "Şifre sıfırlama talebiniz",
      html: passwordResetEmail({
        name: user.name ?? "Kütüklü Müşterisi",
        resetUrl,
        siteUrl: SITE_URL,
      }),
    }).catch((error) => console.error("[requestPasswordReset] e-posta gönderilemedi:", error));
  }

  return { ok: true, message: genericMessage };
}

const resetSchema = z
  .object({
    token: z.string().min(1).max(200),
    newPassword: passwordSchema,
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["newPasswordConfirm"],
  });

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function resetPassword(rawInput: unknown): Promise<ResetPasswordResult> {
  const limit = await limitByIp("password-reset-confirm", 10, 15 * 60_000);
  if (!limit.ok) {
    return { ok: false, error: "Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin." };
  }

  const parsed = resetSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Lütfen formdaki hataları düzeltin.", fieldErrors };
  }

  const validation = await validatePasswordResetToken(parsed.data.token);

  if (!validation.ok) {
    const messages: Record<typeof validation.reason, string> = {
      invalid: "Bağlantı geçersiz. Lütfen şifremi unuttum işlemini tekrar başlatın.",
      expired: "Bu bağlantının süresi dolmuş. Lütfen şifremi unuttum işlemini tekrar başlatın.",
      used: "Bu bağlantı zaten kullanılmış. Lütfen şifremi unuttum işlemini tekrar başlatın.",
    };
    return { ok: false, error: messages[validation.reason] };
  }

  // Token'ı önce tüket (tek kullanımlık garanti); tüketilemiyorsa (yarış
  // durumu) işlemi durdur.
  const consumed = await consumePasswordResetToken(validation.tokenId);
  if (!consumed) {
    return {
      ok: false,
      error: "Bu bağlantı az önce kullanıldı. Lütfen şifremi unuttum işlemini tekrar başlatın.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: validation.userId },
    data: { password: passwordHash },
  });

  return { ok: true };
}
