import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/** Yasal / bilgilendirme sayfaları (KVKK, iade, kargo vb.) için ortak düzen. */
export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-gray-100)", minHeight: "70vh", padding: "56px 0 72px" }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          <div
            style={{
              background: "var(--color-white)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "48px",
            }}
            className="legal-card"
          >
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "2.2rem",
                fontWeight: 600,
                color: "var(--color-black)",
                marginBottom: updatedAt ? "8px" : "28px",
              }}
            >
              {title}
            </h1>

            {updatedAt && (
              <p style={{ fontSize: "0.82rem", color: "var(--color-gray-500)", marginBottom: "28px" }}>
                Son güncelleme: {updatedAt}
              </p>
            )}

            <div className="legal-content">{children}</div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        .legal-content h2 {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--color-black);
          margin: 32px 0 12px;
        }
        .legal-content h2:first-child { margin-top: 0; }
        .legal-content p {
          font-size: 0.92rem;
          color: var(--color-gray-700);
          line-height: 1.8;
          margin-bottom: 14px;
        }
        .legal-content ul {
          margin: 0 0 14px;
          padding-left: 22px;
          color: var(--color-gray-700);
          font-size: 0.92rem;
          line-height: 1.8;
        }
        .legal-content li { margin-bottom: 6px; }
        .legal-content strong { color: var(--color-black); }
        .legal-content a { color: var(--color-green); font-weight: 600; }
        @media (max-width: 640px) {
          .legal-card { padding: 28px 20px !important; }
        }
      `}</style>
    </>
  );
}
