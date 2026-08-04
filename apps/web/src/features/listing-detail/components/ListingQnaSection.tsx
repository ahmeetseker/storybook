import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'

import type {
  ListingQna,
  ListingQnaAuthor,
  ListingQnaEntry,
  ListingQnaReply,
  ListingQnaViewer,
} from '../domain/listing-detail-types'
import { formatDate, formatDateShort } from '../format'
import styles from './ListingQnaSection.module.css'

/** Yazılmamış soru gönderilmez; gerekçe canlı bölgede yazılır. */
const EMPTY_QUESTION_TEXT = 'Göndermeden önce sorunuzu yazın.'
/** Gönderim onayı — yalnız çağıran taraf gerçekten bir akış bağladıysa görünür. */
const SUBMITTED_TEXT = 'Sorunuz iletildi. Yanıtlandığında bu bölümde görünür.'
/** Yanıt yokluğu bilgidir: satır gizlenmez, durumu kelimeyle yazılır. */
const UNANSWERED_TEXT = 'Henüz yanıtlanmadı'
/**
 * Soru gönderme akışı bağlanmamışken yazılan gerekçe. Sayfanın kuralı gereği
 * (rules.md §4) bağlanmamış bir eylem etkin render edilmez; yetenek de sessizce
 * yok sayılmaz — kullanıcı yeteneğin var olduğunu ama bağlı olmadığını okur.
 *
 * **Oturum kapalılığıyla karıştırılmaz.** Kanal kapalıyken giriş yapmak
 * hiçbir şeyi açmaz, o yüzden burada giriş kontrolü de çizilmez.
 */
const NOT_WIRED_TEXT =
  'Soru gönderme bu görünümde bağlı değil. Mevcut sorular ve yanıtları okunabilir; yeni soru şu anda iletilemiyor.'
/**
 * Yansıtılmış kayıtta boş durumun metni.
 *
 * "Bu ilana henüz soru sorulmadı" burada yanlış olurdu: sorulmuş soru olup
 * olmadığını bilmiyoruz — bu kayıt arama sonucundan yansıtıldı ve bir
 * soru-cevap dosyası hiç taşımıyor.
 */
const PROJECTED_EMPTY_TITLE = 'Bu kayıtta soru-cevap dosyası yok.'
const PROJECTED_EMPTY_NOTE =
  'Bu ilan arama kaydından yansıtıldı; kayıt soru ve yanıt taşımıyor. Bu bölüm, ilan sahibiyle iletişim kanalı bağlandığında sorularla birlikte açılır.'
const PROJECTED_NOT_WIRED_TEXT =
  'Soru gönderme bu görünümde bağlı değil ve bu kayıtta okunabilecek soru bulunmuyor; satıcı bağlandığında sorular buradan sorulabilecek.'

const PUBLIC_NOTE =
  'Yazdığınız metin bu sayfada herkese açık görünür; telefon ve e-posta yayımlanmaz.'

const ZIYARETCI: ListingQnaViewer = { signedIn: false }

export interface ListingQnaSectionProps {
  /** Soru-cevap kaydı. Yoksa bölüm yine görünür ve boş durumunu yazar. */
  qna?: ListingQna
  /**
   * Görüntüleyen. Verilmezse oturum kapalı sayılır: yazışma okunur, yazma ve
   * işlem menüleri hiç çizilmez.
   */
  viewer?: ListingQnaViewer
  /** Yeni soru gönderimi: verilmezse yazma alanı yerine gerekçe gösterilir */
  onSoruGonder?: (soru: string) => void
  /** Bir soruya yanıt yazma */
  onYanitla?: (soruId: string, yanit: string) => void
  /** Kendi sorusunu silme */
  onSoruSil?: (soruId: string) => void
  /** Kendi yanıtını silme */
  onYanitSil?: (yanitId: string) => void
  /** İlan sahibinin kendi yanıtını görünürlükten çıkarması / geri alması */
  onYanitGizle?: (yanitId: string) => void
  onYanitGoster?: (yanitId: string) => void
  /** Başkasının içeriğini moderasyona bildirme */
  onBildir?: (id: string) => void
  /**
   * Oturum kapalıyken yazma kapısına basıldığında çağrılır — giriş sayfasına
   * `donus` yoluyla götürmek çağıranın işidir. Verilmezse kapı hiç çizilmez
   * (bağlanmamış eylem etkin render edilmez).
   */
  onGirisIste?: () => void
  /**
   * Kayıt arama sonucundan **yansıtıldı** mı? Yalnız boş durumun metnini
   * netleştirir.
   */
  projected?: boolean
}

