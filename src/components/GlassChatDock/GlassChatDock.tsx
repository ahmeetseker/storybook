// GlassChatDock — ilanla sohbet dock'u (sağ alt köşe).
// AI-first component: içerik katmanı FLAT (cam/backdrop-filter yok). Kapalıyken
// yüzen bir kapsül buton, açıkken küçük sabit panel — Modal/Drawer/Toast'ın
// paylaştığı "overlay" sözleşmesine (portal + focus trap + scroll kilidi) DAHİL
// DEĞİL: dock modal olmayan bir sohbet paneli, arka plan her zaman etkileşimli
// kalır (bkz. rules.md §2, §7).
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassChatDock.module.css'

/** Tek bir sohbet satırı. `pending` true iken `text` yok sayılır — "yazıyor" göstergesi çizilir. */
export interface GlassChatDockMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  pending?: boolean
}

export interface GlassChatDockProps {
  /** Sohbet geçmişi — sıralı, en yeni sonda. Liste her değişiminde dibe kayar. */
  messages: GlassChatDockMessage[]
  /** Kullanıcı Enter'a bastığında veya gönder'e tıkladığında çağrılır; boş/yalnız boşluk metin çağırmaz */
  onSend: (text: string) => void
  /** Controlled açık/kapalı durumu */
  open?: boolean
  /** Uncontrolled kullanımda başlangıç durumu */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Panel başlığı — accessible name kaynağı (`aria-labelledby`) */
  title?: string
  placeholder?: string
  /** Panelin altında sabit uyarı satırı */
  disclaimer?: string
  className?: string
}

// Non-modal dialog sözleşmesi (GlassPopover ile aynı desen): focus trap YOK,
// arka plan tıklaması kapanışı tetiklemez — yalnız Escape ve kapat butonu kapatır.
function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M17.2 2.8 2.6 8.9c-.6.25-.56 1.1.06 1.3l5.3 1.66 1.66 5.3c.2.62 1.05.66 1.3.06l6.1-14.6c.22-.53-.32-1.07-.82-.82Z"
        fill="currentColor"
      />
      <path d="M17.2 2.8 8.2 11.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/**
 * AI-first içerik rozeti — Dalga kontratının "AI-first standardı" bölümünden
 * birebir kopya CSS (bkz. GlassMatchScore) — tüm AI component'lerinde aynı
 * görünmeli. Sohbetin tamamı yapay zekâ ürettiği için koşulsuz, her zaman görünür.
 */
function AiBadge() {
  return (
    <span className={styles.aiBadge} aria-label="Yapay zekâ üretimi">
      ✦ AI
    </span>
  )
}

function TypingIndicator() {
  return (
    <span className={styles.typing}>
      <span className={styles.typingDots} aria-hidden="true">
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </span>
      <span className={styles.srOnly}>yazıyor</span>
    </span>
  )
}

function MessageRow({ message }: { message: GlassChatDockMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={[styles.row, isUser ? styles.rowUser : styles.rowAi].join(' ')}>
      {!isUser ? (
        <span className={styles.aiMark} aria-hidden="true">
          ✦
        </span>
      ) : null}
      <div className={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi].join(' ')}>
        {message.pending ? <TypingIndicator /> : <span>{message.text}</span>}
      </div>
    </div>
  )
}

/**
 * İlanla sohbet dock'u — sağ alt köşede sabit. Kapalıyken yüzen bir "Soru sor"
 * kapsülü, açıkken sohbet geçmişi + composer içeren küçük bir panel gösterir.
 * Modal DEĞİL: focus trap yok, arka plan her zaman etkileşimli kalır; yalnız
 * Escape ve kapat butonu paneli kapatır. Odak yalnız BU component'in kendi
 * tetiklediği (kullanıcı gerçekten launcher/kapat'a bastığı veya Escape'e
 * bastığı) açılış/kapanışlarda taşınır — controlled modda dışarıdan `open`
 * prop'u programatik değişirse (ör. ilk mount, sayfa geçişi) odak koşulsuz
 * çalınmaz (bkz. rules.md §7).
 */
