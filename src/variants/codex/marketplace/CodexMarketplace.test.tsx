import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import {
  CodexAgencyCard,
  CodexClimateRiskPanel,
  CodexFeatureGroup,
  CodexListingManagementCard,
  CodexLocationCard,
  CodexMarketplaceEmpty,
  CodexPriceHeader,
  CodexReviewCard,
  CodexSavedSearchCard,
  CodexSellerCard,
  CodexTrustPanel,
  CodexValuationCard,
} from './index'

describe('Codex marketplace components', () => {
  it('PriceHeader fiyat bağlamı ve favori toggle erişilebilirliğini korur', () => {
    const onFavoriteChange = vi.fn()
    render(
      <CodexPriceHeader
        title="Urla köşe parsel"
        location="İzmir · Urla"
        price="4.250.000 TL"
        unitPrice="8.301 TL/m²"
        previousPrice="4.480.000 TL"
        referenceId="11842891"
        favorite={false}
        onFavoriteChange={onFavoriteChange}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Urla köşe parsel', level: 1 })).toBeTruthy()
    expect(screen.getByText('4.250.000 TL')).toBeTruthy()
    expect(screen.getByText('4.480.000 TL').closest('del')?.textContent).toBe('Önceki fiyat: 4.480.000 TL')
    const favorite = screen.getByRole('button', { name: 'Favorilere ekle' })
    expect(favorite.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(favorite)
    expect(onFavoriteChange).toHaveBeenCalledWith(true)
  })

  it('AgencyCard kurumsal güven, istatistik ve aksiyonları sunar', () => {
    const onContact = vi.fn()
    render(
      <CodexAgencyCard
        name="Ege Parsel"
        location="Urla, İzmir"
        verified
        premium
        stats={[{ label: 'Aktif ilan', value: '184' }]}
        onContact={onContact}
      />,
    )
    const article = screen.getByRole('article')
    expect(within(article).getByRole('heading', { name: 'Ege Parsel' })).toBeTruthy()
    expect(within(article).getByTitle('Kurumsal hesap doğrulandı')).toBeTruthy()
    expect(within(article).getByText('Kurumsal Plus')).toBeTruthy()
    fireEvent.click(within(article).getByRole('button', { name: 'Mesaj gönder' }))
    expect(onContact).toHaveBeenCalledTimes(1)
  })

  it('SellerCard complementary landmark ve doğrulama kanallarını açıklar', () => {
    render(
      <CodexSellerCard
        name="Mert Deniz"
        joinedAt="2018’den beri üye"
        identityVerified
        phoneVerified
        onMessage={() => undefined}
      />,
    )
    const seller = screen.getByRole('complementary', { name: 'İlan sahibi' })
    expect(within(seller).getByText('Kimlik doğrulaması').closest('li')?.dataset.verified).toBe('true')
    expect(within(seller).getByText(/Kapora göndermeden/)).toBeTruthy()
  })

  it('LocationCard yaklaşık haritayı açık label ve gizlilik metniyle verir', () => {
    const onOpenMap = vi.fn()
    render(
      <CodexLocationCard
        title="Urla · Kalabak"
        address="118 ada çevresi"
        privacyLabel="Tam konum gizli"
        facts={[{ label: 'Denize', value: '900 m' }]}
        onOpenMap={onOpenMap}
      />,
    )
    expect(screen.getByRole('img', { name: 'Urla · Kalabak için yaklaşık harita görünümü' })).toBeTruthy()
    expect(screen.getByText('Tam konum gizli')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Haritada aç' }))
    expect(onOpenMap).toHaveBeenCalledTimes(1)
  })

  it('ValuationCard model sınırı, güven ve feedback state’ini taşır', () => {
    const onFeedbackChange = vi.fn()
    render(
      <CodexValuationCard
        estimate="4.310.000 TL"
        low="4.080.000 TL"
        high="4.560.000 TL"
        confidence={86}
        updatedAt="18 Temmuz"
        comparables={27}
        feedback="accurate"
        onFeedbackChange={onFeedbackChange}
      />,
    )
    expect(screen.getByRole('meter', { name: 'Model güveni' }).getAttribute('aria-valuenow')).toBe('86')
    expect(screen.getByText(/ekspertiz raporu/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Uygun' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Yüksek' }))
    expect(onFeedbackChange).toHaveBeenCalledWith('high')
  })

  it('ReviewCard puanı erişilebilir adla ve doğrulanmış işlem kanalıyla verir', () => {
    render(<CodexReviewCard author="Selin Akay" rating={5} date="12 Temmuz" body="Belgeler eksiksizdi." verifiedTransaction />)
    expect(screen.getByLabelText('5/5 puan')).toBeTruthy()
    expect(screen.getByText('Doğrulanmış işlem')).toBeTruthy()
    expect(screen.getByText('Belgeler eksiksizdi.')).toBeTruthy()
  })

  it('TrustPanel her sinyalin durum, kaynak ve aksiyonunu korur', () => {
    render(
      <CodexTrustPanel
        score={84}
        signals={[{ id: 'deed', label: 'Tapu kaydı', description: 'Eşleşti', status: 'verified', source: 'TKGM', updatedAt: 'Bugün', action: <button type="button">Belgeyi aç</button> }]}
      />,
    )
    expect(screen.getByLabelText('Güven puanı 84/100')).toBeTruthy()
    expect(screen.getByText('Doğrulandı')).toBeTruthy()
    expect(screen.getByText('TKGM · Bugün')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Belgeyi aç' })).toBeTruthy()
  })

  it('ClimateRiskPanel risk seviyesini metin ve kaynakla birlikte sunar', () => {
    render(
      <CodexClimateRiskPanel
        location="İzmir · Urla"
        updatedAt="2026 Q2"
        hazards={[{ id: 'quake', label: 'Deprem', level: 'high', summary: 'Parsel incelemesi gerekli.', source: 'AFAD' }]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Deprem' })).toBeTruthy()
    expect(screen.getByText('Yüksek')).toBeTruthy()
    expect(screen.getByText('Kaynak: AFAD')).toBeTruthy()
  })

  it('FeatureGroup unavailable state’i işaret ve metinle verir', () => {
    render(
      <CodexFeatureGroup
        title="Özellikler"
        sections={[{ id: 'infra', title: 'Altyapı', items: [{ id: 'gas', label: 'Doğalgaz', available: false }] }]}
      />,
    )
    const item = screen.getByText('Doğalgaz').closest('li')
    expect(item?.dataset.available).toBe('false')
    expect(item?.textContent).toContain('–')
  })

  it('SavedSearchCard alarm switch’i ve organik sonuç verisini korur', () => {
    const onEnabledChange = vi.fn()
    render(
      <CodexSavedSearchCard
        title="Urla parselleri"
        query="5 milyon altı arsa"
        filters={['Urla', 'Konut imarlı']}
        resultCount={128}
        newCount={6}
        enabled
        onEnabledChange={onEnabledChange}
      />,
    )
    const toggle = screen.getByRole('switch', { name: 'Arama alarmı' })
    expect((toggle as HTMLInputElement).checked).toBe(true)
    fireEvent.click(toggle)
    expect(onEnabledChange).toHaveBeenCalledWith(false)
    expect(screen.getByText('6 yeni')).toBeTruthy()
  })

  it('ListingManagementCard state ve issue için görünür çözüm sunar', () => {
    render(
      <CodexListingManagementCard
        title="Kaş turizm imarlı arsa"
        referenceId="ILN-48257"
        location="Antalya · Kaş"
        price="6,90 milyon TL"
        state="changes"
        issue="Güncel imar belgesi yükleyin."
        actions={<button type="button">Belgeyi güncelle</button>}
      />,
    )
    expect(screen.getByText('Değişiklik gerekli')).toBeTruthy()
    expect(screen.getByText(/Güncel imar belgesi/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Belgeyi güncelle' })).toBeTruthy()
  })

  it('MarketplaceEmpty her iş akışı için açıklayıcı boş durum üretir', () => {
    render(<CodexMarketplaceEmpty kind="alerts" action={<button type="button">Arama oluştur</button>} />)
    expect(screen.getByRole('heading', { name: 'Kayıtlı arama alarmı yok' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Arama oluştur' })).toBeTruthy()
  })
})
