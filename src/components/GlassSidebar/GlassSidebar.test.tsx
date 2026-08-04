import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassSidebar } from './GlassSidebar'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderSidebar = (props: Partial<Parameters<typeof GlassSidebar>[0]> = {}) => {
  const onSelect = vi.fn()
  const utils = render(
    <GlassTierProvider tier="fallback">
      <GlassSidebar selected="all" onSelect={onSelect} {...props}>
        <GlassSidebar.Header title="Library" subtitle="All Music" />
        <GlassSidebar.Item id="recent">Recently Added</GlassSidebar.Item>
        <GlassSidebar.Group label="Playlists" defaultOpen>
          <GlassSidebar.Item id="all">All Playlists</GlassSidebar.Item>
          <GlassSidebar.Item id="indie">Indie Anthems</GlassSidebar.Item>
        </GlassSidebar.Group>
      </GlassSidebar>
    </GlassTierProvider>,
  )
  return { onSelect, ...utils }
}

describe('GlassSidebar', () => {
  it('nav olarak render olur, başlık ve öğeler görünür', () => {
    renderSidebar()
    expect(screen.getByRole('navigation')).toBeTruthy()
    expect(screen.getByText('Library')).toBeTruthy()
    expect(screen.getByText('Recently Added')).toBeTruthy()
  })

  it('öğe tıklaması onSelect çağırır', () => {
    const { onSelect } = renderSidebar()
    fireEvent.click(screen.getByRole('button', { name: 'Indie Anthems' }))
    expect(onSelect).toHaveBeenCalledWith('indie')
  })

  it('seçili öğe aria-current alır, bilinmeyen selected highlight üretmez', () => {
    renderSidebar()
    expect(screen.getByRole('button', { name: 'All Playlists' }).getAttribute('aria-current')).toBe('page')

    renderSidebar({ selected: 'bilinmeyen-id' })
    const currents = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-current') === 'page')
    expect(currents).toHaveLength(1) // yalnızca ilk render'daki; ikinci render'da yok
  })

  it('Group başlığı aria-expanded günceller ve öğeleri gizler', async () => {
    renderSidebar()
    const groupBtn = screen.getByRole('button', { name: /^Playlists$/ })
    expect(groupBtn.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(groupBtn)
    expect(groupBtn.getAttribute('aria-expanded')).toBe('false')
    await waitFor(() => expect(screen.queryByText('All Playlists')).toBeNull())
  })

  it('iç içe Group dev uyarısı üretir', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <GlassTierProvider tier="fallback">
        <GlassSidebar>
          <GlassSidebar.Group label="Dış">
            <GlassSidebar.Group label="İç">
              <GlassSidebar.Item id="x">X</GlassSidebar.Item>
            </GlassSidebar.Group>
          </GlassSidebar.Group>
        </GlassSidebar>
      </GlassTierProvider>,
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('iç içe Group'))
    warn.mockRestore()
  })

  it('Item, GlassSidebar dışında kullanılırsa anlamlı hata fırlatır', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<GlassSidebar.Item id="x">X</GlassSidebar.Item>)).toThrow(/GlassSidebar içinde/)
    vi.mocked(console.error).mockRestore()
  })

  it('rozet erişilebilir ada anlam katar, kısayol ipucu ada karışmaz', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSidebar selected="mesajlar">
          <GlassSidebar.Item id="mesajlar" badge={2} badgeLabel="okunmamış mesaj">
            Mesajlar
          </GlassSidebar.Item>
          <GlassSidebar.Item id="ara" hint="⌘K">
            Ara
          </GlassSidebar.Item>
        </GlassSidebar>
      </GlassTierProvider>,
    )
    // Boşluk birleştirmesi tarayıcıya göre değişir; rozet + açıklama adın parçası olmalı
    expect(screen.getByRole('button', { name: /Mesajlar\s*2\s*okunmamış mesaj/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ara' })).toBeTruthy()
  })

  it('Section etkileşimsiz başlıkla gruplar, Footer öğeleri seçilebilir kalır', () => {
    const onSelect = vi.fn()
    render(
      <GlassTierProvider tier="fallback">
        <GlassSidebar selected="ozet" onSelect={onSelect}>
          <GlassSidebar.Section label="Portföyüm">
            <GlassSidebar.Item id="ilanlar">İlanlarım</GlassSidebar.Item>
          </GlassSidebar.Section>
          <GlassSidebar.Footer>
            <GlassSidebar.Item id="cikis">Çıkış Yap</GlassSidebar.Item>
          </GlassSidebar.Footer>
        </GlassSidebar>
      </GlassTierProvider>,
    )
    expect(screen.getByRole('group', { name: 'Portföyüm' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Portföyüm' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Çıkış Yap' }))
    expect(onSelect).toHaveBeenCalledWith('cikis')
  })
})

