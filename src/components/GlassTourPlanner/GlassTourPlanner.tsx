// GlassTourPlanner — AI çoklu-ilan tur planı.
// AI-first component: içerik katmanı FLAT (cam/backdrop-filter yok). Kendi
// dikey rota rayını (rozetli sıra numarası + bağlantı çizgisi) SVG'siz, saf
// DOM ile çizer — GlassTimeline'daki rail/connector desenini paylaşır ama
// tone yerine sıra numarası taşır ve kendi AI-first sözleşmesi (rozet/
// güven/geri bildirim/yükleme/onay) eklenir (bkz. rules.md §1).
import { useId, useRef, useState, type HTMLAttributes } from 'react'
import styles from './GlassTourPlanner.module.css'

/** Tur planındaki tek bir durak. */
export interface GlassTourPlannerStop {
  /** Ham veri kimliği — yalnız React `key` olarak kullanılır, hiçbir DOM `id`'sine yazılmaz */
  id: string
  /** Durak başlığı (ör. "Kozlu Fatih Sitesi 3+1") */
  title: string
  /** Varış saati — tabular hizalanır, format serbest (ör. "11:00") */
  time: string
  /** Durakta geçirilecek tahmini süre (ör. "30 dk") */
  duration?: string
  /**
   * Önceki duraktan bu durağa ulaşım notu (ör. "Önceki duraktan 12 dk araç").
   * Yalnız ikinci ve sonraki duraklarda anlamlıdır — ilk durakta (önceki
   * durak yok) verilse bile render edilmez.
   */
  travelNote?: string
  /** Durak görseli — tamamen dekoratif (`alt=""`); bilgi zaten saat/başlık metninde var */
  image?: string
}

export interface GlassTourPlannerProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Sıralı durak listesi — sıra numarası dizindeki konumdan türetilir (`stop.id` yalnız React key) */
  stops: GlassTourPlannerStop[]
  /** Plan tarihi/etiketi (ör. "Cmt 18 Tem") — başlığın accessible name kaynağı */
  date: string
  /**
   * Toplam süre özeti (ör. "3 durak · ~2 sa 15 dk"). Component durak
   * sayısından/saatlerinden KENDİ hesaplamaz — verilen metin olduğu gibi
   * gösterilir; verilmezse özet satırı hiç render edilmez.
   */
  totalNote?: string
  /**
   * "Planı Onayla" tıklanınca çağrılır. AI çıktısı asla otomatik eylem
   * tetiklemediği için bu buton HER ZAMAN görünür render edilir —
   * `onConfirm` verilmezse buton `disabled` kalır (sahte/no-op tıklama
   * üretmek yerine); gizlenmez.
   */
  onConfirm?: () => void
  /**
   * AI-first standardı: verilirse "✦ AI" rozetinin yanında "%N güven"
   * metni görünür etiket olarak eklenir. [0,100] dışına clamp edilir;
   * sonlu değilse (`NaN`/`Infinity`) hiç render edilmez (rozet yine görünür kalır).
   */
  confidence?: number
  /**
   * Verilirse planın altında 👍/👎 geri bildirim butonları görünür
   * (accessible name "Faydalı"/"Faydalı değil"). Tıklanan yön görsel
   * olarak seçili işaretlenir (`aria-pressed`); component kendi geri
   * bildirimini sunucuya göndermez, yalnız çağıranı bilgilendirir.
   */
  onFeedback?: (value: 'up' | 'down') => void
  /**
   * true olduğunda durak listesi yerine soluk, animasyonsuz-kapatılabilir
   * bir placeholder gösterilir (kendi flat skeleton'u). Zorunlu "✦ AI"
   * rozeti yükleme sırasında da görünür kalır; onay butonu bu sırada
   * `disabled`'dır (henüz onaylanacak bir plan yok).
   */
  loading?: boolean
}

