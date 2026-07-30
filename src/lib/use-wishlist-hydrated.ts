"use client";

import { useWishlistStore } from "@/lib/wishlist-store";
import { useStoreHydrated } from "@/lib/use-store-hydrated";

/** Favori listesinin localStorage'dan yüklenip yüklenmediğini döner. */
export function useWishlistHydrated(): boolean {
  return useStoreHydrated(useWishlistStore.persist);
}
