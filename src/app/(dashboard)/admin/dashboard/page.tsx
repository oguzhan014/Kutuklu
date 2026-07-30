import { Metadata } from "next";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Kütüklü Zeytinyağı yönetim paneli ana ekranı",
};

export default async function DashboardPage() {
  // DB'den verileri çekme
  const productCount = await db.product.count({ where: { isActive: true } });
  const orderCount = await db.order.count();
  const customerCount = await db.user.count({ where: { role: "CUSTOMER" } });
  
  // Toplam Gelir (Ödenen siparişler)
  const completedOrders = await db.order.findMany({
    where: { paymentStatus: "PAID" } // Prisma PaymentStatus enum'una göre
  });
  const totalSales = completedOrders.reduce((acc, order) => acc + Number(order.total), 0);

  // Son 5 Sipariş
  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  const stats = [
    { name: "Toplam Satış", value: formatPrice(totalSales), icon: DollarSign, trend: "Güncel", color: "var(--color-green)" },
    { name: "Siparişler", value: orderCount.toString(), icon: ShoppingBag, trend: "Tümü", color: "#3B82F6" },
    { name: "Aktif Ürünler", value: productCount.toString(), icon: Package, trend: "Yayında", color: "#F59E0B" },
    { name: "Müşteriler", value: customerCount.toString(), icon: Users, trend: "Kayıtlı", color: "#8B5CF6" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "24px" }}>
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid var(--color-border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "8px", fontWeight: 500 }}>{stat.name}</p>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--color-black)", margin: 0 }}>{stat.value}</h3>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Placeholder */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid var(--color-border)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "16px" }}>Son Siparişler</h2>
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead style={{ background: "var(--color-gray-100)" }}>
              <tr>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Sipariş No</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Müşteri</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Tarih</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Tutar</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "var(--color-gray-500)" }}>
                    Henüz hiç sipariş bulunmuyor.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, index) => {
                  const isLast = index === recentOrders.length - 1;
                  return (
                    <tr key={order.id} style={{ borderBottom: isLast ? "none" : "1px solid var(--color-border)" }}>
                      <td style={{ padding: "12px 16px", color: "var(--color-black)", fontWeight: 500 }}>{order.orderNumber}</td>
                      <td style={{ padding: "12px 16px", color: "var(--color-gray-700)" }}>{order.user?.name || order.guestEmail || "İsimsiz"}</td>
                      <td style={{ padding: "12px 16px", color: "var(--color-gray-500)" }}>
                        {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-black)", fontWeight: 500 }}>{formatPrice(Number(order.total))}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ 
                          padding: "4px 8px", 
                          background: order.status === "PENDING" ? "#FEF3C7" : order.status === "DELIVERED" ? "#D1FAE5" : "#E0E7FF", 
                          color: order.status === "PENDING" ? "#D97706" : order.status === "DELIVERED" ? "#059669" : "#4338CA", 
                          borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 
                        }}>
                          {order.status === "PENDING" ? "Bekliyor" : order.status === "PROCESSING" ? "Hazırlanıyor" : order.status === "SHIPPED" ? "Kargolandı" : order.status === "DELIVERED" ? "Teslim Edildi" : order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