export function GlassChatDock({
  messages,
  onSend,
  open,
  defaultOpen = false,
  onOpenChange,
  title = 'İlan Asistanı',
  placeholder = 'Bir soru yaz…',
  disclaimer = 'Yanıtlar yapay zekâ üretimidir, bağlayıcı değildir.',
  className,
}: GlassChatDockProps) {
  const uid = useId()
  const titleId = `${uid}-title`

  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const isOpen = open ?? innerOpen
  const [draft, setDraft] = useState('')
  const reduced = prefersReducedMotion()

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)

  // Yalnız BU component'in kendi setOpen çağrısıyla tetiklenen geçişlerde true
  // olur; effect tükettikten sonra hemen sıfırlanır — bkz. üstteki JSDoc.
  //
  // Not (regresyon düzeltmesi): bu bayrak yalnız `isOpen` GERÇEKTEN değiştiğinde
  // tüketilen effect'te sıfırlanır. Controlled modda parent isteği hemen
  // yansıtmazsa (reddederse) `isOpen` değişmediği için effect hiç çalışmaz ve
  // bayrak askıda kalır — daha sonra tamamen ilgisiz bir nedenle `open` prop'u
  // programatik değişirse, effect bu bayat bayrağı "kullanıcı tetikledi" sanıp
  // odağı çalar. Bunu önlemek için bayrak, tüketilmeden bir görev turu
  // (setTimeout 0) içinde kendiliğinden sona erer: bu, "hemen ardından
  // tüketilir" sözleşmesiyle tutarlı — normal senkron kabul/red akışında
  // (uncontrolled `setInnerOpen` veya parent'ın aynı olay işleyicisinde
  // senkron kabul ettiği controlled akış) effect zaten süre dolmadan çalışıp
  // bayrağı tüketir; yalnız gecikmiş/ilgisiz geç geçişlerde bayrak zaten
  // sıfırlanmış olur.
  const userTriggeredRef = useRef(false)
  const userTriggeredExpiryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevOpenRef = useRef(isOpen)

  const clearUserTriggeredExpiry = () => {
    if (userTriggeredExpiryRef.current !== null) {
      clearTimeout(userTriggeredExpiryRef.current)
      userTriggeredExpiryRef.current = null
    }
  }

  const setOpen = (next: boolean) => {
    userTriggeredRef.current = true
    clearUserTriggeredExpiry()
    userTriggeredExpiryRef.current = setTimeout(() => {
      userTriggeredRef.current = false
      userTriggeredExpiryRef.current = null
    }, 0)
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }

  useEffect(() => clearUserTriggeredExpiry, [])

  useEffect(() => {
    const was = prevOpenRef.current
    prevOpenRef.current = isOpen
    if (was === isOpen) return
    const userTriggered = userTriggeredRef.current
    userTriggeredRef.current = false
    clearUserTriggeredExpiry()
    if (!userTriggered) return
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      launcherRef.current?.focus()
    }
  }, [isOpen])

  // Escape her zaman kapatır — arka plan tıklaması KAPATMAZ (overlay değil, dock deseni)
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // setOpen her render'da yeniden yaratılır ama davranışı stabil — deps'e almak gereksiz re-bind üretir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Yeni mesajda liste dibe kayar — davranışsal (scrollTop ataması), smooth scroll DEĞİL
  useLayoutEffect(() => {
    if (!isOpen) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [isOpen, messages])

  const submit = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onSend(trimmed)
    setDraft('')
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    // IME kompozisyonu sürerken (ör. CJK/uzantılı Latin giriş) Enter, adayı
    // onaylamak için basılır — henüz tamamlanmamış taslağı erken göndermemek
    // için bu durumda yok sayılır (keyCode 229: bazı tarayıcılarda
    // isComposing bayrağı Enter'ın composition-end olayıyla aynı anda false
    // olabildiğinden ek güvenlik kontrolü).
    if (e.nativeEvent.isComposing || e.key === 'Process' || (e as unknown as { keyCode?: number }).keyCode === 229) {
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
    // Shift+Enter: varsayılan davranış korunur — textarea'ya satır ekler
  }

  const spring = { type: 'spring', ...presets.springs.sidebar } as const
  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, y: 16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.98 },
        transition: spring,
      }

  const canSend = draft.trim().length > 0

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {!isOpen ? (
        <button
          type="button"
          ref={launcherRef}
          className={styles.launcher}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          <span className={styles.launcherIcon} aria-hidden="true">
            ✦
          </span>
          Soru sor
        </button>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.div role="dialog" aria-labelledby={titleId} className={styles.panel} {...panelMotion}>
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <span id={titleId} className={styles.title}>
                  {title}
                </span>
                <AiBadge />
              </div>
              <button type="button" className={styles.close} aria-label="Kapat" onClick={() => setOpen(false)}>
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <div ref={listRef} role="log" aria-live="polite" className={styles.messages}>
              {messages.map((message) => (
                <MessageRow key={message.id} message={message} />
              ))}
            </div>

            <p className={styles.disclaimer}>{disclaimer}</p>

            <form className={styles.composer} onSubmit={handleFormSubmit}>
              <textarea
                ref={inputRef}
                className={styles.textarea}
                rows={1}
                value={draft}
                placeholder={placeholder}
                aria-label="Mesajınız"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button type="submit" className={styles.send} aria-label="Gönder" disabled={!canSend}>
                <SendIcon />
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
