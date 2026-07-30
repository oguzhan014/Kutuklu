import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IletisimContent } from "@/components/iletisim/IletisimContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim | Kütüklü",
  description:
    "Kütüklü Zeytinyağı ile iletişime geçin. Soru, görüş ve toptan sipariş talepleriniz için bize ulaşabilirsiniz.",
};

export default function IletisimPage() {
  return (
    <>
      <Navbar />
      <main>
        <IletisimContent />
      </main>
      <Footer />
    </>
  );
}
