"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, MessageSquare, ArrowRight } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqList: FaqItem[] = [
  {
    question: "Erken hasat zeytinyağı neden boğazda yakıcılık hissi bırakır?",
    answer:
      "Boğazda hissedilen o hafif biberimsi yakıcılık ve genizde oluşan acılık, zeytinyağının kalitesinin ve yüksek 'Polifenol' (güçlü antioksidan) içeriğinin en kesin kanıtıdır. Bu asitlikten değil, zeytinin yeşilken içerdiği doğal biyoaktif maddelerden kaynaklanır.",
    category: "Kalite & Tadım",
  },
  {
    question: "Soğuk sıkım (≤ 27°C) neden bu kadar önemlidir?",
    answer:
      "Zeytin hamuru sıkılırken sıcaklık 27°C derecenin üzerine çıkarsa yağ miktarı artar ancak zeytinyağının içindeki E vitamini, polifenoller ve o eşsiz taze çimen aroması buharlaşıp kaybolur. Kütüklü olarak yağlarımızı kesinlikle 27°C'nin altında soğuk sıkarak tüm şifasını koruyoruz.",
    category: "Üretim",
  },
  {
    question: "Zeytinyağı buzdolabına konduğunda donarsa bozulmuş mudur?",
    answer:
      "Tam aksine! Katkısız ve saf natürel sızma zeytinyağları 4-5°C derecenin altında doğal olarak donar ve kristalleşir. Bu zeytinyağının hilesiz ve kimyasal işlem görmemiş saf bir ürün olduğunu gösterir. Oda sıcaklığına alındığında hiçbir besin değerini kaybetmeden eski berrak haline döner.",
    category: "Saklama & Kullanım",
  },
  {
    question: "Asitlik oranının %0.28 olması ne anlama gelir?",
    answer:
      "Türk Gıda Kodeksi'ne göre serbest yağ asitliği %0.80'in altında olan yağlar 'Natürel Sızma' kabul edilir. Kütüklü Zeytinyağı'nın asit oranı ise %0.24 - %0.28 arasındadır. Bu oran, zeytinin dalından koparıldığı gün hiç bekletilmeden kusursuz şekilde sıkıldığını belgeler.",
    category: "Kalite & Tadım",
  },
  {
    question: "Cam şişeler kargoda kırılmadan nasıl ulaşıyor?",
    answer:
      "Tüm siparişlerimiz, şişelerin darbe almasını tamamen önleyen özel hava yastıklı (air-column) koruyucu ambalajlar ve çift katlı mukavva kolilerle sevk edilir. Olası bir kargo hasarında ise koşulsuz olarak aynı gün yenisini ücretsiz gönderiyoruz.",
    category: "Kargo & Teslimat",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      style={{
        background: "linear-gradient(180deg, var(--color-white) 0%, var(--color-gray-100) 100%)",
        padding: "90px 0",
        position: "relative",
      }}
      aria-label="Sıkça Sorulan Sorular"
    >
      <div className="container" style={{ maxWidth: 880 }}>
        {/* Başlık */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <HelpCircle size={16} color="var(--color-gold)" />
            <span className="section-tag" style={{ marginBottom: 0 }}>
              Merak Edilenler
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "14px",
            }}
          >
            Sıkça Sorulan Sorular
          </h2>
          <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Gerçek zeytinyağı hakkında en çok merak edilen konuları ve uzman cevaplarını derledik.
          </p>
        </div>

        {/* Akordeon Listesi */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "40px" }}>
          {faqList.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.question}
                style={{
                  background: "var(--color-white)",
                  border: isOpen ? "1px solid var(--color-gold)" : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                  boxShadow: isOpen ? "0 8px 25px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    gap: "16px",
                  }}
                  aria-expanded={isOpen}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      color: isOpen ? "var(--color-green)" : "var(--color-black)",
                      lineHeight: 1.35,
                    }}
                  >
                    {faq.question}
                  </span>

                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: isOpen ? "var(--color-green)" : "var(--color-cream)",
                      color: isOpen ? "var(--color-cream)" : "var(--color-black)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 24px 22px 24px",
                      color: "var(--color-gray-600)",
                      fontSize: "0.9rem",
                      lineHeight: 1.7,
                      borderTop: "1px solid rgba(0,0,0,0.04)",
                      paddingTop: "16px",
                      animation: "fadeInUp 0.2s ease",
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ekstra Destek Kutusu */}
        <div
          style={{
            background: "var(--color-cream)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--color-green)",
                color: "var(--color-cream)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-black)" }}>
                Aklınıza takılan başka bir soru mu var?
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                Üretimimiz ve siparişleriniz hakkında dilediğiniz an bizimle iletişime geçebilirsiniz.
              </div>
            </div>
          </div>

          <Link
            href="/iletisim"
            style={{
              background: "var(--color-green)",
              color: "var(--color-cream)",
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.82rem",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Bize Ulaşın <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