/** Görüntüleyen bu içeriğin yazarı mı? Karar görünen ada değil `id`'ye bakar. */
function isViewer(author: ListingQnaAuthor, viewer: ListingQnaViewer): boolean {
  return Boolean(viewer.signedIn && viewer.id && author.id === viewer.id)
}

/**
 * Bu yanıtın İÇERİĞİ bu görüntüleyene açık mı?
 *
 * `hidden` (ilan sahibinin tercihi) ve `masked` (platform kuralı) aynı
 * görünürlük sonucunu verir — ikisi de yalnız yazarına ve ilan sahibine
 * okunur. Ayrıldıkları yer menü ve damga: kural tercih gibi sunulmaz.
 */
function canSee(reply: ListingQnaReply, viewer: ListingQnaViewer): boolean {
  if (reply.visibility === undefined || reply.visibility === 'public') return true
  if (viewer.signedIn && viewer.isOwner) return true
  return isViewer(reply.author, viewer)
}

/**
 * Sık sorulanlar üstte; grup içi sıra kayıttaki sırayı korur.
 *
 * `Array.prototype.sort` kararlıdır, dolayısıyla aynı gruptaki sorular
 * fixture'daki (kronolojik) sıralarını kaybetmez.
 */
function orderEntries(entries: readonly ListingQnaEntry[]): ListingQnaEntry[] {
  return [...entries].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
}

/**
 * Başlığın yanındaki sayaç.
 *
 * "3 soru" tek başına yanıtlanmış izlenimi verir; yanıtsızlık da sayılır.
 * Sayım GÖRÜNEN yanıtlar üzerindendir: gizlenmiş bir yanıt sayacı şişirip
 * "yanıtlandı" izlenimi bırakmaz.
 */
function countText(
  entries: readonly ListingQnaEntry[],
  viewer: ListingQnaViewer,
  projected?: boolean,
): string {
  // Yansıtılmış kayıtta "henüz" yoktur: soru dosyası hiç tutulmuyor.
  if (entries.length === 0) return projected ? 'Kayıtta soru bulunmuyor' : 'Henüz soru yok'
  const answered = entries.filter((entry) =>
    entry.replies.some((reply) => reply.author.role === 'seller' && canSee(reply, viewer)),
  ).length
  if (answered === 0) return `${entries.length} soru · henüz yanıt yok`
  return `${entries.length} soru · ${answered} yanıtlandı`
}

function Avatar({
  author,
  viewer,
  size,
}: {
  author: ListingQnaAuthor
  viewer: ListingQnaViewer
  size: 'question' | 'reply'
}) {
  // Zemin tonu ROLÜ taşır; gri siluetin söylemediği şey budur.
  const kind = isViewer(author, viewer) ? 'self' : author.role
  return (
    <span className={styles.avatar} data-kind={kind} data-size={size} aria-hidden="true">
      {author.initials}
    </span>
  )
}

interface MenuItem {
  key: string
  label: string
  note?: string
  danger?: boolean
  run: () => void
}

/**
 * İşlemler menüsü.
 *
 * Boş menü hiç çizilmez: yapılabilecek bir şey yoksa kontrol de olmaz.
 * Esc kapatır ve odağı tetikleyiciye döndürür; dışarı tıklamak kapatır.
 */
