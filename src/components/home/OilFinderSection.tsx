"use client";

import { useState } from "react";
import Link from "next/link";
import { Salad, Flame, Sparkles, ShoppingCart, Check, ArrowRight, Droplet, Star } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

type OilFinderCategory = {
  id: string;
  icon: typeof Salad;
  title: string;
  subtitle: string;
  matchRate: number;
  product: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    price: number;
    comparePrice?: number;
    volume: number;
    volumeLabel: string;
    imageUrl: string;
    acidRatio: string;
    polyphenol: string;
    harvestTime: string;
    bestFor: string[];
    flavorMetrics: {
      fruitiness: number; // 1-5
      pungency: number;   // 1-5
      bitterness: number;  // 1-5
    };
  };
};

const finderCategories: OilFinderCategory[] = [
  {
    id: "salata",
    icon: Salad,
    title: "Salata & Soğuk Mezeler",
    subtitle: "Taze yeşil çimen kokulu, yoğun meyvemsi lezzet",
    matchRate: 98,
    product: {
      id: "erken-hasat-500",
      slug: "erken-hasat-soguk-sikim-500ml",
      name: "Erken Hasat Natürel Sızma",
      tagline: "Ekim ayında henüz yeşilken toplanan zeytinlerin soğuk sıkımı.",
      price: 420,
      comparePrice: 480,
      volume: 500,
      volumeLabel: "500 ml Cam Şişe",
      imageUrl: "/images/products/erken-hasat.jpg",
      acidRatio: "≤ %0.25",
      polyphenol: "480+ mg/kg",
      harvestTime: "Ekim 2025 (Erken Hasat)",
      bestFor: ["Mevsim Salataları", "Taze Ege Mezeleri", "Kızarmış Ekmek & Çiğ Tüketim", "Mozzarella & Domates"],
      flavorMetrics: {
        fruitiness: 5,
        pungency: 4,
        bitterness: 3,
      },
    },
  },
  {
    id: "sicak",
    icon: Flame,
    title: "Sıcak Yemekler & Fırın",
    subtitle: "Yumuşak içimli, yemeklerin lezzetini bastırmayan denge",
    matchRate: 95,
    product: {
      id: "klasik-sizma-1000",
      slug: "klasik-sizma-1000ml",
      name: "Klasik Natürel Sızma Zeytinyağı",
      tagline: "Geleneksel lezzet, her türlü tencere ve fırın yemeğine eşlik eden yumuşaklık.",
      price: 360,
      volume: 1000,
      volumeLabel: "1 Litre Cam Şişe",
      imageUrl: "/images/products/klasik.jpg",
      acidRatio: "≤ %0.4",
      polyphenol: "280 mg/kg",
      harvestTime: "Kasım 2025",
      bestFor: ["Zeytinyağlı Sarmalar", "Fırında Sebze & Balık", "Geleneksel Tencere Yemekleri", "Sos & Marinasyon"],
      flavorMetrics: {
        fruitiness: 4,
        pungency: 2,
        bitterness: 2,
      },
    },
  },
  {
    id: "sifa",
    icon: Sparkles,
    title: "Sabah Şifa & Gurme",
    subtitle: "Yüksek polifenollü, boğazda hafif yanma bırakan saf antioksidan",
    matchRate: 99,
    product: {
      id: "gurme-limited-750",
      slug: "gurme-limited-edition-750ml",
      name: "Gurme Limited Edition (Tek Bahçe)",
      tagline: "Yüzyıllık anıt ağaçlardan seçilerek elle toplanan, sınırlı sayıda özel rezerve.",
      price: 650,
      comparePrice: 720,
      volume: 750,
      volumeLabel: "750 ml Koyu Korumalı Şişe",
      imageUrl: "/images/products/gurme.jpg",
      acidRatio: "≤ %0.18",
      polyphenol: "580+ mg/kg",
      harvestTime: "Ekim İlk Hafta (Özel Hasat)",
      bestFor: ["Sabah Aç Karnına 1 Kaşık", "Gurme Tadım Sofraları", "Kalp & Damar Sağlığı Rutini", "Özel Hediyelik"],
      flavorMetrics: {
        fruitiness: 5,
        pungency: 5,
        bitterness: 4,
      },
    },
  },
];

