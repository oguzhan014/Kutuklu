import { prisma } from "@/lib/prisma";
import { BlogManager, type BlogPostRecord } from "@/components/admin/BlogManager";

export const metadata = {
  title: "Blog | Kütüklü Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ publishedAt: "desc" }],
  });

  const serialized: BlogPostRecord[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    author: post.author,
    imageUrl: post.imageUrl,
    isFeatured: post.isFeatured,
    isPublished: post.isPublished,
    publishedAt: post.publishedAt.toISOString(),
  }));

  return <BlogManager posts={serialized} />;
}
