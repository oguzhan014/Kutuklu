import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/features/admin/components/ProductForm";

export const metadata = {
  title: "Yeni Ürün Ekle | Kütüklü Admin",
};

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return <ProductForm categories={categories} />;
}
