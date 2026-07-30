/**
 * Para birimi yardımcıları.
 *
 * Kural: Tüm hesaplamalar TAM SAYI KURUŞ üzerinden yapılır.
 * Ondalıklı float aritmetiği (0.1 + 0.2 !== 0.3) sipariş toplamlarında
 * kuruş kaymalarına ve Stripe tutarı ile DB tutarının uyuşmamasına yol açar.
 */

/** Prisma Decimal / string / number değerini tam sayı kuruşa çevirir. */
export function toKurus(value: unknown): number {
  if (value === null || value === undefined) return 0;

  // Prisma Decimal nesnesi de dahil olmak üzere her şeyi string üzerinden okuruz.
  const asNumber =
    typeof value === "number" ? value : Number(String(value));

  if (!Number.isFinite(asNumber)) {
    throw new Error(`Geçersiz para değeri: ${String(value)}`);
  }

  return Math.round(asNumber * 100);
}

/** Kuruşu, Prisma Decimal(10,2) alanına yazılabilecek string'e çevirir. */
export function kurusToDecimalString(kurus: number): string {
  if (!Number.isInteger(kurus)) {
    throw new Error(`Kuruş tam sayı olmalı: ${kurus}`);
  }
  const negative = kurus < 0;
  const abs = Math.abs(kurus);
  const lira = Math.floor(abs / 100);
  const cents = abs % 100;
  return `${negative ? "-" : ""}${lira}.${String(cents).padStart(2, "0")}`;
}

/** Kuruşu görüntüleme için TL sayısına çevirir. */
export function kurusToNumber(kurus: number): number {
  return kurus / 100;
}
