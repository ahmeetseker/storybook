/**
 * Sınıf adlarını birleştirir — shadcn'in `cn` yardımcısının bu projedeki
 * karşılığı. Tailwind kullanılmadığı için `tailwind-merge` gerekmez;
 * falsy değerler ayıklanır, kalanlar boşlukla birleşir.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
