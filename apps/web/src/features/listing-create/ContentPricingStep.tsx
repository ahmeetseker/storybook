import { useState } from 'react'
import { GlassCheckbox } from '@repo/ui'
import type {
  ListingContent,
  ListingLocation,
  ListingMediaItem,
  ListingProperty,
} from './listing-create-domain'
import { formatUnitPrice } from './listing-create-domain'
import {
  formatPricingEstimate,
  getListingPricingInsight,
} from './listing-pricing-fixtures'
import { ListingField } from './ListingField'
import { ListingGroup, ListingStepIntro } from './ListingSection'
import { districtLabels } from './listing-labels'
import { listingFieldA11y } from './listing-field-a11y'
import styles from './ListingCreateWorkspace.module.css'

interface ContentPricingStepProps {
  value: ListingContent
  property: ListingProperty
  location: ListingLocation
  /** Kapak fotoğrafı canlı önizleme panelinde gösterilir; burada yalnız sayılır. */
  media: ListingMediaItem[]
  errors: Record<string, string>
  onChange: (value: ListingContent) => void
}

interface CopyProposal {
  title: string
  description: string
  reason: string
}

const highlightOptions = [
  'Yola cepheli',
  'Müstakil tapu',
  'Denize yakın',
  'Yatırıma uygun',
  'Merkezi konum',
]

function buildCopyProposal(
  property: ListingProperty,
  location: ListingLocation,
): CopyProposal {
  const district = districtLabels[location.district] ?? 'Seçkin konumda'
  const area = property.area || property.grossArea
  const type =
    property.family === 'land'
      ? 'imarlı arsa'
      : property.family === 'residential'
        ? 'ferah konut'
        : 'nitelikli gayrimenkul'
  const areaPhrase = area ? `${area} m² ` : ''

  return {
    title: `${district}’da ${areaPhrase}${type}`,
    description:
      `${district} bölgesinde konumlanan bu mülk; ulaşım, çevre olanakları ve kullanım potansiyeliyle öne çıkıyor. ` +
      'Tapu, konum ve teknik bilgileri kendi belgelerinizle karşılaştırarak inceleyin. ' +
      'Detaylı bilgi ve yerinde inceleme için güvenli mesajlaşma üzerinden iletişime geçebilirsiniz.',
    reason:
      'Başlıkta konum, alan ve mülk türü öne çıkarıldı; açıklamadaki doğrulanmamış kesinlik ifadeleri sınırlandı.',
  }
}

