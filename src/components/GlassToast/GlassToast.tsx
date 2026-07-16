import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import styles from './GlassToast.module.css'

export type GlassToastSeverity = 'info' | 'success' | 'warning' | 'danger'

export interface GlassToastOptions {
  title: string
  description?: string
  severity?: GlassToastSeverity
  /** ms cinsinden otomatik kapanma; `null` = kalıcı (kullanıcı kapatana dek) */
  duration?: number | null
  action?: { label: string; onClick: () => void }
}

/** Fonksiyon + metod deseni: `toast({...})` id döner, `toast.dismiss(id)` kapatır */
export interface GlassToastApi {
  (options: GlassToastOptions): number
  dismiss: (id: number) => void
}

export interface GlassToastProviderProps {
  children: ReactNode
  /** Yığının viewport köşesi (yalnız ≥640px; mobilde her zaman altta tam genişlik) */
  position?: 'bottom-right' | 'bottom-center' | 'top-right'
  tone?: 'light' | 'dark' | 'auto'
}

interface ToastRecord extends GlassToastOptions {
  id: number
}

const ToastContext = createContext<GlassToastApi | null>(null)

export function useGlassToast(): GlassToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useGlassToast, GlassToastProvider içinde çağrılmalı')
  return api
}

const positionClass: Record<NonNullable<GlassToastProviderProps['position']>, string> = {
  'bottom-right': styles.bottomRight,
  'bottom-center': styles.bottomCenter,
  'top-right': styles.topRight,
}

const DEFAULT_DURATION = 4000

export function GlassToastProvider({ children, position = 'bottom-right', tone = 'auto' }: GlassToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const idRef = useRef(0)
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const reduced = prefersReducedMotion()
  const fromTop = position === 'top-right'

  const clearTimer = useCallback((id: number) => {
    const timer = timersRef.current.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const dismiss = useCallback(
    (id: number) => {
      clearTimer(id)
      setToasts((prev) => prev.filter((t) => t.id !== id))
    },
    [clearTimer],
  )

  const armTimer = useCallback(
    (id: number, duration: number | null) => {
      if (duration === null) return
      clearTimer(id)
      timersRef.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      )
    },
    [clearTimer, dismiss],
  )

  const api = useMemo<GlassToastApi>(() => {
    const fire = ((options: GlassToastOptions) => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, ...options }])
      armTimer(id, options.duration ?? DEFAULT_DURATION)
      return id
    }) as GlassToastApi
    fire.dismiss = dismiss
    return fire
  }, [armTimer, dismiss])

  // Unmount'ta bekleyen tüm sayaçları temizle
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div role="region" aria-label="Bildirimler" className={[styles.stack, positionClass[position]].join(' ')}>
          <AnimatePresence initial={false}>
            {toasts.map((t) => {
              const severity = t.severity ?? 'info'
              return (
                <motion.div
                  key={t.id}
                  layout={!reduced}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: fromTop ? -12 : 12 }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0.1 : 0.22, ease: [0.32, 0.72, 0, 1] }}
                  className={styles.item}
                  // Basit duraklatma: hover'da sayaç iptal, ayrılınca tam süreyle yeniden kurulur
                  onMouseEnter={() => clearTimer(t.id)}
                  onMouseLeave={() => armTimer(t.id, t.duration ?? DEFAULT_DURATION)}
                >
                  <GlassSurface
                    role={severity === 'danger' ? 'alert' : 'status'}
                    shape={14} /* --lg-radius-media */
                    tone={tone}
                    thickness={0.6}
                    className={styles.toast}
                  >
                    <div className={styles.row}>
                      <span className={[styles.stripe, styles[severity]].join(' ')} aria-hidden />
                      <div className={styles.texts}>
                        <span className={styles.title}>{t.title}</span>
                        {t.description ? <span className={styles.description}>{t.description}</span> : null}
                      </div>
                      {t.action ? (
                        <button
                          type="button"
                          className={styles.action}
                          onClick={() => {
                            t.action?.onClick()
                            dismiss(t.id)
                          }}
                        >
                          {t.action.label}
                        </button>
                      ) : null}
                      <button type="button" className={styles.close} aria-label="Kapat" onClick={() => dismiss(t.id)}>
                        <span aria-hidden>✕</span>
                      </button>
                    </div>
                  </GlassSurface>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
