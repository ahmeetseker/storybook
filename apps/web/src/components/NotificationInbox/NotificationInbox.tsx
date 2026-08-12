// Bildirim kutusu — kabuktaki zile bağlı popover gelen kutusu.
//
// Referans "notification inbox popover" deseninin Glass DS karşılığı:
// shadcn/radix kopyalanmaz — GlassPopover + GlassIconButton +
// GlassSegmentedControl bu sözleşmeleri zaten taşır. Veri şimdilik fixture:
// gerçek bildirim akışı bağlanana dek pazar yerine uygun örnek kayıtlar.
import { useState, type ReactNode } from 'react'
import { GlassButton, GlassIconButton, GlassPopover, GlassSegmentedControl } from '@repo/ui'
import styles from './NotificationInbox.module.css'

type BildirimIkonu = 'mesaj' | 'randevu' | 'fiyat' | 'ilan' | 'sistem'

export interface Bildirim {
  id: string
  baslik: string
  detay: string
  zaman: string
  okunmadi: boolean
  ikon: BildirimIkonu
}

const ORNEK_BILDIRIMLER: Bildirim[] = [
  {
    id: 'mesaj-1',
    baslik: 'Kadıköy Anahtar Ofis mesajınıza yanıt verdi',
    detay: 'Urla arsa süreci hakkında',
    zaman: '10 dk önce',
    okunmadi: true,
    ikon: 'mesaj',
  },
  {
    id: 'randevu-1',
    baslik: 'Görüşme randevunuz onaylandı',
    detay: 'Perşembe 14:00 · Egekent Konut Ofisi',
    zaman: '1 saat önce',
    okunmadi: true,
    ikon: 'randevu',
  },
  {
    id: 'fiyat-1',
    baslik: 'Takip ettiğiniz arsada fiyat düştü',
    detay: 'Urla denize yakın köşe parsel · −%6',
    zaman: '3 saat önce',
    okunmadi: false,
    ikon: 'fiyat',
  },
  {
    id: 'ilan-1',
    baslik: 'İlanınız yayına alındı',
    detay: 'İzmir Urla imarlı köşe parsel',
    zaman: 'Dün',
    okunmadi: false,
    ikon: 'ilan',
  },
  {
    id: 'sistem-1',
    baslik: 'Planlı bakım bildirimi',
    detay: 'Pazar 03.00–05.00 arasında kısa kesintiler olabilir',
    zaman: '3 gün önce',
    okunmadi: false,
    ikon: 'sistem',
  },
]

const IKONLAR: Record<BildirimIkonu, ReactNode> = {
  mesaj: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 12a8 8 0 1 0-3.1 6.3L20 19l-.9-2.9A8 8 0 0 0 20 12Z" />
    </svg>
  ),
  randevu: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M9.2 14.2l2 2 3.6-4" />
    </svg>
  ),
  fiyat: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m4 12 8-8 8 8-8 8-8-8Z" />
      <path d="M12 8.5v7M9.5 13.5 12 16l2.5-2.5" />
    </svg>
  ),
  ilan: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </svg>
  ),
  sistem: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </svg>
  ),
}

const BellIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 9.5a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17s-2.5-1-2.5-7" />
    <path d="M10.3 20a2 2 0 0 0 3.4 0" />
  </svg>
)

export interface NotificationInboxProps {
  /** "Tüm bildirimleri gör" tıklanınca — kabuk hareketler sayfasına yönlendirir */
  onViewAll: () => void
  /** Fixture yerine gerçek kayıtlar (test/ileri entegrasyon kancası) */
  bildirimler?: Bildirim[]
}

export function NotificationInbox({ onViewAll, bildirimler }: NotificationInboxProps) {
  const [kayitlar, setKayitlar] = useState<Bildirim[]>(bildirimler ?? ORNEK_BILDIRIMLER)
  const [sekme, setSekme] = useState('tumu')
  const [acik, setAcik] = useState(false)

  const okunmamis = kayitlar.filter((k) => k.okunmadi).length
  const gorunen = sekme === 'okunmamis' ? kayitlar.filter((k) => k.okunmadi) : kayitlar

  const okunduSay = (id: string) =>
    setKayitlar((prev) => prev.map((k) => (k.id === id ? { ...k, okunmadi: false } : k)))
  const hepsiniOkunduSay = () => setKayitlar((prev) => prev.map((k) => ({ ...k, okunmadi: false })))

  return (
    <GlassPopover
      open={acik}
      onOpenChange={setAcik}
      placement="bottom"
      align="end"
      title="Bildirimler"
      material="flat"
      trigger={
        <span className={styles.bellWrap}>
          <GlassIconButton
            size="sm"
            label={okunmamis > 0 ? `Bildirimler (${okunmamis} okunmamış)` : 'Bildirimler'}
          >
            {BellIcon}
          </GlassIconButton>
          {okunmamis > 0 ? (
            <span className={styles.unreadBadge} aria-hidden>
              {okunmamis > 99 ? '99+' : okunmamis}
            </span>
          ) : null}
        </span>
      }
    >
      <div className={styles.panel}>
        <div className={styles.head}>
          <GlassSegmentedControl
            size="sm"
            variant="track"
            label="Bildirim filtresi"
            value={sekme}
            onChange={setSekme}
            options={[
              { value: 'tumu', label: 'Tümü' },
              { value: 'okunmamis', label: okunmamis > 0 ? `Okunmamış (${okunmamis})` : 'Okunmamış' },
            ]}
          />
          {okunmamis > 0 ? (
            <button type="button" className={styles.markAll} onClick={hepsiniOkunduSay}>
              Tümünü okundu say
            </button>
          ) : null}
        </div>

        <div className={styles.list}>
          {gorunen.length === 0 ? (
            <p className={styles.empty}>Hepsi okundu — yeni bildirim yok.</p>
          ) : (
            gorunen.map((kayit) => (
              <button
                key={kayit.id}
                type="button"
                className={styles.row}
                data-unread={kayit.okunmadi || undefined}
                onClick={() => okunduSay(kayit.id)}
              >
                <span className={styles.rowIcon}>{IKONLAR[kayit.ikon]}</span>
                <span className={styles.rowBody}>
                  <span className={styles.rowTitle}>{kayit.baslik}</span>
                  <span className={styles.rowDetail}>{kayit.detay}</span>
                  <span className={styles.rowTime}>{kayit.zaman}</span>
                </span>
                {kayit.okunmadi ? <span className={styles.dot} aria-hidden /> : null}
              </button>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <GlassButton
            material="flat"
            size="sm"
            className={styles.viewAll}
            onClick={() => {
              setAcik(false)
              onViewAll()
            }}
          >
            Tüm bildirimleri gör
          </GlassButton>
        </div>
      </div>
    </GlassPopover>
  )
}
