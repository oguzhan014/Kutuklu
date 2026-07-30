"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store";

/**
 * Sipariş başarıyla oluşturulduğunda sepeti boşaltır.
 *
 * Sepet, ödeme adımı tamamlanana kadar korunur: kart ödemesi yarıda kalırsa
 * kullanıcı sepetini kaybetmeden geri dönebilsin.
 */
export function ClearCartOnMount() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
