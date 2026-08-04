import { GlassAlert, GlassEmptyState } from '@repo/ui'

import { AccountActionLink } from '../components/AccountActionLink'
import sectionStyles from '../components/AccountSections.module.css'
import type {
  AccountAction,
  AccountDashboardData,
  VerificationState,
} from '../domain/account-types'

import styles from './AccountPages.module.css'

/** Doğrulama kanalları — sayfadaki satır sırası buradan gelir. */
type VerificationChannel = 'email' | 'phone' | 'eids'

const CHANNEL_LABELS: Record<VerificationChannel, string> = {
  email: 'E-posta',
  phone: 'Telefon',
  eids: 'EİDS (Elektronik İlan Doğrulama Sistemi)',
}

const STATE_LABELS: Record<VerificationState, string> = {
  verified: 'Doğrulandı',
  pending: 'Beklemede',
  missing: 'Eksik',
  'not-applicable': 'Uygulanamaz',
  unavailable: 'Kullanılamıyor',
}

/**
 * Eksik/bekleyen doğrulama için "ne yapılacağı". Metin kanala VE duruma
 * bağlıdır: kullanıcı sonraki adımı tahmin etmek zorunda kalmaz.
 * `verified` ve `not-applicable` durumlarında adım yoktur.
 */
const NEXT_STEP_TEXT: Record<
  VerificationChannel,
  Partial<Record<VerificationState, string>>
> = {
  email: {
    pending: 'E-posta adresinize gönderilen doğrulama bağlantısını açın; bağlantı 24 saat geçerlidir.',
    missing: 'Hesabınıza bir e-posta adresi ekleyin ve gelen doğrulama bağlantısını onaylayın.',
    unavailable: 'E-posta doğrulama durumu şu anda okunamıyor; kısa süre sonra tekrar bakın.',
  },
  phone: {
    pending: 'Telefonunuza gelen tek kullanımlık kodu girin; kod 3 dakika geçerlidir.',
    missing: 'Cep telefonu numaranızı ekleyin; mesajlaşma ve alarm bildirimleri için gerekir.',
    unavailable: 'Telefon doğrulama durumu şu anda okunamıyor; kısa süre sonra tekrar bakın.',
  },
  eids: {
    pending: 'EİDS başvurunuz inceleniyor. Sonuç, doğrulanmış e-posta adresinize iletilir.',
    missing: 'İlan yayınlayabilmek için EİDS doğrulamanızı tamamlayın; ilan verme akışında başlatabilirsiniz.',
    unavailable: 'EİDS servisi şu anda yanıt vermiyor; ilan verme akışı doğrulamayı tekrar deneyecek.',
  },
}

/** EİDS adımı ilan verme akışına bağlanır; diğer kanallar rota gerektirmez. */
const NEXT_STEP_ACTION: Partial<Record<VerificationChannel, AccountAction>> = {
  eids: { kind: 'route', label: 'İlan verme akışını aç', to: '/ilan-ver' },
}

const OPEN_STATES: readonly VerificationState[] = ['pending', 'missing', 'unavailable']

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(date)
}

export interface AccountSecurityPageProps {
  /** Hesap panelinin normalize edilmiş verisi. */
  data: AccountDashboardData
}

/**
 * "Güvenlik ve doğrulama" alt sayfası: kanal bazlı doğrulama durumu, eksik
 * kanallar için somut sonraki adımlar ve son başarılı oturumun cihaz/konum/
 * zaman bilgisi. Durum asla yalnız renkle taşınmaz — nokta dekoratiftir,
 * durum her satırda yazıyla okunur.
 *
 * Sayfa yalnız içeriği döndürür — `main`/kapsayıcı kabuktan gelir.
 */
