/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { useAuthSession } from '@/features/auth'
import type { Oturum } from '@/features/auth'
import { ListingDetailWorkspace } from '@/features/listing-detail'
import {
  loadListingDetail,
  type ListingDetailScenario,
} from '@/features/listing-detail/data/listing-detail-adapter'
import { revealListingPhone } from '@/features/listing-detail/data/listing-phone'
import type { ListingQnaViewer } from '@/features/listing-detail/domain/listing-detail-types'

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

/**
 * Oturumu soru-cevap bölümünün beklediği görüntüleyene çevirir.
 *
 * Tam ad taşınmaz: yazışmada görünen kimlik kısaltmalıdır ("Ahmet Ş."), avatar
 * ise baş harflerdir. Tek kelimelik adda ikinci harf yoktur; o durumda tek
 * harf yeterlidir — uydurma bir ikinci harf üretilmez.
 */
function qnaGoruntuleyen(oturum: Oturum | null): ListingQnaViewer {
  if (!oturum) return { signedIn: false }
  const parcalar = oturum.adSoyad.trim().split(/\s+/).filter(Boolean)
  const ad = parcalar[0] ?? ''
  const soyad = parcalar.length > 1 ? parcalar[parcalar.length - 1] : ''
  return {
    signedIn: true,
    id: oturum.kullaniciId,
    label: soyad ? `${ad} ${soyad.charAt(0).toLocaleUpperCase('tr')}.` : ad,
    initials: `${ad.charAt(0)}${soyad.charAt(0)}`.toLocaleUpperCase('tr'),
  }
}

function ListingDetailRoutePage() {
  const result = Route.useLoaderData()
  const { listingId } = Route.useParams()
  const { oturum } = useAuthSession()
  const navigate = useNavigate()

  const viewer = qnaGoruntuleyen(oturum)

  // Numara loader'da getirilmez: sunucudan gelen HTML numarayı içermemelidir.
  return (
    <ListingDetailWorkspace
      result={result}
      onRevealPhone={() => revealListingPhone(listingId)}
      qnaViewer={viewer}
      /* Kapı yalnız oturum kapalıyken çizilir; hedef, giriş sonrası tam bu
         bölüme dönecek şekilde `donus` taşır (bkz. auth `guvenliDonusYolu`). */
      onQnaGirisIste={
        viewer.signedIn
          ? undefined
          : () => {
              void navigate({
                to: '/giris',
                search: { donus: `/ilan/${listingId}#sorular` },
              })
            }
      }
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
