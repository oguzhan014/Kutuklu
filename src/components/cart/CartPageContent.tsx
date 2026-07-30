"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  Truck,
} from "lucide-react";

import { useCartStore } from "@/lib/store";
import { useCartHydrated } from "@/lib/use-cart-hydrated";
import { formatPrice } from "@/lib/utils";
import { getCartSummary, type CartSummary } from "@/app/actions/checkout";

/**
 * Sepet sayfası.
 *
 * Gösterilen fiyat ve toplamlar sunucudan doğrulanmış hâlde gelir; tarayıcıdaki
 * localStorage verisi yalnızca "hangi üründen kaç adet" bilgisini taşır.
 * Böylece eski/oynanmış bir sepet kaydı yanlış fiyat gösteremez.
 */
export function CartPageContent() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const hydrated = useCartHydrated();

  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const serverItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
      })),
    [items]
  );

  const cartKey = useMemo(
    () =>
      serverItems
        .map((item) => `${item.productId}:${item.quantity}`)
        .sort()
        .join("|"),
    [serverItems]
  );

  const refresh = useCallback(() => {
    // Sepet boşsa istek atmaya gerek yok; bu durumda zaten boş sepet ekranı
    // çizilir ve `summary` hiç okunmaz.
    if (serverItems.length === 0) return;

    startTransition(async () => {
      const result = await getCartSummary(serverItems, null);
      if (result.ok) {
        setSummary(result);
        setError(null);
      } else {
        setSummary(null);
        setError(result.error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey]);

  useEffect(() => {
    if (!hydrated) return;
    refresh();
  }, [hydrated, refresh]);

  if (!hydrated) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={30} className="spin" color="var(--color-gray-400)" />
        <style>{`.spin{animation:kutuklu-spin 1s linear infinite}@keyframes kutuklu-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <ShoppingBag size={64} color="var(--color-gray-400)" strokeWidth={1.2} />
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2rem",
            color: "var(--color-black)",
            margin: "20px 0 12px",
          }}
        >
          Sepetiniz Boş
        </h1>
        <p style={{ color: "var(--color-gray-600)", marginBottom: "24px" }}>
          Henüz sepetinize ürün eklemediniz.
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
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  const remainingForFreeShipping =
    summary && summary.shipping > 0
      ? Math.max(0, summary.freeShippingThreshold - (summary.subtotal - summary.discount))
      : 0;

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px" }}
      className="cart-grid"
    >
      {/* Ürün listesi */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && (
          <div
            style={{
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              padding: "14px 18px",
              borderRadius: "8px",
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={17} /> {error}
          </div>
        )}

        {(summary?.lines ?? []).map((line) => {
          // productId tek başına ayırt edici değildir: aynı varyasyonlu
          // ürünün farklı iki varyantı sepette ayrı satırlar olabilir.
          const cartItem = items.find(
            (item) => item.productId === line.productId && (item.variantId ?? null) === line.variantId
          );
          if (!cartItem) return null;

          const isOverStock = line.stock < line.quantity;

          return (
            <div
              key={cartItem.id}
              style={{
                background: "var(--color-white)",
                border: `1px solid ${isOverStock ? "#FCA5A5" : "var(--color-border)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                display: "flex",
                gap: "18px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  background: "var(--color-cream)",
                  borderRadius: "8px",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={line.imageUrl}
                  alt={line.name}
                  fill
                  sizes="88px"
                  style={{ objectFit: "contain", padding: "8px" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/urunler/${line.slug}`}
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "var(--color-black)",
                    textDecoration: "none",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  {line.name}
                </Link>

                {(line.variantLabel || line.volume) && (
                  <div style={{ fontSize: "0.78rem", color: "var(--color-gray-500)", marginBottom: "6px" }}>
                    {line.variantLabel || `${line.volume} ml`}
                  </div>
                )}

                <div style={{ fontSize: "0.85rem", color: "var(--color-gray-600)" }}>
                  Birim: {formatPrice(line.unitPrice)}
                </div>

                {isOverStock && (
                  <div style={{ fontSize: "0.78rem", color: "#DC2626", fontWeight: 600, marginTop: "6px" }}>
                    Stokta yalnızca {line.stock} adet kaldı
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(cartItem.id, Math.max(1, line.quantity - 1))}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "8px 12px",
                        cursor: "pointer",
                        color: "var(--color-gray-600)",
                        display: "flex",
                      }}
                      aria-label="Azalt"
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ width: 30, textAlign: "center", fontWeight: 600, fontSize: "0.9rem" }}>
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(cartItem.id, line.quantity + 1)}
                      disabled={line.quantity >= line.stock}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "8px 12px",
                        cursor: line.quantity >= line.stock ? "not-allowed" : "pointer",
                        color: "var(--color-gray-600)",
                        opacity: line.quantity >= line.stock ? 0.4 : 1,
                        display: "flex",
                      }}
                      aria-label="Artır"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(cartItem.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-gray-400)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.82rem",
                      fontFamily: "inherit",
                    }}
                  >
                    <Trash2 size={15} /> Kaldır
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatPrice(line.lineTotal)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Özet */}
      <div>
        <div
          style={{
            position: "sticky",
            top: "100px",
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "28px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--color-black)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            Sipariş Özeti
            {pending && <Loader2 size={16} className="spin" color="var(--color-gray-400)" />}
          </h2>

          {remainingForFreeShipping > 0 && (
            <div
              style={{
                background: "var(--color-cream)",
                border: "1px solid var(--color-gold)",
                borderRadius: "8px",
                padding: "12px 14px",
                fontSize: "0.82rem",
                color: "var(--color-gray-700)",
                marginBottom: "18px",
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
                lineHeight: 1.5,
              }}
            >
              <Truck size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>
                <strong>{formatPrice(remainingForFreeShipping)}</strong> daha ekleyin, kargo
                bedava olsun!
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--color-gray-600)" }}>
              <span>Ara Toplam</span>
              <span style={{ fontWeight: 500 }}>{formatPrice(summary?.subtotal ?? 0)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--color-gray-600)" }}>
              <span>Kargo</span>
              <span
                style={{
                  fontWeight: 500,
                  color: summary?.shipping === 0 ? "var(--color-green)" : "inherit",
                }}
              >
                {summary?.shipping === 0 ? "Ücretsiz" : formatPrice(summary?.shipping ?? 0)}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "22px",
            }}
          >
            <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-black)" }}>
              Toplam
            </span>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.7rem",
                fontWeight: 600,
                color: "var(--color-black)",
              }}
            >
              {formatPrice(summary?.total ?? 0)}
            </span>
          </div>

          <Link href="/checkout" style={{ textDecoration: "none" }}>
            <button
              type="button"
              disabled={!summary || pending}
              style={{
                width: "100%",
                background: !summary ? "var(--color-gray-400)" : "var(--color-green)",
                color: "white",
                border: "none",
                padding: "15px",
                borderRadius: "4px",
                fontSize: "1rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: !summary ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              Ödemeye Geç <ArrowRight size={18} />
            </button>
          </Link>

          <Link
            href="/urunler"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "14px",
              fontSize: "0.85rem",
              color: "var(--color-gray-600)",
              textDecoration: "none",
            }}
          >
            Alışverişe devam et
          </Link>

          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--color-gray-400)",
              textAlign: "center",
              marginTop: "16px",
              lineHeight: 1.5,
            }}
          >
            Fiyatlar KDV dâhildir. İndirim kodunuzu ödeme adımında girebilirsiniz.
          </p>
        </div>
      </div>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
