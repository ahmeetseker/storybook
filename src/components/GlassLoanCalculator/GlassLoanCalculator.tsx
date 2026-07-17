// GlassLoanCalculator — konut kredisi hesaplayıcı. Gerçek anüite matematiği kullanır:
//   taksit = P·r·(1+r)^n / ((1+r)^n − 1)   (r=0 iken taksit = P/n)
// P: kredi tutarı (fiyat − peşinat), r: aylık faiz oranı (ondalık), n: ay sayısı.
// variant='full': fiyat/peşinat/vade/faiz girişleri + tam döküm + anapara-faiz oranı çubuğu.
// variant='compact': yalnız aylık taksit + CTA satırı — GlassSheet/GlassModal içine gömülmeye uygun.
// Flat içerik yüzeyi (kart cam değildir); iç kontroller (GlassInput/GlassSlider/GlassButton)
// kendi kontrol-katmanı camlarını korur.
import { useEffect, useId, useMemo, useState, type HTMLAttributes } from 'react'
import { GlassInput } from '../GlassInput'
import { GlassSlider } from '../GlassSlider'
import { GlassButton } from '../GlassButton'
import styles from './GlassLoanCalculator.module.css'

/** Hesaplama sonucunun tam dökümü — `onChange` ile dışarı verilir. */
export interface GlassLoanCalculatorResult {
  /** Konut fiyatı (TL) */
  price: number
  /** Peşinat yüzdesi (0-90) */
  downPaymentPercent: number
  /** Peşinat tutarı (TL) */
  downPaymentAmount: number
  /** Kredi tutarı — fiyat − peşinat (TL) */
  loanAmount: number
  /** Vade (yıl) */
  termYears: number
  /** Vade (ay) — termYears × 12 */
  termMonths: number
  /** Aylık faiz oranı yüzdesi */
  monthlyRatePercent: number
  /** Aylık taksit (TL) — anüite formülü */
  monthlyPayment: number
  /** Toplam ödeme — aylık taksit × ay sayısı (TL) */
  totalPayment: number
  /** Toplam faiz — toplam ödeme − kredi tutarı (TL) */
  totalInterest: number
}

export interface GlassLoanCalculatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'title'> {
  /** 'full': tüm giriş + döküm · 'compact': yalnız taksit + CTA satırı */
  variant?: 'full' | 'compact'
  /** Kart başlığı (yalnız `variant="full"` içinde görünür) */
  title?: string
  /** Başlangıç konut fiyatı (TL) — kontrolsüz, iç state'te tutulur */
  defaultPrice?: number
  /** Başlangıç peşinat yüzdesi (0-90) */
  defaultDownPaymentPercent?: number
  /** Başlangıç vade (yıl, 1-10) */
  defaultTermYears?: number
  /** Başlangıç aylık faiz oranı yüzdesi */
  defaultMonthlyRatePercent?: number
  /** CTA buton etiketi */
  ctaLabel?: string
  /** CTA butonuna tıklanınca çalışır */
  onCtaClick?: () => void
  /** Hesap her değiştiğinde (mount dahil) güncel sonuçla çalışır */
  onChange?: (result: GlassLoanCalculatorResult) => void
}

const formatTL = (n: number) => `${Math.round(n).toLocaleString('tr-TR')} TL`
// Kullanıcının yazdığı her karakterden yalnız rakamları alır; ayraçlar (nokta) görünüm katmanında yeniden üretilir.
const parseDigits = (raw: string) => Number(raw.replace(/[^0-9]/g, '')) || 0
const formatDigits = (n: number) => (n > 0 ? n.toLocaleString('tr-TR') : '')

const MIN_RATE_PERCENT = 0.01
const MAX_RATE_PERCENT = 10

// Faiz girişini yalnız rakam + TEK ondalık ayraçla (virgül/nokta, virgüle normalize edilir)
// sınırlar; eksi işareti, "e" gibi başka her karakter burada elenir. Bu sayede ekranda
// görünen metin HER ZAMAN kendi üzerinden birebir parse edilebilir — "-2" yazıp +2
// hesaplanması ya da "1e2" yazıp 12 hesaplanması gibi görünen/hesaplanan sapması oluşamaz.
const sanitizeRateText = (raw: string): string => {
  let seenSeparator = false
  let out = ''
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      out += ch
    } else if ((ch === ',' || ch === '.') && !seenSeparator) {
      seenSeparator = true
      out += ','
    }
  }
  return out
}

