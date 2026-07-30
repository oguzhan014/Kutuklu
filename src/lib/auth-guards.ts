import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Yetki kontrolleri.
 *
 * Server Action'lar ve Route Handler'lar doğrudan POST edilebildiği için
 * (arayüzdeki butondan bağımsız olarak) HER mutasyon kendi yetki kontrolünü
 * yapmak zorundadır. Layout'taki kontrol yalnızca görsel bir kısayoldur,
 * güvenlik sınırı değildir.
 *
 * `requireAdmin` rolü JWT'den değil VERİTABANINDAN doğrular: yetkisi alınan
 * bir kullanıcının elindeki eski token ile admin işlemi yapması engellenir.
 */

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN";
};

/** Oturum açmış kullanıcıyı döner, yoksa null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  return user ?? null;
}

/** Oturum zorunlu. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Bu işlem için giriş yapmalısınız.");
  }
  return user;
}

/** Admin rolü zorunlu — rol veritabanından doğrulanır. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new AuthError("Bu işlem için yönetici yetkisi gerekiyor.");
  }
  return user;
}
