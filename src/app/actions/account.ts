"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth-guards";
import { limitByIp } from "@/lib/rate-limit";
import {
  addressSchema,
  changePasswordSchema,
  deleteAccountSchema,
  profileSchema,
} from "@/lib/account-schema";
import { anonymizeUserAccount } from "@/lib/account-deletion";

/**
 * Hesap yönetimi eylemleri.
 *
 * Güvenlik kuralı: Adres/sipariş gibi kayıtlara erişen HER sorgu
 * `userId` ile sınırlandırılır. Yalnızca kimlik (`id`) ile sorgulamak,
 * başka bir kullanıcının kimliğini göndererek onun kaydını düzenlemeye
 * (IDOR) izin verirdi.
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

function handleError(error: unknown, fallback: string): ActionResult {
  if (error instanceof AuthError) {
    return { ok: false, error: error.message };
  }
  console.error(fallback, error);
  return { ok: false, error: fallback };
}

/** Ad ve telefon güncelleme. */
export async function updateProfile(rawInput: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = profileSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        ok: false,
        error: "Lütfen formdaki hataları düzeltin.",
        fieldErrors: collectFieldErrors(parsed.error.issues),
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone && parsed.data.phone !== "" ? parsed.data.phone : null,
      },
    });

    revalidatePath("/hesabim/profil");
    return { ok: true };
  } catch (error) {
    return handleError(error, "Profil güncellenemedi.");
  }
}

/** Şifre değiştirme — mevcut şifre doğrulanmadan değiştirilemez. */
export async function changePassword(rawInput: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser();

    const limit = await limitByIp("change-password", 5, 15 * 60_000);
    if (!limit.ok) {
      return { ok: false, error: "Çok fazla deneme yapıldı. Lütfen sonra tekrar deneyin." };
    }

    const parsed = changePasswordSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Lütfen formdaki hataları düzeltin.",
        fieldErrors: collectFieldErrors(parsed.error.issues),
      };
    }

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!record?.password) {
      return { ok: false, error: "Bu hesap için şifre tanımlı değil." };
    }

    const isCurrentCorrect = await bcrypt.compare(
      parsed.data.currentPassword,
      record.password
    );

    if (!isCurrentCorrect) {
      return {
        ok: false,
        error: "Mevcut şifreniz hatalı.",
        fieldErrors: { currentPassword: "Mevcut şifreniz hatalı" },
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(parsed.data.newPassword, 12) },
    });

    return { ok: true };
  } catch (error) {
    return handleError(error, "Şifre değiştirilemedi.");
  }
}

export type DeleteAccountResult =
  | { ok: true; retainedOrders: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Hesabı siler (anonimleştirir).
 *
 * Geri dönüşü olmadığı için iki koşul aranır:
 *   1. Mevcut şifre doğru girilmeli (oturum çalınmışsa hesap silinemesin)
 *   2. Kullanıcı "HESABIMI SIL" ifadesini yazarak niyetini teyit etmeli
 *
 * Siparişler ve faturalar yasal saklama yükümlülüğü nedeniyle korunur;
 * kaç siparişin saklandığı kullanıcıya bildirilir.
 */
export async function deleteAccount(rawInput: unknown): Promise<DeleteAccountResult> {
  try {
    const user = await requireUser();

    const limit = await limitByIp("delete-account", 5, 60 * 60_000);
    if (!limit.ok) {
      return { ok: false, error: "Çok fazla deneme yapıldı. Lütfen sonra tekrar deneyin." };
    }

    const parsed = deleteAccountSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Lütfen formdaki hataları düzeltin.",
        fieldErrors: collectFieldErrors(parsed.error.issues),
      };
    }

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true, role: true },
    });

    if (!record?.password) {
      return { ok: false, error: "Bu hesap için şifre tanımlı değil." };
    }

    // Yöneticinin kendi hesabını silmesi mağazayı sahipsiz bırakabilir.
    if (record.role === "ADMIN") {
      return {
        ok: false,
        error: "Yönetici hesapları bu ekrandan silinemez.",
      };
    }

    const isPasswordCorrect = await bcrypt.compare(parsed.data.password, record.password);

    if (!isPasswordCorrect) {
      return {
        ok: false,
        error: "Şifreniz hatalı.",
        fieldErrors: { password: "Şifreniz hatalı" },
      };
    }

    const result = await anonymizeUserAccount(user.id);

    if (!result.ok) {
      return {
        ok: false,
        error:
          result.reason === "already_deleted"
            ? "Bu hesap zaten silinmiş."
            : "Hesap bulunamadı.",
      };
    }

    return { ok: true, retainedOrders: result.retainedOrders };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    console.error("Hesap silinemedi.", error);
    return { ok: false, error: "Hesap silinemedi." };
  }
}

/** Adres ekleme / güncelleme. */
export async function saveAddress(rawInput: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = addressSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        ok: false,
        error: "Lütfen formdaki hataları düzeltin.",
        fieldErrors: collectFieldErrors(parsed.error.issues),
      };
    }

    const { id, isDefault, postalCode, ...fields } = parsed.data;

    await prisma.$transaction(async (tx) => {
      if (isDefault) {
        // Aynı anda tek varsayılan adres olabilir.
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      if (id) {
        // ÖNEMLİ: userId koşulu olmadan güncelleme başkasının adresini
        // değiştirmeye izin verirdi.
        const result = await tx.address.updateMany({
          where: { id, userId: user.id },
          data: {
            ...fields,
            postalCode: postalCode ?? null,
            isDefault: isDefault ?? false,
          },
        });

        if (result.count !== 1) {
          throw new AuthError("Adres bulunamadı.");
        }
      } else {
        const existingCount = await tx.address.count({ where: { userId: user.id } });

        if (existingCount >= 20) {
          throw new AuthError("En fazla 20 adres kaydedebilirsiniz.");
        }

        await tx.address.create({
          data: {
            ...fields,
            postalCode: postalCode ?? null,
            userId: user.id,
            // İlk adres otomatik varsayılan olur.
            isDefault: isDefault ?? existingCount === 0,
          },
        });
      }
    });

    revalidatePath("/hesabim/adreslerim");
    return { ok: true };
  } catch (error) {
    return handleError(error, "Adres kaydedilemedi.");
  }
}

/** Adres silme — yalnızca kendi adresi. */
export async function deleteAddress(addressId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();

    if (typeof addressId !== "string" || addressId.length > 100) {
      return { ok: false, error: "Geçersiz adres." };
    }

    const result = await prisma.address.deleteMany({
      where: { id: addressId, userId: user.id },
    });

    if (result.count !== 1) {
      return { ok: false, error: "Adres bulunamadı." };
    }

    revalidatePath("/hesabim/adreslerim");
    return { ok: true };
  } catch (error) {
    return handleError(error, "Adres silinemedi.");
  }
}

/** Varsayılan adres seçme. */
export async function setDefaultAddress(addressId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();

    const owned = await prisma.address.count({
      where: { id: addressId, userId: user.id },
    });

    if (owned !== 1) {
      return { ok: false, error: "Adres bulunamadı." };
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    revalidatePath("/hesabim/adreslerim");
    return { ok: true };
  } catch (error) {
    return handleError(error, "Varsayılan adres ayarlanamadı.");
  }
}
