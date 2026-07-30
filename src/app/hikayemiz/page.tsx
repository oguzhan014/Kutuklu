import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HikayemizHero } from "@/components/hikayemiz/HikayemizHero";
import { KutukludenSofraya } from "@/components/hikayemiz/KutukludenSofraya";
import { YolculugumuzTimeline } from "@/components/hikayemiz/YolculugumuzTimeline";
import { Degerlerimiz } from "@/components/hikayemiz/Degerlerimiz";
import { UretimSureci } from "@/components/hikayemiz/UretimSureci";
import { Sertifikalarimiz } from "@/components/hikayemiz/Sertifikalarimiz";
import { KoyuZiyaretEt } from "@/components/hikayemiz/KoyuZiyaretEt";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hikayemiz",
  description:
    "Kütüklü Zeytinyağı'nın köklü hikayesi — 1950'den bugüne nesiller boyu süren aile geleneği, Kütüklü Köyü'nden sofranıza uzanan yolculuk.",
};

export default function HikayemizPage() {
  return (
    <>
      <Navbar />
      <main>
        <HikayemizHero />
        <KutukludenSofraya />
        <YolculugumuzTimeline />
        <Degerlerimiz />
        <UretimSureci />
        <Sertifikalarimiz />
        <KoyuZiyaretEt />
      </main>
      <Footer />
    </>
  );
}
