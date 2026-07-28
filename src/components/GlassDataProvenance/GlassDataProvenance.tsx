import { useId, useState, type HTMLAttributes } from 'react'
import styles from './GlassDataProvenance.module.css'

export type GlassProvenanceSourceClass =
  | 'official'
  | 'verified_document'
  | 'advertiser_declared'
  | 'platform_derived'
  | 'model_estimate'
  | 'unknown'

export type GlassProvenanceFreshness = 'current' | 'aging' | 'stale' | 'unknown'

export interface GlassProvenanceConflict {
  /** Çelişen kaynağın görünür adı */
  sourceLabel: string
  /** Çelişen değerin biçimlenmiş hâli */
  value: string
  effectiveAt?: string
}

export interface GlassDataProvenanceProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Hangi alanın kaynağı — erişilebilir adın parçası olur */
  fieldLabel: string
  /** Sağlayıcının görünür adı ("TKGM MEGSİS") */
  sourceLabel: string
  sourceClass: GlassProvenanceSourceClass
  /** Sorgunun yapıldığı an (biçimlenmiş) */
  retrievedAt: string
  /** Verinin geçerli olduğu tarih */
  effectiveAt?: string
  validUntil?: string
  freshness?: GlassProvenanceFreshness
  /** "parsel", "bölgesel" gibi kapsam */
  scopeLabel?: string
  geographicResolution?: string
  method?: string
  methodVersion?: string
  /** Bilinen sınırlamalar — kullanıcıya olduğu gibi gösterilir */
  limitations?: string[]
  /** Çelişki varsa rozet metni bunu bildirir; iki değer birlikte açılır */
  conflicts?: GlassProvenanceConflict[]
  /** Çelişki gösteriminde bu alanın geçerli kabul edilen değeri */
  currentValueLabel?: string
  /** Kaynak bağlantısı (resmî sorgu sayfası) */
  sourceHref?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const SOURCE_CLASS_LABELS: Record<GlassProvenanceSourceClass, string> = {
  official: 'Resmî kayıttan',
  verified_document: 'Doğrulanmış belgeden',
  advertiser_declared: 'İlan sahibi beyanı',
  platform_derived: 'ArsaPazar hesabı',
  model_estimate: 'Model tahmini',
  unknown: 'Doğrulanamadı',
}

/**
 * Bir değerin kanıt künyesi. Rozet, kaynak sınıfını (veya çelişki/bayatlık
 * durumunu) taşır; açıldığında sağlayıcı, tarihler, kapsam, yöntem,
 * sınırlamalar ve varsa çelişen ikinci değer görünür.
 *
 * Yalnız düz yüzey üretir — içerik katmanındadır, cam bütçesini tüketmez.
 */
export function GlassDataProvenance({
  fieldLabel,
  sourceLabel,
  sourceClass,
  retrievedAt,
  effectiveAt,
  validUntil,
  freshness = 'current',
  scopeLabel,
  geographicResolution,
  method,
  methodVersion,
  limitations,
  conflicts,
  currentValueLabel,
  sourceHref,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  ...rest
}: GlassDataProvenanceProps) {
  const panelId = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : uncontrolledOpen

  const hasConflict = (conflicts?.length ?? 0) > 0
  const badgeLabel = hasConflict
    ? 'Kaynaklar çelişiyor'
    : freshness === 'stale'
      ? 'Güncel değil'
      : SOURCE_CLASS_LABELS[sourceClass]

  const tone = hasConflict
    ? 'conflict'
    : freshness === 'stale'
      ? 'stale'
      : sourceClass === 'unknown'
        ? 'unknown'
        : sourceClass === 'official' || sourceClass === 'verified_document'
          ? 'official'
          : sourceClass === 'platform_derived' || sourceClass === 'model_estimate'
            ? 'derived'
            : 'declared'

  function toggle() {
    const next = !isOpen
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} {...rest}>
      <button
        type="button"
        className={styles.trigger}
        data-tone={tone}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className={styles.srOnly}>{fieldLabel} kaynağı: </span>
        {badgeLabel}
      </button>

      {isOpen ? (
        <div className={styles.panel} id={panelId}>
          <dl className={styles.grid}>
            <div>
              <dt>Sağlayıcı</dt>
              <dd>
                {sourceHref ? (
                  <a href={sourceHref} className={styles.link}>
                    {sourceLabel}
                  </a>
                ) : (
                  sourceLabel
                )}
              </dd>
            </div>
            <div>
              <dt>Sorgu</dt>
              <dd>{retrievedAt}</dd>
            </div>
            {effectiveAt ? (
              <div>
                <dt>Geçerlilik tarihi</dt>
                <dd>{effectiveAt}</dd>
              </div>
            ) : null}
            {validUntil ? (
              <div>
                <dt>Geçerli olduğu son tarih</dt>
                <dd>{validUntil}</dd>
              </div>
            ) : null}
            {scopeLabel ? (
              <div>
                <dt>Kapsam</dt>
                <dd>{scopeLabel}</dd>
              </div>
            ) : null}
            {geographicResolution ? (
              <div>
                <dt>Çözünürlük</dt>
                <dd>{geographicResolution}</dd>
              </div>
            ) : null}
            {method ? (
              <div>
                <dt>Yöntem</dt>
                <dd>{method}</dd>
              </div>
            ) : null}
            {methodVersion ? (
              <div>
                <dt>Sürüm</dt>
                <dd>{methodVersion}</dd>
              </div>
            ) : null}
          </dl>

          {hasConflict ? (
            <div className={styles.conflict}>
              <p className={styles.conflictTitle}>Bu alanda kaynaklar farklı değer veriyor</p>
              <ul className={styles.conflictList}>
                {currentValueLabel ? (
                  <li>
                    <b>{currentValueLabel}</b>
                    <span>
                      {sourceLabel} · {retrievedAt}
                    </span>
                  </li>
                ) : null}
                {conflicts?.map((conflict) => (
                  <li key={`${conflict.sourceLabel}-${conflict.value}`}>
                    <b>{conflict.value}</b>
                    <span>
                      {conflict.sourceLabel}
                      {conflict.effectiveAt ? ` · ${conflict.effectiveAt}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {limitations?.length ? (
            <ul className={styles.limitations}>
              {limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
