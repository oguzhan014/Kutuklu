"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, ShoppingCart, SlidersHorizontal, ChevronDown, X, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Ürün tipi
type Urun = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  price: number;
  comparePrice: number | null;
  /** true ise fiyat "X TL'den başlayan" olarak gösterilir (varyasyonlu ürün). */
  priceIsRange?: boolean;
  rating: number;
  reviewCount: number;
  stock: number;
  isOrganic: boolean;
  harvestType: string;
  category: string;
  badge: string | null;
};

const kategoriler = ["Tümü", "Klasik Sızma", "Erken Hasat", "Organik", "Gurme"];
const boyutlar = [250, 500, 750, 1000];
const sortOptions = [
  { value: "featured", label: "Önerilen" },
  { value: "price-asc", label: "Fiyat (Düşük–Yüksek)" },
  { value: "price-desc", label: "Fiyat (Yüksek–Düşük)" },
  { value: "rating", label: "En Yüksek Puan" },
];

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

function ProductCard({ urun }: { urun: Urun }) {
  const [hovered, setHovered] = useState(false);

  const badgeColor =
    urun.badge === "En Çok Satan"
      ? "var(--color-gold)"
      : urun.badge === "Organik"
        ? "var(--color-green)"
        : urun.badge === "Limited Edition"
          ? "var(--color-black)"
          : "var(--color-gold)";

  const bottleColor =
    urun.harvestType === "GOURMET"
      ? "#1C1C1C"
      : urun.harvestType === "ORGANIC"
        ? "#3D6B3D"
        : urun.harvestType === "EARLY_HARVEST"
          ? "#2F4F2F"
          : "#4A7A4A";

  return (
    <div
      style={{
        background: "var(--color-white)",
        border: `1.5px solid ${hovered ? "var(--color-gold)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-5px)" : "none",
        boxShadow: hovered ? "var(--shadow-lg)" : "none",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ürün görseli */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(160deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Badge */}
        {urun.badge && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: badgeColor,
              color: urun.badge === "En Çok Satan" ? "var(--color-black)" : "var(--color-cream)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "20px",
              zIndex: 1,
            }}
          >
            {urun.badge}
          </div>
        )}

        {/* Organik işareti */}
        {urun.isOrganic && !urun.badge && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(47,79,47,0.9)",
              color: "var(--color-gold)",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 8px",
              borderRadius: "20px",
            }}
          >
            🌿 ORGANİK
          </div>
        )}

        {/* Şişe placeholder */}
        <div
          style={{
            width: 70,
            height: 150,
            background: `linear-gradient(180deg, ${bottleColor}CC 0%, ${bottleColor} 100%)`,
            borderRadius: "8px 8px 5px 5px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.55rem",
              fontWeight: 700,
              color: "var(--color-gold)",
              letterSpacing: "0.05em",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            KÜTÜKLÜ
          </div>
          <div style={{ width: 30, height: 1, background: "rgba(212,175,55,0.5)" }} />
          <div style={{ fontSize: "0.45rem", color: "rgba(245,241,232,0.7)", textAlign: "center", letterSpacing: "0.05em" }}>
            ZEYTİNYAĞI
          </div>
        </div>
      </div>

      {/* Bilgi */}
      <div style={{ padding: "18px 16px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", minHeight: "18px" }}>
          {urun.reviewCount > 0 ? (
            <>
              <StarRow rating={urun.rating} />
              <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)" }}>
                ({urun.reviewCount})
              </span>
            </>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)" }}>
              Yeni ürün
            </span>
          )}
        </div>

        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "var(--color-black)",
            marginBottom: "4px",
            lineHeight: 1.25,
          }}
        >
          {urun.name}
        </h3>
        <p style={{ fontSize: "0.78rem", color: "var(--color-gray-400)", marginBottom: "14px" }}>
          {urun.shortDesc}
        </p>

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {urun.priceIsRange && (
              <div style={{ fontSize: "0.68rem", color: "var(--color-gray-500)", marginBottom: "1px" }}>
                Başlayan fiyatlarla
              </div>
            )}
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.3rem",
                fontWeight: 600,
                color: "var(--color-black)",
              }}
            >
              {formatPrice(urun.price)}
            </div>
            {urun.comparePrice && (
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-gray-400)",
                  textDecoration: "line-through",
                }}
              >
                {formatPrice(urun.comparePrice)}
              </div>
            )}
          </div>

          <button
            id={`cart-${urun.id}`}
            aria-label={`${urun.name} sepete ekle`}
            style={{
              background: "var(--color-green)",
              color: "var(--color-cream)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "9px 14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s ease",
              letterSpacing: "0.03em",
            }}
          >
            <ShoppingCart size={13} />
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}

export function UrunlerContent({
  urunler,
  initialQuery = "",
}: {
  urunler: Urun[];
  /** Navbar'daki arama kutusundan `/urunler?q=...` ile gelen başlangıç sorgusu. */
  initialQuery?: string;
}) {
  const [selectedKategori, setSelectedKategori] = useState("Tümü");
  const [selectedBoyutlar, setSelectedBoyutlar] = useState<number[]>([]);
  const [minFiyat, setMinFiyat] = useState("");
  const [maxFiyat, setMaxFiyat] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    let list = [...urunler];

    const query = searchQuery.trim().toLocaleLowerCase("tr");
    if (query) {
      list = list.filter((u) =>
        [u.name, u.shortDesc, u.category].some((field) =>
          field.toLocaleLowerCase("tr").includes(query)
        )
      );
    }

    if (selectedKategori !== "Tümü") list = list.filter((u) => u.category === selectedKategori);
    if (minFiyat) list = list.filter((u) => u.price >= Number(minFiyat));
    if (maxFiyat) list = list.filter((u) => u.price <= Number(maxFiyat));
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [urunler, searchQuery, selectedKategori, selectedBoyutlar, minFiyat, maxFiyat, sortBy]);

  const resetFilters = () => {
    setSelectedKategori("Tümü");
    setSelectedBoyutlar([]);
    setMinFiyat("");
    setMaxFiyat("");
    setSortBy("featured");
    setSearchQuery("");
  };

  return (
    <>
      {/* Sayfa Başlığı */}
      <div
        style={{
          background: "var(--color-cream)",
          padding: "48px 0 32px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container">
          <span className="section-tag" style={{ textAlign: "left" }}>Koleksiyonumuz</span>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.2rem, 4vw, 3rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "8px",
            }}
          >
            Ürünlerimiz
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--color-gray-500)" }}>
            Doğanın en saf halini keşfedin
          </p>
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "16px",
              fontSize: "0.8rem",
              color: "var(--color-gray-400)",
            }}
          >
            <Link href="/" style={{ color: "var(--color-gray-400)", textDecoration: "none" }}>
              Ana Sayfa
            </Link>
            <span>›</span>
            <span style={{ color: "var(--color-black)", fontWeight: 500 }}>Ürünler</span>
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div style={{ background: "var(--color-gray-100)", minHeight: "70vh", padding: "40px 0 80px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "32px", alignItems: "start" }} className="products-layout">

            {/* ── SOL SIDEBAR ── */}
            <aside
              style={{
                background: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                padding: "28px",
                position: "sticky",
                top: "88px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-black)",
                  }}
                >
                  Filtrele
                </h2>
                <SlidersHorizontal size={16} color="var(--color-gray-400)" />
              </div>

              {/* Kategoriler */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-black)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Kategoriler
                  </h3>
                  <ChevronDown size={14} color="var(--color-gray-400)" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {kategoriler.map((kat) => (
                    <label
                      key={kat}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        color: selectedKategori === kat ? "var(--color-green)" : "var(--color-gray-600)",
                        fontWeight: selectedKategori === kat ? 600 : 400,
                      }}
                    >
                      <input
                        type="radio"
                        name="kategori"
                        checked={selectedKategori === kat}
                        onChange={() => setSelectedKategori(kat)}
                        style={{ accentColor: "var(--color-gold)", width: 15, height: 15 }}
                      />
                      {kat}
                    </label>
                  ))}
                </div>
              </div>

              {/* Ayırıcı */}
              <div style={{ height: 1, background: "var(--color-border)", marginBottom: "24px" }} />

              {/* Fiyat Aralığı */}
              <div style={{ marginBottom: "28px" }}>
                <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-black)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
                  Fiyat Aralığı
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="number"
                    placeholder="min"
                    value={minFiyat}
                    onChange={(e) => setMinFiyat(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8rem",
                      fontFamily: "var(--font-body)",
                      outline: "none",
                    }}
                  />
                  <span style={{ color: "var(--color-gray-400)", fontSize: "0.8rem" }}>—</span>
                  <input
                    type="number"
                    placeholder="max"
                    value={maxFiyat}
                    onChange={(e) => setMaxFiyat(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8rem",
                      fontFamily: "var(--font-body)",
                      outline: "none",
                    }}
                  />
                </div>
                {/* Gold slider göstergesi */}
                <div style={{ height: 3, background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))", borderRadius: "2px", marginTop: "12px" }} />
              </div>

              {/* Ayırıcı */}
              <div style={{ height: 1, background: "var(--color-border)", marginBottom: "24px" }} />

              {/* Boyut */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-black)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Boyut
                  </h3>
                  <ChevronDown size={14} color="var(--color-gray-400)" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {boyutlar.map((b) => (
                    <label
                      key={b}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        color: "var(--color-gray-600)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBoyutlar.includes(b)}
                        onChange={(e) =>
                          setSelectedBoyutlar((prev) =>
                            e.target.checked ? [...prev, b] : prev.filter((x) => x !== b)
                          )
                        }
                        style={{ accentColor: "var(--color-gold)", width: 15, height: 15 }}
                      />
                      {b}ml
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtreleri Temizle */}
              <button
                id="clear-filters"
                onClick={resetFilters}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-gold-dark)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Filtreleri Temizle
              </button>
            </aside>

            {/* ── SAĞ: ÜRÜN GRID ── */}
            <div>
              {/* Arama kutusu */}
              <div style={{ position: "relative", marginBottom: "20px" }}>
                <Search
                  size={16}
                  color="var(--color-gray-400)"
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  id="urun-arama"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün ara… (ör. erken hasat, organik)"
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 40px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem",
                    fontFamily: "var(--font-body)",
                    background: "var(--color-white)",
                    outline: "none",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Aramayı temizle"
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-gray-400)",
                      display: "flex",
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Üst bar: sonuç sayısı + sıralama */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <p style={{ fontSize: "0.85rem", color: "var(--color-gray-400)" }}>
                  <strong style={{ color: "var(--color-black)" }}>{filtered.length}</strong> ürün listeleniyor
                  {searchQuery && (
                    <>
                      {" "}
                      — <strong style={{ color: "var(--color-black)" }}>&ldquo;{searchQuery}&rdquo;</strong> için
                    </>
                  )}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>Sırala:</span>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: "8px 32px 8px 12px",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                      fontFamily: "var(--font-body)",
                      background: "var(--color-white)",
                      cursor: "pointer",
                      outline: "none",
                      appearance: "auto",
                    }}
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ürün Grid */}
              {filtered.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {filtered.map((urun) => (
                    <Link key={urun.id} href={`/urunler/${urun.slug}`} style={{ textDecoration: "none" }}>
                      <ProductCard urun={urun} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-gray-400)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🫒</div>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem" }}>
                    Bu filtreye uygun ürün bulunamadı
                  </p>
                  <button
                    onClick={resetFilters}
                    style={{
                      marginTop: "16px",
                      background: "var(--color-green)",
                      color: "var(--color-cream)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px 24px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .products-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
