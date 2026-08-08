"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Leaf, Thermometer, Check, AlertCircle } from "lucide-react";
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
  /** SIMPLE üründe gerçek fiyat; VARIABLE üründe "başlayan" (min) fiyat. */
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
    urun.harvestType === "GOURMET" ? "#1C1C1C"
      : urun.harvestType === "ORGANIC" ? "#3D6B3D"
        : urun.harvestType === "EARLY_HARVEST" ? "#2F4F2F"
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
          <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "4px" }}>
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
              Sepete Ekle
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

const tabs = ["Açıklama", "Özellikler", "Değerlendirmeler", "Tarifler"];

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

  const { addItem } = useCartStore();

  const { toggle: toggleWishlist, isFavorited } = useWishlist();
  const isWishlisted = isFavorited(urun.id);

  const isVariable = urun.type === "VARIABLE";

  // Varyasyonlu üründe her nitelik için seçilen değer (ör. { Hacim: "1000ml" }).
  // İlk varyantın değerleriyle başlanır, böylece sayfa açılır açılmaz geçerli
  // bir seçim ve gerçek bir fiyat gösterilir.
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (!isVariable || urun.variants.length === 0) return {};
    return { ...urun.variants[0]!.attributes };
  });

  // Seçilen niteliklere tam olarak uyan varyant. Sunucu tarafı ödeme akışı
  // yalnızca bu varyantın `id`'sini kabul eder; fiyat burada YALNIZCA
  // önizleme amaçlıdır, gerçek tutar sepet/ödeme ekranında sunucudan gelir.
  const matchedVariant = isVariable
    ? urun.variants.find((variant) =>
        urun.variantAttributes.every(
          (attribute) => variant.attributes[attribute.name] === selectedAttributes[attribute.name]
        )
      ) ?? null
    : null;

  // Hacim seçimi (SIMPLE ürün): farklı hacim seçmek ayrı bir ürüne gitmek
  // demektir. Böylece seçilen hacim ile ödenen fiyat her zaman eşleşir.
  const selectedVolume = urun.volume;

  // Ekranda gösterilecek geçerli fiyat/stok/SKU.
  const effectivePrice = isVariable ? matchedVariant?.price ?? null : urun.price;
  const effectiveComparePrice = isVariable ? matchedVariant?.comparePrice ?? null : urun.comparePrice;
  const effectiveStock = isVariable ? matchedVariant?.stock ?? 0 : urun.stock;
  const canAddToCart = isVariable
    ? matchedVariant !== null && matchedVariant.stock > 0
    : urun.stock > 0;

  // Placeholder bottle color
  const bottleColor =
    urun.harvestType === "GOURMET" ? "#1C1C1C"
      : urun.harvestType === "ORGANIC" ? "#3D6B3D"
        : urun.harvestType === "EARLY_HARVEST" ? "#2F4F2F"
          : "#4A7A4A";

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
    setTimeout(() => setAddedToCart(false), 2000);
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

      <div className="container" style={{ padding: "40px 24px 80px" }}>

        {/* ── ANA ÜRÜN BÖLÜMÜ ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            background: "var(--color-white)",
            borderRadius: "var(--radius-xl)",
            padding: "40px",
            border: "1px solid var(--color-border)",
            marginBottom: "32px",
          }}
          className="product-detail-grid"
        >
          {/* SOL: Görsel */}
          <div>
            {/* Ana Görsel */}
            <div
              style={{
                background: "linear-gradient(160deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
                borderRadius: "var(--radius-lg)",
                height: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                border: "1px solid var(--color-border)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Altın parıltı */}
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 70% 30%, rgba(212,175,55,0.08) 0%, transparent 60%)" }} />

              {/* Şişe */}
              <div
                style={{
                  width: 120,
                  height: 280,
                  background: `linear-gradient(180deg, ${bottleColor}CC 0%, ${bottleColor} 100%)`,
                  borderRadius: "12px 12px 8px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                  position: "relative",
                }}
              >
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-gold)", letterSpacing: "0.1em" }}>
                  KÜTÜKLÜ
                </div>
                <div style={{ width: 60, height: 1, background: "rgba(212,175,55,0.4)" }} />
                <div style={{ fontSize: "0.65rem", color: "rgba(245,241,232,0.7)", letterSpacing: "0.08em", textAlign: "center", lineHeight: 1.4 }}>
                  ZEYTİNYAĞI{"\n"}NATÜREL SIZMA
                </div>
                <div style={{ fontSize: "0.6rem", color: "var(--color-gold)", fontWeight: 600, marginTop: 4 }}>
                  {isVariable
                    ? (matchedVariant && formatVariantLabel(matchedVariant.attributes)) || ""
                    : selectedVolume
                      ? `${selectedVolume}ml`
                      : ""}
                </div>
                {/* Etiket şeridi */}
                <div style={{ position: "absolute", top: "35%", left: 0, right: 0, height: 60, background: "rgba(245,241,232,0.08)", borderTop: "1px solid rgba(212,175,55,0.2)", borderBottom: "1px solid rgba(212,175,55,0.2)" }} />
              </div>

              {/* Zoom etiketi */}
              <div style={{ position: "absolute", bottom: 12, right: 12, fontSize: "0.65rem", color: "var(--color-gray-400)", display: "flex", alignItems: "center", gap: "4px" }}>
                🔍 Zoom
              </div>
            </div>

            {/* Küçük thumbnail'ler */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setSelectedThumb(i)}
                  style={{
                    width: 72,
                    height: 72,
                    background: "linear-gradient(160deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
                    border: `2px solid ${selectedThumb === i ? "var(--color-gold)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div style={{ width: 28, height: 56, background: `${bottleColor}${i === 0 ? "FF" : i === 1 ? "CC" : i === 2 ? "AA" : "88"}`, borderRadius: "4px 4px 3px 3px" }} />
                </button>
              ))}
            </div>
          </div>

          {/* SAĞ: Bilgi */}
          <div>
            {/* Kategori */}
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                display: "block",
                marginBottom: "10px",
              }}
            >
              {urun.category}
            </span>

            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
                fontWeight: 500,
                color: "var(--color-black)",
                marginBottom: "12px",
                lineHeight: 1.2,
              }}
            >
              {urun.name}
            </h1>

            {/* Puan — yalnızca onaylanmış yorumlardan hesaplanır */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              {urun.reviewCount > 0 ? (
                <>
                  <StarRow rating={urun.rating} size={16} />
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
                      fontFamily: "inherit",
                    }}
                  >
                    {urun.rating.toFixed(1)} ({urun.reviewCount} değerlendirme)
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
                    fontFamily: "inherit",
                  }}
                >
                  Henüz değerlendirme yok — ilk yorumu siz yazın
                </button>
              )}
            </div>

            {/* Fiyat — VARIABLE üründe seçilen varyanta göre değişir */}
            <div style={{ marginBottom: "24px" }}>
              {effectivePrice === null ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.95rem",
                    color: "var(--color-gray-500)",
                  }}
                >
                  <AlertCircle size={18} /> Bu seçenek kombinasyonu şu anda mevcut değil.
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "2.2rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                    }}
                  >
                    {formatPrice(effectivePrice * quantity)}
                  </span>
                  {effectiveComparePrice && (
                    <span style={{ fontSize: "1.1rem", color: "var(--color-gray-400)", textDecoration: "line-through" }}>
                      {formatPrice(effectiveComparePrice * quantity)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)", lineHeight: 1.7, marginBottom: "28px" }}>
              {urun.shortDesc}. Yeşil zeytinlerden erken hasat ile elde edilen, yoğun aromalı premium zeytinyağı. Soğuk sıkım yöntemiyle üretilmiştir.
            </p>

            {/* Boyut Seçici — her hacim ayrı bir üründür, seçim o ürüne gider */}
            {urun.volumeOptions.length > 1 && (
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-gray-600)", marginBottom: "10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Boyut
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                        title={isSoldOut ? "Tükendi" : formatPrice(option.price)}
                        style={{
                          padding: "8px 18px",
                          border: `2px solid ${isSelected ? "var(--color-green)" : "var(--color-border)"}`,
                          borderRadius: "var(--radius-sm)",
                          background: isSelected ? "var(--color-green)" : "var(--color-white)",
                          color: isSelected ? "var(--color-cream)" : "var(--color-gray-600)",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: isSelected ? "default" : "pointer",
                          transition: "all 0.2s",
                          opacity: isSoldOut ? 0.5 : 1,
                          textDecoration: isSoldOut ? "line-through" : "none",
                        }}
                      >
                        {option.volume}ml
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Varyant Seçici — VARIABLE üründe fiyat/stok seçime göre değişir */}
            {isVariable &&
              urun.variantAttributes.map((attribute) => (
                <div key={attribute.name} style={{ marginBottom: "24px" }}>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--color-gray-600)",
                      marginBottom: "10px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {attribute.name}
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {attribute.options.map((option) => {
                      const isSelected = selectedAttributes[attribute.name] === option;

                      // Bu seçeneğin, diğer seçili niteliklerle birlikte gerçekten
                      // sipariş edilebilir bir varyant oluşturup oluşturmadığı.
                      const wouldMatch = urun.variants.some((variant) =>
                        urun.variantAttributes.every((def) => {
                          const expected = def.name === attribute.name ? option : selectedAttributes[def.name];
                          return variant.attributes[def.name] === expected;
                        })
                      );

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setSelectedAttributes((current) => ({ ...current, [attribute.name]: option }))
                          }
                          disabled={!wouldMatch}
                          style={{
                            padding: "8px 18px",
                            border: `2px solid ${isSelected ? "var(--color-green)" : "var(--color-border)"}`,
                            borderRadius: "var(--radius-sm)",
                            background: isSelected ? "var(--color-green)" : "var(--color-white)",
                            color: isSelected ? "var(--color-cream)" : wouldMatch ? "var(--color-gray-600)" : "var(--color-gray-400)",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: wouldMatch ? "pointer" : "not-allowed",
                            transition: "all 0.2s",
                            opacity: wouldMatch ? 1 : 0.45,
                            textDecoration: wouldMatch ? "none" : "line-through",
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            {isVariable && matchedVariant?.sku && (
              <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "-14px", marginBottom: "20px" }}>
                Stok Kodu: {matchedVariant.sku}
              </p>
            )}

            {/* Miktar + Sepete Ekle */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
              {/* Miktar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                }}
              >
                <button
                  id="qty-minus"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: "none", border: "none", padding: "10px 14px", cursor: "pointer", color: "var(--color-gray-600)" }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ width: 36, textAlign: "center", fontWeight: 600, fontSize: "0.95rem" }}>
                  {quantity}
                </span>
                <button
                  id="qty-plus"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: "none", border: "none", padding: "10px 14px", cursor: "pointer", color: "var(--color-gray-600)" }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Sepete Ekle */}
              <button
                id="add-to-cart-main"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                style={{
                  flex: 1,
                  background: !canAddToCart
                    ? "var(--color-gray-300)"
                    : addedToCart
                      ? "var(--color-green-light)"
                      : "var(--color-gold)",
                  color: "var(--color-black)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  padding: "13px 24px",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  cursor: canAddToCart ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                {addedToCart ? (
                  <><Check size={16} /> Eklendi!</>
                ) : !canAddToCart ? (
                  effectiveStock <= 0 && effectivePrice !== null ? "Tükendi" : "Seçim Yapın"
                ) : (
                  <><ShoppingCart size={16} /> Sepete Ekle</>
                )}
              </button>

              {/* Favoriler */}
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
                aria-pressed={isWishlisted}
                style={{
                  background: isWishlisted ? "rgba(220,38,38,0.06)" : "none",
                  border: `1.5px solid ${isWishlisted ? "#DC2626" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-sm)",
                  padding: "12px",
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

            {/* Güven rozetleri */}
            <div
              style={{
                display: "flex",
                gap: "20px",
                padding: "16px",
                background: "var(--color-gray-100)",
                borderRadius: "var(--radius-md)",
                flexWrap: "wrap",
              }}
            >
              {[
                { Icon: Truck, label: "Ücretsiz Kargo" },
                { Icon: Leaf, label: "Organik" },
                { Icon: Thermometer, label: "Soğuk Sıkım" },
              ].map(({ Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon size={15} color="var(--color-green)" />
                  <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--color-gray-600)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div
          style={{
            background: "var(--color-white)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            marginBottom: "32px",
            overflow: "hidden",
          }}
        >
          {/* Tab Headers */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--color-border)",
              overflowX: "auto",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                id={`tab-${tab.toLowerCase()}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "16px 28px",
                  background: "none",
                  border: "none",
                  borderBottom: `3px solid ${activeTab === tab ? "var(--color-gold)" : "transparent"}`,
                  color: activeTab === tab ? "var(--color-black)" : "var(--color-gray-400)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  fontWeight: activeTab === tab ? 700 : 400,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  letterSpacing: "0.05em",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: "32px" }}>
            {activeTab === "Açıklama" && (
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "16px" }}>
                  Detaylı Açıklama
                </h3>
                <p style={{ fontSize: "0.95rem", color: "var(--color-gray-600)", lineHeight: 1.85, marginBottom: "20px" }}>
                  {urun.description}
                </p>
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "10px" }}>
                  Saklama Koşulları
                </h4>
                <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)", lineHeight: 1.7 }}>
                  Serin ve loş bir yerde, doğrudan güneş ışığından uzak, sıkıca kapalı olarak saklayınız.
                </p>
              </div>
            )}

            {activeTab === "Özellikler" && (
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "24px" }}>
                  Özellikler
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
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
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--color-gray-600)", width: "48%", flexShrink: 0 }}>{key}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--color-black)" }}>{value}</span>
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
                  Önerilen Tarifler
                </h3>
                <div
                  style={{
                    background: "var(--color-cream)",
                    borderRadius: "var(--radius-md)",
                    padding: "24px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "12px" }}>
                    🥗 Izgara Sebze Salatası
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", lineHeight: 1.7 }}>
                    <strong>Malzemeler:</strong> 1 dolmalık biber, 1 kabak, 1 patlıcan, 2 yemek kaşığı {urun.name}
                    <br /><br />
                    <strong>Hazırlanışı:</strong> Sebzeleri dilimleyip ızgarada pişirin. Sıcakken üzerine tuz, limon suyu ve bolca Kütüklü zeytinyağı gezdirin. Afiyetle!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── BENZER ÜRÜNLER ── */}
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
            Benzer Ürünler
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            {benzerUrunler.map((u) => (
              <MiniProductCard key={u.id} urun={u} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .mini-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-gold) !important;
        }
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
