import { type InputHTMLAttributes, type KeyboardEvent } from 'react'
import { GlassInput } from '../GlassInput'
import styles from './GlassSearchField.module.css'

export interface GlassSearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'type'> {
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark' | 'auto'
  /** Odaklanınca genişleme (varsayılan açık); dar toolbar'larda kapatılabilir */
  expandOnFocus?: boolean
  /** Enter'a basılınca güncel değerle çağrılır */
  onSearch?: (value: string) => void
}

// Mercek ikonu — dekoratif; accessible name input placeholder/aria-label'dan gelir
function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false">
      <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function GlassSearchField({
  size = 'md',
  tone = 'auto',
  expandOnFocus = true,
  onSearch,
  placeholder = 'Ara…',
  className,
  onKeyDown,
  ...rest
}: GlassSearchFieldProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.key === 'Enter') {
      onSearch?.(e.currentTarget.value)
    } else if (e.key === 'Escape' && e.currentTarget.value) {
      // Apple kalıbı: Esc önce metni temizler (boşken event sahibine kalır — ör. overlay kapanışı)
      e.preventDefault()
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      setter?.call(e.currentTarget, '')
      e.currentTarget.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  return (
    <GlassInput
      type="search"
      size={size}
      tone={tone}
      prefix={<SearchIcon />}
      clearable
      placeholder={placeholder}
      className={[styles.root, expandOnFocus ? styles.expanding : '', className].filter(Boolean).join(' ')}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  )
}
