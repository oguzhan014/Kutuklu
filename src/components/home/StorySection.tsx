import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StorySection() {
  return (
    <section
      style={{
        background: "var(--color-white)",
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Hikayemiz bölümü"
    >
      {/* Dekoratif arka plan */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "50%",
          background: "var(--color-cream)",
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
          className="story-grid"
        >
          {/* Sol: Görsel */}
          <div style={{ position: "relative" }}>
            {/* Ana görsel placeholder */}
            <div
              style={{
                width: "100%",
                aspectRatio: "4/5",
                background: "linear-gradient(135deg, var(--color-green) 0%, var(--color-green-light) 100%)",
                borderRadius: "var(--radius-xl)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-cream)",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: "5rem" }}>🫒</div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  textAlign: "center",
                  padding: "0 24px",
                }}
              >
                Kütüklü Köyü
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(245,241,232,0.7)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Ege Bölgesi, Türkiye
              </div>
            </div>

            {/* Floating istatistik kutusu */}
            <div
              style={{
                position: "absolute",
                bottom: -20,
                right: -20,
                background: "var(--color-gold)",
                padding: "24px",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-gold)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "var(--color-black)",
                  lineHeight: 1,
                }}
              >
                3.
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--color-black)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                Nesil
              </div>
            </div>
          </div>

          {/* Sağ: Metin */}
          <div style={{ padding: "0 0 0 20px" }} className="story-text">
            <span className="section-tag" style={{ textAlign: "left" }}>
              Bizim Hikayemiz
            </span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 3vw, 2.8rem)",
                fontWeight: 500,
                color: "var(--color-black)",
                marginBottom: "24px",
                lineHeight: 1.2,
              }}
            >
              Kütüklü, aile{" "}
              <em style={{ fontStyle: "italic", color: "var(--color-green)" }}>
                geleneğinin
              </em>{" "}
              ürünüdür.
            </h2>

            <p
              style={{
                fontSize: "1rem",
                color: "var(--color-gray-600)",
                lineHeight: 1.8,
                marginBottom: "20px",
              }}
            >
              Kütüklü, yüzyıllardır yetiştiricilik yaptığımız bir köy. Büyüklerimizin miras aldığı bu bahçe, modern yöntemlerle buluşmuş; en lezzetli ve en saf zeytinyağını doğrudan Kütüklü köyünde üretip sofranıza sunuyoruz.
            </p>

            <p
              style={{
                fontSize: "1rem",
                color: "var(--color-gray-600)",
                lineHeight: 1.8,
                marginBottom: "36px",
              }}
            >
              Her hasat mevsiminde, sabahın erken saatlerinde toplanan zeytinlerimiz, aynı gün soğuk sıkım yöntemiyle işlenir. Bu hassasiyeti ve doğaya olan saygımızı her damlada hissedebilirsiniz.
            </p>

            <Link href="/hikayemiz" className="btn-primary">
              Daha Fazla <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>


    </section>
  );
}
