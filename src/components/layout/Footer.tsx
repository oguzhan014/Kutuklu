import Link from "next/link";
import Image from "next/image";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-black)",
        color: "var(--color-cream)",
      }}
    >
      {/* Ana Footer */}
      <div
        className="container"
        style={{ padding: "64px 24px 48px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "48px",
          }}
        >
          {/* Marka Sütunu */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "var(--color-green)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Leaf size={16} color="var(--color-gold)" />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "var(--color-cream)",
                }}
              >
                Kütüklü
              </span>
            </Link>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-gray-400)",
                lineHeight: 1.7,
                marginBottom: "24px",
              }}
            >
              Kütüklü Köyü&apos;nden sofranıza, nesiller boyu süren gelenekle üretilen erken hasat natürel sızma zeytinyağı.
            </p>
            {/* Sosyal Medya */}
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                { Icon: InstagramIcon, href: "https://instagram.com/kutukluzeytinyagi", label: "Instagram" },
                { Icon: FacebookIcon, href: "#", label: "Facebook" },
                { Icon: YoutubeIcon, href: "#", label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    border: "1px solid var(--color-gray-600)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-gray-400)",
                    transition: "all 0.2s ease",
                  }}
                  className="footer-social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Kurumsal */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                marginBottom: "20px",
              }}
            >
              Kurumsal
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { href: "/hikayemiz", label: "Hikayemiz" },
                { href: "/hikayemiz#uretim-surecimiz", label: "Üretim Sürecimiz" },
                { href: "/hikayemiz#sertifikalar", label: "Sertifikalar" },
                { href: "/blog", label: "Blog & Tarifler" },
                { href: "/iletisim", label: "İletişim" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-gray-400)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    className="footer-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                marginBottom: "20px",
              }}
            >
              Müşteri Hizmetleri
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { href: "/kargo-ve-teslimat", label: "Kargo ve Teslimat" },
                { href: "/iade-degisim", label: "İade & Değişim" },
                { href: "/sikca-sorulan-sorular", label: "Sıkça Sorulan Sorular" },
                { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
                { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-gray-400)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    className="footer-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                marginBottom: "20px",
              }}
            >
              İletişim
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "16px" }}>
              <li style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <MapPin size={16} color="var(--color-gold)" style={{ marginTop: 3, flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", color: "var(--color-gray-400)", lineHeight: 1.5 }}>
                  Kütüklü Köyü, Ege Bölgesi, Türkiye
                </span>
              </li>
              <li style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Phone size={16} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                <a
                  href="tel:+905001234567"
                  style={{ fontSize: "0.875rem", color: "var(--color-gray-400)", textDecoration: "none" }}
                  className="footer-link"
                >
                  +90 500 123 45 67
                </a>
              </li>
              <li style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Mail size={16} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                <a
                  href="mailto:info@kutuklu.com.tr"
                  style={{ fontSize: "0.875rem", color: "var(--color-gray-400)", textDecoration: "none" }}
                  className="footer-link"
                >
                  info@kutuklu.com.tr
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alt Çizgi */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "20px 24px",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
            © {new Date().getFullYear()} Kütüklü Zeytinyağı. Tüm hakları saklıdır.
          </p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", opacity: 0.6, color: "var(--color-cream)" }}>
            <Image src="/visa.svg" alt="Visa" width={40} height={16} />
            <Image src="/mastercard.svg" alt="Mastercard" width={30} height={18} />
            <Image src="/troy.svg" alt="Troy" width={40} height={16} />
          </div>
        </div>
      </div>


    </footer>
  );
}
