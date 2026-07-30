import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/pricing";
import { ProductRowActions } from "@/components/admin/ProductRowActions";

export const metadata = {
  title: "Ürünler | Kütüklü Admin",
};

export const dynamic = "force-dynamic";

const thStyle: React.CSSProperties = {
  padding: "16px",
  fontWeight: 600,
  color: "var(--color-gray-600)",
  borderBottom: "1px solid var(--color-border)",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
      variants: { select: { stock: true, price: true } },
    },
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", margin: 0 }}>
          Ürünler
        </h1>
        <Link
          href="/admin/products/new"
          style={{
            background: "var(--color-green)",
            color: "white",
            padding: "10px 16px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          <Plus size={18} /> Yeni Ürün Ekle
        </Link>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid var(--color-border)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.9rem",
            minWidth: "820px",
          }}
        >
          <thead style={{ background: "var(--color-gray-100)" }}>
            <tr>
              <th style={thStyle}>Ürün</th>
              <th style={thStyle}>Kategori</th>
              <th style={thStyle}>Stok</th>
              <th style={thStyle}>Fiyat</th>
              <th style={thStyle}>Durum</th>
              <th style={{ ...thStyle, textAlign: "right" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--color-gray-500)" }}>
                  Henüz ürün bulunmuyor. Yeni bir ürün ekleyerek başlayın.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isVariable = product.type === "VARIABLE";

                const stock = isVariable
                  ? product.variants.reduce((total, variant) => total + variant.stock, 0)
                  : product.stock;

                const priceLabel = isVariable
                  ? product.variants.length > 0
                    ? `${formatPrice(
                        Math.min(...product.variants.map((v) => Number(v.price)))
                      )} +`
                    : "—"
                  : formatPrice(Number(product.price));

                return (
                  <tr key={product.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            background: "var(--color-cream)",
                            borderRadius: "6px",
                            position: "relative",
                            border: "1px solid var(--color-border)",
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={product.images[0]?.url ?? FALLBACK_PRODUCT_IMAGE}
                            alt={product.name}
                            fill
                            sizes="48px"
                            style={{ objectFit: "contain", padding: "4px" }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--color-black)", marginBottom: "4px" }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                            {product.volume ? `${product.volume}ml` : "—"}
                            {product.sku ? ` · SKU: ${product.sku}` : ""}
                            {isVariable ? ` · ${product.variants.length} varyasyon` : ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "16px", color: "var(--color-gray-700)" }}>
                      {product.category?.name ?? "-"}
                    </td>

                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: stock === 0 ? "#DC2626" : stock < 10 ? "#D97706" : "var(--color-black)",
                        }}
                      >
                        {stock} adet
                      </span>
                    </td>

                    <td style={{ padding: "16px", fontWeight: 600, color: "var(--color-black)" }}>
                      {priceLabel}
                    </td>

                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          background: product.isActive ? "#D1FAE5" : "#FEE2E2",
                          color: product.isActive ? "#059669" : "#DC2626",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {product.isActive ? "Yayında" : "Pasif"}
                      </span>
                    </td>

                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <ProductRowActions
                        productId={product.id}
                        productName={product.name}
                        isActive={product.isActive}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
