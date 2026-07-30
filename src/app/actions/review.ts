"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth-guards";
import { limitByIp } from "@/lib/rate-limit";

/**
 * Ürün değerlendirmeleri.
 *
 * Kurallar:
 *  - Yalnızca giriş yapmış kullanıcılar yorum bırakabilir (spam engeli).
 *  - Bir kullanıcı bir ürüne tek yorum yazabilir (veritabanında unique kısıt);
 *    tekrar gönderirse mevcut yorumu güncellenir.
 *  - Yorumlar YAYINLANMADAN ÖNCE yönetici onayından geçer (`isApproved`).
 *    Böylece küfür/spam içerik doğrudan siteye düşmez.
 *  - Puan ortalaması yalnızca ONAYLI yorumlardan hesaplanır.
 */

const reviewSchema = z.object({
  productId: z.string().min(1).max(100),
  rating: z.coerce.number().int().min(1, "Puan verin").max(5),
  title: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  body: z
    .string()
    .trim()
    .min(10, "Yorumunuz en az 10 karakter olmalı")
    .max(2000, "Yorumunuz en fazla 2000 karakter olabilir"),
});

export type ReviewResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function submitReview(rawInput: unknown): Promise<ReviewResult> {
  try {
    const user = await requireUser();

    const limit = await limitByIp("submit-review", 10, 60 * 60_000);
    if (!limit.ok) {
      return { ok: false, error: "Çok fazla yorum gönderdiniz. Lütfen sonra tekrar deneyin." };
    }

    const parsed = reviewSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { ok: false, error: "Lütfen formdaki hataları düzeltin.", fieldErrors };
    }

    const { productId, rating, title, body } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });

    if (!product) {
      return { ok: false, error: "Ürün bulunamadı." };
    }

    // Aynı ürüne ikinci yorum yerine mevcut yorumu güncelle.
    await prisma.review.upsert({
      where: { productId_userId: { productId, userId: user.id } },
      create: {
        productId,
        userId: user.id,
        rating,
        title: title ?? null,
        body,
        isApproved: false,
      },
      update: {
        rating,
        title: title ?? null,
        body,
        // Düzenlenen yorum yeniden onaya düşer.
        isApproved: false,
      },
    });

    revalidatePath(`/urunler/${product.slug}`);

    return {
      ok: true,
      message:
        "Değerlendirmeniz alındı. Yönetici onayından sonra yayınlanacaktır. Teşekkür ederiz!",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: error.message };
    }
    console.error("[submitReview] hata:", error);
    return { ok: false, error: "Değerlendirmeniz kaydedilemedi. Lütfen tekrar deneyin." };
  }
}
