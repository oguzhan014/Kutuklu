"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWishlistStore, type WishlistItem } from "@/lib/wishlist-store";
import { useWishlistHydrated } from "@/lib/use-wishlist-hydrated";
import {
  syncFavorites,
  toggleFavorite,
  removeFavorite,
} from "@/app/actions/favorites";

/**
 * Favori listesi kancası.
 *
 * Bileşenler oturum durumunu bilmek zorunda değildir: eylem sunucuda `auth()`
 * ile kimliği doğrular, misafirse "loggedIn: false" döner ve yerel liste
 * kullanılmaya devam eder.
 *
 * Arayüz iyimser (optimistic) güncellenir: kalp anında dolar, sunucu isteği
 * arkada gider. Ağ hatasında bir sonraki senkronizasyon durumu düzeltir.
 */

let syncPromise: Promise<void> | null = null;

/**
 * Açılışta bir kez çalışır: yereldeki favorileri hesaba taşır ve hesabın
 * listesini çeker. Aynı sekmede birden çok bileşen kullansa bile istek tek
 * kez gider.
 */
export function useWishlistSync() {
  const hydrated = useWishlistHydrated();
  const started = useRef(false);

  useEffect(() => {
    // localStorage okunmadan senkronize edilirse yereldeki favoriler
    // sunucuya hiç taşınmadan kaybolurdu.
    if (!hydrated || started.current) return;
    started.current = true;

    const store = useWishlistStore.getState();
    const localIds = store.items.map((item) => item.productId);

    syncPromise ??= syncFavorites(localIds)
      .then((result) => {
        const current = useWishlistStore.getState();

        if (result.loggedIn) {
          current.setServerItems(result.items);
          return;
        }

        // Misafir görünüyoruz ama elimizdeki liste bir hesaptan gelmişti:
        // kullanıcı çıkış yapmış. Ortak cihazda başkasının favorileri
        // görünmesin diye temizlenir.
        if (current.source === "server") current.clear();
      })
      .catch((error) => {
        // Senkronizasyon başarısızsa yerel liste korunur; kullanıcı favori
        // eklemeye devam edebilir.
        console.error("[favoriler] senkronize edilemedi:", error);
      });
  }, [hydrated]);
}

export function useWishlist() {
  const items = useWishlistStore((state) => state.items);
  const toggleLocal = useWishlistStore((state) => state.toggleItem);
  const removeLocal = useWishlistStore((state) => state.removeItem);
  const hydrated = useWishlistHydrated();

  const toggle = useCallback(
    (item: Omit<WishlistItem, "addedAt">) => {
      toggleLocal(item);

      void toggleFavorite(item.productId).catch((error) =>
        console.error("[favoriler] kaydedilemedi:", error)
      );
    },
    [toggleLocal]
  );

  const remove = useCallback(
    (productId: string) => {
      removeLocal(productId);

      void removeFavorite(productId).catch((error) =>
        console.error("[favoriler] kaldırılamadı:", error)
      );
    },
    [removeLocal]
  );

  const isFavorited = useCallback(
    (productId: string) => hydrated && items.some((item) => item.productId === productId),
    [hydrated, items]
  );

  return { items, hydrated, toggle, remove, isFavorited };
}
