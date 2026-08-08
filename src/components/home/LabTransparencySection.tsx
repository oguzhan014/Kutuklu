"use client";

import { useState } from "react";
import { ShieldCheck, Award, FileText, Check, Download, Sparkles, ExternalLink, Activity } from "lucide-react";

interface LabParameter {
  name: string;
  code: string;
  kutukluValue: string;
  codexLimit: string;
  status: "MÜKEMMEL" | "EKSTRA ÜSTÜN" | "KUSURSUZ";
  description: string;
}

const labParameters: LabParameter[] = [
  {
    name: "Serbest Yağ Asitliği",
    code: "Oleik Asit Cinsinden",
    kutukluValue: "% 0.24",
    codexLimit: "≤ % 0.80 (Kodeks Sınırı)",
    status: "MÜKEMMEL",
    description: "Hasat edilen zeytinlerin beklemeden aynı gün sıkıldığının en net kanıtıdır. Asitlik düştükçe yağın kalitesi ve lezzet saflığı artar.",
  },
  {
    name: "Toplam Polifenol",
    code: "Antioksidan Bileşikler",
    kutukluValue: "482 mg/kg",
    codexLimit: "≥ 200 mg/kg (Standart)",
    status: "EKSTRA ÜSTÜN",
    description: "Zeytinyağındaki şifalı yakıcılığı veren bileşenlerdir. Serbest radikallerle savaşır ve bağışıklık sistemini destekler.",
  },
  {
    name: "Peroksit Sayısı",
    code: "Oksidasyon / Tazelik",
    kutukluValue: "4.1 meq O₂/kg",
    codexLimit: "≤ 20.0 meq (Sınır)",
    status: "KUSURSUZ",
    description: "Yağın havadaki oksijenden ne kadar korunduğunu gösterir. Değerin 4.1 gibi düşük seviyede olması maksimum tazeliği belgeler.",
  },
  {
    name: "Ultraviyole Soğurma (K232 & K270)",
    code: "Saflık & Isı Görmeme",
    kutukluValue: "1.52 / 0.12",
    codexLimit: "K232 ≤ 2.50 / K270 ≤ 0.22",
    status: "MÜKEMMEL",
    description: "Yağın hiçbir rafinasyon, ısı veya yabancı maddeye maruz kalmadığını doğrulayan spektrofotometrik saflık değeridir.",
  },
];

export function LabTransparencySection() {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <section
      style={{
        background: "linear-gradient(180deg, #F5F1E8 0%, #FFFFFF 100%)",
        padding: "90px 0",
        position: "relative",
      }}
      aria-label="Laboratuvar ve Şeffaflık Değerleri"
    >
      <div className="container">
        {/* Başlık */}
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 50px auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Activity size={15} color="var(--color-gold)" />
            <span className="section-tag" style={{ marginBottom: 0 }}>
              Şeffaflık & Analiz
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "14px",
            }}
          >
            Sözümüz Etikette, Kanıtımız Laboratuvarda
          </h2>
          <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Kütüklü Zeytinyağı olarak ürettiğimiz her partiyi akredite gıda laboratuvarlarında analiz ettiriyoruz. Şişemizdeki her damlanın arkasındayız.
          </p>
        </div>

        {/* 4'lü Laboratuvar Parametre Kartları */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {labParameters.map((param) => (
            <div
              key={param.name}
              className="glass-panel"
              style={{
                borderRadius: "var(--radius-lg)",
                padding: "26px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", textTransform: "uppercase", fontWeight: 600 }}>
                    {param.code}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                      marginTop: "2px",
                    }}
                  >
                    {param.name}
                  </h3>
                </div>

                <span
                  style={{
                    background: "rgba(47, 79, 47, 0.1)",
                    color: "var(--color-green)",
                    border: "1px solid rgba(47, 79, 47, 0.2)",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    padding: "3px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {param.status}
                </span>
              </div>

              {/* Değer Karşılaştırma Kutusu */}
              <div
                style={{
                  background: "var(--color-white)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  border: "1px solid var(--color-border)",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>Kütüklü Değeri:</span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      color: "var(--color-green)",
                    }}
                  >
                    {param.kutukluValue}
                  </span>
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-gray-400)", textAlign: "right" }}>
                  {param.codexLimit}
                </div>
              </div>

              <p style={{ fontSize: "0.78rem", color: "var(--color-gray-600)", lineHeight: 1.5, marginTop: "auto" }}>
                {param.description}
              </p>
            </div>
          ))}
        </div>

        {/* Akredite Belge & Rapor Çağrısı */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--color-green) 0%, #1e361e 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "32px 40px",
            color: "var(--color-cream)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            boxShadow: "0 15px 35px rgba(47, 79, 47, 0.2)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px", maxWidth: 650 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(212, 175, 55, 0.2)",
                border: "1px solid var(--color-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Award size={28} color="var(--color-gold-light)" />
            </div>

            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.35rem", fontWeight: 600, marginBottom: "4px" }}>
                Akredite Laboratuvar Tarafından Onaylı 2026 Hasat Analiz Raporu
              </h3>
              <p style={{ fontSize: "0.82rem", color: "rgba(245, 241, 232, 0.8)", lineHeight: 1.5 }}>
                Tüm partilerimiz Tarım ve Orman Bakanlığı onaylı yetkili gıda kontrol laboratuvarlarında test edilmektedir.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            style={{
              background: "var(--color-gold)",
              color: "var(--color-black)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "12px 22px",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.03em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease",
            }}
          >
            <FileText size={16} />
            Analiz Raporunu İncele
          </button>
        </div>

        {/* Laboratuvar Raporu Modal Penceresi */}
        {showReportModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              animation: "fadeInUp 0.25s ease",
            }}
            onClick={() => setShowReportModal(false)}
          >
            <div
              style={{
                background: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                maxWidth: 620,
                width: "100%",
                padding: "32px",
                border: "1px solid var(--color-gold)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShieldCheck size={24} color="var(--color-green)" />
                  <div>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 600, color: "var(--color-black)" }}>
                      2025/2026 Hasat Analiz Sertifikası
                    </h3>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-gray-500)" }}>
                      Rapor No: KTK-2025-089A • Akredite Gıda Laboratuvarı
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--color-gray-600)" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: "var(--color-cream)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "20px", fontSize: "0.82rem", lineHeight: 1.6, color: "var(--color-black)" }}>
                <strong>Numune Adı:</strong> Kütüklü Natürel Sızma Erken Hasat Zeytinyağı<br />
                <strong>Hasat Yeri:</strong> Kütüklü Köyü / Ege Bölgesi<br />
                <strong>Sonuç:</strong> Türk Gıda Kodeksi Zeytinyağı Tebliği&apos;ne göre <em>&ldquo;Kusursuz Natürel Sızma Zeytinyağı&rdquo;</em> sınıfındadır.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  onClick={() => setShowReportModal(false)}
                  style={{
                    background: "var(--color-gray-200)",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Kapat
                </button>
                <button
                  onClick={() => {
                    alert("Analiz raporu belgesi indiriliyor (Örnek Demo Rapor).");
                    setShowReportModal(false);
                  }}
                  style={{
                    background: "var(--color-green)",
                    color: "var(--color-cream)",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Download size={14} />
                  Raporu İndir (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
