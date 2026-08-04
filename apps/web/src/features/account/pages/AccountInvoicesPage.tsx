import { useMemo } from 'react'
import { GlassAlert, GlassEmptyState } from '@repo/ui'

import { AccountActionLink } from '../components/AccountActionLink'
import sectionStyles from '../components/AccountSections.module.css'
import type {
  AccountDashboardData,
  AccountInvoice,
  AccountInvoiceStatus,
} from '../domain/account-types'

import styles from './AccountPages.module.css'

/** Durum çipinde okunan metin — renk yalnız ikincil kanaldır. */
const STATUS_LABELS: Record<AccountInvoiceStatus, string> = {
  issued: 'Kesildi',
  pending: 'Bekliyor',
  cancelled: 'İptal edildi',
}

const moneyFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Fixture etiketleriyle aynı biçim: "1.098,00 TL". */
function formatMoney(value: number) {
  return `${moneyFormatter.format(value)} TL`
}

/** Ödemeler sayfasından gelen çapa sözleşmesi: `#fatura-<fatura no>`. */
function invoiceAnchorId(invoiceId: string) {
  return `fatura-${invoiceId}`
}

interface InvoiceGroup {
  key: string
  heading: string
  items: AccountInvoice[]
  /** İptal edilen faturalar toplama girmez. */
  total: number
}

/**
 * Faturaları döneme göre kümeler. Sıra bozulmaz: gruplar ilk görüldükleri
 * sırayla, grup içi faturalar da geldikleri sırayla kalır — sıralama verinin
 * sorumluluğudur.
 */
function groupByPeriod(invoices: AccountInvoice[]): InvoiceGroup[] {
  const groups = new Map<string, InvoiceGroup>()

  for (const invoice of invoices) {
    const key = invoice.periodLabel || 'Dönemi belirsiz'
    const existing = groups.get(key)
    const contribution = invoice.status === 'cancelled' ? 0 : invoice.total

    if (existing) {
      existing.items.push(invoice)
      existing.total += contribution
      continue
    }
    groups.set(key, { key, heading: key, items: [invoice], total: contribution })
  }

  return [...groups.values()]
}

export interface AccountInvoicesPageProps {
  /** Hesap panelinin normalize edilmiş verisi. */
  data: AccountDashboardData
}

/**
 * "Faturalarım" alt sayfası: faturalar döneme göre kümelenmiş olarak, dönem
 * toplamlarıyla listelenir; altında fatura bilgileri kartı durur.
 *
 * Her fatura satırının `id`si `fatura-<fatura no>`dur — Ödemeler sayfasındaki
 * "Faturayı gör" bağlantısı bu çapaya gelir.
 *
 * Sayfa yalnız içeriği döndürür — `main`/kapsayıcı kabuktan gelir.
 */
