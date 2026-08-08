"use client";

import { ArrowLeft, Lock } from "lucide-react";
import { formatPrice } from "@/lib/utils";

/**
 * KART ÖDEME ADIMI — PayTR
 *
 * Kart bilgileri PayTR'nin kendi iframe'inde toplanır ve doğrudan PayTR'ye
 * gönderilir. Kart numarası:
 *   - bu React ağacına hiç girmez,
 *   - bizim sunucumuza hiç ulaşmaz,
 *   - hiçbir log'a düşmez.
 * Bu sayede sistem PCI-DSS SAQ-A kapsamında kalır.
 *
 * `iframeUrl` yalnızca ilgili ödemeyi başlatma yetkisi verir; tutarı değiştirme
 * yetkisi VERMEZ. Tutar sunucuda belirlendi, PayTR'ye imzalı gönderildi ve
 * bildirimde yeniden doğrulanıyor.
 */

type Props = {
  iframeUrl: string;
  orderNumber: string;
  total: number;
  onBack: () => void;
};

export function PayTRPaymentStep({ iframeUrl, orderNumber, total, onBack }: Props) {
  return (
    <div style={{ background: "var(--color-gray-100)", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: "640px" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            color: "var(--color-gray-600)",
            cursor: "pointer",
            fontSize: "0.9rem",
            marginBottom: "24px",
            padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Adres bilgilerine dön
        </button>

        <div
          style={{
            background: "var(--color-white)",
            padding: "32px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.6rem",
                fontWeight: 600,
                color: "var(--color-black)",
                marginBottom: "8px",
              }}
            >
              Ödeme
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)" }}>
              Sipariş No: <strong>{orderNumber}</strong>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              background: "var(--color-cream)",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--color-black)" }}>Ödenecek Tutar</span>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.6rem",
                fontWeight: 600,
                color: "var(--color-black)",
              }}
            >
              {formatPrice(total)}
            </span>
          </div>

          {/*
            PayTR güvenli ödeme formu. Yükseklik sabit verilir; PayTR'nin
            iframeResizer betiği harici kaynak olduğu için yüklenmez, bunun
            yerine iframe kendi içinde kaydırılır.
          */}
          <iframe
            src={iframeUrl}
            title="PayTR güvenli ödeme formu"
            style={{
              width: "100%",
              minHeight: "600px",
              border: "none",
              display: "block",
            }}
          />

          <p
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginTop: "16px",
              fontSize: "0.75rem",
              color: "var(--color-gray-500)",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            <Lock size={13} />
            Kart bilgileriniz PayTR tarafından şifrelenerek işlenir ve
            sunucularımızda saklanmaz.
          </p>
        </div>
      </div>
    </div>
  );
}
