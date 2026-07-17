// GlassVoiceBar — sesli arama çubuğu (mikrofon butonu + canlı transkript).
// İçerik katmanı FLAT (cam/backdrop-filter yok) — kontrat gereği cam yalnız
// navigasyon/kontrol katmanına ayrılmış, bu bir arama giriş kontrolü.
// Web Speech API entegrasyonu component'in kapsamı DIŞINDA: component saf
// sunumdur, ses tanıma/mikrofon izni tamamen çağıranın sorumluluğunda
// (bkz. rules.md §1, §7).
import { useId, type HTMLAttributes } from 'react'
import styles from './GlassVoiceBar.module.css'

/** Sesli arama akışının üç durumu — her zaman controlled (dışarıdan verilir). */
export type GlassVoiceBarState = 'idle' | 'listening' | 'processing'

export interface GlassVoiceBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Akışın güncel durumu — controlled zorunlu, uncontrolled/default yok */
  state: GlassVoiceBarState
  /** Mikrofon butonuna `idle` durumundayken tıklanınca çağrılır (dinlemeyi başlat) */
  onStart: () => void
  /** Mikrofon butonuna `listening` durumundayken tıklanınca çağrılır (dinlemeyi durdur) */
  onStop: () => void
  /** Canlı/son transkript metni — dolu olduğunda ipucu yerine bu gösterilir */
  transcript?: string
  /** `transcript` boşken (ve işlenmiyorken) gösterilen örnek cümle */
  hint?: string
}

// Dekoratif ikon — accessible name her zaman butonun aria-label'ından gelir.
function MicIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" focusable="false">
      <rect x="5.5" y="0.75" width="5" height="8.25" rx="2.5" fill="currentColor" />
      <path
        d="M3 7.25v1a5 5 0 0 0 10 0v-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M8 13.25v1.4M5.4 14.65h5.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

const BUTTON_TEXT: Record<GlassVoiceBarState, string> = {
  idle: 'Sesle ara',
  listening: 'Dinliyor…',
  processing: 'Çözümleniyor…',
}

// WCAG 2.5.3 "Label in Name" (Level A): accessible name görünür buton metnini
// (BUTTON_TEXT) birebir alt string olarak içermeli — aksi halde ses-komut
// kullanıcıları (Dragon/Voice Control) görünen metni söyleyerek butonu
// tetikleyemez. Bu yüzden aria-label, BUTTON_TEXT'i öneke alıp durum
// açıklamasını arkasına ekler; ayrı bir sabit metin listesi değildir.
const BUTTON_ARIA_LABEL: Record<GlassVoiceBarState, string> = {
  idle: `${BUTTON_TEXT.idle}, sesli aramayı başlat`,
  listening: `${BUTTON_TEXT.listening}, sesli aramayı durdur`,
  processing: `${BUTTON_TEXT.processing}, sesli arama işleniyor`,
}

/**
 * Sesli arama çubuğu — mikrofon butonu (idle/listening/processing) ve
 * yanındaki canlı transkript satırını tek pakette sunar. Ses tanıma
 * bağlanmamıştır: `onStart`/`onStop` yalnız kullanıcı niyetini bildirir,
 * `transcript` dışarıdan (Web Speech API vb. çağıran taraf) beslenir.
 */
export function GlassVoiceBar({
  state,
  onStart,
  onStop,
  transcript,
  hint = '"İzmir Urla imarlı arsa" demeyi dene',
  className,
  ...rest
}: GlassVoiceBarProps) {
  const uid = useId()
  const statusId = `${uid}-status`

  const trimmedTranscript = transcript?.trim()
  // İşleniyorken (processing) ipucu göstermek yanıltıcı olurdu — buton metni
  // zaten "Çözümleniyor…" diyor; transkript de yoksa satır boş kalıp CSS
  // `:empty` ile katlanır (SearchBar dersi: canlı bölge her zaman mount
  // kalır, yalnız içeriği değişir).
  const statusContent = trimmedTranscript ? transcript : state !== 'processing' ? hint : ''

  const handleClick = () => {
    if (state === 'idle') {
      onStart()
    } else if (state === 'listening') {
      onStop()
    }
    // processing: buton disabled — tıklama zaten ulaşmaz, yine de no-op.
  }

  return (
    <div {...rest} className={[styles.root, className].filter(Boolean).join(' ')} data-state={state}>
      <button
        type="button"
        className={styles.button}
        data-state={state}
        disabled={state === 'processing'}
        aria-label={BUTTON_ARIA_LABEL[state]}
        aria-pressed={state === 'listening'}
        aria-describedby={statusId}
        onClick={handleClick}
      >
        <span className={styles.iconWrap} aria-hidden="true">
          {state === 'listening' ? (
            <>
              <span className={styles.pulseRing} />
              <span className={[styles.pulseRing, styles.pulseRingDelay].join(' ')} />
            </>
          ) : null}
          <span className={styles.icon}>
            <MicIcon />
          </span>
        </span>
        <span className={styles.buttonText}>{BUTTON_TEXT[state]}</span>
      </button>

      <p id={statusId} className={styles.status} aria-live="polite">
        {statusContent}
      </p>
    </div>
  )
}
