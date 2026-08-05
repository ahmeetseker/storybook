import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { PUAN_ETIKETLERI, parolaGucunuOlc } from '../domain/parola-gucu'
import styles from './ParolaGucu.module.css'

/** Kademe dolumu — yalnız transform (tasarım sistemi motion kuralı). */
const DOLUM = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const
/** Etiket ve tik çapraz geçişi — yalnız opacity/transform. */
const GECIS = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const
const ANINDA = { duration: 0 } as const

/**
 * Duyuru gecikmesi. Her tuş vuruşunda konuşan bir canlı bölge, parola
 * yazan ekran okuyucu kullanıcısının kendi yazdığını duymasını engeller;
 * bu yüzden duyuru kullanıcı DURDUKTAN sonra yapılır.
 */
const DUYURU_GECIKMESI = 700

/** Puanı ton adına çevirir — üç kademe: zayıf, orta, güçlü. */
function tonAdi(puan: number, enYuksek: number): 'Yok' | 'Zayif' | 'Orta' | 'Guclu' {
  if (puan === 0) return 'Yok'
  const oran = puan / enYuksek
  if (oran <= 0.34) return 'Zayif'
  if (oran <= 0.67) return 'Orta'
  return 'Guclu'
}

export interface ParolaGucuProps {
  /** İzlenen parola değeri — component durum tutmaz, yalnız ölçer. */
  parola: string
  /** Kural listesi gösterilsin mi. Kapatıldığında yalnız şerit + etiket kalır. */
  kurallariGoster?: boolean
  /** Ekran okuyucu duyurusunun gecikmesi (ms). Testlerde kısaltılabilir. */
  duyuruGecikmesi?: number
}

/**
 * Parola gücü göstergesi.
 *
 * Kural ve puanlama `domain/parola-gucu.ts`'te durur; burası yalnız
 * sunumdur. Ölçek `role="meter"` ile sunulur — `progressbar` DEĞİL: ilerleme
 * çubuğu biten bir işi anlatır, buradaki değer bir ölçümdür.
 *
 * Görsel kısımların tamamı `aria-hidden`'dır ve tek bir kibar canlı bölge
 * (`aria-live="polite"`) puanı, tahmin edilebilirliği ve eksik kuralları tek
 * cümlede duyurur. Şeritten, renkten ve tiklerden ayrı ayrı duyuru çıkarsa
 * ekran okuyucu kullanıcısı aynı bilgiyi üç kez dinler.
 *
 * Girdinin `aria-describedby`'ına BAĞLANMAZ: o nitelik alan hatasına
 * ayrılmıştır ve auth erişilebilirlik geçidi tek bir id'ye çözülmesini
 * bekler (bkz. `AuthAccessibility.test.tsx`). Kural metni zaten girdinin
 * hemen ardından, okuma sırasında gelir.
 */
export function ParolaGucu({
  parola,
  kurallariGoster = true,
  duyuruGecikmesi = DUYURU_GECIKMESI,
}: ParolaGucuProps) {
  const hareketAzalt = useReducedMotion()
  const durum = useMemo(() => parolaGucunuOlc(parola), [parola])
  const [duyuru, setDuyuru] = useState('')

  useEffect(() => {
    if (durum.duyuru === '') {
      setDuyuru('')
      return
    }
    const zamanlayici = setTimeout(() => setDuyuru(durum.duyuru), duyuruGecikmesi)
    return () => clearTimeout(zamanlayici)
  }, [durum.duyuru, duyuruGecikmesi])

  const ton = tonAdi(durum.puan, durum.enYuksek)
  const gecis = hareketAzalt ? ANINDA : GECIS

  return (
    <div className={styles.gosterge}>
      <div
        role="meter"
        aria-label="Parola gücü"
        aria-valuemin={0}
        aria-valuemax={durum.enYuksek}
        aria-valuenow={durum.puan}
        aria-valuetext={durum.etiket === '' ? 'Parola girilmedi' : durum.etiket}
        className={styles.olcek}
        // Kademe sayısı kural sayısıdır — tasarım değeri değil, veri.
        style={{ gridTemplateColumns: `repeat(${durum.enYuksek}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: durum.enYuksek }, (_, sira) => (
          <span key={sira} className={styles.bolum}>
            <motion.span
              className={`${styles.dolgu} ${styles[`serit${ton}`]}`}
              initial={false}
              animate={{ scaleX: sira < durum.puan ? 1 : 0 }}
              transition={
                hareketAzalt
                  ? ANINDA
                  : // Kademeler soldan sağa sırayla dolar; kapanış gecikmesiz.
                    { ...DOLUM, delay: sira < durum.puan ? sira * 0.03 : 0 }
              }
            />
          </span>
        ))}
      </div>

      <p className={styles.durumSatiri} aria-hidden="true">
        {/* Etiketlerin tamamı DOM'da durur ve opaklıkla değişir: metni
            değiştirmek yerine çapraz geçiş, satırın yeniden ölçülmesini
            (ve dolayısıyla zıplamasını) önler. */}
        <span className={styles.etiketYigini}>
          {PUAN_ETIKETLERI.map((metin, sira) => (
            <motion.span
              key={sira}
              className={`${styles.etiket} ${styles[`metin${ton}`]}`}
              initial={false}
              animate={{ opacity: sira === durum.puan ? 1 : 0 }}
              transition={gecis}
            >
              {metin}
            </motion.span>
          ))}
        </span>

        <motion.span
          className={styles.uyari}
          initial={false}
          animate={{ opacity: durum.tahminEdilebilir ? 1 : 0 }}
          transition={gecis}
        >
          Sık denenen bir kalıp
        </motion.span>
      </p>

      {kurallariGoster ? (
        // Liste `aria-hidden` DEĞİL: canlı bölge yalnız kullanıcı yazıp
        // durduğunda konuşur, oysa kuralların daha ilk açılışta okunabilir
        // olması gerekir. Tik ve halka dekoratiftir; durum her satıra
        // görsel-gizli metinle yazılır.
        <ul className={styles.kurallar}>
          {durum.kurallar.map((kural) => (
            <li
              key={kural.id}
              className={`${styles.kural} ${kural.saglandi ? styles.kuralSaglandi : ''}`}
            >
              <span className={styles.isaret} aria-hidden="true">
                <motion.span
                  className={styles.halka}
                  initial={false}
                  animate={{ opacity: kural.saglandi ? 0 : 1 }}
                  transition={gecis}
                />
                <motion.svg
                  className={styles.tik}
                  viewBox="0 0 16 16"
                  fill="none"
                  focusable="false"
                  initial={false}
                  animate={{ opacity: kural.saglandi ? 1 : 0, scale: kural.saglandi ? 1 : 0.6 }}
                  transition={hareketAzalt ? ANINDA : DOLUM}
                >
                  <path
                    d="M3.5 8.4 6.6 11.5 12.5 4.8"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </span>
              <span>{kural.etiket}</span>
              {kural.zorunlu ? null : <span className={styles.oneri}>önerilir</span>}
              <span className={styles.srOnly}>
                {kural.saglandi ? '— sağlandı' : '— henüz sağlanmadı'}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <p aria-live="polite" className={styles.srOnly}>
        {duyuru}
      </p>
    </div>
  )
}
