import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogListContent } from "@/components/blog/BlogListContent";
import { prisma } from "@/lib/prisma";
import { estimateReadTime, formatBlogDate, type DisplayBlogPost } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Zeytin Günlükleri | Kütüklü",
  description:
    "Zeytinyağı kültürü, sağlıklı yaşam ipuçları, nefis tarifler ve hasat günlüğümüz.",
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });

  const displayPosts: DisplayBlogPost[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    date: formatBlogDate(post.publishedAt),
    readTime: estimateReadTime(post.content),
    author: post.author,
    imageUrl: post.imageUrl,
    isFeatured: post.isFeatured,
  }));

  return (
    <>
      <Navbar />
      <main>
        <BlogListContent posts={displayPosts} />
      </main>
      <Footer />
    </>
  );
}
