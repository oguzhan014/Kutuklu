import "server-only";
import { headers } from "next/headers";

/**
 * Basit, süreç içi (in-memory) hız sınırlayıcı.
 *
 * NOT: Tek sunucu süreci için geçerlidir. Birden fazla instance ile
 * (ör. Vercel/serverless yatay ölçekleme) çalışıldığında Redis/Upstash gibi
 * paylaşımlı bir sayaca geçilmelidir. Yine de kaba kuvvet ve sipariş
 * spam'ine karşı ilk savunma hattıdır.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  // Belleğin sınırsız büyümesini engelle: dakikada bir süresi dolanları temizle.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return {
    ok: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/**
 * İstemci IP'sini proxy başlıklarından okur.
 * Başlıklar sahte olabileceği için hız sınırı DIŞINDA hiçbir güvenlik
 * kararında (yetkilendirme vb.) kullanılmamalıdır.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return headerList.get("x-real-ip") ?? "unknown";
}

/** Belirli bir eylem için IP bazlı hız sınırı uygular. */
export async function limitByIp(
  action: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return rateLimit(`${action}:${ip}`, limit, windowMs);
}
