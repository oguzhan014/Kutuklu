import { Sprout, MapPin, Award } from "lucide-react";

const reasons = [
  {
    id: "gelenek",
    Icon: Sprout,
    title: "Nesiller Boyu Gelenek",
    description:
      "Doğanın kalbinde, geleneksel yöntemlerle üretilen lezzet.",
  },
  {
    id: "koyu",
    Icon: MapPin,
    title: "Kütüklü Köyü'nden",
    description:
      "En yüksek kalite standartlarında, düşük asitlikle Kütüklü köyünde üretilir.",
  },
  {
    id: "kalite",
    Icon: Award,
    title: "Premium Kalite",
    description:
      "En yüksek kalite standartlarında, düşük asitlikle özenle hasat edilir.",
  },
];

export function WhyKutukluSection() {
  return (
    <section
      style={{
        background: "var(--color-white)",
        padding: "80px 0",
      }}
      aria-label="Neden Kütüklü detay bölümü"
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
          className="why-grid"
        >
          {/* Sol: Görsel (köy/zeytinlik fotoğrafı) */}
          <div
            style={{
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              position: "relative",
              aspectRatio: "4/3",
              background: "linear-gradient(135deg, #4A7A4A 0%, #2F4F2F 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center", color: "var(--color-cream)" }}>
              <div style={{ fontSize: "6rem", marginBottom: "16px" }}>🌿</div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.8rem",
                  fontWeight: 500,
                }}
              >
                Zeytinliklerimiz
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(245,241,232,0.6)",
                  letterSpacing: "0.1em",
                  marginTop: "8px",
                }}
              >
                Kütüklü Köyü, Ege
              </div>
            </div>
          </div>

          {/* Sağ: İçerik */}
          <div>
            <span className="section-tag" style={{ textAlign: "left" }}>
              Farkımız
            </span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 3vw, 2.8rem)",
                fontWeight: 500,
                color: "var(--color-black)",
                marginBottom: "40px",
              }}
            >
              Why Kütüklü?
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "28px",
              }}
            >
              {reasons.map(({ id, Icon, title, description }) => (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: "var(--color-cream)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} color="var(--color-green)" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "var(--color-black)",
                        marginBottom: "6px",
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--color-gray-500)",
                        lineHeight: 1.6,
                      }}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


    </section>
  );
}
