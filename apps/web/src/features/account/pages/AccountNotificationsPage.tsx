// Bildirimler tam sayfası — mobilin ANA bildirim yüzeyi (K2 kararı) ve
// masaüstü popover'ındaki "Tüm bildirimleri gör"ün hedefi.
//
// Popover hızlı bakıştır; bu sayfa arşivdir: kayıtlar gün kovalarına
// (Bugün / Dün / Daha eski) gruplanır, filtre ve okundu yönetimi popover'la
// aynı sözleşmeyi kullanır. Veri tek kaynaktan gelir (NotificationInbox ile
// paylaşılan `bildirimler` modülü) — gerçek akış bağlanınca iki yüzey birden
// oradan beslenir.
import { useState } from 'react'
import { GlassButton, GlassSegmentedControl } from '@repo/ui'
import {
  BILDIRIM_IKONLARI,
  GUN_ETIKETLERI,
  ORNEK_BILDIRIMLER,
  type Bildirim,
  type BildirimGunu,
} from '@/components/NotificationInbox/bildirimler'
import styles from './AccountNotificationsPage.module.css'

const GUN_SIRASI: readonly BildirimGunu[] = ['bugun', 'dun', 'eski']

export interface AccountNotificationsPageProps {
  /** Fixture yerine gerçek kayıtlar (test/ileri entegrasyon kancası) */
  bildirimler?: Bildirim[]
}

export function AccountNotificationsPage({ bildirimler }: AccountNotificationsPageProps) {
  const [kayitlar, setKayitlar] = useState<Bildirim[]>(bildirimler ?? ORNEK_BILDIRIMLER)
  const [sekme, setSekme] = useState('tumu')

  const okunmamis = kayitlar.filter((k) => k.okunmadi).length
  const gorunen = sekme === 'okunmamis' ? kayitlar.filter((k) => k.okunmadi) : kayitlar

  const okunduSay = (id: string) =>
    setKayitlar((prev) => prev.map((k) => (k.id === id ? { ...k, okunmadi: false } : k)))
  const hepsiniOkunduSay = () => setKayitlar((prev) => prev.map((k) => ({ ...k, okunmadi: false })))

  const gruplar = GUN_SIRASI.map((gun) => ({
    gun,
    etiket: GUN_ETIKETLERI[gun],
    kayitlar: gorunen.filter((k) => k.gun === gun),
  })).filter((grup) => grup.kayitlar.length > 0)

  return (
    <section className={styles.root} aria-label="Bildirimler">
      <div className={styles.toolbar}>
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
          <GlassButton material="flat" size="sm" onClick={hepsiniOkunduSay}>
            Tümünü okundu say
          </GlassButton>
        ) : null}
      </div>

      {gruplar.length === 0 ? (
        <p className={styles.empty}>Hepsi okundu — yeni bildirim yok.</p>
      ) : (
        gruplar.map((grup) => (
          <section key={grup.gun} className={styles.group} aria-label={grup.etiket}>
            <h2 className={styles.groupLabel}>{grup.etiket}</h2>
            <div className={styles.list}>
              {grup.kayitlar.map((kayit) => (
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
              ))}
            </div>
          </section>
        ))
      )}
    </section>
  )
}
