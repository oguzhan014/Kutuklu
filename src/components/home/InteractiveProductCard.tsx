"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Check, ArrowRight, Sparkles, Droplets } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useWishlistHydrated } from "@/lib/use-wishlist-hydrated";

export type FeaturedProductData = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  price: number;
  comparePrice: number | null;
  priceIsRange: boolean;
  imageUrl: string;
  secondaryImageUrl?: string | null;
  badge: string | null;
  badgeColor: string | null;
  rating: number;
  reviewCount: number;
  stock: number;
  harvestType?: string;
  volume?: number | null;
  acidRatio?: string;
  polyphenol?: string;
};

// Ürün tipine göre tadım ve karakteristik notları
function getTasteProfile(harvestType?: string, name?: string) {
  const lowerName = (name || "").toLowerCase();
  if (harvestType === "EARLY_HARVEST" || lowerName.includes("erken hasat")) {
    return {
      fruitiness: "Yoğun",
      pungency: "Belirgin",
      acid: "≤ %0.28",
      note: "Yeşil elma & taze çimen aroması",
    };
  }
  if (harvestType === "ORGANIC" || lowerName.includes("organik")) {
    return {
      fruitiness: "Dengeli",
      pungency: "Yumuşak",
      acid: "≤ %0.3",
      note: "Sertifikalı organik, saf Ege lezzeti",
    };
  }
  if (harvestType === "GOURMET" || lowerName.includes("gurme") || lowerName.includes("limited")) {
    return {
      fruitiness: "Zengin",
      pungency: "Güçlü",
      acid: "≤ %0.25",
      note: "Özel tek bahçe seçkisi, yüksek polifenol",
    };
  }
  return {
    fruitiness: "Dengeli",
    pungency: "Hafif",
    acid: "≤ %0.5",
    note: "Sofralık ve sıcak yemekler için ideal",
  };
}

