import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { MarqueeTicker } from "@/components/home/MarqueeTicker";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { OilFinderSection } from "@/components/home/OilFinderSection";
import { HarvestCycleSection } from "@/components/home/HarvestCycleSection";
import { LabTransparencySection } from "@/components/home/LabTransparencySection";
import { RecipePairingsSection } from "@/components/home/RecipePairingsSection";
import { BundleShowcaseSection } from "@/components/home/BundleShowcaseSection";
import { HeritageStorySection } from "@/components/home/HeritageStorySection";
import { LiveMomentsSection } from "@/components/home/LiveMomentsSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { FaqSection } from "@/components/home/FaqSection";
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

        {/* 2. Sonsuz Kayan Lüks Ticker Bandı */}
        <MarqueeTicker />

        {/* 3. Temel Değerler (Erken Hasat, Soğuk Sıkım, Doğal Üretim) */}
        <FeaturesSection />

        {/* 4. Öne Çıkan Ürünler (İnteraktif Kartlar & Quick Actions) */}
        <FeaturedProductsSection />

        {/* 5. Damak Tadınıza Uygun Yağı Seçin (İnteraktif Yağ Bulucu) */}
        <OilFinderSection />

        {/* 6. Kütüklü'de Bir Gün: Hasattan Sofraya 24 Saat (İnteraktif Süreç Döngüsü) */}
        <HarvestCycleSection />

        {/* 7. Laboratuvar & Şeffaflık Kartı (Asitlik, Polifenol, Peroksit Değerleri) */}
        <LabTransparencySection />

        {/* 8. Şefin Sofrasından: Zeytinyağlı Lezzet Eşleşmeleri & Tarifler */}
        <RecipePairingsSection />

        {/* 9. Çoklu Avantaj Paketleri & Hediye Kutuları (Bundle Showcase) */}
        <BundleShowcaseSection />

        {/* 10. Kütüklü Aile Mirası & Kurucunun Taahhüdü */}
        <HeritageStorySection />

        {/* 11. Kütüklü'den Canlı Kareler (Dikey Video & Reels Akışı) */}
        <LiveMomentsSection />

        {/* 12. Müşteri Yorumları */}
        <ReviewsSection />

        {/* 13. Sıkça Sorulan Sorular (Akordeon FAQ) */}
        <FaqSection />

        {/* 14. E-Bülten & Instagram */}
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}



