import { GlassAvatar } from '@repo/ui'

import type {
  AccountAction,
  AccountDashboardData,
  AccountRole,
  VerificationState,
} from '../domain/account-types'

import { AccountActionLink } from './AccountActionLink'
import styles from './AccountSections.module.css'

export interface AccountOverviewHeaderProps {
  /** Hesap sahibinin kimlik ve doğrulama özeti. */
  data: AccountDashboardData
  /** Hesabın tek birincil yönlendirme aksiyonu. */
  primaryAction: AccountAction
}

const roleLabels: Record<AccountRole, string> = {
  buyer: 'Alıcı',
  seller: 'Satıcı',
  hybrid: 'Alıcı ve satıcı',
}

const verificationLabels: Record<VerificationState, string> = {
  verified: 'doğrulandı',
  pending: 'beklemede',
  missing: 'eksik',
  'not-applicable': 'uygulanamaz',
  unavailable: 'kullanılamıyor',
}

function verificationLabel(label: string, state: VerificationState) {
  return `${label}: ${verificationLabels[state]}`
}

/**
 * Kimlik bandı: avatar + ad + rol + doğrulama çipleri tek kompakt satırda
 * durur, birincil aksiyon sağa hizalanır. Dar kartta aksiyon alta iner ve
 * tam genişliğe yayılır. Doğrulama durumu renkle değil metinle taşınır;
 * çipteki nokta yalnız ikincil kanaldır.
 */
export function AccountOverviewHeader({
  data,
  primaryAction,
}: AccountOverviewHeaderProps) {
  const { identity, verification } = data

  const verificationChips: Array<{ key: string; label: string; state: VerificationState }> = [
    { key: 'email', label: 'E-posta', state: verification.email },
    { key: 'phone', label: 'Telefon', state: verification.phone },
    { key: 'eids', label: 'EİDS', state: verification.eids },
  ]

  return (
    <section
      data-account-section="identity"
      aria-labelledby="account-identity-title"
      className={`${styles.card} ${styles.identity}`}
    >
      <div className={styles.identityGrid}>
        <GlassAvatar
          data-part="avatar"
          className={styles.identityAvatar}
          src={identity.avatarUrl}
          name={identity.displayName}
          size="lg"
        />
        <div className={styles.identityBody}>
          <div data-part="identity-details" className={styles.identityDetails}>
            <h1 id="account-identity-title" className={styles.identityEyebrow}>
              Hesabım
            </h1>
            <p data-part="display-name" className={styles.identityName}>
              {identity.displayName}
            </p>
            <div className={styles.identityMetaRow}>
              <p data-part="role" className={styles.identityMeta}>
                {roleLabels[identity.role]}
              </p>
              {identity.organizationLabel ? (
                <p data-part="organization" className={styles.identityMeta}>
                  {identity.organizationLabel}
                </p>
              ) : null}
            </div>
          </div>
          <div
            data-part="verification"
            className={styles.identityBadges}
            aria-label="Doğrulama durumu"
          >
            {verificationChips.map((chip) => (
              <span key={chip.key} className={styles.verifyChip} data-state={chip.state}>
                {verificationLabel(chip.label, chip.state)}
              </span>
            ))}
          </div>
          {verification.eids === 'pending' ? (
            <p data-part="eids-notice" className={styles.identityNotice}>
              Doğrulama ilan verme adımında tamamlanır.
            </p>
          ) : null}
        </div>
        <div data-part="primary-action" className={styles.identityAction}>
          <AccountActionLink action={primaryAction} variant="primary" />
        </div>
      </div>
    </section>
  )
}
