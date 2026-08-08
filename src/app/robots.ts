import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Arama motoru tarama kuralları.
 *
 * Kişiye özel ve işlevsel sayfalar taramaya kapatılır:
 *  - /hesabim, /siparis, /checkout, /sepet → kişisel veri içerir
 *  - /admin → yönetim paneli
 *  - /api → uç noktalar
 *  - /e-posta-dogrula, /sifre-sifirla → tek kullanımlık token taşır
 *
 * Not: Bu dosya erişimi ENGELLEMEZ, yalnızca taramayı yönlendirir. Gerçek
 * koruma sunucu tarafındaki yetkilendirmedir.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/hesabim",
        "/checkout",
        "/sepet",
        "/siparis/",
        "/siparis-takibi",
        "/favorilerim",
        "/e-posta-dogrula",
        "/sifre-sifirla",
        "/sifremi-unuttum",
        "/giris",
        "/kayit",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
