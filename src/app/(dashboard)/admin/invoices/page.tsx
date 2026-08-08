import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { formatPrice } from "@/lib/utils";
import { Pagination } from "@/components/admin/Pagination";
import { ADMIN_PAGE_SIZE, countPages, resolvePage } from "@/lib/pagination";

export const metadata = {
  title: "Faturalar | Yönetim Paneli",
};

export const dynamic = "force-dynamic";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();

  const { page: rawPage } = await searchParams;

  const totalItems = await prisma.invoice.count();
  const totalPages = countPages(totalItems);
  const page = resolvePage(rawPage, totalPages);

  const invoices = await prisma.invoice.findMany({
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          guestEmail: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  return (
    <div style={{ padding: "24px" }}>
      <Link
        href="/admin"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "#666",
          textDecoration: "none",
          marginBottom: "24px",
          fontSize: "0.9rem",
        }}
      >
        <ArrowLeft size={16} />
        Yönetim Paneli'ne Dön
      </Link>

      <h1 style={{ marginBottom: "24px", fontSize: "1.8rem", fontWeight: 600 }}>
        Faturalar ({totalItems})
      </h1>

      {invoices.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "8px",
            textAlign: "center",
            color: "#999",
          }}
        >
          Henüz fatura yok.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "0.9rem" }}>
                  Fatura No
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "0.9rem" }}>
                  Sipariş
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "0.9rem" }}>
                  Müşteri
                </th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, fontSize: "0.9rem" }}>
                  Tutar
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "0.9rem" }}>
                  Tarih
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "0.9rem" }}>
                  Durum
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, fontSize: "0.9rem" }}>
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", fontSize: "0.9rem", fontWeight: 500 }}>
                    {invoice.invoiceNumber}
                  </td>
                  <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                    <Link
                      href={`/admin/orders/${invoice.order.id}`}
                      style={{ color: "#0066cc", textDecoration: "none" }}
                    >
                      {invoice.order.orderNumber}
                    </Link>
                  </td>
                  <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                    <div>{invoice.order.user?.name || "Misafir"}</div>
                    <div style={{ fontSize: "0.8rem", color: "#999" }}>
                      {invoice.order.user?.email || invoice.order.guestEmail}
                    </div>
                  </td>
                  <td style={{ padding: "12px", fontSize: "0.9rem", fontWeight: 500, textAlign: "right" }}>
                    {formatPrice(Number(invoice.order.total))}
                  </td>
                  <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                    {new Date(invoice.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        background:
                          invoice.status === "sent"
                            ? "#d1fae5"
                            : invoice.status === "viewed"
                              ? "#dbeafe"
                              : "#f3f4f6",
                        color:
                          invoice.status === "sent"
                            ? "#065f46"
                            : invoice.status === "viewed"
                              ? "#0c4a6e"
                              : "#374151",
                      }}
                    >
                      {invoice.status === "generated"
                        ? "Oluşturuldu"
                        : invoice.status === "sent"
                          ? "Gönderildi"
                          : "Görüntülendi"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <a
                      href={`/api/invoices/${invoice.order.orderNumber}/download`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#0066cc",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                      }}
                    >
                      <Download size={14} />
                      İndir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        basePath="/admin/invoices"
        itemLabel="fatura"
      />
    </div>
  );
}
