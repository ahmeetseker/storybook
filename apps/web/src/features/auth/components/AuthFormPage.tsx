import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
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
  // Uygulama sunucuda render edilir (TanStack Start). Hidrasyon tamamlanana
  // kadar React'in `onSubmit`'i DOM'a bağlanmamış olur; bu sırada gönder
  // butonuna basılırsa tarayıcı native form gönderimi yapar (input'ta `name`,
  // form'da `action`/`method` olmadığından mevcut yola boş sorgu dizesiyle
  // GET atılır) ve `donus` parametresi sessizce kaybolur — güvenlik açığı
  // değil ama sessiz veri kaybı. `useEffect` yalnız client'ta ve hidrasyon
  // sonrası çalıştığından, butonu o âna kadar devre dışı tutmak erken
  // tıklamaları güvenle yutar; alternatifi sessiz veri kaybı olduğundan
  // butonun ilk anda kısaca devre dışı görünmesi kabul edilebilir.
  const [hidrasyonTamam, setHidrasyonTamam] = useState(false)
  useEffect(() => {
    setHidrasyonTamam(true)
  }, [])

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
          disabled={!hidrasyonTamam || gonderiliyor}
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
