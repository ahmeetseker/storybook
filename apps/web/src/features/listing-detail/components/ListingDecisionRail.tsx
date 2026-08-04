import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { GlassAlert, GlassButton } from '@repo/ui'

import type { ListingDetail } from '../domain/listing-detail-types'
import { criticalIssues, verificationScore } from '../domain/listing-detail-view-model'
import {
  contactClosedReason,
  formatArea,
  formatDateShort,
  formatPrice,
  formatUnitPrice,
} from '../format'
import { EvidenceState } from './EvidenceState'
import { STATE_LABEL, VERIFICATION_SECTION_ID } from './ListingIntro'
import {
  AGENCY_LICENCE_UNVERIFIED,
  INDIVIDUAL_TTBS_SCOPE_NOTE,
  TTBS_SCOPE_NOTE,
} from './seller-copy'
import { SELLER_SECTION_ID } from './seller-reveal'
import styles from '../ListingDetailWorkspace.module.css'

export interface ListingDecisionRailProps {
  detail: ListingDetail
  /** Birim fiyatın hangi alana dayandığını söyleyen görünür cümle */
  priceNote: string
  /**
   * Mesaj akışı sayfa kabuğunda bağlanır. **Verilmezse mesaj butonu hiç
   * çizilmez**: rotası olmayan kontrol çizilmez (`rules.md` §4), yerine tek
   * satırlık "yakında" notu durur. Verildiğinde mesajlaşma kartın birincil
   * eylemi olur — dolu buton her zaman çalışan eylemdir.
   */
  onContact?: () => void
  /**
   * Kullanıcıyı satıcı bölümündeki numara kontrolüne götürür. Mesajlaşma
   * bağlı değilken kartın **tek birincil eylemi** budur — sayfada gerçekten
   * çalışan karar eylemi o. Kart numarayı kendisi açmaz; açılış sözleşmesi
   * tek yerde (`SellerSection`) yaşar. Numara kontrolü sayfada yoksa eylem
   * `disabled` durur ve gerekçesi altında yazılıdır (`rules.md` §4).
   */
  onGoToSeller?: () => void
}

/**
 * Bağlanmamış yeteneklerin görünür gerekçeleri.
 *
 * Kural (bkz. `rules.md` §4): rotası veya işlevi olmayan **kontrol çizilmez**.
 * Mesajlaşma bu sürümde bağlı değildir; bu yüzden kartta mesaj butonu yoktur —
 * yeteneğin geleceği tek satırlık notla söylenir. Numara kontrolü gerçekten
 * var olabilen bir eylemdir; o yüzden kontrol çizilir ama kontrol yokken
 * `disabled` durur ve nedeni aynı yüzeyde yazılır.
 */
const MESSAGING_SOON =
  'Mesajlaşma sonraki fazda açılacak; mesaj gönderme bu sürümde bağlı değil.'
const SELLER_NAV_NOT_AVAILABLE =
  'Satıcı bilgilerine gitme kapalı: bu görünümde açılabilecek bir numara kontrolü yok.'

interface RailTab {
  id: 'ozet' | 'dogrulama' | 'satici'
  label: string
}

/** Sekme sırası sabittir: karar sırası da bu — önce olgular, sonra kanıt, sonra karşı taraf. */
const RAIL_TABS: RailTab[] = [
  { id: 'ozet', label: 'Özet' },
  { id: 'dogrulama', label: 'Doğrulama' },
  { id: 'satici', label: 'Satıcı' },
]

function sellerTypeLabel(type: ListingDetail['seller']['type']): string {
  return type === 'agency' ? 'Emlak ofisi' : 'Bireysel ilan sahibi'
}

