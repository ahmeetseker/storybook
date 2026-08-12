// GlassPriceRange — dağılım histogramının üstünde çift kollu aralık seçici.
//
// Neden ayrı bir component: GlassSlider TEK kolludur (bir değer), ondan aralık
// türetilemez; GlassDistributionChart ise girdi değil OKUMA yüzeyidir (medyan
// bandını vurgular, persentil şeridi taşır). Buradaki histogram girdinin
// parçasıdır: seçili banda düşen sütunlar vurgulanır, kullanıcı aralığı
// seçmeden ÖNCE yoğunluğun nerede olduğunu görür (bkz. rules.md §1).
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import styles from './GlassPriceRange.module.css'

/** `[enDüşük, enYüksek]` — her zaman artan sırada normalize edilir */
export type GlassPriceRangeValue = [number, number]

export interface GlassPriceRangeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Alan alt sınırı (skalanın sol ucu) */
  min: number
  /** Alan üst sınırı (skalanın sağ ucu) */
  max: number
  /** Artış adımı; klavye ve sürükleme bu adıma yuvarlar */
  step?: number
  /** Controlled değer */
  value?: GlassPriceRangeValue
  /** Uncontrolled başlangıç değeri (varsayılan: tüm alan) */
  defaultValue?: GlassPriceRangeValue
  onChange?: (value: GlassPriceRangeValue) => void
  /** Görünen başlık; iki kolun erişilebilir adı da bundan türer */
  label?: string
  /** Başlığın sağındaki ikincil not — ör. "Ortalama 1.200 ₺" */
  hint?: ReactNode
  /** Histogram sütunları: soldan sağa eşit genişlikte bantların gözlem sayısı */
  bins?: number[]
  /** Gözlem birimi — dağılımın erişilebilir özetinde geçer */
  countLabel?: string
  /** Değer biçimlendirici (pil, sınır etiketi, `aria-valuetext`) */
  formatValue?: (value: number) => string
  /** İki kol arasındaki en küçük mesafe; varsayılan `step` */
  minGap?: number
  /**
   * Seçili sütunların ve ray dolgusunun rengi; verilmezse `--lg-accent`.
   * Nötr/ink vurgu isteyen yüzeylerde `var(--lg-label)` geçilir.
   */
  tint?: string
  disabled?: boolean
}

/** Pil çakışma eşiği: kollar arası mesafe bu yüzdenin altındaysa tek pile birleşir */
const MERGE_THRESHOLD = 18
/** Pil bu kadar yaklaşınca alan sınırı etiketi söner (bilgi pilde zaten var) */
const EDGE_THRESHOLD = 12
/**
 * İki pil arasında bırakılan en küçük nefes payı (px). Ölçüm konumu kolun
 * uçlardaki telafisini (bkz. CSS `--pos-*`) hesaba katmadığı için birkaç
 * piksel şaşabilir; pay o hatayı da yutacak kadar geniştir.
 */
const PILL_GAP = 12

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * Ölçüm öncesi rakamları eşitler. Piller `tabular-nums` ile çizilir (her rakam
 * aynı genişlikte), canvas ise bu ayarı bilmez: "25.100.000" ile "25.150.000"
 * farklı ölçülür ve birleşme kararı komşu adımlar arasında zıplardı.
 */
const normalizeDigits = (s: string) => s.replace(/\d/g, '0')

const defaultFormat = (v: number) => v.toLocaleString('tr-TR')

/**
 * Dağılım histogramlı fiyat/aralık seçici — iki native `range` kolu, kolları
 * izleyen değer pilleri ve seçili bandı vurgulayan sütunlar.
 * İçerik katmanıdır: kendi cam yüzeyini kurmaz.
 */
