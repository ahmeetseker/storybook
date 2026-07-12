import { useState, type HTMLAttributes } from 'react'
import { GlassSurface } from '../GlassSurface'
import { GlassButton } from '../GlassButton'
import styles from './GlassSellerCard.module.css'

export interface GlassSellerCardProps extends HTMLAttributes<HTMLElement> {
  name: string
  /** Ör. "Üyelik: Ocak 2019" */
  memberSince?: string
  avatarUrl?: string
  /** Ör. "0 (532) 123 45 67" — gösterilene kadar rakamları maskelenir */
  phone?: string
  verified?: boolean
  /** Kullanıcı "Telefonu Göster"e bastığında çağrılır */
  onPhoneReveal?: () => void
  /** "Mesaj Gönder" aksiyonu; verilmezse buton gösterilmez */
  onMessage?: () => void
  tone?: 'light' | 'dark' | 'auto'
}

const VerifiedIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 1.8l2.5 2 3.2-.3 1 3 2.9 1.4-.7 3.1 2 2.5-2 2.5.7 3.1-2.9 1.4-1 3-3.2-.3-2.5 2-2.5-2-3.2.3-1-3L2.4 18l.7-3.1-2-2.5 2-2.5-.7-3.1 2.9-1.4 1-3 3.2.3z" transform="scale(0.92) translate(1 1)" />
    <path d="M8.5 12.2l2.3 2.3 4.7-4.7" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function maskPhone(phone: string): string {
  // İlk 5 karakter görünür kalır (ör. "0 (53"), kalan rakamlar maskelenir
  return phone.slice(0, 5) + phone.slice(5).replace(/\d/g, '•')
}

export function GlassSellerCard({
  name,
  memberSince,
  avatarUrl,
  phone,
  verified = false,
  onPhoneReveal,
  onMessage,
  tone = 'auto',
  className,
  ...rest
}: GlassSellerCardProps) {
  const [revealed, setRevealed] = useState(false)

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('tr'))
    .join('')

  return (
    <GlassSurface
      as="section"
      shape={20}
      tone={tone}
      thickness={0.45}
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div className={styles.identity}>
        {avatarUrl ? (
          <img className={styles.avatar} src={avatarUrl} alt="" />
        ) : (
          <span className={styles.avatarFallback} aria-hidden>
            {initials}
          </span>
        )}
        <div className={styles.who}>
          <span className={styles.name}>
            {name}
            {verified ? (
              <span className={styles.verified} title="Doğrulanmış hesap" role="img" aria-label="Doğrulanmış hesap">
                <VerifiedIcon />
              </span>
            ) : null}
          </span>
          {memberSince ? <span className={styles.member}>{memberSince}</span> : null}
        </div>
      </div>

      {phone ? (
        revealed ? (
          <a className={styles.phone} href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
            {phone}
          </a>
        ) : (
          <div className={styles.phoneRow}>
            <span className={styles.phoneMasked} aria-hidden>
              {maskPhone(phone)}
            </span>
            <GlassButton
              size="sm"
              tone={tone}
              onClick={() => {
                setRevealed(true)
                onPhoneReveal?.()
              }}
            >
              Telefonu Göster
            </GlassButton>
          </div>
        )
      ) : null}

      {onMessage ? (
        <GlassButton prominent tint="#0a84ff" onClick={onMessage}>
          Mesaj Gönder
        </GlassButton>
      ) : null}
    </GlassSurface>
  )
}
