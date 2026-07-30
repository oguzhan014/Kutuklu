"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Send, AlertCircle } from "lucide-react";
import { sendContactMessage } from "@/app/actions/contact";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function IletisimContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});

    const result = await sendContactMessage(formData);

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }

    setIsSuccess(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setIsSuccess(false), 8000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Adres",
      details: ["Kütüklü Köyü No:45", "Mut / Mersin, Türkiye"],
    },
    {
      icon: Phone,
      title: "Telefon",
      details: ["+90 (555) 123 45 67", "+90 (324) 777 88 99"],
    },
    {
      icon: Mail,
      title: "E-Posta",
      details: ["info@kutuklu.com", "satis@kutuklu.com"],
    },
    {
      icon: Clock,
      title: "Çalışma Saatleri",
      details: ["Pzt - Cuma: 09:00 - 18:00", "Cumartesi: 10:00 - 14:00"],
    },
  ];

  return (
    <div style={{ background: "var(--color-gray-100)", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* ── HERO & BREADCRUMB ── */}
      <div
        style={{
          background: "var(--color-cream)",
          padding: "60px 0 40px",
          borderBottom: "1px solid var(--color-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dekoratif Çizgiler */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, border: "1px solid rgba(212,175,55,0.1)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: -20, right: -20, width: 200, height: 200, border: "1px solid rgba(212,175,55,0.15)", borderRadius: "50%" }} />
        
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <span className="section-tag" style={{ justifyContent: "center" }}>Bize Ulaşın</span>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "12px",
            }}
          >
            İletişim
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--color-gray-500)", maxWidth: "500px", margin: "0 auto 20px" }}>
            Soru, görüş ve toptan sipariş talepleriniz için ekibimizle iletişime geçebilirsiniz.
          </p>
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "0.85rem",
              color: "var(--color-gray-400)",
            }}
          >
            <Link href="/" style={{ color: "var(--color-gray-400)", textDecoration: "none" }}>Ana Sayfa</Link>
            <span>›</span>
            <span style={{ color: "var(--color-black)", fontWeight: 500 }}>İletişim</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "60px" }}>
        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "60px", alignItems: "start" }}>
          
          {/* ── SOL: BİLGİ KARTLARI ── */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.8rem",
                fontWeight: 600,
                color: "var(--color-black)",
                marginBottom: "30px",
              }}
            >
              İletişim Bilgileri
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {contactInfo.map((info, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    background: "var(--color-white)",
                    padding: "24px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  className="contact-info-card"
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: "var(--color-cream)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-gold)",
                      flexShrink: 0,
                    }}
                  >
                    <info.icon size={20} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "var(--color-black)",
                        marginBottom: "8px",
                      }}
                    >
                      {info.title}
                    </h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} style={{ fontSize: "0.9rem", color: "var(--color-gray-500)", lineHeight: 1.6 }}>
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sosyal Medya */}
            <div style={{ marginTop: "40px" }}>
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-black)",
                  marginBottom: "16px",
                }}
              >
                Bizi Takip Edin
              </h3>
              <div style={{ display: "flex", gap: "12px" }}>
                {[
                  { icon: InstagramIcon, href: "#" },
                ].map((social, i) => (
                  <Link
                    key={i}
                    href={social.href}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "var(--color-white)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-black)",
                      transition: "all 0.3s ease",
                    }}
                    className="social-link"
                  >
                    <social.icon size={18} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── SAĞ: İLETİŞİM FORMU ── */}
          <div
            style={{
              background: "var(--color-white)",
              borderRadius: "var(--radius-xl)",
              padding: "48px",
              border: "1px solid var(--color-border)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.02)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "2rem",
                fontWeight: 500,
                color: "var(--color-black)",
                marginBottom: "8px",
              }}
            >
              Mesaj Gönderin
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--color-gray-500)", marginBottom: "32px" }}>
              Aşağıdaki formu doldurarak bize doğrudan ulaşabilirsiniz. Size en kısa sürede dönüş yapacağız.
            </p>

            {isSuccess ? (
              <div
                style={{
                  background: "var(--color-green-light)",
                  padding: "30px",
                  borderRadius: "var(--radius-lg)",
                  textAlign: "center",
                  color: "var(--color-green-dark)",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✨</div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "8px" }}>
                  Mesajınız Alındı!
                </h3>
                <p style={{ fontSize: "0.9rem" }}>
                  İlginiz için teşekkür ederiz. Ekibimiz sizinle en kısa sürede iletişime geçecektir.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="form-row">
                  {/* Ad Soyad */}
                  <div className="input-group">
                    <label htmlFor="name" style={labelStyle}>Ad Soyad</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={inputStyle}
                      placeholder="Ahmet Yılmaz"
                    />
                  </div>
                  {/* E-posta */}
                  <div className="input-group">
                    <label htmlFor="email" style={labelStyle}>E-Posta</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={inputStyle}
                      placeholder="ahmet@example.com"
                    />
                  </div>
                </div>

                {/* Konu */}
                <div className="input-group">
                  <label htmlFor="subject" style={labelStyle}>Konu</label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }}
                  >
                    <option value="" disabled>Lütfen bir konu seçin</option>
                    <option value="Sipariş & Teslimat">Sipariş & Teslimat</option>
                    <option value="Toptan Satış">Toptan Satış</option>
                    <option value="Ürün Bilgisi">Ürün Bilgisi</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                {/* Mesaj */}
                <div className="input-group">
                  <label htmlFor="message" style={labelStyle}>Mesajınız</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ ...inputStyle, resize: "vertical", paddingTop: "14px" }}
                    placeholder="Size nasıl yardımcı olabiliriz?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: "var(--color-black)",
                    color: "var(--color-white)",
                    border: "none",
                    padding: "16px 32px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "background 0.3s ease",
                    marginTop: "8px",
                  }}
                  className="submit-btn"
                >
                  {isSubmitting ? (
                    "Gönderiliyor..."
                  ) : (
                    <>
                      Mesajı Gönder
                      <Send size={16} />
                    </>
                  )}
                </button>

                {(error || Object.keys(fieldErrors).length > 0) && (
                  <div
                    style={{
                      background: "#FEE2E2",
                      border: "1px solid #FCA5A5",
                      color: "#991B1B",
                      padding: "13px 16px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      lineHeight: 1.6,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>
                      {error}
                      {Object.values(fieldErrors).length > 0 && (
                        <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                          {Object.values(fieldErrors).map((message) => (
                            <li key={message}>{message}</li>
                          ))}
                        </ul>
                      )}
                    </span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── HARİTA ── */}
      <div style={{ marginTop: "80px", height: "450px", background: "#e5e3df", position: "relative" }}>
        {/* Placeholder for iframe map */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-gray-500)",
          }}
        >
          <MapPin size={48} color="var(--color-gold)" style={{ marginBottom: "16px" }} />
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--color-black)" }}>
            Bizi Ziyaret Edin
          </h3>
          <p style={{ marginTop: "8px" }}>Mersin / Mut Zeytin Bahçeleri</p>
        </div>
        
        {/* Gerçek harita için buraya Google Maps iframe eklenebilir */}
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102008.06941162451!2d33.36440785162477!3d36.643242699999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d86b7cc9ec1115%3A0xc6de92881079d3!2sMut%2C%20Mersin!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
          width="100%"
          height="100%"
          style={{ border: 0, filter: "grayscale(0.4) contrast(1.1) opacity(0.8)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <style>{`
        .contact-info-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-gold);
        }
        
        .social-link:hover {
          background: var(--color-gold);
          color: var(--color-white) !important;
          border-color: var(--color-gold);
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--color-gold) !important;
        }

        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
          border-color: var(--color-gold) !important;
          background: var(--color-white) !important;
          box-shadow: 0 0 0 4px rgba(212,175,55,0.1) !important;
        }

        @media (max-width: 992px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// Ortak Form Stilleri
const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-body)",
  fontSize: "0.8rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--color-black)",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  background: "var(--color-gray-100)",
  border: "1px solid transparent",
  borderRadius: "var(--radius-sm)",
  fontSize: "0.95rem",
  fontFamily: "var(--font-body)",
  color: "var(--color-black)",
  outline: "none",
  transition: "all 0.3s ease",
};
