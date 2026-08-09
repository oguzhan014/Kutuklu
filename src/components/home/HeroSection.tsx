"use client";

import Link from "next/link";
import { ArrowRight, Shield, Leaf, Thermometer, Sparkles, Droplets, Award } from "lucide-react";

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
          backgroundImage: `radial-gradient(circle at 75% 45%, rgba(212, 175, 55, 0.15) 0%, transparent 60%),
                            radial-gradient(circle at 15% 75%, rgba(47, 79, 47, 0.1) 0%, transparent 55%)`,
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
            gridTemplateColumns: "1fr 1.05fr",
            gap: "56px",
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
                background: "rgba(212, 175, 55, 0.15)",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                padding: "6px 16px",
                borderRadius: "30px",
                marginBottom: "22px",
                backdropFilter: "blur(6px)",
              }}
            >
              <Sparkles size={14} color="var(--color-gold-dark)" />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.74rem",
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
              <Link href="/urunler" className="btn-gold" style={{ boxShadow: "0 8px 24px rgba(212, 175, 55, 0.35)" }}>
                Koleksiyonu Keşfet
                <ArrowRight size={16} />
              </Link>
              <Link href="/hikayemiz" className="btn-outline" style={{ background: "rgba(255,255,255,0.7)" }}>
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
                borderTop: "1px solid rgba(212, 175, 55, 0.3)",
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

          {/* Sağ: Gerçek Fotoğrafik Şişe Vitrini */}
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
                width: "480px",
                height: "480px",
                background: "radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(47,79,47,0.08) 50%, transparent 70%)",
                borderRadius: "50%",
              }}
            />

            {/* Gerçek Fotoğrafik Vitrin Kartı */}
            <div
              className="float-slow"
              style={{
                position: "relative",
                zIndex: 2,
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: "0 30px 70px rgba(47, 79, 47, 0.22), 0 0 0 1px rgba(212, 175, 55, 0.4)",
                maxWidth: "460px",
                width: "100%",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-bottle-real.png"
                alt="Kütüklü 1950 Erken Hasat Soğuk Sıkım Natürel Sızma Zeytinyağı"
                style={{
                  width: "100%",
                  height: "480px",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Alt Cam Etiket Şeridi */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(180deg, rgba(28, 28, 28, 0) 0%, rgba(20, 30, 20, 0.92) 100%)",
                  padding: "32px 24px 20px 24px",
                  color: "var(--color-cream)",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-gold-light)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Özel Seri • 500ml Cam Şişe
                  </div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 600 }}>
                    Kütüklü Erken Hasat
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(212, 175, 55, 0.25)",
                    border: "1px solid var(--color-gold)",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-gold-light)",
                  }}
                >
                  ≤ %0.28 Asit
                </div>
              </div>
            </div>

            {/* Sol Üst Floating Badge */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "-12px",
                zIndex: 3,
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                padding: "10px 16px",
                borderRadius: "14px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span className="green-pulse-dot" />
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>
                  Yeni Sezon Hasadı
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-green)" }}>
                  2026 Taze Sıkım
                </div>
              </div>
            </div>

            {/* Sağ Alt Floating Badge */}
            <div
              style={{
                position: "absolute",
                bottom: "-15px",
                right: "-12px",
                zIndex: 3,
                background: "linear-gradient(135deg, var(--color-green) 0%, #152215 100%)",
                border: "1px solid var(--color-gold)",
                color: "var(--color-cream)",
                padding: "12px 18px",
                borderRadius: "14px",
                boxShadow: "0 12px 30px rgba(47,79,47,0.35)",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Award size={20} color="var(--color-gold-light)" />
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-gold-light)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Garanti
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: 800 }}>%100 Saf & Doğal</div>
              </div>
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
