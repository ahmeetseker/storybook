import { GlassAlert } from '@repo/ui'

import type {
  AccountSectionError,
  AccountSecuritySummary as SecuritySummary,
  AccountVerification,
  VerificationState,
} from '../domain/account-types'

import styles from './AccountSections.module.css'

export interface AccountSecuritySummaryProps {
  /** E-posta, telefon ve EİDS doğrulama durumları. */
  verification: AccountVerification
  /** Son başarılı giriş bilgisi. */
  security: SecuritySummary
  /** Bu bölüme ait yerel yükleme hatası. */
  error?: AccountSectionError
}

const verificationStateLabels: Record<VerificationState, string> = {
  verified: 'Doğrulandı',
  pending: 'Beklemede',
  missing: 'Eksik',
  'not-applicable': 'Uygulanamaz',
  unavailable: 'Kullanılamıyor',
}

function formatLoginTime(occurredAt: string) {
  const date = new Date(occurredAt)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(date)
}

function formatSecurityFreshness(updatedAt: string) {
  const date = new Date(updatedAt)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(date)
}

function formatLoginDetails(login: NonNullable<SecuritySummary['lastSuccessfulLogin']>) {
  return [login.deviceLabel, login.approximateLocation].filter(Boolean).join(' · ')
}

/**
 * Hesap doğrulamalarını ve son giriş bilgisini yalnızca bilgilendirici
 * olarak, ince ayraçlı bir terim/değer listesinde gösterir. Durum metni
 * asıl kanaldır; noktanın rengi yalnız onu destekler.
 */
export function AccountSecuritySummary({
  verification,
  security,
  error,
}: AccountSecuritySummaryProps) {
  const login = security.lastSuccessfulLogin
  const loginTime = login ? formatLoginTime(login.occurredAt) : null
  const freshness = security.dataUpdatedAt
    ? formatSecurityFreshness(security.dataUpdatedAt)
    : null

  const verificationRows: Array<{
    part: string
    term: string
    state: VerificationState
  }> = [
    { part: 'verification-email', term: 'E-posta', state: verification.email },
    { part: 'verification-phone', term: 'Telefon', state: verification.phone },
    { part: 'verification-eids', term: 'EİDS', state: verification.eids },
  ]

  return (
    <section
      data-account-section="security"
      aria-labelledby="account-security-title"
      data-part={error ? 'section-error' : undefined}
      className={styles.card}
    >
      <div className={styles.cardHead}>
        <div className={styles.cardHeadText}>
          <h2 id="account-security-title" className={styles.cardTitle}>
            Hesap güvenliği
          </h2>
        </div>
      </div>
      {error ? (
        <GlassAlert severity="warning" title="Güvenlik bilgileri yüklenemedi">
          {error.message}
        </GlassAlert>
      ) : (
        <dl data-part="verification-summary" className={styles.infoList}>
          {verificationRows.map((row) => (
            <div key={row.part} data-part={row.part} className={styles.infoRow}>
              <dt className={styles.infoTerm}>{row.term}</dt>
              <dd className={styles.infoValue}>
                <span className={styles.status} data-state={row.state}>
                  {verificationStateLabels[row.state]}
                </span>
              </dd>
            </div>
          ))}
          <div data-part="last-login" className={styles.infoRow}>
            <dt className={styles.infoTerm}>Son giriş</dt>
            <dd className={styles.infoValue}>
              {login && loginTime ? (
                <>
                  <time dateTime={login.occurredAt}>{loginTime}</time>
                  <p
                    data-part="last-login-device-location"
                    data-testid="last-login-device-location"
                    className={styles.infoNote}
                  >
                    {formatLoginDetails(login)}
                  </p>
                </>
              ) : (
                'Son giriş bilgisi kullanılamıyor'
              )}
            </dd>
          </div>
          <div data-part="security-freshness" className={styles.infoRow}>
            <dt className={styles.infoTerm}>Veri güncelliği</dt>
            <dd className={styles.infoValue}>
              {freshness && security.dataUpdatedAt ? (
                <time dateTime={security.dataUpdatedAt}>{freshness}</time>
              ) : (
                'Güncellik bilgisi kullanılamıyor'
              )}
            </dd>
          </div>
        </dl>
      )}
    </section>
  )
}
