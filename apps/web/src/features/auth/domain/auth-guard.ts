import { redirect } from '@tanstack/react-router'
import { guvenliDonusYolu } from './auth-session'
import type { OturumCozumu } from './auth-types'

/**
 * Korumalı rotaların `beforeLoad`'unda çağrılır. Oturum KESİN olarak yoksa
 * `/giris`'e yönlendirir ve geldiği yolu `donus` parametresinde taşır.
 *
 * Üç durumun ikisinde bilinçli olarak hiçbir şey yapmaz:
 *
 * - `kimlikli` — geçiş serbest.
 * - `bilinmiyor` — HENÜZ cevaplanamadı (sunucuda render, oturum
 *   `sessionStorage`'da). Burada yönlendirmek oturumu OLAN kullanıcıyı da
 *   dışarı atardı. Render sürer, istemci tarafındaki `useKorumaliRota`
 *   hidrasyondan sonra kesin cevabı alıp gerekiyorsa yönlendirir.
 *
 * İP-5'te oturum imzalı cookie'den sunucuda çözülünce `bilinmiyor` yalnız
 * statik prerender'da kalacak; SSR yolunda bu fonksiyon gerçek bir 302
 * üretecek — bugünkü "200 + istemci sekmesi" davranışının yerine.
 *
 * `guvenliDonusYolu` burada da uygulanır: `donus` hedefi tek bir yerden
 * üretilmemeli, her giriş noktası kendi sanitizasyonunu yapmalı.
 */
export function korumaliRotaGuard(oturum: OturumCozumu, tamYol: string): void {
  if (oturum.durum !== 'anonim') return
  throw redirect({
    to: '/giris',
    search: { donus: guvenliDonusYolu(tamYol) },
  })
}
