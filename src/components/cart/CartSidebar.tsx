"use client";

import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useCartHydrated } from "@/lib/use-cart-hydrated";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const FREE_SHIPPING_THRESHOLD = 500;

export function CartSidebar() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem } = useCartStore();

  const hydrated = useCartHydrated();
  if (!hydrated) return null;

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);
  const shippingProgress = Math.min(100, (totalAmount / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <>
      {/* Karartma / Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 999,
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Sepet Çekmecesi */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "100%",
          maxWidth: "420px",
          background: "var(--color-white)",
          zIndex: 1000,
          boxShadow: "-15px 0 40px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Başlık */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-cream)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShoppingBag size={20} color="var(--color-green)" />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.35rem", fontWeight: 600, color: "var(--color-black)" }}>
              Alışveriş Sepetim
            </h2>
            <span
              style={{
                background: "var(--color-gold)",
                color: "var(--color-black)",
                fontSize: "0.75rem",
                fontWeight: 800,
                padding: "3px 9px",
                borderRadius: "20px",
              }}
            >
              {items.reduce((t, i) => t + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-gray-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
            }}
            aria-label="Sepeti Kapat"
          >
            <X size={22} />
          </button>
        </div>

        {/* Ücretsiz Kargo İlerleme Çubuğu */}
        <div
          style={{
            background: "#FBF9F2",
            borderBottom: "1px solid var(--color-border)",
            padding: "12px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "6px" }}>
            <Truck size={15} color="var(--color-green)" />
            {remainingForFreeShipping === 0 ? (
              <span style={{ color: "var(--color-green)" }}>🎉 Tebrikler! <strong>Ücretsiz Kargo</strong> kazandınız.</span>
            ) : (
              <span>Ücretsiz Kargo için <strong>{formatPrice(remainingForFreeShipping)}</strong> daha ürün ekleyin.</span>
            )}
          </div>
          <div style={{ width: "100%", height: 6, background: "var(--color-gray-200)", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                width: `${shippingProgress}%`,
                height: "100%",
                background: remainingForFreeShipping === 0 ? "var(--color-green)" : "var(--color-gold)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Sepet İçeriği */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", color: "var(--color-gray-400)", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingBag size={32} color="var(--color-gold-dark)" />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", color: "var(--color-black)", marginBottom: "4px" }}>
                  Sepetiniz Henüz Boş
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
                  Ege&apos;nin en taze zeytinyağlarını keşfetmeye başlayın.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-gold"
                style={{ marginTop: "8px", fontSize: "0.8rem", padding: "10px 24px" }}
              >
                Ürünleri İncele
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "14px",
                    borderBottom: "1px solid var(--color-border)",
                    paddingBottom: "16px",
                  }}
                >
                  {/* Görsel */}
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      background: "var(--color-cream)",
                      borderRadius: "8px",
                      position: "relative",
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill style={{ objectFit: "contain", padding: "4px" }} />
                    ) : (
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--color-gold-dark)" }}>K</span>
                    )}
                  </div>

                  {/* Detaylar */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", fontWeight: 600, color: "var(--color-black)", lineHeight: 1.25, marginBottom: "2px" }}>
                          {item.name}
                        </h4>
                        {(item.variantLabel || item.volume > 0) && (
                          <div style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", fontWeight: 600 }}>
                            {item.variantLabel || `${item.volume}ml`}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ background: "none", border: "none", color: "var(--color-gray-400)", cursor: "pointer", padding: "4px" }}
                        aria-label="Ürünü Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                      {/* Miktar Kontrol */}
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-border)", borderRadius: "4px", background: "var(--color-white)" }}>
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", color: "var(--color-gray-600)" }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, width: "22px", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", color: "var(--color-gray-600)" }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Fiyat */}
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", fontWeight: 700, color: "var(--color-black)" }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt Kısım / Checkout Aksiyonu */}
        {items.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              background: "var(--color-white)",
              borderTop: "1px solid var(--color-border)",
              boxShadow: "0 -6px 25px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--color-gray-600)" }}>Ara Toplam</span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 700, color: "var(--color-black)" }}>
                {formatPrice(totalAmount)}
              </span>
            </div>

            <Link href="/checkout" onClick={() => setIsOpen(false)} style={{ textDecoration: "none", display: "block" }}>
              <button
                style={{
                  width: "100%",
                  background: "var(--color-green)",
                  color: "var(--color-cream)",
                  border: "none",
                  padding: "15px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(40, 66, 40, 0.3)",
                }}
              >
                Siparişi Tamamla <ArrowRight size={17} />
              </button>
            </Link>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px", fontSize: "0.72rem", color: "var(--color-gray-500)" }}>
              <ShieldCheck size={14} color="var(--color-green)" />
              <span>256-Bit SSL ile %100 Güvenli Ödeme</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
