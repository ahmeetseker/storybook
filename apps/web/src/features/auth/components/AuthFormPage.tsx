import type { FormEvent, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { GlassButton } from '@repo/ui'
import styles from './AuthFormPage.module.css'

export interface AuthIkincilBaglanti {
  etiket: string
  hedef: string
}

export interface AuthFormPageProps {
  baslik: string
  aciklama?: string
  /** Sunucudan veya doğrulamadan gelen hata — role="alert" ile duyurulur. */
  hata?: string
  onSubmit(event: FormEvent<HTMLFormElement>): void
  gonderEtiketi: string
  gonderiliyor?: boolean
  ikincilBaglantilar?: readonly AuthIkincilBaglanti[]
  children: ReactNode
}

/** Auth akışındaki form sayfalarının ortak iskeleti. */
export function AuthFormPage({
  baslik,
  aciklama,
  hata,
  onSubmit,
  gonderEtiketi,
  gonderiliyor = false,
  ikincilBaglantilar = [],
  children,
}: AuthFormPageProps) {
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{baslik}</h1>
        {aciklama ? <p className={styles.description}>{aciklama}</p> : null}
      </header>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.fields}>{children}</div>

        {hata ? (
          <p className={styles.error} role="alert">
            {hata}
          </p>
        ) : null}

        <GlassButton
          type="submit"
          prominent
          size="md"
          loading={gonderiliyor}
          disabled={gonderiliyor}
        >
          {gonderEtiketi}
        </GlassButton>
      </form>

      {ikincilBaglantilar.length > 0 ? (
        <nav className={styles.links} aria-label="Diğer seçenekler">
          {ikincilBaglantilar.map((baglanti) => (
            <Link key={baglanti.hedef} to={baglanti.hedef} className={styles.link}>
              {baglanti.etiket}
            </Link>
          ))}
        </nav>
      ) : null}
    </main>
  )
}
