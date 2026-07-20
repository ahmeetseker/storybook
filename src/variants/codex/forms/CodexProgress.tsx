import { type HTMLAttributes, type ReactNode } from 'react'
import styles from './CodexForms.module.css'
import { classNames, useStableId } from './formUtils'

export type CodexProgressTone = 'accent' | 'info' | 'success' | 'danger'

export interface CodexProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode
  description?: ReactNode
  value?: number
  max?: number
  showValue?: boolean
  formatValue?: (value: number, max: number) => string
  tone?: CodexProgressTone
  loadingLabel?: string
}

const toneClasses: Record<CodexProgressTone, string | undefined> = {
  accent: undefined,
  info: styles.progressInfo,
  success: styles.progressSuccess,
  danger: styles.progressDanger,
}

export function CodexProgress({
  label,
  description,
  value,
  max = 100,
  showValue = true,
  formatValue = (currentValue, maximum) => `${Math.round((currentValue / maximum) * 100)}%`,
  tone = 'accent',
  loadingLabel = 'İşlem sürüyor',
  id,
  className,
  ...rest
}: CodexProgressProps) {
  if (max <= 0) throw new Error('CodexProgress: max değeri sıfırdan büyük olmalıdır.')

  const progressId = useStableId(id, 'cx-progress')
  const labelId = `${progressId}-label`
  const descriptionId = `${progressId}-description`
  const determinate = typeof value === 'number'
  const resolvedValue = determinate ? Math.min(max, Math.max(0, value)) : undefined
  const valueLabel = resolvedValue === undefined ? loadingLabel : formatValue(resolvedValue, max)

  return (
    <div
      {...rest}
      id={progressId}
      className={classNames(styles.progressRoot, className)}
      data-indeterminate={!determinate || undefined}
    >
      <span className={styles.progressHeader}>
        <span className={styles.progressLabel} id={labelId}>{label}</span>
        {showValue ? <span className={styles.progressValue}>{valueLabel}</span> : null}
      </span>
      <progress
        className={classNames(styles.progressTrack, toneClasses[tone])}
        value={resolvedValue}
        max={max}
        aria-labelledby={labelId}
        aria-valuetext={valueLabel}
        aria-describedby={description ? descriptionId : undefined}
      />
      {description ? <span className={styles.fieldDescription} id={descriptionId}>{description}</span> : null}
    </div>
  )
}
