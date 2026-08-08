import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy.
 *
 * Amaç: XSS'in en tehlikeli aşamasını — saldırganın DIŞARIDAN kod yükleyip
 * veri sızdırmasını — engellemek.
 *
 * KABUL EDİLEN SINIR: `'unsafe-inline'`. Bu arayüz baştan sona satır içi
 * `style={{…}}` ile yazılmıştır; style ÖZNİTELİKLERİ nonce ile korunamaz,
 * yalnızca `'unsafe-inline'` ile çalışır. Script tarafında da Next.js'in
 * hidrasyon betikleri satır içidir ve nonce kullanmak middleware değişikliği
 * gerektirir. Bu yüzden politika "satır içine izin ver, ama DIŞ kaynakları
 * kilitle" şeklinde kurgulanmıştır: saldırgan sayfaya script enjekte etse
 * bile kendi sunucusuna veri gönderemez (`connect-src 'self'`), harici script
 * yükleyemez, sayfayı başka siteye gömemez.
 *
 * ÖDEME: `frame-src` PayTR'ye açıktır. 3D Secure banka sayfaları PayTR'nin
 * kendi iframe'i İÇİNDE açıldığı için bizim politikamıza tabi değildir —
 * onları burada listelemeye gerek yoktur.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // Google Fonts stil dosyası + satır içi stiller (yukarıdaki nota bakınız).
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Font dosyalarının kendisi gstatic'ten gelir.
  "font-src 'self' https://fonts.gstatic.com data:",
  // Dev sunucusunda React Refresh 'unsafe-eval' ister; üretimde verilmez.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Ürün görselleri yerel; data:/blob: önizlemeler için.
  "img-src 'self' data: blob:",
  // Veri yalnızca kendi sunucumuza gidebilir (dev'de HMR websocket'i hariç).
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  // PayTR güvenli ödeme formu.
  "frame-src 'self' https://www.paytr.com",
  // Formlar yalnızca kendi sunucumuza gönderilebilir.
  "form-action 'self'",
  // Sayfamız yalnızca kendi sitemizde iframe'e alınabilir (clickjacking).
  "frame-ancestors 'self'",
  // Eklenti/nesne gömülmesi tamamen kapalı.
  "object-src 'none'",
  // <base> etiketiyle göreli yolların kaçırılmasını engelle.
  "base-uri 'self'",
  // Karışık içerik (http) otomatik https'e yükseltilsin.
  "upgrade-insecure-requests",
].join("; ");

/**
 * Güvenlik başlıkları.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Sayfanın başka sitede iframe'e alınmasını engeller (clickjacking).
  // CSP'deki frame-ancestors modern tarayıcılarda bunun yerini alır; eski
  // tarayıcılar için korunur.
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
  // pdfkit, font metriklerini (.afm) çalışma anında kendi klasöründen okur.
  // Bundle'a dahil edilirse bu yol bozulur ve fatura üretimi
  // "ENOENT: Helvetica.afm" ile başarısız olur. Harici bırakılarak
  // node_modules'tan normal şekilde çözülmesi sağlanır.
  serverExternalPackages: ["pdfkit"],

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
