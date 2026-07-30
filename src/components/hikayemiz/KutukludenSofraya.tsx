export function KutukludenSofraya() {
  return (
    <section
      style={{
        background: "var(--color-cream)",
        padding: "80px 0 60px",
      }}
      aria-label="Kütüklü'den sofranıza"
    >
      <div className="container">
        {/* Başlık */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="section-tag">Biz Kimiz</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3vw, 2.8rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "16px",
            }}
          >
            Kütüklü&apos;den Sofranıza
          </h2>
          <span className="gold-divider" />
        </div>

        {/* İki sütun metin */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            maxWidth: "960px",
            margin: "0 auto",
          }}
          className="story-text-grid"
        >
          <div>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--color-gray-600)",
                lineHeight: 1.85,
                marginBottom: "20px",
              }}
            >
              Kütüklü; ata yadigârı zeytinliklerimizde, gelenekle buluşan modern yöntemlerin hikayesidir. Ailelerimizin nesiller boyu sürdürdüğü hasat geleneğini, modern üretim anlayışıyla buluşturarak dünyanın en kaliteli zeytinyağlarından birini sizlere sunuyoruz.
            </p>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--color-gray-600)",
                lineHeight: 1.85,
              }}
            >
              Her yıl, erken hasat döneminde özenle toplanan zeytinlerimiz aynı gün işlenerek en yüksek kaliteye ulaşır. Soğuk sıkım yöntemimizle tüm besin değerlerini ve doğal aromasını korur, sofranıza taşırız.
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--color-gray-600)",
                lineHeight: 1.85,
                marginBottom: "20px",
              }}
            >
              Büyüklerimiz her zeytin ağacının bir hikaye taşıdığını söylerdi. Kütüklü Köyü&apos;nün verimli topraklarında boy atan yüzlerce yaşındaki zeytin ağaçlarımız, bugün de aynı coşkuyla meyvelerini vermekte.
            </p>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--color-gray-600)",
                lineHeight: 1.85,
              }}
            >
              Biz sadece zeytinyağı üretmiyoruz; bir aile mirası, bir köy geleneği, bir yaşam felsefesi sunuyoruz. Her şişemizde Kütüklü&apos;nün güneşi, toprağı ve sevgisi var.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .story-text-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
