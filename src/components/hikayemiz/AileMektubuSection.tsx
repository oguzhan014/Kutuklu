"use client";

import { Award, Heart, Sparkles, CheckCircle2 } from "lucide-react";

export function AileMektubuSection() {
  return (
    <section
      style={{
        background: "var(--color-cream)",
        padding: "90px 0",
        position: "relative",
      }}
      aria-label="Kütüklü Kurucusunun Aile Mektubu"
    >
      <div className="container" style={{ maxWidth: "900px" }}>
        {/* Parşömen Dokulu Mektup Kartı */}
        <div
          style={{
            background: "#FFFDF9",
            border: "2px solid rgba(212, 175, 55, 0.4)",
            borderRadius: "24px",
            padding: "56px 48px",
            position: "relative",
            boxShadow: "0 20px 50px rgba(47, 79, 47, 0.08)",
          }}
        >
          {/* Köşe Altın Motif Süsleri */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              width: 24,
              height: 24,
              borderTop: "2px solid var(--color-gold)",
              borderLeft: "2px solid var(--color-gold)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 24,
              height: 24,
              borderTop: "2px solid var(--color-gold)",
              borderRight: "2px solid var(--color-gold)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 14,
              width: 24,
              height: 24,
              borderBottom: "2px solid var(--color-gold)",
              borderLeft: "2px solid var(--color-gold)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              width: 24,
              height: 24,
              borderBottom: "2px solid var(--color-gold)",
              borderRight: "2px solid var(--color-gold)",
            }}
          />

          {/* Mektup Başlığı */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Heart size={16} color="var(--color-gold-dark)" />
              <span className="section-tag" style={{ marginBottom: 0 }}>
                Gönülden Bir Söz
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 500,
                color: "var(--color-black)",
                lineHeight: 1.25,
              }}
            >
              Ailemizden Sofranıza Bir Mektup
            </h2>
            <div style={{ width: 60, height: 2, background: "var(--color-gold)", margin: "14px auto 0 auto" }} />
          </div>

          {/* Mektup Metni */}
          <div
            style={{
              fontSize: "1.02rem",
              color: "#3D443D",
              lineHeight: 1.95,
              fontFamily: "var(--font-body)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <p>
              <strong>Değerli Zeytinyağı Dostumuz,</strong>
            </p>
            <p>
              Bizler için zeytin ağacı, yalnızca bir tarımsal kazanç kapısı değil; dedelerimizin ve ninelerimizin dualarıyla sulanmış, toprağımızın bize bahşettiği en kutsal emanettir. Çocukluğumuz; sabahın sisli ayazında toplanan zeytinlerin çıtırtısıyla, taş değirmenlerden sızan o ilk zümrüt yeşili yağın taze çimen kokusuyla geçti.
            </p>
            <p>
              Bugün en ileri teknoloji kapalı devre soğuk sıkım sistemlerimizde üretim yaparken dahi, büyüklerimizin bize öğrettiği o altın kuralı bir an olsun aklımızdan çıkarmıyoruz: <em>&ldquo;Ağacı incitmeyeceksin, zeytini bekletmeyeceksin, sofrana koymayacağın yağı şişelemeyeceksin.&rdquo;</em>
            </p>
            <p>
              Kütüklü şişelerine kendi köyümüzün ve ailemizin adını vermemizin sebebi de işte bu saf dürüstlüktür. Gönderdiğimiz her damlayı, önce kendi soframızda çocuklarımızın tabağına koyduğumuz gönül rahatlığıyla size ulaştırıyoruz.
            </p>
          </div>

          {/* Alt İmza & Altın Kabartma Mühür */}
          <div
            style={{
              marginTop: "44px",
              paddingTop: "32px",
              borderTop: "1px dashed rgba(212, 175, 55, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "24px",
            }}
          >
            {/* Sol: İmza */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.65rem",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: "var(--color-green)",
                  letterSpacing: "0.02em",
                  marginBottom: "4px",
                }}
              >
                Kütüklü Ailesi
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                3. Kuşak Zeytin Yetiştiricisi • Kütüklü Köyü
              </div>
            </div>

            {/* Sağ: Altın Mühür Rozeti */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(212, 175, 55, 0.12)",
                border: "1px solid var(--color-gold)",
                padding: "10px 18px",
                borderRadius: "12px",
              }}
            >
              <Award size={28} color="var(--color-gold-dark)" />
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--color-black)", letterSpacing: "0.04em" }}>
                  ORİJİNAL KÖY ÜRETİMİ
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-gray-600)" }}>
                  %100 Katkısız & Tek Bahçe Güvencesi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