/** density + collapsed eksenleri: geometri CSS'te, semantik değişmez. */
const renderEksenler = (props: Partial<Parameters<typeof GlassSidebar>[0]> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSidebar selected="mesajlar" {...props}>
        <GlassSidebar.Header title="Hesabım" subtitle="Mehmet Yılmaz" />
        <GlassSidebar.Item id="mesajlar" badge={2} badgeLabel="okunmamış mesaj">
          Mesajlar
        </GlassSidebar.Item>
        <GlassSidebar.Item id="ara" hint="⌘K">
          Ara
        </GlassSidebar.Item>
        <GlassSidebar.Section label="Portföyüm">
          <GlassSidebar.Group label="İlanlarım">
            <GlassSidebar.Item id="ilanlar">Tüm ilanlarım</GlassSidebar.Item>
          </GlassSidebar.Group>
        </GlassSidebar.Section>
      </GlassSidebar>
    </GlassTierProvider>,
  )

describe('GlassSidebar — density ve collapsed eksenleri', () => {
  it('varsayılan comfortable; density="compact" yalnız ölçek sınıfını ekler, semantiği bozmaz', () => {
    const { unmount } = renderEksenler()
    const rahat = screen.getByRole('navigation')
    expect(rahat.getAttribute('data-density')).toBe('comfortable')
    expect(rahat.getAttribute('data-collapsed')).toBeNull()
    unmount()

    renderEksenler({ density: 'compact' })
    const nav = screen.getByRole('navigation')
    expect(nav.getAttribute('data-density')).toBe('compact')
    expect(nav.className).toContain('compact')
    // Erişilebilirlik sözleşmesi kompakt ölçekte aynen korunur
    expect(screen.getByRole('button', { name: /Mesajlar\s*2\s*okunmamış mesaj/ })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Portföyüm' })).toBeTruthy()
    expect(screen.getByText('Hesabım')).toBeTruthy()
  })

  it('collapsed: etiket DOM ve erişilebilir adda kalır, yalnız görsel olarak gizlenir', () => {
    renderEksenler({ collapsed: true })
    const nav = screen.getByRole('navigation')
    expect(nav.getAttribute('data-collapsed')).toBe('true')
    expect(nav.className).toContain('collapsed')

    // Kritik: dar rayda da öğe adı rozet açıklamasıyla birlikte okunur
    const mesajlar = screen.getByRole('button', { name: /Mesajlar\s*2\s*okunmamış mesaj/ })
    expect(mesajlar).toBeTruthy()
    expect(screen.getByText('Mesajlar').className).toContain('srOnly')
    // Bölüm başlığı aria-labelledby hedefi olarak kalır
    expect(screen.getByRole('group', { name: 'Portföyüm' })).toBeTruthy()
    expect(screen.getByText('Portföyüm').className).toContain('srOnly')
    // Grup disclosure'ı çalışmaya devam eder
    expect(screen.getByRole('button', { name: 'İlanlarım' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('collapsed: rozet sayısı görsel olarak gizlenir (nokta göstergesi), açıklama okunur', () => {
    const { unmount } = renderEksenler()
    expect(screen.getByText('2').className).not.toContain('srOnly')
    unmount()

    renderEksenler({ collapsed: true })
    expect(screen.getByText('2').className).toContain('srOnly')
    expect(screen.getByText('okunmamış mesaj').className).toContain('srOnly')
  })

  it('collapsed: metin çocuklu öğeler title ipucu alır, Header render edilmez', () => {
    const { unmount } = renderEksenler()
    expect(screen.getByRole('button', { name: 'Ara' }).getAttribute('title')).toBeNull()
    expect(screen.getByText('Hesabım')).toBeTruthy()
    unmount()

    renderEksenler({ collapsed: true })
    expect(screen.getByRole('button', { name: 'Ara' }).getAttribute('title')).toBe('Ara')
    expect(screen.getByRole('button', { name: 'İlanlarım' }).getAttribute('title')).toBe('İlanlarım')
    expect(screen.queryByText('Hesabım')).toBeNull()
  })

  it('iki eksen birlikte kullanılabilir', () => {
    renderEksenler({ density: 'compact', collapsed: true })
    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('compact')
    expect(nav.className).toContain('collapsed')
    expect(screen.getByRole('button', { name: /Mesajlar\s*2\s*okunmamış mesaj/ })).toBeTruthy()
  })

  it('collapsed Switcher: monogram düğmesi adını korur ve menü yine açılır', async () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSidebar collapsed>
          <GlassSidebar.Switcher options={hesaplar} label="Hesap seç" />
        </GlassSidebar>
      </GlassTierProvider>,
    )
    const trigger = screen.getByRole('button', { name: /Hesap seç: Mehmet Yılmaz/ })
    expect(trigger.getAttribute('title')).toBe('Mehmet Yılmaz')
    fireEvent.click(trigger)
    expect(await screen.findAllByRole('menuitemradio')).toHaveLength(2)
  })
})

const hesaplar = [
  { id: 'bireysel', label: 'Mehmet Yılmaz', meta: 'Bireysel hesap' },
  { id: 'ofis', label: 'Ege Arsa Ofisi', meta: 'Kurumsal mağaza' },
]

const renderSwitcher = (props: Partial<Parameters<typeof GlassSidebar.Switcher>[0]> = {}) => {
  const onValueChange = vi.fn()
  const utils = render(
    <GlassTierProvider tier="fallback">
      <GlassSidebar>
        <GlassSidebar.Switcher
          options={hesaplar}
          onValueChange={onValueChange}
          action={{ label: 'Yeni mağaza oluştur', onSelect: vi.fn() }}
          {...props}
        />
      </GlassSidebar>
    </GlassTierProvider>,
  )
  return { onValueChange, ...utils }
}

describe('GlassSidebar.Switcher', () => {
  it('tetikleyici seçili hesabı ve aria-haspopup sözleşmesini taşır', () => {
    renderSwitcher()
    const trigger = screen.getByRole('button', { name: /Hesap seç: Mehmet Yılmaz/ })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('açılan menüde seçenekler menuitemradio olur ve seçim onValueChange çağırır', async () => {
    const { onValueChange } = renderSwitcher()
    fireEvent.click(screen.getByRole('button', { name: /Hesap seç/ }))
    const options = await screen.findAllByRole('menuitemradio')
    expect(options).toHaveLength(2)
    expect(options[0].getAttribute('aria-checked')).toBe('true')

    fireEvent.click(screen.getByRole('menuitemradio', { name: /Ege Arsa Ofisi/ }))
    expect(onValueChange).toHaveBeenCalledWith('ofis')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    // uncontrolled: iç state güncellenir
    expect(screen.getByRole('button', { name: /Hesap seç: Ege Arsa Ofisi/ })).toBeTruthy()
  })

  it('controlled kullanımda değer parent’tan gelir', async () => {
    const { onValueChange } = renderSwitcher({ value: 'bireysel' })
    fireEvent.click(screen.getByRole('button', { name: /Hesap seç/ }))
    fireEvent.click(await screen.findByRole('menuitemradio', { name: /Ege Arsa Ofisi/ }))
    expect(onValueChange).toHaveBeenCalledWith('ofis')
    expect(screen.getByRole('button', { name: /Hesap seç: Mehmet Yılmaz/ })).toBeTruthy()
  })

  it('Escape menüyü kapatır ve odağı tetikleyiciye döndürür', async () => {
    renderSwitcher()
    const trigger = screen.getByRole('button', { name: /Hesap seç/ })
    fireEvent.click(trigger)
    const menu = await screen.findByRole('menu')
    fireEvent.keyDown(menu, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('ok tuşu menü satırları arasında odağı taşır', async () => {
    renderSwitcher()
    fireEvent.click(screen.getByRole('button', { name: /Hesap seç/ }))
    const menu = await screen.findByRole('menu')
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: /Mehmet Yılmaz/ })),
    )
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: /Ege Arsa Ofisi/ }))
    fireEvent.keyDown(menu, { key: 'End' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: /Yeni mağaza oluştur/ }))
  })
})
