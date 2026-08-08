import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ListingDetailWorkspace, type ListingDetailWorkspaceProps } from './ListingDetailWorkspace'
import { loadListingDetail } from './data/listing-detail-adapter'

const NOW = '2026-07-27T09:00:00.000Z'

async function renderWorkspace(
  scenario?: Parameters<typeof loadListingDetail>[0]['scenario'],
  handlers: Omit<ListingDetailWorkspaceProps, 'result'> = {},
) {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario, now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return render(<ListingDetailWorkspace result={result} {...handlers} />)
}

describe('ListingDetailWorkspace', () => {
  it('sayfada tek h1 bulunur', async () => {
    await renderWorkspace()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('aynı anda en fazla altı cam yüzey render eder', async () => {
    const { container } = await renderWorkspace()
    expect(container.querySelectorAll('[data-material="glass"]').length).toBeLessThanOrEqual(6)
  })

  // Medya sahnesi: kayıt gerçek fotoğraf taşımadığı için kareler temsilidir
  // açıklama cümlesi sayfada değil tam ekran görüntüleyicide durur.
  it('temsili kapak görselini gösterir, açıklama cümlesini sayfaya yazmaz', async () => {
    await renderWorkspace()
    const cover = screen.getByAltText(/temsili fotoğraf — parselden deniz yönü/i)
    expect(cover.getAttribute('src')).toBeTruthy()
    expect(
      screen.queryByText(
        'Görseller temsili fotoğraflardır; yüklenemezse mevcut ilan görseli gösterilir.',
      ),
    ).toBeNull()
  })

  // Fotoğrafı olmayan kalemler (parsel görünümü, plan notu) temsili bir kare
  // almaz; künyeleriyle birlikte döküm olarak görünür kalır.
  it('fotoğraf olmayan medya kalemleri künyesiyle döküm olarak kalır', async () => {
    await renderWorkspace()
    expect(screen.getByText('Parsel görünümü')).toBeTruthy()
    expect(screen.getByText('Plan notu (PDF)')).toBeTruthy()
    expect(screen.queryByAltText(/Plan notu/i)).toBeNull()
  })

  // Fiyat karar kolonundadır; başlık künyesi onu ikinci kez yazmaz.
  it('fiyat başlık künyesinde değil karar kolonunda durur', async () => {
    await renderWorkspace()
    const header = screen.getByRole('heading', { level: 1 }).closest('header')
    expect(header).toBeTruthy()
    expect(header!.textContent).not.toContain('8.750.000 ₺')

    const rail = screen.getByRole('complementary', { name: 'Karar kolonu' })
    expect(within(rail).getByText('8.750.000 ₺')).toBeTruthy()
  })

  // Doğrulama vektörü dar kolonda değil kendi bölümünde durur; karar kartı
  // yalnız sayacı taşır ve Doğrulama sekmesi vektöre bağlanır — bilgi
  // kaybolmaz, taşınır.
  it('doğrulama vektörü kendi bölümünde durur; karar kartı sekmesi vektöre bağlanır', async () => {
    const user = userEvent.setup()
    const { container } = await renderWorkspace()
    const rail = screen.getByRole('complementary', { name: 'Karar kolonu' })

    // Özet sekmesi açıkken kartta yalnız sayaç vardır, satır başlıkları değil.
    expect(within(rail).getByText('4/7 olumlu')).toBeTruthy()
    expect(within(rail).queryByText('Platform moderasyonu tamamlandı')).toBeNull()

    await user.click(within(rail).getByRole('tab', { name: 'Doğrulama' }))
    expect(within(rail).getByText('7 kontrolün 4 tanesi olumlu')).toBeTruthy()
    expect(within(rail).getByText('İlan yüzölçümü parsel kaydıyla eşleşmedi')).toBeTruthy()

    const link = within(rail).getByRole('link', { name: /Doğrulama vektörünün tamamı/ })
    const target = container.querySelector(link.getAttribute('href')!)
    expect(target).toBeTruthy()
    expect(within(target as HTMLElement).getByText('Platform moderasyonu tamamlandı')).toBeTruthy()
  })

  it('EİDS satırını kapsam notuyla birlikte gösterir', async () => {
    await renderWorkspace()
    expect(screen.getByText('İlan verme yetkisi EİDS ile doğrulandı')).toBeTruthy()
    expect(
      screen.getByText(
        'Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.',
      ),
    ).toBeTruthy()
  })

  it('kritik eksikleri ilk görünümde, accordion arkasına saklamadan listeler', async () => {
    await renderWorkspace()
    const critical = screen.getByRole('region', { name: /Görüşmeden önce/ })
    expect(within(critical).getByText(/hisseli/i)).toBeTruthy()
    expect(within(critical).getByText(/Yasal yol erişimi/i)).toBeTruthy()
    expect(within(critical).getByText(/çelişki/i)).toBeTruthy()
  })

  it('bölüm indeksi yedi bölümü sırayla bağlar', async () => {
    await renderWorkspace()
    const nav = screen.getByRole('navigation', { name: 'Bölümler' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'Özet',
      'Parsel',
      'İmar ve Hukuk',
      'Altyapı ve Erişim',
      'Arazi ve Tehlike',
      'Piyasa',
      'Belgeler',
    ])
  })

  // Kontrolün gerçekten uygulandığı yerde sonucu yazılır: yetki belgesi değeri
  // olan emlak ofisinde ray numarayı gösterir, "doğrulanamadı" demez.
  it('yetki belgesi olan emlak ofisinde ray belge numarasını yazar', async () => {
    await renderWorkspace()
    expect(screen.getByText('Yetki belgesi: TTBS 4820/1173')).toBeTruthy()
    expect(screen.queryByText('Yetki belgesi doğrulanamadı.')).toBeNull()
  })

  // Sayfada tek dolu buton vardır ve o buton gerçekten çalışan eylemdir.
  it('karar kartında sayfanın tek birincil eylemi bulunur', async () => {
    const { container } = await renderWorkspace(undefined, {
      onRevealPhone: async () => '0 (252) 000 00 00',
    })
    const primaries = container.querySelectorAll('[data-variant="primary"]')
    expect(primaries).toHaveLength(1)
    expect(primaries[0].textContent).toBe('Satıcı bilgilerine git')
    expect(primaries[0]).toHaveProperty('disabled', false)
  })

  // rules.md §4: rotası olmayan kontrol çizilmez, gerekçesi yazılır; gerçekten
  // var olabilen ama bu görünümde bulunmayan kontrol `disabled` durur ve
  // gerekçesi yine görünür. İki durumda da yetenek sessizce yok sayılmaz.
  it('bağlanmamış eylem çizilmez ya da devre dışı durur; gerekçesi görünür', async () => {
    await renderWorkspace()

    // Mesajlaşmanın rotası yok → buton hiç çizilmez.
    expect(screen.queryByRole('button', { name: 'Mesaj gönder' })).toBeNull()
    expect(screen.getByText(/Mesajlaşma sonraki fazda açılacak/i)).toBeTruthy()

    const disabled = ['Satıcı bilgilerine git', 'Yanlış bilgi bildir']
    for (const name of disabled) {
      expect(screen.getByRole('button', { name })).toHaveProperty('disabled', true)
    }

    expect(screen.getByText(/açılabilecek bir numara kontrolü yok/i)).toBeTruthy()
    expect(screen.getByText(/Geri bildirim akışı bu sürümde bağlı değil/i)).toBeTruthy()
  })

  it('işleyici bağlandığında aynı eylemler etkinleşir ve çağrılır', async () => {
    const user = userEvent.setup()
    const onContact = vi.fn()
    const onReportIssue = vi.fn()
    await renderWorkspace(undefined, {
      onContact,
      onReportIssue,
      onRevealPhone: async () => '0 (252) 000 00 00',
    })

    await user.click(screen.getByRole('button', { name: 'Mesaj gönder' }))
    await user.click(screen.getByRole('button', { name: 'Yanlış bilgi bildir' }))

    expect(onContact).toHaveBeenCalledTimes(1)
    expect(onReportIssue).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Satıcı bilgilerine git' })).toHaveProperty(
      'disabled',
      false,
    )
    expect(screen.queryByText(/bu sürümde bağlı değil/i)).toBeNull()
  })

  it('süresi dolmuş ilanda iletişim eylemleri kapanır ve gerekçe görünür', async () => {
    await renderWorkspace('inactive')
    // Gerekçe sayfada TEK yerde yazılır: kartın uyarısı. Dock onu tekrar etmez.
    expect(screen.getByText(/İlan süresi doldu/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Satıcı bilgilerine git' })).toHaveProperty(
      'disabled',
      true,
    )
    expect(screen.queryByRole('button', { name: 'Mesaj gönder' })).toBeNull()
  })

  it('harita kullanılamadığında konum bilgisi tablo olarak kalır', async () => {
    await renderWorkspace('map-unavailable')
    expect(screen.getByText(/Harita servisine ulaşılamadı/)).toBeTruthy()
    expect(screen.getByText('214 ada / 7 parsel')).toBeTruthy()
  })
})
