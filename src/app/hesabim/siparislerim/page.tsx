import Link from "next/link";
import type { Metadata } from "next";
import { Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Siparişlerim",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REFUNDED: "İade Edildi",
};

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  PENDING: { bg: "#FEF3C7", fg: "#D97706" },
  PROCESSING: { bg: "#E0E7FF", fg: "#4338CA" },
  SHIPPED: { bg: "#DBEAFE", fg: "#1D4ED8" },
  DELIVERED: { bg: "#D1FAE5", fg: "#059669" },
  CANCELLED: { bg: "#FEE2E2", fg: "#DC2626" },
  REFUNDED: { bg: "#F3F4F6", fg: "#6B7280" },
};

export default async function SiparislerimPage() {
  const user = await requireUser();

  // Sorgu daima userId ile sınırlı — başkasının siparişi listelenemez.
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { id: true, productName: true, quantity: true } } },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.8rem",
          fontWeight: 600,
          color: "var(--color-black)",
        }}
      >
        Siparişlerim
      </h1>

      {orders.length === 0 ? (
        <div
          style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <Package size={48} color="var(--color-gray-400)" strokeWidth={1.5} />
          <p style={{ color: "var(--color-gray-600)", margin: "16px 0 20px" }}>
            Henüz bir siparişiniz bulunmuyor.
          </p>
          <Link
            href="/urunler"
            style={{
              background: "var(--color-green)",
              color: "white",
              padding: "12px 28px",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map((order) => {
            const colors = STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING!;

            return (
              <div
                key={order.id}
                style={{
                  background: "var(--color-white)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--color-black)" }}>
                      {order.orderNumber}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--color-gray-500)" }}>
                      {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "6px 12px",
                      background: colors.bg,
                      color: colors.fg,
                      borderRadius: "100px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-gray-600)",
                    marginBottom: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  {order.items
                    .map((item) => `${item.productName} × ${item.quantity}`)
                    .join(" · ")}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.3rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                    }}
                  >
                    {formatPrice(Number(order.total))}
                  </span>

                  <Link
                    href={`/siparis/${order.orderNumber}?token=${encodeURIComponent(order.accessToken)}`}
                    style={{
                      background: "var(--color-white)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-black)",
                      padding: "9px 20px",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Detay
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
