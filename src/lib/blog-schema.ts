import { z } from "zod";

/** Admin blog yazısı formu doğrulama şeması. */
export const blogPostSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().trim().min(4, "Başlık en az 4 karakter olmalı").max(200),
  excerpt: z.string().trim().min(10, "Özet en az 10 karakter olmalı").max(400),
  content: z.string().trim().min(20, "İçerik en az 20 karakter olmalı").max(20_000),
  category: z.string().trim().min(2, "Kategori girin").max(60),
  author: z.string().trim().min(2, "Yazar adı girin").max(80),
  imageUrl: z.string().trim().min(1, "Bir kapak görseli seçin").max(2000),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
});

export type BlogPostInput = z.input<typeof blogPostSchema>;

/** Kapak için hazır, markaya uygun degrade seçenekleri. */
export const BLOG_GRADIENT_PRESETS = [
  { label: "Krem", value: "linear-gradient(160deg, #F5F1E8 0%, #E6E0CF 100%)" },
  { label: "Koyu Yeşil", value: "linear-gradient(160deg, #2F4F2F 0%, #1A2F1A 100%)" },
  { label: "Altın", value: "linear-gradient(160deg, #D4AF37 0%, #997A15 100%)" },
  { label: "Orman Yeşili", value: "linear-gradient(160deg, #3D6B3D 0%, #204020 100%)" },
  { label: "Siyah", value: "linear-gradient(160deg, #3A332A 0%, #1C1C1C 100%)" },
] as const;
