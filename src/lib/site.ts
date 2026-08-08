/**
 * Sitenin genel adresi.
 *
 * Tek kaynaktan okunur: e-posta bağlantıları, PayTR dönüş adresleri, sitemap
 * ve OG etiketleri hep buradan beslenir. Üretimde `.env` içindeki
 * `NEXT_PUBLIC_SITE_URL` gerçek alan adı olmalıdır; aksi hâlde müşteriye giden
 * bağlantılar `localhost` gösterir.
 *
 * Sondaki eğik çizgi temizlenir; `${SITE_URL}/yol` her zaman tek slash üretir.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

/** Site adresi gerçek bir alan adına ayarlanmış mı? */
export function isSiteUrlConfigured(): boolean {
  return !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(SITE_URL);
}
