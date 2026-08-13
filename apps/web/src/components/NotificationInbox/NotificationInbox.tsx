// Bildirim kutusu — kabuktaki zile bağlı MASAÜSTÜ hızlı bakış popover'ı.
//
// Mobil davranış farklıdır (K2 kararı): dar viewport'ta popover açılmaz,
// zil doğrudan /hesabim/bildirimler tam sayfasına götürür — hamburger menü
// içinde katman üstüne katman ve kırpılma sorunları böylece kökten biter.
// Eşik, GlassSiteHeader'ın hamburger'a düştüğü 48rem kademesiyle aynıdır.
//
// Referans "notification inbox popover" deseninin Glass DS karşılığı:
// shadcn/radix kopyalanmaz — GlassPopover + GlassIconButton +
// GlassSegmentedControl bu sözleşmeleri zaten taşır. Veri tek kaynaktan
// (bildirimler.tsx) gelir; tam sayfa da aynı modeli kullanır.
import { useEffect, useState } from 'react'
import { GlassButton, GlassIconButton, GlassPopover, GlassSegmentedControl } from '@repo/ui'
import { BILDIRIM_IKONLARI, BellIcon, ORNEK_BILDIRIMLER, type Bildirim } from './bildirimler'
import styles from './NotificationInbox.module.css'

export type { Bildirim } from './bildirimler'

const MOBIL_SORGU = '(max-width: 48rem)'

export interface NotificationInboxProps {
  /** "Tüm bildirimleri gör" tıklanınca — kabuk bildirim sayfasına yönlendirir */
  onViewAll: () => void
  /**
   * Mobilde zile dokununca — kabuk /hesabim/bildirimler'e yönlendirir.
   * Verilmezse mobilde de `onViewAll` kullanılır (aynı hedef).
   */
  onOpenPage?: () => void
  /** Fixture yerine gerçek kayıtlar (test/ileri entegrasyon kancası) */
  bildirimler?: Bildirim[]
}

export function NotificationInbox({ onViewAll, onOpenPage, bildirimler }: NotificationInboxProps) {
  const [kayitlar, setKayitlar] = useState<Bildirim[]>(bildirimler ?? ORNEK_BILDIRIMLER)
  const [sekme, setSekme] = useState('tumu')
  const [acik, setAcik] = useState(false)

  // K2 kararı: dar viewport'ta popover yerine tam sayfa. SSR'da masaüstü
  // varsayılır (matchMedia yok); hidrasyon sonrası gerçek değere oturur.
  const [mobil, setMobil] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const sorgu = window.matchMedia(MOBIL_SORGU)
    const guncelle = () => setMobil(sorgu.matches)
    guncelle()
    sorgu.addEventListener('change', guncelle)
    return () => sorgu.removeEventListener('change', guncelle)
  }, [])

  const okunmamis = kayitlar.filter((k) => k.okunmadi).length
  const gorunen = sekme === 'okunmamis' ? kayitlar.filter((k) => k.okunmadi) : kayitlar

  const okunduSay = (id: string) =>
    setKayitlar((prev) => prev.map((k) => (k.id === id ? { ...k, okunmadi: false } : k)))
  const hepsiniOkunduSay = () => setKayitlar((prev) => prev.map((k) => ({ ...k, okunmadi: false })))

  if (mobil) {
    return (
      <span className={styles.bellWrap}>
        <GlassIconButton
          size="sm"
          label={okunmamis > 0 ? `Bildirimler (${okunmamis} okunmamış)` : 'Bildirimler'}
          onClick={onOpenPage ?? onViewAll}
        >
          {BellIcon}
        </GlassIconButton>
        {okunmamis > 0 ? (
          <span className={styles.unreadBadge} aria-hidden>
            {okunmamis > 99 ? '99+' : okunmamis}
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <GlassPopover
      className={styles.inboxRoot}
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
                <span className={styles.rowIcon}>{BILDIRIM_IKONLARI[kayit.ikon]}</span>
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
