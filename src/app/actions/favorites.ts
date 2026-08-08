"use server";

import { auth } from "@/lib/auth";
import { limitByIp } from "@/lib/rate-limit";
import {
  mergeFavorites,
  readFavorites,
  removeFavoriteFor,
  sanitizeProductIds,
  toggleFavoriteFor,
  type FavoriteItem,
} from "@/lib/favorites";

/**
 * Favori eylemleri.
 *
 * Üye girişi varsa favoriler VERİTABANINDA tutulur; cihaz değişse de kalır.
 * Misafirde tarayıcıda (localStorage) tutulmaya devam eder — favori eklemek
 * için üyelik zorunlu değildir.
 *
 * Oturum bilgisi İSTEMCİDEN ALINMAZ: her eylem `auth()` ile sunucuda
 * doğrulanır. Veri kuralları `@/lib/favorites` içindedir.
 */

export type SyncResult = { loggedIn: true; items: FavoriteItem[] } | { loggedIn: false };

/**
 * Açılışta çağrılır. Üye girişi varsa tarayıcıdaki favoriler hesaba taşınır
 * ve hesabın tam listesi döner; misafirse `loggedIn: false` döner.
 */
export async function syncFavorites(localProductIds: unknown): Promise<SyncResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { loggedIn: false };

  await mergeFavorites(userId, sanitizeProductIds(localProductIds));

  return { loggedIn: true, items: await readFavorites(userId) };
}

export type ToggleResult = { loggedIn: true; favorited: boolean } | { loggedIn: false };

/** Favoriye ekler/çıkarır. Misafirde bir şey yapmaz; istemci yereli kullanır. */
export async function toggleFavorite(productId: unknown): Promise<ToggleResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { loggedIn: false };

  const limit = await limitByIp("toggle-favorite", 120, 60_000);
  if (!limit.ok) return { loggedIn: false };

  const [id] = sanitizeProductIds([productId]);
  if (!id) return { loggedIn: true, favorited: false };

  return { loggedIn: true, favorited: await toggleFavoriteFor(userId, id) };
}

/** Favoriden çıkarır (favoriler sayfasındaki çöp kutusu). */
export async function removeFavorite(productId: unknown): Promise<{ loggedIn: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { loggedIn: false };

  const [id] = sanitizeProductIds([productId]);
  if (id) await removeFavoriteFor(userId, id);

  return { loggedIn: true };
}
