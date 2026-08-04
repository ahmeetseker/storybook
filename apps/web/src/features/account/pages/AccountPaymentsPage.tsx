import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { GlassAlert, GlassEmptyState, GlassSegmentedControl } from '@repo/ui'

import { AccountActionLink } from '../components/AccountActionLink'
import sectionStyles from '../components/AccountSections.module.css'
import type {
  AccountDashboardData,
  AccountPayment,
  AccountPaymentMethod,
  AccountPaymentStatus,
} from '../domain/account-types'

import styles from './AccountPages.module.css'

/** İşlem geçmişinin durum filtresi kimlikleri. */
type PaymentFilterId = 'all' | AccountPaymentStatus

const FILTER_ORDER: readonly PaymentFilterId[] = [
  'all',
  'paid',
  'pending',
  'failed',
  'refunded',
]

const FILTER_LABELS: Record<PaymentFilterId, string> = {
  all: 'Tümü',
  paid: 'Ödenen',
  pending: 'Bekleyen',
  failed: 'Başarısız',
  refunded: 'İade',
}

/** Durum çipinde okunan metin — renk yalnız ikincil kanaldır. */
const STATUS_LABELS: Record<AccountPaymentStatus, string> = {
  paid: 'Ödendi',
  pending: 'Bekliyor',
  failed: 'Başarısız',
  refunded: 'İade edildi',
}

/** Filtrelenmiş liste boşken kovaya özgü açıklama. */
const EMPTY_FILTER_TEXT: Record<PaymentFilterId, string> = {
  all: 'Bu hesapta henüz ödeme işlemi yok.',
  paid: 'Tamamlanmış ödemeniz yok.',
  pending: 'Bekleyen ödemeniz yok; hepsi kapandı.',
  failed: 'Başarısız ödemeniz yok.',
  refunded: 'İade edilmiş ödemeniz yok.',
}

const METHOD_KIND_LABELS: Record<AccountPaymentMethod['kind'], string> = {
  card: 'Kart',
  transfer: 'Havale / EFT',
}

/**
 * Ödemeler sayfasından fatura satırına giden çapa sözleşmesi: Faturalarım
 * sayfasındaki her satırın `id`si `fatura-<fatura no>`dur.
 */
const INVOICES_PATH = '/hesabim/faturalarim' as const

function invoiceAnchor(invoiceId: string) {
  return `fatura-${invoiceId}`
}

function matchesFilter(payment: AccountPayment, filter: PaymentFilterId) {
  return filter === 'all' || payment.status === filter
}

export interface AccountPaymentsPageProps {
  /** Hesap panelinin normalize edilmiş verisi. */
  data: AccountDashboardData
}

/**
 * "Ödemeler" alt sayfası: dönem özeti, kayıtlı ödeme yöntemleri ve durum
 * filtresiyle çalışılabilir işlem geçmişi. Filtre bir `radiogroup`tur; seçili
 * kova sayfanın yerel durumudur, rotaya yazılmaz.
 *
 * İşlem geçmişi gerçek bir tablodur: tarih/tutar sütunları başlıklarıyla
 * ilişkilendirilir (`scope="col"`), dar kapta satırlar bloklaştırılmaz —
 * tablo kendi içinde yatay kayar.
 *
 * Sayfa yalnız içeriği döndürür — `main`/kapsayıcı kabuktan gelir.
 */
