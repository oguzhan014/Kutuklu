"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, CheckCircle2, ShoppingBag } from "lucide-react";

interface PurchaseNotification {
  id: string;
  customerName: string;
  city: string;
  productName: string;
  productSlug: string;
  volume: string;
  quantity: number;
  timeAgo: string;
  imageUrl: string;
}

const mockPurchases: PurchaseNotification[] = [
  {
    id: "p1",
    customerName: "Ahmet K.",
    city: "İzmir / Urla",
    productName: "Erken Hasat Soğuk Sıkım",
    productSlug: "erken-hasat-soguk-sikim-500ml",
    volume: "500 ml",
    quantity: 2,
    timeAgo: "3 dakika önce",
    imageUrl: "/images/products/erken-hasat.jpg",
  },
  {
    id: "p2",
    customerName: "Selin Y.",
    city: "İstanbul / Kadıköy",
    productName: "Gurme Limited Edition",
    productSlug: "gurme-limited-edition-750ml",
    volume: "750 ml",
    quantity: 1,
    timeAgo: "7 dakika önce",
    imageUrl: "/images/products/gurme.jpg",
  },
  {
    id: "p3",
    customerName: "Mustafa T.",
    city: "Ankara / Çankaya",
    productName: "Klasik Sızma Aile Boyu",
    productSlug: "klasik-sizma-5l-teneke",
    volume: "5 Litre Teneke",
    quantity: 1,
    timeAgo: "12 dakika önce",
    imageUrl: "/images/products/teneke-5l.jpg",
  },
  {
    id: "p4",
    customerName: "Zeynep B.",
    city: "Bursa / Nilüfer",
    productName: "Organik Sertifikalı Natürel",
    productSlug: "organik-sertifikali-500ml",
    volume: "500 ml",
    quantity: 3,
    timeAgo: "18 dakika önce",
    imageUrl: "/images/products/organik.jpg",
  },
  {
    id: "p5",
    customerName: "Emre D.",
    city: "Muğla / Bodrum",
    productName: "Erken Hasat Soğuk Sıkım",
    productSlug: "erken-hasat-soguk-sikim-500ml",
    volume: "500 ml",
    quantity: 2,
    timeAgo: "24 dakika önce",
    imageUrl: "/images/products/erken-hasat.jpg",
  },
];

export function SocialProofToast() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // İlk açılışta 5 saniye sonra ilk bildirimi göster
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4500);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  useEffect(() => {
    if (!isVisible || isDismissed) return;

    // 6.5 saniye ekranda kal, sonra gizlen
    const hideTimer = setTimeout(() => {
      setIsVisible(false);

      // 16 saniye sonra bir sonraki bildirimi aç
      const nextTimer = setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % mockPurchases.length);
        setIsVisible(true);
      }, 16000);

      return () => clearTimeout(nextTimer);
    }, 6500);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isDismissed, currentIdx]);

  if (isDismissed || !isVisible) return null;

  const purchase = mockPurchases[currentIdx];
  if (!purchase) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 90,
        maxWidth: 360,
        width: "calc(100vw - 48px)",
        animation: "slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className="glass-panel-dark"
        style={{
          borderRadius: "var(--radius-lg)",
          padding: "14px 16px",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(212, 175, 55, 0.3)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {/* Kapat Butonu */}
        <button
          onClick={() => {
            setIsVisible(false);
            setIsDismissed(true);
          }}
          aria-label="Bildirimi Kapat"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "none",
            border: "none",
            color: "rgba(245, 241, 232, 0.5)",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s",
          }}
        >
          <X size={14} />
        </button>

        {/* İkon / Görsel */}
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--color-green) 0%, #172a17 100%)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <ShoppingBag size={20} color="var(--color-gold)" />
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
            }}
            className="green-pulse-dot"
          />
        </div>

        {/* İçerik */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "2px",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--color-cream)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {purchase.customerName} ({purchase.city})
            </span>
            <CheckCircle2 size={12} color="var(--color-gold)" style={{ flexShrink: 0 }} />
          </div>

          <Link
            href={`/urunler/${purchase.productSlug}`}
            style={{
              textDecoration: "none",
              display: "block",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--color-gold-light)",
                fontWeight: 600,
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {purchase.quantity}x {purchase.productName} ({purchase.volume})
            </p>
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px",
              fontSize: "0.68rem",
              color: "rgba(245, 241, 232, 0.6)",
            }}
          >
            <span>{purchase.timeAgo}</span>
            <span>•</span>
            <span style={{ color: "#4ade80", fontWeight: 600 }}>Doğrulanmış Sipariş</span>
          </div>
        </div>
      </div>
    </div>
  );
}
