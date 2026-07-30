import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogDetailContent } from "@/components/blog/BlogDetailContent";
import { prisma } from "@/lib/prisma";
import { estimateReadTime, formatBlogDate, type DisplayBlogPost } from "@/lib/blog";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, isPublished: true },
  });

  if (!post || !post.isPublished) {
    return { title: "Yazı Bulunamadı" };
  }

  return {
    title: `${post.title} | Kütüklü Blog`,
    description: post.excerpt,
  };
}

export const revalidate = 60;

export default async function BlogDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.isPublished) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", color: "var(--color-gray-400)" }}>
            Yazı bulunamadı
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const displayPost: DisplayBlogPost = {
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
  };

  return (
    <>
      <Navbar />
      <main>
        <BlogDetailContent post={displayPost} />
      </main>
      <Footer />
    </>
  );
}
