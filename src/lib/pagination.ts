/**
 * Sayfalama yardımcıları.
 *
 * Saf mantık: React/Next bağımlılığı yoktur, böylece hem sunucu bileşenlerinde
 * hem de testlerde doğrudan kullanılabilir.
 */

export const ADMIN_PAGE_SIZE = 20;

/**
 * `?page=` değerini güvenli bir sayfa numarasına çevirir.
 *
 * Kullanıcıdan gelen ham metindir: sayı olmayan, negatif veya son sayfadan
 * büyük değerler sınırlara çekilir. Bu sayede `skip` asla negatif olmaz ve
 * geçersiz girdi boş bir tabloya düşmez.
 */
export function resolvePage(
  raw: string | string[] | undefined,
  totalPages: number
): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "1", 10);

  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, Math.max(1, totalPages));
}

/** Toplam kayıt sayısından sayfa adedini hesaplar (en az 1). */
export function countPages(totalItems: number): number {
  return Math.max(1, Math.ceil(totalItems / ADMIN_PAGE_SIZE));
}
