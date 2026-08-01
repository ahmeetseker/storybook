import { useEffect, useState, type ReactNode } from 'react'
import { useAuthSession, useKorumaliRota } from '../AuthSessionProvider'

export interface KorumaliSayfaProps {
  children: ReactNode
}

/**
 * Oturum gerektiren sayfaların ortak koruma kabuğu.
 *
 * Oturum `sessionStorage`'dan okunur — sunucu bunu göremez. `girisYapildi`'e
 * göre doğrudan dallanmak (sunucu: oturumsuz → boş; istemci: hidrasyon
 * ANINDA — `useEffect` henüz çalışmadan, `AuthSessionProvider`'ın
 * `useState(() => adapters.oturumuGetir())` lazy initializer'ı
 * `sessionStorage`'ı senkron okuduğu için — oturumluysa dolu ağaç) React'te
 * "Hydration failed" hatasına yol açar: sunucu ve istemcinin hidrasyon
 * eşleştirmesi yapılan İLK render'ı farklı ağaç üretir, React sunucu
 * ağacını atıp yeniden render eder.
 *
 * Çözüm `AuthFormPage`'in gönder butonunda kullandığı desenle aynı:
 * `hidrasyonTamam` bayrağı sunucuda VE istemcide ilk render'da `false`
 * başlar, yalnız `useEffect` (mount SONRASI, hidrasyon eşleştirmesi
 * bittikten sonra) `true` olur. Bu bayrak `false` olduğu sürece hem
 * sunucu hem istemci AYNI şeyi (`null`) render eder — hidrasyon uyuşur,
 * korumalı içerik hiç yanıp sönmez. Mount sonrası gerçek `girisYapildi`
 * değeriyle sıradan bir istemci re-render'ı (hidrasyon değil) tetiklenir;
 * React bu noktada sunucu çıktısıyla karşılaştırma yapmaz.
 *
 * `useKorumaliRota` da burada, TEK yerde çağrılır — üç sayfa kendi
 * kopyasını çağırıp aynı deseni tekrar etmez.
 */
export function KorumaliSayfa({ children }: KorumaliSayfaProps) {
  useKorumaliRota()
  const { girisYapildi } = useAuthSession()
  const [hidrasyonTamam, setHidrasyonTamam] = useState(false)

  useEffect(() => {
    setHidrasyonTamam(true)
  }, [])

  if (!hidrasyonTamam || !girisYapildi) return null

  return <>{children}</>
}
