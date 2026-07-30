import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Site ayarları. Varsayılanlar burada tanımlıdır; admin panelinden
 * değiştirilen değerler `site_settings` tablosunda saklanır ve üzerine biner.
 *
 * Parasal ayarlar KURUŞ cinsinden tam sayıdır.
 */
export const SETTING_DEFAULTS = {
  "shipping.cost": "4990", // 49,90 TL
  "shipping.freeThreshold": "50000", // 500,00 TL ve üzeri ücretsiz
  "order.maxQuantityPerItem": "20",

  "store.name": "Kütüklü Zeytinyağı Tarım A.Ş.",
  "store.email": "bilgi@kutuklu.com",
  "store.phone": "0850 000 00 00",
  "store.address": "Kütüklü Köyü, Mut / Mersin",
  "store.taxOffice": "Mut VD",
  "store.taxNumber": "0000000000",

  "bank.name": "Ziraat Bankası",
  "bank.accountHolder": "Kütüklü Zeytinyağı Tarım A.Ş.",
  "bank.iban": "TR00 0000 0000 0000 0000 0000 00",

  "payment.cardEnabled": "true",
  "payment.transferEnabled": "true",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = Record<SettingKey, string>;

/**
 * Tüm ayarları okur. Aynı request içinde tekrar çağrılırsa React cache
 * sayesinde tek sorgu atılır.
 */
export const getSettings = cache(async (): Promise<Settings> => {
  const merged: Settings = { ...SETTING_DEFAULTS };

  try {
    const rows = await prisma.siteSetting.findMany();
    for (const row of rows) {
      if (row.key in merged) {
        merged[row.key as SettingKey] = row.value;
      }
    }
  } catch {
    // Ayar tablosu okunamazsa varsayılanlarla devam et — sipariş akışı durmasın.
  }

  return merged;
});

/** Parasal/sayısal bir ayarı güvenli biçimde tam sayı olarak okur. */
export function settingInt(settings: Settings, key: SettingKey): number {
  const parsed = Number.parseInt(settings[key], 10);
  if (Number.isFinite(parsed)) return parsed;
  return Number.parseInt(SETTING_DEFAULTS[key], 10) || 0;
}

export function settingBool(settings: Settings, key: SettingKey): boolean {
  return settings[key] === "true";
}

/** Ayarları toplu günceller (yalnızca tanımlı anahtarlar kabul edilir). */
export async function updateSettings(values: Partial<Record<SettingKey, string>>) {
  const entries = Object.entries(values).filter(
    ([key]) => key in SETTING_DEFAULTS
  ) as [SettingKey, string][];

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );
}
