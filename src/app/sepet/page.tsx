import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartPageContent } from "@/components/cart/CartPageContent";

export const metadata: Metadata = {
  title: "Sepetim",
  description: "Kütüklü Zeytinyağı sepetiniz.",
  robots: { index: false, follow: true },
};

export default function SepetPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-gray-100)", minHeight: "70vh", padding: "40px 0 64px" }}>
        <div className="container">
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              fontWeight: 600,
              color: "var(--color-black)",
              marginBottom: "28px",
            }}
          >
            Sepetim
          </h1>

          <CartPageContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