/** `confidence` prop'unu normalize eder: sonlu değilse `null` (rozet metni gizlenir). */
function resolveConfidence(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.round(Math.min(Math.max(value, 0), 100))
}

/**
 * AI-first içerik rozeti — Dalga kontratının "AI-first standardı" bölümünden
 * birebir kopya CSS (bkz. GlassMatchScore/GlassChatDock) — tüm AI
 * component'lerinde aynı görünmeli.
 */
function AiBadge({ confidence }: { confidence: number | null }) {
  return (
    <span className={styles.aiRow}>
      <span className={styles.aiBadge} aria-label="Yapay zekâ üretimi">
        ✦ AI
      </span>
      {confidence !== null ? <span className={styles.confidence}>%{confidence} güven</span> : null}
    </span>
  )
}

function SkeletonRoute() {
  return (
    <div className={styles.skeletonList} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className={styles.skeletonRow}>
          <span className={styles.skeletonBadge} />
          <span className={styles.skeletonCard} />
        </div>
      ))}
    </div>
  )
}

const EMPTY_STOPS_TEXT = 'Bu tur planında henüz durak eklenmemiş.'

/**
 * AI çoklu-ilan tur planı — seçilen ilanları tek bir güne/rotaya dizen,
 * yapay zekâ üretimi bir gezi planı. Durakları dikey bir rotada sıra
 * numarası rozetli kartlar olarak çizer (saat + başlık + süre), aralarında
 * ince bir ulaşım notu satırı gösterir. Başlıkta tarih + zorunlu "✦ AI"
 * rozeti + opsiyonel toplam süre özeti bulunur; altında AI çıktısının
 * otomatik eylem tetiklememesi ilkesi gereği her zaman görünür "Planı
 * Onayla" butonu vardır. İçerik katmanı FLAT — cam yüzey/backdrop-filter
 * kullanılmaz. v1'de sıralama sabittir (`onReorder` yok, bkz. rules.md §1).
 */
