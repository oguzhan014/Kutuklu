import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";

export function KoyuZiyaretEt() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "100px 0",
      }}
      aria-label="Kütüklü Köyü'nü ziyaret edin"
    >
      {/* Arka plan */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, #1C1C1C 0%, #2F4F2F 50%, #1C3A1C 100%)",
        }}
      />

      {/* Altın parıltı */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse at 30% 50%, rgba(212,175,55,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 50%, rgba(212,175,55,0.05) 0%, transparent 50%)
          `,
        }}
      />

      <div
        className="container"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
          className="visit-grid"
        >
          {/* Sol: Köy görseli placeholder */}
          <div
            style={{
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              aspectRatio: "4/3",
              background: "linear-gradient(135deg, #4A7A4A 0%, #6B8E23 50%, #2F4F2F 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <div style={{ fontSize: "5rem" }}>🏡</div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "var(--color-cream)",
                textAlign: "center",
              }}
            >
              Kütüklü Köyü
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "rgba(245,241,232,0.6)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Ege Bölgesi, Türkiye
            </div>
          </div>

          {/* Sağ: Bilgiler */}
          <div>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                display: "block",
                marginBottom: "16px",
              }}
            >
              Bizi Bulun
            </span>

            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 3vw, 2.8rem)",
                fontWeight: 500,
                color: "var(--color-cream)",
                marginBottom: "20px",
                lineHeight: 1.2,
              }}
            >
              Kütüklü Köyü&apos;nü
              <br />
              <em style={{ fontStyle: "italic", color: "var(--color-gold)" }}>
                Ziyaret Edin
              </em>
            </h2>

            <p
              style={{
                fontSize: "0.95rem",
                color: "rgba(245,241,232,0.7)",
                lineHeight: 1.75,
                marginBottom: "36px",
              }}
            >
              Kütüklü, ata yadigârı zeytinliklerimizde gelenekle buluşan modern yöntemlerin hikayesidir. Hasat mevsiminde bizi ziyaret edin, zeytinden yağa dönüşen mucizeye tanık olun.
            </p>

            {/* İletişim Bilgileri */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "36px",
              }}
            >
              {[
                {
                  Icon: MapPin,
                  text: "Kütüklü Köyü, Ege Bölgesi, Türkiye",
                },
                {
                  Icon: Phone,
                  text: "+90 500 123 45 67",
                },
                {
                  Icon: Mail,
                  text: "info@kutuklu.com.tr",
                },
              ].map(({ Icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      background: "rgba(212,175,55,0.15)",
                      border: "1px solid rgba(212,175,55,0.3)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={15} color="var(--color-gold)" />
                  </div>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "rgba(245,241,232,0.8)",
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <Link href="/iletisim" className="btn-gold">
              İletişime Geçin <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .visit-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
