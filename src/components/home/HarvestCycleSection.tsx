"use client";

import { useState } from "react";
import { Clock, Sun, Truck, Droplets, ShieldCheck, HeartHandshake, CheckCircle2 } from "lucide-react";

interface CycleStep {
  time: string;
  icon: typeof Sun;
  title: string;
  shortDesc: string;
  fullDesc: string;
  keyMetric: string;
  metricLabel: string;
  highlight: string;
}

const cycleSteps: CycleStep[] = [
  {
    time: "06:00",
    icon: Sun,
    title: "Sisli Sabah Hasadı",
    shortDesc: "Güneş doğarken, dalları incitmeden elle toplama.",
    fullDesc:
      "Kütüklü Köyü'nün sabah serinliğinde zeytinler henüz dalındayken taranarak ve elle toplanır. Yere düşen dip zeytinler asla sıkıma alınmaz; yalnızca dalından taze toplananlar kasalanır.",
    keyMetric: "%100 Dalından",
    metricLabel: "Dip Zeytini Karışmaz",
    highlight: "Elle Hasat & Hasarsız Toplama",
  },
  {
    time: "11:00",
    icon: Truck,
    title: "Ayıklama & Hızlı Nakil",
    shortDesc: "Hava alan özel kasalarla bekletilmeden nakil.",
    fullDesc:
      "Çuvallarda ezilip fermantasyona uğramasını engellemek için zeytinler hava geçiren delikli kasalara yerleştirilir. Hasat edildikten en geç 4 saat sonra sıkım tesisine ulaştırılır.",
    keyMetric: "< 4 Saat",
    metricLabel: "Hasattan Tesise Süre",
    highlight: "Sıfır Fermantasyon & Maksimum Tazelik",
  },
  {
    time: "14:00",
    icon: Droplets,
    title: "27°C Altında Soğuk Sıkım",
    shortDesc: "Isı görmeden kapalı devrede zümrüt yeşili ekstraksiyon.",
    fullDesc:
      "Zeytinler yıkanıp kırıldıktan sonra hava ile teması kesilmiş kapalı kontinü sistemde en fazla 27°C derecede sıkılır. Böylece yüksek polifenoller ve E vitamini zeytinyağında kilitli kalır.",
    keyMetric: "≤ 27°C",
    metricLabel: "Gerçek Soğuk Sıkım",
    highlight: "Polifenol & Vitamin Koruması",
  },
  {
    time: "17:00",
    icon: ShieldCheck,
    title: "Azotlu Krom Tanklarda Dinlenme",
    shortDesc: "Hava ve ışık görmeyen özel paslanmaz tanklar.",
    fullDesc:
      "Sıkılan taze yağ, filtre edilmeden önce hava ile teması engelleyen azot gazı basılı paslanmaz çelik krom tanklarda ideal sıcaklıkta (16-18°C) dinlenmeye bırakılır.",
    keyMetric: "16-18°C",
    metricLabel: "Sabit İklimlendirme",
    highlight: "Oksijensiz Koruma & Doğal Çökeltme",
  },
  {
    time: "Sofranızda",
    icon: HeartHandshake,
    title: "Koyu Cam Şişede Kapınıza",
    shortDesc: "Güneş ışığını kesen UV korumalı cam şişelerde teslim.",
    fullDesc:
      "Siparişiniz geldiğinde taze dolum yapılır ve UV korumalı koyu renk cam şişelerde özenli koruyucu ambalajla doğrudan Kütüklü Köyü'nden mutfağınıza gönderilir.",
    keyMetric: "UV Korumalı",
    metricLabel: "Koyu Cam Şişeleme",
    highlight: "Köyden Sofranıza Doğrudan",
  },
];

