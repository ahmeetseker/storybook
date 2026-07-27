import {
  GlassAlert,
  GlassMetricStrip,
  GlassSkeleton,
} from '@repo/ui'

import { AccountActivityList } from './components/AccountActivityList'
import { AccountAttentionQueue } from './components/AccountAttentionQueue'
import { AccountListingsPreview } from './components/AccountListingsPreview'
import { AccountOverviewHeader } from './components/AccountOverviewHeader'
import { AccountSavedSearchSummary } from './components/AccountSavedSearchSummary'
import { AccountSecuritySummary } from './components/AccountSecuritySummary'
import {
  getAccountMetricItems,
  getPrimaryAccountAction,
  getPriorityAttentionItems,
  getRecentListings,
  resolveAccountWorkspaceMode,
} from './domain/account-summary'
import type {
  AccountDashboardData,
  AccountSectionKey,
  AccountWorkspaceProps,
} from './domain/account-types'

import styles from './AccountWorkspace.module.css'

function getSectionError(
  data: AccountDashboardData,
  section: AccountSectionKey,
) {
  return data.sectionErrors.find((error) => error.section === section)
}

function AccountLoadingState() {
  return (
    <div className={styles.frame}>
      <section
        className={styles.stateSection}
        data-account-section="loading"
        aria-labelledby="account-loading-title"
      >
        <h1 id="account-loading-title">Hesabım</h1>
        <p>Hesap çalışma alanınız hazırlanıyor.</p>
        <div className={styles.loadingGrid} data-part="account-skeleton">
          <GlassSkeleton
            variant="circle"
            width="var(--lg-control-xl)"
            height="var(--lg-control-xl)"
          />
          <GlassSkeleton height="var(--lg-space-4)" lines={3} />
          <GlassSkeleton
            variant="rect"
            height="var(--lg-control-xl)"
          />
        </div>
      </section>
    </div>
  )
}

function RestrictedAccountState({ data }: { data: AccountDashboardData }) {
  const explanation =
    getSectionError(data, 'identity')?.message ??
    'Bu hesap çalışma alanına şu anda erişilemiyor.'

  return (
    <div className={styles.frame}>
      <section
        className={styles.stateSection}
        data-account-section="restricted"
        aria-labelledby="account-restricted-title"
      >
        <p className={styles.eyebrow}>HESAP ERİŞİMİ</p>
        <h1 id="account-restricted-title">Hesabınıza erişim kısıtlandı</h1>
        <p>{explanation}</p>
        <p>Kişisel hesap bölümleri bu görünümde kullanılamıyor.</p>
        <p>Kısıtlama bildirimini hesabınıza kayıtlı iletişim kanalından inceleyin.</p>
      </section>
    </div>
  )
}

function SessionExpiredState() {
  return (
    <div className={styles.frame}>
      <section
        className={styles.stateSection}
        data-account-section="session-expired"
        aria-labelledby="account-session-title"
      >
        <p className={styles.eyebrow}>GÜVENLİ OTURUM</p>
        <h1 id="account-session-title">Oturum süresi doldu</h1>
        <p>
          Hesap bilgilerinizi korumak için kişisel içerikler bu görünümde
          gösterilmiyor.
        </p>
      </section>
    </div>
  )
}

function AccountMetrics({ data }: { data: AccountDashboardData }) {
  const error = getSectionError(data, 'metrics')

  return (
    <section
      className={`${styles.section} ${styles.metricSection}`}
      data-account-section="metrics"
      aria-labelledby="account-metrics-title"
    >
      <h2 id="account-metrics-title">Genel görünüm</h2>
      {error ? (
        <GlassAlert severity="warning" title="Göstergeler yüklenemedi">
          {error.message}
        </GlassAlert>
      ) : (
        <GlassMetricStrip
          className={styles.metricStrip}
          items={getAccountMetricItems(data)}
          label="Hesap göstergeleri"
        />
      )}
    </section>
  )
}

function AccountIdentity({
  data,
}: {
  data: AccountDashboardData
}) {
  const error = getSectionError(data, 'identity')

  if (error) {
    return (
      <section
        data-account-section="identity"
        aria-labelledby="account-identity-title"
      >
        <h1 id="account-identity-title">Hesabım</h1>
        <GlassAlert severity="warning" title="Kimlik bilgileri yüklenemedi">
          {error.message}
        </GlassAlert>
      </section>
    )
  }

  return (
    <AccountOverviewHeader
      data={data}
      primaryAction={getPrimaryAccountAction(data)}
    />
  )
}

function AccountReadyContent({
  data,
  newAccount,
}: {
  data: AccountDashboardData
  newAccount: boolean
}) {
  const attentionItems = getPriorityAttentionItems(data)
  const listings = getRecentListings(data)

  return (
    <div className={styles.frame} data-new-account={newAccount || undefined}>
      <AccountIdentity data={data} />
      <AccountAttentionQueue items={attentionItems} />
      <AccountMetrics data={data} />

      <div className={styles.mainGrid}>
        <AccountListingsPreview
          role={data.identity.role}
          listings={listings}
          error={getSectionError(data, 'listings')}
        />
        <AccountSecuritySummary
          verification={data.verification}
          security={data.security}
          error={getSectionError(data, 'security')}
        />
      </div>

      <div className={styles.bottomGrid}>
        <AccountActivityList
          activities={data.activities}
          error={getSectionError(data, 'activity')}
        />
        <AccountSavedSearchSummary
          savedSearch={data.savedSearch}
          error={getSectionError(data, 'saved-search')}
        />
      </div>
    </div>
  )
}

/** Hesap verisini erişilebilir, aksiyon-öncelikli çalışma alanında orkestre eder. */
export function AccountWorkspace({
  data,
  mode,
}: AccountWorkspaceProps) {
  const resolvedMode =
    mode ??
    resolveAccountWorkspaceMode({
      data,
      loading: false,
      restricted: false,
      sessionExpired: false,
    })

  return (
    <main
      id="main-content"
      className={styles.page}
      aria-busy={resolvedMode === 'loading' || undefined}
    >
      {resolvedMode === 'session-expired' ? (
        <SessionExpiredState />
      ) : resolvedMode === 'loading' ? (
        <AccountLoadingState />
      ) : resolvedMode === 'restricted' ? (
        <RestrictedAccountState data={data} />
      ) : (
        <AccountReadyContent
          data={data}
          newAccount={resolvedMode === 'new-account'}
        />
      )}
    </main>
  )
}
