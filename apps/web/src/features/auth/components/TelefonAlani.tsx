import { useId, type ReactNode } from 'react'
import { alanHataId } from '../domain/form-erisilebilirlik'
import {
  TELEFON_ULKELERI,
  telefonUlkesi,
  telefonuBicimlendir,
  telefonuNormallestir,
  type TelefonUlkeKodu,
} from '../domain/telefon-ulkeler'
import alanStilleri from '../pages/GirisPage.module.css'
import styles from './TelefonAlani.module.css'

export interface TelefonAlaniProps {
  /** Numara girdisinin `id`'si. Ülke seçimi bundan türetilir (`<id>-ulke`). */
  id: string
  etiket?: string
  /** Seçili ülkenin ISO kodu. */
  ulkeKodu: TelefonUlkeKodu
  onUlkeKoduChange: (kod: TelefonUlkeKodu) => void
  /** Numaranın ULUSAL kısmı — ülke kodu bu değerin parçası değildir. */
  deger: string
  onDegerChange: (deger: string) => void
  /** Alan hatası; verilirse `aria-invalid` + `aria-describedby` bağlanır. */
  hata?: string
  /** Hata yokken girdinin altında duran açıklama. */
  ipucu?: ReactNode
}

/**
 * Ülke kodlu telefon alanı.
 *
 * Tek bir `<input>` yerine iki kontrol: ülke `<select>`'i ve ulusal numara.
 * Ayrı olmalarının sebebi doğrulama — numaranın kaç haneli olacağı ülkeye
 * bağlıdır ve tek metne gömülü ülke kodunu geri ayrıştırmak belirsizdir
 * (+1 → ABD mi Kanada mı). Ayrıca kullanıcı ülkeyi seçerken numarasının
 * BEKLENEN biçimini de görür: placeholder o ülkenin örnek numarasıdır.
 *
 * Seçim NATIVE `<select>`'tir. Üzerine yalnız bir gösterim katmanı
 * (`.ulkeGosterim`) çizilir; select şeffaflaşır ama yerinde durur — böylece
 * dokunmatikte platformun kendi ülke listesi açılır, klavyede harfe basınca
 * ülke adına atlama çalışır ve ekran okuyucu onu normal bir açılır liste
 * olarak duyurur. Kapalı hâlde ülke ADI değil bayrak + arama kodu görünür:
 * "Birleşik Arap Emirlikleri" alanın yarısını yer, "🇦🇪 +971" ise numaranın
 * yanında okunması gereken şeyin ta kendisidir.
 */
export function TelefonAlani({
  id,
  etiket = 'Telefon',
  ulkeKodu,
  onUlkeKoduChange,
  deger,
  onDegerChange,
  hata,
  ipucu,
}: TelefonAlaniProps) {
  const ulkeId = `${id}-ulke`
  const ipucuId = useId()
  const ulke = telefonUlkesi(ulkeKodu)

  const betimleyen = hata ? alanHataId(id) : ipucu ? ipucuId : undefined

  return (
    <div className={alanStilleri.field}>
      <label className={alanStilleri.label} htmlFor={id}>
        {etiket}
      </label>

      {/* Ülke seçiminin etiketi görsel olarak gizlidir: alanın görünen adı
          "Telefon"dur ve seçimin ne olduğu bayrak + arama kodundan zaten
          bellidir. Ekran okuyucu için ayrı bir ad yine de şart — aksi hâlde
          liste "adı olmayan açılır liste" diye duyurulur. */}
      <label className={styles.srOnly} htmlFor={ulkeId}>
        Ülke kodu
      </label>

      <div className={styles.grup} data-hatali={hata ? true : undefined}>
        <span className={styles.ulke}>
          <span className={styles.ulkeGosterim} aria-hidden="true">
            <span className={styles.bayrak}>{ulke.bayrak}</span>
            <span className={styles.aramaKodu}>{ulke.aramaKodu}</span>
            <svg className={styles.ok} viewBox="0 0 12 12" fill="none" focusable="false">
              <path
                d="M3 4.5 6 7.5 9 4.5"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <select
            id={ulkeId}
            className={styles.ulkeSecim}
            autoComplete="tel-country-code"
            value={ulkeKodu}
            onChange={(event) => onUlkeKoduChange(event.target.value as TelefonUlkeKodu)}
          >
            {TELEFON_ULKELERI.map((secenek) => (
              <option key={secenek.kod} value={secenek.kod}>
                {secenek.ad} ({secenek.aramaKodu})
              </option>
            ))}
          </select>
        </span>

        <input
          id={id}
          className={styles.numara}
          type="tel"
          inputMode="tel"
          // `tel` DEĞİL `tel-national`: ülke kodu ayrı kontrolde
          // (`tel-country-code`) toplanıyor, bu alan numaranın yalnız ulusal
          // kısmını taşıyor. Yanlış belirteç, tarayıcının otomatik
          // doldurmasında ülke kodunu ikinci kez yazdırırdı.
          autoComplete="tel-national"
          placeholder={telefonuBicimlendir(ulke.ornek, ulke.kod)}
          value={deger}
          onChange={(event) => onDegerChange(event.target.value)}
          // Alanı terk ederken numara kanonik hâline getirilir: kullanıcının
          // yazdığı "0532 123 45 67" ya da "+90 532…" aynı numaradır ve
          // özet adımında da, kayıtta da tek biçimde görünmelidir.
          onBlur={() => onDegerChange(telefonuNormallestir(deger, ulkeKodu))}
          aria-invalid={hata ? true : undefined}
          aria-describedby={betimleyen}
        />
      </div>

      {hata ? (
        <p id={alanHataId(id)} className={alanStilleri.alanHatasi}>
          {hata}
        </p>
      ) : ipucu ? (
        <p id={ipucuId} className={alanStilleri.hint}>
          {ipucu}
        </p>
      ) : null}
    </div>
  )
}
