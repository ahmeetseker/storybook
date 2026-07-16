// Daktilo efekti — arama placeholder'ı gibi kısa metin önerilerini yazar/siler.
// prefers-reduced-motion'da animasyon yapılmaz: ilk metin tam döner.
import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../core/tier'

export interface UseTypewriterOptions {
  /** Harf başına yazma gecikmesi (ms) */
  typeMs?: number
  /** Harf başına silme gecikmesi (ms) */
  deleteMs?: number
  /** Tam yazılmış metnin bekleme süresi (ms) */
  holdMs?: number
}

export function useTypewriter(
  phrases: readonly string[],
  { typeMs = 65, deleteMs = 35, holdMs = 1600 }: UseTypewriterOptions = {},
): string {
  const [index, setIndex] = useState(0)
  const [len, setLen] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    if (reduced || phrases.length === 0) return
    const current = phrases[index % phrases.length]
    let delay = deleting ? deleteMs : typeMs
    if (!deleting && len === current.length) delay = holdMs
    const t = setTimeout(() => {
      if (!deleting) {
        if (len === current.length) setDeleting(true)
        else setLen((n) => n + 1)
      } else if (len === 0) {
        setDeleting(false)
        setIndex((i) => (i + 1) % phrases.length)
      } else {
        setLen((n) => n - 1)
      }
    }, delay)
    return () => clearTimeout(t)
  }, [phrases, index, len, deleting, reduced, typeMs, deleteMs, holdMs])

  if (phrases.length === 0) return ''
  if (reduced) return phrases[0]
  return phrases[index % phrases.length].slice(0, len)
}
