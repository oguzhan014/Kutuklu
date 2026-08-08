import React from "react";
import { Sparkles, Leaf, Award, ShieldCheck, Flame, HeartHandshake } from "lucide-react";

interface TickerItem {
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  text: string;
  badge?: string;
}

const tickerItems: TickerItem[] = [
  { icon: Sparkles, text: "2026 Erken Hasat", badge: "YENİ MAHSUL" },
  { icon: Leaf, text: "Asit Oranı ≤ %0.3", badge: "EKSTRA DÜŞÜK" },
  { icon: Award, text: "Soğuk Sıkım (≤27°C)", badge: "BESİN DEĞERİ KORUNAN" },
  { icon: ShieldCheck, text: "Kütüklü Köyü / Ege Toprakları", badge: "KÖYDEN DİREKT" },
  { icon: Flame, text: "Polifenol 450+ mg/kg", badge: "YÜKSEK ANTİOKSİDAN" },
  { icon: HeartHandshake, text: "100% Doğal & Filtresiz", badge: "KATKISIZ SAF" },
  { icon: Leaf, text: "Coğrafi İşaretli Ege Zeytini", badge: "MENŞE GARANTİLİ" },
];

export function MarqueeTicker() {
  return (
    <div
      aria-label="Kütüklü Zeytinyağı Özellikleri ve Hasat Bilgileri"
      style={{
        background: "linear-gradient(90deg, #1C1C1C 0%, #243524 50%, #1C1C1C 100%)",
        borderTop: "1px solid rgba(212, 175, 55, 0.35)",
        borderBottom: "1px solid rgba(212, 175, 55, 0.35)",
        padding: "14px 0",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        zIndex: 5,
      }}
    >
      {/* Hafif altın parlama ızgarası */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(212, 175, 55, 0.08) 0%, transparent 80%)",
          pointerEvents: "none",
        }}
      />

      <div className="marquee-container">
        {/* Track 1 */}
        <div className="marquee-content" style={{ display: "flex", alignItems: "center", gap: "40px", paddingRight: "40px" }}>
          {tickerItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`track1-${idx}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "var(--color-cream)",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-body)",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(212, 175, 55, 0.15)",
                    border: "1px solid rgba(212, 175, 55, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color="var(--color-gold)" />
                </div>

                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-cream)",
                  }}
                >
                  {item.text}
                </span>

                {item.badge && (
                  <span
                    style={{
                      background: "rgba(212, 175, 55, 0.2)",
                      border: "1px solid rgba(212, 175, 55, 0.5)",
                      color: "var(--color-gold-light)",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      padding: "2px 7px",
                      borderRadius: "3px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                <span style={{ color: "rgba(212, 175, 55, 0.4)", fontSize: "1.1rem", margin: "0 10px" }}>
                  ✦
                </span>
              </div>
            );
          })}
        </div>

        {/* Track 2 (Kesintisiz sonsuz döngü için klon) */}
        <div aria-hidden="true" className="marquee-content" style={{ display: "flex", alignItems: "center", gap: "40px", paddingRight: "40px" }}>
          {tickerItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`track2-${idx}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "var(--color-cream)",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-body)",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(212, 175, 55, 0.15)",
                    border: "1px solid rgba(212, 175, 55, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color="var(--color-gold)" />
                </div>

                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-cream)",
                  }}
                >
                  {item.text}
                </span>

                {item.badge && (
                  <span
                    style={{
                      background: "rgba(212, 175, 55, 0.2)",
                      border: "1px solid rgba(212, 175, 55, 0.5)",
                      color: "var(--color-gold-light)",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      padding: "2px 7px",
                      borderRadius: "3px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                <span style={{ color: "rgba(212, 175, 55, 0.4)", fontSize: "1.1rem", margin: "0 10px" }}>
                  ✦
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
