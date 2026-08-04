import { GlassAlert, GlassEmptyState, GlassSavedSearchCard } from '@repo/ui'

import { AccountActionLink } from '../components/AccountActionLink'
import sectionStyles from '../components/AccountSections.module.css'
import type { AccountDashboardData } from '../domain/account-types'

import styles from './AccountPages.module.css'

/** "İzmir · Urla ve Çeşme · Arsa" gibi tek satırlık ölçütü çipe böler. */
function splitCriteria(criteriaLabel: string) {
  return criteriaLabel
    .split('·')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(date)
}

export interface AccountSavedSearchPageProps {
  /** Hesap panelinin normalize edilmiş verisi. */
  data: AccountDashboardData
}

/**
 * "Kayıtlı arama" alt sayfası: kaydedilmiş arama ölçütleri, yeni eşleşme
 * sayısı ve devam aksiyonları. Kayıt yoksa sayfa boş durumla açılır — bölüm
 * gizlenmez, kullanıcı nereden başlayacağını görür.
 *
 * Sayfa yalnız içeriği döndürür — `main`/kapsayıcı kabuktan gelir.
 */
export function AccountSavedSearchPage({ data }: AccountSavedSearchPageProps) {
  const error = data.sectionErrors.find((item) => item.section === 'saved-search')
  const savedSearch = data.savedSearch
  const updatedAt = savedSearch ? formatDateTime(savedSearch.updatedAt) : null

  if (error || !savedSearch) {
    return (
      <>
        <h1 className={styles.pageTitle}>Kayıtlı arama</h1>

        <section
          data-account-section="saved-search"
          aria-labelledby="account-saved-search-title"
          data-part={error ? 'section-error' : undefined}
          className={sectionStyles.card}
        >
          <div className={sectionStyles.cardHead}>
            <div className={styles.headText}>
              <h2 id="account-saved-search-title" className={sectionStyles.cardTitle}>
                Aramanız
              </h2>
            </div>
          </div>

          {error ? (
            <GlassAlert severity="warning" title="Kayıtlı arama yüklenemedi">
              {error.message}
            </GlassAlert>
          ) : (
            <div data-part="empty-state" className={styles.emptyState}>
              <GlassEmptyState
                size="sm"
                title="Kayıtlı aramanız yok"
                description="Emlak aramanızı kaydettiğinizde ölçütleriniz burada durur ve yeni eşleşmeler sayılır."
                action={
                  <AccountActionLink
                    action={{ kind: 'route', label: 'Aramaya başlayın', to: '/emlak' }}
                    variant="secondary"
                  />
                }
              />
            </div>
          )}
        </section>
      </>
    )
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Kayıtlı arama</h1>

      <section
        data-account-section="saved-search"
        aria-labelledby="account-saved-search-title"
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-saved-search-title" className={sectionStyles.cardTitle}>
              Arama ölçütleri
            </h2>
            <p className={styles.subtitle}>
              Kaydedilen ölçütler her yeni ilanda kontrol edilir; eşleşmeler
              aşağıda sayılır.
            </p>
          </div>
        </div>

        <GlassSavedSearchCard
          data-part="saved-search-card"
          className={styles.savedSearchCard}
          title={savedSearch.title}
          criteria={splitCriteria(savedSearch.criteriaLabel)}
          newResultCount={savedSearch.newMatchCount}
          lastRunLabel={updatedAt ? `Son kontrol: ${updatedAt}` : undefined}
          headingAs="h3"
        />
      </section>

      <section
        data-account-section="saved-search-matches"
        aria-labelledby="account-saved-search-matches-title"
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2
              id="account-saved-search-matches-title"
              className={sectionStyles.cardTitle}
            >
              Yeni eşleşmeler
            </h2>
            <p className={styles.subtitle}>
              Son kontrolden bu yana ölçütlerinize uyan ilanlar.
            </p>
          </div>
          {updatedAt ? (
            <time className={styles.meta} dateTime={savedSearch.updatedAt}>
              {updatedAt}
            </time>
          ) : (
            <p className={styles.meta}>Tarih bilgisi kullanılamıyor</p>
          )}
        </div>

        <div data-part="saved-search-matches" className={styles.matchBox}>
          <p className={styles.matchValue}>{savedSearch.newMatchCount}</p>
          <p className={styles.muted}>
            {savedSearch.newMatchCount > 0
              ? 'yeni eşleşme incelemenizi bekliyor.'
              : 'yeni eşleşme var; ölçütlerinizi genişletmeyi deneyebilirsiniz.'}
          </p>
        </div>

        <div className={sectionStyles.cardFooter}>
          <AccountActionLink
            action={{ kind: 'route', label: 'Eşleşmeleri aç', to: '/emlak' }}
            variant="secondary"
          />
          <AccountActionLink
            action={{ kind: 'route', label: 'Favorilerinizi açın', to: '/favoriler' }}
            variant="text"
          />
        </div>
      </section>
    </>
  )
}
