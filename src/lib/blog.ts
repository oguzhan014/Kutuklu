/** Blog yazıları için görüntüleme yardımcıları (sunucu ve istemci tarafında kullanılabilir). */

/** Blog sayfalarında kullanılan, veritabanı satırından türetilmiş görüntüleme şekli. */
export type DisplayBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  imageUrl: string;
  isFeatured: boolean;
};

/** Ortalama Türkçe okuma hızına (≈200 kelime/dk) göre okuma süresi tahmini. */
export function estimateReadTime(content: string): string {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} dk okuma`;
}

export function formatBlogDate(date: Date): string {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}
