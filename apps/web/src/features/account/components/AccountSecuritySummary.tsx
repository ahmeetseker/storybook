import { GlassAlert } from '@repo/ui'

import type {
  AccountSectionError,
  AccountSecuritySummary as SecuritySummary,
  AccountVerification,
  VerificationState,
} from '../domain/account-types'

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

/** Hesap doğrulamalarını ve son giriş bilgisini yalnızca bilgilendirici olarak gösterir. */
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

  return (
    <section
      data-account-section="security"
      aria-labelledby="account-security-title"
      data-part={error ? 'section-error' : undefined}
    >
      <h2 id="account-security-title">Hesap güvenliği</h2>
      {error ? (
        <GlassAlert severity="warning" title="Güvenlik bilgileri yüklenemedi">
          {error.message}
        </GlassAlert>
      ) : (
      <dl data-part="verification-summary">
        <div data-part="verification-email">
          <dt>E-posta</dt>
          <dd>{verificationStateLabels[verification.email]}</dd>
        </div>
        <div data-part="verification-phone">
          <dt>Telefon</dt>
          <dd>{verificationStateLabels[verification.phone]}</dd>
        </div>
        <div data-part="verification-eids">
          <dt>EİDS</dt>
          <dd>{verificationStateLabels[verification.eids]}</dd>
        </div>
        <div data-part="last-login">
          <dt>Son giriş</dt>
          <dd>
            {login && loginTime ? (
              <>
                <time dateTime={login.occurredAt}>{loginTime}</time>
                <p data-part="last-login-device-location" data-testid="last-login-device-location">
                  {formatLoginDetails(login)}
                </p>
              </>
            ) : (
              'Son giriş bilgisi kullanılamıyor'
            )}
          </dd>
        </div>
        <div data-part="security-freshness">
          <dt>Veri güncelliği</dt>
          <dd>
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
