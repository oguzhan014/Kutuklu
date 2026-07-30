import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";
import type { DisplayBlogPost } from "@/lib/blog";

export function BlogListContent({ posts }: { posts: DisplayBlogPost[] }) {
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
  const regularPosts = posts.filter((p) => p.id !== featuredPost.id);

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* ── HEADER ── */}
      <div
        style={{
          background: "var(--color-cream)",
          padding: "60px 0 40px",
          borderBottom: "1px solid var(--color-border)",
          textAlign: "center",
        }}
      >
        <div className="container">
          <span className="section-tag" style={{ justifyContent: "center" }}>Zeytin Günlükleri</span>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              fontWeight: 500,
              color: "var(--color-black)",
              marginBottom: "16px",
            }}
          >
            Blog & Hikayeler
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--color-gray-500)", maxWidth: "600px", margin: "0 auto" }}>
            Zeytinyağı kültürü, sağlık ipuçları, köyümüzden hikayeler ve sofranıza lezzet katacak özel tarifler.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: "60px" }}>
        
        {/* ── ÖNE ÇIKAN YAZI (FEATURED POST) ── */}
        <Link href={`/blog/${featuredPost.slug}`} style={{ textDecoration: "none" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "0",
              background: "var(--color-white)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--color-border)",
              overflow: "hidden",
              marginBottom: "60px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            className="featured-post-card"
          >
            {/* Görsel Alanı */}
            <div
              style={{
                background: featuredPost.imageUrl,
                minHeight: "400px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  left: 24,
                  background: "var(--color-gold)",
                  color: "var(--color-white)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "6px 12px",
                  borderRadius: "20px",
                }}
              >
                Öne Çıkan
              </div>
            </div>

            {/* İçerik Alanı */}
            <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-green)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "16px",
                  display: "block",
                }}
              >
                {featuredPost.category}
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "2.4rem",
                  fontWeight: 500,
                  color: "var(--color-black)",
                  lineHeight: 1.2,
                  marginBottom: "20px",
                }}
              >
                {featuredPost.title}
              </h2>
              <p style={{ fontSize: "1rem", color: "var(--color-gray-500)", lineHeight: 1.7, marginBottom: "32px" }}>
                {featuredPost.excerpt}
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "24px", color: "var(--color-gray-400)", fontSize: "0.85rem", marginBottom: "32px" }}>
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
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                Devamını Oku <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </Link>

        {/* ── DİĞER YAZILAR GRID ── */}
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2rem",
            fontWeight: 500,
            color: "var(--color-black)",
            marginBottom: "32px",
          }}
        >
          Son Yazılar
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }} className="blog-grid">
          {regularPosts.map((post) => (
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
                <div style={{ height: "220px", background: post.imageUrl }} />
                
                {/* İçerik */}
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--color-green)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {post.category}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)" }}>
                      {post.readTime}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.3rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                      lineHeight: 1.3,
                      marginBottom: "12px",
                    }}
                  >
                    {post.title}
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", lineHeight: 1.6, marginBottom: "24px", flex: 1 }}>
                    {post.excerpt}
                  </p>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--color-border)", paddingTop: "16px", marginTop: "auto" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <User size={12} /> {post.author}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)" }}>
                      {post.date}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
          .featured-post-card > div:first-child {
            min-height: 250px !important;
          }
        }
      `}</style>
    </div>
  );
}
