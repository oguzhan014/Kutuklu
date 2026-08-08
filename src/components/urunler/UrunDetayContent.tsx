"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Truck,
  Leaf,
  Thermometer,
  Check,
  AlertCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  Award,
  PackageCheck,
  Share2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import { useWishlist } from "@/lib/use-wishlist";
import { formatVariantLabel } from "@/lib/variants";
import { ProductReviews, type PublicReview } from "@/components/urunler/ProductReviews";

/** Aynı ürünün farklı hacimdeki kardeş kayıtları (her biri ayrı üründür — SIMPLE ürün). */
export type VolumeOption = {
  volume: number;
  slug: string;
  productId: string;
  price: number;
  stock: number;
};

/** Varyasyonlu (VARIABLE) bir ürünün tek bir seçeneği. */
export type VariantOption = {
  id: string;
  sku: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  attributes: Record<string, string>;
};

export type VariantAttributeDef = { name: string; options: string[] };

type Urun = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  price: number;
  comparePrice: number | null;
  priceIsRange: boolean;
  rating: number;
  reviewCount: number;
  stock: number;
  isOrganic: boolean;
  harvestType: string;
  category: string;
  badge: string | null;
  volume: number | null;
  imageUrl: string;
  type: "SIMPLE" | "VARIABLE";
  volumeOptions: VolumeOption[];
  variants: VariantOption[];
  variantAttributes: VariantAttributeDef[];
  specs: Record<string, string>;
};

