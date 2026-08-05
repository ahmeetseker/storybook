import { useState, type ReactNode } from 'react'
import { alanHataId } from '../domain/form-erisilebilirlik'
import alanStilleri from '../pages/GirisPage.module.css'
import styles from './ParolaAlani.module.css'

/** Açık göz — parola GİZLİ iken gösterilir ("göstermek için bas"). */
function GozIkonu() {
  return (
    <svg className={styles.ikon} viewBox="0 0 20 20" fill="none" focusable="false">
      <path
        d="M1.8 10S4.9 4.6 10 4.6 18.2 10 18.2 10 15.1 15.4 10 15.4 1.8 10 1.8 10Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  )
}

/** Üstü çizili göz — parola GÖRÜNÜR iken gösterilir ("gizlemek için bas"). */
function GozKapaliIkonu() {
  return (
    <svg className={styles.ikon} viewBox="0 0 20 20" fill="none" focusable="false">
      <path
        d="M1.8 10S4.9 4.6 10 4.6c1.3 0 2.5.35 3.5.87M18.2 10s-3.1 5.4-8.2 5.4c-1.3 0-2.5-.35-3.5-.87"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.3 8.3a2.4 2.4 0 0 0 3.4 3.4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path d="m3.5 3.5 13 13" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

export interface ParolaAlaniProps {
  id: string
  etiket: string
  deger: string
  onDegerChange: (deger: string) => void
  /** `new-password` (kayıt/yeni parola) veya `current-password` (giriş). */
  autoComplete: 'new-password' | 'current-password'
  /** Alan hatası; verilirse `aria-invalid` + `aria-describedby` bağlanır. */
  hata?: string
  /** Girdi ile hata arasına giren içerik — kayıt formunda `ParolaGucu`. */
  children?: ReactNode
}

/**
 * Göster/gizle düğmeli parola alanı.
 *
 * Parolayı görebilmek bir kolaylık değil, hata oranı meselesidir: yazdığını
 * göremeyen kullanıcı (özellikle dokunmatik klavyede ve uzun parolalarda)
 * yanlış yazdığını ancak reddedildiğinde anlar. Kayıt formunda bu daha da
 * ağır basar — parola ORADA belirlenir, yanlış yazılan bir parola hesabın
 * kilidini kapatır.
 *
 * Sözleşme:
 * - Düğme `aria-pressed` taşır (basılı = parola görünür) ve `aria-controls`
 *   ile girdiye bağlıdır; erişilebilir adı duruma göre değişir.
 * - `type` değişse de `autocomplete` sabit kalır: parola yöneticileri alanı
 *   `text`e dönüştüğünde de tanımaya devam eder.
 * - Alan görünür başlar DEĞİL gizli başlar; görünürlük yalnız kullanıcının
 *   açık isteğiyle ve o oturumluk açılır (component ayrıldığında sıfırlanır).
 */
export function ParolaAlani({
  id,
  etiket,
  deger,
  onDegerChange,
  autoComplete,
  hata,
  children,
}: ParolaAlaniProps) {
  const [gorunur, setGorunur] = useState(false)

  return (
    <div className={alanStilleri.field}>
      <label className={alanStilleri.label} htmlFor={id}>
        {etiket}
      </label>

      <div className={styles.grup} data-hatali={hata ? true : undefined}>
        <input
          id={id}
          className={styles.girdi}
          type={gorunur ? 'text' : 'password'}
          autoComplete={autoComplete}
          // Parola metne dönüştüğünde tarayıcının düzeltme/büyük harf
          // yardımcıları devreye girip yazılanı sessizce değiştirebilir.
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={deger}
          onChange={(event) => onDegerChange(event.target.value)}
          aria-invalid={hata ? true : undefined}
          aria-describedby={hata ? alanHataId(id) : undefined}
        />
        <button
          type="button"
          className={styles.dugme}
          onClick={() => setGorunur((onceki) => !onceki)}
          aria-pressed={gorunur}
          aria-controls={id}
          aria-label={gorunur ? 'Parolayı gizle' : 'Parolayı göster'}
        >
          {gorunur ? <GozKapaliIkonu /> : <GozIkonu />}
        </button>
      </div>

      {/* Durum değişimi kibarca duyurulur: görme engelli kullanıcı da
          parolasının o an ekranda AÇIKTA olduğunu bilmelidir — omuz üstünden
          bakan biri varsa bu bir güvenlik bilgisidir. */}
      <p className={styles.srOnly} aria-live="polite">
        {gorunur ? 'Parola görünür durumda' : ''}
      </p>

      {children}

      {hata ? (
        <p id={alanHataId(id)} className={alanStilleri.alanHatasi}>
          {hata}
        </p>
      ) : null}
    </div>
  )
}
