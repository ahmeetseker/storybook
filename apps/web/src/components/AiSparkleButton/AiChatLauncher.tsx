// AI sohbet başlatıcısı — kıvılcım butonu + GlassChatDock.
//
// Kapalıyken sağ altta yalnız kıvılcım küresi durur; tıklayınca patlama
// animasyonunun tepe anında sohbet paneli açılır (dock'un kendi kapsül
// launcher'ı hiç çizilmez — başlatıcı bizim küre). Kapanınca odak küreye
// geri döner (dock'un launcher-odak sözleşmesinin buradaki karşılığı).
//
// Yanıtlar şimdilik TASLAK: niyet yönlendirme + kural tabanlı üretim
// `ai-dock-engine.ts`'te yaşar (ilan arama kartları, harcama grafiği, favori
// indirimleri, randevu sorgulama/oluşturma, endeks ve yatırım yorumu…).
// Bekleyen mesaj, niyete uygun thinking-orbs durumu + etiketle nefes alır.
// Gerçek AI akışı bağlanınca yalnız motor değişir.
import { useRef, useState } from 'react'
import { GlassChatDock, type GlassChatDockMessage } from '@repo/ui'
import { AiSparkleButton } from './AiSparkleButton'
import { dockYanit } from './ai-dock-engine'
import { AiDockIcerik } from './AiDockIcerik'

// Eski dışa aktarım korunur — testler ve olası tüketiciler için.
export { taslakYanit } from './ai-dock-engine'

const KARSILAMA: GlassChatDockMessage = {
  id: 'ai-karsilama',
  role: 'ai',
  text:
    'Merhaba! Ben arsam.net AI danışmanı. İlan arayabilir, favori ve randevularınıza bakabilir, harcama ve endeks yorumu çıkarabilirim — ne yapalım?',
}

export function AiChatLauncher() {
  const [acik, setAcik] = useState(false)
  const [mesajlar, setMesajlar] = useState<GlassChatDockMessage[]>([KARSILAMA])
  const fabRef = useRef<HTMLButtonElement>(null)
  const sayacRef = useRef(0)

  const gonder = (text: string) => {
    const n = ++sayacRef.current
    const yanit = dockYanit(text)
    setMesajlar((prev) => [
      ...prev,
      { id: `kullanici-${n}`, role: 'user', text },
      {
        id: `ai-${n}`,
        role: 'ai',
        text: '',
        pending: true,
        pendingLabel: yanit.durum.etiket,
        pendingState: yanit.durum.durum,
      },
    ])
    // Durum göstergesi kısa bir nefes alır — anında beliren yanıt sahte
    // hissettirir; gerçek akışta bu bekleme ağdan gelecek.
    window.setTimeout(() => {
      setMesajlar((prev) =>
        prev.map((m) =>
          m.id === `ai-${n}`
            ? {
                id: m.id,
                role: 'ai' as const,
                text: yanit.metin,
                content:
                  yanit.zengin || yanit.baglanti ? (
                    <AiDockIcerik zengin={yanit.zengin} baglanti={yanit.baglanti} />
                  ) : undefined,
              }
            : m,
        ),
      )
    }, yanit.gecikmeMs)
  }

  return (
    <>
      {!acik ? <AiSparkleButton buttonRef={fabRef} onActivate={() => setAcik(true)} /> : null}
      {acik ? (
        <GlassChatDock
          open
          onOpenChange={(sonraki) => {
            if (sonraki) return
            setAcik(false)
            // Dock'un kendi launcher'ı yok — odak, görünür başlatıcıya (küre) döner
            requestAnimationFrame(() => fabRef.current?.focus())
          }}
          messages={mesajlar}
          onSend={gonder}
          title="AI danışman"
          placeholder="Arsa arayışınızı anlatın…"
          placeholders={[
            'Arsa arayışınızı anlatın…',
            'Urla’da denize yakın imarlı parsel…',
            'Bütçenize uygun bölge önerisi isteyin…',
            'Bir parselin imar durumunu sorun…',
            'Ofislerle görüşme randevusu planlayın…',
          ]}
          disclaimer="Yanıtlar yapay zekâ üretimidir, bağlayıcı değildir."
        />
      ) : null}
    </>
  )
}
