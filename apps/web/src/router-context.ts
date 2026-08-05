import type { QueryClient } from '@tanstack/react-query'
import type { AuthAdapters } from '@/features/auth/data/auth-adapters'
import type { OturumCozumu } from '@/features/auth/domain/auth-types'

export interface RouterContext {
  queryClient: QueryClient
  /**
   * Adapter portu context'te taşınır. İki sebep:
   *
   * 1. `__root`'un `beforeLoad`'u oturumu buradan çözer — render'dan ÖNCE,
   *    yani guard'ların `throw redirect` atabildiği tek yerde.
   * 2. Testler ve İP-5'teki gerçek HTTP adapter'ı tek satırla değiştirilebilir.
   */
  adapters: AuthAdapters
  /**
   * `__root`'un `beforeLoad`'u tarafından doldurulur; korumalı rotaların
   * `beforeLoad`'ları bunu okur. `createRouter` çağrısındaki başlangıç değeri
   * `bilinmiyor`'dur — ilk `beforeLoad` koşana kadar geçerli olan tek dürüst
   * cevap budur.
   */
  oturum: OturumCozumu
}
