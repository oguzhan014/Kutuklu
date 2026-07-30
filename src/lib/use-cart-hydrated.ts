"use client";

import { useCartStore } from "@/lib/store";
import { useStoreHydrated } from "@/lib/use-store-hydrated";

/** Sepetin localStorage'dan yüklenip yüklenmediğini döner. */
export function useCartHydrated(): boolean {
  return useStoreHydrated(useCartStore.persist);
}
