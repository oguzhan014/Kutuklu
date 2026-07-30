import { ShieldCheck } from "lucide-react";

const certificates = [
  {
    id: "organik",
    emoji: "🌿",
    title: "Organik Sertifikası",
    body: "Ürünlerimiz, Avrupa Birliği organik tarım standartlarına uygun olarak sertifikalandırılmıştır.",
  },
  {
    id: "iso",
    emoji: "✅",
    title: "ISO 22000",
    body: "Gıda güvenliği yönetim sistemi standartları kapsamında uluslararası ISO 22000 sertifikasına sahibiz.",
  },
  {
    id: "haccp",
    emoji: "🛡️",
    title: "HACCP",
    body: "Tehlike analizi ve kritik kontrol noktaları sistemiyle her üretim aşamasında güvenlik sağlanmaktadır.",
  },
  {
    id: "kosher",
    emoji: "⭐",
    title: "Kosher & Helal",
    body: "Uluslararası pazarlara yönelik Kosher ve Helal sertifikalarımız mevcuttur.",
  },
];

export function Sertifikalarimiz() {
  return (
    <section
      id="sertifikalar"
      style={{
        background: "var(--color-gray-100)",
        padding: "80px 0",
        scrollMarginTop: "90px",
      }}
      aria-label="Sertifikalarımız"
    >
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Güvencemiz</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3vw, 2.8rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "16px",
            }}
          >
            Sertifikalarımız
          </h2>
          <span className="gold-divider" />
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--color-gray-500)",
              marginTop: "20px",
              maxWidth: "560px",
              margin: "20px auto 0",
              lineHeight: 1.7,
            }}
          >
            Uluslararası standartlara uygunluğumuzu belgeleyen sertifikalarımız, her damlada kalite güvencemizin somut kanıtıdır.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          {certificates.map((cert) => (
            <div
              key={cert.id}
              style={{
                background: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                padding: "36px 28px",
                textAlign: "center",
                border: "1px solid var(--color-border)",
                transition: "all 0.3s ease",
              }}
              className="cert-card"
            >
              {/* Rozet */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: "2rem",
                  boxShadow: "var(--shadow-gold)",
                }}
              >
                {cert.emoji}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  marginBottom: "12px",
                }}
              >
                {cert.title}
              </h3>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-gray-500)",
                  lineHeight: 1.65,
                }}
              >
                {cert.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .cert-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-gold) !important;
          border-color: var(--color-gold) !important;
        }
      `}</style>
    </section>
  );
}
