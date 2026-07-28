import type { ReactNode } from 'react'
import { GlassDataProvenance, type GlassProvenanceSourceClass } from '@repo/ui'

import {
  hasConflict,
  isAnswered,
  type EvidenceScope,
  type EvidenceValue,
  type UnavailableReason,
} from '../domain/evidence'
import { formatDate } from '../format'
import styles from './EvidenceRow.module.css'

/**
 * ISO tarihi kullanıcıya görünür Türkçe biçime çevirir.
 *
 * Biçimlendirme sayfanın tek tarih yardımcısına devredilir: kanıt künyesindeki
 * tarih ile başlıktaki tarih aynı zaman dilimine sabitlenmiş olmalıdır.
 */
export function formatEvidenceDate(iso: string): string {
  return formatDate(iso)
}

/** Kapsam kullanıcıya İngilizce anahtar olarak değil, Türkçe adıyla görünür. */
const SCOPE_LABELS: Record<EvidenceScope, string> = {
  property: 'Taşınmaz',
  parcel: 'Parsel',
  building: 'Bina',
  neighborhood: 'Plan bölgesi',
  district: 'İlçe',
}

/** Çelişen kaynağın kimliği; künyede ham anahtar gösterilmez. */
const CONFLICT_SOURCE_LABELS: Record<string, string> = {
  advertiser: 'İlan sahibi beyanı',
  megsis: 'TKGM MEGSİS',
}

const UNAVAILABLE_REASONS: Record<UnavailableReason, (source: string) => string> = {
  not_published: (source) => `Bilgi alınamadı — ${source} kaynağında yayımlanmış kayıt bulunamadı`,
  provider_unavailable: (source) => `Bilgi alınamadı — ${source} sorgusuna ulaşılamadı`,
  not_applicable: (source) => `Bu alan ${source} kapsamında geçerli değil`,
  permission_denied: (source) => `Bilgi alınamadı — ${source} sorgusu yetki gerektiriyor`,
  out_of_scope: (source) => `Bilgi alınamadı — ${source} kapsamı bu taşınmazı içermiyor`,
}

/**
 * Cevapsız değerin görünür karşılığı. "—" veya boş hücre yerine nedeni
 * kelimeyle yazılır; kaydın bulunmaması "yok" anlamına gelmez.
 */
function unavailableText(value: EvidenceValue<unknown>): string {
  const source = value.source.name
  const reason = value.unavailableReason
  if (reason) return UNAVAILABLE_REASONS[reason](source)
  return `Bilgi alınamadı — ${source} kaydı okunamadı`
}

export interface EvidenceRowProps<T> {
  label: string
  value: EvidenceValue<T>
  /** Değeri okunur metne çevirir; verilmezse String(value) kullanılır */
  formatValue?: (value: T) => string
  /** Değer yokken gösterilecek metin — "—" yerine gerekçe cümlesi */
  fallbackText?: string
  /**
   * Künyedeki sınırlama listesinin yerine geçer. Veri katmanının taşımadığı
   * ama kullanıcının o satırı yanlış okumasını engelleyen uyarılar için —
   * ör. kaydın bulunmaması "yok" demek değildir.
   */
  limitationsOverride?: string[]
  /** Değerin altına giren görünür ek not (kapsam/uyarı) — açılır katman değildir */
  note?: ReactNode
}

/**
 * Tek kanıt satırı: etiket, değer ve kaynak künyesi. Cevapsız değer boş
 * bırakılmaz; nedeni yazılır. Çelişki varsa künye bunu bildirir.
 */
export function EvidenceRow<T>({
  label,
  value,
  formatValue,
  fallbackText,
  limitationsOverride,
  note,
}: EvidenceRowProps<T>) {
  const answered = isAnswered(value)
  const text = answered
    ? formatValue
      ? formatValue(value.value as T)
      : String(value.value)
    : (fallbackText ?? unavailableText(value))

  // Çelişen değer aynı birimle yazılır: "4.850 m²" ile "4712" yan yana
  // konduğunda kullanıcı iki sayıyı kıyaslayamaz.
  const conflictText = (raw: unknown): string =>
    formatValue && typeof raw === typeof value.value ? formatValue(raw as T) : String(raw)

  const conflicts = value.conflicts?.map((conflict) => ({
    sourceLabel: CONFLICT_SOURCE_LABELS[conflict.sourceId] ?? conflict.sourceId,
    value: conflictText(conflict.value),
    effectiveAt: conflict.effectiveAt ? formatEvidenceDate(conflict.effectiveAt) : undefined,
  }))

  return (
    <div className={styles.row} data-state={answered ? 'answered' : 'missing'}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>
        <span className={styles.valueText}>{text}</span>
        {note ? <p className={styles.note}>{note}</p> : null}
      </dd>
      <div className={styles.source}>
        <GlassDataProvenance
          fieldLabel={label}
          sourceLabel={value.source.name}
          sourceClass={value.source.sourceClass as GlassProvenanceSourceClass}
          retrievedAt={formatEvidenceDate(value.retrievedAt)}
          effectiveAt={value.effectiveAt ? formatEvidenceDate(value.effectiveAt) : undefined}
          validUntil={value.validUntil ? formatEvidenceDate(value.validUntil) : undefined}
          freshness={value.freshness}
          scopeLabel={SCOPE_LABELS[value.scope]}
          geographicResolution={value.geographicResolution}
          method={value.method}
          methodVersion={value.methodVersion}
          limitations={limitationsOverride ?? value.knownLimitations}
          conflicts={hasConflict(value) ? conflicts : undefined}
          currentValueLabel={answered ? text : undefined}
        />
      </div>
    </div>
  )
}

export interface EvidenceListProps {
  children: ReactNode
}

/** Kanıt satırlarının kabı — etiket/değer çiftleri `dl` semantiğiyle taşınır. */
export function EvidenceList({ children }: EvidenceListProps) {
  return <dl className={styles.list}>{children}</dl>
}
