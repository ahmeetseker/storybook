import { PageContainer } from '@/components/PageContainer'
import { DocumentsSection } from './components/DocumentsSection'
import { ListingDecisionRail } from './components/ListingDecisionRail'
import { ListingDock } from './components/ListingDock'
import { ListingEvidenceBrief } from './components/ListingEvidenceBrief'
import { ListingLedger, ListingTally } from './components/ListingLedger'
import { ListingQuestions } from './components/ListingQuestions'
import { ListingStage } from './components/ListingStage'
import { listingQuestions } from './components/listing-question-set'
import { SellerSection, type SellerPhoneAnalyticsEvent } from './components/SellerSection'
import { hasSellerRevealControl, SELLER_REVEAL_CONTROL_ID } from './components/seller-reveal'
import type { ListingDetailResult } from './data/listing-detail-adapter'
import { hasConflict } from './domain/evidence'
import type { ListingDetail } from './domain/listing-detail-types'
import { formatArea, formatDate, formatPrice, formatUnitPrice } from './format'
import styles from './ListingDetailWorkspace.module.css'

export interface ListingDetailWorkspaceProps {
  result: ListingDetailResult
  /**
   * Satıcı numarasını istek anında getirir. Sayfa kabuğunda bağlanır;
   * verilmezse satıcı bölümü numara açma kontrolünü hiç render etmez —
   * çalışmayan bir buton gösterilmez.
   */
  onRevealPhone?: () => Promise<string>
  /**
   * Mesaj akışını bağlar. Verilmezse karar rayının birincil eylemi `disabled`
   * render edilir ve gerekçesi rayda görünür kalır (`rules.md` §4).
   */
  onContact?: () => void
  /**
   * "Yanlış bilgi bildir" akışını bağlar. Verilmezse kontrol `disabled`
   * render edilir ve gerekçesi altında yazılır (`rules.md` §4).
   */
  onReportIssue?: () => void
  /** Numara açma olayları (yalnız olay adı; numara asla gönderilmez) */
  onAnalyticsEvent?: (event: SellerPhoneAnalyticsEvent) => void
}

/** Birim fiyatın hangi alana dayandığı gizlenmez; çelişki varsa aynı cümlede söylenir. */
function priceNote(detail: ListingDetail): string {
  const declared = formatArea(detail.price.declaredArea)
  if (detail.kind === 'land') {
    const recorded = detail.parcel.area.value
    if (hasConflict(detail.parcel.area) && recorded !== undefined) {
      return `Birim fiyat beyan edilen ${declared} alana göre; kayıtlı yüzölçümü ${formatArea(recorded)}.`
    }
  }
  return `Birim fiyat beyan edilen ${declared} alana göre hesaplandı.`
}

/**
 * Kullanıcıyı satıcı bölümündeki numara kontrolüne taşır.
 *
 * Numara burada açılmaz — açılış sözleşmesi tek bir yerde, `SellerSection`
 * içinde yaşar. Bu yalnız gezinmedir: kontrolü görünür alana getirir ve odağı
 * ona verir. `prefers-reduced-motion` altında kaydırma anidir.
 */
