"use client";

import { useState } from "react";
import { Gift, PackageCheck, Sparkles, ShoppingCart, Check, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

interface Bundle {
  id: string;
  name: string;
  badge: string;
  savings: string;
  price: number;
  originalPrice: number;
  contents: string[];
  description: string;
  imageUrl: string;
}

const bundles: Bundle[] = [
  {
    id: "bundle-gurme-trio",
    name: "3'lü Gurme Keşif Paketi",
    badge: "EN ÇOK TERCİH EDİLEN",
    savings: "150 ₺ Tasarruf",
    price: 1120,
    originalPrice: 1270,
    description: "Kütüklü'nün en seçkin 3 lezzetini tek pakette deneyimleyin. Salatalardan sıcak yemeklere tam sofra uyumu.",
    contents: [
      "1x 500ml Erken Hasat Soğuk Sıkım",
      "1x 500ml Organik Sertifikalı Sızma",
      "1x 500ml Klasik Natürel Sızma",
      "Özel Kütüklü Hediye Kutusu",
    ],
    imageUrl: "/images/products/bundle-trio.jpg",
  },
  {
    id: "bundle-ahsap-prestij",
    name: "Ahşap Sandıklı Prestij Hediye Seti",
    badge: "ÖZEL KOLEKSİYON",
    savings: "200 ₺ Tasarruf",
    price: 1450,
    originalPrice: 1650,
    description: "El yapımı masif ahşap kutusunda sınırlı rezerve şişemiz ve özel porselen tadım kasesiyle mükemmel bir hediye.",
    contents: [
      "1x 750ml Gurme Limited Edition Rezerve",
      "1x El Yapımı Masif Ahşap Kutu",
      "1x Porselen Zeytinyağı Tadım Kasesi",
      "Kişiye Özel İsim Yazılı Sertifika",
    ],
    imageUrl: "/images/products/bundle-wood.jpg",
  },
  {
    id: "bundle-aile-boyu-10l",
    name: "10 Litre Aile Boyu Bereket Paketi",
    badge: "EN AVANTAJLI SEÇİM",
    savings: "320 ₺ Tasarruf",
    price: 2450,
    originalPrice: 2770,
    description: "Tüm yıl boyunca mutfağınızda katkısız, saf Ege lezzeti eksik olmasın diye 2 adet 5L teneke avantaj paketi.",
    contents: [
      "2x 5 Litre Teneke Natürel Sızma",
      "1x 250ml Erken Hasat Cam Şişe (Hediye)",
      "Ücretsiz & Sigortalı Hızlı Kargo",
      "Özel Korumalı Çift Katlı Kolileme",
    ],
    imageUrl: "/images/products/bundle-10l.jpg",
  },
];

export function BundleShowcaseSection() {
  const { addItem } = useCartStore();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAddBundle = (bundle: Bundle) => {
    addItem({
      productId: bundle.id,
      name: bundle.name,
      price: bundle.price,
      quantity: 1,
      volume: 1500,
      imageUrl: bundle.imageUrl,
    });

    setAddedIds((prev) => ({ ...prev, [bundle.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [bundle.id]: false }));
    }, 2000);
  };

  return (
    <section
      style={{
        background: "linear-gradient(180deg, #1C1C1C 0%, #202D20 100%)",
        color: "var(--color-cream)",
        padding: "100px 0",
        position: "relative",
      }}
      aria-label="Çoklu Avantaj Paketleri ve Hediye Kutuları"
    >
      <div className="container">
        {/* Başlık */}
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 56px auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Gift size={16} color="var(--color-gold)" />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
              }}
            >
              Özel Koleksiyonlar & Setler
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 500,
              color: "var(--color-cream)",
              marginBottom: "14px",
            }}
          >
            Çoklu Avantaj Paketleri & Hediye Kutuları
          </h2>
          <p style={{ color: "rgba(245, 241, 232, 0.75)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Hem sevdiklerinize unutulmaz bir lezzet armağan edin hem de avantajlı set fiyatlarıyla Kütüklü kalitesini sofranıza taşıyın.
          </p>
        </div>

        {/* 3'lü Bundle Kartları */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "30px",
          }}
        >
          {bundles.map((bundle) => {
            const isAdded = addedIds[bundle.id];
            return (
              <div
                key={bundle.id}
                className="glass-panel-dark"
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                }}
              >
                {/* Rozet */}
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 20,
                    background: "var(--color-gold)",
                    color: "var(--color-black)",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    padding: "4px 10px",
                    borderRadius: "4px",
                  }}
                >
                  {bundle.badge}
                </div>

                {/* Tasarruf Rozeti */}
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 20,
                    background: "rgba(34, 197, 94, 0.2)",
                    border: "1px solid #22c55e",
                    color: "#4ade80",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "4px 9px",
                    borderRadius: "4px",
                  }}
                >
                  {bundle.savings}
                </div>

                {/* İkon / Paket Önizleme Kutusu */}
                <div
                  style={{
                    height: 120,
                    margin: "24px 0 16px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, rgba(47,79,47,0.3) 100%)",
                      border: "1px solid rgba(212, 175, 55, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PackageCheck size={38} color="var(--color-gold-light)" />
                  </div>
                </div>

                {/* İsim */}
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.45rem",
                    fontWeight: 600,
                    color: "var(--color-cream)",
                    marginBottom: "8px",
                    textAlign: "center",
                  }}
                >
                  {bundle.name}
                </h3>

                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(245, 241, 232, 0.75)",
                    textAlign: "center",
                    lineHeight: 1.5,
                    marginBottom: "20px",
                  }}
                >
                  {bundle.description}
                </p>

                {/* Paket İçeriği */}
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{ fontSize: "0.72rem", color: "var(--color-gold)", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px", letterSpacing: "0.06em" }}>
                    Paket İçeriği:
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                    {bundle.contents.map((item, idx) => (
                      <li key={idx} style={{ fontSize: "0.78rem", color: "var(--color-cream)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "var(--color-gold-light)" }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fiyat & Sepete Ekle Butonu */}
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(245, 241, 232, 0.4)", textDecoration: "line-through" }}>
                      {formatPrice(bundle.originalPrice)}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "1.65rem",
                        fontWeight: 700,
                        color: "var(--color-gold-light)",
                      }}
                    >
                      {formatPrice(bundle.price)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddBundle(bundle)}
                    style={{
                      background: isAdded ? "var(--color-cream)" : "var(--color-gold)",
                      color: "var(--color-black)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 18px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
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
                        Seti Satın Al
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