type ReviewData = {
  items: PublicReview[];
  average: number;
  count: number;
  isLoggedIn: boolean;
  existing: { rating: number; title: string | null; body: string | null } | null;
};

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          color="var(--color-gold)"
          fill={i < Math.floor(rating) ? "var(--color-gold)" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function MiniProductCard({ urun }: { urun: Urun }) {
  const bottleColor =
    urun.harvestType === "GOURMET"
      ? "#1C1C1C"
      : urun.harvestType === "ORGANIC"
        ? "#3D6B3D"
        : urun.harvestType === "EARLY_HARVEST"
          ? "#2F4F2F"
          : "#4A7A4A";

  return (
    <Link href={`/urunler/${urun.slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          transition: "all 0.25s ease",
        }}
        className="mini-card"
      >
        <div
          style={{
            background: "linear-gradient(160deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 110,
              background: `linear-gradient(180deg, ${bottleColor}CC 0%, ${bottleColor} 100%)`,
              borderRadius: "6px 6px 4px 4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ fontSize: "0.45rem", color: "var(--color-gold)", fontWeight: 700, letterSpacing: "0.05em" }}>
              KÜTÜKLÜ
            </div>
          </div>
        </div>
        <div style={{ padding: "14px" }}>
          <h4
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--color-black)",
              marginBottom: "4px",
            }}
          >
            {urun.name}
          </h4>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 600, color: "var(--color-black)" }}>
              {urun.priceIsRange && (
                <span style={{ fontSize: "0.6rem", fontWeight: 500, color: "var(--color-gray-500)", display: "block" }}>
                  Başlayan
                </span>
              )}
              {formatPrice(urun.price)}
            </span>
            <button
              style={{
                background: "var(--color-green)",
                color: "var(--color-cream)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "6px 12px",
                fontSize: "0.7rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              İncele
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

const tabs = ["Açıklama", "Tadım & Analiz", "Özellikler", "Değerlendirmeler", "Tarifler"];

export function UrunDetayContent({
  urun,
  benzerUrunler,
  reviews,
}: {
  urun: Urun;
  benzerUrunler: Urun[];
  reviews: ReviewData;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Açıklama");
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [includeCrossSell, setIncludeCrossSell] = useState(true);

  const { addItem } = useCartStore();

  const { toggle: toggleWishlist, isFavorited } = useWishlist();
  const isWishlisted = isFavorited(urun.id);

  const isVariable = urun.type === "VARIABLE";

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (!isVariable || urun.variants.length === 0) return {};
    return { ...urun.variants[0]!.attributes };
  });

  const matchedVariant = isVariable
    ? urun.variants.find((variant) =>
        urun.variantAttributes.every(
          (attribute) => variant.attributes[attribute.name] === selectedAttributes[attribute.name]
        )
      ) ?? null
    : null;

  const selectedVolume = urun.volume;
  const effectivePrice = isVariable ? matchedVariant?.price ?? null : urun.price;
  const effectiveComparePrice = isVariable ? matchedVariant?.comparePrice ?? null : urun.comparePrice;
  const effectiveStock = isVariable ? matchedVariant?.stock ?? 0 : urun.stock;
  const canAddToCart = isVariable
    ? matchedVariant !== null && matchedVariant.stock > 0
    : urun.stock > 0;

  const bottleColor =
    urun.harvestType === "GOURMET"
      ? "#1C1C1C"
      : urun.harvestType === "ORGANIC"
        ? "#3D6B3D"
        : urun.harvestType === "EARLY_HARVEST"
          ? "#2F4F2F"
          : "#4A7A4A";

  // Scroll listener for mobile sticky add-to-cart bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    if (isVariable) {
      if (!matchedVariant) return;
      addItem({
        productId: urun.id,
        variantId: matchedVariant.id,
        variantLabel: formatVariantLabel(matchedVariant.attributes) || null,
        name: urun.name,
        price: matchedVariant.price,
        quantity,
        volume: urun.volume ?? 0,
        imageUrl: urun.imageUrl,
      });
    } else {
      addItem({
        productId: urun.id,
        name: urun.name,
        price: urun.price,
        quantity,
        volume: selectedVolume ?? 0,
        imageUrl: urun.imageUrl,
      });
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  // Cross-sell bundle add to cart
  const handleAddBundleToCart = () => {
    handleAddToCart();
    // Also add cross-sell item
    addItem({
      productId: "cross-sell-wood-bowl",
      name: "El Yapımı Zeytin Ağacı Tadım Kasesi",
      price: 180,
      quantity: 1,
      volume: 0,
      imageUrl: "",
    });
  };

  return (
    <div style={{ background: "var(--color-gray-100)", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div
        style={{
          background: "var(--color-cream)",
          borderBottom: "1px solid var(--color-border)",
          padding: "12px 0",
        }}
      >
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--color-gray-400)" }}>
            <Link href="/" style={{ color: "var(--color-gray-400)", textDecoration: "none" }}>Ana Sayfa</Link>
            <span>›</span>
            <Link href="/urunler" style={{ color: "var(--color-gray-400)", textDecoration: "none" }}>Ürünler</Link>
            <span>›</span>
            <span style={{ color: "var(--color-black)", fontWeight: 500 }}>{urun.name}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "36px 24px 80px" }}>

        {/* ── ANA ÜRÜN BÖLÜMÜ ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.05fr",
            gap: "48px",
            background: "var(--color-white)",
            borderRadius: "var(--radius-xl)",
            padding: "40px",
            border: "1px solid var(--color-border)",
            marginBottom: "32px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
          }}
          className="product-detail-grid"
        >
          {/* SOL: Görsel Galerisi & Prestij Vitrini */}
          <div>
            {/* Ana Görsel Kutusu */}
            <div
              style={{
                background: "linear-gradient(160deg, #F8F5EE 0%, #EDE6D8 100%)",
                borderRadius: "var(--radius-xl)",
                height: 440,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "inset 0 0 40px rgba(212, 175, 55, 0.05)",
              }}
            >
              {/* Altın Parıltı & Halka Efekti */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.12) 0%, transparent 65%)",
                }}
              />

              {/* Rozet */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  zIndex: 2,
                }}
              >
                {urun.badge && (
                  <span
                    style={{
                      background: "var(--color-gold)",
                      color: "var(--color-black)",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    {urun.badge}
                  </span>
                )}
                {urun.isOrganic && (
                  <span
                    style={{
                      background: "var(--color-green)",
                      color: "var(--color-cream)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: "20px",
                    }}
                  >
                    🌿 %100 Organik
                  </span>
                )}
              </div>

              {/* Şişe Tasarımı */}
              <div
                style={{
                  width: 130,
                  height: 310,
                  background: `linear-gradient(180deg, ${bottleColor} 0%, #151F15 100%)`,
                  borderRadius: "14px 14px 8px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
                  position: "relative",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-gold)", letterSpacing: "0.12em" }}>
                  KÜTÜKLÜ
                </div>
                <div style={{ width: 60, height: 1, background: "rgba(212,175,55,0.4)" }} />
                <div style={{ fontSize: "0.62rem", color: "rgba(245,241,232,0.75)", letterSpacing: "0.1em", textAlign: "center", lineHeight: 1.4 }}>
                  SOĞUK SIKIM{"\n"}NATÜREL SIZMA
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--color-gold-light)", fontWeight: 700, marginTop: 4 }}>
                  {isVariable
                    ? (matchedVariant && formatVariantLabel(matchedVariant.attributes)) || ""
                    : selectedVolume
                      ? `${selectedVolume}ml`
                      : "500ml"}
                </div>
                {/* Cam Parıltı Çizgisi */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    bottom: 10,
                    width: 4,
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>

            {/* Thumbnail Küçük Görseller */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              {["Şişe Ön", "Etiket Yakın", "Kapak & Mühür", "Sofrada Sunum"].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setSelectedThumb(i)}
                  style={{
                    flex: 1,
                    padding: "10px 6px",
                    background: selectedThumb === i ? "var(--color-cream)" : "var(--color-white)",
                    border: `2px solid ${selectedThumb === i ? "var(--color-gold)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: selectedThumb === i ? "var(--color-black)" : "var(--color-gray-500)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* SAĞ: Bilgiler, Varyantlar, Fiyat & Aksiyon */}
          <div>
            {/* Kategori & Hasat Tipi */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-gold-dark)",
                }}
              >
                {urun.category}
              </span>
              <span style={{ color: "var(--color-gray-400)" }}>•</span>
              <span style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", fontWeight: 600 }}>
                {urun.specs["Hasat Tipi"] ?? "Erken Hasat"}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.8rem, 2.5vw, 2.4rem)",
                fontWeight: 500,
                color: "var(--color-black)",
                marginBottom: "12px",
                lineHeight: 1.2,
              }}
            >
              {urun.name}
            </h1>

            {/* Puanlama & Yorumlar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              {urun.reviewCount > 0 ? (
                <>
                  <StarRow rating={urun.rating} size={16} />
                  <button
                    type="button"
                    onClick={() => setActiveTab("Değerlendirmeler")}
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--color-gray-600)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    <strong>{urun.rating.toFixed(1)}</strong> ({urun.reviewCount} değerlendirme)
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("Değerlendirmeler")}
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-gray-500)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Henüz değerlendirme yok — ilk yorumu siz yazın
                </button>
              )}
            </div>

            {/* Fiyat Alanı */}
            <div
              style={{
                background: "rgba(245, 241, 232, 0.4)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                  KDV Dahil Satış Fiyatı
                </span>
                {effectivePrice === null ? (
                  <div style={{ fontSize: "0.95rem", color: "var(--color-gray-500)" }}>
                    Seçenek kombinasyonu bulunamadı
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "2.3rem",
                        fontWeight: 700,
                        color: "var(--color-black)",
                      }}
                    >
                      {formatPrice(effectivePrice * quantity)}
                    </span>
                    {effectiveComparePrice && (
                      <span style={{ fontSize: "1.15rem", color: "var(--color-gray-400)", textDecoration: "line-through" }}>
                        {formatPrice(effectiveComparePrice * quantity)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stok Durumu Rozeti */}
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: effectiveStock > 0 ? "var(--color-green)" : "#DC2626",
                    background: effectiveStock > 0 ? "rgba(47, 79, 47, 0.08)" : "rgba(220, 38, 38, 0.08)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: effectiveStock > 0 ? "var(--color-green)" : "#DC2626" }} />
                  {effectiveStock > 0 ? `Stokta Var (${effectiveStock} adet)` : "Tükendi"}
                </span>
              </div>
            </div>

            {/* Kısa Açıklama */}
            <p style={{ fontSize: "0.92rem", color: "var(--color-gray-600)", lineHeight: 1.7, marginBottom: "24px" }}>
              {urun.shortDesc} Soğuk sıkım (≤27°C) yöntemiyle, hasattan sonraki ilk 4 saat içinde şişelenmiştir.
            </p>

            {/* Boyut Seçici (SIMPLE ürün kardeşleri) */}
            {urun.volumeOptions.length > 1 && (
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-black)", marginBottom: "10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Şişe Boyutu Seçin
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {urun.volumeOptions.map((option) => {
                    const isSelected = option.productId === urun.id;
                    const isSoldOut = option.stock <= 0;

                    return (
                      <button
                        key={option.productId}
                        type="button"
                        onClick={() => {
                          if (!isSelected) router.push(`/urunler/${option.slug}`);
                        }}
                        style={{
                          padding: "10px 20px",
                          border: `2px solid ${isSelected ? "var(--color-green)" : "var(--color-border)"}`,
                          borderRadius: "var(--radius-sm)",
                          background: isSelected ? "var(--color-green)" : "var(--color-white)",
                          color: isSelected ? "var(--color-cream)" : "var(--color-black)",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          cursor: isSelected ? "default" : "pointer",
                          transition: "all 0.2s",
                          opacity: isSoldOut ? 0.5 : 1,
                        }}
                      >
                        {option.volume}ml
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Miktar + Sepete Ekle + Favori */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
              {/* Miktar Sayacı */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  background: "var(--color-white)",
                }}
              >
                <button
                  id="qty-minus"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: "none", border: "none", padding: "12px 14px", cursor: "pointer", color: "var(--color-gray-600)" }}
                  aria-label="Miktar azalt"
                >
                  <Minus size={16} />
                </button>
                <span style={{ width: 40, textAlign: "center", fontWeight: 700, fontSize: "1rem" }}>
                  {quantity}
                </span>
                <button
                  id="qty-plus"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: "none", border: "none", padding: "12px 14px", cursor: "pointer", color: "var(--color-gray-600)" }}
                  aria-label="Miktar artır"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Sepete Ekle Butonu */}
              <button
                id="add-to-cart-main"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                style={{
                  flex: 1,
                  background: !canAddToCart
                    ? "var(--color-gray-300)"
                    : addedToCart
                      ? "var(--color-green)"
                      : "var(--color-gold)",
                  color: addedToCart ? "var(--color-cream)" : "var(--color-black)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  padding: "14px 28px",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: canAddToCart ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 6px 20px rgba(212, 175, 55, 0.3)",
                }}
              >
                {addedToCart ? (
                  <><Check size={18} /> Sepete Eklendi!</>
                ) : !canAddToCart ? (
                  effectiveStock <= 0 ? "Tükendi" : "Seçim Yapın"
                ) : (
                  <><ShoppingCart size={18} /> Sepete Ekle</>
                )}
              </button>

              {/* Favori Butonu */}
              <button
                id="add-to-wishlist"
                type="button"
                onClick={() =>
                  toggleWishlist({
                    productId: urun.id,
                    slug: urun.slug,
                    name: urun.name,
                    price: urun.price,
                    priceIsRange: urun.priceIsRange,
                    imageUrl: urun.imageUrl,
                    volume: urun.volume,
                  })
                }
                aria-label={isWishlisted ? "Favorilerden kaldır" : "Favorilere ekle"}
                style={{
                  background: isWishlisted ? "rgba(220,38,38,0.06)" : "var(--color-white)",
                  border: `1.5px solid ${isWishlisted ? "#DC2626" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-sm)",
                  padding: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isWishlisted ? "#DC2626" : "var(--color-gray-500)",
                  transition: "all 0.2s",
                }}
              >
                <Heart size={18} fill={isWishlisted ? "#DC2626" : "none"} />
              </button>
            </div>

            {/* Hızlı Kargo & Güvenlik Bannerı */}
            <div
              style={{
                background: "rgba(47, 79, 47, 0.05)",
                border: "1px solid rgba(47, 79, 47, 0.15)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <Zap size={20} color="var(--color-green)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: "0.82rem", color: "var(--color-gray-700)", lineHeight: 1.45 }}>
                <strong style={{ color: "var(--color-black)" }}>Aynı Gün Kargo Fırsatı:</strong> Saat 16:00&apos;ya kadar verilen siparişler aynı gün özel hava kanallı ambalajında kargolanır.
              </div>
            </div>

            {/* 3'lü Mini Güvenlik Rozetleri */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                padding: "14px",
                background: "var(--color-white)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={16} color="var(--color-gold-dark)" />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-gray-700)" }}>
                  Sigortalı Kargo
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Leaf size={16} color="var(--color-green)" />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-gray-700)" }}>
                  %100 Doğal Sıkım
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Thermometer size={16} color="var(--color-gold-dark)" />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-gray-700)" }}>
                  Soğuk Sıkım ≤27°C
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BİRLİKTE HARİKA GİDER (CROSS-SELL & BUNDLE PROMO) ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #FFFDF9 0%, #F5F0E6 100%)",
            border: "1.5px solid var(--color-gold)",
            borderRadius: "var(--radius-xl)",
            padding: "32px 36px",
            marginBottom: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <Sparkles size={15} color="var(--color-gold-dark)" />
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--color-gold-dark)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Birlikte Harika Gider
              </span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.35rem",
                fontWeight: 600,
                color: "var(--color-black)",
                marginBottom: "6px",
              }}
            >
              Özel Ahşap Tadım Kasesi ile Sunumunuzu Taçlandırın
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>
              Ata yadigârı zeytin ağacından el yapımı üretilen tadım kasesi ile sofranızda gerçek Ege zarafeti.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", textDecoration: "line-through" }}>
                240 TL
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 700, color: "var(--color-black)" }}>
                +180 TL
              </div>
            </div>

            <button
              onClick={handleAddBundleToCart}
              style={{
                background: "var(--color-green)",
                color: "var(--color-cream)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "12px 20px",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <PackageCheck size={16} />
              Set Olarak Ekle
            </button>
          </div>
        </div>

        {/* ── TABS (SEKMELER & ZENGİN İÇERİK) ── */}
        <div
          style={{
            background: "var(--color-white)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            marginBottom: "40px",
            overflow: "hidden",
          }}
        >
          {/* Tab Başlıkları */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--color-border)",
              overflowX: "auto",
              background: "var(--color-cream)",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                id={`tab-${tab.toLowerCase()}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "18px 30px",
                  background: "none",
                  border: "none",
                  borderBottom: `3px solid ${activeTab === tab ? "var(--color-gold)" : "transparent"}`,
                  color: activeTab === tab ? "var(--color-black)" : "var(--color-gray-500)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.88rem",
                  fontWeight: activeTab === tab ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab İçeriği */}
          <div style={{ padding: "36px" }}>
            {activeTab === "Açıklama" && (
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "16px" }}>
                  Ürün Hikayesi & Üretim Detayları
                </h3>
                <p style={{ fontSize: "0.98rem", color: "var(--color-gray-600)", lineHeight: 1.85, marginBottom: "24px" }}>
                  {urun.description}
                </p>
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "10px" }}>
                  Doğru Saklama Koşulları
                </h4>
                <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)", lineHeight: 1.7 }}>
                  Doğrudan güneş ışığı görmeyen, serin ve loş bir ortamda muhafaza ediniz. Kapağı hava almayacak şekilde kapalı tutulduğunda 18 ay boyunca tazeliğini ve yüksek polifenol değerini korur.
                </p>
              </div>
            )}

            {/* TADIM & ANALİZ (SENSÖREL PROFİL) */}
            {activeTab === "Tadım & Analiz" && (
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "20px" }}>
                  Sensöriyel Tadım & Kimyasal Analiz Değerleri
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "36px",
                  }}
                  className="tasting-grid"
                >
                  {/* Sol: Tadım Çubukları */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                        <span>Meyvemsilik (Yeşil Elma & Taze Ot)</span>
                        <span style={{ color: "var(--color-gold-dark)" }}>9.2 / 10</span>
                      </div>
                      <div style={{ height: 8, background: "var(--color-gray-200)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: "92%", height: "100%", background: "var(--color-gold)" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                        <span>Boğaz Yakıcılığı (Oleocanthal & Polifenol)</span>
                        <span style={{ color: "var(--color-green)" }}>8.8 / 10</span>
                      </div>
                      <div style={{ height: 8, background: "var(--color-gray-200)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: "88%", height: "100%", background: "var(--color-green)" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                        <span>Acılık & Tazelik Dengesi</span>
                        <span style={{ color: "var(--color-gold-dark)" }}>7.6 / 10</span>
                      </div>
                      <div style={{ height: 8, background: "var(--color-gray-200)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: "76%", height: "100%", background: "var(--color-gold)" }} />
                      </div>
                    </div>
                  </div>

                  {/* Sağ: Laboratuvar Kartı */}
                  <div
                    style={{
                      background: "var(--color-cream)",
                      borderRadius: "var(--radius-lg)",
                      padding: "24px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <Award size={18} color="var(--color-gold-dark)" />
                      <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 600, color: "var(--color-black)", margin: 0 }}>
                        Akredite Laboratuvar Raporu
                      </h4>
                    </div>

                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
                      <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "6px" }}>
                        <span style={{ color: "var(--color-gray-600)" }}>Serbest Yağ Asitliği:</span>
                        <strong>≤ %0.28 (Ekstra Düşük)</strong>
                      </li>
                      <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "6px" }}>
                        <span style={{ color: "var(--color-gray-600)" }}>Polifenol Miktarı:</span>
                        <strong style={{ color: "var(--color-green)" }}>450+ mg/kg</strong>
                      </li>
                      <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "6px" }}>
                        <span style={{ color: "var(--color-gray-600)" }}>Peroksit Değeri:</span>
                        <strong>≤ 4.2 meq O₂/kg</strong>
                      </li>
                      <li style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--color-gray-600)" }}>Sıkım Sıcaklığı:</span>
                        <strong>Maksimum 24°C</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Özellikler" && (
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "24px" }}>
                  Teknik Özellikler Tablosu
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                  {Object.entries(urun.specs).map(([key, value], i) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        padding: "14px 20px",
                        borderBottom: "1px solid var(--color-border)",
                        background: i % 2 === 0 ? "var(--color-gray-100)" : "var(--color-white)",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--color-gray-600)", width: "45%", flexShrink: 0 }}>{key}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--color-black)", fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Değerlendirmeler" && (
              <ProductReviews
                productId={urun.id}
                reviews={reviews.items}
                average={reviews.average}
                count={reviews.count}
                isLoggedIn={reviews.isLoggedIn}
                existingReview={reviews.existing}
              />
            )}

            {activeTab === "Tarifler" && (
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "16px" }}>
                  Şefin Sofrasından Özel Tarif
                </h3>
                <div
                  style={{
                    background: "var(--color-cream)",
                    borderRadius: "var(--radius-lg)",
                    padding: "28px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "12px" }}>
                    🥗 Ege Otlu & Fırınlanmış Çeri Domatesli Bruschetta
                  </h4>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-gray-700)", lineHeight: 1.8 }}>
                    <strong>Malzemeler:</strong> 1 adet ekşi mayalı köy ekmeği, 250g çeri domates, taze kekik, 1 diş sarımsak ve 3 yemek kaşığı {urun.name}.
                    <br /><br />
                    <strong>Hazırlanışı:</strong> Domatesleri kekik ve bir miktar zeytinyağı ile 180°C fırında 15 dakika karamelize edin. Kızarmış ekmek dilimlerine sarımsak sürün, domatesleri yerleştirin ve en son cömertçe çiğ {urun.name} gezdirerek servis yapın.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── BENZER ÜRÜNLER (BENZER KALİTE VİTRİNİ) ── */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.8rem",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "24px",
            }}
          >
            İlginizi Çekebilecek Diğer Seçkiler
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "24px",
            }}
          >
            {benzerUrunler.map((u) => (
              <MiniProductCard key={u.id} urun={u} />
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBİL SABİT (STICKY) SATIN ALMA BARI ── */}
      {showStickyBar && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--color-border)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 99,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          }}
          className="sticky-bottom-bar"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-cream)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--color-gold-dark)" }}>K</span>
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-black)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {urun.name}
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-green)" }}>
                {formatPrice((effectivePrice ?? urun.price) * quantity)}
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            style={{
              background: addedToCart ? "var(--color-green)" : "var(--color-gold)",
              color: addedToCart ? "var(--color-cream)" : "var(--color-black)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "10px 20px",
              fontSize: "0.85rem",
              fontWeight: 800,
              cursor: canAddToCart ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {addedToCart ? <><Check size={16} /> Eklendi</> : <><ShoppingCart size={16} /> Sepete Ekle</>}
          </button>
        </div>
      )}

      <style>{`
        .mini-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-gold) !important;
        }
        @media (max-width: 860px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
            padding: 24px !important;
          }
          .tasting-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) {
          .sticky-bottom-bar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
