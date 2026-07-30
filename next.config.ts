import type { NextConfig } from "next";

/**
 * Güvenlik başlıkları.
 *
 * CSP burada bilinçli olarak tanımlanmadı: Stripe iframe'i, Google Fonts ve
 * Next.js'in inline script'leri için doğru bir CSP yazmak dikkatli test
 * gerektirir; hatalı bir CSP ödeme formunu tamamen bozar. Diğer başlıklar
 * (clickjacking, MIME sniffing, referrer sızıntısı) uygulandı.
 */
const securityHeaders = [
  // Sayfanın başka sitede iframe'e alınmasını engeller (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Tarayıcının içerik türünü tahmin etmesini engeller.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Dış sitelere tam URL (ör. sipariş token'ı) sızmasın.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // İhtiyaç duyulmayan tarayıcı özelliklerini kapat.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Sipariş ve hesap sayfaları hiçbir katmanda önbelleğe alınmamalı.
        source: "/(siparis|hesabim|checkout)/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          ...securityHeaders,
        ],
      },
    ];
  },

  images: {
    // Yüklenen ürün görselleri yerel `public/uploads` altında saklanır.
    // Dışarıdan görsel kullanılacaksa buraya alan adı eklenmelidir.
    remotePatterns: [],
  },
};

export default nextConfig;
