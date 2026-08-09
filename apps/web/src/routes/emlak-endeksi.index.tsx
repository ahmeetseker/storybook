/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
/**
 * `/emlak-endeksi` — Türkiye kökü. Ayrı bir "landing" şablonu DEĞİLDİR: aynı
 * görünümü boş yol ile render eder, yani ürünün kökü de diğer seviyelerle aynı
 * şablonu paylaşır (plan §B). Navigasyonun işaret ettiği kısa adres budur;
 * derin seviyeler `emlak-endeksi.$.tsx` splat route'undan gelir.
 */
import { createFileRoute } from '@tanstack/react-router'
import { PriceIndexView } from '@/features/price-index'
import { loadPriceIndex, parsePriceIndexPath } from '@/features/price-index/data/price-index-adapter'
import { createPageHead } from '@/config/routes'

export const Route = createFileRoute('/emlak-endeksi/')({
  loader: async () => {
    const path = parsePriceIndexPath('konut/satilik')
    const result = await loadPriceIndex({ path })
    return { result, path }
  },
  head: () => createPageHead('price-index'),
  component: PriceIndexHomePage,
})

function PriceIndexHomePage() {
  const { result, path } = Route.useLoaderData()
  return <PriceIndexView result={result} path={path} />
}
