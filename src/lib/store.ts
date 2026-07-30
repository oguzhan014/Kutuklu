import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string; // product id + variant/volume ayırıcı
  productId: string;
  /** Varyasyonlu üründe seçilen varyant. Basit üründe null/undefined. */
  variantId?: string | null;
  /** Görüntüleme amaçlı, ör. "1000ml / Cam Şişe". */
  variantLabel?: string | null;
  name: string;
  price: number;
  quantity: number;
  volume: number;
  imageUrl: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setIsOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
  clearCart: () => void;
};

/**
 * Sepet satırı kimliği.
 *
 * Basit ürünlerde her hacim ayrı bir Product kaydıdır (farklı productId),
 * bu yüzden `volume` tarihsel bir ek ayırıcıdır. Varyasyonlu ürünlerde tek
 * bir productId altında birden çok varyant bulunur; bu durumda ayırıcı
 * MUTLAKA variantId olmalıdır, aksi hâlde farklı varyantlar sepette aynı
 * satırda birleşir.
 */
function cartItemId(item: { productId: string; variantId?: string | null; volume: number }): string {
  return item.variantId ? `${item.productId}-${item.variantId}` : `${item.productId}-${item.volume}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const id = cartItemId(item);
          const existingItem = state.items.find((i) => i.id === id);

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
              isOpen: true, // Sepete ekleyince otomatik aç
            };
          }

          return {
            items: [...state.items, { ...item, id }],
            isOpen: true,
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      setIsOpen: (isOpen) => set({ isOpen }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "kutuklu-cart-storage",
    }
  )
);
