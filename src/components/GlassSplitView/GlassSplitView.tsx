import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassSplitView.module.css'

export interface GlassSplitViewProps {
  sidebar: ReactNode
  children: ReactNode
  /** Kontrollü görünürlük; verilmezse defaultOpen ile kontrolsüz çalışır */
  sidebarOpen?: boolean
  defaultOpen?: boolean
  onSidebarOpenChange?: (open: boolean) => void
  /** Değişince içerik crossfade + hafif dikey kayma ile yenilenir */
  contentKey?: string
  sidebarWidth?: number
  /** Yerleşik gizle/göster butonu */
  toggle?: boolean
  className?: string
}

const GAP = 16 // sidebar'ın kenarlardan içeri alındığı boşluk (yüzen panel hissi)

export function GlassSplitView({
  sidebar,
  children,
  sidebarOpen,
  defaultOpen = true,
  onSidebarOpenChange,
  contentKey,
  sidebarWidth = 300,
  toggle = false,
  className,
}: GlassSplitViewProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = sidebarOpen ?? internalOpen
  const reduced = prefersReducedMotion()

  const setOpen = (next: boolean) => {
    if (sidebarOpen === undefined) setInternalOpen(next)
    onSidebarOpenChange?.(next)
  }

  const panelSpring = reduced ? { duration: 0 } : ({ type: 'spring', ...presets.springs.sidebar } as const)
  const contentTween = reduced ? { duration: 0 } : ({ duration: 0.28, ease: [0.32, 0.72, 0, 1] } as const)

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div className={styles.content}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={contentKey ?? '__static__'}
            className={styles.contentInner}
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0, paddingLeft: open ? sidebarWidth + GAP * 3 : GAP + 40 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={contentTween}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sidebar içeriğin ÜSTÜNDE yüzer — arka plan altından görünür (HIG background extension) */}
      <motion.div
        data-sidebar-slot
        className={styles.sidebarSlot}
        aria-hidden={!open}
        inert={!open}
        initial={false}
        animate={{ width: open ? sidebarWidth : 0, opacity: open ? 1 : 0 }}
        transition={panelSpring}
        style={{ pointerEvents: open ? undefined : 'none' }}
      >
        <div className={styles.sidebarInner} style={{ width: sidebarWidth }}>
          {sidebar}
        </div>
      </motion.div>

      {toggle ? (
        <motion.div
          className={styles.toggleSlot}
          initial={false}
          animate={{ left: open ? sidebarWidth + GAP * 2 : GAP }}
          transition={panelSpring}
        >
          <GlassSurface
            as="button"
            shape="capsule"
            interactive
            thickness={0.3}
            className={styles.toggle}
            aria-expanded={open}
            aria-label={open ? 'Kenar çubuğunu gizle' : 'Kenar çubuğunu göster'}
            onClick={() => setOpen(!open)}
            {...({ type: 'button' } as unknown as GlassSurfaceProps)} // GlassButton'daki cast kalıbı: HTMLAttributes'ta type yok
          >
            <span className={styles.toggleIcon} data-open={open} aria-hidden />
          </GlassSurface>
        </motion.div>
      ) : null}
    </div>
  )
}
