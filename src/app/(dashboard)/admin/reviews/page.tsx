import { prisma } from "@/lib/prisma";
import { ReviewModeration, type ReviewRecord } from "@/components/admin/ReviewModeration";

export const metadata = {
  title: "Yorumlar | Kütüklü Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    // Onay bekleyenler en üstte.
    orderBy: [{ isApproved: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
  });

  const serialized: ReviewRecord[] = reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    isApproved: review.isApproved,
    createdAt: review.createdAt.toISOString(),
    userName: review.user.name ?? "İsimsiz",
    userEmail: review.user.email,
    productName: review.product.name,
    productSlug: review.product.slug,
  }));

  return <ReviewModeration reviews={serialized} />;
}
