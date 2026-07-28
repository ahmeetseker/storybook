/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import { createFileRoute, notFound } from '@tanstack/react-router'
import { ListingDetailWorkspace } from '@/features/listing-detail'
import {
  loadListingDetail,
  type ListingDetailScenario,
} from '@/features/listing-detail/data/listing-detail-adapter'
import { revealListingPhone } from '@/features/listing-detail/data/listing-phone'

const SCENARIOS: ListingDetailScenario[] = [
  'default',
  'stale-planning',
  'ai-unavailable',
  'map-unavailable',
  'inactive',
  'not-found',
]

/** Storybook/QA senaryolarını URL'den seçilebilir kılar; bilinmeyeni düşürür. */
export function parseListingDetailSearch(raw: Record<string, unknown>): {
  senaryo?: ListingDetailScenario
} {
  const value = raw.senaryo
  if (typeof value === 'string' && (SCENARIOS as string[]).includes(value)) {
    return { senaryo: value as ListingDetailScenario }
  }
  return {}
}

/**
 * Kanıt kesiti loader'da sabitlenir: aynı istek içinde tüm bölümler aynı
 * "şimdi" değerini kullanır, SSR ve hydration çıktıları ayrışmaz.
 */
export const Route = createFileRoute('/ilan/$listingId')({
  validateSearch: parseListingDetailSearch,
  loaderDeps: ({ search }) => ({ senaryo: search.senaryo }),
  loader: async ({ params, deps }) => {
    const result = await loadListingDetail({
      listingId: params.listingId,
      scenario: deps.senaryo,
      now: new Date().toISOString(),
    })
    if (!result) throw notFound()
    return result
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.detail.title} · ArsaPazar` },
          {
            name: 'description',
            // Mahalle her kayıtta bulunmaz; yoksa açıklama ilçeden başlar.
            content: `${[
              loaderData.detail.location.neighbourhood,
              loaderData.detail.location.district,
            ]
              .filter(Boolean)
              .join(', ')} · ${loaderData.detail.listingNumber} numaralı ilanın kaynaklı detayları.`,
          },
        ]
      : [{ title: 'İlan bulunamadı · ArsaPazar' }],
  }),
  component: ListingDetailRoutePage,
  notFoundComponent: ListingNotFound,
})

function ListingDetailRoutePage() {
  const result = Route.useLoaderData()
  const { listingId } = Route.useParams()
  // Numara loader'da getirilmez: sunucudan gelen HTML numarayı içermemelidir.
  return (
    <ListingDetailWorkspace
      result={result}
      onRevealPhone={() => revealListingPhone(listingId)}
    />
  )
}

function ListingNotFound() {
  return (
    <main>
      <h1>Bu ilan bulunamadı</h1>
      <p>
        İlan kaldırılmış veya adres yanlış olabilir. Benzer ilanlara arama sayfasından
        ulaşabilirsiniz.
      </p>
      <a href="/emlak">Arsa ilanlarına dön</a>
    </main>
  )
}