export function AccountPaymentsPage({ data }: AccountPaymentsPageProps) {
  const [filter, setFilter] = useState<PaymentFilterId>('all')

  const error = data.sectionErrors.find((item) => item.section === 'payments')
  const billing = data.billing
  const payments = useMemo(() => billing?.payments ?? [], [billing])
  const methods = billing?.methods ?? []

  const counts = useMemo(() => {
    const result = {} as Record<PaymentFilterId, number>
    for (const id of FILTER_ORDER) {
      result[id] = payments.filter((payment) => matchesFilter(payment, id)).length
    }
    return result
  }, [payments])

  const visiblePayments = useMemo(
    () => payments.filter((payment) => matchesFilter(payment, filter)),
    [payments, filter],
  )

  const options = FILTER_ORDER.map((id) => ({
    value: id,
    // Sayaç etikete yazılır: bilgi yalnız görsel bir rozette kalmaz, radio
    // düğmesinin erişilebilir adının parçası olur.
    label: `${FILTER_LABELS[id]} (${counts[id]})`,
  }))

  const hasPayments = payments.length > 0
  const failedCount = counts.failed

  return (
    <>
      <h1 className={styles.pageTitle}>Ödemeler</h1>

      <section
        data-account-section="payments-summary"
        aria-labelledby="account-payments-summary-title"
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-payments-summary-title" className={sectionStyles.cardTitle}>
              Dönem özeti
            </h2>
            <p className={styles.subtitle}>
              Seçili dönemde tamamlanan ve hâlâ bekleyen ödemelerinizin toplamı.
            </p>
          </div>
          {billing ? (
            <p className={styles.meta}>{billing.summary.periodLabel}</p>
          ) : null}
        </div>

        {billing ? (
          <dl data-part="payment-stats" className={styles.statGrid}>
            <div data-part="payment-stat-paid" className={styles.statTile}>
              <dt className={styles.statLabel}>Ödenen toplam</dt>
              <dd className={`${styles.statValue} ${styles.statMoney}`}>
                {billing.summary.paidTotalLabel}
              </dd>
            </div>
            <div data-part="payment-stat-pending" className={styles.statTile}>
              <dt className={styles.statLabel}>Bekleyen toplam</dt>
              <dd className={`${styles.statValue} ${styles.statMoney}`}>
                {billing.summary.pendingTotalLabel}
              </dd>
            </div>
            <div data-part="payment-stat-pending-count" className={styles.statTile}>
              <dt className={styles.statLabel}>Bekleyen işlem</dt>
              <dd className={styles.statValue}>{billing.summary.pendingCount}</dd>
            </div>
          </dl>
        ) : (
          <p className={styles.muted}>
            Ödeme kaydınız oluştuğunda dönem toplamları burada özetlenir.
          </p>
        )}

        {failedCount > 0 ? (
          <GlassAlert
            data-part="payment-failed-alert"
            severity="danger"
            title="Başarısız ödeme var"
          >
            {failedCount} ödeme tamamlanamadı. Kayıtlı kartınızın son kullanma
            tarihini ve limitini kontrol edin, ardından işlemi aşağıdaki listeden
            yeniden başlatın.
          </GlassAlert>
        ) : null}
      </section>

      <section
        data-account-section="payment-methods"
        aria-labelledby="account-payment-methods-title"
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-payment-methods-title" className={sectionStyles.cardTitle}>
              Kayıtlı ödeme yöntemleri
            </h2>
            <p className={styles.subtitle}>
              Kart numaraları yalnız maskeli görünür; varsayılan yöntem yeni
              işlemlerde önce denenir.
            </p>
          </div>
          <p className={styles.meta}>{methods.length} yöntem</p>
        </div>

        {methods.length > 0 ? (
          <ul data-part="payment-method-list" className={styles.methodList}>
            {methods.map((method) => (
              <li key={method.id} data-part="payment-method" className={styles.methodItem}>
                <div className={styles.methodHead}>
                  <p className={styles.methodKind}>{METHOD_KIND_LABELS[method.kind]}</p>
                  {method.isDefault ? (
                    <span
                      data-part="payment-method-default"
                      className={`${styles.chip} ${styles.defaultChip}`}
                    >
                      Varsayılan
                    </span>
                  ) : null}
                </div>
                <p className={styles.methodLabel}>{method.label}</p>
                <p className={styles.methodMeta}>
                  {method.expiryLabel
                    ? `Son kullanma: ${method.expiryLabel}`
                    : 'Son kullanma tarihi yok'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div data-part="empty-state" className={styles.emptyState}>
            <GlassEmptyState
              size="sm"
              title="Kayıtlı ödeme yönteminiz yok"
              description="İlk ödemenizi tamamladığınızda kullandığınız yöntem burada saklanır."
            />
          </div>
        )}
      </section>

      <section
        data-account-section="payments"
        aria-labelledby="account-payments-title"
        data-part={error ? 'section-error' : undefined}
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-payments-title" className={sectionStyles.cardTitle}>
              İşlem geçmişi
            </h2>
            <p className={styles.subtitle}>
              Tarih, tutar, durum ve kullanılan yöntemle tüm ödeme hareketleriniz.
            </p>
          </div>
          <p className={styles.meta}>{visiblePayments.length} işlem listeleniyor</p>
        </div>

        {error ? (
          <GlassAlert severity="warning" title="Ödemeler yüklenemedi">
            {error.message}
          </GlassAlert>
        ) : (
          <>
            {hasPayments ? (
              <div className={styles.filterBar}>
                <GlassSegmentedControl
                  data-part="payment-filter"
                  variant="bar"
                  fill="content"
                  size="sm"
                  label="Ödeme durumu filtresi"
                  options={options}
                  value={filter}
                  onChange={(next) => setFilter(next as PaymentFilterId)}
                />
              </div>
            ) : null}

            {visiblePayments.length > 0 ? (
              <div
                data-part="payment-table"
                className={styles.tableScroll}
                role="group"
                aria-labelledby="account-payments-title"
                tabIndex={0}
              >
                <table className={styles.table}>
                  <caption className={styles.srOnly}>
                    Ödeme işlemleri: tarih, açıklama, yöntem, tutar ve durum.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Tarih</th>
                      <th scope="col">Açıklama</th>
                      <th scope="col">Yöntem</th>
                      <th scope="col" className={styles.cellAmount}>
                        Tutar
                      </th>
                      <th scope="col">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePayments.map((payment) => (
                      <tr key={payment.id} data-part="payment-row">
                        <td className={styles.cellDate}>{payment.dateLabel}</td>
                        <td>
                          <div className={styles.cellMain}>
                            <span className={styles.cellTitle}>{payment.description}</span>
                            {payment.invoiceId ? (
                              // Görünür metin erişilebilir adın başında durur
                              // (WCAG 2.5.3); fatura numarası aynı adı taşıyan
                              // satırları birbirinden ayırır.
                              <Link
                                className={styles.textLink}
                                to={INVOICES_PATH}
                                hash={invoiceAnchor(payment.invoiceId)}
                                aria-label={`Faturayı gör (${payment.invoiceId})`}
                              >
                                Faturayı gör
                              </Link>
                            ) : (
                              <span className={styles.cellNote}>
                                Bu işlem için fatura oluşmadı.
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={styles.cellNote}>{payment.methodLabel}</td>
                        <td className={styles.cellAmount}>{payment.amountLabel}</td>
                        <td>
                          <span
                            className={`${styles.chip} ${styles.statusChip}`}
                            data-status={payment.status}
                          >
                            {STATUS_LABELS[payment.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div data-part="empty-state" className={styles.emptyState}>
                <GlassEmptyState
                  size="sm"
                  title={hasPayments ? 'Bu filtrede işlem yok' : 'Henüz ödeme işleminiz yok'}
                  description={
                    hasPayments
                      ? EMPTY_FILTER_TEXT[filter]
                      : 'Doping ve ek ilan hakkı gibi hizmetleri satın aldığınızda işlemleriniz burada listelenir.'
                  }
                  action={
                    hasPayments ? (
                      <button
                        type="button"
                        className={styles.plainButton}
                        onClick={() => setFilter('all')}
                      >
                        Tüm işlemleri göster
                      </button>
                    ) : (
                      <AccountActionLink
                        action={{ kind: 'route', label: 'İlan vermeye başla', to: '/ilan-ver' }}
                        variant="secondary"
                      />
                    )
                  }
                />
              </div>
            )}
          </>
        )}

        <div className={sectionStyles.cardFooter}>
          <Link className={styles.textLink} to={INVOICES_PATH}>
            Faturalarımı aç
          </Link>
        </div>
      </section>
    </>
  )
}
