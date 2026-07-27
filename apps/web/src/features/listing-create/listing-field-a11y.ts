export function listingFieldA11y(
  id: string,
  error?: string,
  description?: string,
) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error
      ? `${id}-error`
      : description
        ? `${id}-description`
        : undefined,
  } as const
}
