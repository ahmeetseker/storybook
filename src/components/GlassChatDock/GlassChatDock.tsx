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
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ThinkingOrb, type OrbState } from 'thinking-orbs'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassChatDock.module.css'

/**
 * Bekleyen mesajın durum animasyonu — `thinking-orbs`'un dokuz durumu.
 * Ajan fiilleri: 'working' (genel düşünme), 'searching' (arama/tarama),
 * 'solving' (hesap/analiz), 'connecting' (dış sistemle bağlantı, ör. randevu),
 * 'composing' (uzun yanıt yazımı) en sık kullanılanlar.
 */
export type GlassChatDockPendingState = OrbState

/** Tek bir sohbet satırı. `pending` true iken `text` yok sayılır — durum göstergesi çizilir. */
export interface GlassChatDockMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  pending?: boolean
  /**
   * `pending` iken üç nokta yerine durum orb'u + bu etiket gösterilir
   * (ör. "İlanlar aranıyor…"). Ekran okuyucuya da bu metin duyurulur.
   */
  pendingLabel?: string
  /** `pending` iken orb animasyonunun durumu. @default 'working' */
  pendingState?: GlassChatDockPendingState
  /**
   * Balonda metnin altında render edilen zengin içerik (ilan kartı, grafik,
   * bağlantı…). Yalnız `pending` değilken çizilir; içerik varken satır tam
   * genişliğe açılır. Erişilebilir ad/duyuru `text` üzerinden gelmeye devam
   * eder — zengin içerik metnin yerine değil, yanına koyulmalı.
   */
  content?: ReactNode
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
  /**
   * Composer placeholder'ında daktilo efektiyle sırayla yazılan öneri
   * cümleleri. Verilirse `placeholder`'ın yerine geçer. Animasyon yalnız
   * panel açıkken ve taslak boşken çalışır; `prefers-reduced-motion`
   * tercihinde tamamen kapalıdır — ilk öneri statik gösterilir.
   */
  placeholders?: string[]
  /** Panelin altında sabit uyarı satırı */
  disclaimer?: string
  className?: string
}

// ── daktilo placeholder ──
// Composer placeholder'ı öneri cümlelerini karakter karakter yazar. CSS
// animasyonu değil, salt metin güncellemesi — yine de bir hareket olduğu için
// `prefers-reduced-motion`'da tamamen kapalıdır (statik cümle gösterilir).
// Kullanıcı taslak yazarken de duraklar: placeholder o an zaten görünmez,
// her karakter aralığında boşuna re-render tetiklenmesin.
const TYPE_CHAR_DELAY = 60 // ms — karakter başına yazım aralığı
const TYPE_IDLE_DELAY = 2400 // ms — cümle tamamlanınca sonraki cümleye geçmeden bekleme

