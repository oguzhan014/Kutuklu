import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { MarqueeTicker } from "@/components/home/MarqueeTicker";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { WhyKutukluSection } from "@/components/home/WhyKutukluSection";
import { StorySection } from "@/components/home/StorySection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

// Anasayfa öne çıkan ürünleri ve yorumları veritabanından okur.
// Fiyat/stok değişikliklerinin yansıması için 60 saniyede bir yenilenir.
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero Banner */}
        <HeroSection />

        {/* 2. Sonsuz Kayan Lüks Ticker Bandı (Marquee Bar) */}
        <MarqueeTicker />

        {/* 3. Özellikler: Erken Hasat, Soğuk Sıkım, Doğal Üretim */}
        <FeaturesSection />

        {/* 4. Öne Çıkan Ürünler (İnteraktif Kartlar & Quick Actions) */}
        <FeaturedProductsSection />

        {/* 5. Neden Kütüklü (Detaylı) */}
        <WhyKutukluSection />

        {/* 6. Bizim Hikayemiz */}
        <StorySection />

        {/* 7. Müşteri Yorumları */}
        <ReviewsSection />

        {/* 8. E-Bülten & Instagram */}
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}

