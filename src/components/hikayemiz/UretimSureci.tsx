const processes = [
  {
    id: "hasat",
    side: "right" as const,
    tag: "1. Aşama",
    title: "Hasat Süreci",
    description:
      "Zeytinlerimiz, olgunlaşmadan önce erken hasat döneminde — genellikle Ekim-Kasım aylarında — özenle toplanır. Elle hasat yöntemi tercih etmemizin sebebi, meyvelerin zarar görmeden işleme alınmasını sağlamaktır. Hasatta her zeytin dalına ayrı bir özen gösterir, toprağın ve ağacın doğal döngüsüne saygı duyarız.",
    emoji: "🫒",
    bgColor: "linear-gradient(135deg, #4A7A4A 0%, #2F4F2F 100%)",
  },
  {
    id: "soguk-sikim",
    side: "left" as const,
    tag: "2. Aşama",
    title: "Soğuk Sıkım Yöntemi",
    description:
      "Hasat edilen zeytinler, aynı gün içinde soğuk sıkım tesisimize taşınır. 27°C'nin altında gerçekleştirilen bu işlem, zeytinyağının tüm vitamin, mineral ve antioksidanlarını korumasını sağlar. Sıcaklık kontrolü, zeytinyağının aromasının ve doğal renginin bozulmaması için hayati önem taşır.",
    emoji: "⚙️",
    bgColor: "linear-gradient(135deg, #5C5448 0%, #3A332A 100%)",
  },
  {
    id: "kalite",
    side: "right" as const,
    tag: "3. Aşama",
    title: "Kalite Standartlarımız",
    description:
      "Her üretim partimiz, uluslararası zeytinyağı standartlarına göre bağımsız laboratuvarlarda test edilir. Asitlik oranı, polifenol içeriği, duyusal analiz ve kimyasal testler gerçekleştirilir. Sadece standartları geçen ürünler Kütüklü etiketiyle sizlere ulaşır. Kalite güvencemiz, her damlada hissedilir.",
    emoji: "🔬",
    bgColor: "linear-gradient(135deg, #2F4F2F 0%, #1C3A1C 100%)",
  },
];

export function UretimSureci() {
  return (
    <section
      id="uretim-surecimiz"
      style={{
        background: "var(--color-white)",
        padding: "80px 0",
        scrollMarginTop: "90px",
      }}
      aria-label="Üretim süreci"
    >
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Nasıl Üretiyoruz</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3vw, 2.8rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "16px",
            }}
          >
            Üretim Sürecimiz
          </h2>
          <span className="gold-divider" />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "80px",
            marginTop: "60px",
          }}
        >
          {processes.map((process) => (
            <div
              key={process.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "64px",
                alignItems: "center",
                direction: process.side === "left" ? "rtl" : "ltr",
              }}
              className="process-grid"
            >
              {/* Görsel */}
              <div style={{ direction: "ltr" }}>
                <div
                  style={{
                    borderRadius: "var(--radius-xl)",
                    overflow: "hidden",
                    aspectRatio: "4/3",
                    background: process.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "6rem",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  {process.emoji}
                </div>
              </div>

              {/* Metin */}
              <div style={{ direction: "ltr" }}>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "var(--color-gold)",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  {process.tag}
                </span>

                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
                    fontWeight: 500,
                    color: "var(--color-black)",
                    marginBottom: "20px",
                    lineHeight: 1.2,
                  }}
                >
                  {process.title}
                </h3>

                {/* Altın çizgi */}
                <div
                  style={{
                    width: 48,
                    height: 2,
                    background: "var(--color-gold)",
                    marginBottom: "24px",
                  }}
                />

                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--color-gray-600)",
                    lineHeight: 1.85,
                  }}
                >
                  {process.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .process-grid {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}
