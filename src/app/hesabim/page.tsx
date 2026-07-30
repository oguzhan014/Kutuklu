import Link from "next/link";
import type { Metadata } from "next";
import { Package, MapPin, User, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hesabım",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = {
  background: "var(--color-white)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
};

export default async function HesabimPage() {
  const user = await requireUser();

  const [orderCount, addressCount, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.address.count({ where: { userId: user.id } }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        accessToken: true,
        status: true,
        total: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    { label: "Toplam Sipariş", value: String(orderCount), icon: Package, href: "/hesabim/siparislerim" },
    { label: "Kayıtlı Adres", value: String(addressCount), icon: MapPin, href: "/hesabim/adreslerim" },
    { label: "Profil", value: "Düzenle", icon: User, href: "/hesabim/profil" },
  ];

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
        Genel Bakış
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
              <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "var(--color-cream)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-green)",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-black)" }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-black)" }}>
            Son Siparişleriniz
          </h2>
          <Link
            href="/hesabim/siparislerim"
            style={{
              fontSize: "0.85rem",
              color: "var(--color-green)",
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Tümü <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem" }}>
            Henüz siparişiniz bulunmuyor.{" "}
            <Link href="/urunler" style={{ color: "var(--color-green)", fontWeight: 600 }}>
              Alışverişe başlayın
            </Link>
            .
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/siparis/${order.orderNumber}?token=${encodeURIComponent(order.accessToken)}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--color-black)", fontSize: "0.9rem" }}>
                    {order.orderNumber}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                    {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: "var(--color-black)" }}>
                  {formatPrice(Number(order.total))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
