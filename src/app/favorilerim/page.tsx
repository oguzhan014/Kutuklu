import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WishlistContent } from "@/components/wishlist/WishlistContent";

export const metadata: Metadata = {
  title: "Favorilerim",
  description: "Kütüklü Zeytinyağı favori ürünleriniz.",
  robots: { index: false, follow: true },
};

export default function FavorilerimPage() {
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
            Favorilerim
          </h1>

          <WishlistContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
