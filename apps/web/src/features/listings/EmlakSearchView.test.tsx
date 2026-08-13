import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { parseListingSearch } from './domain/search-state'
import { searchListings } from './data/listing-adapter'
import { EmlakSearchView } from './EmlakSearchView'

async function renderSearch(raw: Record<string, string> = {}) {
  const state = parseListingSearch(raw)
  const response = await searchListings({ state, pageSize: 24 })
  const onStateChange = vi.fn()

  render(
    <EmlakSearchView
      state={state}
      response={response}
      status="success"
      onStateChange={onStateChange}
      onAiSearch={vi.fn()}
      onSaveSearch={vi.fn()}
    />,
  )

  return { state, response, onStateChange }
}

describe('EmlakSearchView', () => {
  it('renders the all-property result workspace with detailed row cards', async () => {
    const { response } = await renderSearch()

    expect(
      screen.getByRole('heading', { name: 'Tüm Emlak' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: `${response.total} ilan`,
        level: 2,
      }),
    ).toBeTruthy()
    expect(
      screen.getAllByRole('article', { name: /ilanı$/ }),
    ).toHaveLength(24)
  })

  // Izgara kartı: favori dili KALP (yatay kartla aynı glif ve etiket) ve
  // doğrulama dışındaki statüler opak kapsül dilinde (2026-08-13 standardı).
  it('ızgara görünümü kalp favori butonu ve statü kapsülüyle çizilir', async () => {
    // Önerilen sıralama doğrulanmışları öne aldığından ilk sayfa tamamen
    // doğrulanmış olabiliyor; fiyat sıralaması iki durumu da sayfaya sokar.
    await renderSearch({ view: 'grid', sort: 'price-asc' })

    const hearts = screen.getAllByRole('button', { name: 'Favorilere ekle' })
    expect(hearts.length).toBeGreaterThan(0)
    expect(hearts[0].getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(hearts[0])
    expect(
      screen.getAllByRole('button', { name: 'Favorilerden çıkar' })[0]
        .getAttribute('aria-pressed'),
    ).toBe('true')

    // Doğrulanmamış ilan: yarı saydam pill değil, tonlu opak kapsül.
    const status = screen.getAllByText('Yetki bekliyor · Temsili')[0]
    expect(status.getAttribute('data-tone')).toBe('warning')
    // Doğrulanmış ilanlarda kurdele dili değişmedi.
    expect(screen.getAllByText('Doğrulanmış').length).toBeGreaterThan(0)
  })

  // Filtreler artık tek bir katalogdan (filter-catalog.ts) render ediliyor;
  // bölüm başlıkları oradan gelir.
  it('shows land-specialist filter groups for the land category', async () => {
    await renderSearch({ category: 'land' })

    expect(screen.getAllByText('Tapu ve kullanım').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Arsa ayrıntıları').length).toBeGreaterThan(0)
  })

  // Kategoriye uymayan bir kriter GÖSTERİLMEMELİ: arsada "Oda sayısı" her
  // zaman sıfır sonuç üretir ve kullanıcıyı çıkmaza sokardı.
  it('arsa kategorisinde konuta özgü kriterleri göstermez', async () => {
    await renderSearch({ category: 'land' })

    expect(screen.queryByText('Oda sayısı')).toBeNull()
    expect(screen.queryByText('Isıtma tipi')).toBeNull()
  })

  it('emits an updated state when a desktop filter changes', async () => {
    const { onStateChange } = await renderSearch()

    fireEvent.click(
      screen.getAllByRole('checkbox', {
        name: 'Yalnız doğrulanmış ilanlar',
      })[0],
    )

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ verified: true, page: 1 }),
      expect.objectContaining({ history: 'replace' }),
    )
  })

  it('uses the themed listbox for location selection', async () => {
    const { onStateChange } = await renderSearch()
    const citySelect = screen.getAllByLabelText('Şehir')[0]

    expect(citySelect.tagName).toBe('BUTTON')
    fireEvent.click(citySelect)
    expect(screen.getByRole('listbox', { name: 'Şehir' })).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: 'İzmir' }))
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'izmir',
        district: undefined,
        page: 1,
      }),
      expect.objectContaining({ history: 'replace' }),
    )
    expect(document.querySelector('select')).toBeNull()
  })

  it('opens the mobile filter dialog with draft apply actions', async () => {
    await renderSearch()

    fireEvent.click(screen.getByRole('button', { name: 'Filtreleri aç' }))

    expect(
      screen.getByRole('dialog', { name: 'Emlak filtreleri' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /ilanı göster$/ }),
    ).toBeTruthy()
  })

  it('keeps AI-derived filters as an explicit proposal until approved', async () => {
    const state = parseListingSearch({})
    const response = await searchListings({ state, pageSize: 24 })
    const onApplyAiProposal = vi.fn()

    render(
      <EmlakSearchView
        state={state}
        response={response}
        status="success"
        onStateChange={vi.fn()}
        onAiSearch={vi.fn()}
        onSaveSearch={vi.fn()}
        aiProposal={{
          confidence: 88,
          filters: [
            {
              key: 'category',
              label: 'Kategori',
              value: 'land',
              displayValue: 'Arsa',
            },
          ],
        }}
        onApplyAiProposal={onApplyAiProposal}
      />,
    )

    expect(screen.getByText('AI önerisi')).toBeTruthy()
    fireEvent.click(
      screen.getByRole('button', { name: 'Önerilen filtreleri uygula' }),
    )
    expect(onApplyAiProposal).toHaveBeenCalledOnce()
  })

  // "Tüm Seçenekler": kenar çubuğuna sığmayan kriterlerin girişi. Bölüm rayı
  // ve seçili kriter sayısı, kullanıcının nerede ne bıraktığını modalı
  // kapatmadan görmesini sağlar.
  it('Tüm Seçenekler modalı bölüm rayıyla açılır', async () => {
    await renderSearch({ category: 'residential' })

    fireEvent.click(screen.getByRole('button', { name: /Tüm Seçenekler/ }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeTruthy()
    const rail = screen.getByRole('navigation', { name: 'Filtre bölümleri' })
    expect(
      within(rail).getByRole('button', { name: /Bina ve tesisat/ }),
    ).toBeTruthy()
    // Konuta uymayan bölüm rayda hiç görünmez.
    expect(within(rail).queryByRole('button', { name: /Arsa ayrıntıları/ })).toBeNull()
  })

  it('modal tetikleyicisi seçili kriter sayısını gösterir', async () => {
    await renderSearch({
      category: 'residential',
      f_heating: 'natural-gas',
      'r_building-ageMax': '10',
    })

    // Sayı artık parantez içinde metin değil, düğmenin içindeki rozet;
    // erişilebilir ad boşluk normalleştirmesine bağlı kalmasın diye desenle
    // eşleştirilir.
    expect(
      screen.getByRole('button', { name: /^Tüm Seçenekler\s*2$/ }),
    ).toBeTruthy()
  })

  // Modalda seçilen kriter panelde çip olarak görünmezse kullanıcı sonucun
  // neden daraldığını anlayamaz ve geri alamaz.
  it('katalog filtresi uygulanan filtreler çipinde görünür', async () => {
    await renderSearch({ category: 'residential', f_heating: 'natural-gas' })

    expect(screen.getByText('Isıtma tipi: Doğalgaz (kombi)')).toBeTruthy()
  })

  // Modaldaki kriter arama: 50+ kriterde adını bilen kullanıcı bölüm bölüm
  // taramak zorunda kalmasın (sahibinden'in modalinde bu yok).
  it('modalda kriter araması eşleşenleri süzer', async () => {
    await renderSearch({ category: 'residential' })
    fireEvent.click(screen.getByRole('button', { name: /Tüm Seçenekler/ }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.change(screen.getByLabelText('Kriter ara'), {
      target: { value: 'ısıtma' },
    })

    // Kenar çubuğunda da "Isıtma tipi" var; iddia MODAL içine kapsanır.
    expect(within(dialog).getByText('Isıtma tipi')).toBeTruthy()
    // Eşleşmeyen kriter modalde kalmaz.
    expect(within(dialog).queryByText('Balkon')).toBeNull()
    // Arama açıkken bölüm rayı devre dışıdır.
    expect(screen.queryByRole('navigation', { name: 'Filtre bölümleri' })).toBeNull()
  })

  it('eşleşme yoksa gerekçe yazar', async () => {
    await renderSearch({ category: 'residential' })
    fireEvent.click(screen.getByRole('button', { name: /Tüm Seçenekler/ }))
    await screen.findByRole('dialog')

    fireEvent.change(screen.getByLabelText('Kriter ara'), {
      target: { value: 'zzzz' },
    })
    expect(screen.getByText(/için kriter bulunamadı/)).toBeTruthy()
  })

  // "Bu alanda ara" eskiden ölü bir butondu: kullanıcı basıyor, hiçbir şey
  // olmuyordu.
  it('haritada seçili alan çip olarak görünür ve kaldırılabilir', async () => {
    const { onStateChange } = await renderSearch({
      map: 'split',
      bbox: '38.2,26.2,38.6,27.3',
    })

    const chip = screen.getByText('Haritada seçili alan')
    expect(chip).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: 'Kaldır' })[0])
    expect(onStateChange).toHaveBeenCalled()
    const [next] = onStateChange.mock.calls.at(-1) as [{ mapArea?: unknown }]
    expect(next.mapArea).toBeUndefined()
  })

  // Mobil çekmece KADEMELİ AKIŞ ile açılır: kataloğun tamamı tek yüzeyde.
  // İkinci bir ekran, "Tüm filtreler" düğmesi ya da akordeon yok.
  it('mobil çekmece kataloğun tamamını tek akışta açar', async () => {
    await renderSearch({ category: 'residential' })

    fireEvent.click(screen.getByRole('button', { name: 'Filtreleri aç' }))
    const drawer = await screen.findByRole('dialog', { name: 'Emlak filtreleri' })

    // Temel kararlar en üstte.
    expect(within(drawer).getByRole('radiogroup', { name: 'İşlem türü' })).toBeTruthy()
    // Katalog bölümleri AYNI yüzeyde, başlıklarıyla.
    expect(within(drawer).getByRole('heading', { name: /Bina ve tesisat/ })).toBeTruthy()
    expect(within(drawer).getByRole('heading', { name: /Tapu ve kullanım/ })).toBeTruthy()
    // Oda sayısı kendi bölümünde, ham 11 çip yerine segmentli kontrolle.
    expect(within(drawer).getByRole('radiogroup', { name: 'Oda sayısı' })).toBeTruthy()
    // Akordeon yok, ikinci yüzeye geçiş yok.
    expect(drawer.querySelector('details')).toBeNull()
    expect(within(drawer).queryByRole('button', { name: /Tüm filtreler/ })).toBeNull()
  })

  // Nadir kriterler gizlenmez, SAYILIR: "+N kriter" satırı dokununca
  // kriterleri bulunduğu yere ekler — kullanıcı başka bir ekrana gitmez.
  it('"+N kriter" nadir kriterleri yerinde açar', async () => {
    await renderSearch({ category: 'residential' })

    fireEvent.click(screen.getByRole('button', { name: 'Filtreleri aç' }))
    const drawer = await screen.findByRole('dialog', { name: 'Emlak filtreleri' })

    // "Yapı tipi" nadir bir kriter: önce satırın arkasında.
    expect(within(drawer).queryByText('Yapı tipi')).toBeNull()
    const expanders = within(drawer).getAllByRole('button', { name: /^\+ \d+ kriter$/ })
    expect(expanders.length).toBeGreaterThan(0)

    const dialogCount = screen.getAllByRole('dialog').length
    fireEvent.click(expanders[0])

    // Aynı yüzeyde kaldık; yeni bir diyalog açılmadı.
    expect(screen.getAllByRole('dialog')).toHaveLength(dialogCount)
  })

  // Alt eylem sonucu SAYAR: kullanıcı yaprağı kapatmadan seçiminin sonucu ne
  // kadar daralttığını görür, boş sonuç tuzağına düşmez.
  it('çekmecenin alt eylemi taslak seçimin sonucunu canlı sayar', async () => {
    await renderSearch({ category: 'residential' })

    fireEvent.click(screen.getByRole('button', { name: 'Filtreleri aç' }))
    const drawer = await screen.findByRole('dialog', { name: 'Emlak filtreleri' })
    const before = within(drawer).getByRole('button', { name: /ilanı göster$/ }).textContent

    const rooms = within(drawer).getByRole('radiogroup', { name: 'Oda sayısı' })
    fireEvent.click(within(rooms).getByRole('radio', { name: '2+1' }))

    const after = within(drawer).getByRole('button', { name: /ilanı göster$/ }).textContent
    expect(after).not.toBe(before)
  })
})
