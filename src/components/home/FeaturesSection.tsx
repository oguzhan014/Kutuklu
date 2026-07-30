import { Sprout, Gauge, Shield } from "lucide-react";

const features = [
  {
    id: "erken-hasat",
    Icon: Sprout,
    title: "Erken Hasat",
    description:
      "En taze zeytinlerden, meyvemsi ve yoğun aromali özel üretim. Zeytinlerimiz olgunlaşmadan hasat edilir.",
  },
  {
    id: "soguk-sikim",
    Icon: Gauge,
    title: "Soğuk Sıkım",
    description:
      "Besin değerlerini koruyan, düşük sıcaklıkta doğal sıkım yöntemi (≤27°C). Hiçbir değer kaybolmaz.",
  },
  {
    id: "dogal-uretim",
    Icon: Shield,
    title: "Doğal Üretim",
    description:
      "Katkısız, saf ve doğaya saygılı geleneksel üretim süreci. Kimyasal kullanılmaz, hiçbir zaman.",
  },
];

export function FeaturesSection() {
  return (
    <section
      style={{
        background: "var(--color-white)",
        padding: "80px 0",
      }}
      aria-label="Neden Kütüklü özellikleri"
    >
      <div className="container">
        {/* Bölüm Başlığı */}
        <div className="section-header">
          <span className="section-tag">Farkımız</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3vw, 2.8rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "16px",
            }}
          >
            Neden Kütüklü?
          </h2>
          <span className="gold-divider" />
        </div>

        {/* Özellik Kartları */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
          }}
        >
          {features.map(({ id, Icon, title, description }) => (
            <div
              key={id}
              id={`feature-${id}`}
              style={{
                textAlign: "center",
                padding: "40px 32px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                background: "var(--color-gray-100)",
                transition: "all 0.3s ease",
                cursor: "default",
              }}
              className="feature-card"
            >
              {/* İkon */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "linear-gradient(135deg, var(--color-green) 0%, var(--color-green-light) 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Icon size={28} color="var(--color-gold)" strokeWidth={1.5} />
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  marginBottom: "12px",
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--color-gray-500)",
                  lineHeight: 1.7,
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>


    </section>
  );
}
