/**
 * Ürün varyantı yardımcıları.
 *
 * `server-only` DEĞİLDİR — hem sunucu tarafı fiyatlandırmada (pricing.ts)
 * hem de istemci tarafı varyant seçicisinde (UrunDetayContent) kullanılır.
 * Saf string/veri dönüşümleri içerir, hiçbir gizli bilgiye erişmez.
 */

export type VariantAttributes = Record<string, string>;

/** Varyant özelliklerini (Json) güvenli biçimde `Record<string,string>` olarak okur. */
export function parseVariantAttributes(value: unknown): VariantAttributes {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const result: VariantAttributes = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string" && raw.trim() !== "") {
      result[key] = raw;
    }
  }
  return result;
}

/** Varyant özelliklerini "1000ml / Cam Şişe" gibi okunabilir bir etikete çevirir. */
export function formatVariantLabel(value: unknown): string {
  const attributes = parseVariantAttributes(value);
  return Object.values(attributes).join(" / ");
}

/**
 * Varyasyonlu bir ürün için gösterilecek fiyat aralığını ve toplam stoğu
 * hesaplar. Varyasyonlu üründe Product satırındaki `price`/`stock` her
 * zaman 0'dır (gerçek değerler varyantlardadır); bu yüzden listeleme
 * ekranlarında "0,00 TL" gösterilmemesi için bu hesap kullanılır.
 */
export function getVariantPriceRange(
  variants: { price: number; stock: number }[]
): { minPrice: number; totalStock: number } {
  if (variants.length === 0) return { minPrice: 0, totalStock: 0 };

  return {
    minPrice: Math.min(...variants.map((v) => v.price)),
    totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
  };
}
