"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError } from "@/lib/auth-guards";
import { categorySchema } from "@/lib/category-schema";
import { slugify } from "@/lib/utils";

/**
 * Kategori yönetimi eylemleri.
 * Tümü `requireAdmin()` ile korunur; rol veritabanından doğrulanır.
 */

export type CategoryResult =
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

async function buildUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "kategori";

  for (let suffix = 0; suffix < 50; suffix++) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

/** Bir kategorinin, verilen adayın soyundan (kendi alt ağacından) olup olmadığını kontrol eder. */
async function isDescendant(categoryId: string, candidateParentId: string): Promise<boolean> {
  let current: string | null = candidateParentId;
  // Sonsuz döngüye karşı, olabilecek en fazla derinlik kadar dolaş.
  for (let depth = 0; depth < 50 && current; depth++) {
    if (current === categoryId) return true;
    const parent: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: current },
      select: { parentId: true },
    });
    current = parent?.parentId ?? null;
  }
  return false;
}

export async function saveCategory(rawInput: unknown): Promise<CategoryResult> {
  try {
    await requireAdmin();

    const parsed = categorySchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Lütfen formdaki hataları düzeltin.",
        fieldErrors: collectFieldErrors(parsed.error.issues),
      };
    }

    const data = parsed.data;

    if (data.parentId && data.id && data.parentId === data.id) {
      return {
        ok: false,
        error: "Bir kategori kendi üst kategorisi olamaz.",
        fieldErrors: { parentId: "Geçersiz üst kategori" },
      };
    }

    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
        select: { id: true },
      });
      if (!parent) {
        return {
          ok: false,
          error: "Seçilen üst kategori bulunamadı.",
          fieldErrors: { parentId: "Geçerli bir üst kategori seçin" },
        };
      }

      // Döngü koruması: bir kategori kendi alt kategorisinin altına taşınamaz.
      if (data.id && (await isDescendant(data.id, data.parentId))) {
        return {
          ok: false,
          error: "Bir kategori, kendi alt kategorilerinden birinin altına taşınamaz.",
          fieldErrors: { parentId: "Geçersiz üst kategori" },
        };
      }
    }

    if (data.id) {
      const existing = await prisma.category.findUnique({
        where: { id: data.id },
        select: { id: true, name: true, slug: true },
      });

      if (!existing) return { ok: false, error: "Kategori bulunamadı." };

      const slug =
        existing.name === data.name ? existing.slug : await buildUniqueSlug(data.name, data.id);

      await prisma.category.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug,
          description: data.description ?? null,
          parentId: data.parentId ?? null,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
        },
      });
    } else {
      const slug = await buildUniqueSlug(data.name);

      await prisma.category.create({
        data: {
          name: data.name,
          slug,
          description: data.description ?? null,
          parentId: data.parentId ?? null,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
        },
      });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/urunler");
    revalidatePath("/");

    return { ok: true, message: "Kategori kaydedildi." };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    console.error("[saveCategory] hata:", error);
    return { ok: false, error: "Kategori kaydedilemedi." };
  }
}

export async function deleteCategory(categoryId: string): Promise<CategoryResult> {
  try {
    await requireAdmin();

    if (typeof categoryId !== "string" || !categoryId) {
      return { ok: false, error: "Geçersiz kategori." };
    }

    const [productCount, childCount] = await Promise.all([
      prisma.product.count({ where: { categoryId } }),
      prisma.category.count({ where: { parentId: categoryId } }),
    ]);

    if (productCount > 0) {
      return {
        ok: false,
        error: `Bu kategoride ${productCount} ürün bulunuyor. Silmeden önce ürünleri başka bir kategoriye taşıyın.`,
      };
    }

    if (childCount > 0) {
      return {
        ok: false,
        error: `Bu kategorinin ${childCount} alt kategorisi var. Önce alt kategorileri silin veya taşıyın.`,
      };
    }

    await prisma.category.delete({ where: { id: categoryId } });

    revalidatePath("/admin/categories");
    revalidatePath("/urunler");
    revalidatePath("/");

    return { ok: true, message: "Kategori silindi." };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    console.error("[deleteCategory] hata:", error);
    return { ok: false, error: "Kategori silinemedi." };
  }
}

export async function toggleCategoryActive(categoryId: string): Promise<CategoryResult> {
  try {
    await requireAdmin();

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { isActive: true },
    });

    if (!category) return { ok: false, error: "Kategori bulunamadı." };

    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: !category.isActive },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/urunler");

    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    console.error("[toggleCategoryActive] hata:", error);
    return { ok: false, error: "Kategori durumu değiştirilemedi." };
  }
}