export function AccountInvoicesPage({ data }: AccountInvoicesPageProps) {
  const error = data.sectionErrors.find((item) => item.section === 'invoices')
  const billing = data.billing
  const invoices = useMemo(() => billing?.invoices ?? [], [billing])
  const profile = billing?.profile

  const groups = useMemo(() => groupByPeriod(invoices), [invoices])

  return (
    <>
      <h1 className={styles.pageTitle}>Faturalarım</h1>

      <section
        data-account-section="invoices"
        aria-labelledby="account-invoices-title"
        data-part={error ? 'section-error' : undefined}
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-invoices-title" className={sectionStyles.cardTitle}>
              Faturalar
            </h2>
            <p className={styles.subtitle}>
              Faturalarınız döneme göre kümelenir; dönem toplamına iptal edilen
              faturalar girmez.
            </p>
          </div>
          <p className={styles.meta}>{invoices.length} fatura</p>
        </div>

        {error ? (
          <GlassAlert severity="warning" title="Faturalar yüklenemedi">
            {error.message}
          </GlassAlert>
        ) : groups.length > 0 ? (
          <div data-part="invoice-groups" className={styles.groupList}>
            {groups.map((group) => (
              <div key={group.key} data-part="invoice-group" className={styles.group}>
                <div className={styles.groupHead}>
                  <h3 className={styles.groupHeading}>{group.heading}</h3>
                  <p className={styles.groupTotal}>
                    Dönem toplamı: {formatMoney(group.total)}
                  </p>
                </div>

                <ul className={styles.invoiceList}>
                  {group.items.map((invoice) => (
                    <li
                      key={invoice.id}
                      id={invoiceAnchorId(invoice.id)}
                      data-part="invoice-item"
                      className={styles.invoiceItem}
                    >
                      <div className={styles.invoiceHead}>
                        <p className={styles.invoiceTitle}>
                          Fatura no: {invoice.id}
                        </p>
                        <span
                          className={`${styles.chip} ${styles.statusChip}`}
                          data-status={invoice.status}
                        >
                          {STATUS_LABELS[invoice.status]}
                        </span>
                      </div>

                      <p className={styles.muted}>{invoice.description}</p>

                      <dl className={styles.invoiceFacts}>
                        <div className={styles.invoiceFact}>
                          <dt className={styles.invoiceFactTerm}>Dönem</dt>
                          <dd className={styles.invoiceFactValue}>
                            {invoice.periodLabel}
                          </dd>
                        </div>
                        <div className={styles.invoiceFact}>
                          <dt className={styles.invoiceFactTerm}>Düzenlenme tarihi</dt>
                          <dd className={styles.invoiceFactValue}>{invoice.dateLabel}</dd>
                        </div>
                        <div className={styles.invoiceFact}>
                          <dt className={styles.invoiceFactTerm}>Tutar</dt>
                          <dd
                            className={`${styles.invoiceFactValue} ${styles.invoiceTotal}`}
                          >
                            {invoice.totalLabel}
                          </dd>
                        </div>
                        <div className={styles.invoiceFact}>
                          <dt className={styles.invoiceFactTerm}>Vergi</dt>
                          <dd className={styles.invoiceFactValue}>{invoice.taxLabel}</dd>
                        </div>
                      </dl>

                      {invoice.downloadHref ? (
                        <div className={styles.invoiceFooter}>
                          {/* Görünür metin erişilebilir adın başında durur
                              (WCAG 2.5.3); fatura numarası aynı adı taşıyan
                              satırları birbirinden ayırır. */}
                          <a
                            className={styles.textLink}
                            href={invoice.downloadHref}
                            aria-label={`PDF indir (${invoice.id})`}
                          >
                            PDF indir
                          </a>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div data-part="empty-state" className={styles.emptyState}>
            <GlassEmptyState
              size="sm"
              title="Henüz faturanız yok"
              description="Doping ve ek ilan hakkı gibi hizmetlerin faturaları kesildikçe burada döneme göre listelenir."
              action={
                <AccountActionLink
                  action={{ kind: 'route', label: 'İlan vermeye başla', to: '/ilan-ver' }}
                  variant="secondary"
                />
              }
            />
          </div>
        )}
      </section>

      <section
        data-account-section="billing-profile"
        aria-labelledby="account-billing-profile-title"
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-billing-profile-title" className={sectionStyles.cardTitle}>
              Fatura bilgileri
            </h2>
            <p className={styles.subtitle}>
              Kesilen faturalarda bu bilgiler kullanılır.
            </p>
          </div>
        </div>

        {profile ? (
          <dl data-part="billing-profile" className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt className={styles.infoTerm}>Unvan</dt>
              <dd className={styles.infoValue}>{profile.title}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoTerm}>Vergi dairesi</dt>
              <dd className={styles.infoValue}>
                {profile.taxOffice ?? (
                  <span className={styles.infoNote}>Belirtilmedi</span>
                )}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoTerm}>Vergi / TC kimlik no</dt>
              <dd className={styles.infoValue}>
                {profile.taxNumber ?? (
                  <span className={styles.infoNote}>Belirtilmedi</span>
                )}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoTerm}>Adres</dt>
              <dd className={styles.infoValue}>
                {profile.address ?? <span className={styles.infoNote}>Belirtilmedi</span>}
              </dd>
            </div>
          </dl>
        ) : (
          <div data-part="empty-state" className={styles.emptyState}>
            <GlassEmptyState
              size="sm"
              title="Fatura bilgisi eklenmemiş"
              description="Fatura unvanı, vergi dairesi ve adres bilgisi tanımlandığında faturalarınız bu bilgilerle kesilir."
            />
          </div>
        )}
      </section>
    </>
  )
}
