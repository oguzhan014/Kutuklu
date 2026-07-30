import { Leaf } from "lucide-react";

export function HikayemizHero() {
  return (
    <section
      style={{
        position: "relative",
        height: "70vh",
        minHeight: "480px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label="Hikayemiz hero bölümü"
    >
      {/* Arka plan — zeytinlik görseli placeholder */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, #2F4F2F 0%, #4A7A4A 30%, #6B8E23 60%, #3D6B3D 100%)",
        }}
      >
        {/* Doku overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(ellipse at 20% 80%, rgba(0,0,0,0.3) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(0,0,0,0.2) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Koyu gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(28,28,28,0.5) 0%, rgba(28,28,28,0.3) 50%, rgba(28,28,28,0.65) 100%)",
        }}
      />

      {/* İçerik */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        {/* Üst dekoratif çizgi */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ width: 48, height: 1, background: "var(--color-gold)" }} />
          <Leaf size={16} color="var(--color-gold)" />
          <div style={{ width: 48, height: 1, background: "var(--color-gold)" }} />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            fontWeight: 500,
            color: "var(--color-cream)",
            lineHeight: 1.1,
            marginBottom: "16px",
            letterSpacing: "-0.01em",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}
        >
          Bizim Hikayemiz
        </h1>

        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--color-gold)",
            letterSpacing: "0.05em",
          }}
        >
          Nesiller Boyu Süren Bir Gelenek
        </p>
      </div>

      {/* Alt dalga dekorasyon */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80px",
          background: "var(--color-cream)",
          clipPath: "ellipse(55% 100% at 50% 100%)",
        }}
      />
    </section>
  );
}