export function HarvestCycleSection() {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(2); // Varsayılan: Soğuk Sıkım

  const activeStep = cycleSteps[activeStepIndex] || cycleSteps[0];
  const StepIcon = activeStep.icon;

  return (
    <section
      style={{
        background: "linear-gradient(180deg, #1C1C1C 0%, #172417 50%, #141C14 100%)",
        color: "var(--color-cream)",
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Kütüklü'de Bir Gün: Hasattan Sofraya 24 Saat"
    >
      {/* Arka plan altın hare */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Başlık */}
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 56px auto" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              display: "inline-block",
              marginBottom: "12px",
            }}
          >
            ✦ ŞEFFAF ÜRETİM DÖNGÜSÜ ✦
          </span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.1rem, 3.8vw, 3.2rem)",
              fontWeight: 500,
              color: "var(--color-cream)",
              marginBottom: "16px",
              lineHeight: 1.2,
            }}
          >
            Kütüklü&apos;de Bir Gün: Hasattan Sofraya 24 Saat
          </h2>
          <p style={{ color: "rgba(245, 241, 232, 0.75)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Zeytinin dalından koparıldığı andan itibaren dakikalarla yarışırız. Yağımızın asidinin %0.3&apos;ün altında kalmasının sırrı bu 24 saatlik disiplindedir.
          </p>
        </div>

        {/* 5 Aşamalı Zaman Çizelgesi Butonları */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "12px",
            marginBottom: "40px",
          }}
          className="hero-grid"
        >
          {cycleSteps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = idx === activeStepIndex;
            return (
              <button
                key={step.time}
                onClick={() => setActiveStepIndex(idx)}
                style={{
                  background: isSelected ? "rgba(212, 175, 55, 0.15)" : "rgba(255, 255, 255, 0.04)",
                  border: isSelected ? "1px solid var(--color-gold)" : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px 14px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  position: "relative",
                  transform: isSelected ? "translateY(-4px)" : "none",
                }}
              >
                {/* Zaman Rozeti */}
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: isSelected ? "var(--color-gold-light)" : "rgba(245, 241, 232, 0.6)",
                    background: isSelected ? "rgba(212, 175, 55, 0.25)" : "rgba(0, 0, 0, 0.3)",
                    padding: "3px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {step.time}
                </span>

                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: isSelected ? "var(--color-gold)" : "rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={18} color={isSelected ? "var(--color-black)" : "var(--color-cream)"} />
                </div>

                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: isSelected ? "var(--color-cream)" : "rgba(245, 241, 232, 0.7)",
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Seçili Adım Detay Kartı */}
        <div
          className="glass-panel-dark"
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "44px",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(212, 175, 55, 0.35)",
            animation: "fadeInUp 0.35s ease",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: "48px",
              alignItems: "center",
            }}
            className="hero-grid"
          >
            {/* Sol: Adım Açıklaması */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(212, 175, 55, 0.15)",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  marginBottom: "16px",
                }}
              >
                <Clock size={13} color="var(--color-gold)" />
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-gold-light)", letterSpacing: "0.08em" }}>
                  AŞAMA {activeStepIndex + 1} / 5 • SAAT {activeStep.time}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
                  fontWeight: 600,
                  color: "var(--color-cream)",
                  marginBottom: "16px",
                }}
              >
                {activeStep.title}
              </h3>

              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.8,
                  color: "rgba(245, 241, 232, 0.85)",
                  marginBottom: "24px",
                }}
              >
                {activeStep.fullDesc}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--color-gold-light)",
                }}
              >
                <CheckCircle2 size={18} color="var(--color-gold)" />
                <span>{activeStep.highlight}</span>
              </div>
            </div>

            {/* Sağ: Teknik Değer & Vurgu Kutusu */}
            <div
              style={{
                background: "linear-gradient(145deg, rgba(47, 79, 47, 0.35) 0%, rgba(28, 28, 28, 0.6) 100%)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "var(--radius-lg)",
                padding: "36px 30px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(212, 175, 55, 0.15)",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "8px",
                }}
              >
                <StepIcon size={30} color="var(--color-gold)" />
              </div>

              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "var(--color-gold-light)",
                  lineHeight: 1,
                }}
              >
                {activeStep.keyMetric}
              </div>

              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(245, 241, 232, 0.7)",
                }}
              >
                {activeStep.metricLabel}
              </div>

              <div
                style={{
                  marginTop: "16px",
                  fontSize: "0.75rem",
                  color: "rgba(245, 241, 232, 0.6)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingTop: "12px",
                  width: "100%",
                }}
              >
                Zamana karşı titiz süreç, her damlada kalite.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