export function OilFinderSection() {
  const [activeTabId, setActiveTabId] = useState<string>("salata");
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartStore();

  const activeCategory = finderCategories.find((c) => c.id === activeTabId) || finderCategories[0];
  const { product } = activeCategory;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      volume: product.volume,
      imageUrl: product.imageUrl,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <section
      style={{
        background: "linear-gradient(180deg, #FBF9F3 0%, #F3EFE3 100%)",
        padding: "90px 0",
        position: "relative",
        borderTop: "1px solid rgba(212, 175, 55, 0.15)",
        borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
      }}
      aria-label="Damak Tadınıza Uygun Yağı Seçin"
    >
      <div className="container">
        {/* Başlık & Alt Başlık */}
        <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 48px auto" }}>
          <span className="section-tag">Kişiselleştirilmiş Öneri</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "14px",
            }}
          >
            Damak Tadınıza Uygun Yağı Seçin
          </h2>
          <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Her zeytinyağının bir ruhu ve kullanım amacı vardır. Sofranızdaki ihtiyacınıza tıklayın, size en uygun şişeyi ve tadım profilini gösterelim.
          </p>
        </div>

        {/* 3'lü Seçim Butonları (Tabs) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {finderCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = cat.id === activeTabId;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTabId(cat.id);
                  setIsAdded(false);
                }}
                style={{
                  background: isSelected ? "var(--color-green)" : "var(--color-white)",
                  color: isSelected ? "var(--color-cream)" : "var(--color-black)",
                  border: isSelected ? "1px solid var(--color-green)" : "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px 24px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: isSelected ? "0 12px 30px rgba(47, 79, 47, 0.2)" : "0 4px 12px rgba(0,0,0,0.03)",
                  transform: isSelected ? "translateY(-4px)" : "none",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "10px",
                    background: isSelected ? "rgba(212, 175, 55, 0.2)" : "var(--color-cream)",
                    border: "1px solid rgba(212, 175, 55, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} color={isSelected ? "var(--color-gold-light)" : "var(--color-green)"} />
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      marginBottom: "4px",
                      color: isSelected ? "var(--color-cream)" : "var(--color-black)",
                    }}
                  >
                    {cat.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      lineHeight: 1.4,
                      color: isSelected ? "rgba(245, 241, 232, 0.8)" : "var(--color-gray-500)",
                    }}
                  >
                    {cat.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Eşleşen Ürün & Karakteristik Paneli */}
        <div
          className="glass-panel"
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "36px 40px",
            boxShadow: "0 20px 45px rgba(47, 79, 47, 0.08)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            animation: "fadeInUp 0.4s ease",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.2fr",
              gap: "48px",
              alignItems: "center",
            }}
            className="hero-grid"
          >
            {/* Sol: Ürün Kartı Önizlemesi */}
            <div
              style={{
                background: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Eşleşme Rozeti */}
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: 18,
                  background: "var(--color-green)",
                  color: "var(--color-cream)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(47,79,47,0.2)",
                }}
              >
                <Sparkles size={13} color="var(--color-gold)" />
                %{activeCategory.matchRate} Damak Uyumu
              </div>

              {/* Hacim */}
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--color-gold-dark)",
                  background: "var(--color-cream)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                }}
              >
                {product.volumeLabel}
              </div>

              {/* Görsel / İkon Alanı */}
              <div
                style={{
                  height: 220,
                  margin: "30px 0 16px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)",
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 190,
                    border: "2px solid rgba(212, 175, 55, 0.5)",
                    borderRadius: "16px",
                    background: "linear-gradient(180deg, rgba(47,79,47,0.1) 0%, rgba(212,175,55,0.15) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px",
                    textAlign: "center",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                  }}
                >
                  <Droplet size={36} color="var(--color-gold)" />
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--color-black)",
                      marginTop: "8px",
                    }}
                  >
                    Kütüklü
                  </span>
                  <span style={{ fontSize: "0.62rem", color: "var(--color-green)", textTransform: "uppercase", fontWeight: 700 }}>
                    {product.acidRatio} Asit
                  </span>
                </div>
              </div>

              {/* İsim & Fiyat */}
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.35rem",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  marginBottom: "6px",
                }}
              >
                {product.name}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginBottom: "20px" }}>
                {product.tagline}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--color-gray-200)",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      color: "var(--color-black)",
                    }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && (
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--color-gray-400)",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleAddToCart}
                  style={{
                    background: isAdded ? "var(--color-gold)" : "var(--color-green)",
                    color: isAdded ? "var(--color-black)" : "var(--color-cream)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 18px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      Sepete Eklendi
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Sepete Ekle
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sağ: Detaylı Analiz & Lezzet Eşleşmesi */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--color-gold-dark)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                Sensöriyel Tadım Değerleri
              </div>

              <h4
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  marginBottom: "20px",
                }}
              >
                Bu Şişeyi Özel Kılan Nedir?
              </h4>

              {/* Tadım Göstergeleri (Metreler) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
                {[
                  { label: "Meyvemsilik (Yeşil Meyve Notaları)", value: product.flavorMetrics.fruitiness },
                  { label: "Yakıcılık (Boğazda Bıraktığı Şifa Yanması)", value: product.flavorMetrics.pungency },
                  { label: "Acılık / Karakter (Polifenol Göstergesi)", value: product.flavorMetrics.bitterness },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600, color: "var(--color-gray-700)" }}>{metric.label}</span>
                      <span style={{ fontWeight: 700, color: "var(--color-green)" }}>{metric.value} / 5</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${(metric.value / 5) * 100}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, var(--color-gold) 0%, var(--color-green) 100%)",
                          borderRadius: "4px",
                          transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* En İyi Eşleştiği Lezzetler */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-black)", marginBottom: "10px" }}>
                  🍴 En İyi Kullanım Alanları:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {product.bestFor.map((dish) => (
                    <span
                      key={dish}
                      style={{
                        background: "var(--color-white)",
                        border: "1px solid rgba(47, 79, 47, 0.2)",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        color: "var(--color-green)",
                        fontWeight: 600,
                      }}
                    >
                      ✓ {dish}
                    </span>
                  ))}
                </div>
              </div>

              {/* Teknik Değerler Çubuğu */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  background: "var(--color-white)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>Asit Oranı</div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-green)" }}>{product.acidRatio}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>Polifenol</div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-gold-dark)" }}>{product.polyphenol}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>Hasat Zamanı</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-black)" }}>2025/2026</div>
                </div>
              </div>

              <Link
                href={`/urunler/${product.slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--color-green)",
                  textDecoration: "none",
                }}
              >
                Tüm Laboratuvar ve Şişe Bilgilerini Gör <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
