"use client";

import { useState } from "react";
import { Play, Heart, Eye, Sparkles, X } from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface LiveMoment {

  id: string;
  title: string;
  location: string;
  views: string;
  likes: string;
  duration: string;
  gradient: string;
}

const moments: LiveMoment[] = [
  {
    id: "m1",
    title: "Sabahın İlk Işıklarında Elle Hasat",
    location: "Kütüklü Zeytinliği",
    views: "14.2K",
    likes: "1.2K",
    duration: "0:15",
    gradient: "linear-gradient(180deg, rgba(47,79,47,0.7) 0%, rgba(28,28,28,0.95) 100%)",
  },
  {
    id: "m2",
    title: "27°C Soğuk Sıkım Zümrüt Yeşili Akış",
    location: "Sıkım Tesisi",
    views: "28.6K",
    likes: "3.4K",
    duration: "0:12",
    gradient: "linear-gradient(180deg, rgba(212,175,55,0.6) 0%, rgba(23,36,23,0.95) 100%)",
  },
  {
    id: "m3",
    title: "Kızarmış Ekşi Maya Ekmekle İlk Tadım",
    location: "Köy Mutfağı",
    views: "19.8K",
    likes: "2.1K",
    duration: "0:18",
    gradient: "linear-gradient(180deg, rgba(160,82,45,0.6) 0%, rgba(28,28,28,0.95) 100%)",
  },
  {
    id: "m4",
    title: "300 Yıllık Anıt Ağacın Gölgesinde",
    location: "Kütüklü / Ege",
    views: "11.5K",
    likes: "980",
    duration: "0:20",
    gradient: "linear-gradient(180deg, rgba(34,139,34,0.6) 0%, rgba(20,28,20,0.95) 100%)",
  },
];

export function LiveMomentsSection() {
  const [activeMoment, setActiveMoment] = useState<LiveMoment | null>(null);

  return (
    <section
      style={{
        background: "var(--color-cream)",
        padding: "90px 0",
        position: "relative",
      }}
      aria-label="Kütüklü'den Canlı Kareler ve Reels"
    >
      <div className="container">
        {/* Başlık */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "48px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <InstagramIcon size={16} />
              <span className="section-tag" style={{ textAlign: "left", marginBottom: 0 }}>
                Canlı Hasat Hikayeleri
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                fontWeight: 500,
                color: "var(--color-black)",
              }}
            >
              Kütüklü&apos;den Canlı Kareler
            </h2>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--color-black)",
              textDecoration: "none",
              background: "var(--color-white)",
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <InstagramIcon size={16} />
            @kutukluzeytinyagi Takip Et
          </a>
        </div>

        {/* 4'lü Dikey Video / Hikaye Kartları */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          {moments.map((m) => (
            <div
              key={m.id}
              onClick={() => setActiveMoment(m)}
              style={{
                height: 380,
                borderRadius: "var(--radius-lg)",
                background: m.gradient,
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className="interactive-product-card"
            >
              {/* Üst Süre & Canlı Rozeti */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(4px)",
                    color: "var(--color-cream)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span className="green-pulse-dot" />
                  Canlı Hasat
                </div>

                <span
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    color: "var(--color-cream)",
                    fontSize: "0.68rem",
                    padding: "3px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {m.duration}
                </span>
              </div>

              {/* Orta: Play Butonu */}
              <div
                style={{
                  alignSelf: "center",
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.25)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s ease",
                }}
              >
                <Play size={20} fill="white" color="white" style={{ marginLeft: "3px" }} />
              </div>

              {/* Alt Bilgi */}
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-gold-light)", fontWeight: 600, marginBottom: "4px" }}>
                  📍 {m.location}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "var(--color-cream)",
                    marginBottom: "12px",
                    lineHeight: 1.25,
                  }}
                >
                  {m.title}
                </h3>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    fontSize: "0.75rem",
                    color: "rgba(245, 241, 232, 0.8)",
                    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                    paddingTop: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Eye size={13} />
                    <span>{m.views}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Heart size={13} fill="rgba(245, 241, 232, 0.8)" />
                    <span>{m.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Oynatıcı Önizleme Modal'ı */}
        {activeMoment && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              animation: "fadeInUp 0.25s ease",
            }}
            onClick={() => setActiveMoment(null)}
          >
            <div
              style={{
                width: 360,
                height: 600,
                background: activeMoment.gradient,
                borderRadius: "var(--radius-xl)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                border: "1px solid var(--color-gold)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--color-cream)", fontWeight: 700 }}>
                  📍 {activeMoment.location}
                </span>
                <button
                  onClick={() => setActiveMoment(null)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid var(--color-gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                  }}
                >
                  <Play size={28} fill="var(--color-gold)" color="var(--color-gold)" style={{ marginLeft: "4px" }} />
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-cream)" }}>
                  Hasat anı ve sıkım video akışı simülasyonu
                </p>
              </div>

              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "white", marginBottom: "8px" }}>
                  {activeMoment.title}
                </h3>
                <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--color-gold-light)" }}>
                  <span>{activeMoment.views} İzlenme</span>
                  <span>{activeMoment.likes} Beğeni</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