function useTypewriterPlaceholder(texts: string[], enabled: boolean) {
  const [textIndex, setTextIndex] = useState(0)
  const [charCount, setCharCount] = useState(0)

  const current = texts.length > 0 ? texts[textIndex % texts.length] : ''
  // Array.from: çok baytlı karakterlerde (emoji, birleşik glif) yarım karakter yazmamak için
  const chars = useMemo(() => Array.from(current), [current])

  useEffect(() => {
    if (!enabled || chars.length === 0) return
    setCharCount(0)
    let shown = 0
    let idleTimeout: number | null = null
    const interval = window.setInterval(() => {
      if (shown < chars.length) {
        shown += 1
        setCharCount(shown)
      } else {
        window.clearInterval(interval)
        idleTimeout = window.setTimeout(() => {
          setTextIndex((prev) => (prev + 1) % Math.max(texts.length, 1))
        }, TYPE_IDLE_DELAY)
      }
    }, TYPE_CHAR_DELAY)
    return () => {
      window.clearInterval(interval)
      if (idleTimeout !== null) window.clearTimeout(idleTimeout)
    }
    // `texts` bilinçli olarak deps dışında: çağıran taraf diziyi inline yazarsa
    // kimliği her render'da değişir ve animasyon her keystroke'ta baştan
    // başlardı. İçerik değişimi `chars` (string eşitliği) üzerinden, ardışık
    // iki özdeş cümle ise `textIndex` üzerinden yakalanır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, chars, textIndex])

  return {
    text: enabled ? chars.slice(0, charCount).join('') : current,
    typing: enabled && charCount < chars.length,
  }
}

// Non-modal dialog sözleşmesi (GlassPopover ile aynı desen): focus trap YOK,
// arka plan tıklaması kapanışı tetiklemez — yalnız Escape ve kapat butonu kapatır.
function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true" focusable="false">
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

/**
 * Bekleyen mesaj göstergesi. `label` verilirse thinking-orbs durum orb'u +
 * görünür etiket (ajan ne yapıyor: arıyor, hesaplıyor, bağlanıyor…);
 * verilmezse klasik üç nokta. Orb, Kağıt temasına sabitlenir
 * (`theme="light"` → koyu mürekkep) ve `prefers-reduced-motion`'ı kendisi
 * ele alır (tek statik kare çizer).
 */
function TypingIndicator({ label, state }: { label?: string; state?: GlassChatDockPendingState }) {
  if (label) {
    return (
      <span className={styles.status}>
        <span className={styles.statusOrb} aria-hidden="true">
          <ThinkingOrb state={state ?? 'working'} size={20} theme="light" />
        </span>
        <span className={styles.statusLabel}>{label}</span>
      </span>
    )
  }
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
  // Konuşmacı yalnız görsel hizalamayla (sağ/sol) ayırt ediliyor — role="log"
  // bölgesini dinleyen ekran okuyucu için bu yeterli değil. Her mesaj
  // metninin başına görsel-gizli "Siz: "/"Asistan: " öneki eklenir.
  const speakerLabel = isUser ? 'Siz: ' : 'Asistan: '
  const hasRich = !message.pending && message.content != null
  return (
    <div
      className={[styles.row, isUser ? styles.rowUser : styles.rowAi, hasRich ? styles.rowRich : '']
        .filter(Boolean)
        .join(' ')}
    >
      {!isUser ? (
        <span className={styles.aiMark} aria-hidden="true">
          ✦
        </span>
      ) : null}
      <div className={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi].join(' ')}>
        {message.pending ? (
          <TypingIndicator label={message.pendingLabel} state={message.pendingState} />
        ) : (
          <>
            <span>
              <span className={styles.srOnly}>{speakerLabel}</span>
              {message.text}
            </span>
            {message.content != null ? <div className={styles.rich}>{message.content}</div> : null}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * İlanla sohbet dock'u — sağ alt köşede sabit. Kapalıyken yüzen bir "Soru sor"
 * kapsülü, açıkken sohbet geçmişi + composer içeren küçük bir panel gösterir.
 * Modal DEĞİL: focus trap yok, arka plan her zaman etkileşimli kalır; yalnız
 * Escape (panel kapsayıcısının onKeyDown'unda, panel içi hedeflerde) ve
 * kapat butonu paneli kapatır. Açılışta odak yalnız BU component'in kendi
 * tetiklediği (kullanıcı gerçekten launcher'a bastığı) geçişte input'a
 * taşınır — controlled modda dışarıdan `open` prop'u programatik değişirse
 * (ör. ilk mount, sayfa geçişi) odak koşulsuz çalınmaz. Kapanışta odak
 * launcher'a taşınır — hem kullanıcı tetiklediyse (kapat/Escape) hem de
 * controlled programatik bir kapanış anında odak hâlâ panel içindeyse
 * (böylece odak asla body'ye düşmez) (bkz. rules.md §7).
 */
export function GlassChatDock({
  messages,
  onSend,
  open,
  defaultOpen = false,
  onOpenChange,
  title = 'İlan Asistanı',
  placeholder = 'Bir soru yaz…',
  placeholders,
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
  const panelRef = useRef<HTMLDivElement>(null)

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

    if (isOpen) {
      if (userTriggered) inputRef.current?.focus()
      return
    }

    // Kapanış: kullanıcı bu component'in kendi setOpen'ını tetiklediyse
    // (launcher/kapat/panel-içi Escape) odak launcher'a taşınır — bu zaten
    // eskiden beri var. Ek olarak (regresyon): controlled modda parent
    // programatik olarak `open`'ı false yaparsa (kullanıcı tetiklemeden) ve
    // odak o an panel içindeyse (ör. textarea'da yazarken), odak body'ye
    // düşmemesi için yine launcher'a taşınır — bkz. rules.md §7.
    const activeElement = document.activeElement
    const focusWasInPanel = activeElement !== null && panelRef.current?.contains(activeElement) === true
    if (userTriggered || focusWasInPanel) {
      launcherRef.current?.focus()
    }
  }, [isOpen])

  // Panel açılınca dibe kayar — koşulsuz, çünkü henüz okunmakta olan bir
  // geçmiş yok (davranışsal scrollTop ataması, smooth scroll DEĞİL).
  useLayoutEffect(() => {
    if (!isOpen) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    // Yalnız açılış anında çalışır; mesaj değişimini aşağıdaki effect ayrı
    // (koşullu) ele alır — messages'ı deps'e almak bilinçli olarak atlandı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Mesaj listesi güncellendiğinde: kullanıcı zaten dipteyse (eşik: 48px)
  // VEYA yeni eklenen son mesaj kullanıcıya aitse VEYA dipteki bekleyen mesaj
  // az önce gerçek yanıta dönüştüyse dibe kayar. Üçüncü koşul gerekli, çünkü
  // uzun/zengin bir yanıt bekleme balonunun yerini alınca scrollHeight bir
  // anda büyür — mesafe ölçümü İÇERİK BÜYÜDÜKTEN sonra yapıldığı için "dipte"
  // sayılmaz ve yanıtın kartları ekran dışında kalırdı. Aksi halde (geçmişi
  // yukarı kaydırıp okuyan bir kullanıcı) liste zıplatılmaz.
  const prevLastMessageRef = useRef<{ id: string; pending: boolean } | null>(null)
  useLayoutEffect(() => {
    if (!isOpen) return
    const el = listRef.current
    if (!el) return
    const lastMessage = messages[messages.length - 1]
    const pendingResolved =
      prevLastMessageRef.current !== null &&
      lastMessage !== undefined &&
      prevLastMessageRef.current.id === lastMessage.id &&
      prevLastMessageRef.current.pending &&
      lastMessage.pending !== true
    prevLastMessageRef.current = lastMessage
      ? { id: lastMessage.id, pending: lastMessage.pending === true }
      : null
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const isNearBottom = distanceFromBottom < 48
    if (isNearBottom || lastMessage?.role === 'user' || pendingResolved) {
      el.scrollTop = el.scrollHeight
    }
    // isOpen'ı deps'e almak gereksiz — yukarıdaki effect açılış anını zaten
    // ele alıyor, burada yalnız mesaj değişimi tetiklenmeli.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

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

  // Escape panel kapsayıcısının onKeyDown'unda yakalanır — document genelinde
  // DEĞİL: böylece yalnız panel içi bir hedef (textarea, kapat butonu, …)
  // odaktayken çalışır, üst katmanlarla (ör. sayfadaki bir arama kutusu)
  // çakışıp odak çalmaz (bkz. rules.md §7). IME kompozisyonu sürerken Escape
  // adayı iptal etmek için kullanılabildiğinden yok sayılır. Kapanışı
  // işledikten sonra e.stopPropagation() çağrılır — olay daha üst
  // katmanlara (ör. document üzerindeki başka bir Escape dinleyicisi)
  // sızmaz.
  const handlePanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.nativeEvent.isComposing || e.key === 'Process') return
    if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
    }
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

  // Daktilo placeholder — yalnız `placeholders` verildiyse devrede; reduced
  // motion'da hook enabled=false döner ve tam cümle statik gösterilir.
  const hasSuggestions = placeholders !== undefined && placeholders.length > 0
  const typewriter = useTypewriterPlaceholder(
    placeholders ?? [],
    hasSuggestions && !reduced && isOpen && draft === '',
  )
  const composerPlaceholder = hasSuggestions
    ? `${typewriter.text}${typewriter.typing ? '|' : ''}`
    : placeholder

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
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-labelledby={titleId}
            className={styles.panel}
            onKeyDown={handlePanelKeyDown}
            {...panelMotion}
          >
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
                placeholder={composerPlaceholder}
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
