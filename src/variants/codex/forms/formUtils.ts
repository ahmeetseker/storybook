import { useId, useState } from 'react'

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function mergeIds(...ids: Array<string | undefined>) {
  const value = ids.filter(Boolean).join(' ')
  return value || undefined
}

export function useStableId(providedId: string | undefined, prefix: string) {
  const generatedId = useId().replaceAll(':', '')
  return providedId ?? `${prefix}-${generatedId}`
}

export function useControllableValue<T>(
  value: T | undefined,
  defaultValue: T,
  onValueChange?: (value: T) => void,
) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const resolvedValue = value ?? internalValue

  const setValue = (nextValue: T) => {
    if (value === undefined) setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  return [resolvedValue, setValue] as const
}
