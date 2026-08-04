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
  /**
   * Başlığın ÜSTÜNDE duran şerit — çok adımlı akışın ilerleme göstergesi
   * için. Başlık/açıklama sözleşmesini değiştirmez, yalnız önüne geçer.
   */
  ustSerit?: ReactNode
  /** Sunucudan veya doğrulamadan gelen hata — role="alert" ile duyurulur. */
  hata?: string
  onSubmit(event: FormEvent<HTMLFormElement>): void
  /** Varsayılan tek gönder butonunun etiketi. `aksiyonlar` verilirse kullanılmaz. */
  gonderEtiketi?: string
  gonderiliyor?: boolean
  /**
   * Varsayılan tek gönder butonunun YERİNE geçen aksiyon satırı (ör. çok
   * adımlı kayıtta "Geri" + "Devam et"). Hidrasyon bayrağı parametre olarak
   * verilir: özel butonlar da hidrasyon tamamlanana kadar devre dışı
   * kalmalıdır, yoksa erken tıklama native form gönderimine düşer ve
   * `donus` sessizce kaybolur (aşağıdaki uzun nota bakın).
   */
  aksiyonlar?: (durum: { hidrasyonTamam: boolean }) => ReactNode
  ikincilBaglantilar?: readonly AuthIkincilBaglanti[]
  children: ReactNode
}

/** Auth akışındaki form sayfalarının ortak iskeleti. */
export function AuthFormPage({
  baslik,
  aciklama,
  ustSerit,
  hata,
  onSubmit,
  gonderEtiketi,
  gonderiliyor = false,
  aksiyonlar,
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
      {ustSerit}

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

        {aksiyonlar ? (
          aksiyonlar({ hidrasyonTamam })
        ) : (
          <GlassButton
            type="submit"
            prominent
            size="md"
            loading={gonderiliyor}
            disabled={!hidrasyonTamam || gonderiliyor}
          >
            {gonderEtiketi}
          </GlassButton>
        )}
      </form>

      {ikincilBaglantilar.length > 0 ? (
        <nav className={styles.links} aria-label="Diğer seçenekler">
          {ikincilBaglantilar.map((baglanti) => (
            <Link
              key={baglanti.hedef}
              to={baglanti.hedef}
              search={(onceki) => onceki}
              className={styles.link}
            >
              {baglanti.etiket}
            </Link>
          ))}
        </nav>
      ) : null}
    </main>
  )
}
