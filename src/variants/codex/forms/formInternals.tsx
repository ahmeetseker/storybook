import { type ReactNode } from 'react'
import styles from './CodexForms.module.css'

interface FieldHeaderProps {
  controlId: string
  label?: ReactNode
  description?: ReactNode
  required?: boolean
  labelId?: string
  descriptionId?: string
}

export function FieldHeader({
  controlId,
  label,
  description,
  required,
  labelId,
  descriptionId,
}: FieldHeaderProps) {
  if (!label && !description) return null

  return (
    <span className={styles.fieldHeader}>
      {label ? (
        <label className={styles.fieldLabel} id={labelId} htmlFor={controlId}>
          <span>{label}</span>
          {required ? <span className={styles.requiredMark} aria-hidden>*</span> : null}
        </label>
      ) : null}
      {description ? (
        <span className={styles.fieldDescription} id={descriptionId}>
          {description}
        </span>
      ) : null}
    </span>
  )
}

interface FieldErrorProps {
  id: string
  children?: ReactNode
}

export function FieldError({ id, children }: FieldErrorProps) {
  if (!children) return null

  return (
    <span className={styles.fieldError} id={id} role="alert">
      <span className={styles.errorMark} aria-hidden>!</span>
      <span>{children}</span>
    </span>
  )
}
