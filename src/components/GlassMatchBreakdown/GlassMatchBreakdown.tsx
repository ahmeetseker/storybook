// GlassMatchBreakdown — MatchScore'un derin ekranı: genel uyum skorunun grup
// grup (konum, bütçe, oda sayısı...) dökümü. AI-first component: içerik
// katmanı FLAT (cam yok). Kendi bar'larını çizer (GlassScoreMeter'dan
// bilinçli olarak İTHAL EDİLMEZ — bkz. rules.md §1, GlassMatchScore ile aynı
// bağımsızlık kararı).
import { useId, useRef, useState, type HTMLAttributes } from 'react'
import styles from './GlassMatchBreakdown.module.css'

/** Bir grubu oluşturan tek bir detay kriterinin eşleşme durumu. */
export interface GlassMatchBreakdownDetail {
  /** Detay adı — kısa tutulmalı, chip tek satırda kalır */
  label: string
  /** true → ✓ (success ton), false → ✕ (soluk/nötr) */
  matched: boolean
}

/** Eşik tonu — GlassScoreMeter/GlassMatchScore ile aynı isimlendirme. */
export type GlassMatchBreakdownTone = 'success' | 'accent' | 'danger'

/** Uyum dökümündeki tek bir grup (ör. "Konum tercihlerin"). */
export interface GlassMatchBreakdownGroup {
  /** Kararlı kimlik — yalnız React `key` için kullanılır, DOM `id`'sine yazılmaz */
  id: string
  /** Grup başlığı */
  label: string
  /** 0-100 arası grup skoru; aralık dışı/`NaN`/`Infinity` değerler sessizce normalize edilir */
  score: number
  /** Genel skordaki ağırlığı — görünür etiket metni, ör. `"%30"` */
  weight?: string
  /** Grubu oluşturan eşleşen (✓) / eşleşmeyen (✕) detay chip'leri */
  details?: GlassMatchBreakdownDetail[]
}

export interface GlassMatchBreakdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 0-100 arası genel uyum skoru; aralık dışı/`NaN`/`Infinity` değerler sessizce normalize edilir */
  overall: number
  /** Uyum dökümünü oluşturan grup listesi (ör. konum, bütçe, oda sayısı) */
  groups: GlassMatchBreakdownGroup[]
  /** Kart başlığı */
  title?: string
  /**
   * AI-first standardı: verilirse "✦ AI" rozetinin yanında "%N güven" metni
   * görünür etiket olarak eklenir. 0-100 dışına clamp edilir; sonlu değilse
   * (`NaN`/`Infinity`) hiç render edilmez (rozet yine görünür kalır).
   */
  confidence?: number
  /**
   * Verilirse dökümün altında 👍/👎 geri bildirim butonları görünür
   * (accessible name "Faydalı"/"Faydalı değil"). Tıklanan yön görsel olarak
   * seçili işaretlenir (`aria-pressed`) — component kendi geri bildirimini
   * sunucuya göndermez, yalnız çağıranı bilgilendirir.
   */
  onFeedback?: (value: 'up' | 'down') => void
  /**
   * true olduğunda genel skor satırı ve grup listesi yerine soluk,
   * animasyonsuz-kapatılabilir bir placeholder gösterilir (kendi flat
   * skeleton'u — `GlassSkeleton`'a bağımlı değil). Durum metni, mount
   * anından itibaren DOM'da bulunan tek bir `role="status"` düğümünün
   * içeriği değiştirilerek duyurulur (sonradan mount edilen bir canlı bölge
   * bazı ekranokuyucularda hiç duyurulmaz).
   */
  loading?: boolean
}

function clampScore(value: number): number {
  const safe = Number.isFinite(value) ? value : 0
  return Math.round(Math.min(Math.max(safe, 0), 100))
}

function resolveTone(value: number): GlassMatchBreakdownTone {
  if (value >= 70) return 'success'
  if (value >= 40) return 'accent'
  return 'danger'
}

