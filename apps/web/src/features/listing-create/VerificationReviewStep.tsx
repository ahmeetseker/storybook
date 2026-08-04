import {
  getStepValidation,
  type ListingDraft,
  type ListingStepId,
  type PublisherRole,
} from './listing-create-domain'
import { ListingGroup, ListingStepIntro } from './ListingSection'
import { locationChain } from './listing-labels'
import styles from './ListingCreateWorkspace.module.css'

interface VerificationReviewStepProps {
  draft: ListingDraft
  errors: Record<string, string>
  onVerify: () => void
  onEdit: (step: ListingStepId) => void
}

const roleGuidance: Record<
  Exclude<PublisherRole, ''>,
  { title: string; description: string }
> = {
  owner: {
    title: 'Mülk sahibi doğrulaması',
    // EİDS yalnız ilan verme yetkisini kurar: kimliğin malik kaydında görünüp
    // görünmediği sorgulanır. Tapu niteliği, takyidat veya imar bu kontrolün
    // kapsamında değildir — kapsam cümlesi adımın altında görünür.
    description: 'Kimliğinizin malik kaydında görünüp görünmediği sorgulanır',
  },
  relative: {
    title: 'Yakınlık doğrulaması',
    description: 'Eş veya birinci / ikinci derece kan hısımlığı kontrol edilir',
  },
  agency: {
    title: 'Emlak işletmesi yetki doğrulaması',
    description:
      'Mülk sahibinin e-Devlet üzerinden verdiği süreli ilan yetkisi aranır',
  },
}

function maskedPropertyNumber(value: string): string {
  if (value.length <= 4) return value
  return `•••• •••• ${value.slice(-4)}`
}

function reviewStatus(draft: ListingDraft, step: ListingStepId) {
  return getStepValidation(draft, step).valid ? 'Hazır' : 'Eksik bilgi var'
}

