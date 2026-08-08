"use client";

import { useWishlistSync } from "@/lib/use-wishlist";

/**
 * Favorileri hesapla eşitleyen görünmez bileşen.
 *
 * Kök düzende (layout) bir kez bağlanır; her sayfa açılışında çalışıp
 * tarayıcıdaki favorileri hesaba taşır ve hesabın güncel listesini çeker.
 */
export function FavoritesSync() {
  useWishlistSync();
  return null;
}
