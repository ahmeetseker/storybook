import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { loadListingDetail } from '../data/listing-detail-adapter'
import type { ListingDetail } from '../domain/listing-detail-types'
import { ListingDecisionRail } from './ListingDecisionRail'
import { ListingDock } from './ListingDock'

const NOW = '2026-07-27T09:00:00.000Z'

async function fixture(
  scenario?: Parameters<typeof loadListingDetail>[0]['scenario'],
): Promise<ListingDetail> {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario, now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return result.detail
}

async function renderRail(
  props: Partial<Parameters<typeof ListingDecisionRail>[0]> = {},
  scenario?: Parameters<typeof loadListingDetail>[0]['scenario'],
) {
  const detail = await fixture(scenario)
  render(
    <ListingDecisionRail
      detail={detail}
      priceNote="Birim fiyat beyan edilen 5.240 m² alana göre hesaplandı."
      {...props}
    />,
  )
  return screen.getByRole('complementary', { name: 'Karar kolonu' })
}

describe('ListingDecisionRail — sekmeli karar kartı', () => {
  // Kartın ana vaadi: fiyat kolonda BİR kez büyür. Eski sticky "fiyat çapası"
  // aynı sayıyı ikinci kez yazıyordu.
  it('fiyat ve birim fiyat kartta yalnız birer kez geçer', async () => {
    const card = await renderRail()
    expect(within(card).getAllByText(/8\.750\.000 ₺/)).toHaveLength(1)
    expect(within(card).getAllByText(/1\.804 ₺\/m²/)).toHaveLength(1)
    // Birim fiyatın hangi alana dayandığı Özet panelinde tek cümleyle yazılır.
    expect(
      within(card).getByText('Birim fiyat beyan edilen 5.240 m² alana göre hesaplandı.'),
    ).toBeTruthy()
  })

  it('üç sekme WAI-ARIA sözleşmesiyle çizilir; Özet varsayılandır', async () => {
    const card = await renderRail()
    const tabs = within(card).getAllByRole('tab')
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Özet', 'Doğrulama', 'Satıcı'])

    const [ozet, dogrulama] = tabs
    expect(ozet.getAttribute('aria-selected')).toBe('true')
    expect(dogrulama.getAttribute('aria-selected')).toBe('false')
    // Roving tabindex: yalnız seçili sekme sekme sırasındadır.
    expect(ozet.getAttribute('tabindex')).toBe('0')
    expect(dogrulama.getAttribute('tabindex')).toBe('-1')

    const panel = within(card).getByRole('tabpanel')
    expect(panel.getAttribute('id')).toBe(ozet.getAttribute('aria-controls'))
    expect(panel.getAttribute('aria-labelledby')).toBe(ozet.getAttribute('id'))
  })

  it('sekme değişince panel içeriği değişir', async () => {
    const user = userEvent.setup()
    const card = await renderRail()

    // Özet: olgu ızgarası + açık konular.
    expect(within(card).getByRole('region', { name: /Görüşmeden önce/ })).toBeTruthy()
    expect(within(card).getByText('Yayın tarihi')).toBeTruthy()

    await user.click(within(card).getByRole('tab', { name: 'Doğrulama' }))
    expect(within(card).getByText('7 kontrolün 4 tanesi olumlu')).toBeTruthy()
    expect(within(card).getByText('Platform moderasyonu tamamlandı')).toBeTruthy()
    expect(within(card).queryByRole('region', { name: /Görüşmeden önce/ })).toBeNull()

    await user.click(within(card).getByRole('tab', { name: 'Satıcı' }))
    expect(within(card).getByRole('link', { name: 'Satıcı bölümü' }).getAttribute('href')).toBe(
      '#satici',
    )
    expect(within(card).queryByText('Platform moderasyonu tamamlandı')).toBeNull()
  })

  // Durum yalnız renkle taşınmaz: her kontrol satırı sonucunu kelimeyle yazar.
  it('doğrulama satırları durumu kelimeyle de yazar', async () => {
    const user = userEvent.setup()
    const card = await renderRail()
    await user.click(within(card).getByRole('tab', { name: 'Doğrulama' }))
    expect(within(card).getAllByText('Olumlu').length).toBeGreaterThan(0)
    expect(within(card).getAllByText('Olumsuz').length).toBeGreaterThan(0)
  })

  it('sekmeler ok tuşları ve Home/End ile gezilir; odak seçimi izler', async () => {
    const user = userEvent.setup()
    const card = await renderRail()
    const [ozet, dogrulama, satici] = within(card).getAllByRole('tab')

    ozet.focus()
    await user.keyboard('{ArrowRight}')
    expect(dogrulama.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(dogrulama)

    await user.keyboard('{ArrowLeft}')
    expect(ozet.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(ozet)

    await user.keyboard('{End}')
    expect(satici.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(satici)

    await user.keyboard('{Home}')
    expect(ozet.getAttribute('aria-selected')).toBe('true')

    // Uçlarda dolanır: ilk sekmeden sola giden son sekmeye düşer.
    await user.keyboard('{ArrowLeft}')
    expect(satici.getAttribute('aria-selected')).toBe('true')
  })

  // rules.md §4: rotası olmayan kontrol çizilmez; yeteneğin geleceği yazılır.
  it('mesajlaşma bağlı değilken buton çizilmez, tek satır not durur', async () => {
    const card = await renderRail({ onGoToSeller: vi.fn() })
    expect(within(card).queryByRole('button', { name: 'Mesaj gönder' })).toBeNull()
    expect(within(card).getByText(/Mesajlaşma sonraki fazda açılacak/)).toBeTruthy()

    const primary = card.querySelectorAll('[data-variant="primary"]')
    expect(primary).toHaveLength(1)
    expect(primary[0].textContent).toBe('Satıcı bilgilerine git')
  })

  it('mesajlaşma bağlandığında birincil eylemi devralır', async () => {
    const onContact = vi.fn()
    const user = userEvent.setup()
    const card = await renderRail({ onContact, onGoToSeller: vi.fn() })

    const primary = card.querySelectorAll('[data-variant="primary"]')
    expect(primary).toHaveLength(1)
    expect(primary[0].textContent).toBe('Mesaj gönder')
    expect(within(card).queryByText(/Mesajlaşma sonraki fazda açılacak/)).toBeNull()

    await user.click(within(card).getByRole('button', { name: 'Mesaj gönder' }))
    expect(onContact).toHaveBeenCalledTimes(1)
    // Satıcıya gitme kaybolmaz, ikincil sıraya iner.
    expect(within(card).getByRole('button', { name: 'Satıcı bilgilerine git' })).toBeTruthy()
  })

  it('birincil eylem satıcı bölümüne götürür, numarayı kendisi açmaz', async () => {
    const onGoToSeller = vi.fn()
    const user = userEvent.setup()
    const card = await renderRail({ onGoToSeller })

    await user.click(within(card).getByRole('button', { name: 'Satıcı bilgilerine git' }))
    expect(onGoToSeller).toHaveBeenCalledTimes(1)

    // Numara sözleşmesi tek yerde yaşar: kart onu kopyalamaz.
    await user.click(within(card).getByRole('tab', { name: 'Satıcı' }))
    expect(within(card).queryByRole('button', { name: 'Numarayı göster' })).toBeNull()
    expect(card.querySelector('a[href^="tel:"]')).toBeNull()
  })

  it('iletişim kapalıyken birincil eylem kapanır ve gerekçe bir kez yazılır', async () => {
    const card = await renderRail({ onGoToSeller: vi.fn() }, 'inactive')
    expect(within(card).getByRole('button', { name: 'Satıcı bilgilerine git' })).toHaveProperty(
      'disabled',
      true,
    )
    expect(within(card).getAllByText(/İlan süresi doldu/i)).toHaveLength(1)
  })

  it('kaydet ikincil eylemi durumunu aria-pressed ile bildirir', async () => {
    const user = userEvent.setup()
    const card = await renderRail()
    const save = within(card).getByRole('button', { name: 'Kaydet' })
    expect(save.getAttribute('aria-pressed')).toBe('false')
    await user.click(save)
    expect(within(card).getByRole('button', { name: 'Kayıtlı' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
  })
})

describe('ListingDock — dar yerleşimin tek kontrol yüzeyi', () => {
  // Kart ile dock aynı kontrolü iki kez çizmez: dock'ta buton yoktur, satıcı
  // bölümüne götüren tek bağlantı vardır.
  it('fiyat çapası ve satıcı bölümüne tek bağlantı taşır', async () => {
    const detail = await fixture()
    const { container } = render(<ListingDock detail={detail} />)

    expect(screen.getByText(/8\.750\.000 ₺/)).toBeTruthy()
    expect(container.querySelectorAll('button')).toHaveLength(0)
    expect(screen.getByRole('link', { name: 'Satıcıya git' }).getAttribute('href')).toBe('#satici')
  })

  it('iletişim kapalıyken kartın uyarı cümlesini tekrar etmez', async () => {
    const detail = await fixture('inactive')
    render(<ListingDock detail={detail} />)
    expect(screen.queryByText(/İlan süresi doldu/i)).toBeNull()
    expect(screen.getByText(/İletişim kapalı/)).toBeTruthy()
    // Bağlantı çalışmaya devam eder: gerekçe satıcı bölümünde okunur.
    expect(screen.getByRole('link', { name: 'Satıcıya git' })).toBeTruthy()
  })
})
