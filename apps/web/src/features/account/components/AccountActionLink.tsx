import { Link } from '@tanstack/react-router'
import { GlassSurface } from '@repo/ui'

import type { AccountAction } from '../domain/account-types'

import styles from './AccountActionLink.module.css'

export interface AccountActionLinkProps {
  /** Hesap alanındaki rotaya yönlendiren aksiyon. */
  action: AccountAction
  /** Aksiyonun kontrol katmanındaki görsel önceliği. */
  variant?: 'primary' | 'secondary' | 'text'
}

/** Hesap aksiyonlarını gerçek TanStack Router bağlantıları olarak sunar. */
export function AccountActionLink({
  action,
  variant = 'secondary',
}: AccountActionLinkProps) {
  const link = (
    <Link
      to={action.to}
      className={styles[variant]}
      data-variant={variant}
    >
      {action.label}
    </Link>
  )

  if (variant !== 'primary') return link

  return (
    <GlassSurface
      material="glass"
      shape="capsule"
      className={styles.primarySurface}
      style={{ boxShadow: 'none' }}
    >
      {link}
    </GlassSurface>
  )
}
