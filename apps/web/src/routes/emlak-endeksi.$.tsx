/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
/**
 * Emlak Endeksi — tek splat route dört coğrafi seviyeyi de karşılar.
 *
 * `/emlak-endeksi/{tip}/{islem}/{il}/{ilce}/{mahalle}`
 *
 * Ayrı bir "landing" route'u YOKTUR: Türkiye kökü landing görevini görür.
 * Emlakjet, Endeksa ve Zillow'un üçü de böyle yapıyor — recursive tek şablon,
 * seviye yalnız blokları kırpıyor (bkz. docs/emlak-endeksi-arastirma-ve-plan-2026-08-05.md §B).
 */
import { createFileRoute } from '@tanstack/react-router'
import { PriceIndexView } from '@/features/price-index'
import { loadPriceIndex, parsePriceIndexPath } from '@/features/price-index/data/price-index-adapter'

export const Route = createFileRoute('/emlak-endeksi/$')({
  loader: async ({ params }) => {
    const path = parsePriceIndexPath((params as { _splat?: string })._splat)
    const result = await loadPriceIndex({ path })
    return { result, path }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: 'Emlak Endeksi · ArsaPazar' }] }
    const { result, path } = loaderData
    const bolge = result.snapshot.region.name
    const islem = path.transactionType === 'satilik' ? 'satılık' : 'kiralık'
    const fiyat = result.snapshot.headline.medianPricePerSqm.value
    return {
      meta: [
        { title: `${bolge} ${islem} konut fiyatları ve emlak endeksi · ArsaPazar` },
        {
          name: 'description',
          content: fiyat
            ? `${bolge} ${islem} konut medyan ilan m² fiyatı ${fiyat.toLocaleString('tr-TR')} TL. Nominal ve enflasyondan arındırılmış reel değişim, arz, kira getirisi ve alt bölge sıralaması.`
            : `${bolge} için endeks verisi yeterli örneklem bulunmadığından yayımlanmadı.`,
        },
        // Bugün her seviye `noindex, follow`: veri fixture, arama motoruna
        // uydurma fiyat açılmaz (bkz. config/routes.ts `price-index`).
        // Gerçek veriye geçilince kural şu olacak: yetersiz örneklemli bölge
        // `noindex, follow` kalır, diğerleri `index, follow` olur (plan §B).
        { name: 'robots', content: 'noindex, follow' },
      ],
    }
  },
  component: PriceIndexRoutePage,
})

function PriceIndexRoutePage() {
  const { result, path } = Route.useLoaderData()
  return <PriceIndexView result={result} path={path} />
}
