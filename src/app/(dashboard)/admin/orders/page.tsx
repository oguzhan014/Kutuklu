import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/components/admin/Pagination";
import { ADMIN_PAGE_SIZE, countPages, resolvePage } from "@/lib/pagination";

export const metadata = {
  title: "Siparişler | Kütüklü Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;

  const totalItems = await db.order.count();
  const totalPages = countPages(totalItems);
  const page = resolvePage(rawPage, totalPages);

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", margin: 0 }}>
          Siparişler
        </h1>
      </div>

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid var(--color-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead style={{ background: "var(--color-gray-100)" }}>
            <tr>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Sipariş No</th>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Müşteri</th>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Tarih</th>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Tutar</th>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Durum</th>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)", textAlign: "right" }}>Detay</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--color-gray-500)" }}>
                  Henüz hiç sipariş bulunmuyor.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "16px", color: "var(--color-black)", fontWeight: 500 }}>{order.orderNumber}</td>
                  <td style={{ padding: "16px", color: "var(--color-gray-700)" }}>
                    <div style={{ fontWeight: 500, color: "var(--color-black)" }}>{order.user?.name || order.guestEmail || "İsimsiz Müşteri"}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>{order.user?.email || order.guestEmail}</div>
                  </td>
                  <td style={{ padding: "16px", color: "var(--color-gray-500)" }}>
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: "16px", fontWeight: 600, color: "var(--color-black)" }}>
                    {formatPrice(Number(order.total))}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: order.status === "PENDING" ? "#FEF3C7" : order.status === "DELIVERED" ? "#D1FAE5" : "#E0E7FF", 
                      color: order.status === "PENDING" ? "#D97706" : order.status === "DELIVERED" ? "#059669" : "#4338CA", 
                      borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 
                    }}>
                      {order.status === "PENDING" ? "Bekliyor" : order.status === "PROCESSING" ? "Hazırlanıyor" : order.status === "SHIPPED" ? "Kargolandı" : order.status === "DELIVERED" ? "Teslim Edildi" : order.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <Link href={`/admin/orders/${order.id}`} style={{ padding: "6px", color: "var(--color-gray-500)", background: "var(--color-gray-100)", borderRadius: "4px", display: "inline-flex" }}>
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        basePath="/admin/orders"
        itemLabel="sipariş"
      />
    </div>
  );
}
