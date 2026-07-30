import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Favoriler (istek listesi).
 *
 * Sepet gibi yalnızca tarayıcıda (localStorage) tutulur, üyelik gerektirmez.
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
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
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
      clear: () => set({ items: [] }),
    }),
    {
      name: "kutuklu-wishlist-storage",
    }
  )
);