export function GlassTourPlanner({
  stops,
  date,
  totalNote,
  onConfirm,
  confidence,
  onFeedback,
  loading = false,
  className,
  ...rest
}: GlassTourPlannerProps) {
  const uid = useId()
  const titleId = `${uid}-title`
  const feedbackPromptId = `${uid}-feedback-prompt`

  const resolvedConfidence = resolveConfidence(confidence)
  const [feedback, setFeedback] = useState<'up' | 'down' | undefined>(undefined)

  // İçerik imzası: `date`/`stops` GERÇEKTEN değiştiğinde (ör. kullanıcı
  // farklı bir plana geçti) önceki geri bildirim seçimi anlamsız kalır —
  // render sırasında karşılaştırıp sıfırlanır (GlassMatchScore ile aynı
  // desen; React docs "Adjusting state when a prop changes"). Bir sonraki
  // render'a taşınmaz, ekstra boyama olmaz.
  const contentSignature = JSON.stringify({
    date,
    stops: stops.map((s) => [s.id, s.time, s.title, s.duration ?? null, s.travelNote ?? null]),
  })
  const prevContentSignatureRef = useRef(contentSignature)
  if (prevContentSignatureRef.current !== contentSignature) {
    prevContentSignatureRef.current = contentSignature
    if (feedback !== undefined) {
      setFeedback(undefined)
    }
  }

  const showFeedback = !loading && Boolean(onFeedback) && stops.length > 0
  // `stops=[]` iken onaylanacak bir plan yok — `onConfirm` verilmiş olsa
  // bile buton disabled kalır (boş plan callback'i asla tetiklenmez).
  const confirmDisabled = loading || !onConfirm || stops.length === 0

  const handleFeedback = (direction: 'up' | 'down') => {
    // Aynı yöne tekrar tıklama seçimi geri alır (toggle); farklı yöne
    // tıklama karşılıklı dışlayarak seçimi değiştirir.
    setFeedback((prev) => (prev === direction ? undefined : direction))
    onFeedback?.(direction)
  }

  const handleConfirm = () => {
    // Koruyucu boşluk kontrolü: `disabled` durumu tıklamayı zaten engeller,
    // ama programatik tetiklemeye (ör. test/otomasyon) karşı ikinci katman.
    if (stops.length === 0) return
    onConfirm?.()
  }

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <section aria-labelledby={titleId} className={classes} data-loading={loading || undefined} {...rest}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <span id={titleId} className={styles.title}>
            {date}
          </span>
          {/* AI-first standardı: loading sırasında güven metni gösterilmez
              (plan henüz hesaplanmadı) — rozetin kendisi yine koşulsuz görünür. */}
          <AiBadge confidence={loading ? null : resolvedConfidence} />
        </div>
        {!loading && totalNote ? <p className={styles.totalNote}>{totalNote}</p> : null}
        {/* aria-live bölgesi HER ZAMAN mount edilir — sonradan mount edilen canlı
            bölgeler ekran okuyucu tarafından duyurulmaz (bkz. Dalga kontratı,
            GlassInfiniteList ile aynı desen). `loading` biterken de açık bir
            "tamamlandı/hazır" mesajı yayınlanır — metni boşaltmak durum
            geçişini güvenilir duyurmaz. */}
        <span role="status" className={styles.srOnly}>
          {loading ? 'Tur planı hazırlanıyor' : stops.length > 0 ? 'Tur planı hazır' : 'Tur planında durak yok'}
        </span>
      </header>

      {loading ? (
        <SkeletonRoute />
      ) : stops.length === 0 ? (
        <p className={styles.emptyState}>{EMPTY_STOPS_TEXT}</p>
      ) : (
        <ol className={styles.route} role="list" aria-label={`${date} tur planı durakları`}>
          {stops.map((stop, i) => {
            const isLast = i === stops.length - 1
            const showTravelNote = i > 0 && Boolean(stop.travelNote)
            return (
              <li key={stop.id} role="listitem" className={styles.stopItem}>
                <div className={styles.row}>
                  <span className={styles.railCol} aria-hidden="true">
                    <span className={styles.badge}>{i + 1}</span>
                    {!isLast ? <span className={styles.connector} /> : null}
                  </span>
                  <div className={styles.content}>
                    {showTravelNote ? (
                      <p className={styles.travelNote}>
                        <span aria-hidden="true">↳ </span>
                        {stop.travelNote}
                      </p>
                    ) : null}
                    <div className={styles.stopCard}>
                      {stop.image ? <img className={styles.stopImage} src={stop.image} alt="" /> : null}
                      <div className={styles.stopBody}>
                        <div className={styles.stopMeta}>
                          <span className={styles.stopTime}>{stop.time}</span>
                          {stop.duration ? <span className={styles.stopDuration}>{stop.duration}</span> : null}
                        </div>
                        <p className={styles.stopTitle}>{stop.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <div className={styles.footer}>
        {showFeedback ? (
          <div className={styles.feedback}>
            <span id={feedbackPromptId} className={styles.feedbackPrompt}>
              Bu plan faydalı mıydı?
            </span>
            <div className={styles.feedbackButtons} role="group" aria-labelledby={feedbackPromptId}>
              <button
                type="button"
                className={styles.feedbackButton}
                aria-label="Faydalı"
                aria-pressed={feedback === 'up'}
                data-selected={feedback === 'up' || undefined}
                onClick={() => handleFeedback('up')}
              >
                👍
              </button>
              <button
                type="button"
                className={styles.feedbackButton}
                aria-label="Faydalı değil"
                aria-pressed={feedback === 'down'}
                data-selected={feedback === 'down' || undefined}
                onClick={() => handleFeedback('down')}
              >
                👎
              </button>
            </div>
          </div>
        ) : null}
        <button type="button" className={styles.confirmButton} disabled={confirmDisabled} onClick={handleConfirm}>
          Planı Onayla
        </button>
      </div>
    </section>
  )
}