export function ContentPricingStep({
  value,
  property,
  location,
  media,
  errors,
  onChange,
}: ContentPricingStepProps) {
  const [proposal, setProposal] = useState<CopyProposal | null>(null)
  const set = <K extends keyof ListingContent>(key: K, next: ListingContent[K]) => {
    onChange({ ...value, [key]: next })
  }
  const area = property.area || property.grossArea
  const pricingInsight = getListingPricingInsight(property, location)
  const hasRiskyClaim =
    /\b(garantili|kesin kazanç|resmi olarak doğrulandı|en iyi yatırım)\b/i.test(
      value.description,
    )
  const readyMedia = media.filter((item) => item.status === 'ready').length
  /* `formatUnitPrice` iki değerden biri boşken NaN üretiyor; hesap ancak
     fiyat ve alan birlikte girildiğinde gösterilir. */
  const unitPrice =
    value.price.trim() && area.trim()
      ? formatUnitPrice(value.price, area)
      : '—'

  const toggleHighlight = (highlight: string) => {
    set(
      'highlights',
      value.highlights.includes(highlight)
        ? value.highlights.filter((item) => item !== highlight)
        : [...value.highlights, highlight],
    )
  }

  return (
    <section className={styles.stepSection} aria-labelledby="content-step-title">
      <ListingStepIntro
        headingId="content-step-title"
        stepIndex={4}
        stepCount={5}
        title="Fiyat ve ilan metni"
        description="Fiyatı şeffaf biçimde sunun; başlık ve açıklamada yalnızca doğrulayabildiğiniz özellikleri kullanın."
        note="AI yalnız önerir, siz uygularsınız"
      />

      <ListingGroup
        id="content-pricing"
        title="Fiyat"
        description="Birim fiyat, mülk adımında girdiğiniz alandan otomatik hesaplanır."
        requirement="required"
      >
        <div className={styles.pricingBlock}>
          <ListingField
            id="content-price"
            label={property.transaction === 'rent' ? 'Aylık kira bedeli' : 'Satış fiyatı'}
            required
            error={errors.price}
          >
            <div className={styles.priceControl}>
              <input
                className={styles.flatControl}
                value={value.price}
                inputMode="numeric"
                required
                onChange={(event) =>
                  set('price', event.target.value.replace(/[^\d]/g, ''))
                }
                placeholder="Örn. 5000000"
                {...listingFieldA11y('content-price', errors.price)}
              />
              <span>TL</span>
            </div>
          </ListingField>
          <div className={styles.unitPrice}>
            <span>Hesaplanan birim fiyat</span>
            <strong>{unitPrice}</strong>
            <small>{area ? `${area} m² üzerinden` : 'Alan bilgisi girildiğinde hesaplanır'}</small>
          </div>
        </div>

        <section
          className={styles.pricingIntelligence}
          aria-labelledby="pricing-intelligence-title"
        >
          <div className={styles.pricingInsightHeader}>
            <div>
              <span>Fiyat istihbaratı · Demo tahmin</span>
              <h2 id="pricing-intelligence-title">
                {pricingInsight.scopeLabel} için bölgesel görünüm
              </h2>
            </div>
            <strong>{pricingInsight.confidenceLabel}</strong>
          </div>
          <div className={styles.pricingRange}>
            <div>
              <span>Önerilen aralık</span>
              <strong>
                {formatPricingEstimate(pricingInsight.lowerEstimate)} –{' '}
                {formatPricingEstimate(pricingInsight.upperEstimate)}
              </strong>
            </div>
            <div>
              <span>Örneklem</span>
              <strong>{pricingInsight.comparableCount || '—'} benzer ilan</strong>
            </div>
            <div>
              <span>Veri tarihi</span>
              <strong>{pricingInsight.refreshedLabel}</strong>
            </div>
          </div>
          <p>{pricingInsight.disclaimer}</p>
        </section>
      </ListingGroup>

      <ListingGroup
        id="content-copy"
        title="İlan metni"
        description="Başlığın ilk 50 karakteri arama sonuçlarında görünür."
        requirement="required"
        meta={
          <span className={styles.mediaCounter}>
            <strong>{readyMedia}</strong> fotoğraf hazır
          </span>
        }
      >
        <ListingField
          id="content-title"
          label="İlan başlığı"
          required
          error={errors.title}
          description="En önemli farkı ilk 50 karakterde anlatın."
        >
          <input
            className={styles.flatControl}
            value={value.title}
            maxLength={70}
            required
            onChange={(event) => set('title', event.target.value)}
            placeholder="Örn. Urla’da denize yakın imarlı köşe parsel"
            {...listingFieldA11y(
              'content-title',
              errors.title,
              'En önemli farkı ilk 50 karakterde anlatın.',
            )}
          />
          <span className={styles.characterCount} data-warning={value.title.length > 50 || undefined}>
            {value.title.length}/70
          </span>
        </ListingField>

        <ListingField
          id="content-description"
          label="İlan açıklaması"
          required
          error={errors.description}
          description="Mülkü, çevreyi ve doğrulanabilir teknik bilgileri açıkça anlatın."
        >
          <textarea
            className={styles.flatTextarea}
            value={value.description}
            rows={8}
            required
            onChange={(event) => set('description', event.target.value)}
            placeholder="Mülkün öne çıkan özellikleri, ulaşım olanakları ve teknik detayları…"
            {...listingFieldA11y(
              'content-description',
              errors.description,
              'Mülkü, çevreyi ve doğrulanabilir teknik bilgileri açıkça anlatın.',
            )}
          />
        </ListingField>

        <div className={styles.copyRiskCheck} data-warning={hasRiskyClaim || undefined}>
          <div>
            <span>İfade kontrolü · Demo</span>
            <strong>
              {hasRiskyClaim
                ? 'Kesinlik bildiren ifadeleri gözden geçirin'
                : 'Belirgin bir yanıltıcı kesinlik ifadesi bulunmadı'}
            </strong>
          </div>
          <small>
            Bu otomatik dil kontrolü hukuki inceleme değildir; ilan doğruluğu
            yayınlayanın sorumluluğundadır.
          </small>
        </div>
      </ListingGroup>

      <ListingGroup
        id="content-highlights"
        title="Öne çıkan özellikler"
        description="Seçtikleriniz ilan kartında rozet olarak görünür."
        requirement="optional"
      >
        <fieldset
          className={styles.choiceFieldset}
          aria-labelledby="content-highlights-group-title"
        >
          <div className={styles.highlightChoices}>
            {highlightOptions.map((highlight) => (
              <button
                key={highlight}
                type="button"
                aria-pressed={value.highlights.includes(highlight)}
                onClick={() => toggleHighlight(highlight)}
              >
                {highlight}
              </button>
            ))}
          </div>
        </fieldset>
      </ListingGroup>

      <ListingGroup
        id="content-ai"
        title="AI metin yardımcısı"
        description="Öneri önce ayrı gösterilir; siz onaylamadan alanlara yazılmaz."
        requirement="optional"
        meta={<span className={styles.demoTag}>Demo</span>}
      >
        <div className={styles.aiCopy}>
          <p>
            Girdiğiniz mülk ve konum bilgilerinden kontrollü bir başlık ve
            açıklama taslağı üretilir.
          </p>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => setProposal(buildCopyProposal(property, location))}
          >
            AI metni öner
          </button>
        </div>

        {proposal ? (
          <div className={styles.copyProposal} aria-label="AI metin önerisi">
            <div className={styles.proposalStatus}>
              <span>Öneri hazır · Henüz uygulanmadı</span>
              <strong>Kontrol sizde</strong>
            </div>
            <h3>{proposal.title}</h3>
            <p>{proposal.description}</p>
            <p className={styles.proposalReason}>
              <strong>Neden bu değişiklik?</strong> {proposal.reason}
            </p>
            <div className={styles.proposalActions}>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => setProposal(null)}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => {
                  onChange({ ...value, title: proposal.title })
                }}
              >
                Yalnız başlığı uygula
              </button>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => {
                  onChange({ ...value, description: proposal.description })
                }}
              >
                Yalnız açıklamayı uygula
              </button>
              <button
                type="button"
                className={styles.primaryFlatAction}
                onClick={() => {
                  onChange({
                    ...value,
                    title: proposal.title,
                    description: proposal.description,
                  })
                  setProposal(null)
                }}
              >
                Metni uygula
              </button>
            </div>
          </div>
        ) : null}
      </ListingGroup>

      <ListingGroup
        id="content-consent"
        title="Beyan ve onaylar"
        description="Her iki onay da yayın için zorunludur."
        requirement="required"
      >
        <div className={styles.consentBlock}>
          <GlassCheckbox
            id="risk-accepted"
            checked={value.riskAccepted}
            required
            onChange={(event) => set('riskAccepted', event.target.checked)}
            aria-invalid={Boolean(errors.riskAccepted) || undefined}
            aria-describedby={errors.riskAccepted ? 'risk-accepted-error' : undefined}
            label={
              <>
                <strong>İlan bilgilerinin doğru olduğunu beyan ediyorum.</strong>
                <small>Yanıltıcı, eksik veya doğrulanamayan bilgi yayınlamayacağım.</small>
              </>
            }
          />
          <p id="risk-accepted-error" className={styles.fieldError}>{errors.riskAccepted ?? ''}</p>
          <GlassCheckbox
            id="legal-consent"
            checked={value.legalConsent}
            required
            onChange={(event) => set('legalConsent', event.target.checked)}
            aria-invalid={Boolean(errors.legalConsent) || undefined}
            aria-describedby={errors.legalConsent ? 'legal-consent-error' : undefined}
            label={
              <>
                <strong>İlan yayın koşullarını ve kişisel veri metnini kabul ediyorum.</strong>
                <small>İlan, doğrulama tamamlandıktan sonra yayına alınır.</small>
              </>
            }
          />
          <p id="legal-consent-error" className={styles.fieldError}>{errors.legalConsent ?? ''}</p>
        </div>
      </ListingGroup>
    </section>
  )
}
