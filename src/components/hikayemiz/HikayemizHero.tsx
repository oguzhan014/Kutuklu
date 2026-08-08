"use client";

import { Leaf, Award, MapPin, Sparkles } from "lucide-react";

export function HikayemizHero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "560px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #1C261C 0%, #203320 40%, #152215 100%)",
        color: "var(--color-cream)",
        padding: "100px 0 80px 0",
      }}
      aria-label="Kütüklü Hikayemiz Giriş"
    >
      {/* Dekoratif Altın Işık Hüzmeleri */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 10% 80%, rgba(47, 79, 47, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 90% 70%, rgba(212, 175, 55, 0.08) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: "860px" }}>
        {/* Üst Rozet */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(212, 175, 55, 0.15)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            padding: "8px 18px",
            borderRadius: "30px",
            marginBottom: "28px",
            backdropFilter: "blur(8px)",
          }}
        >
          <Sparkles size={15} color="var(--color-gold-light)" />
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-gold-light)",
            }}
          >
            1950&apos;den Bugüne Üç Kuşaklık Aile Mirası
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.6rem, 5.5vw, 4.4rem)",
            fontWeight: 500,
            color: "var(--color-cream)",
            lineHeight: 1.15,
            marginBottom: "20px",
            letterSpacing: "-0.01em",
          }}
        >
          Toprağa Hürmetle Başlayan{" "}
          <em style={{ fontStyle: "italic", color: "var(--color-gold-light)", fontFamily: "var(--font-heading)" }}>
            Sonsuz Bir Tutku
          </em>
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
            color: "rgba(245, 241, 232, 0.8)",
            lineHeight: 1.8,
            maxWidth: "720px",
            margin: "0 auto 40px auto",
          }}
        >
          Ege&apos;nin bereketli dağ yamaçlarında, asırlık ağaçlarımızın gölgesinde başlayan hikayemiz; doğallıktan ve dürüstlükten asla ödün vermeden her gün yeniden yazılıyor.
        </p>

        {/* 3'lü Canlı Metrik Rozetleri */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            maxWidth: "680px",
            margin: "0 auto",
          }}
          className="metric-grid"
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              backdropFilter: "blur(6px)",
            }}
          >
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: 700, color: "var(--color-gold-light)" }}>
              3. Nesil
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(245, 241, 232, 0.65)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Aile Üreticisi
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              backdropFilter: "blur(6px)",
            }}
          >
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: 700, color: "var(--color-gold-light)" }}>
              350 Metre
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(245, 241, 232, 0.65)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Köy Rakımı & İklim
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              backdropFilter: "blur(6px)",
            }}
          >
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: 700, color: "var(--color-gold-light)" }}>
              %100 Tek Bahçe
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(245, 241, 232, 0.65)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Sıfır Karışım Saf Zeytinyağı
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
