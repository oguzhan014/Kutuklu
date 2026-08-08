import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  // Göreli yolların (OG görseli, canonical) mutlak URL'ye çevrilmesi için
  // gereklidir. Tanımsızsa sosyal medyada paylaşılan bağlantılarda önizleme
  // görseli çıkmaz.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kütüklü Zeytinyağı | Köyden Sofraya, Doğanın Saflığı",
    template: "%s | Kütüklü Zeytinyağı",
  },
  description:
    "Kütüklü Köyü'nden erken hasat, soğuk sıkım natürel sızma zeytinyağı. Nesiller boyu süren aile geleneğiyle üretilen, katkısız ve saf zeytinyağını online sipariş verin.",
  keywords: [
    "zeytinyağı",
    "natürel sızma",
    "erken hasat",
    "soğuk sıkım",
    "organik zeytinyağı",
    "Kütüklü",
    "doğal ürün",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Kütüklü Zeytinyağı",
  },
};

import { CartSidebar } from "@/components/cart/CartSidebar";
import { FavoritesSync } from "@/components/wishlist/FavoritesSync";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        {children}
        <CartSidebar />
        <FavoritesSync />
      </body>
    </html>
  );
}
