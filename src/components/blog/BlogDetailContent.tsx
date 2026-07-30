"use client";

import Link from "next/link";
import { ArrowLeft, Clock, User, Share2 } from "lucide-react";
import type { DisplayBlogPost } from "@/lib/blog";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function BlogDetailContent({ post }: { post: DisplayBlogPost }) {
  const content = post.content || "";

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* ── HERO ── */}
      <div
        style={{
          background: post.imageUrl,
          height: "50vh",
          minHeight: "400px",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />
        
        <div className="container" style={{ position: "relative", zIndex: 1, paddingBottom: "60px", color: "var(--color-white)" }}>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.85rem",
              textDecoration: "none",
              marginBottom: "24px",
              transition: "color 0.2s",
            }}
          >
            <ArrowLeft size={16} /> Blog&apos;a Dön
          </Link>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span
              style={{
                background: "var(--color-gold)",
                color: "var(--color-white)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: "20px",
              }}
            >
              {post.category}
            </span>
            <span style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={14} /> {post.readTime}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 500,
              lineHeight: 1.1,
              maxWidth: "900px",
              marginBottom: "24px",
            }}
          >
            {post.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.9rem", color: "rgba(255,255,255,0.9)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={16} />
              </div>
              <span style={{ fontWeight: 500 }}>{post.author}</span>
            </div>
            <span>•</span>
            <span>{post.date}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "60px", alignItems: "start" }} className="blog-layout">
          
          {/* ── SOL: İÇERİK (Makale) ── */}
          <article className="blog-article" style={{ maxWidth: "800px" }}>
            {content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("###")) {
                return (
                  <h3
                    key={i}
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "2rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                      marginTop: "48px",
                      marginBottom: "20px",
                    }}
                  >
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith(">")) {
                return (
                  <blockquote
                    key={i}
                    style={{
                      margin: "40px 0",
                      padding: "32px",
                      background: "var(--color-cream)",
                      borderLeft: "4px solid var(--color-gold)",
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.4rem",
                      fontStyle: "italic",
                      color: "var(--color-black)",
                      lineHeight: 1.6,
                    }}
                  >
                    {paragraph.replace("> ", "")}
                  </blockquote>
                );
              }
              if (paragraph.match(/^\d\./)) {
                return (
                  <div key={i} style={{ marginBottom: "24px" }}>
                    {paragraph.split("\n").map((line, idx) => (
                      <p key={idx} style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "var(--color-gray-600)", marginBottom: "12px", display: "flex", gap: "12px" }}>
                        <span style={{ color: "var(--color-gold)", fontWeight: 700 }}>{line.split(" ")[0]}</span>
                        <span dangerouslySetInnerHTML={{ __html: line.substring(line.indexOf(" ") + 1).replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--color-black)">$1</strong>') }} />
                      </p>
                    ))}
                  </div>
                );
              }
              return (
                <p
                  key={i}
                  style={{
                    fontSize: "1.1rem",
                    lineHeight: 1.85,
                    color: "var(--color-gray-600)",
                    marginBottom: "24px",
                  }}
                  dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--color-black)">$1</strong>') }}
                />
              );
            })}

            {/* Paylaşım Alanı */}
            <div style={{ marginTop: "60px", paddingTop: "32px", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 600, color: "var(--color-black)" }}>
                Bu yazıyı paylaş:
              </span>
              <div style={{ display: "flex", gap: "12px" }}>
                {[Share2, FacebookIcon, TwitterIcon, LinkedinIcon].map((Icon, i) => (
                  <button
                    key={i}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-white)",
                      color: "var(--color-gray-500)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    className="share-btn"
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>
          </article>

          {/* ── SAĞ: SİDEBAR ── */}
          <aside>
            <div style={{ position: "sticky", top: "100px" }}>
              {/* Yazar Bilgisi */}
              <div style={{ background: "var(--color-gray-100)", padding: "32px", borderRadius: "var(--radius-lg)", marginBottom: "40px", textAlign: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--color-cream)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={32} color="var(--color-gold)" />
                </div>
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "8px" }}>
                  {post.author}
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", lineHeight: 1.6 }}>
                  Zeytinyağı tutkunu, üretici ve kaliteli yaşam savunucusu. Kütüklü köyünden hikayeler paylaşıyor.
                </p>
              </div>

              {/* Bülten (Newsletter) */}
              <div style={{ border: "1px solid var(--color-gold)", padding: "32px", borderRadius: "var(--radius-lg)", background: "var(--color-white)" }}>
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "12px" }}>
                  Zeytin Günlükleri
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", lineHeight: 1.6, marginBottom: "20px" }}>
                  Yeni yazılarımızdan, özel indirimlerden ve hasat haberlerinden ilk siz haberdar olun.
                </p>
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "12px",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
                <button
                  style={{
                    width: "100%",
                    background: "var(--color-black)",
                    color: "var(--color-white)",
                    border: "none",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  Abone Ol
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .share-btn:hover {
          background: var(--color-gold) !important;
          color: var(--color-white) !important;
          border-color: var(--color-gold) !important;
        }

        .blog-article p:first-of-type::first-letter {
          font-family: var(--font-heading);
          font-size: 4rem;
          line-height: 0.8;
          float: left;
          margin-right: 12px;
          margin-top: 8px;
          color: var(--color-gold);
        }

        @media (max-width: 992px) {
          .blog-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