/** `confidence` prop'unu normalize eder: sonlu değilse `null` (rozet metni gizlenir). */
function resolveConfidence(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.round(Math.min(Math.max(value, 0), 100))
}

const TONE_VAR: Record<GlassMatchBreakdownTone, string> = {
  success: 'var(--lg-success)',
  accent: 'var(--lg-accent)',
  danger: 'var(--lg-danger)',
}

/**
 * AI-first içerik rozeti — Dalga kontratının "AI-first standardı" bölümünden
 * birebir kopya CSS (GlassMatchScore/GlassAiSummaryCard ile aynı — kopya
 * kasıtlı, component'ler birbirinden bağımsız kalır).
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

/** Dekoratif dolum çubuğu — değer zaten kapsayan `role="meter"` üzerinde. */
function ScoreBar({ value, tone }: { value: number; tone: GlassMatchBreakdownTone }) {
  return (
    <span className={styles.barTrack} aria-hidden="true">
      <span className={styles.barFill} style={{ width: `${value}%`, background: TONE_VAR[tone] }} />
    </span>
  )
}

/**
 * Uyum skoru dökümü — `GlassMatchScore`'un derin ekranı. Genel skoru mini bir
 * bar'la, ardından her bir grubu (konum, bütçe, oda sayısı...) kendi skor
 * bar'ı + opsiyonel ağırlık etiketi + opsiyonel eşleşen/eşleşmeyen detay
 * chip'leriyle listeler. AI-first component: zorunlu "✦ AI" rozeti, opsiyonel
 * güven metni, 👍/👎 geri bildirim ve flat `loading` placeholder'ı taşır.
 * İçerik katmanı FLAT — cam yüzey/backdrop-filter kullanılmaz.
 */
