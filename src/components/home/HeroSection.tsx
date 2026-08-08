"use client";

import Link from "next/link";
import { ArrowRight, Shield, Leaf, Thermometer, Sparkles, Droplets } from "lucide-react";

const badges = [
  { Icon: Leaf, label: "Ücretsiz Kargo (500₺+)" },
  { Icon: Shield, label: "Organik Sertifikalı" },
  { Icon: Thermometer, label: "Soğuk Sıkım (≤27°C)" },
  { Icon: Droplets, label: "Asitlik ≤ %0.28" },
];

export function HeroSection() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #F9F6EE 0%, #EDE6D2 50%, #F4EEDC 100%)",
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Ana sayfa hero bölümü"
    >
      {/* Dekoratif arka plan doku & ışık */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 75% 45%, rgba(212, 175, 55, 0.12) 0%, transparent 60%),
                            radial-gradient(circle at 15% 75%, rgba(47, 79, 47, 0.08) 0%, transparent 55%)`,
          pointerEvents: "none",
        }}
      />

      {/* Hero İçerik */}
      <div
        className="container"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "56px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "64px",
            alignItems: "center",
            width: "100%",
          }}
          className="hero-grid"
        >
          {/* Sol: Metin */}
          <div style={{ animation: "fadeInUp 0.7s ease forwards" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(212, 175, 55, 0.12)",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                padding: "6px 14px",
                borderRadius: "20px",
                marginBottom: "22px",
              }}
            >
              <Sparkles size={13} color="var(--color-gold-dark)" />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-gold-dark)",
                }}
              >
                2026 Erken Hasat & Soğuk Sıkım
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.8rem, 5.2vw, 4.6rem)",
                fontWeight: 500,
                color: "var(--color-black)",
                lineHeight: 1.12,
                marginBottom: "24px",
                letterSpacing: "-0.015em",
              }}
            >
              Köyden Sofraya,
              <br />
              <em style={{ fontStyle: "italic", color: "var(--color-green)" }}>
                Doğanın Saf Altını
              </em>
            </h1>

            <p
              style={{
                fontSize: "1.05rem",
                color: "var(--color-gray-600)",
                lineHeight: 1.8,
                marginBottom: "36px",
                maxWidth: "480px",
              }}
            >
              Kütüklü Köyü&apos;nün yüzyıllık asırlık zeytin ağaçlarından, dalından toplandığı gün soğuk sıkım yöntemiyle işlenen katkısız natürel sızma zeytinyağı.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/urunler" className="btn-gold">
                Koleksiyonu Keşfet
                <ArrowRight size={16} />
              </Link>
              <Link href="/hikayemiz" className="btn-outline">
                Bizim Hikayemiz
              </Link>
            </div>

            {/* Küçük güven unsurları */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginTop: "48px",
                paddingTop: "32px",
                borderTop: "1px solid rgba(212, 175, 55, 0.2)",
                maxWidth: "480px",
              }}
            >
              {[
                { value: "%0.28", label: "Düşük Asitlik" },
                { value: "≤27°C", label: "Soğuk Sıkım" },
                { value: "100%", label: "Doğal & Katkısız" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.9rem",
                      fontWeight: 700,
                      color: "var(--color-green)",
                      lineHeight: 1,
                      marginBottom: "4px",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: "var(--color-gray-500)",
                      textTransform: "uppercase",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ: Ürün Görseli ve Canlı Derinlik Katmanı */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              animation: "fadeInUp 0.7s 0.2s ease both",
            }}
          >
            {/* Altın Parıltı Halesi */}
            <div
              aria-hidden="true"
              className="pulse-glow"
              style={{
                position: "absolute",
                width: "420px",
                height: "420px",
                background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(47,79,47,0.06) 50%, transparent 70%)",
                borderRadius: "50%",
              }}
            />

            {/* Şişe Mockup Kartı */}
            <div
              className="float-slow"
              style={{
                position: "relative",
                zIndex: 2,
                filter: "drop-shadow(0 25px 50px rgba(47, 79, 47, 0.18))",
              }}
            >
              <div
                style={{
                  width: 320,
                  height: 460,
                  background: "linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(245,241,232,0.65) 100%)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: "20px",
                  border: "1px solid rgba(212,175,55,0.35)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                  padding: "32px",
                  boxShadow: "0 20px 40px rgba(28,28,28,0.06)",
                }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--color-green) 0%, #1c331c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(47, 79, 47, 0.25)",
                  }}
                >
                  <Leaf size={48} color="var(--color-gold)" strokeWidth={1.5} />
                </div>

                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "2rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Kütüklü
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      letterSpacing: "0.15em",
                      color: "var(--color-green)",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      marginTop: "4px",
                    }}
                  >
                    Natürel Sızma Zeytinyağı
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      display: "inline-block",
                      background: "rgba(212,175,55,0.15)",
                      border: "1px solid rgba(212,175,55,0.4)",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "0.72rem",
                      color: "var(--color-gold-dark)",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    ✦ ERKEN HASAT · 500 ML ✦
                  </div>
                </div>
              </div>
            </div>

            {/* Sol Üst Floating Badge */}
            <div
              style={{
                position: "absolute",
                top: "30px",
                left: "-10px",
                zIndex: 3,
                background: "var(--color-white)",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                padding: "10px 16px",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span className="green-pulse-dot" />
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>
                  Yeni Sezon
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-green)" }}>
                  2026 Hasadı
                </div>
              </div>
            </div>

            {/* Sağ Alt Floating Badge */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "-10px",
                zIndex: 3,
                background: "var(--color-green)",
                color: "var(--color-cream)",
                padding: "12px 18px",
                borderRadius: "10px",
                boxShadow: "0 12px 30px rgba(47,79,47,0.3)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Asitlik Oranı
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>≤ %0.28</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Güven & Özellik Bandı */}
      <div
        style={{
          background: "var(--color-green)",
          padding: "18px 24px",
          borderTop: "1px solid rgba(212, 175, 55, 0.2)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: "18px",
            }}
          >
            {badges.map(({ Icon, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--color-cream)",
                }}
              >
                <Icon size={18} color="var(--color-gold)" />
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

