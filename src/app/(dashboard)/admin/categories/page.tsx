import { prisma } from "@/lib/prisma";
import { CategoryManager, type CategoryRecord } from "@/components/admin/CategoryManager";

export const metadata = {
  title: "Kategoriler | Kütüklü Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const serialized: CategoryRecord[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    productCount: category._count.products,
  }));

  return <CategoryManager categories={serialized} />;
}