export function GlassPriceRange({
  min,
  max,
  step = 1,
  value,
  defaultValue,
  onChange,
  label,
  hint,
  bins,
  countLabel = 'ilan',
  formatValue = defaultFormat,
  minGap,
  tint,
  disabled = false,
  className,
  style,
  ...rest
}: GlassPriceRangeProps) {
  const rawId = useId()
  const labelId = `pr-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const [inner, setInner] = useState<GlassPriceRangeValue>(defaultValue ?? [min, max])

  // Sıvı basış (Apple liquid glass): sürüklenen kolun thumb'ı cama dönüp büyür.
  // Native range pointer'ı örtük yakalar — bırakış nerede olursa olsun pointerup
  // aynı input'a düşer, ayrıca pencere dinleyicisi gerekmez.
  const [activeHandle, setActiveHandle] = useState<0 | 1 | null>(null)

  const span = max - min
  const gap = minGap ?? step
  const raw = value ?? inner
  // Normalizasyon: sıra bozuksa düzelt, alan dışına taşarsa kıstır.
  const current: GlassPriceRangeValue = [
    clamp(Math.min(raw[0], raw[1]), min, max),
    clamp(Math.max(raw[0], raw[1]), min, max),
  ]

  const snap = (v: number) => (step > 0 ? min + Math.round((v - min) / step) * step : v)

  const commit = (handle: 0 | 1, next: number) => {
    if (disabled) return
    const snapped = clamp(snap(next), min, max)
    const nextValue: GlassPriceRangeValue =
      handle === 0
        ? [clamp(Math.min(snapped, current[1] - gap), min, max), current[1]]
        : [current[0], clamp(Math.max(snapped, current[0] + gap), min, max)]
    if (nextValue[0] === current[0] && nextValue[1] === current[1]) return
    if (value === undefined) setInner(nextValue)
    onChange?.(nextValue)
  }

  const handleChange = (handle: 0 | 1) => (e: ChangeEvent<HTMLInputElement>) =>
    commit(handle, Number(e.target.value))

  // Klavyeyi manuel yönetiyoruz (GlassSlider ile aynı gerekçe): native range
  // davranışının birebir kopyası, ama her ortamda (jsdom dahil) deterministik
  // ve `step`e sadık.
  const handleKeyDown = (handle: 0 | 1) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    const from = current[handle]
    let next: number | undefined
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = from + step
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = from - step
    else if (e.key === 'Home') next = min
    else if (e.key === 'End') next = max
    else if (e.key === 'PageUp') next = from + step * 10
    else if (e.key === 'PageDown') next = from - step * 10
    if (next === undefined) return
    e.preventDefault()
    commit(handle, next)
  }

  const pctOf = (v: number) => (span > 0 ? ((v - min) / span) * 100 : 0)
  const pctMin = pctOf(current[0])
  const pctMax = pctOf(current[1])
  const textMin = formatValue(current[0])
  const textMax = formatValue(current[1])

  // Piller yalnız yüzde mesafesine bakarak birleştirilemez: metin uzunluğunu
  // CSS bilmez — "3.750.000 ₺" ile "850 ₺" aynı yüzdede çok farklı yer kaplar.
  // Genişlik canvas'ta ölçülür: DOM'a görünmez bir metin kopyası eklemez (ekran
  // okuyucu ve testler için ikinci bir "850 ₺" düğümü doğmaz) ve ölçüm birleşme
  // kararından bağımsız olduğu için "birleş → yer açıldı → ayrıl → çakıştı"
  // salınımı oluşamaz.
  const scaleRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<CanvasRenderingContext2D | null | undefined>(undefined)
  const [tooTight, setTooTight] = useState(false)

  useLayoutEffect(() => {
    const scale = scaleRef.current
    if (!scale) return

    const compute = () => {
      const width = scale.clientWidth
      const pill = scale.querySelector('[data-part="pill"]')
      // Yerleşim yoksa (jsdom, gizli kap) yüzde kuralı tek başına karar verir —
      // ölçüm yüzeyi de bu yüzden ancak gerçek yerleşim varken kurulur.
      if (!width || !pill) {
        setTooTight(false)
        return
      }
      if (canvasRef.current === undefined) {
        canvasRef.current = document.createElement('canvas').getContext('2d')
      }
      const ctx = canvasRef.current
      if (!ctx) {
        setTooTight(false)
        return
      }
      const cs = getComputedStyle(pill)
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const padding = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const lowW = ctx.measureText(normalizeDigits(textMin)).width + padding
      const highW = ctx.measureText(normalizeDigits(textMax)).width + padding
      // Pil konumu kendi genişliğiyle kıstırılır (CSS: translateX(-pct%)).
      const lowLeft = ((width - lowW) * pctMin) / 100
      const highLeft = ((width - highW) * pctMax) / 100
      setTooTight(lowLeft + lowW + PILL_GAP > highLeft)
    }

    compute()
    document.fonts?.ready.then(compute, () => {})
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(compute)
    observer.observe(scale)
    return () => observer.disconnect()
  }, [pctMin, pctMax, textMin, textMax])

  const merged = pctMax - pctMin < MERGE_THRESHOLD || tooTight

  // Histogram: bantlar alanı eşit böler, seçimle KESİŞEN bant vurgulanır.
  const binList = bins ?? []
  const binMax = binList.length > 0 ? Math.max(...binList) : 0
  const binWidth = binList.length > 0 ? span / binList.length : 0
  const isBinActive = (i: number) => {
    const start = min + i * binWidth
    return start + binWidth > current[0] && start < current[1]
  }
  const selectedCount = binList.reduce((sum, count, i) => (isBinActive(i) ? sum + count : sum), 0)
  const totalCount = binList.reduce((sum, count) => sum + count, 0)

  const baseName = label ?? 'Aralık'
  const cssVars = {
    '--pct-min': pctMin,
    '--pct-max': pctMax,
    ...(tint ? { '--price-accent': tint } : null),
  } as CSSProperties

  const classes = [styles.root, disabled ? styles.disabled : '', className].filter(Boolean).join(' ')

  const handlePointerDown = (handle: 0 | 1) => () => {
    if (!disabled) setActiveHandle(handle)
  }
  const releaseHandle = () => setActiveHandle(null)

  const rangeInput = (handle: 0 | 1) => (
    <input
      type="range"
      className={styles.input}
      data-handle={handle === 0 ? 'min' : 'max'}
      min={min}
      max={max}
      step={step}
      value={current[handle]}
      onChange={handleChange(handle)}
      onKeyDown={handleKeyDown(handle)}
      onPointerDown={handlePointerDown(handle)}
      onPointerUp={releaseHandle}
      onPointerCancel={releaseHandle}
      disabled={disabled}
      aria-label={`${baseName}: ${handle === 0 ? 'en düşük' : 'en yüksek'}`}
      aria-valuetext={formatValue(current[handle])}
    />
  )

  return (
    <div
      {...rest}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      className={classes}
      style={{ ...cssVars, ...style }}
    >
      {label || hint ? (
        <div className={styles.head}>
          {label ? (
            <span className={styles.label} id={labelId}>
              {label}
            </span>
          ) : null}
          {hint ? <span className={styles.hint}>{hint}</span> : null}
        </div>
      ) : null}

      {binList.length > 0 ? (
        // Sütunlar dekoratif: taşıdıkları bilgi hemen altındaki sr-only özette
        // ve kolların `aria-valuetext`inde zaten var.
        <div className={styles.plot} aria-hidden="true">
          {binList.map((count, i) => (
            <span
              key={i}
              className={styles.bin}
              data-part="bin"
              data-active={isBinActive(i) ? 'true' : undefined}
              style={{ '--bin-h': binMax > 0 ? (count / binMax) * 100 : 0 } as CSSProperties}
            />
          ))}
        </div>
      ) : null}

      {/* `data-front`: iki kol üst üste geldiğinde hangisinin yakalanabileceği.
          Üst kol sağ uca yapıştıysa artık sağa gidemez — o durumda sol kol öne
          alınır, yoksa aralık kilitlenirdi. */}
      <div className={styles.slider} data-front={current[1] >= max ? 'min' : 'max'}>
        <span className={styles.track} aria-hidden="true">
          <span className={styles.fill} />
        </span>
        {rangeInput(0)}
        {rangeInput(1)}
        <span className={styles.thumb} data-handle="min" data-liquid={activeHandle === 0 || undefined} aria-hidden="true" />
        <span className={styles.thumb} data-handle="max" data-liquid={activeHandle === 1 || undefined} aria-hidden="true" />
      </div>

      {/* Skala satırı ekran okuyucudan gizli: alan sınırları `aria-valuemin/max`,
          pil değerleri `aria-valuenow/valuetext` olarak kollarda zaten duyuluyor. */}
      <div className={styles.scale} ref={scaleRef} aria-hidden="true">
        <span className={styles.bound} data-dim={pctMin < EDGE_THRESHOLD ? 'true' : undefined}>
          {formatValue(min)}
        </span>
        <span className={styles.bound} data-dim={pctMax > 100 - EDGE_THRESHOLD ? 'true' : undefined}>
          {formatValue(max)}
        </span>
        {merged ? (
          // Kollar (ya da uzun değerler) yaklaşınca iki pil üst üste binerdi:
          // tek pile birleşir.
          <span
            className={styles.pill}
            data-part="pill"
            data-merged="true"
            style={{ '--pct': (pctMin + pctMax) / 2 } as CSSProperties}
          >
            {textMin} – {textMax}
          </span>
        ) : (
          <>
            <span
              className={styles.pill}
              data-part="pill"
              data-handle="min"
              style={{ '--pct': pctMin } as CSSProperties}
            >
              {textMin}
            </span>
            <span
              className={styles.pill}
              data-part="pill"
              data-handle="max"
              style={{ '--pct': pctMax } as CSSProperties}
            >
              {textMax}
            </span>
          </>
        )}
      </div>

      {binList.length > 0 ? (
        <p className={styles.srOnly}>
          Dağılım: seçili aralıkta {selectedCount.toLocaleString('tr-TR')} / {totalCount.toLocaleString('tr-TR')}{' '}
          {countLabel}.
        </p>
      ) : null}
    </div>
  )
}
