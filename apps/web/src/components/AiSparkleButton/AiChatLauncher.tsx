// AI sohbet başlatıcısı — kıvılcım butonu + GlassChatDock.
//
// Kapalıyken sağ altta yalnız kıvılcım küresi durur; tıklayınca patlama
// animasyonunun tepe anında sohbet paneli açılır (dock'un kendi kapsül
// launcher'ı hiç çizilmez — başlatıcı bizim küre). Kapanınca odak küreye
// geri döner (dock'un launcher-odak sözleşmesinin buradaki karşılığı).
//
// Yanıtlar şimdilik TASLAK: gerçek AI akışı bağlanana dek alan diline uygun
// kural tabanlı kısa yanıtlar döner; her yanıt tam deneyim için AI danışman
// sayfasını anar. Gerçek akış bağlanınca yalnız `taslakYanit` değişir.
import { useRef, useState } from 'react'
import { GlassChatDock, type GlassChatDockMessage } from '@repo/ui'
import { AiSparkleButton } from './AiSparkleButton'

const KARSILAMA: GlassChatDockMessage = {
  id: 'ai-karsilama',
  role: 'ai',
  text:
    'Merhaba! Ben arsam.net AI danışmanı. Bütçenizi, aradığınız bölgeyi ya da imar sorunuzu yazın — birlikte daraltalım.',
}

/** Gerçek akış bağlanana dek: soruya alan dilinde taslak yanıt üretir. */
export function taslakYanit(soru: string): string {
  const s = soru.toLocaleLowerCase('tr')
  if (s.includes('fiyat') || s.includes('bütçe') || s.includes('tl')) {
    return 'Bütçenize göre bölge önerisi çıkarabilirim. Örneğin Urla tarafında imarlı parseller şu an 6.000–12.500 TL/m² bandında. Emlak Endeksi sayfasında bölge bazlı seyri de görebilirsiniz; ayrıntılı analiz için AI danışman sayfasını açabilirim.'
  }
  if (s.includes('imar')) {
    return 'İmar durumu ilan kartlarında doğrulama rozetiyle birlikte gösterilir; konut imarlı, tarla ve turizm imarlı parselleri filtreleyebilirsiniz. Belirli bir parselin imar sorusunu yazarsanız kanıt kaynaklarıyla birlikte özetlerim.'
  }
  if (s.includes('randevu') || s.includes('ofis') || s.includes('görüşme')) {
    return 'Ofislerle görüşme randevusunu Ofisler sayfasından tek tıkla planlayabilirsiniz — profil eşleşmesi puanları hangi ofisin size uyduğunu gösterir. İsterseniz kriterlerinize göre ofis önerisi de çıkarırım.'
  }
  if (s.includes('urla') || s.includes('izmir')) {
    return 'Urla–İzmir hattında denize yakın, imarlı köşe parseller öne çıkıyor; medyan m² fiyatı son 12 ayda yükseliş eğiliminde. Kayıtlı arama kurarsanız yeni ilan düşünce sizi haberdar ederim.'
  }
  return 'Not aldım. Aradığınız bölgeyi, bütçenizi ve arsa tipini (konut imarlı / tarla / ticari) yazarsanız size uygun ilanları daraltabilirim. Derinlemesine analiz için AI danışman sayfası da hizmetinizde.'
}

export function AiChatLauncher() {
  const [acik, setAcik] = useState(false)
  const [mesajlar, setMesajlar] = useState<GlassChatDockMessage[]>([KARSILAMA])
  const fabRef = useRef<HTMLButtonElement>(null)
  const sayacRef = useRef(0)

  const gonder = (text: string) => {
    const n = ++sayacRef.current
    setMesajlar((prev) => [
      ...prev,
      { id: `kullanici-${n}`, role: 'user', text },
      { id: `ai-${n}`, role: 'ai', text: '', pending: true },
    ])
    // "Yazıyor" göstergesi kısa bir nefes alır — anında beliren yanıt sahte
    // hissettirir; gerçek akışta bu bekleme ağdan gelecek.
    window.setTimeout(() => {
      setMesajlar((prev) =>
        prev.map((m) => (m.id === `ai-${n}` ? { id: m.id, role: 'ai' as const, text: taslakYanit(text) } : m)),
      )
    }, 900)
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
