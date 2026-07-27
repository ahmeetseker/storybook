/**
 * Uygulamanın servis edildiği kök yol (Vite `base` değeriyle aynı kaynak).
 * Kökten servis edilirken boş string, alt yolda `/storybook/web` gibi bir önektir.
 */
const basePrefix = import.meta.env.BASE_URL.replace(/\/+$/, '')

/**
 * Ham `<a href>` değerlerini uygulamanın kök yoluna göre önekler.
 *
 * TanStack Router `<Link to>` kullanan yerlerde gerek yoktur; router basepath'i
 * kendisi uygular. Yalnızca gerçek sayfa yüklemesi yapan ham anchor'lar için.
 *
 * @param path Uygulama içi mutlak yol (`/emlak`, `/arsa-ara?tur=tarla`).
 */
export function withBase(path: string): string {
  if (!basePrefix || !path.startsWith('/')) return path
  return `${basePrefix}${path}`
}

/**
 * `withBase` ile eklenen kök yolu geri söker.
 *
 * Router `navigate`/`Link` API'leri basepath'i kendisi uyguladığı için onlara
 * her zaman önek taşımayan yol verilmelidir.
 *
 * @param path Önek taşıyabilen uygulama içi yol.
 */
export function stripBase(path: string): string {
  if (!basePrefix || !path.startsWith(basePrefix)) return path
  return path.slice(basePrefix.length) || '/'
}
