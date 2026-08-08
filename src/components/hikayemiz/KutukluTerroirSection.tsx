"use client";

import Link from "next/link";
import { Compass, Mountain, Wind, Sun, Layers, MapPin, Phone, Mail, ArrowRight, Sparkles } from "lucide-react";

interface TerroirFeature {
  id: string;
  icon: typeof Mountain;
  title: string;
  badge: string;
  description: string;
  impact: string;
}

const terroirFeatures: TerroirFeature[] = [
  {
    id: "altitude",
    icon: Mountain,
    title: "350 Metre Dağ Rakımı",
    badge: "DOĞAL KORUMA",
    description: "Kıyı şeridindeki nemden ve mantar hastalıklarından uzak yamaç arazilerimiz, zeytin sineğinin barınmasını engeller.",
    impact: "Sıfır kimyasal ilaçlama ile dalında tertemiz meyve.",
  },
  {
    id: "winds",
    icon: Wind,
    title: "Kaz Dağları & İmbat Rüzgarı",
    badge: "OKSİJEN KORİDORU",
    description: "Körfezden yükselen iyotlu deniz havası ile Kaz Dağları'ndan inen bol oksijenli serin hava akımı bahçelerimizi sürekli yıkar.",
    impact: "Yağda eşsiz taze biçilmiş çimen ve badem aroması.",
  },
  {
    id: "sun",
    icon: Sun,
    title: "Yılda 300+ Gün Ege Güneşi",
    badge: "YÜKSEK POLİFENOL",
    description: "Güney cepheli teraslarımız gün boyu kesintisiz güneş ışığı alarak zeytin meyvesinin fotosentez kapasitesini maksimuma çıkarır.",
    impact: "450+ mg/kg seviyesinde rekor antioksidan gücü.",
  },
  {
    id: "soil",
    icon: Layers,
    title: "Kireçli & Mineralli Taş Toprak",
    badge: "MİNERAL ZENGİNLİĞİ",
    description: "Su tutmayan eğimli kireçtaşı arazide asırlık ağaç köklerimiz mineralleri çekebilmek için onlarca metre derine uzanır.",
    impact: "Dengeli lezzet, boğazda kadifemsi ve kalıcı tat.",
  },
];

export function KutukluTerroirSection() {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, #172117 0%, #1F2E1F 50%, #152215 100%)",
        color: "var(--color-cream)",
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Kütüklü Köyü Terroir ve İklim Haritası"
    >
      {/* Arka Plan Işık Dokusu */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(47, 79, 47, 0.25) 0%, transparent 60%)
          `,
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Başlık */}
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 60px auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
            <Compass size={16} color="var(--color-gold)" />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
              }}
            >
              Doğanın Eşsiz Mikro-İklimi
            </span>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3.8vw, 3.2rem)",
              fontWeight: 500,
              color: "var(--color-cream)",
              marginBottom: "16px",
              lineHeight: 1.2,
            }}
          >
            Kütüklü Köyü&apos;nün Terroir Mucizesi
          </h2>

          <p style={{ fontSize: "0.98rem", color: "rgba(245, 241, 232, 0.75)", lineHeight: 1.7 }}>
            Aynı zeytin türünü başka bir coğrafyaya dikseniz dahi Kütüklü&apos;nün lezzetine ulaşamazsınız. Çünkü zeytinyağımızın karakteri, köyümüzün rakımından, rüzgarından ve toprağından doğar.
          </p>
        </div>

        {/* 4'lü Terroir İnfografik Kartları */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
            marginBottom: "70px",
          }}
        >
          {terroirFeatures.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="glass-panel-dark"
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "32px 24px",
                  border: "1px solid rgba(212, 175, 55, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Rozet & İkon */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: "rgba(212, 175, 55, 0.15)",
                      border: "1px solid var(--color-gold)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconComponent size={22} color="var(--color-gold-light)" />
                  </div>

                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      color: "var(--color-gold-light)",
                      background: "rgba(0, 0, 0, 0.4)",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "var(--color-cream)",
                    marginBottom: "10px",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(245, 241, 232, 0.75)",
                    lineHeight: 1.6,
                    marginBottom: "20px",
                    flex: 1,
                  }}
                >
                  {item.description}
                </p>

                {/* Lezzete Etkisi */}
                <div
                  style={{
                    background: "rgba(47, 79, 47, 0.35)",
                    borderLeft: "3px solid var(--color-gold)",
                    padding: "10px 14px",
                    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                    fontSize: "0.78rem",
                    color: "var(--color-cream)",
                    lineHeight: 1.45,
                  }}
                >
                  <strong style={{ color: "var(--color-gold-light)", display: "block", fontSize: "0.7rem", textTransform: "uppercase" }}>
                    Lezzete Yansıması:
                  </strong>
                  {item.impact}
                </div>
              </div>
            );
          })}
        </div>

        {/* Alt Ziyaret & Çiftlik Bilgisi Paneli */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "24px",
            padding: "40px",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "40px",
            alignItems: "center",
          }}
          className="visit-grid"
        >
          <div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Kapımız Her Zaman Açık
            </span>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.8rem",
                fontWeight: 500,
                color: "var(--color-cream)",
                marginBottom: "14px",
              }}
            >
              Hasat Döneminde Köyümüze Bekleriz
            </h3>
            <p style={{ fontSize: "0.9rem", color: "rgba(245, 241, 232, 0.75)", lineHeight: 1.7, marginBottom: "24px" }}>
              Ekim ve Kasım aylarında sabah hasadına katılabilir, sıkım tesisimizde ilk zeytinyağının akışını izleyebilir ve sıcak köy ekmeğiyle taze tadım yapabilirsiniz.
            </p>

            <Link href="/iletisim" className="btn-gold" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Bize Ulaşın & Randevu Alın <ArrowRight size={16} />
            </Link>
          </div>

          {/* İletişim Detayları */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(212,175,55,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPin size={16} color="var(--color-gold)" />
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "rgba(245,241,232,0.5)" }}>Konum</div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-cream)", fontWeight: 600 }}>Kütüklü Köyü, Ege Bölgesi, Türkiye</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(212,175,55,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Phone size={16} color="var(--color-gold)" />
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "rgba(245,241,232,0.5)" }}>Telefon & WhatsApp</div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-cream)", fontWeight: 600 }}>+90 500 123 45 67</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(212,175,55,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={16} color="var(--color-gold)" />
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "rgba(245,241,232,0.5)" }}>E-Posta</div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-cream)", fontWeight: 600 }}>info@kutuklu.com.tr</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
