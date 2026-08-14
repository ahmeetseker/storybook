/**
 * İpek motion yardımcıları.
 *
 * `Reveal` — bölüm içeriğini görünür olduğunda blur'dan çözerek getirir
 * (İpek dilinin imza hareketi). Yalnız data attribute yönetir; efektin
 * kendisi sayfa CSS'indedir (`[data-reveal]` kuralları). IO yoksa (jsdom,
 * eski tarayıcı) veya kullanıcı hareket azaltıyorsa içerik anında görünür.
 *
 * `CountUp` — sayıyı ease-out ile sayar. Kaymasız: görünmez bir "ghost"
 * katmanı nihai metnin genişliğini baştan rezerve eder, sayan katman onun
 * üstünde mutlak konumlanır — kart/satır genişliği sayım boyunca oynamaz.
 * Erişilebilir ad her zaman nihai değerdir; ara değerler ağaca girmez.
 */
import { useEffect, useRef, useState, type ElementType, type HTMLAttributes, type ReactNode } from 'react'

function reducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  children?: ReactNode
}

export function Reveal({ as, children, ...rest }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined' || reducedMotion()) {
      el.setAttribute('data-in', 'true')
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute('data-in', 'true')
          io.disconnect()
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} data-reveal="" {...rest}>
      {children}
    </Tag>
  )
}

export interface CountUpProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
  decimals?: number
  durationMs?: number
}

export function CountUp({ value, decimals = 0, durationMs = 900, ...rest }: CountUpProps) {
  const fmt = (v: number) => v.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  const [display, setDisplay] = useState(() => (reducedMotion() ? value : 0))

  useEffect(() => {
    if (reducedMotion()) {
      setDisplay(value)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, durationMs])

  return (
    <span data-part="count" {...rest} aria-label={fmt(value)}>
      <span data-part="ghost" aria-hidden="true">
        {fmt(value)}
      </span>
      <span data-part="live" aria-hidden="true">
        {fmt(display)}
      </span>
    </span>
  )
}
