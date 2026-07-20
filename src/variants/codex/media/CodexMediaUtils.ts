import { useCallback, useState } from 'react'

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function useControllableValue<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const resolvedValue = value ?? internalValue
  const setValue = useCallback((nextValue: T) => {
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue)
  }, [onChange, value])

  return [resolvedValue, setValue] as const
}
