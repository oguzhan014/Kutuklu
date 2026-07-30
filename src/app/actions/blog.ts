"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError } from "@/lib/auth-guards";
import { blogPostSchema } from "@/lib/blog-schema";
import { slugify } from "@/lib/utils";

/**
 * Blog yazısı yönetimi eylemleri.
 * Tümü `requireAdmin()` ile korunur; rol veritabanından doğrulanır.
 */

export type BlogResult =
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

async function buildUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "yazi";

  for (let suffix = 0; suffix < 50; suffix++) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

export async function saveBlogPost(rawInput: unknown): Promise<BlogResult> {
  try {
    await requireAdmin();

    const parsed = blogPostSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Lütfen formdaki hataları düzeltin.",
        fieldErrors: collectFieldErrors(parsed.error.issues),
      };
    }

    const data = parsed.data;

    if (data.id) {
      const existing = await prisma.blogPost.findUnique({
        where: { id: data.id },
        select: { id: true, title: true, slug: true },
      });

      if (!existing) return { ok: false, error: "Yazı bulunamadı." };

      const slug =
        existing.title === data.title ? existing.slug : await buildUniqueSlug(data.title, data.id);

      await prisma.blogPost.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category,
          author: data.author,
          imageUrl: data.imageUrl,
          isFeatured: data.isFeatured,
          isPublished: data.isPublished,
        },
      });

      revalidatePath(`/blog/${slug}`);
    } else {
      const slug = await buildUniqueSlug(data.title);

      await prisma.blogPost.create({
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category,
          author: data.author,
          imageUrl: data.imageUrl,
          isFeatured: data.isFeatured,
          isPublished: data.isPublished,
        },
      });
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");

    return { ok: true, message: "Yazı kaydedildi." };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    console.error("[saveBlogPost] hata:", error);
    return { ok: false, error: "Yazı kaydedilemedi." };
  }
}

export async function deleteBlogPost(postId: string): Promise<BlogResult> {
  try {
    await requireAdmin();

    if (typeof postId !== "string" || !postId) {
      return { ok: false, error: "Geçersiz yazı." };
    }

    await prisma.blogPost.delete({ where: { id: postId } });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");

    return { ok: true, message: "Yazı silindi." };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    console.error("[deleteBlogPost] hata:", error);
    return { ok: false, error: "Yazı silinemedi." };
  }
}

export async function togglePostPublished(postId: string): Promise<BlogResult> {
  try {
    await requireAdmin();

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { isPublished: true },
    });
    if (!post) return { ok: false, error: "Yazı bulunamadı." };

    await prisma.blogPost.update({
      where: { id: postId },
      data: { isPublished: !post.isPublished },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");

    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    console.error("[togglePostPublished] hata:", error);
    return { ok: false, error: "Durum değiştirilemedi." };
  }
}