export function AccountSecurityPage({ data }: AccountSecurityPageProps) {
  const error = data.sectionErrors.find((item) => item.section === 'security')
  const { verification, security } = data

  const channels: VerificationChannel[] = ['email', 'phone', 'eids']
  const openChannels = channels.filter((channel) =>
    OPEN_STATES.includes(verification[channel]),
  )

  const login = security.lastSuccessfulLogin
  const loginTime = login ? formatDateTime(login.occurredAt) : null
  const freshness = security.dataUpdatedAt ? formatDateTime(security.dataUpdatedAt) : null

  return (
    <>
      <h1 className={styles.pageTitle}>Güvenlik ve doğrulama</h1>

      <section
        data-account-section="security"
        aria-labelledby="account-security-title"
        data-part={error ? 'section-error' : undefined}
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-security-title" className={sectionStyles.cardTitle}>
              Doğrulama durumu
            </h2>
            <p className={styles.subtitle}>
              Doğrulanan kanallar hesabınızı korur; mesajlaşma ve ilan yayını bu
              durumlara bağlıdır.
            </p>
          </div>
        </div>

        {error ? (
          <GlassAlert severity="warning" title="Güvenlik bilgileri yüklenemedi">
            {error.message}
          </GlassAlert>
        ) : (
          <dl data-part="verification-summary" className={styles.infoList}>
            {channels.map((channel) => (
              <div
                key={channel}
                data-part={`verification-${channel}`}
                className={styles.infoRow}
              >
                <dt className={styles.infoTerm}>{CHANNEL_LABELS[channel]}</dt>
                <dd className={styles.infoValue}>
                  <span className={styles.statusText} data-state={verification[channel]}>
                    {STATE_LABELS[verification[channel]]}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section
        data-account-section="security-next-steps"
        aria-labelledby="account-security-steps-title"
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-security-steps-title" className={sectionStyles.cardTitle}>
              Sonraki adımlar
            </h2>
            <p className={styles.subtitle}>
              Tamamlanmamış her doğrulama için ne yapmanız gerektiği burada yazar.
            </p>
          </div>
          <p className={styles.meta}>{openChannels.length} açık adım</p>
        </div>

        {openChannels.length > 0 ? (
          <ul data-part="security-steps" className={styles.stepList}>
            {openChannels.map((channel) => {
              const state = verification[channel]
              const action = NEXT_STEP_ACTION[channel]

              return (
                <li
                  key={channel}
                  data-part={`security-step-${channel}`}
                  className={styles.stepItem}
                >
                  <div className={styles.stepHead}>
                    <h3 className={styles.stepTitle}>{CHANNEL_LABELS[channel]}</h3>
                    <span className={styles.statusText} data-state={state}>
                      {STATE_LABELS[state]}
                    </span>
                  </div>
                  <p className={styles.stepText}>
                    {NEXT_STEP_TEXT[channel][state] ??
                      'Bu kanal için ek bir işlem gerekmiyor.'}
                  </p>
                  {action ? <AccountActionLink action={action} variant="text" /> : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <div data-part="empty-state" className={styles.emptyState}>
            <GlassEmptyState
              size="sm"
              title="Bekleyen doğrulama yok"
              description="Tüm kanallarınız doğrulandı; hesabınızda yapılacak bir güvenlik adımı bulunmuyor."
            />
          </div>
        )}
      </section>

      <section
        data-account-section="security-session"
        aria-labelledby="account-security-session-title"
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-security-session-title" className={sectionStyles.cardTitle}>
              Son oturum
            </h2>
            <p className={styles.subtitle}>
              Tanımadığınız bir cihaz ya da konum görürseniz parolanızı değiştirin.
            </p>
          </div>
        </div>

        <dl data-part="session-summary" className={styles.infoList}>
          <div data-part="last-login-time" className={styles.infoRow}>
            <dt className={styles.infoTerm}>Giriş zamanı</dt>
            <dd className={styles.infoValue}>
              {login && loginTime ? (
                <time dateTime={login.occurredAt}>{loginTime}</time>
              ) : (
                'Son giriş bilgisi kullanılamıyor'
              )}
            </dd>
          </div>
          <div data-part="last-login-device" className={styles.infoRow}>
            <dt className={styles.infoTerm}>Cihaz</dt>
            <dd className={styles.infoValue}>
              {login ? login.deviceLabel : 'Cihaz bilgisi kullanılamıyor'}
            </dd>
          </div>
          <div data-part="last-login-location" className={styles.infoRow}>
            <dt className={styles.infoTerm}>Yaklaşık konum</dt>
            <dd className={styles.infoValue}>
              {login?.approximateLocation ?? 'Konum bilgisi kullanılamıyor'}
              {login?.approximateLocation ? (
                <span className={styles.infoNote}>
                  Konum IP adresinden tahmin edilir; sokak düzeyinde değildir.
                </span>
              ) : null}
            </dd>
          </div>
        </dl>

        <div className={sectionStyles.cardFooter}>
          <p data-part="security-freshness" className={styles.meta}>
            {freshness && security.dataUpdatedAt ? (
              <>
                Veriler son güncelleme:{' '}
                <time dateTime={security.dataUpdatedAt}>{freshness}</time>
              </>
            ) : (
              'Veri güncellik bilgisi kullanılamıyor'
            )}
          </p>
        </div>
      </section>
    </>
  )
}
