"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, Loader2, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/lib/use-wishlist";
import { formatPrice } from "@/lib/utils";

export function WishlistContent() {
  const { items, hydrated, remove: removeItem } = useWishlist();

  if (!hydrated) {
    return (
      <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={30} className="spin" color="var(--color-gray-400)" />
        <style>{`.spin{animation:kutuklu-spin 1s linear infinite}@keyframes kutuklu-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: "40vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <Heart size={64} color="var(--color-gray-400)" strokeWidth={1.2} />
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.8rem",
            color: "var(--color-black)",
            margin: "20px 0 12px",
          }}
        >
          Favori Listeniz Boş
        </h1>
        <p style={{ color: "var(--color-gray-600)", marginBottom: "24px" }}>
          Beğendiğiniz ürünleri kalp ikonuna tıklayarak buraya ekleyebilirsiniz.
        </p>
        <Link
          href="/urunler"
          style={{
            background: "var(--color-green)",
            color: "white",
            padding: "13px 32px",
            borderRadius: "4px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Ürünleri Keşfet
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "24px",
      }}
    >
      {items.map((item) => (
        <div
          key={item.productId}
          style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Link href={`/urunler/${item.slug}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                position: "relative",
                height: 200,
                background: "linear-gradient(160deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
              }}
            >
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="240px"
                style={{ objectFit: "contain", padding: "20px" }}
              />
            </div>
          </Link>

          <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
            <Link
              href={`/urunler/${item.slug}`}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--color-black)",
                textDecoration: "none",
                marginBottom: "6px",
              }}
            >
              {item.name}
            </Link>

            {item.volume && (
              <span style={{ fontSize: "0.78rem", color: "var(--color-gray-500)", marginBottom: "10px" }}>
                {item.volume}ml
              </span>
            )}

            <div
              style={{
                marginTop: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                paddingTop: "12px",
              }}
            >
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", fontWeight: 600, color: "var(--color-black)" }}>
                {item.priceIsRange && (
                  <span style={{ display: "block", fontSize: "0.62rem", fontWeight: 500, color: "var(--color-gray-500)" }}>
                    Başlayan
                  </span>
                )}
                {formatPrice(item.price)}
              </span>

              <div style={{ display: "flex", gap: "8px" }}>
                <Link
                  href={`/urunler/${item.slug}`}
                  aria-label={`${item.name} ürününü incele`}
                  style={{
                    background: "var(--color-green)",
                    color: "var(--color-cream)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "9px 11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                >
                  <ShoppingBag size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`${item.name} ürününü favorilerden kaldır`}
                  style={{
                    background: "none",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "9px 11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-gray-500)",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
