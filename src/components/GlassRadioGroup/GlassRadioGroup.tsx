import { useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassRadioGroup.module.css'

export interface GlassRadioOption {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export interface GlassRadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: GlassRadioOption[]
  /** Controlled seçili değer */
  value?: string
  /** Uncontrolled başlangıç değeri */
  defaultValue?: string
  onChange?: (value: string) => void
  /** Native radyo grubu adı; verilmezse otomatik üretilir */
  name?: string
  orientation?: 'vertical' | 'horizontal'
  size?: 'sm' | 'md'
  tone?: 'light' | 'dark' | 'auto'
  /** Grup etiketi → radiogroup aria-label */
  label?: string
}

export function GlassRadioGroup({
  options,
  value,
  defaultValue,
  onChange,
  name,
  orientation = 'vertical',
  size = 'md',
  tone = 'auto',
  label,
  className,
  onKeyDown,
  ...rest
}: GlassRadioGroupProps) {
  const autoId = useId()
  const groupName = name ?? `lg-radio-${autoId.replace(/[^a-zA-Z0-9-]/g, '')}`
  const rootRef = useRef<HTMLDivElement>(null)
  // Kontrollü/kontrolsüz kalıbı (GlassTabs ile aynı)
  const [inner, setInner] = useState(defaultValue)
  const current = value ?? inner

  const select = (v: string) => {
    if (value === undefined) setInner(v)
    onChange?.(v)
  }

  // Ok tuşları native radio davranışını izler: seçim focus'u takip eder, disabled atlanır,
  // uçlarda sarar. Manuel yönetiyoruz (preventDefault) ki davranış her ortamda deterministik olsun.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight'
    const backward = e.key === 'ArrowUp' || e.key === 'ArrowLeft'
    if (!forward && !backward) return
    const enabled = options.filter((o) => !o.disabled)
    if (enabled.length === 0) return
    e.preventDefault()
    const dir = forward ? 1 : -1
    const currentIndex = enabled.findIndex((o) => o.value === current)
    const nextIndex =
      currentIndex === -1 ? (forward ? 0 : enabled.length - 1) : (currentIndex + dir + enabled.length) % enabled.length
    const next = enabled[nextIndex]
    select(next.value)
    const inputs = rootRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    if (inputs) Array.from(inputs).find((i) => i.value === next.value)?.focus()
  }

  const classes = [styles.root, styles[orientation], styles[size], className].filter(Boolean).join(' ')

  return (
    <div ref={rootRef} role="radiogroup" aria-label={label} className={classes} onKeyDown={handleKeyDown} {...rest}>
      {options.map((opt) => {
        const selected = opt.value === current
        return (
          <label key={opt.value} className={[styles.option, opt.disabled ? styles.disabled : ''].filter(Boolean).join(' ')}>
            {/* Native input sr-only: rol, isim ve form değeri buradan gelir */}
            <input
              type="radio"
              className={styles.input}
              name={groupName}
              value={opt.value}
              checked={selected}
              disabled={opt.disabled}
              // savunma: gerçek tarayıcı disabled input'a event iletmez, jsdom iletebilir
              onChange={() => {
                if (!opt.disabled) select(opt.value)
              }}
            />
            <GlassSurface as="span" shape="capsule" tone={tone} thickness={0.2} className={styles.circle} aria-hidden>
              <span className={styles.dot} />
            </GlassSurface>
            <span className={styles.texts}>
              <span className={styles.label}>{opt.label}</span>
              {opt.description ? <span className={styles.description}>{opt.description}</span> : null}
            </span>
          </label>
        )
      })}
    </div>
  )
}