// sanitizeRateText çıktısı zaten yalnız rakam + tek virgül içerir; bu yüzden burada
// negatif/bilimsel-gösterim/NaN riski hiç yoktur.
const parseRateText = (text: string): number => {
  if (text === '' || text === ',') return 0
  return Number(text.replace(',', '.'))
}

// 0, "henüz faiz girilmedi / kampanyalı sıfır faiz" için bilinçli olarak sınır dışı
// bırakılır (bkz. calculateLoan r=0 dalı); 0 < n < MIN olan değerler MIN'e, MAX üstü
// değerler MAX'e kıskaçlanır.
const clampRatePercent = (n: number): number => {
  if (n <= 0) return 0
  return Math.min(MAX_RATE_PERCENT, Math.max(MIN_RATE_PERCENT, n))
}

const formatRateText = (n: number): string => {
  const rounded = Math.round(n * 100) / 100
  return String(rounded).replace('.', ',')
}

function calculateLoan(
  price: number,
  downPaymentPercent: number,
  termYears: number,
  monthlyRatePercent: number,
): GlassLoanCalculatorResult {
  const safePrice = Math.max(0, price)
  const downPaymentAmount = Math.round(safePrice * (downPaymentPercent / 100))
  const loanAmount = Math.max(0, safePrice - downPaymentAmount)
  const termMonths = Math.max(1, Math.round(termYears * 12))
  const r = Math.max(0, monthlyRatePercent) / 100

  let monthlyPayment: number
  if (loanAmount <= 0) {
    monthlyPayment = 0
  } else if (r === 0) {
    monthlyPayment = loanAmount / termMonths
  } else {
    const factor = (1 + r) ** termMonths
    monthlyPayment = (loanAmount * r * factor) / (factor - 1)
  }

  const totalPayment = monthlyPayment * termMonths
  const totalInterest = Math.max(0, totalPayment - loanAmount)

  return {
    price: safePrice,
    downPaymentPercent,
    downPaymentAmount,
    loanAmount,
    termYears,
    termMonths,
    monthlyRatePercent,
    monthlyPayment,
    totalPayment,
    totalInterest,
  }
}

