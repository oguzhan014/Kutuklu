"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError } from "@/lib/auth-guards";
import { productSchema } from "@/lib/product-schema";
import { slugify } from "@/lib/utils";

/**
 * Ürün yönetimi eylemleri.
 *
 * GÜVENLİK: Server Action'lar tarayıcıdan doğrudan POST edilebilir. Bu yüzden
 * her eylem `requireAdmin()` ile başlar ve rol VERİTABANINDAN doğrulanır.
 * (Önceki sürümde `createProduct` hiçbir yetki kontrolü yapmıyordu; herkes
 * siteye ürün ekleyebilirdi.)
 */

export type ProductActionResult =
  | { ok: true; productId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/** Benzersiz slug üretir; çakışma varsa sonuna sayı ekler. */
async function buildUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "urun";

  for (let suffix = 0; suffix < 50; suffix++) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

export async function createProduct(rawInput: unknown): Promise<ProductActionResult> {
  try {
    await requireAdmin();

    const parsed = productSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Lütfen formdaki hataları düzeltin.",
        fieldErrors: collectFieldErrors(parsed.error.issues),
      };
    }

    const data = parsed.data;

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });

    if (!category) {
      return {
        ok: false,
        error: "Seçilen kategori bulunamadı.",
        fieldErrors: { categoryId: "Geçerli bir kategori seçin" },
      };
    }

    const slug = await buildUniqueSlug(data.name);
    const isVariable = data.type === "VARIABLE";

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        shortDesc: data.shortDesc ?? null,
        description: data.description ?? null,
        categoryId: data.categoryId,
        isActive: data.isActive,
        isFeatured: data.isFeatured ?? false,
        isOrganic: data.isOrganic ?? false,
        harvestType: data.harvestType,
        volume: data.volume,
        type: data.type,

        // Varyasyonlu üründe ana fiyat/stok varyantlardan gelir.
        price: isVariable ? 0 : String(data.price ?? 0),
        comparePrice:
          !isVariable && data.comparePrice !== null && data.comparePrice !== undefined
            ? String(data.comparePrice)
            : null,
        sku: !isVariable && data.sku ? data.sku : null,
        stock: isVariable ? 0 : data.stock,

        images: {
          create: [
            ...(data.primaryImage
              ? [{ url: data.primaryImage, isPrimary: true, sortOrder: 0, alt: data.name }]
              : []),
            ...(data.galleryImages ?? []).map((url, index) => ({
              url,
              isPrimary: false,
              sortOrder: index + 1,
              alt: data.name,
            })),
          ],
        },

        ...(isVariable && data.attributes?.length
          ? {
              attributes: {
                create: data.attributes.map((attribute) => ({
                  name: attribute.name,
                  options: attribute.options,
                })),
              },
            }
          : {}),

        ...(isVariable && data.variants?.length
          ? {
              variants: {
                create: data.variants.map((variant) => ({
                  attributes: variant.attributes,
                  sku: variant.sku ?? null,
                  price: String(variant.price),
                  stock: variant.stock,
                })),
              },
            }
          : {}),
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/urunler");
    revalidatePath("/");

    return { ok: true, productId: product.id };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };

    if ((error as { code?: string })?.code === "P2002") {
      return {
        ok: false,
        error: "Bu SKU zaten kullanılıyor.",
        fieldErrors: { sku: "Bu stok kodu başka bir üründe kayıtlı" },
      };
    }

    console.error("[createProduct] hata:", error);
    return { ok: false, error: "Ürün kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function updateProduct(rawInput: unknown): Promise<ProductActionResult> {
  try {
    await requireAdmin();

    const parsed = productSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Lütfen formdaki hataları düzeltin.",
        fieldErrors: collectFieldErrors(parsed.error.issues),
      };
    }

    const data = parsed.data;

    if (!data.id) {
      return { ok: false, error: "Güncellenecek ürün belirtilmedi." };
    }

    const existing = await prisma.product.findUnique({
      where: { id: data.id },
      select: { id: true, name: true, slug: true },
    });

    if (!existing) {
      return { ok: false, error: "Ürün bulunamadı." };
    }

    const isVariable = data.type === "VARIABLE";

    // Ad değiştiyse slug'ı da güncelle (eski bağlantılar bozulur, bilinçli tercih).
    const slug =
      existing.name === data.name
        ? existing.slug
        : await buildUniqueSlug(data.name, data.id);

    await prisma.$transaction(async (tx) => {
      // Görseller ve varyasyonlar tamamen yeniden yazılır.
      await tx.productImage.deleteMany({ where: { productId: data.id } });
      await tx.productAttribute.deleteMany({ where: { productId: data.id } });
      await tx.productVariant.deleteMany({ where: { productId: data.id } });

      await tx.product.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug,
          shortDesc: data.shortDesc ?? null,
          description: data.description ?? null,
          categoryId: data.categoryId,
          isActive: data.isActive,
          isFeatured: data.isFeatured ?? false,
          isOrganic: data.isOrganic ?? false,
          harvestType: data.harvestType,
          volume: data.volume,
          type: data.type,

          price: isVariable ? 0 : String(data.price ?? 0),
          comparePrice:
            !isVariable && data.comparePrice !== null && data.comparePrice !== undefined
              ? String(data.comparePrice)
              : null,
          sku: !isVariable && data.sku ? data.sku : null,
          stock: isVariable ? 0 : data.stock,

          images: {
            create: [
              ...(data.primaryImage
                ? [{ url: data.primaryImage, isPrimary: true, sortOrder: 0, alt: data.name }]
                : []),
              ...(data.galleryImages ?? []).map((url, index) => ({
                url,
                isPrimary: false,
                sortOrder: index + 1,
                alt: data.name,
              })),
            ],
          },

          ...(isVariable && data.attributes?.length
            ? {
                attributes: {
                  create: data.attributes.map((attribute) => ({
                    name: attribute.name,
                    options: attribute.options,
                  })),
                },
              }
            : {}),

          ...(isVariable && data.variants?.length
            ? {
                variants: {
                  create: data.variants.map((variant) => ({
                    attributes: variant.attributes,
                    sku: variant.sku ?? null,
                    price: String(variant.price),
                    stock: variant.stock,
                  })),
                },
              }
            : {}),
        },
      });
    });

    revalidatePath("/admin/products");
    revalidatePath("/urunler");
    revalidatePath("/");
    revalidatePath(`/urunler/${slug}`);

    return { ok: true, productId: data.id };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };

    if ((error as { code?: string })?.code === "P2002") {
      return {
        ok: false,
        error: "Bu SKU zaten kullanılıyor.",
        fieldErrors: { sku: "Bu stok kodu başka bir üründe kayıtlı" },
      };
    }

    console.error("[updateProduct] hata:", error);
    return { ok: false, error: "Ürün güncellenemedi. Lütfen tekrar deneyin." };
  }
}