function goToSellerRevealControl(): void {
  const target = document.getElementById(SELLER_REVEAL_CONTROL_ID)
  if (!target) return

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  // jsdom `scrollIntoView`'ı uygulamaz; odak taşıma kaydırmadan bağımsız çalışır.
  target.scrollIntoView?.({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
  target.focus()
}

/**
 * İlan detayı — "sahne açar, sorular taşır" yerleşimi.
 *
 * Sayfa üç parçadan oluşur:
 *
 * 1. **Sahne** — tam genişlik medya, üstünde cam künye kapsülü, altında cam
 *    plaka içinde başlık ve konum. Fiyat burada değildir.
 * 2. **Akış** — fiyat/durum ikilisi, ardından soru omurgası (bölüm başlığı
 *    yerine alıcının sorduğu cümle), ardından doğrulama defteri. Defter en
 *    sondadır çünkü o bir soru değil, sayfanın zeminidir.
 * 3. **Karar** — dar ve orta yerleşimde yapışkan dock, geniş yerleşimde
 *    340px'lik karar kolonu. İkisi asla birlikte görünmez.
 *
 * Üç yerleşim TEK markup'tan doğar ve kırılmalar container query'dir
 * (700px / 1100px): davranış kabın genişliğine bağlıdır, viewport'a değil.
 *
 * Cam bütçesi: sahne kapsülü + sahne plakası + dock = 3 yüzey; geniş
 * yerleşimde dock düştüğü için 2'ye iner. Sayfa sınırı 6'dır.
 *
 * Fiyat sayfada yalnız bir kez büyür: dar yerleşimde akıştaki fiyat bloğunda,
 * geniş yerleşimde karar kolonunda. Dock'taki çapa `body` ölçeğinde tek
 * satırdır — ikinci bir vurgu değil, kaydırılıp gitmiş değerin referansı.
 */
export function ListingDetailWorkspace({
  result,
  onRevealPhone,
  onContact,
  onReportIssue,
  onAnalyticsEvent,
}: ListingDetailWorkspaceProps) {
  const { detail, sections, aiBrief } = result
  const questions = listingQuestions(detail, sections.map)

  return (
    // Sorgu kabı PageContainer'dır: `.page` kendi kabı olsaydı kendi
    // yerleşimini `@container` ile değiştiremezdi.
    // Kademe `base`: karar kolonu 1100px'lik kap eşiğinde açılır; `narrow`
    // (72rem) kabı gutter düştükten sonra 1072px'te kaldığı için o eşiği
    // hiçbir zaman geçemezdi ve ray sessizce hiç görünmezdi.
    <PageContainer size="base">
      {/* Izgara kabın KENDİSİNDE değil, içinde duran bu sarmalayıcıdadır:
          bir öğe kendi `@container` sorgusuna yanıt veremez, kap üzerine
          yazılan kolon kuralı hiçbir genişlikte eşleşmezdi. */}
      <div className={styles.page}>
        <ListingStage detail={detail} />

        <div className={styles.flow}>
          {/* Fiyat + dosyanın durumu. Geniş yerleşimde fiyat karar kolonuna
              taşınır ve buradaki blok gizlenir — sayfanın en büyük sayısı tek
              bir yerde durur. */}
          <div className={styles.duo}>
            <div className={styles.flowPrice}>
              <p className={styles.kicker}>Fiyat</p>
              <p className={styles.price}>{formatPrice(detail.price.amount)}</p>
              <p className={styles.priceNote}>
                {formatUnitPrice(detail.price.unitPrice)} · {priceNote(detail)}
              </p>
            </div>
            <div>
              <p className={styles.kicker}>Bu dosyanın durumu</p>
              <ListingTally rows={detail.verification} />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Alıcıların sorduğu sırayla</h2>
            <p className={styles.sectionNote}>
              Her soru kapalıyken de cevaplı. Açmak cevabı değil, dayanağını getirir.
            </p>
            <ListingQuestions questions={questions} />
          </div>

          <div className={styles.section}>
            <ListingEvidenceBrief brief={aiBrief} detail={detail} onReportIssue={onReportIssue} />
          </div>

          <div className={styles.section}>
            <ListingLedger detail={detail} />
          </div>

          <div className={styles.section}>
            <DocumentsSection detail={detail} />
          </div>
        </div>

        <ListingDecisionRail
          detail={detail}
          priceNote={priceNote(detail)}
          onContact={onContact}
          onGoToSeller={
            hasSellerRevealControl(detail, onRevealPhone) ? goToSellerRevealControl : undefined
          }
        />

        {/* Satıcı ızgaranın ikinci satırındadır: karar kolonu kanıt akışıyla
            birlikte biter, satıcı bölümüyle hiçbir zaman yan yana durmaz. */}
        <div className={styles.seller}>
          <SellerSection
            detail={detail}
            onRevealPhone={onRevealPhone}
            onAnalyticsEvent={onAnalyticsEvent}
          />
        </div>

        <ListingDock detail={detail} onContact={onContact} />
      </div>
    </PageContainer>
  )
}
