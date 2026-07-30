"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Leaf, Thermometer } from "lucide-react";

const badges = [
  { Icon: Leaf, label: "Ücretsiz Kargo" },
  { Icon: Shield, label: "Organik Sertifikalı" },
  { Icon: Thermometer, label: "Soğuk Sıkım" },
  { Icon: Leaf, label: "Doğal Üretim" },
];

export function HeroSection() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, var(--color-cream) 0%, #EDE8D8 50%, #F0ECD8 100%)",
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Ana sayfa hero bölümü"
    >
      {/* Dekoratif arka plan doku */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 70% 50%, rgba(212, 175, 55, 0.06) 0%, transparent 60%),
                            radial-gradient(circle at 20% 80%, rgba(47, 79, 47, 0.05) 0%, transparent 50%)`,
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
          padding: "48px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            alignItems: "center",
            width: "100%",
          }}
          className="hero-grid"
        >
          {/* Sol: Metin */}
          <div style={{ animation: "fadeInUp 0.7s ease forwards" }}>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                display: "block",
                marginBottom: "20px",
              }}
            >
              ✦ Erken Hasat | Soğuk Sıkım | Sıcak Sıkım | Natürel Sızma
            </span>

            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
                fontWeight: 500,
                color: "var(--color-black)",
                lineHeight: 1.15,
                marginBottom: "24px",
                letterSpacing: "-0.01em",
              }}
            >
              Köyden Sofraya,
              <br />
              <em style={{ fontStyle: "italic", color: "var(--color-green)" }}>
                Doğanın Saflığı
              </em>
            </h1>

            <p
              style={{
                fontSize: "1rem",
                color: "var(--color-gray-600)",
                lineHeight: 1.75,
                marginBottom: "36px",
                maxWidth: "460px",
              }}
            >
              Kütüklü Köyü&apos;nün bereketli topraklarından, nesiller boyu süren aile geleneğiyle üretilen, katkısız natürel sızma zeytinyağımızı keşfedin.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/urunler" className="btn-gold">
                Hemen Keşfet
                <ArrowRight size={16} />
              </Link>
              <Link href="/hikayemiz" className="btn-outline">
                Hikayemiz
              </Link>
            </div>

            {/* Küçük güven unsurları */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginTop: "48px",
                flexWrap: "wrap",
              }}
            >
              {[
                { value: "100%", label: "Doğal & Katkısız" },
                { value: "≤27°C", label: "Soğuk Sıkım" },
                { value: "500+", label: "Mutlu Müşteri" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.8rem",
                      fontWeight: 600,
                      color: "var(--color-green)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      letterSpacing: "0.05em",
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

          {/* Sağ: Ürün Görseli */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              animation: "fadeInUp 0.7s 0.2s ease both",
            }}
          >
            {/* Altın hale efekti */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: "400px",
                height: "400px",
                background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 20px 40px rgba(47, 79, 47, 0.15))",
              }}
            >
              {/* Gerçek ürün görseli buraya gelecek */}
              <div
                style={{
                  width: 320,
                  height: 460,
                  background: "linear-gradient(135deg, rgba(47,79,47,0.08) 0%, rgba(212,175,55,0.05) 100%)",
                  borderRadius: "12px",
                  border: "1px solid rgba(212,175,55,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                }}
              >
                <Leaf size={80} color="var(--color-green)" strokeWidth={1} />
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.8rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                    }}
                  >
                    Kütüklü
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      letterSpacing: "0.1em",
                      color: "var(--color-gray-500)",
                      textTransform: "uppercase",
                    }}
                  >
                    Natürel Sızma Zeytinyağı
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "0.75rem",
                      color: "var(--color-gold)",
                      fontWeight: 600,
                    }}
                  >
                    500 ml
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "10px",
                background: "var(--color-green)",
                color: "var(--color-cream)",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textAlign: "center",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>ERKEN</div>
              <div>HASAT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Özellik Bandı */}
      <div
        style={{
          background: "var(--color-green)",
          padding: "20px 24px",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: "16px",
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
                    letterSpacing: "0.05em",
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