export type SimpleResult = { ok: true } | { ok: false; error: string };

/**
 * Ürünü siler. Siparişi bulunan ürünler SİLİNMEZ, pasife alınır:
 * geçmiş siparişlerin ürün bağlantısı korunmalıdır.
 */
export async function deleteProduct(productId: string): Promise<SimpleResult> {
  try {
    await requireAdmin();

    if (typeof productId !== "string" || !productId || productId.length > 100) {
      return { ok: false, error: "Geçersiz ürün." };
    }

    const orderItemCount = await prisma.orderItem.count({ where: { productId } });

    if (orderItemCount > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
      });

      revalidatePath("/admin/products");
      revalidatePath("/urunler");
      revalidatePath("/");

      return {
        ok: false,
        error:
          "Bu ürün geçmiş siparişlerde yer aldığı için silinemez. Ürün satıştan kaldırıldı (pasife alındı).",
      };
    }

    await prisma.product.delete({ where: { id: productId } });

    revalidatePath("/admin/products");
    revalidatePath("/urunler");
    revalidatePath("/");

    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    console.error("[deleteProduct] hata:", error);
    return { ok: false, error: "Ürün silinemedi." };
  }
}

/** Ürünü yayına al / yayından kaldır. */
export async function toggleProductActive(productId: string): Promise<SimpleResult> {
  try {
    await requireAdmin();

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { isActive: true },
    });

    if (!product) return { ok: false, error: "Ürün bulunamadı." };

    await prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
    });

    revalidatePath("/admin/products");
    revalidatePath("/urunler");
    revalidatePath("/");

    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    console.error("[toggleProductActive] hata:", error);
    return { ok: false, error: "Ürün durumu değiştirilemedi." };
  }
}
