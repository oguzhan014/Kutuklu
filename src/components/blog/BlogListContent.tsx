"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, User, Sparkles, BookOpen, Calendar, Mail, Check } from "lucide-react";
import type { DisplayBlogPost } from "@/lib/blog";

const categories = ["Tümü", "Rehberler", "Tarifler", "Köy Yaşamı", "Sağlık & Yaşam"];

export function BlogListContent({ posts }: { posts: DisplayBlogPost[] }) {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  if (posts.length === 0) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-gray-500)",
        }}
      >
        Henüz yayınlanmış bir blog yazısı yok.
      </div>
    );
  }

  const featuredPost = posts.find((p) => p.isFeatured) || posts[0]!;
  const filteredPosts = posts.filter(
    (p) => selectedCategory === "Tümü" || p.category.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmailInput("");
    }, 3000);
  };

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* ── HEADER ── */}
      <div
        style={{
          background: "linear-gradient(145deg, #1C261C 0%, #203320 50%, #152215 100%)",
          padding: "70px 0 50px",
          color: "var(--color-cream)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.15) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(212, 175, 55, 0.15)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              padding: "6px 16px",
              borderRadius: "30px",
              marginBottom: "16px",
            }}
          >
            <BookOpen size={14} color="var(--color-gold-light)" />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold-light)" }}>
              Zeytin Günlükleri & Gastronomi
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.4rem, 4.8vw, 3.6rem)",
              fontWeight: 500,
              color: "var(--color-cream)",
              marginBottom: "14px",
              lineHeight: 1.15,
            }}
          >
            Kültür, Hasat & Gurme Tarifler
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(245, 241, 232, 0.75)", maxWidth: "620px", margin: "0 auto" }}>
            Zeytinyağının mucizevi dünyası, polifenol rehberleri, köyümüzün hasat hikayeleri ve sofranıza lezzet katacak şef sırları.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: "40px" }}>
        {/* Kategori Filtre Butonları */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "16px",
            marginBottom: "36px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  border: `1.5px solid ${isSelected ? "var(--color-green)" : "var(--color-border)"}`,
                  background: isSelected ? "var(--color-green)" : "var(--color-white)",
                  color: isSelected ? "var(--color-cream)" : "var(--color-gray-600)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ── ÖNE ÇIKAN YAZI (FEATURED POST) ── */}
        {selectedCategory === "Tümü" && featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr",
                background: "var(--color-white)",
                borderRadius: "var(--radius-xl)",
                border: "1.5px solid var(--color-border)",
                overflow: "hidden",
                marginBottom: "50px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease",
              }}
              className="featured-post-card"
            >
              {/* Görsel Alanı */}
              <div
                style={{
                  background: "linear-gradient(135deg, #203320 0%, #152215 100%)",
                  minHeight: "360px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/table-pairing-real.png"
                  alt={featuredPost.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    background: "var(--color-gold)",
                    color: "var(--color-black)",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "5px 14px",
                    borderRadius: "20px",
                  }}
                >
                  ✦ Editörün Seçimi
                </div>
              </div>

              {/* İçerik Alanı */}
              <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-green)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "12px",
                    display: "block",
                  }}
                >
                  {featuredPost.category}
                </span>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.8rem, 2.6vw, 2.3rem)",
                    fontWeight: 600,
                    color: "var(--color-black)",
                    lineHeight: 1.22,
                    marginBottom: "14px",
                  }}
                >
                  {featuredPost.title}
                </h2>
                <p style={{ fontSize: "0.92rem", color: "var(--color-gray-600)", lineHeight: 1.7, marginBottom: "24px" }}>
                  {featuredPost.excerpt}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "20px", color: "var(--color-gray-400)", fontSize: "0.82rem", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><User size={14} /> {featuredPost.author}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Clock size={14} /> {featuredPost.readTime}</div>
                  <div>{featuredPost.date}</div>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--color-gold-dark)",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  Devamını Oku <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── DİĞER YAZILAR GRID ── */}
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.8rem",
            fontWeight: 500,
            color: "var(--color-black)",
            marginBottom: "28px",
          }}
        >
          {selectedCategory === "Tümü" ? "Tüm Makaleler & Rehberler" : `${selectedCategory} Yazıları`}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "30px", marginBottom: "60px" }} className="blog-grid">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--color-white)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  border: "1px solid var(--color-border)",
                  transition: "all 0.3s ease",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                className="post-card"
              >
                {/* Görsel */}
                <div style={{ height: "200px", background: "linear-gradient(145deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--color-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookOpen size={20} color="var(--color-gold)" />
                  </div>
                </div>

                {/* İçerik */}
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "var(--color-green)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {post.category}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)" }}>
                      {post.readTime}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                      lineHeight: 1.3,
                      marginBottom: "10px",
                    }}
                  >
                    {post.title}
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", lineHeight: 1.6, marginBottom: "20px", flex: 1 }}>
                    {post.excerpt}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--color-border)", paddingTop: "14px", marginTop: "auto" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <User size={12} /> {post.author}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)" }}>
                      {post.date}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── BÜLTEN ABONELİK KUTUSU ── */}
        <div
          style={{
            background: "var(--color-cream)",
            border: "1.5px solid var(--color-gold)",
            borderRadius: "var(--radius-xl)",
            padding: "48px 36px",
            textAlign: "center",
            maxWidth: "760px",
            margin: "0 auto",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Mail size={16} color="var(--color-gold-dark)" />
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--color-gold-dark)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Kütüklü Bülteni
            </span>
          </div>

          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.8rem",
              fontWeight: 600,
              color: "var(--color-black)",
              marginBottom: "8px",
            }}
          >
            Yeni Hasat Duyuruları & Şef Tarifleri
          </h3>

          <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)", maxWidth: "520px", margin: "0 auto 24px auto" }}>
            Yılda yalnızca bir kez yapılan erken hasat açılışından ilk siz haberdar olun, özel indirim kodları kazanın.
          </p>

          <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "10px", maxWidth: "460px", margin: "0 auto" }}>
            <input
              type="email"
              placeholder="E-posta adresiniz..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
                outline: "none",
                background: "var(--color-white)",
              }}
            />
            <button
              type="submit"
              className="btn-gold"
              style={{ padding: "12px 24px", fontSize: "0.82rem", flexShrink: 0 }}
            >
              {subscribed ? <><Check size={16} /> Katıldınız</> : "Abone Ol"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .featured-post-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.06) !important;
          border-color: var(--color-gold) !important;
        }

        .post-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-gold) !important;
        }

        @media (max-width: 900px) {
          .featured-post-card {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
