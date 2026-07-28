import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { loadListingDetail } from '../data/listing-detail-adapter'
import type { EvidenceValue } from '../domain/evidence'
import { EvidenceList, EvidenceRow } from './EvidenceRow'
import { ParcelSection } from './ParcelSection'
import { PlanningAndLegalSection } from './PlanningAndLegalSection'
import { InfrastructureSection } from './InfrastructureSection'
import { HazardSection } from './HazardSection'
import { MarketSection } from './MarketSection'

const NOW = '2026-07-27T09:00:00.000Z'
/** Kanıt kesitinden yıllar sonrası: takvim eşiği her şeyi bayatlatmaya yeter. */
const MUCH_LATER = '2029-07-27T09:00:00.000Z'

async function detail(now: string = NOW) {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', now })
  if (!result) throw new Error('fixture bulunamadı')
  return result.detail
}

describe('kanıt bölümleri', () => {
  it('her kanıt satırı bir kaynak künyesi taşır', async () => {
    render(<PlanningAndLegalSection detail={await detail()} />)
    const section = screen.getByRole('region', { name: 'İmar ve Hukuk' })
    const badges = within(section).getAllByRole('button', { expanded: false })
    expect(badges.length).toBeGreaterThanOrEqual(4)
  })

  it('bayat plan notu "Güncel değil" etiketiyle görünür', async () => {
    render(<PlanningAndLegalSection detail={await detail()} />)
    expect(screen.getByRole('button', { name: /Güncel değil/ })).toBeTruthy()
  })

  it('takyidat bilgisi yoksa "bulunmadığı anlamına gelmez" uyarısı gösterilir', async () => {
    const user = userEvent.setup()
    render(<PlanningAndLegalSection detail={await detail()} />)
    await user.click(screen.getByRole('button', { name: /Takyidat kaynağı/ }))
    expect(screen.getByText(/bulunmadığı anlamına gelmez/i)).toBeTruthy()
  })

  it('yasal ve fiziksel erişimi ayrı satırlarda gösterir', async () => {
    render(<InfrastructureSection detail={await detail()} />)
    expect(screen.getByText('Yasal yol erişimi')).toBeTruthy()
    expect(screen.getByText('Fiziksel ulaşım')).toBeTruthy()
    expect(screen.getByText(/Yola yakınlık yasal erişim hakkı değildir/)).toBeTruthy()
  })

  it('tehlike göstergeleri risk hükmü içermez ve kapsam notu taşır', async () => {
    render(<HazardSection detail={await detail()} />)
    expect(screen.getByText('Bölgesel deprem tehlike göstergesi')).toBeTruthy()
    expect(screen.getByText(/Tehlike risk değildir/)).toBeTruthy()
    expect(screen.queryByText(/güvenli parsel/i)).toBeNull()
  })

  it('yayımlanmamış katman "tehlike yok" gibi sunulmaz', async () => {
    render(<HazardSection detail={await detail()} />)
    expect(screen.getByText(/taşkın tehlikesi olmadığı anlamına gelmez/i)).toBeTruthy()
  })

  it('değerleme çekindiğinde aralık yerine gerekçe gösterilir', async () => {
    render(<MarketSection detail={await detail()} />)
    expect(screen.getByText('ArsaPazar fiyat tahmini üretilmedi')).toBeTruthy()
    expect(screen.getByText(/gerçekleşmiş işlem verisi yok/)).toBeTruthy()
    expect(screen.queryByText(/ekspertiz/i)).toBeNull()
  })

  it('emsal tablosu gerçek table semantiği kullanır', async () => {
    render(<MarketSection detail={await detail()} />)
    expect(screen.getByRole('table', { name: /Emsal/ })).toBeTruthy()
  })

  // Takvim eşiği yalnız gerçekten bayatlayan veriye uygulanır. Kadastral
  // kimlik ve yürürlükteki ulusal tehlike haritası sürümü yıllar sonra da
  // "Güncel değil" damgası yemez — sağlam resmî veriyi şüpheye düşürmek,
  // aşırı iddianın ters yönüdür.
  // Not: künyenin erişilebilir adında ekran-okuyucu öneki ile rozet metni
  // arasında boşluk yoktur (`… kaynağı:Resmî kayıttan`) — accname algoritması
  // düğüm metinlerini ayrı ayrı kırpar. Eşleşmeler bu yüzden regex'tir.
  it('kadastral kimlik yıllar sonra da "Güncel değil" damgası yemez', async () => {
    render(
      <ParcelSection detail={await detail(MUCH_LATER)} mapSection={{ state: 'ready', data: true }} />,
    )

    expect(screen.getByText('214 ada / 7 parsel')).toBeTruthy()
    expect(screen.getByRole('button', { name: /^Ada \/ parsel kaynağı:\s*Resmî kayıttan$/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^Ada \/ parsel kaynağı:\s*Güncel değil$/ })).toBeNull()

    // Aynı bölümde gerçekten bayatlayan türetilmiş değerler hâlâ bayatlıyor:
    // kural "her şeyi güncel say" değil, "yalnız takvimle değişeni ölç".
    expect(screen.getByRole('button', { name: /^Konum kesinliği kaynağı:\s*Güncel değil$/ })).toBeTruthy()
  })

  it('yürürlükteki deprem tehlike haritası yıllar sonra da "Güncel değil" damgası yemez', async () => {
    render(<HazardSection detail={await detail(MUCH_LATER)} />)

    expect(
      screen.getByRole('button', {
        name: /^Bölgesel deprem tehlike göstergesi kaynağı:\s*Resmî kayıttan$/,
      }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('button', {
        name: /^Bölgesel deprem tehlike göstergesi kaynağı:\s*Güncel değil$/,
      }),
    ).toBeNull()

    expect(
      screen.getByRole('button', {
        name: /^Orman yangını duyarlılık göstergesi kaynağı:\s*Güncel değil$/,
      }),
    ).toBeTruthy()
  })

  // Kaynağın bilinmesi cevabın doğrulandığı anlamına gelmez: bilinen resmî bir
  // sağlayıcıdan cevap alınamadığında künye "Resmî kayıttan" diyemez.
  it('bilinen kaynaktan cevap alınamadığında künye "Doğrulanamadı" der', () => {
    const unreachable: EvidenceValue<string> = {
      status: 'unavailable',
      unavailableReason: 'provider_unavailable',
      freshness: 'unknown',
      source: {
        id: 'megsis',
        name: 'TKGM MEGSİS',
        sourceClass: 'official',
        authority: 'Tapu ve Kadastro Genel Müdürlüğü',
      },
      retrievedAt: '2026-07-24T09:12:00.000Z',
      scope: 'parcel',
    }

    render(
      <EvidenceList>
        <EvidenceRow label="Yüzölçümü" value={unreachable} />
      </EvidenceList>,
    )

    expect(screen.getByText(/sorgusuna ulaşılamadı/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Doğrulanamadı/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Resmî kayıttan/ })).toBeNull()
  })
})
