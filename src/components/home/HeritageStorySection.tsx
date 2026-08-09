"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Sparkles, Sprout, Award, CheckCircle2 } from "lucide-react";

export function HeritageStorySection() {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, #FBF9F4 0%, #F4EFE3 50%, #FAF8F2 100%)",
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid rgba(212, 175, 55, 0.2)",
      }}
      aria-label="Kütüklü Aile Mirası ve Taahhüdümüz"
    >
      {/* Arka Plan Dekoratif Işık & Doku */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
                            radial-gradient(circle at 90% 80%, rgba(47, 79, 47, 0.06) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            gap: "56px",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Sol: Prestij Miras Kartı & Hasat Fotoğrafı */}
          <div style={{ position: "relative" }}>
            <div
              className="glass-panel"
              style={{
                borderRadius: "24px",
                padding: "32px",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                boxShadow: "0 25px 50px rgba(47, 79, 47, 0.09)",
                position: "relative",
                background: "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,244,233,0.85) 100%)",
              }}
            >
              {/* Gerçek Hasat Elleri Fotoğrafı */}
              <div
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  marginBottom: "24px",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  position: "relative",
                  height: "220px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/harvest-hands-real.png"
                  alt="Kütüklü Zeytin Hasadı ve Emektar Eller"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    background: "rgba(0, 0, 0, 0.65)",
                    backdropFilter: "blur(6px)",
                    color: "var(--color-cream)",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sprout size={13} color="var(--color-gold-light)" />
                  Geleneksel El Hasadı
                </div>
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.5rem, 2.2vw, 1.9rem)",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  marginBottom: "12px",
                  lineHeight: 1.25,
                }}
              >
                Üç Kuşaktır Süregelen Bir Aile Sevdası
              </h3>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--color-gray-600)",
                  lineHeight: 1.75,
                  marginBottom: "24px",
                }}
              >
                Dedelerimizin elleriyle diktiği asırlık zeytin ağaçlarına bugün aynı hürmet ve sevgiyle bakıyoruz. Sadece kendi bahçelerimizden sınırlı miktarda üretim yapıyoruz.
              </p>

              {/* 3 Temel İlke */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { title: "Sıfır Karışım & Saf Tek Bahçe", desc: "Dışarıdan zeytin veya yağ satın almaz, yalnızca kendi ağaçlarımızı sıkarız." },
                  { title: "Geleneksel Sevgi, Modern Hijyen", desc: "El hasadını en ileri teknoloji kapalı devre soğuk sıkım ile buluşturuyoruz." },
                  { title: "Aracısız Üreticiden Tüketiciye", desc: "Köyümüzdeki depomuzdan doğrudan mutfağınıza taze dolumla gönderiyoruz." },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "rgba(212, 175, 55, 0.2)",
                        border: "1px solid var(--color-gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <CheckCircle2 size={13} color="var(--color-green)" />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-black)" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", lineHeight: 1.35 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Altın Kabartma Mühür Rozeti */}
            <div
              className="float-slow"
              style={{
                position: "absolute",
                bottom: "-20px",
                right: "-15px",
                width: "105px",
                height: "105px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-gold) 0%, #B38E22 100%)",
                boxShadow: "0 12px 30px rgba(212, 175, 55, 0.4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-black)",
                textAlign: "center",
                padding: "8px",
                border: "3px solid #FFF8E7",
                zIndex: 3,
              }}
            >
              <Award size={20} color="var(--color-black)" />
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 800, lineHeight: 1, marginTop: "2px" }}>
                3. NESİL
              </div>
              <div style={{ fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                AİLE MİRASI
              </div>
            </div>
          </div>

          {/* Sağ: Kurucunun Mektubu & Güvence Taahhüdü */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <Sparkles size={16} color="var(--color-gold-dark)" />
              <span className="section-tag" style={{ textAlign: "left", marginBottom: 0 }}>
                Bizim Hikayemiz & Aile Sözümüz
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 3.2vw, 2.9rem)",
                fontWeight: 500,
                color: "var(--color-black)",
                marginBottom: "20px",
                lineHeight: 1.2,
              }}
            >
              &ldquo;Şişelerimize ailemizin adını veriyoruz, çünkü sofranıza kendi soframızdan gönderiyoruz.&rdquo;
            </h2>

            <p
              style={{
                fontSize: "0.98rem",
                color: "var(--color-gray-700)",
                lineHeight: 1.85,
                marginBottom: "28px",
              }}
            >
              Bizim için zeytinyağı ticari bir emtia değil; Ege güneşinin, toprağın bereketi ve dedelerimizin dualarıyla harmanlanmış kutsal bir emanettir. Şişelerimize doldurduğumuz her damla yağı, kendi çocuklarımızın tabağına koyduğumuz saflık ve titizlikle üretiyoruz.
            </p>

            {/* 3'lü Tüketici Güvencesi */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "14px",
                background: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 16px",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                marginBottom: "32px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <ShieldCheck size={22} color="var(--color-green)" style={{ margin: "0 auto 6px auto" }} />
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-black)" }}>%100 Saf & Katkısız</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-gray-500)" }}>Laboratuvar Onaylı</div>
              </div>

              <div style={{ textAlign: "center", borderLeft: "1px solid var(--color-border)", borderRight: "1px solid var(--color-border)" }}>
                <Truck size={22} color="var(--color-gold-dark)" style={{ margin: "0 auto 6px auto" }} />
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-black)" }}>Kırılmaz Kargo</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-gray-500)" }}>Hava Kanallı Ambalaj</div>
              </div>

              <div style={{ textAlign: "center" }}>
                <Award size={22} color="var(--color-green)" style={{ margin: "0 auto 6px auto" }} />
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-black)" }}>Koşulsuz Garanti</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-gray-500)" }}>%100 İade Hakkı</div>
              </div>
            </div>

            {/* Aksiyon Butonları & İmza */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <Link href="/hikayemiz" className="btn-primary">
                Hikayemizi & Köyümüzü Keşfedin
                <ArrowRight size={16} />
              </Link>

              {/* El Yazısı İmza Görünümü */}
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.4rem",
                    fontStyle: "italic",
                    fontWeight: 700,
                    color: "var(--color-green)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Kütüklü Ailesi
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Zeytin Üreticisi • Kütüklü Köyü
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
