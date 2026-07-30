import { Leaf } from "lucide-react";

const milestones = [
  {
    year: "1950",
    title: "Köklerin Atılması",
    description:
      "Dedemiz Hasan Bey, Kütüklü Köyü'nün verimli topraklarında ilk zeytin fidanlarını dikti. Bir avuç tohumdan başlayan bu yolculuk, bugünkü mirasın temelini attı.",
    detail: "İlk 50 dönüm zeytinlik",
    icon: "🌱",
  },
  {
    year: "1985",
    title: "Büyüme ve Genişleme",
    description:
      "İkinci nesil ile birlikte bahçeler büyüdü, geleneksel el sıkımı yerini modern soğuk sıkım tesisine bıraktı. Kütüklü adı ilçe sınırlarını aştı.",
    detail: "İlk soğuk sıkım tesisi",
    icon: "🏭",
  },
  {
    year: "2010",
    title: "Uluslararası Tanınma",
    description:
      "Avrupa Birliği organik sertifikası, ISO 22000 ve HACCP belgelerimizi aldık. Ürünlerimiz ilk kez yurt dışı pazarlara açıldı.",
    detail: "Organik & ISO sertifikaları",
    icon: "🏅",
  },
  {
    year: "2023",
    title: "Dijital Dönüşüm",
    description:
      "E-ticaret platformumuzla Türkiye'nin dört bir yanına, sofranıza doğrudan ulaşmaya başladık. Geleneği teknolojiyle buluşturduk.",
    detail: "Türkiye geneli teslimat",
    icon: "🚀",
  },
];

export function YolculugumuzTimeline() {
  return (
    <section
      style={{
        background: "var(--color-white)",
        padding: "100px 0",
        overflow: "hidden",
      }}
      aria-label="Yolculuğumuz zaman çizelgesi"
    >
      <div className="container">
        {/* Başlık */}
        <div className="section-header">
          <span className="section-tag">Tarihimiz</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3vw, 2.8rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "16px",
            }}
          >
            Yolculuğumuz
          </h2>
          <span className="gold-divider" />
          <p
            style={{
              marginTop: "20px",
              fontSize: "0.95rem",
              color: "var(--color-gray-500)",
              maxWidth: "500px",
              margin: "20px auto 0",
              lineHeight: 1.7,
            }}
          >
            1950&apos;den bugüne, nesiller boyu süren bir aile geleneğinin dört dönüm noktası.
          </p>
        </div>

        {/* Timeline Container */}
        <div style={{ position: "relative", marginTop: "80px" }}>

          {/* ── Yatay bağlayıcı çizgi (sadece desktop) ── */}
          <div
            aria-hidden="true"
            className="timeline-line"
            style={{
              position: "absolute",
              top: "52px",
              left: "calc(12.5% - 1px)",
              right: "calc(12.5% - 1px)",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent 0%, var(--color-gold) 10%, var(--color-gold-light) 50%, var(--color-gold) 90%, transparent 100%)",
              zIndex: 0,
            }}
          />

          {/* Milestone'lar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0",
              position: "relative",
              zIndex: 1,
            }}
            className="timeline-grid"
          >
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0 16px",
                }}
              >
                {/* ── İkon + Yıl dairesi ── */}
                <div style={{ position: "relative", marginBottom: "28px" }}>
                  {/* Dış parlama halkası */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "-8px",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
                    }}
                  />

                  {/* Ana daire */}
                  <div
                    style={{
                      width: 104,
                      height: 104,
                      borderRadius: "50%",
                      background:
                        index % 2 === 0
                          ? "var(--color-green)"
                          : "var(--color-cream-dark)",
                      border: "3px solid var(--color-gold)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      boxShadow: "0 8px 32px rgba(212,175,55,0.25), 0 2px 8px rgba(0,0,0,0.1)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "default",
                    }}
                    className="timeline-circle"
                  >
                    <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>
                      {milestone.icon}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color:
                          index % 2 === 0
                            ? "var(--color-gold)"
                            : "var(--color-green)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {milestone.year}
                    </span>
                  </div>

                  {/* Bağlantı noktası (çizgi üstünde görünen küçük altın nokta) */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-16px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--color-gold)",
                      boxShadow: "0 0 0 3px var(--color-white), 0 0 0 5px var(--color-gold)",
                    }}
                  />
                </div>

                {/* ── Kart ── */}
                <div
                  style={{
                    background: "var(--color-gray-100)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "24px 20px",
                    textAlign: "center",
                    width: "100%",
                    marginTop: "16px",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  className="timeline-card"
                >
                  {/* Üst altın şerit */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      background:
                        "linear-gradient(90deg, var(--color-gold-dark), var(--color-gold-light), var(--color-gold-dark))",
                    }}
                  />

                  {/* Detay badge */}
                  <span
                    style={{
                      display: "inline-block",
                      background: "rgba(212,175,55,0.12)",
                      border: "1px solid rgba(212,175,55,0.3)",
                      color: "var(--color-gold-dark)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      marginBottom: "12px",
                    }}
                  >
                    {milestone.detail}
                  </span>

                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                      marginBottom: "10px",
                      lineHeight: 1.25,
                    }}
                  >
                    {milestone.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-gray-500)",
                      lineHeight: 1.7,
                    }}
                  >
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alt zeytin yaprağı dekorasyon */}
        <div
          style={{
            textAlign: "center",
            marginTop: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            color: "var(--color-gray-300)",
          }}
        >
          <div style={{ width: 80, height: 1, background: "var(--color-border)" }} />
          <Leaf size={18} color="var(--color-gold)" strokeWidth={1.5} />
          <div style={{ width: 80, height: 1, background: "var(--color-border)" }} />
        </div>
      </div>

      <style>{`
        .timeline-circle:hover {
          transform: scale(1.06);
          box-shadow: 0 12px 40px rgba(212,175,55,0.35), 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        .timeline-card:hover {
          background: var(--color-white) !important;
          border-color: var(--color-gold) !important;
          box-shadow: var(--shadow-md);
          transform: translateY(-3px);
        }
        @media (max-width: 900px) {
          .timeline-line { display: none !important; }
          .timeline-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 540px) {
          .timeline-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
