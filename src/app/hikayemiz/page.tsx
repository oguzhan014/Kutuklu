import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HikayemizHero } from "@/components/hikayemiz/HikayemizHero";
import { AileMektubuSection } from "@/components/hikayemiz/AileMektubuSection";
import { YolculugumuzTimeline } from "@/components/hikayemiz/YolculugumuzTimeline";
import { KutukluTerroirSection } from "@/components/hikayemiz/KutukluTerroirSection";
import { UretimSureci } from "@/components/hikayemiz/UretimSureci";
import { Degerlerimiz } from "@/components/hikayemiz/Degerlerimiz";
import { Sertifikalarimiz } from "@/components/hikayemiz/Sertifikalarimiz";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hikayemiz & Aile Mirası | Kütüklü Zeytinyağı",
  description:
    "1950'den bugüne üç nesildir Kütüklü Köyü'nde süregelen gelenek, Kaz Dağları eteğindeki terroir mucizesi ve kurucumuzun aile mektubu.",
};

export default function HikayemizPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero: Miras Girişi & Canlı Metrikler */}
        <HikayemizHero />

        {/* 2. Kurucunun Aile Mektubu (Parşömen Dokusu & Altın Mühür) */}
        <AileMektubuSection />

        {/* 3. Tarihsel Yolculuğumuz (Timeline) */}
        <YolculugumuzTimeline />

        {/* 4. Kütüklü Köyü Terroir & Mikro-İklim İnfografiği */}
        <KutukluTerroirSection />

        {/* 5. Üretim Sürecimiz (Hasattan Şişelemeye) */}
        <UretimSureci />

        {/* 6. Temel Değerlerimiz */}
        <Degerlerimiz />

        {/* 7. Sertifikalarımız ve Analiz Güvenceleri */}
        <Sertifikalarimiz />
      </main>
      <Footer />
    </>
  );
}