/**
 * Karar kartı — "sekmeli yoğunluk" (Varyant D).
 *
 * Kart tek bir yüzeydir ve iskeleti sabittir; yalnız ortadaki panel değişir:
 *
 * 1. **Fiyat bloğu (sabit)** — sayfanın en büyük sayısı ve altında tek satırlık
 *    dayanağı. Fiyat kartta **ikinci kez geçmez**: eski sticky "fiyat çapası"
 *    kaldırıldı, çünkü aynı sayıyı aynı kolonda iki kez yazmak hiyerarşiyi
 *    böler (bkz. `rules.md` §1b).
 * 2. **Sekmeler (sabit)** — `Özet · Doğrulama · Satıcı`. WAI-ARIA tabs deseni
 *    yerel yazılmıştır: `tablist`/`tab`/`tabpanel`, `aria-selected`,
 *    `aria-controls`, roving tabindex, ←/→/↑/↓ ve Home/End. Kütüphanenin
 *    `GlassTabs` bileşeni sözleşmeyi karşılar ama her zaman **cam bir sekme
 *    çubuğu + ikinci bir GlassSurface panel** açar; bu kartın içinde o, kart
 *    içinde kart olurdu ve cam bütçesini artırırdı.
 *    `GlassSegmentedControl` ise `radiogroup`'tur, sekme değildir.
 * 3. **Panel** — üç panelin en uzunu kadar `min-block-size` taşır: sekme
 *    değişince kart zıplamaz. Yalnız aktif panel DOM'dadır; kapalı panel
 *    içeriği sayfanın kanıt bölümlerinin metinlerini ikinci kez üretmez.
 * 4. **Eylemler (sabit)** — kartın alt bölgesi, ayrı bir iç kutu değil. Tek
 *    birincil eylem (`data-variant="primary"`) satıcı bilgilerine gider;
 *    `Kaydet` ikincildir; mesajlaşma buton değil tek satırlık nottur.
 *
 * Kart yapışkandır (`position: sticky`): okuyucu kanıt bölümlerini tararken
 * fiyat, açık konular ve tek eylem yanında kalır. Sabit iskelet bunu mümkün
 * kılar — kartın yüksekliği sekmeden bağımsız olduğu için ekranı taşırmaz.
 *
 * Kart yalnız geniş yerleşimde çizilir; dar yerleşimde yerini `ListingDock`
 * alır ve dock kartın eylemlerini **kopyalamaz** (`rules.md` §1b).
 */
