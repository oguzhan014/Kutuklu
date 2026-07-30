import { db } from "@/lib/db";
import { User } from "lucide-react";

export const metadata = {
  title: "Müşteriler | Kütüklü Admin",
};

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true }
      }
    }
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", margin: 0 }}>
          Müşteriler
        </h1>
      </div>

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid var(--color-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead style={{ background: "var(--color-gray-100)" }}>
            <tr>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Müşteri</th>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>E-posta</th>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Kayıt Tarihi</th>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Toplam Sipariş</th>
              <th style={{ padding: "16px", fontWeight: 600, color: "var(--color-gray-600)", borderBottom: "1px solid var(--color-border)" }}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--color-gray-500)" }}>
                  Henüz müşteri bulunmuyor.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 40, height: 40, background: "var(--color-cream)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-gold)" }}>
                      <User size={20} color="var(--color-gold)" />
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--color-black)" }}>
                      {customer.name || "İsimsiz Müşteri"}
                    </div>
                  </td>
                  <td style={{ padding: "16px", color: "var(--color-gray-700)" }}>{customer.email}</td>
                  <td style={{ padding: "16px", color: "var(--color-gray-500)" }}>
                    {new Date(customer.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td style={{ padding: "16px", fontWeight: 600, color: "var(--color-black)" }}>
                    {customer._count.orders} Adet
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ padding: "4px 8px", background: "#D1FAE5", color: "#059669", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                      Aktif
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
