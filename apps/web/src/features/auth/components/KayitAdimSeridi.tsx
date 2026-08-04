import type { CSSProperties, ReactNode } from 'react'
import { GlassProgress } from '@repo/ui'
import type { AdimSeridiOgesi } from '../domain/kayit-adimlari'
import styles from './KayitAdimSeridi.module.css'

export interface KayitAdimSeridiProps {
  adimlar: readonly AdimSeridiOgesi[]
  /** Sıfır tabanlı aktif adım indeksi. */
  aktifIndeks: number
  /**
   * Verilirse TAMAMLANMIŞ adımlar (indeksi aktiften küçük olanlar) butona
   * dönüşür. İleri adım hiçbir zaman tıklanabilir olmaz: ileri gitmek
   * doğrulamadan geçmeyi gerektirir, bu yüzden tek yolu "Devam et"tir.
   */
  onAdimSec?: (indeks: number) => void
  /** `nav` erişilebilir adı. */
  etiket?: string
  /**
   * Şeridin altına yerleşen "Adım N / M: …" satırı. Çok adımlı kayıt formu
   * bu satırı gezinme butonlarının yanında (altta) taşıdığı için burayı boş
   * bırakır; tek adımlık devam sayfalarında sayaç şeridin altında durur.
   */
  sayac?: ReactNode
}

const DURUM_METNI = {
  tamam: 'Tamamlandı',
  aktif: 'Şu an buradasınız',
  bekliyor: 'Bekliyor',
} as const

/**
 * Kayıt akışının ilerleme göstergesi: adım noktaları + etiketler + ince
 * ilerleme çubuğu.
 *
 * Durum üç kanaldan okunur — disk içeriği (✓ / sıra numarası), görsel-gizli
 * durum metni ve aktif adımdaki `aria-current="step"`. Renk yalnız
 * pekiştiricidir.
 */
export function KayitAdimSeridi({
  adimlar,
  aktifIndeks,
  onAdimSec,
  etiket = 'Kayıt adımları',
  sayac,
}: KayitAdimSeridiProps) {
  const toplam = adimlar.length

  return (
    <nav
      className={styles.serit}
      aria-label={etiket}
      style={{ '--adim-sayisi': toplam } as CSSProperties}
    >
      <ol className={styles.liste}>
        {adimlar.map((adim, indeks) => {
          const durum = indeks < aktifIndeks ? 'tamam' : indeks === aktifIndeks ? 'aktif' : 'bekliyor'
          const tiklanabilir = Boolean(onAdimSec) && durum === 'tamam'
          const icerik = (
            <>
              <span className={styles.nokta} aria-hidden="true">
                {durum === 'tamam' ? '✓' : indeks + 1}
              </span>
              <span className={styles.etiket}>{adim.kisaEtiket}</span>
              <span className={styles.srOnly}>
                {` — ${indeks + 1}. adım, ${DURUM_METNI[durum]}`}
              </span>
            </>
          )

          return (
            <li
              key={adim.anahtar}
              className={styles.oge}
              data-durum={durum}
              aria-current={durum === 'aktif' ? 'step' : undefined}
            >
              {tiklanabilir ? (
                <button
                  type="button"
                  className={styles.ogeIcerik}
                  onClick={() => onAdimSec?.(indeks)}
                >
                  {icerik}
                </button>
              ) : (
                // Tamamlanmamış adım tıklanamaz — devre dışı buton yerine düz
                // metin render edilir (ölü kontrol yasağı, bkz. rules.md §7).
                <span className={styles.ogeIcerik}>{icerik}</span>
              )}
            </li>
          )
        })}
      </ol>

      <GlassProgress
        className={styles.cubuk}
        size="sm"
        value={aktifIndeks + 1}
        max={toplam}
        label={`Kayıt ilerlemesi: ${toplam} adımın ${aktifIndeks + 1}. adımı`}
      />

      {sayac}
    </nav>
  )
}

export interface KayitAdimSayaciProps {
  aktifIndeks: number
  toplam: number
  baslik: string
  /**
   * `true` ise satır `aria-live="polite"` olur — adım değişimi ekran
   * okuyucuya "Adım N / M: …" olarak duyurulur. Adım değiştirmeyen
   * (tek adımlık) devam sayfalarında duyuracak bir değişim olmadığı için
   * kapalıdır.
   */
  canli?: boolean
}

/** "Adım N / M: <adım adı>" satırı. */
export function KayitAdimSayaci({
  aktifIndeks,
  toplam,
  baslik,
  canli = false,
}: KayitAdimSayaciProps) {
  return (
    <p className={styles.sayac} aria-live={canli ? 'polite' : undefined}>
      {`Adım ${aktifIndeks + 1} / ${toplam}: ${baslik}`}
    </p>
  )
}