export function InteractiveProductCard({ product }: { product: FeaturedProductData }) {
  const { addItem } = useCartStore();
  const { items: wishlistItems, toggleItem } = useWishlistStore();
  const wishlistHydrated = useWishlistHydrated();
  
  const [isAdded, setIsAdded] = useState(false);
  const [showTasteModal, setShowTasteModal] = useState(false);

  const isFavorite = wishlistHydrated && wishlistItems.some((i) => i.productId === product.id);
  const tasteProfile = getTasteProfile(product.harvestType, product.name);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      volume: product.volume || 500,
      imageUrl: product.imageUrl,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      priceIsRange: product.priceIsRange,
      imageUrl: product.imageUrl,
      volume: product.volume ?? null,
    });
  };

  return (
    <div
      className="interactive-product-card"
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* ── Üst Görsel Alanı ── */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(145deg, #F8F5EC 0%, #EFE9D9 100%)",
          height: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Rozet (Badge) */}
        {product.badge && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 3,
              background: product.badgeColor ?? "var(--color-gold)",
              color:
                !product.badgeColor || product.badgeColor === "var(--color-gold)"
                  ? "var(--color-black)"
                  : "var(--color-cream)",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {product.badge}
          </div>
        )}

        {/* Tükendi Rozeti */}
        {product.stock <= 0 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 3,
              background: "#DC2626",
              color: "white",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "4px 9px",
              borderRadius: "4px",
            }}
          >
            TÜKENDİ
          </div>
        )}

        {/* Favori Butonu */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          style={{
            position: "absolute",
            top: 12,
            right: product.stock <= 0 ? 80 : 12,
            zIndex: 3,
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(212, 175, 55, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            color: isFavorite ? "#DC2626" : "var(--color-gray-600)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
          className="wishlist-btn"
        >
          <Heart size={16} fill={isFavorite ? "#DC2626" : "none"} strokeWidth={2} />
        </button>

        {/* Ürün Görseli (Zoom Efekti ile) */}
        <Link
          href={`/urunler/${product.slug}`}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="product-img-zoom"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 280px"
              style={{ objectFit: "contain", padding: "20px" }}
            />
          </div>
        </Link>

        {/* Hızlı Aksiyonlar (Hover durumunda beliren cam katman) */}
        <div
          className="product-quick-actions"
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            right: 12,
            zIndex: 4,
            opacity: 0,
            transform: "translateY(8px)",
            transition: "all 0.25s ease",
            display: "flex",
            gap: "8px",
          }}
        >
          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            style={{
              flex: 1,
              background: isAdded ? "var(--color-gold)" : "var(--color-green)",
              color: isAdded ? "var(--color-black)" : "var(--color-cream)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "10px 12px",
              fontSize: "0.76rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              cursor: product.stock <= 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
              transition: "all 0.2s ease",
            }}
          >
            {isAdded ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                Sepete Eklendi
              </>
            ) : product.stock <= 0 ? (
              "Stokta Yok"
            ) : (
              <>
                <ShoppingCart size={14} />
                Hızlı Ekle
              </>
            )}
          </button>

          {/* Tadım Notu Açma Butonu */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTasteModal(!showTasteModal);
            }}
            title="Tadım & Karakter Notu"
            style={{
              width: 38,
              height: 38,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--color-green)",
            }}
          >
            <Droplets size={16} color="var(--color-gold-dark)" />
          </button>
        </div>

        {/* Tadım Notları Mini Popover */}
        {showTasteModal && (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              position: "absolute",
              inset: 10,
              background: "rgba(28, 28, 28, 0.94)",
              backdropFilter: "blur(10px)",
              borderRadius: "var(--radius-md)",
              zIndex: 5,
              padding: "16px",
              color: "var(--color-cream)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              animation: "fadeInUp 0.2s ease",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-gold)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Tadım & Karakter
                </span>
                <button
                  onClick={() => setShowTasteModal(false)}
                  style={{ background: "none", border: "none", color: "var(--color-cream)", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                <div><strong style={{ color: "var(--color-gold-light)" }}>Meyvemsilik:</strong> {tasteProfile.fruitiness}</div>
                <div><strong style={{ color: "var(--color-gold-light)" }}>Yakıcılık:</strong> {tasteProfile.pungency}</div>
                <div><strong style={{ color: "var(--color-gold-light)" }}>Asitlik:</strong> {tasteProfile.acid}</div>
                <div><strong style={{ color: "var(--color-gold-light)" }}>Hasat:</strong> 2026 Erken</div>
              </div>

              <p style={{ fontSize: "0.7rem", color: "rgba(245,241,232,0.8)", fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "6px" }}>
                &ldquo;{tasteProfile.note}&rdquo;
              </p>
            </div>

            <Link
              href={`/urunler/${product.slug}`}
              style={{
                fontSize: "0.7rem",
                color: "var(--color-gold)",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                justifyContent: "flex-end",
              }}
            >
              Detaylı Rapor <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* ── Alt Bilgi Alanı ── */}
      <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Puan & Değerlendirme */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "6px",
            minHeight: "18px",
          }}
        >
          {product.reviewCount > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ display: "flex", gap: "2px" }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={11}
                    color="var(--color-gold)"
                    fill={index < Math.round(product.rating) ? "var(--color-gold)" : "none"}
                  />
                ))}
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", fontWeight: 500 }}>
                ({product.reviewCount})
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Sparkles size={11} color="var(--color-gold)" />
              <span style={{ fontSize: "0.7rem", color: "var(--color-gold-dark)", fontWeight: 600 }}>
                2026 Yeni Hasat
              </span>
            </div>
          )}

          {/* Asitlik Mikro Etiketi */}
          <span
            style={{
              fontSize: "0.68rem",
              background: "var(--color-cream)",
              color: "var(--color-green)",
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: "3px",
              border: "1px solid var(--color-border)",
            }}
          >
            {tasteProfile.acid} Asit
          </span>
        </div>

        {/* Ürün İsmi */}
        <Link href={`/urunler/${product.slug}`} style={{ textDecoration: "none" }}>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.18rem",
              fontWeight: 600,
              color: "var(--color-black)",
              marginBottom: "4px",
              lineHeight: 1.25,
              transition: "color 0.2s",
            }}
            className="product-title-hover"
          >
            {product.name}
          </h3>
        </Link>

        {/* Kısa Açıklama */}
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--color-gray-500)",
            lineHeight: 1.5,
            marginBottom: "16px",
          }}
        >
          {product.shortDesc}
        </p>

        {/* Fiyat & İncele Butonu */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "8px",
            paddingTop: "12px",
            borderTop: "1px solid var(--color-gray-200)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {product.priceIsRange && (
              <span style={{ fontSize: "0.65rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>
                Başlayan fiyatla
              </span>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "var(--color-black)",
                }}
              >
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-gray-400)",
                    textDecoration: "line-through",
                  }}
                >
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/urunler/${product.slug}`}
            style={{
              background: "var(--color-cream)",
              color: "var(--color-green)",
              border: "1px solid var(--color-green)",
              borderRadius: "var(--radius-sm)",
              padding: "7px 12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.75rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            className="btn-outline-hover"
          >
            İncele <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
