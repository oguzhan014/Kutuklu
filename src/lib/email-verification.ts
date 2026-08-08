import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { emailVerificationEmail } from "@/lib/email-templates";

/**
 * ─────────────────────────────────────────────────────────────
 * E-POSTA DOĞRULAMA
 * ─────────────────────────────────────────────────────────────
 *
 * Doğrulama YUMUŞAKTIR: doğrulanmamış kullanıcı kayıt olabilir, giriş
 * yapabilir, alışveriş yapabilir. Doğrulama yalnızca ödeme adımında istenir
 * (bkz. checkout ekranı) — çünkü asıl amaç, siparişin ve faturanın gerçekten
 * ulaşacağı bir adres olduğundan emin olmaktır.
 *
 * Not: Site misafir siparişine de izin verdiği için doğrulamayı ZORUNLU
 * kılmak koruma sağlamaz (kullanıcı çıkış yapıp misafir olarak aynı siparişi
 * verebilir); yalnızca hesaba bağlı siparişi kaybettirir.
 *
 * Token deseni şifre sıfırlamayla aynıdır: ham token yalnızca e-postada
 * gider, veritabanında SHA-256 hash'i saklanır.
 */

const TOKEN_TTL_MS = 24 * 60 * 60_000; // 24 saat
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Yeni doğrulama token'ı üretir ve önceki token'ları geçersiz kılar.
 * Yalnızca en son gönderilen bağlantı çalışır.
 */
export async function createEmailVerificationToken(
  userId: string,
  email: string
): Promise<string> {
  const rawToken = randomBytes(32).toString("base64url");

  await prisma.$transaction([
    prisma.emailVerificationToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.emailVerificationToken.create({
      data: {
        userId,
        email: email.trim().toLowerCase(),
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  return rawToken;
}

export type SendVerificationResult =
  | { ok: true; delivered: boolean }
  | { ok: false; reason: "not_found" | "already_verified" };

/**
 * Kullanıcıya doğrulama bağlantısı gönderir.
 *
 * `delivered: false` → e-posta altyapısı yapılandırılmamış (bağlantı yalnızca
 * konsola loglandı). Bu durumda bile akış hata vermez.
 */
export async function sendVerificationEmail(
  userId: string
): Promise<SendVerificationResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, emailVerified: true, anonymizedAt: true },
  });

  if (!user || user.anonymizedAt) return { ok: false, reason: "not_found" };
  if (user.emailVerified) return { ok: false, reason: "already_verified" };

  const rawToken = await createEmailVerificationToken(userId, user.email);
  const verifyUrl = `${SITE_URL}/e-posta-dogrula?token=${encodeURIComponent(rawToken)}`;

  const delivered = await sendEmail({
    to: user.email,
    subject: "E-posta adresinizi doğrulayın — Kütüklü Zeytinyağı",
    html: emailVerificationEmail({
      customerName: user.name ?? "Merhaba",
      verifyUrl,
      siteUrl: SITE_URL,
    }),
  });

  return { ok: true, delivered };
}

export type VerifyResult =
  | { ok: true; alreadyVerified: boolean }
  | { ok: false; reason: "invalid" | "expired" | "used" | "email_changed" };

/**
 * Token'ı doğrular ve kullanıcıyı doğrulanmış olarak işaretler.
 *
 * Token tek kullanımlıktır; koşullu güncelleme sayesinde aynı bağlantıya iki
 * kez tıklanması ikinci bir işlem yapmaz.
 */
export async function verifyEmailToken(rawToken: string): Promise<VerifyResult> {
  if (!rawToken || rawToken.length > 200) return { ok: false, reason: "invalid" };

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: { select: { id: true, email: true, emailVerified: true } } },
  });

  if (!record) return { ok: false, reason: "invalid" };
  if (record.usedAt) return { ok: false, reason: "used" };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };

  // Kullanıcı token üretildikten sonra e-postasını değiştirdiyse, eski adrese
  // gönderilmiş bağlantı yeni adresi doğrulamamalıdır.
  if (record.user.email.trim().toLowerCase() !== record.email) {
    return { ok: false, reason: "email_changed" };
  }

  if (record.user.emailVerified) {
    await prisma.emailVerificationToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    return { ok: true, alreadyVerified: true };
  }

  // Token'ı koşullu tüket: eşzamanlı iki istekten yalnızca biri uygular.
  const consumed = await prisma.emailVerificationToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  if (consumed.count !== 1) return { ok: false, reason: "used" };

  await prisma.user.update({
    where: { id: record.user.id },
    data: { emailVerified: new Date() },
  });

  return { ok: true, alreadyVerified: false };
}

/** Kullanıcının e-postası doğrulanmış mı? */
export async function isEmailVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });
  return Boolean(user?.emailVerified);
}
