import type { ReactNode } from 'react'
import { useAuthSession, useKorumaliRota } from '../AuthSessionProvider'

export interface KorumaliSayfaProps {
  children: ReactNode
}

/**
 * Oturum gerektiren sayfaların ortak koruma kabuğu.
 *
 * Yalnız `kimlikli` durumunda içeriği çizer. Diğer iki durum da `null`
 * döner ama sebepleri farklıdır:
 *
 * - `bilinmiyor` — sunucuda ve hidrasyon eşleştirmesi yapılan ilk istemci
 *   render'ında geçerli olan durum. İkisi de `null` ürettiği için hidrasyon
 *   uyuşur. (Eskiden bunu ayrı bir `hidrasyonTamam` state'i sağlıyordu;
 *   `OturumCozumu` üçlü durumu o bayrağı gereksiz kıldı.)
 * - `anonim` — `useKorumaliRota` yönlendirmeyi zaten tetikledi; bu arada
 *   korumalı içerik bir kare bile görünmemeli.
 *
 * `useKorumaliRota` burada, TEK yerde çağrılır — sayfalar kendi kopyasını
 * yazmaz. Rota seviyesindeki `beforeLoad` guard'ı (`korumaliRotaGuard`) bunun
 * tamamlayıcısıdır: o render'dan önce, bu hidrasyondan sonra korur.
 */
export function KorumaliSayfa({ children }: KorumaliSayfaProps) {
  useKorumaliRota()
  const { cozum } = useAuthSession()

  if (cozum.durum !== 'kimlikli') return null

  return <>{children}</>
}