function IslemlerMenu({ items, label }: { items: MenuItem[]; label: string }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  if (items.length === 0) return null

  return (
    <span className={styles.menuWrap} ref={wrapRef}>
      <button
        type="button"
        ref={buttonRef}
        className={styles.menuButton}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
      >
        İşlemler
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </button>
      <ul className={styles.menu} id={menuId} role="menu" hidden={!open}>
        {items.map((item) => (
          <li key={item.key} role="none">
            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              data-tone={item.danger ? 'danger' : undefined}
              onClick={() => {
                close(false)
                item.run()
              }}
            >
              {item.label}
              {item.note ? <small>{item.note}</small> : null}
            </button>
          </li>
        ))}
      </ul>
    </span>
  )
}

/**
 * Alıcı soruları bölümü.
 *
 * İçerik katmanındadır ve bir yapraktır (rules.md §1b): yaprağın İÇİNDE
 * ikinci bir kart açılmaz — yanıtlar tonlu bir alt bölgedir, kart değil.
 * Beş kural bölümün tamamını belirler:
 *
 * 1. **Yanıtsız soru gizlenmez.** Yanıt yokluğu bilgidir; satır "Henüz
 *    yanıtlanmadı" durumuyla görünür kalır — ama bu YALNIZ gerçekten yanıt
 *    yokken yazılır. Yanıtı gizlenmiş soru sessizce yanıtsız durur.
 * 2. **Bağlanmamış eylem etkin render edilmez.** Geri çağrısı verilmemiş
 *    hiçbir işlem menüde çizilmez; kanal kapalıysa yazma alanı hiç açılmaz.
 * 3. **Boş kayıt boş ekran değildir.** Soru yoksa ne olduğu ve ne
 *    yapılabileceği yazılır.
 * 4. **Yetki sahiplikten türer.** Kendi yazdığını silersin, başkasınınkini
 *    bildirirsin. İlan sahibi soruları silemez — yalnız kendi yanıtını
 *    gizleyebilir.
 * 5. **Gizleme sessizdir.** Gizlenen yanıt başkalarında hiçbir iz bırakmaz;
 *    yazarına ve ilan sahibine damgalı olarak okunur kalır.
 */
