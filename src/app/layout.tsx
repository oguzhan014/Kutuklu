import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
      </body>
    </html>
  );
}