export function GlassMatchBreakdown({
  overall,
  groups,
  title = 'Uyum Dökümü',
  confidence,
  onFeedback,
  loading = false,
  className,
  ...rest
}: GlassMatchBreakdownProps) {
  const uid = useId()
  const overallLabelId = `${uid}-overall-label`

  const [feedback, setFeedback] = useState<'up' | 'down' | undefined>(undefined)

  const clampedOverall = clampScore(overall)
  const overallTone = resolveTone(clampedOverall)
  const resolvedConfidence = resolveConfidence(confidence)
  const safeGroups = groups ?? []

  // İçerik imzası (GlassMatchScore'daki desenin aynısı): `overall`/`groups`
  // GERÇEKTEN değiştiğinde (ör. kullanıcı farklı bir ilana geçti) önceki
  // geri bildirim seçimi render sırasında (ekstra effect turu olmadan)
  // sıfırlanır. Referans değil İÇERİK eşitliği kontrol edilir.
  const contentSignature = JSON.stringify({
    overall: clampedOverall,
    groups: safeGroups.map((g) => [g.id, clampScore(g.score), g.weight ?? null, g.details?.map((d) => [d.label, d.matched]) ?? null]),
  })
  const prevContentSignatureRef = useRef(contentSignature)
  if (prevContentSignatureRef.current !== contentSignature) {
    prevContentSignatureRef.current = contentSignature
    if (feedback !== undefined) {
      setFeedback(undefined)
    }
  }

  const showGroups = !loading && safeGroups.length > 0
  const showFeedback = !loading && Boolean(onFeedback)
  const statusText = loading ? `${title} hesaplanıyor` : ''

  const classes = [styles.root, className].filter(Boolean).join(' ')

  const handleFeedback = (direction: 'up' | 'down') => {
    // Aynı yöne tekrar tıklama seçimi geri alır (toggle); farklı yöne
    // tıklama karşılıklı dışlayarak seçimi değiştirir. `onFeedback` her
    // tıklamada — toggle-off dahil — tıklanan yönle çağrılır.
    setFeedback((prev) => (prev === direction ? undefined : direction))
    onFeedback?.(direction)
  }

  return (
    <div className={classes} data-loading={loading || undefined} {...rest}>
      <div className={styles.header}>
        {loading ? (
          <span className={[styles.skeletonLine, styles.skeletonTitle].join(' ')} aria-hidden="true" />
        ) : (
          <span className={styles.title}>{title}</span>
        )}
        <AiBadge confidence={loading ? null : resolvedConfidence} />
      </div>

      {loading ? (
        <div className={styles.skeletonBlock} aria-hidden="true">
          <span className={[styles.skeletonLine, styles.skeletonOverall].join(' ')} />
          <span className={[styles.skeletonLine, styles.skeletonGroup].join(' ')} />
          <span className={[styles.skeletonLine, styles.skeletonGroup].join(' ')} />
          <span className={[styles.skeletonLine, styles.skeletonGroup].join(' ')} />
        </div>
      ) : (
        <>
          <div
            role="meter"
            aria-labelledby={overallLabelId}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedOverall}
            data-tone={overallTone}
            className={styles.overall}
          >
            <div className={styles.overallHead}>
              <span id={overallLabelId} className={styles.overallLabel}>
                Genel Uyum
              </span>
              <span className={styles.overallScore} aria-hidden="true">
                {clampedOverall}
              </span>
            </div>
            <ScoreBar value={clampedOverall} tone={overallTone} />
          </div>

          {showGroups ? (
            <ul className={styles.groups}>
              {safeGroups.map((group, index) => {
                const groupScore = clampScore(group.score)
                const groupTone = resolveTone(groupScore)
                // Ham veri `group.id`'si DOM id'sine yazılmaz (kararsız/
                // çakışabilir olabilir) — id/etiket her zaman useId + index
                // ile türetilir; `group.id` yalnız React `key` için kullanılır.
                const groupLabelId = `${uid}-group-${index}-label`
                const weightId = group.weight ? `${uid}-group-${index}-weight` : undefined
                const details = group.details ?? []

                return (
                  <li key={group.id} className={styles.group}>
                    <div
                      role="meter"
                      aria-labelledby={weightId ? `${groupLabelId} ${weightId}` : groupLabelId}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={groupScore}
                      data-tone={groupTone}
                      className={styles.groupMeter}
                    >
                      <div className={styles.groupHead}>
                        <span className={styles.groupLabelRow}>
                          <span id={groupLabelId} className={styles.groupLabel}>
                            {group.label}
                          </span>
                          {weightId ? (
                            <span id={weightId} className={styles.weight}>
                              Ağırlık {group.weight}
                            </span>
                          ) : null}
                        </span>
                        <span className={styles.groupScore} aria-hidden="true">
                          {groupScore}
                        </span>
                      </div>
                      <ScoreBar value={groupScore} tone={groupTone} />
                    </div>

                    {details.length > 0 ? (
                      <ul className={styles.details}>
                        {details.map((detail, detailIndex) => (
                          <li
                            key={`${group.id}-${detailIndex}-${detail.label}`}
                            className={styles.detail}
                            data-matched={detail.matched}
                          >
                            <span className={styles.detailIcon} aria-hidden="true">
                              {detail.matched ? '✓' : '✕'}
                            </span>
                            <span className={styles.detailLabel}>
                              {detail.label}
                              {/* İkon dekoratif (aria-hidden); eşleşme durumu
                                  AT'ye bu görsel-gizli metinle iletilir. */}
                              <span className={styles.srOnly}> {detail.matched ? '(eşleşti)' : '(eşleşmedi)'}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : null}

          {showFeedback ? (
            <div className={styles.feedback}>
              <span className={styles.feedbackPrompt}>Bu döküm faydalı mıydı?</span>
              <div className={styles.feedbackButtons}>
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
        </>
      )}

      {/* Tek duyuru noktası — durum ne olursa olsun mount edilmiş kalır,
          yalnız metin içeriği değişir (sonradan DOM'a eklenen bir canlı
          bölge bazı ekranokuyucularda hiç duyurulmaz). Boşken AT'ye hiçbir
          şey okutmaz. */}
      <span className={styles.srOnly} role="status">
        {statusText}
      </span>
    </div>
  )
}
