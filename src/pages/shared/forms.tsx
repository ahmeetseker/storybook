// Sayfa demoları için flat form primitifleri — token tabanlı, backdrop-filter'sız.
// Not: bunlar demo-grade'dir; kütüphaneye Glass form componentleri ayrıca tasarlanacak.
import type { CSSProperties, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'

const fieldBase: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 'var(--lg-control-md, 40px)',
  padding: '0 14px',
  borderRadius: 'var(--lg-radius-chip, 10px)',
  border: '1px solid var(--lg-hairline)',
  background: 'var(--lg-surface)',
  color: 'var(--lg-label)',
  font: 'inherit',
  fontSize: 'var(--lg-text-body, 15px)',
  outline: 'none',
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 'var(--lg-text-footnote, 13px)', fontWeight: 600 }}>
        {label}
      </label>
      {children(id)}
      {error ? (
        <span role="alert" style={{ fontSize: 12, color: 'var(--lg-danger)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 12, color: 'var(--lg-label-secondary)' }}>{hint}</span>
      ) : null}
    </div>
  )
}

export function TextInput({ invalid, style, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input style={{ ...fieldBase, borderColor: invalid ? 'var(--lg-danger)' : 'var(--lg-hairline)', ...style }} {...rest} />
}

export function TextArea({ style, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} style={{ ...fieldBase, padding: '10px 14px', resize: 'vertical', ...style }} {...rest} />
}

export function Select({ style, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select style={{ ...fieldBase, appearance: 'auto', ...style }} {...rest}>
      {children}
    </select>
  )
}

export function CheckRow({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, lineHeight: 1.5, cursor: 'pointer' }}>
      <input type="checkbox" style={{ marginTop: 3, accentColor: 'var(--lg-accent)' }} {...rest} />
      <span>{label}</span>
    </label>
  )
}

/** Durum rozeti — durum makinesi renkleri semantic token'lardan */
export function StatusBadge({ tone, children }: { tone: 'neutral' | 'success' | 'warning' | 'danger'; children: ReactNode }) {
  const bg =
    tone === 'success' ? 'var(--lg-success)' : tone === 'warning' ? 'var(--lg-warning)' : tone === 'danger' ? 'var(--lg-danger)' : 'var(--lg-label-secondary)'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 999,
        background: bg,
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/**
 * EİDS kapsam notu — repo genelinde tek cümle. Rozet neyin doğrulandığını
 * değil, neyin doğrulanmadığını da söylemek zorundadır.
 */
export const EIDS_SCOPE_NOTE =
  'Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.'

/**
 * EİDS göstergesi.
 *
 * Rozet alan-kapsamlıdır: EİDS yalnız **ilan verme yetkisini** kontrol eder.
 * Bu yüzden görünür metin çıplak bir "Doğrulandı" değil, kontrolün adıdır;
 * kapsam cümlesi `title` ile taşınır.
 */
export function EidsBadge({ dogrulandi }: { dogrulandi: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 999,
        border: '1px solid var(--lg-hairline)',
        background: 'var(--lg-surface)',
        color: dogrulandi ? 'var(--lg-success)' : 'var(--lg-warning)',
        fontSize: 12,
        fontWeight: 700,
      }}
      title={
        dogrulandi
          ? `İlan verme yetkisi EİDS ile doğrulandı. ${EIDS_SCOPE_NOTE}`
          : `İlan verme yetkisinin EİDS kontrolü tamamlanmadı. ${EIDS_SCOPE_NOTE}`
      }
    >
      {dogrulandi ? '✓ EİDS: ilan yetkisi' : '… EİDS: yetki bekliyor'}
    </span>
  )
}