export function VerificationReviewStep({
  draft,
  errors,
  onVerify,
  onEdit,
}: VerificationReviewStepProps) {
  const { verification, property, location, media, content } = draft
  const role = property.publisherRole || 'owner'
  const guidance = roleGuidance[role]
  const verificationValidation = getStepValidation(draft, 'verification')
  const staleVerification =
    verification.status === 'verified' && !verificationValidation.valid
  const readyMedia = media.filter((item) => item.status === 'ready').length
  const locationText = locationChain(location) || 'Konum henüz tamamlanmadı'

  return (
    <section className={styles.stepSection} aria-labelledby="verification-step-title">
      <ListingStepIntro
        headingId="verification-step-title"
        stepIndex={5}
        stepCount={5}
        title="Doğrulama ve yayın"
        description="İlanı yayınlamadan önce yetkiyi doğrulayın ve girdiğiniz bilgileri son kez kontrol edin."
        note="Yayın öncesi zorunlu kontrol"
      />

      <section
        className={styles.eidsCard}
        aria-labelledby="eids-card-title"
        aria-busy={verification.status === 'checking' || undefined}
      >
        <header className={styles.eidsHeader}>
          <div>
            <p className={styles.contextEyebrow}>EİDS yetki doğrulaması</p>
            <h2 id="eids-card-title">{guidance.title}</h2>
            <p>{guidance.description}</p>
          </div>
          <span className={styles.demoTag}>Güvenli demo</span>
        </header>

        {role === 'agency' ? (
          <p className={styles.disclosure}>
            EİDS ilan yetkisi, emlak işletmeleri için mevzuat gereği düzenlenmesi
            gereken sözleşmelerin yerine geçmez.
          </p>
        ) : null}
        <p className={styles.demoDisclosure}>
          Demo bağlantısı — gerçek Ticaret Bakanlığı veya e-Devlet sistemine
          bağlantı kurulmaz.
        </p>

        <dl className={styles.eidsFacts}>
          <div>
            <dt>İlan veren</dt>
            <dd>{guidance.title}</dd>
          </div>
          <div>
            <dt>Taşınmaz numarası</dt>
            <dd>{maskedPropertyNumber(location.propertyNumber) || 'Eksik'}</dd>
          </div>
        </dl>

        {verification.status === 'idle' ? (
          <div className={styles.verificationAction}>
            <p>
              Kontrol yalnızca taşınmaz numarası ve seçtiğiniz ilan veren rolüyle
              yapılır.
            </p>
            <button
              type="button"
              className={styles.primaryFlatAction}
              onClick={onVerify}
              disabled={!location.propertyNumber || !property.publisherRole}
            >
              EİDS demo doğrulamasını başlat
            </button>
          </div>
        ) : null}

        {verification.status === 'checking' ? (
          <div className={styles.verificationPending} role="status" aria-live="polite">
            <span className={styles.pendingMark} aria-hidden="true" />
            <div>
              <strong>Yetki ve taşınmaz kaydı kontrol ediliyor</strong>
              <p>Bu sırada taslağınız güvenle korunur.</p>
            </div>
          </div>
        ) : null}

        {verification.status === 'verified' && verificationValidation.valid ? (
          <div className={styles.verificationSuccess} role="status">
            <span aria-hidden="true">✓</span>
            <div>
              <strong>Yetki doğrulandı</strong>
              <p>
                {maskedPropertyNumber(
                  verification.verifiedPropertyNumber ?? location.propertyNumber,
                )}{' '}
                numaralı taşınmaz için demo doğrulama tamamlandı.
              </p>
            </div>
          </div>
        ) : null}

        {staleVerification ? (
          <div className={styles.verificationError} role="alert">
            <div>
              <strong>Doğrulama bilgileri güncelliğini yitirdi</strong>
              <p>
                {verificationValidation.errors.verification} Taslağınız korundu.
              </p>
            </div>
            <button
              type="button"
              className={styles.primaryFlatAction}
              onClick={onVerify}
            >
              Yetkiyi yeniden doğrula
            </button>
          </div>
        ) : null}

        {verification.status === 'unauthorized' ? (
          <div className={styles.verificationError} role="alert">
            <div>
              <strong>Bu rol için aktif ilan yetkisi bulunamadı</strong>
              <p>
                Bilgileri kontrol edin veya mülk sahibinin e-Devlet üzerinden
                ilan yetkisi tanımlamasını isteyin. Taslağınız korundu.
              </p>
            </div>
            <div className={styles.recoveryActions}>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => onEdit('property')}
              >
                Mülk bilgilerini düzenle
              </button>
              <button
                type="button"
                className={styles.primaryFlatAction}
                onClick={onVerify}
              >
                Yetkiyi yeniden kontrol et
              </button>
            </div>
          </div>
        ) : null}

        {verification.status === 'unavailable' ? (
          <div className={styles.verificationError} role="alert">
            <div>
              <strong>Doğrulama servisine şu anda ulaşılamıyor</strong>
              <p>Taslağınız korundu. Biraz sonra aynı ekrandan tekrar deneyin.</p>
            </div>
            <button
              type="button"
              className={styles.primaryFlatAction}
              onClick={onVerify}
            >
              Tekrar dene
            </button>
          </div>
        ) : null}

        {errors.verification && verification.status === 'idle' ? (
          <p className={styles.fieldError} role="alert">
            {errors.verification}
          </p>
        ) : null}
      </section>

      <ListingGroup
        id="review"
        title="Yayınlanacak bilgilerin özeti"
        description="Bir bölümü düzenlediğinizde kaydettikten sonra buraya dönersiniz."
      >
        <div className={styles.reviewList}>
          <article className={styles.reviewItem}>
            <div>
              <span data-ready={getStepValidation(draft, 'property').valid || undefined}>
                {reviewStatus(draft, 'property')}
              </span>
              <h3>Mülk bilgileri</h3>
              <p>
                {property.family === 'land' ? 'Arsa / Arazi' : 'Emlak'} ·{' '}
                {property.transaction === 'rent' ? 'Kiralık' : 'Satılık'}
              </p>
            </div>
            <button type="button" onClick={() => onEdit('property')}>
              Mülk bilgilerini düzenle
            </button>
          </article>
          <article className={styles.reviewItem}>
            <div>
              <span data-ready={getStepValidation(draft, 'location').valid || undefined}>
                {reviewStatus(draft, 'location')}
              </span>
              <h3>Konum</h3>
              <p>{locationText}</p>
            </div>
            <button type="button" onClick={() => onEdit('location')}>
              Konum bilgilerini düzenle
            </button>
          </article>
          <article className={styles.reviewItem}>
            <div>
              <span data-ready={getStepValidation(draft, 'media').valid || undefined}>
                {reviewStatus(draft, 'media')}
              </span>
              <h3>Fotoğraflar</h3>
              <p>{readyMedia} geçerli fotoğraf · {media.some((item) => item.isCover) ? 'Kapak seçili' : 'Kapak eksik'}</p>
            </div>
            <button type="button" onClick={() => onEdit('media')}>
              Fotoğrafları düzenle
            </button>
          </article>
          <article className={styles.reviewItem}>
            <div>
              <span data-ready={getStepValidation(draft, 'content').valid || undefined}>
                {reviewStatus(draft, 'content')}
              </span>
              <h3>Fiyat ve ilan metni</h3>
              <p>{content.title || 'Başlık eksik'}</p>
            </div>
            <button type="button" onClick={() => onEdit('content')}>
              Fiyat ve ilan metnini düzenle
            </button>
          </article>
          <article className={styles.reviewItem} data-verification>
            <div>
              <span data-ready={verificationValidation.valid || undefined}>
                {verificationValidation.valid ? 'Hazır' : 'Doğrulama gerekli'}
              </span>
              <h3>EİDS doğrulaması</h3>
              <p>
                {verificationValidation.valid
                  ? 'Yetki ve taşınmaz kimliği eşleşti'
                  : 'Yayın öncesinde yetki kontrolünü tamamlayın'}
              </p>
            </div>
            <button
              type="button"
              onClick={onVerify}
              disabled={
                verification.status === 'checking' ||
                !location.propertyNumber ||
                !property.publisherRole
              }
            >
              {verificationValidation.valid
                ? 'Yetkiyi yeniden doğrula'
                : 'Yetkiyi kontrol et'}
            </button>
          </article>
        </div>
      </ListingGroup>
    </section>
  )
}
