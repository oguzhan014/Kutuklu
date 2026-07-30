import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
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

        {/* 2. Özellikler: Erken Hasat, Soğuk Sıkım, Doğal Üretim */}
        <FeaturesSection />

        {/* 3. Öne Çıkan Ürünler */}
        <FeaturedProductsSection />

        {/* 4. Neden Kütüklü (Detaylı) */}
        <WhyKutukluSection />

        {/* 5. Bizim Hikayemiz */}
        <StorySection />

        {/* 6. Müşteri Yorumları */}
        <ReviewsSection />

        {/* 7. E-Bülten & Instagram */}
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
