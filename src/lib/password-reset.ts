import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Şifre sıfırlama token yönetimi.
 *
 * Ham token yalnızca e-postada gönderilir ve URL'de taşınır; veritabanında
 * SHA-256 hash'i saklanır. Böylece veritabanı sızıntısında dahi mevcut
 * token'lar kullanılamaz (accessToken deseniyle aynı mantık).
 */

const TOKEN_TTL_MS = 60 * 60_000; // 1 saat

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Kullanıcı için yeni bir sıfırlama token'ı üretir; eski token'ları geçersiz kılar. */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = randomBytes(32).toString("base64url");

  await prisma.$transaction([
    // Aynı kullanıcının önceki, kullanılmamış token'larını geçersiz kıl —
    // yalnızca en son gönderilen bağlantı geçerli olsun.
    prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  return rawToken;
}

export type ValidateResult =
  | { ok: true; userId: string; tokenId: string }
  | { ok: false; reason: "invalid" | "expired" | "used" };

/** Token'ı doğrular; tüketmeden önce yalnızca kontrol eder. */
export async function validatePasswordResetToken(rawToken: string): Promise<ValidateResult> {
  if (!rawToken || rawToken.length > 200) return { ok: false, reason: "invalid" };

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record) return { ok: false, reason: "invalid" };
  if (record.usedAt) return { ok: false, reason: "used" };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };

  return { ok: true, userId: record.userId, tokenId: record.id };
}

/** Token'ı tek kullanımlık olarak tüketir (idempotent — iki kez tüketilemez). */
export async function consumePasswordResetToken(tokenId: string): Promise<boolean> {
  const result = await prisma.passwordResetToken.updateMany({
    where: { id: tokenId, usedAt: null },
    data: { usedAt: new Date() },
  });
  return result.count === 1;
}
