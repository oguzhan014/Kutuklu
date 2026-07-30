"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { limitByIp } from "@/lib/rate-limit";
import { registerSchema, orderLookupSchema } from "@/lib/account-schema";

/**
 * Kayıt ve misafir sipariş sorgulama eylemleri.
 *
 * Güvenlik notları:
 * - `role` ASLA istemciden alınmaz; her yeni kullanıcı CUSTOMER olarak açılır.
 *   Aksi hâlde formda role=ADMIN göndererek yönetici olunabilirdi.
 * - Şifreler bcrypt (cost 12) ile saklanır.
 * - Kayıt ve sorgulama uçlarına IP bazlı hız sınırı uygulanır.
 */

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function registerCustomer(rawInput: unknown): Promise<ActionResult> {
  const limit = await limitByIp("register", 5, 15 * 60_000);
  if (!limit.ok) {
    return {
      ok: false,
      error: "Çok fazla kayıt denemesi yapıldı. Lütfen bir süre sonra tekrar deneyin.",
    };
  }

  const parsed = registerSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Lütfen formdaki hataları düzeltin.",
      fieldErrors: collectFieldErrors(parsed.error.issues),
    };
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return {
      ok: false,
      error: "Bu e-posta adresi zaten kayıtlı.",
      fieldErrors: { email: "Bu e-posta adresi zaten kayıtlı" },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        phone: phone && phone !== "" ? phone : null,
        password: passwordHash,
        // Rol sabit: istemci bunu etkileyemez.
        role: "CUSTOMER",
      },
    });
  } catch (error) {
    // Eşzamanlı iki kayıt denemesinde unique ihlali oluşabilir.
    if ((error as { code?: string })?.code === "P2002") {
      return {
        ok: false,
        error: "Bu e-posta adresi zaten kayıtlı.",
        fieldErrors: { email: "Bu e-posta adresi zaten kayıtlı" },
      };
    }
    console.error("[registerCustomer] kayıt başarısız:", error);
    return { ok: false, error: "Kayıt oluşturulamadı. Lütfen tekrar deneyin." };
  }

  return { ok: true };
}

export type OrderLookupResult =
  | { ok: true; orderNumber: string; accessToken: string }
  | { ok: false; error: string };

/**
 * Misafir sipariş sorgulama.
 *
 * Sipariş numarası tek başına yeterli değildir; siparişteki e-posta ile
 * eşleşmesi gerekir. Yanlış eşleşmede "sipariş bulunamadı" gibi tek bir
 * mesaj döner (hangi numaraların var olduğu sızdırılmaz) ve hız sınırı
 * uygulanarak deneme yanılma engellenir.
 */
export async function lookupGuestOrder(rawInput: unknown): Promise<OrderLookupResult> {
  const limit = await limitByIp("order-lookup", 10, 10 * 60_000);
  if (!limit.ok) {
    return {
      ok: false,
      error: "Çok fazla sorgulama yapıldı. Lütfen bir süre sonra tekrar deneyin.",
    };
  }

  const parsed = orderLookupSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Lütfen sipariş numaranızı ve e-postanızı doğru girin." };
  }

  const { orderNumber, email } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.toUpperCase() },
    select: { orderNumber: true, accessToken: true, guestEmail: true, userId: true },
  });

  const genericError =
    "Bu bilgilere ait bir sipariş bulunamadı. Sipariş numaranızı ve e-posta adresinizi kontrol edin.";

  if (!order) return { ok: false, error: genericError };

  if ((order.guestEmail ?? "").toLowerCase() !== email) {
    return { ok: false, error: genericError };
  }

  return {
    ok: true,
    orderNumber: order.orderNumber,
    accessToken: order.accessToken,
  };
}
