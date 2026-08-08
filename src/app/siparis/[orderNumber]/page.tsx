import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  PackageCheck,
  Landmark,
  AlertCircle,
  Download,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";
import { OrderCancelButton } from "@/components/siparis/OrderCancelButton";
import { getOrderForViewer, reconcileOrderPayment } from "@/lib/order-access";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sipariş Detayı",
  robots: { index: false, follow: false },
};

// Sipariş sayfası kişiye özeldir; asla önbelleğe alınmaz.
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REFUNDED: "İade Edildi",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderNumber } = await params;
  const { token } = await searchParams;

  const access = await getOrderForViewer(orderNumber, token);

  if (!access.ok) {
    // "Bulunamadı" ile "yetkisiz" ayrımı yapılmaz: sipariş numarasının var olup
    // olmadığı bilgisi bile sızdırılmaz.
    notFound();
  }

  let order = access.order;

  // Bildirim henüz ulaşmadıysa ödeme durumunu PayTR'ye sorarak doğrula.
  if (order.paymentStatus === "UNPAID" && order.paymentMethod === "card") {
    const updated = await reconcileOrderPayment(order);
    if (updated) {
      const refreshed = await getOrderForViewer(orderNumber, token);
      if (refreshed.ok) order = refreshed.order;
    }
  }

  const settings = await getSettings();
  const isPaid = order.paymentStatus === "PAID";
  const isCancelled = order.status === "CANCELLED";
  const awaitingTransfer =
    order.paymentMethod === "transfer" && order.paymentStatus === "UNPAID" && !isCancelled;
  const awaitingCard =
    order.paymentMethod === "card" && order.paymentStatus === "UNPAID" && !isCancelled;

  return (
    <>
      <Navbar />

      {/* Sipariş oluştuğuna göre sepet boşaltılabilir. */}
      {!isCancelled && <ClearCartOnMount />}

      <main style={{ background: "var(--color-gray-100)", minHeight: "80vh", padding: "48px 0" }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          {/* Durum başlığı */}
          <div
            style={{
              background: "var(--color-white)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              padding: "40px 32px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              {isCancelled ? (
                <XCircle size={64} color="#DC2626" strokeWidth={1.5} />
              ) : isPaid ? (
                <CheckCircle2 size={64} color="var(--color-green)" strokeWidth={1.5} />
              ) : (
                <Clock size={64} color="var(--color-gold)" strokeWidth={1.5} />
              )}
            </div>

            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "2rem",
                fontWeight: 600,
                color: "var(--color-black)",
                marginBottom: "12px",
              }}
            >
              {isCancelled
                ? "Siparişiniz İptal Edildi"
                : isPaid
                  ? "Siparişiniz Alındı"
                  : awaitingTransfer
                    ? "Ödemeniz Bekleniyor"
                    : "Ödeme Doğrulanıyor"}
            </h1>

            <p style={{ color: "var(--color-gray-600)", marginBottom: "20px", lineHeight: 1.7 }}>
              {isCancelled ? (
                "Bu sipariş iptal edilmiştir. Tahsil edilen bir tutar varsa iade sürecine alınmıştır."
              ) : isPaid ? (
                <>
                  Ödemeniz onaylandı. Siparişiniz hazırlanmaya başlandı ve kargoya
                  verildiğinde bilgilendirileceksiniz.
                </>
              ) : awaitingTransfer ? (
                "Siparişiniz oluşturuldu. Aşağıdaki hesaba havale/EFT yaptığınızda siparişiniz hazırlanmaya başlanacak."
              ) : (
                "Ödemeniz işleniyor. Bu işlem birkaç saniye sürebilir; sayfayı yenileyerek durumu kontrol edebilirsiniz."
              )}
            </p>

            <div
              style={{
                display: "inline-flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "12px",
                fontSize: "0.9rem",
              }}
            >
              <span
                style={{
                  background: "var(--color-cream)",
                  padding: "8px 16px",
                  borderRadius: "100px",
                  fontWeight: 600,
                  color: "var(--color-black)",
                }}
              >
                Sipariş No: {order.orderNumber}
              </span>
              <span
                style={{
                  background: "var(--color-gray-100)",
                  padding: "8px 16px",
                  borderRadius: "100px",
                  fontWeight: 600,
                  color: "var(--color-gray-600)",
                }}
              >
                Durum: {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
          </div>

          {/* Sipariş iptali — yalnızca henüz kargoya verilmemiş siparişlerde */}
          {order.status === "PENDING" && (
            <OrderCancelButton orderNumber={order.orderNumber} token={token} />
          )}

          {/* Havale bilgileri */}
          {awaitingTransfer && (
            <div
              style={{
                background: "var(--color-cream)",
                border: "1px solid var(--color-gold)",
                borderRadius: "var(--radius-lg)",
                padding: "28px 32px",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  marginBottom: "16px",
                }}
              >
                <Landmark size={20} /> Havale / EFT Bilgileri
              </h2>
              <div style={{ fontSize: "0.92rem", color: "var(--color-gray-700)", lineHeight: 1.9 }}>
                <div>
                  <strong>Banka:</strong> {settings["bank.name"]}
                </div>
                <div>
                  <strong>Alıcı:</strong> {settings["bank.accountHolder"]}
                </div>
                <div>
                  <strong>IBAN:</strong> {settings["bank.iban"]}
                </div>
                <div>
                  <strong>Tutar:</strong> {formatPrice(Number(order.total))}
                </div>
              </div>
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "rgba(212,175,55,0.15)",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  color: "var(--color-gray-700)",
                }}
              >
                Havale açıklamasına mutlaka <strong>{order.orderNumber}</strong> sipariş
                numaranızı yazınız.
              </div>
            </div>
          )}

          {awaitingCard && (
            <div
              style={{
                background: "#FEF3C7",
                border: "1px solid #FCD34D",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
                marginBottom: "24px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                fontSize: "0.9rem",
                color: "#92400E",
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                Ödemeniz henüz onaylanmadı. Bankanızdan onay geldiğinde bu sayfa
                güncellenecektir. Tutar kartınızdan çekildiği hâlde durum değişmezse{" "}
                {settings["store.email"]} adresinden bize ulaşın.
              </div>
            </div>
          )}

          {/* Kargo takibi */}
          {order.trackingNumber && (
            <div
              style={{
                background: "var(--color-white)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "24px 32px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <Truck size={24} color="var(--color-green)" />
              <div style={{ fontSize: "0.92rem", color: "var(--color-gray-700)" }}>
                <strong>{order.shippingCarrier ?? "Kargo"}</strong> ile gönderildi ·
                Takip No: <strong>{order.trackingNumber}</strong>
              </div>
            </div>
          )}

          {/* Sipariş içeriği */}
          <div
            style={{
              background: "var(--color-white)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              padding: "32px",
              marginBottom: "24px",
            }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "var(--font-heading)",
                fontSize: "1.3rem",
                fontWeight: 600,
                color: "var(--color-black)",
                marginBottom: "24px",
              }}
            >
              <PackageCheck size={20} /> Sipariş İçeriği
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    paddingBottom: "18px",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      background: "var(--color-cream)",
                      borderRadius: "8px",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {item.productImage && (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        style={{ objectFit: "contain", padding: "6px" }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--color-black)", marginBottom: "4px" }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--color-gray-500)" }}>
                      {item.variantLabel
                        ? `${item.variantLabel} · `
                        : item.productVolume
                          ? `${item.productVolume}ml · `
                          : ""}
                      {item.quantity} adet × {formatPrice(Number(item.unitPrice))}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--color-black)", whiteSpace: "nowrap" }}>
                    {formatPrice(Number(item.totalPrice))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tutarlar */}
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "0.92rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-gray-600)" }}>
                <span>Ara Toplam</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "var(--color-green)",
                    fontWeight: 600,
                  }}
                >
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
                  alignItems: "center",
                  paddingTop: "14px",
                  marginTop: "6px",
                  borderTop: "1px solid var(--color-border)",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: "var(--color-black)",
                }}
              >
                <span>Toplam</span>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem" }}>
                  {formatPrice(Number(order.total))}
                </span>
              </div>
            </div>
          </div>

          {/* Teslimat bilgileri */}
          <div
            style={{
              background: "var(--color-white)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              padding: "32px",
              marginBottom: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.3rem",
                fontWeight: 600,
                color: "var(--color-black)",
                marginBottom: "16px",
              }}
            >
              Teslimat Bilgileri
            </h2>
            <div style={{ fontSize: "0.92rem", color: "var(--color-gray-700)", lineHeight: 1.9 }}>
              <div>
                <strong>{order.shippingName}</strong>
              </div>
              <div>{order.shippingPhone}</div>
              <div>{order.guestEmail}</div>
              <div style={{ marginTop: "8px" }}>
                {order.shippingAddress}
                <br />
                {order.shippingDistrict} / {order.shippingCity}
                {order.shippingPostalCode ? ` · ${order.shippingPostalCode}` : ""}
              </div>
              {order.notes && (
                <div style={{ marginTop: "12px", color: "var(--color-gray-600)" }}>
                  <strong>Sipariş notu:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {isPaid && (
              <a
                href={`/api/invoices/${order.orderNumber}/download`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--color-gold)",
                  color: "white",
                  padding: "12px 28px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                <Download size={16} />
                Faturayı İndir
              </a>
            )}
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
              Alışverişe Devam Et
            </Link>
            <Link
              href="/hesabim/siparislerim"
              style={{
                background: "var(--color-white)",
                color: "var(--color-black)",
                border: "1px solid var(--color-border)",
                padding: "12px 28px",
                borderRadius: "4px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              Siparişlerim
            </Link>
          </div>

          <p
            style={{
              textAlign: "center",
              marginTop: "24px",
              fontSize: "0.8rem",
              color: "var(--color-gray-500)",
            }}
          >
            Bu sayfanın bağlantısını saklayın — siparişinizin durumunu buradan takip
            edebilirsiniz.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
