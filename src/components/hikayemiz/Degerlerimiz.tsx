import { Sprout, Star, Clock, Recycle } from "lucide-react";

const values = [
  {
    id: "dogallik",
    Icon: Sprout,
    title: "Doğallık",
    description:
      "Doğaya ve insan sağlığına saygılı, tamamen katkısız ve doğal üretim anlayışı.",
  },
  {
    id: "kalite",
    Icon: Star,
    title: "Kalite",
    description:
      "En yüksek kalite standartlarını ve uluslararası sertifikaları benimseyerek üretim yaparız.",
  },
  {
    id: "gelenek",
    Icon: Clock,
    title: "Gelenek",
    description:
      "Nesiller boyu aktarılan bilgelik ve geleneksel yöntemlere saygı göstererek üretiyoruz.",
  },
  {
    id: "surdurulebilirlik",
    Icon: Recycle,
    title: "Sürdürülebilirlik",
    description:
      "Toprağımızı ve çevremizi koruyarak gelecek nesillere yeşil bir miras bırakmayı hedefliyoruz.",
  },
];

export function Degerlerimiz() {
  return (
    <section
      style={{
        background: "var(--color-cream)",
        padding: "80px 0",
      }}
      aria-label="Değerlerimiz"
    >
      <div className="container">
        <div className="section-header">
          <span className="section-tag">İlkelerimiz</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3vw, 2.8rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "16px",
            }}
          >
            Değerlerimiz
          </h2>
          <span className="gold-divider" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "28px",
          }}
        >
          {values.map(({ id, Icon, title, description }) => (
            <div
              key={id}
              id={`value-${id}`}
              style={{
                background: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                padding: "36px 28px",
                textAlign: "center",
                border: "1px solid var(--color-border)",
                transition: "all 0.3s ease",
              }}
              className="value-card"
            >
              {/* İkon dairesi */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  background: "linear-gradient(135deg, rgba(47,79,47,0.08) 0%, rgba(212,175,55,0.1) 100%)",
                  border: "2px solid var(--color-gold)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Icon size={30} color="var(--color-green)" strokeWidth={1.5} />
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  marginBottom: "12px",
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  fontSize: "0.875rem",
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

      <style>{`
        .value-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-gold) !important;
        }
      `}</style>
    </section>
  );
}
