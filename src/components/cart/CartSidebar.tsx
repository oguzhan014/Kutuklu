"use client";

import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useCartHydrated } from "@/lib/use-cart-hydrated";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export function CartSidebar() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem } = useCartStore();

  // Sepet localStorage'dan yüklenene kadar çizme (hidrasyon uyuşmazlığı önlemi).
  const hydrated = useCartHydrated();

  if (!hydrated) return null;

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "100%",
          maxWidth: "400px",
          background: "var(--color-white)",
          zIndex: 1000,
          boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-cream)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShoppingBag size={20} color="var(--color-black)" />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 600, color: "var(--color-black)" }}>
              Sepetim
            </h2>
            <span style={{ background: "var(--color-gold)", color: "var(--color-white)", fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "20px" }}>
              {items.length}
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
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", color: "var(--color-gray-400)" }}>
              <ShoppingBag size={48} strokeWidth={1} />
              <p style={{ fontSize: "1rem", fontWeight: 500 }}>Sepetiniz şu an boş.</p>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "var(--color-gold)",
                  color: "var(--color-white)",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "4px",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "20px" }}>
                  {/* Image */}
                  <div style={{ width: 80, height: 80, background: "var(--color-cream)", borderRadius: "8px", position: "relative", overflow: "hidden" }}>
                    <Image src={item.imageUrl} alt={item.name} fill style={{ objectFit: "contain", padding: "8px" }} />
                  </div>
                  
                  {/* Info */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 600, color: "var(--color-black)", lineHeight: 1.2, marginBottom: "4px" }}>
                          {item.name}
                        </h3>
                        {(item.variantLabel || item.volume > 0) && (
                          <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", fontWeight: 500 }}>
                            {item.variantLabel || `${item.volume}ml`}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ background: "none", border: "none", color: "var(--color-gray-400)", cursor: "pointer", padding: "4px" }}
                        aria-label="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                      {/* Quantity Control */}
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-border)", borderRadius: "4px" }}>
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          style={{ background: "none", border: "none", padding: "6px 10px", cursor: "pointer", color: "var(--color-gray-600)" }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, width: "24px", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ background: "none", border: "none", padding: "6px 10px", cursor: "pointer", color: "var(--color-gray-600)" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price */}
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 600, color: "var(--color-black)" }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "24px", background: "var(--color-white)", borderTop: "1px solid var(--color-border)", boxShadow: "0 -4px 20px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "1.1rem", color: "var(--color-black)" }}>
              <span>Ara Toplam</span>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}>{formatPrice(totalAmount)}</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginBottom: "20px", textAlign: "center" }}>
              Kargo ve vergiler ödeme adımında hesaplanacaktır.
            </p>
            <Link href="/checkout" onClick={() => setIsOpen(false)} style={{ textDecoration: "none" }}>
              <button
                style={{
                  width: "100%",
                  background: "var(--color-green)",
                  color: "var(--color-white)",
                  border: "none",
                  padding: "16px",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                Siparişi Tamamla <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
