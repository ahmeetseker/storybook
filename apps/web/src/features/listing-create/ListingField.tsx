import type { ReactNode } from 'react'
import styles from './ListingCreateWorkspace.module.css'

interface ListingFieldProps {
  id: string
  label: string
  required?: boolean
  description?: string
  error?: string
  className?: string
  children: ReactNode
}

export function ListingField({
  id,
  label,
  required = false,
  description,
  error,
  className,
  children,
}: ListingFieldProps) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {!error && description ? (
        <p id={`${id}-description`} className={styles.fieldHelp}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={styles.fieldError} aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  )
}
