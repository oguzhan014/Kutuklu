"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { subscribeNewsletter } from "@/app/actions/contact";

// lucide-react'ta Instagram ikonu bulunmuyor, SVG ile yazıldı
function InstagramIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setError("");

    const result = await subscribeNewsletter({ email });

    if (!result.ok) {
      setError(result.error);
      setStatus("idle");
      return;
    }

    setStatus("success");
  };

  return (
    <section
      style={{
        background: "linear-gradient(135deg, var(--color-green) 0%, var(--color-black) 100%)",
        padding: "80px 0",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="E-bülten aboneliği"
    >
      {/* Dekoratif arka plan efekti */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,175,55,0.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 50%, rgba(212,175,55,0.05) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <span className="section-tag">Bültenimize Katılın</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 3vw, 2.8rem)",
              fontWeight: 500,
              color: "var(--color-cream)",
              marginBottom: "16px",
            }}
          >
            Kampanyalardan
            <br />
            <em style={{ fontStyle: "italic", color: "var(--color-gold)" }}>Haberdar Olun</em>
          </h2>

          <p
            style={{
              fontSize: "0.95rem",
              color: "rgba(245,241,232,0.7)",
              lineHeight: 1.7,
              marginBottom: "36px",
            }}
          >
            Yeni ürünler, özel kampanyalar ve zeytin hasat haberleri için e-posta listemize katılın. İlk siparişinizde %10 indirim!
          </p>

          {status === "success" ? (
            <div
              style={{
                background: "rgba(212,175,55,0.15)",
                border: "1px solid var(--color-gold)",
                color: "var(--color-gold)",
                padding: "20px",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
              }}
            >
              ✓ Abone oldunuz! Kampanya ve yeni ürün duyurularımız e-postanıza gelecek.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                gap: "0",
                maxWidth: "480px",
                margin: "0 auto",
              }}
            >
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                required
                style={{
                  flex: 1,
                  padding: "16px 20px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRight: "none",
                  borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)",
                  color: "var(--color-cream)",
                  fontSize: "0.9rem",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                }}
              />
              <button
                id="newsletter-submit"
                type="submit"
                disabled={status === "loading"}
                style={{
                  background: "var(--color-gold)",
                  color: "var(--color-black)",
                  border: "none",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  padding: "16px 24px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {status === "loading" ? "..." : (
                  <>
                    <Send size={16} />
                    Abone Ol
                  </>
                )}
              </button>
            </form>
          )}

          {error && (
            <p
              style={{
                marginTop: "14px",
                fontSize: "0.85rem",
                color: "#FCA5A5",
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              {error}
            </p>
          )}

          {/* Instagram takip */}
          <div
            style={{
              marginTop: "48px",
              paddingTop: "40px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "rgba(245,241,232,0.5)",
                marginBottom: "16px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Instagram&apos;da Bizi Takip Edin
            </p>
            <a
              href="https://instagram.com/kutukluzeytinyagi"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                color: "var(--color-gold)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1rem",
                transition: "opacity 0.2s",
              }}
            >
              <InstagramIcon size={22} />
              @kutukluzeytinyagi
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
