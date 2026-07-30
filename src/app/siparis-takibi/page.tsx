import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OrderLookupForm } from "@/components/siparis/OrderLookupForm";

export const metadata: Metadata = {
  title: "Sipariş Takibi",
  description: "Sipariş numaranız ve e-posta adresinizle siparişinizi sorgulayın.",
};

export default function SiparisTakibiPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-gray-100)", minHeight: "70vh", padding: "56px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "2.2rem",
                fontWeight: 600,
                color: "var(--color-black)",
                marginBottom: "12px",
              }}
            >
              Sipariş Takibi
            </h1>
            <p style={{ color: "var(--color-gray-600)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              Sipariş numaranızı ve sipariş sırasında kullandığınız e-posta adresini girerek
              siparişinizin durumunu görüntüleyebilirsiniz.
            </p>
          </div>

          <OrderLookupForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