export function GlassLoanCalculator({
  variant = 'full',
  title = 'Konut Kredisi Hesaplama',
  defaultPrice = 4250000,
  defaultDownPaymentPercent = 20,
  defaultTermYears = 10,
  defaultMonthlyRatePercent = 2.79,
  ctaLabel = 'Kredi Başvurusu Yap',
  onCtaClick,
  onChange,
  className,
  ...rest
}: GlassLoanCalculatorProps) {
  const [price, setPrice] = useState(defaultPrice)
  const [downPaymentPercent, setDownPaymentPercent] = useState(defaultDownPaymentPercent)
  const [termYears, setTermYears] = useState(defaultTermYears)
  const [monthlyRatePercent, setMonthlyRatePercent] = useState(defaultMonthlyRatePercent)
  // Faiz girişi ayrı ham metin olarak tutulur: kullanıcı "2," yazarken sayıya çevrilip
  // geri basılmasın (virgül kaybolmasın) diye görünen metin state'i sayısal state'ten bağımsızdır.
  const [rateText, setRateText] = useState(() => String(defaultMonthlyRatePercent).replace('.', ','))

  const headingId = useId()
  const priceId = useId()
  const rateId = useId()

  const result = useMemo(
    () => calculateLoan(price, downPaymentPercent, termYears, monthlyRatePercent),
    [price, downPaymentPercent, termYears, monthlyRatePercent],
  )

  useEffect(() => {
    onChange?.(result)
    // onChange bilinçli dışarıda: her render'da yeni referans onChange'in tekrar
    // tetiklenmesine yol açmasın — yalnız hesap sonucu değişince çalışır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const handlePriceChange = (raw: string) => setPrice(parseDigits(raw))

  const handleRateChange = (raw: string) => {
    // Sanitize edilmiş metin hem ekranda görünür hem parse edilir — iki farklı kaynak yok,
    // bu yüzden görünen ve hesaplanan değer her karakterde birebir aynı sayıyı temsil eder.
    const sanitized = sanitizeRateText(raw)
    setRateText(sanitized)
    setMonthlyRatePercent(parseRateText(sanitized))
  }

  // Alan odağı kaybedince değeri geçerli aralığa (0.01-10) kıskaçlar; hem görünen metni hem
  // hesaplanan sayıyı birlikte günceller — böylece ikisi arasında asla sapma kalmaz.
  const handleRateBlur = () => {
    if (rateText === '' || rateText === ',') return
    const clamped = clampRatePercent(parseRateText(rateText))
    setMonthlyRatePercent(clamped)
    setRateText(formatRateText(clamped))
  }

  const principalPct = result.totalPayment > 0 ? (result.loanAmount / result.totalPayment) * 100 : 100
  const interestPctRounded = 100 - Math.round(principalPct)
  const principalPctRounded = 100 - interestPctRounded

  const classes = [styles.card, variant === 'compact' ? styles.compact : '', className].filter(Boolean).join(' ')

  return (
    <section className={classes} aria-labelledby={variant === 'full' ? headingId : undefined} {...rest}>
      {variant === 'full' ? (
        <>
          <h3 id={headingId} className={styles.title}>
            {title}
          </h3>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={priceId}>
              Konut Fiyatı
            </label>
            <GlassInput
              id={priceId}
              inputMode="numeric"
              value={formatDigits(price)}
              onChange={(e) => handlePriceChange(e.target.value)}
              suffix="TL"
              placeholder="0"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <span className={styles.fieldLabel}>Peşinat</span>
              <span className={styles.fieldValue}>
                %{downPaymentPercent} · {formatTL(result.downPaymentAmount)}
              </span>
            </div>
            <GlassSlider
              min={0}
              max={90}
              step={1}
              value={downPaymentPercent}
              onChange={setDownPaymentPercent}
              label="Peşinat yüzdesi"
              showValue
              formatValue={(v) => `%${v}`}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <span className={styles.fieldLabel}>Vade</span>
              <span className={styles.fieldValue}>
                {termYears} yıl · {result.termMonths} ay
              </span>
            </div>
            <GlassSlider
              min={1}
              max={10}
              step={1}
              value={termYears}
              onChange={setTermYears}
              label="Vade — yıl"
              showValue
              formatValue={(v) => `${v} yıl`}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={rateId}>
              Aylık Faiz Oranı
            </label>
            <GlassInput
              id={rateId}
              inputMode="decimal"
              value={rateText}
              onChange={(e) => handleRateChange(e.target.value)}
              onBlur={handleRateBlur}
              suffix="%"
              placeholder="0"
            />
          </div>

          <dl className={styles.breakdown}>
            <div className={styles.row}>
              <dt className={styles.rowLabel}>Kredi Tutarı</dt>
              <dd className={styles.rowValue}>{formatTL(result.loanAmount)}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.rowLabel}>Toplam Ödeme</dt>
              <dd className={styles.rowValue}>{formatTL(result.totalPayment)}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.rowLabel}>Toplam Faiz</dt>
              <dd className={styles.rowValue}>{formatTL(result.totalInterest)}</dd>
            </div>
          </dl>

          <div className={styles.ratioBlock}>
            <div
              className={styles.ratioBar}
              role="img"
              aria-label={`Kredi tutarının %${principalPctRounded}'i anapara, %${interestPctRounded}'i faiz`}
            >
              <span className={styles.ratioPrincipal} style={{ width: `${principalPct}%` }} />
              <span className={styles.ratioInterest} style={{ width: `${100 - principalPct}%` }} />
            </div>
            <div className={styles.ratioLegend} aria-hidden="true">
              <span className={styles.legendItem}>
                <span className={styles.legendDotPrincipal} />
                Anapara %{principalPctRounded}
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDotInterest} />
                Faiz %{interestPctRounded}
              </span>
            </div>
          </div>
        </>
      ) : null}

      <div className={styles.paymentBlock}>
        <span className={styles.paymentLabel}>Aylık Taksit</span>
        <span className={styles.paymentValue}>{formatTL(result.monthlyPayment)}</span>
        {variant === 'compact' ? (
          <span className={styles.paymentMeta}>
            {formatTL(result.price)} · {termYears} yıl vade · %{downPaymentPercent} peşinat
          </span>
        ) : null}
      </div>

      <GlassButton type="button" size="lg" prominent className={styles.cta} onClick={onCtaClick}>
        {ctaLabel}
      </GlassButton>
    </section>
  )
}
