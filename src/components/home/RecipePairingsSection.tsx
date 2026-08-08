"use client";

import { useState } from "react";
import { Utensils, Clock, Flame, ShoppingCart, Check, ChefHat, Sparkles } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

interface Recipe {
  id: string;
  title: string;
  category: string;
  time: string;
  difficulty: "Kolay" | "Orta";
  chefNote: string;
  ingredients: string[];
  product: {
    id: string;
    name: string;
    price: number;
    volume: number;
    volumeLabel: string;
    imageUrl: string;
  };
}

const recipes: Recipe[] = [
  {
    id: "r1",
    title: "Erken Hasat ile Fırınlanmış Ege Otları & Deniz Tuzu",
    category: "Sıcak & Fırın",
    time: "15 Dakika",
    difficulty: "Kolay",
    chefNote: "Zeytinyağını pişirme esnasında değil, fırından çıkar çıkmaz taze otların üzerine çiğ gezdirin; böylece polifenol aroması buharla patlama yapar.",
    ingredients: ["Arapsaçı & Şevketibostan", "3 Y.K. Kütüklü Erken Hasat", "Kaba Deniz Tuzu & Sarımsak", "Kavrulmuş Çam Fıstığı"],
    product: {
      id: "erken-hasat-500",
      name: "Erken Hasat Soğuk Sıkım 500ml",
      price: 420,
      volume: 500,
      volumeLabel: "500 ml",
      imageUrl: "/images/products/erken-hasat.jpg",
    },
  },
  {
    id: "r2",
    title: "Sarımsaklı & Biberiyeli Ekşi Maya Daldırma Tabağı",
    category: "Meze & Başlangıç",
    time: "5 Dakika",
    difficulty: "Kolay",
    chefNote: "Tabağın tabanına pul biber ve taze çekilmiş tane karabiber ekleyin. Ekşi mayalı sıcak köy ekmeğini doğrudan yağa daldırın.",
    ingredients: ["Kızarmış Ekşi Mayalı Ekmek", "4 Y.K. Kütüklü Gurme Rezerve", "Ezilmiş 1 Diş Sarımsak", "Taze Biberiye & Kekik"],
    product: {
      id: "gurme-limited-750",
      name: "Gurme Limited Edition 750ml",
      price: 650,
      volume: 750,
      volumeLabel: "750 ml",
      imageUrl: "/images/products/gurme.jpg",
    },
  },
  {
    id: "r3",
    title: "Limonlu & Dağ Kekikli Sabah Şifa Kürü",
    category: "Şifa & Sağlık",
    time: "2 Dakika",
    difficulty: "Kolay",
    chefNote: "Her sabah aç karnına bir yemek kaşığı zeytinyağına birkaç damla taze limon sıkıp için. Sindirimi rahatlatır ve metabolizmayı canlandırır.",
    ingredients: ["1 Y.K. Kütüklü Natürel Sızma", "3 Damla Taze Limon Suyu", "1 Tutam Ege Dağ Kekiği", "Ilık Su Eşliğinde"],
    product: {
      id: "organik-sertifikali-500",
      name: "Organik Sertifikalı Natürel Sızma 500ml",
      price: 450,
      volume: 500,
      volumeLabel: "500 ml",
      imageUrl: "/images/products/organik.jpg",
    },
  },
];

export function RecipePairingsSection() {
  const { addItem } = useCartStore();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAddRecipeProduct = (recipe: Recipe) => {
    addItem({
      productId: recipe.product.id,
      name: recipe.product.name,
      price: recipe.product.price,
      quantity: 1,
      volume: recipe.product.volume,
      imageUrl: recipe.product.imageUrl,
    });

    setAddedIds((prev) => ({ ...prev, [recipe.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [recipe.id]: false }));
    }, 2000);
  };

  return (
    <section
      style={{
        background: "var(--color-white)",
        padding: "90px 0",
        position: "relative",
      }}
      aria-label="Şefin Sofrasından Zeytinyağlı Eşleşmeler"
    >
      <div className="container">
        {/* Başlık */}
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 52px auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <ChefHat size={16} color="var(--color-gold)" />
            <span className="section-tag" style={{ marginBottom: 0 }}>
              Gastronomi & İlham
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "14px",
            }}
          >
            Şefin Sofrasından: Zeytinyağlı Eşleşmeler
          </h2>
          <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Saf zeytinyağı sadece bir pişirme malzemesi değil, tabakların başrol oyuncusudur. İşte mutfağınıza ilham verecek özel tarifler.
          </p>
        </div>

        {/* 3'lü Tarif Kartları */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "28px",
          }}
        >
          {recipes.map((recipe) => {
            const isAdded = addedIds[recipe.id];
            return (
              <div
                key={recipe.id}
                style={{
                  background: "var(--color-cream)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(212, 175, 55, 0.25)",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.03)",
                }}
                className="interactive-product-card"
              >
                {/* Üst Kategori & Süre */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span
                    style={{
                      background: "var(--color-white)",
                      color: "var(--color-green)",
                      border: "1px solid rgba(47, 79, 47, 0.2)",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: "4px",
                    }}
                  >
                    {recipe.category}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--color-gray-500)" }}>
                    <Clock size={13} />
                    <span>{recipe.time}</span>
                  </div>
                </div>

                {/* Tarif Başlığı */}
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "var(--color-black)",
                    marginBottom: "12px",
                    lineHeight: 1.3,
                  }}
                >
                  {recipe.title}
                </h3>

                {/* Şefin Püf Noktası */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.75)",
                    borderLeft: "3px solid var(--color-gold)",
                    padding: "10px 14px",
                    borderRadius: "0 8px 8px 0",
                    fontSize: "0.78rem",
                    color: "var(--color-gray-700)",
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    marginBottom: "18px",
                  }}
                >
                  &ldquo;{recipe.chefNote}&rdquo;
                </div>

                {/* Malzemeler */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-black)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Gerekli Malzemeler:
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} style={{ fontSize: "0.78rem", color: "var(--color-gray-600)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "var(--color-gold-dark)", fontSize: "0.9rem" }}>✦</span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bu Tarifteki Ürün & Sepete Ekleme Kutusu */}
                <div
                  style={{
                    marginTop: "auto",
                    background: "var(--color-white)",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.68rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>
                      Önerilen Ürün
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-black)", lineHeight: 1.2 }}>
                      {recipe.product.name}
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-green)", marginTop: "2px" }}>
                      {formatPrice(recipe.product.price)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddRecipeProduct(recipe)}
                    style={{
                      background: isAdded ? "var(--color-gold)" : "var(--color-green)",
                      color: isAdded ? "var(--color-black)" : "var(--color-cream)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      padding: "8px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check size={14} strokeWidth={2.5} />
                        Eklendi
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} />
                        Sepete Ekle
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
