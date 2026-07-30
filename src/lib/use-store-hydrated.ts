"use client";

import { useSyncExternalStore } from "react";

/**
 * `zustand/persist` ile localStorage'a bağlı bir store'un hidrasyonunun
 * tamamlanıp tamamlanmadığını döner.
 *
 * Sunucuda böyle bir depo olmadığı için ilk render'da store daima boştur;
 * istemci hidrasyonundan sonra dolar. Bu farkı yönetmeden çizmek hidrasyon
 * uyuşmazlığına yol açar.
 *
 * `useEffect` içinde `setState(true)` yapmak yerine `useSyncExternalStore`
 * kullanılır: değer doğrudan store'un hidrasyon durumundan okunur, ekstra
 * render tetiklenmez.
 */
export function useStoreHydrated(persistApi: {
  onFinishHydration: (callback: () => void) => () => void;
  hasHydrated: () => boolean;
}): boolean {
  return useSyncExternalStore(
    (callback) => persistApi.onFinishHydration(callback),
    () => persistApi.hasHydrated(),
    // Sunucu anlık görüntüsü: her zaman "yüklenmedi".
    () => false
  );
}
