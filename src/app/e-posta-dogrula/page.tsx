import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { verifyEmailToken } from "@/lib/email-verification";

export const metadata: Metadata = {
  title: "E-posta Doğrulama",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const FAILURE_MESSAGES: Record<string, string> = {
  invalid: "Bu doğrulama bağlantısı geçersiz. Bağlantıyı eksiksiz kopyaladığınızdan emin olun.",
  expired: "Bu doğrulama bağlantısının süresi dolmuş. Hesabınızdan yeni bir bağlantı isteyebilirsiniz.",
  used: "Bu bağlantı daha önce kullanılmış. E-postanız zaten doğrulanmış olabilir.",
  email_changed:
    "Bu bağlantı gönderildikten sonra e-posta adresiniz değişmiş. Lütfen yeni bir doğrulama bağlantısı isteyin.",
};

export default async function EmailVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyEmailToken(token ?? "");

  const success = result.ok;
  const message = success
    ? result.alreadyVerified
      ? "E-posta adresiniz zaten doğrulanmıştı. Alışverişe devam edebilirsiniz."
      : "E-posta adresiniz başarıyla doğrulandı. Sipariş onaylarınız ve faturalarınız bu adrese gönderilecek."
    : FAILURE_MESSAGES[result.reason] ?? FAILURE_MESSAGES.invalid!;

  return (
    <>
      <Navbar />

      <main
        style={{
          background: "var(--color-gray-100)",
          minHeight: "70vh",
          padding: "64px 0",
        }}
      >
        <div className="container" style={{ maxWidth: "560px" }}>
          <div
            style={{
              background: "var(--color-white)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              {success ? (
                <CheckCircle2 size={60} color="var(--color-green)" strokeWidth={1.5} />
              ) : (
                <XCircle size={60} color="#DC2626" strokeWidth={1.5} />
              )}
            </div>

            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.7rem",
                fontWeight: 600,
                color: "var(--color-black)",
                marginBottom: "12px",
              }}
            >
              {success ? "E-postanız Doğrulandı" : "Doğrulama Başarısız"}
            </h1>

            <p
              style={{
                color: "var(--color-gray-600)",
                lineHeight: 1.75,
                marginBottom: "28px",
                fontSize: "0.95rem",
              }}
            >
              {message}
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/urunler"
                style={{
                  background: "var(--color-green)",
                  color: "white",
                  padding: "12px 28px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Alışverişe Devam Et
              </Link>
              <Link
                href="/hesabim"
                style={{
                  background: "var(--color-white)",
                  color: "var(--color-black)",
                  border: "1px solid var(--color-border)",
                  padding: "12px 28px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Hesabım
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
