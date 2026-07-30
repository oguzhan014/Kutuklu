import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/pricing";
import { OrderManagePanel } from "@/components/admin/OrderManagePanel";

export const metadata = {
  title: "Sipariş Detayı | Kütüklü Admin",
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

const PAYMENT_LABELS: Record<string, string> = {
  UNPAID: "Ödenmedi",
  PAID: "Ödendi",
  REFUNDED: "İade Edildi",
};

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  padding: "24px",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) notFound();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        <Link
          href="/admin/orders"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "white",
            color: "var(--color-black)",
            border: "1px solid var(--color-border)",
          }}
        >
          <ArrowLeft size={18} />
        </Link>

        <h1 style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--color-black)", margin: 0 }}>
          {order.orderNumber}
        </h1>

        <span
          style={{
            padding: "5px 12px",
            background: order.status === "CANCELLED" ? "#FEE2E2" : "#E0E7FF",
            color: order.status === "CANCELLED" ? "#DC2626" : "#4338CA",
            borderRadius: "100px",
            fontSize: "0.78rem",
            fontWeight: 700,
          }}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>

        <span
          style={{
            padding: "5px 12px",
            background: order.paymentStatus === "PAID" ? "#D1FAE5" : "#FEF3C7",
            color: order.paymentStatus === "PAID" ? "#059669" : "#D97706",
            borderRadius: "100px",
            fontSize: "0.78rem",
            fontWeight: 700,
          }}
        >
          {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
          {order.paymentMethod === "transfer" ? " · Havale" : " · Kart"}
        </span>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}
        className="admin-order-grid"
      >
        {/* Sol: sipariş içeriği */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "18px" }}>
              Sipariş İçeriği
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "center",
                    paddingBottom: "14px",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      background: "var(--color-cream)",
                      borderRadius: "6px",
                      position: "relative",
                      flexShrink: 0,
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <Image
                      src={item.productImage ?? FALLBACK_PRODUCT_IMAGE}
                      alt={item.productName}
                      fill
                      sizes="52px"
                      style={{ objectFit: "contain", padding: "5px" }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--color-black)", fontSize: "0.92rem" }}>
                      {item.productSlug ? (
                        <Link
                          href={`/urunler/${item.productSlug}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {item.productName}
                        </Link>
                      ) : (
                        item.productName
                      )}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                      {item.variantLabel
                        ? `${item.variantLabel} · `
                        : item.productVolume
                          ? `${item.productVolume}ml · `
                          : ""}
                      {item.productSku ? `SKU: ${item.productSku} · ` : ""}
                      {item.quantity} × {formatPrice(Number(item.unitPrice))}
                    </div>
                  </div>

                  <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {formatPrice(Number(item.totalPrice))}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "0.9rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-gray-600)" }}>
                <span>Ara Toplam</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-green)" }}>
                  <span>İndirim {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-{formatPrice(Number(order.discountAmount))}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-gray-600)" }}>
                <span>Kargo</span>
                <span>
                  {Number(order.shippingCost) === 0
                    ? "Ücretsiz"
                    : formatPrice(Number(order.shippingCost))}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--color-border)",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "var(--color-black)",
                }}
              >
                <span>Toplam</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Müşteri & adres */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="admin-address-grid">
            <div style={cardStyle}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "14px" }}>
                Teslimat Adresi
              </h2>
              <div style={{ fontSize: "0.88rem", color: "var(--color-gray-700)", lineHeight: 1.8 }}>
                <strong>{order.shippingName}</strong>
                <br />
                {order.shippingPhone}
                <br />
                {order.guestEmail}
                <br />
                <span style={{ display: "block", marginTop: "8px" }}>
                  {order.shippingAddress}
                  <br />
                  {order.shippingDistrict} / {order.shippingCity}
                  {order.shippingPostalCode ? ` · ${order.shippingPostalCode}` : ""}
                </span>
              </div>

              {order.notes && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "10px 12px",
                    background: "var(--color-gray-100)",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    color: "var(--color-gray-700)",
                  }}
                >
                  <strong>Müşteri notu:</strong> {order.notes}
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "14px" }}>
                Fatura Bilgileri
              </h2>
              <div style={{ fontSize: "0.88rem", color: "var(--color-gray-700)", lineHeight: 1.8 }}>
                {order.billingSameAsShipping ? (
                  <span style={{ color: "var(--color-gray-500)" }}>
                    Teslimat adresi ile aynı
                  </span>
                ) : (
                  <>
                    <strong>{order.billingFullName}</strong>
                    <br />
                    {order.billingAddress}
                    <br />
                    {order.billingDistrict} / {order.billingCity}
                    {order.billingPostalCode ? ` · ${order.billingPostalCode}` : ""}
                  </>
                )}

                {(order.billingTaxId || order.billingCompany) && (
                  <div style={{ marginTop: "10px" }}>
                    {order.billingCompany && (
                      <>
                        <strong>Şirket:</strong> {order.billingCompany}
                        <br />
                      </>
                    )}
                    {order.billingTaxId && (
                      <>
                        <strong>TC/Vergi No:</strong> {order.billingTaxId}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--color-border)",
                  fontSize: "0.8rem",
                  color: "var(--color-gray-500)",
                  lineHeight: 1.8,
                }}
              >
                <div>
                  Sipariş tarihi:{" "}
                  {new Date(order.createdAt).toLocaleString("tr-TR", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </div>
                {order.paidAt && (
                  <div>
                    Ödeme tarihi:{" "}
                    {new Date(order.paidAt).toLocaleString("tr-TR", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </div>
                )}
                {order.stripePaymentId && <div>Stripe: {order.stripePaymentId}</div>}
                <div>Üyelik: {order.user ? order.user.email : "Misafir sipariş"}</div>
                <div>Stok rezervasyonu: {order.stockReserved ? "Aktif" : "Serbest"}</div>
              </div>
            </div>
          </div>

          {order.adminNote && (
            <div
              style={{
                ...cardStyle,
                background: "#FFFBEB",
                borderColor: "#FCD34D",
              }}
            >
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "10px", color: "#92400E" }}>
                Sistem / Yönetici Notları
              </h2>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: "0.82rem",
                  color: "#92400E",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {order.adminNote}
              </pre>
            </div>
          )}
        </div>

        {/* Sağ: yönetim */}
        <OrderManagePanel
          orderId={order.id}
          currentStatus={order.status}
          paymentMethod={order.paymentMethod}
          paymentStatus={order.paymentStatus}
          shippingCarrier={order.shippingCarrier}
          trackingNumber={order.trackingNumber}
          adminNote={order.adminNote}
        />
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .admin-order-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          .admin-address-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
