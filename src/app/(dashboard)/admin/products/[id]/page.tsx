import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ProductForm,
  type ProductFormInitial,
} from "@/features/admin/components/ProductForm";

export const metadata = {
  title: "Ürünü Düzenle | Kütüklü Admin",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        attributes: true,
        variants: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  const primary = product.images.find((image) => image.isPrimary) ?? null;

  const initial: ProductFormInitial = {
    id: product.id,
    name: product.name,
    shortDesc: product.shortDesc ?? "",
    description: product.description ?? "",
    categoryId: product.categoryId,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isOrganic: product.isOrganic,
    harvestType: product.harvestType,
    volume: product.volume ? String(product.volume) : "",
    type: product.type,
    price: product.price ? String(product.price) : "",
    comparePrice: product.comparePrice ? String(product.comparePrice) : "",
    sku: product.sku ?? "",
    stock: String(product.stock),
    primaryImage: primary?.url ?? null,
    galleryImages: product.images
      .filter((image) => !image.isPrimary)
      .map((image) => image.url),
    attributes: product.attributes.map((attribute) => ({
      name: attribute.name,
      options: attribute.options,
    })),
    variants: product.variants.map((variant) => ({
      sku: variant.sku ?? "",
      price: String(variant.price),
      stock: String(variant.stock),
      attributes: (variant.attributes ?? {}) as Record<string, string>,
    })),
  };

  return <ProductForm categories={categories} initial={initial} />;
}
