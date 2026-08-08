import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Favoriler (istek listesi).
 *
 * Üye girişi varsa liste sunucudan gelir ve hesaba bağlıdır (cihaz değişse de
 * kalır); misafirde yalnızca tarayıcıda (localStorage) tutulur. Hangi kaynağın
 * geçerli olduğunu `source` alanı söyler.
 *
 * Burada saklanan fiyat/görsel yalnızca ÖNİZLEME amaçlıdır; sepete eklerken
 * veya satın alırken kullanılmaz — kullanıcı ürün sayfasına gidip (varsa
 * varyant seçip) sepete ekler, böylece fiyat/stok her zaman güncel olur.
 */

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  priceIsRange: boolean;
  imageUrl: string;
  volume: number | null;
  addedAt: number;
};

type WishlistState = {
  items: WishlistItem[];
  /**
   * Listenin kaynağı. "server" → hesaba bağlı; "local" → yalnızca bu tarayıcı.
   * Çıkış yapıldığında sunucudan gelmiş listenin temizlenmesi için gerekir:
   * ortak kullanılan bir cihazda bir sonraki kişi öncekinin favorilerini
   * görmemelidir.
   */
  source: "local" | "server";
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (productId: string) => void;
  /** Sunucudan gelen listeyi yerine koyar. */
  setServerItems: (items: WishlistItem[]) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      source: "local",
      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, { ...item, addedAt: Date.now() }],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setServerItems: (items) => set({ items, source: "server" }),
      clear: () => set({ items: [], source: "local" }),
    }),
    {
      name: "kutuklu-wishlist-storage",
    }
  )
);
