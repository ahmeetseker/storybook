import { GlassAvatar, GlassBadge } from '@repo/ui'

import type {
  AccountAction,
  AccountDashboardData,
  AccountRole,
  VerificationState,
} from '../domain/account-types'

import { AccountActionLink } from './AccountActionLink'

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

/** Hesap sahibinin kimliğini ve doğrulama durumunu yerleşimden bağımsız sunar. */
export function AccountOverviewHeader({
  data,
  primaryAction,
}: AccountOverviewHeaderProps) {
  const { identity, verification } = data

  return (
    <section
      data-account-section="identity"
      aria-labelledby="account-identity-title"
    >
      <GlassAvatar
        data-part="avatar"
        src={identity.avatarUrl}
        name={identity.displayName}
        size="lg"
      />
      <div data-part="identity-details">
        <h1 id="account-identity-title">Hesabım</h1>
        <p data-part="display-name">{identity.displayName}</p>
        <p data-part="role">{roleLabels[identity.role]}</p>
        {identity.organizationLabel ? (
          <p data-part="organization">{identity.organizationLabel}</p>
        ) : null}
      </div>
      <div data-part="verification" aria-label="Doğrulama durumu">
        <GlassBadge material="flat">
          {verificationLabel('E-posta', verification.email)}
        </GlassBadge>
        <GlassBadge material="flat">
          {verificationLabel('Telefon', verification.phone)}
        </GlassBadge>
        <GlassBadge material="flat">
          {verificationLabel('EİDS', verification.eids)}
        </GlassBadge>
      </div>
      {verification.eids === 'pending' ? (
        <p data-part="eids-notice">
          Doğrulama ilan verme adımında tamamlanır.
        </p>
      ) : null}
      <div data-part="primary-action">
        <AccountActionLink action={primaryAction} variant="primary" />
      </div>
    </section>
  )
}