export function ListingDecisionRail({
  detail,
  priceNote,
  onContact,
  onGoToSeller,
}: ListingDecisionRailProps) {
  const baseId = useId()
  const [activeTab, setActiveTab] = useState<RailTab['id']>('ozet')
  const [saved, setSaved] = useState(false)
  const tabRefs = useRef<Partial<Record<RailTab['id'], HTMLButtonElement | null>>>({})

  const closedReason = contactClosedReason(detail.lifecycle)
  const contactClosed = closedReason !== undefined
  const { seller } = detail
  const score = verificationScore(detail.verification)
  const issues = criticalIssues(detail)

  // Birincil eylem = gerçekten çalışan en güçlü eylem. Mesajlaşma bağlıysa o,
  // değilse satıcı bilgilerine gitme. Sayfada her zaman tek `data-variant`
  // primary bulunur.
  const messagingLive = onContact !== undefined && !contactClosed
  const sellerNavLive = onGoToSeller !== undefined && !contactClosed

  const tabId = (id: RailTab['id']) => `${baseId}-sekme-${id}`
  const panelId = (id: RailTab['id']) => `${baseId}-panel-${id}`

  // WAI-ARIA tabs: seçim odağı izler, ok tuşları dolanır, Home/End uçlara gider.
  const onTablistKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = RAIL_TABS.findIndex((tab) => tab.id === activeTab)
    let next = -1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (index + 1) % RAIL_TABS.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (index - 1 + RAIL_TABS.length) % RAIL_TABS.length
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = RAIL_TABS.length - 1
    }
    if (next === -1) return
    event.preventDefault()
    const nextTab = RAIL_TABS[next]
    setActiveTab(nextTab.id)
    tabRefs.current[nextTab.id]?.focus()
  }

  return (
    <aside className={styles.rail} aria-label="Karar kolonu">
      <div className={styles.railCard}>
        {/* 1 — Fiyat: kolonda tek kez, tek dayanak satırıyla. */}
        <div className={styles.priceBlock}>
          <p className={styles.price}>{formatPrice(detail.price.amount)}</p>
          {/* Birim fiyat fiyatın hemen altında durur; hangi alana dayandığı
              Özet panelinde tek cümleyle yazılır — aynı sayı kartta iki kez
              vurgulanmaz. */}
          <p className={styles.priceBasis}>{formatUnitPrice(detail.price.unitPrice)}</p>
        </div>

        {/* 2 — Sekmeler. */}
        <div
          role="tablist"
          aria-label="Karar kartı bölümleri"
          className={styles.tabStrip}
          onKeyDown={onTablistKeyDown}
        >
          {RAIL_TABS.map((tab) => {
            const selected = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={tabId(tab.id)}
                ref={(node) => {
                  tabRefs.current[tab.id] = node
                }}
                aria-selected={selected}
                aria-controls={panelId(tab.id)}
                tabIndex={selected ? 0 : -1}
                className={styles.tab}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* 3 — Panel: yüksekliği sekmeden bağımsız. */}
        <div
          role="tabpanel"
          id={panelId(activeTab)}
          aria-labelledby={tabId(activeTab)}
          tabIndex={0}
          className={styles.tabPanel}
        >
          {activeTab === 'ozet' ? (
            <>
              <dl className={styles.factGrid}>
                <div>
                  <dt>Beyan edilen alan</dt>
                  <dd>{formatArea(detail.price.declaredArea)}</dd>
                </div>
                <div>
                  <dt>Doğrulama</dt>
                  <dd>{`${score.positive}/${score.total} olumlu`}</dd>
                </div>
                <div>
                  <dt>Yayın tarihi</dt>
                  {/* "Yayın yaşı" değil tarih: yaş `now` ister, görünüm katmanı
                      saati okumaz (`rules.md` §11 determinizm kuralı). */}
                  <dd>{formatDateShort(detail.publishedAt)}</dd>
                </div>
                <div>
                  <dt>İlan no</dt>
                  <dd>{detail.listingNumber}</dd>
                </div>
              </dl>
              <p className={styles.panelNote}>{priceNote}</p>

              {/* Uyarı şeridi: duvar metin değil — başlık, kısa gerekçe,
                  sonraki adım. Accordion arkasına saklanmaz (`rules.md` §4). */}
              <section className={styles.issueBlock} aria-labelledby="kritik-baslik">
                <div className={styles.blockHead}>
                  <h3 id="kritik-baslik" className={styles.railTitle}>
                    Görüşmeden önce çözülmesi gerekenler
                  </h3>
                  {issues.length > 0 ? (
                    <span className={styles.countChip}>{`${issues.length} konu`}</span>
                  ) : null}
                </div>
                {issues.length === 0 ? (
                  <p className={styles.panelNote}>
                    Bu ilanda karar öncesi çözülmesi gereken bir konu bulunmadı.
                  </p>
                ) : (
                  <ul className={styles.issueList}>
                    {issues.map((issue) => (
                      <li key={issue.id} className={styles.issueItem}>
                        <p className={styles.issueTitle}>{issue.title}</p>
                        <p className={styles.issueDetail}>{issue.detail}</p>
                        {issue.action ? (
                          <p className={styles.issueAction}>
                            <span className={styles.issueActionLabel}>Sonraki adım:</span>{' '}
                            {issue.action}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : null}

          {activeTab === 'dogrulama' ? (
            <>
              <p className={styles.panelNote}>
                {`${score.total} kontrolün ${score.positive} tanesi olumlu`}
              </p>
              <ul className={styles.checkList}>
                {detail.verification.map((row) => (
                  <li key={row.id} className={styles.checkRow}>
                    <span className={styles.checkTitle}>{row.title}</span>
                    {/* Bandın her yerindeki durum işaretiyle aynı component;
                        değişen yalnız `variant` — kart 340px'tir, işaret
                        burada kapsül içinde durur. */}
                    <EvidenceState tone={row.state} variant="chip">
                      {STATE_LABEL[row.state]}
                    </EvidenceState>
                  </li>
                ))}
              </ul>
              <a className={styles.cardLink} href={`#${VERIFICATION_SECTION_ID}`}>
                Doğrulama vektörünün tamamı
              </a>
            </>
          ) : null}

          {activeTab === 'satici' ? (
            <>
              <dl className={styles.factGrid}>
                {seller.activeListings !== undefined ? (
                  <div>
                    <dt>Aktif ilan</dt>
                    <dd>{seller.activeListings}</dd>
                  </div>
                ) : null}
                {seller.respondsInHours !== undefined ? (
                  <div>
                    <dt>Ortalama yanıt</dt>
                    <dd>{`${seller.respondsInHours} saat`}</dd>
                  </div>
                ) : null}
                {seller.memberSince ? (
                  <div>
                    <dt>Üyelik</dt>
                    <dd>{formatDateShort(seller.memberSince)}</dd>
                  </div>
                ) : null}
              </dl>
              {/* Numara burada AÇILMAZ: açılış sözleşmesi tek yerde yaşar
                  (`SellerSection`, `rules.md` §7). Kart yalnız oraya götürür. */}
              <p className={styles.panelNote}>
                Numara yalnız istek anında, satıcı bölümündeki tek kontrolle açılır.
              </p>
              {/* Kapsam cümlesi satıcı bölümüyle tek kaynaktan gelir: aynı
                  satıcı hakkında iki farklı ifade iki ayrı iddia olurdu. */}
              <p className={styles.panelNote}>{TTBS_SCOPE_NOTE}</p>
              <a className={styles.cardLink} href={`#${SELLER_SECTION_ID}`}>
                Satıcı bölümü
              </a>
            </>
          ) : null}
        </div>

        {/* 4 — Eylemler: kartın alt bölgesi, ayrı bir kutu değil. */}
        <div className={styles.cardActions}>
          <div className={styles.actionContext}>
            <p className={styles.sellerName}>{seller.name}</p>
            <p className={styles.sellerMeta}>{sellerTypeLabel(seller.type)}</p>
            {/* Yetki belgesi satırı yalnız kontrolün gerçekten uygulanabildiği
                yerde bir sonuç bildirir. Bireysel satıcı TTBS kapsamında
                değildir; orada "doğrulanamadı" demek hiç yapılmamış bir
                kontrolün başarısız olduğunu iddia etmek olurdu. Metinler satıcı
                bölümüyle tek kaynaktan gelir (`seller-copy.ts`). */}
            {seller.type === 'agency' ? (
              seller.licence?.value ? (
                <p className={styles.sellerMeta}>{`Yetki belgesi: ${seller.licence.value}`}</p>
              ) : (
                <p className={styles.sellerMeta}>{AGENCY_LICENCE_UNVERIFIED}</p>
              )
            ) : (
              <p className={styles.sellerMeta}>{INDIVIDUAL_TTBS_SCOPE_NOTE}</p>
            )}
          </div>

          <div className={styles.actionRow}>
            {messagingLive ? (
              <>
                <GlassButton
                  prominent
                  data-variant="primary"
                  className={styles.primaryAction}
                  onClick={() => onContact?.()}
                >
                  Mesaj gönder
                </GlassButton>
                <GlassButton
                  className={styles.secondaryAction}
                  disabled={!sellerNavLive}
                  onClick={() => onGoToSeller?.()}
                >
                  Satıcı bilgilerine git
                </GlassButton>
              </>
            ) : (
              <GlassButton
                prominent
                data-variant="primary"
                className={styles.primaryAction}
                disabled={!sellerNavLive}
                onClick={() => onGoToSeller?.()}
              >
                Satıcı bilgilerine git
              </GlassButton>
            )}
            <GlassButton
              className={styles.secondaryAction}
              aria-pressed={saved}
              onClick={() => setSaved((value) => !value)}
            >
              {saved ? 'Kayıtlı' : 'Kaydet'}
            </GlassButton>
          </div>

          {/* Bağlanmamış yetenek buton olarak çizilmez; gerekçesi kaybolmaz.
              İletişim kapalıyken neden zaten alttaki uyarıda yazılıdır. */}
          {!contactClosed && !messagingLive ? (
            <p className={styles.actionNote}>{MESSAGING_SOON}</p>
          ) : null}
          {!contactClosed && onGoToSeller === undefined ? (
            <p className={styles.actionNote}>{SELLER_NAV_NOT_AVAILABLE}</p>
          ) : null}
        </div>

        {closedReason ? (
          <GlassAlert severity="warning" title="İletişim kapalı">
            {closedReason}
          </GlassAlert>
        ) : null}
      </div>
    </aside>
  )
}