export function ListingQnaSection({
  qna,
  viewer = ZIYARETCI,
  onSoruGonder,
  onYanitla,
  onSoruSil,
  onYanitSil,
  onYanitGizle,
  onYanitGoster,
  onBildir,
  onGirisIste,
  projected,
}: ListingQnaSectionProps) {
  const baseId = useId()
  const titleId = `${baseId}-baslik`
  const fieldId = `${baseId}-soru`
  const hintId = `${baseId}-ipucu`
  const statusId = `${baseId}-durum`

  const entries = qna?.entries ?? []
  const ordered = orderEntries(entries)
  const askDisabledReason = qna?.askDisabledReason
  // Gerekçe her zaman kazanır: kapalı bir soru kanalı, oturum açık olsa da
  // form açmaz. Kanal kapalılığı ile oturum kapalılığı ayrı durumlardır.
  const channelOpen = !askDisabledReason && Boolean(onSoruGonder)
  const canAsk = channelOpen && viewer.signedIn

  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const soru = draft.trim()
    if (soru.length === 0) {
      setStatus({ tone: 'error', text: EMPTY_QUESTION_TEXT })
      return
    }
    onSoruGonder?.(soru)
    setDraft('')
    setStatus({ tone: 'success', text: SUBMITTED_TEXT })
  }

  const questionMenu = (entry: ListingQnaEntry): MenuItem[] => {
    if (!viewer.signedIn) return []
    const items: MenuItem[] = []
    const mine = isViewer(entry.author, viewer)

    // Kendi sorusunu silen alıcıdır. İlan sahibinin soruyu kaldırma yetkisi
    // YOKTUR — olsaydı bölüm seçilmiş sorular vitrinine dönerdi.
    if (mine && onSoruSil) {
      items.push({
        key: 'sil',
        label: 'Soruyu sil',
        note: 'Yanıtlarıyla birlikte kalkar',
        danger: true,
        run: () => onSoruSil(entry.id),
      })
    }
    if (channelOpen && onYanitla) {
      items.push({
        key: 'yanitla',
        label: 'Yanıtla',
        run: () => setReplyingTo(entry.id),
      })
    }
    if (!mine && onBildir) {
      items.push({
        key: 'bildir',
        label: 'Uygunsuz olarak bildir',
        note: 'Moderasyona gider',
        danger: true,
        run: () => onBildir(entry.id),
      })
    }
    return items
  }

  const replyMenu = (reply: ListingQnaReply): MenuItem[] => {
    if (!viewer.signedIn) return []
    // Platform maskesi bir KURALDIR: tercih menüsü hiç açılmaz.
    if (reply.visibility === 'masked') return []
    const items: MenuItem[] = []
    const mine = isViewer(reply.author, viewer)

    if (mine && viewer.isOwner) {
      if (reply.visibility === 'hidden' && onYanitGoster) {
        items.push({
          key: 'goster',
          label: 'Herkese görünür yap',
          note: 'Yanıt yeniden yayına alınır',
          run: () => onYanitGoster(reply.id),
        })
      } else if (reply.visibility !== 'hidden' && onYanitGizle) {
        items.push({
          key: 'gizle',
          label: 'Gizle',
          note: 'Alıcılarda hiç görünmez',
          run: () => onYanitGizle(reply.id),
        })
      }
    }
    if (mine && onYanitSil) {
      items.push({
        key: 'sil',
        label: 'Yanıtı sil',
        danger: true,
        run: () => onYanitSil(reply.id),
      })
    }
    if (!mine && onBildir) {
      items.push({
        key: 'bildir',
        label: 'Uygunsuz olarak bildir',
        note: 'Moderasyona gider',
        danger: true,
        run: () => onBildir(reply.id),
      })
    }
    return items
  }

  return (
    <section
      id="sorular"
      data-listing-section="qna"
      className={styles.section}
      aria-labelledby={titleId}
    >
      <header className={styles.header} data-part="header">
        <h2 id={titleId} className={styles.title}>
          Sorular ve yanıtlar
        </h2>
        <p className={styles.count} data-part="count">
          {countText(entries, viewer, projected)}
        </p>
        {qna?.responseLabel ? (
          <p className={styles.responseLabel} data-part="response-label">
            {qna.responseLabel}
          </p>
        ) : null}
      </header>

      {ordered.length > 0 ? (
        <ul className={styles.thread} data-part="list">
          {ordered.map((entry) => {
            // Katlama GÖRÜNEN yanıtlar üzerinden çalışır: gizlenmiş bir yanıt
            // ne sayıyı şişirir ne "son yanıt" olabilir.
            const visible = entry.replies.filter((reply) => canSee(reply, viewer))
            const isOpen = Boolean(expanded[entry.id])
            const shown = isOpen || visible.length <= 1 ? visible : visible.slice(-1)
            const replying = replyingTo === entry.id

            return (
              <li
                key={entry.id}
                className={styles.turn}
                data-part="entry"
                data-pinned={entry.pinned ? 'true' : undefined}
                data-answered={visible.length > 0 ? 'true' : 'false'}
              >
                <div className={styles.message} data-part="question">
                  <Avatar author={entry.author} viewer={viewer} size="question" />
                  <div className={styles.body}>
                    <p className={styles.line}>
                      <span className={styles.who}>{entry.author.label}</span>
                      <span className={styles.text}>{entry.question}</span>
                    </p>
                    <p className={styles.meta}>
                      {entry.pinned ? <span className={styles.pin}>Sık sorulan</span> : null}
                      {isViewer(entry.author, viewer) ? (
                        <span className={styles.roleChip}>Siz</span>
                      ) : null}
                      <span className={styles.when}>{formatDate(entry.askedAt)}</span>
                    </p>
                  </div>
                  <IslemlerMenu
                    items={questionMenu(entry)}
                    label={`${entry.author.label} sorusu için işlemler`}
                  />
                </div>

                {/* Kalabalık yapmayan varsayılan: yalnız son yanıt durur,
                    öncekiler tek satırlık bir kontrolün arkasında bekler.
                    Sayı önceden yazılır — açmadan ne geleceği bilinir. */}
                {visible.length > 1 ? (
                  <p className={styles.moreRow}>
                    <button
                      type="button"
                      className={styles.textLink}
                      aria-expanded={isOpen}
                      onClick={() =>
                        setExpanded((current) => ({ ...current, [entry.id]: !current[entry.id] }))
                      }
                    >
                      {isOpen ? 'Cevapları gizle' : `Tüm cevapları gör · ${visible.length} cevap`}
                    </button>
                  </p>
                ) : null}

                {shown.length > 0 ? (
                  <ul className={styles.replies}>
                    {shown.map((reply, index) => (
                      <li key={reply.id}>
                        <div
                          className={styles.message}
                          data-depth="reply"
                          data-part="answer"
                          data-visibility={reply.visibility ?? 'public'}
                        >
                          <Avatar author={reply.author} viewer={viewer} size="reply" />
                          <div className={styles.body}>
                            <p className={styles.line}>
                              <span className={styles.who}>{reply.author.label}</span>
                              <span className={styles.text}>{reply.body}</span>
                            </p>
                            <p className={styles.meta}>
                              {reply.author.role === 'seller' ? (
                                <span className={styles.roleChip}>İlan sahibi</span>
                              ) : null}
                              {isViewer(reply.author, viewer) && reply.author.role !== 'seller' ? (
                                <span className={styles.roleChip}>Siz</span>
                              ) : null}
                              <span className={styles.when}>
                                {formatDateShort(reply.answeredAt)}
                              </span>
                              {/* Damga sahibinin kendi içeriği için: neyin
                                  yayında olduğunu bilmeyen kullanıcı bırakılmaz. */}
                              {reply.visibility === 'hidden' ? (
                                <span className={styles.badge} data-kind="hidden">
                                  Gizli · yalnız siz
                                </span>
                              ) : null}
                              {reply.visibility === 'masked' ? (
                                <span className={styles.badge} data-kind="masked">
                                  Numara yayımlanmaz
                                </span>
                              ) : null}
                              {index === shown.length - 1 &&
                              viewer.signedIn &&
                              channelOpen &&
                              onYanitla ? (
                                <button
                                  type="button"
                                  className={styles.textLink}
                                  onClick={() => setReplyingTo(entry.id)}
                                >
                                  Yanıtla
                                </button>
                              ) : null}
                            </p>
                          </div>
                          <IslemlerMenu items={replyMenu(reply)} label="Yanıt için işlemler" />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {/* YALNIZ gerçekten yanıt yokken. Yanıtı gizlenmiş soru
                    "yanıtsız" diye etiketlenmez: boş bırakmak bir şey
                    söylememektir, yanlış söylemek değil. */}
                {entry.replies.length === 0 ? (
                  <p className={styles.pending} data-part="unanswered">
                    {UNANSWERED_TEXT}
                  </p>
                ) : null}

                {replying ? (
                  <ReplyBox
                    viewer={viewer}
                    onCancel={() => setReplyingTo(null)}
                    onSubmit={(text) => {
                      onYanitla?.(entry.id, text)
                      setReplyingTo(null)
                      setExpanded((current) => ({ ...current, [entry.id]: true }))
                    }}
                  />
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <div
          className={styles.empty}
          data-part="empty"
          data-projected={projected ? 'true' : undefined}
        >
          <p className={styles.emptyTitle}>
            {projected ? PROJECTED_EMPTY_TITLE : 'Bu ilana henüz soru sorulmadı.'}
          </p>
          <p className={styles.emptyNote}>
            {projected
              ? PROJECTED_EMPTY_NOTE
              : channelOpen
                ? 'İlk soruyu siz sorabilirsiniz: yazdığınız soru satıcıya iletilir ve yanıtıyla birlikte bu bölümde herkese açık görünür.'
                : 'Soru gönderme şu anda kapalı olduğu için bu bölüme yeni soru eklenemiyor.'}
          </p>
        </div>
      )}

      {canAsk ? (
        <form className={styles.compose} data-part="form" onSubmit={handleSubmit}>
          {viewer.initials ? (
            <span className={styles.avatar} data-kind="self" data-size="question" aria-hidden="true">
              {viewer.initials}
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          <div className={styles.composeBody}>
            <label className={styles.label} htmlFor={fieldId}>
              Sorunuz
            </label>
            {/* Alan içerik katmanındadır: cam yüzey açmaz, tokenlarla düz
                çizilir (sayfanın cam bütçesi kontrol katmanına ayrılmıştır). */}
            <textarea
              id={fieldId}
              className={styles.field}
              rows={2}
              value={draft}
              placeholder={viewer.label ? `${viewer.label} olarak soru sorun` : 'Sorunuzu yazın'}
              onChange={(event) => setDraft(event.target.value)}
              aria-describedby={`${hintId} ${statusId}`}
              aria-invalid={status?.tone === 'error' || undefined}
            />
            <p id={hintId} className={styles.hint} data-part="hint">
              {PUBLIC_NOTE}
            </p>
            <div className={styles.actions}>
              <button type="submit" className={styles.submit} data-part="submit">
                Gönder
              </button>
            </div>
            {/* Canlı bölge her zaman DOM'da durur: sonradan eklenen bir bölgenin
                ilk mesajı ekran okuyucuda duyurulmayabilir. */}
            <p
              id={statusId}
              role="status"
              className={styles.status}
              data-part="status"
              data-tone={status?.tone}
            >
              {status?.text ?? ''}
            </p>
          </div>
        </form>
      ) : channelOpen && onGirisIste ? (
        /* Kanal açık, oturum kapalı: kullanıcının ÇÖZEBİLECEĞİ bir durum,
           o yüzden paragraf değil kontrol. Boşuna yazdırmayız — kapı önde. */
        <div className={styles.gate} data-part="gate">
          <p className={styles.gateTitle}>Soru sormak için giriş yapın</p>
          <p className={styles.gateNote}>
            Mevcut sorular ve yanıtlar herkese açık; okumak giriş istemez. Giriş sonrası bu bölüme
            geri dönersiniz.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.submit} onClick={onGirisIste}>
              Giriş yapıp sorun
            </button>
          </div>
        </div>
      ) : (
        /* Kanal kapalı: giriş yapmak bunu AÇMAZ, o yüzden kontrol çizilmez. */
        <p className={styles.askClosed} data-part="ask-closed">
          {askDisabledReason ??
            (projected && entries.length === 0 ? PROJECTED_NOT_WIRED_TEXT : NOT_WIRED_TEXT)}
        </p>
      )}
    </section>
  )
}

/** Soru altındaki yanıt kutusu. Açılınca odak doğrudan alana gider. */
function ReplyBox({
  viewer,
  onSubmit,
  onCancel,
}: {
  viewer: ListingQnaViewer
  onSubmit: (text: string) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const fieldId = useId()

  useEffect(() => {
    fieldRef.current?.focus()
  }, [])

  return (
    <form
      className={styles.replyBox}
      onSubmit={(event) => {
        event.preventDefault()
        const text = draft.trim()
        if (text.length === 0) {
          setError('Göndermeden önce yanıtınızı yazın.')
          fieldRef.current?.focus()
          return
        }
        onSubmit(text)
      }}
    >
      {viewer.initials ? (
        <span className={styles.avatar} data-kind="self" data-size="reply" aria-hidden="true">
          {viewer.initials}
        </span>
      ) : (
        <span aria-hidden="true" />
      )}
      <div className={styles.composeBody}>
        <label className={styles.label} htmlFor={fieldId}>
          Yanıtınız
        </label>
        <textarea
          id={fieldId}
          ref={fieldRef}
          className={styles.field}
          rows={2}
          value={draft}
          placeholder="Yanıtınızı yazın"
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={error ? true : undefined}
        />
        <p className={styles.hint}>{PUBLIC_NOTE}</p>
        <div className={styles.actions}>
          {/* "Yanıtla" DEĞİL: satırdaki yanıt kontrolüyle aynı adı taşırsa
              iki farklı kontrol aynı erişilebilir adla duyurulur. */}
          <button type="submit" className={styles.submit}>
            Yanıtı gönder
          </button>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Vazgeç
          </button>
        </div>
        <p role="status" className={styles.status} data-tone={error ? 'error' : undefined}>
          {error ?? ''}
        </p>
      </div>
    </form>
  )
}
