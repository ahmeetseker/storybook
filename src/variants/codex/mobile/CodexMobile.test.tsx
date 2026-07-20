import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CODEX_COMPONENT_CATALOG } from '../catalog/CodexCatalog'
import {
  CODEX_COMPACT_ADAPTATIONS,
  CODEX_COMPACT_COMPONENT_COUNT,
  CODEX_COMPACT_PATTERNS,
  CodexActionBar,
  CodexAppBar,
  CodexBottomNavigation,
  CodexBottomSheet,
  CodexCompactFilterBar,
  CodexCompactShell,
} from './index'

const destinations = [
  { id: 'home', label: 'Ana Sayfa', icon: <span>⌂</span>, href: '#home' },
  { id: 'search', label: 'Ara', icon: <span>⌕</span>, href: '#search' },
  { id: 'saved', label: 'Kaydedilenler', icon: <span>♡</span>, href: '#saved' },
  { id: 'messages', label: 'Mesajlar', icon: <span>✉</span>, badge: 3, badgeLabel: '3 okunmamış mesaj' },
  { id: 'account', label: 'Hesabım', icon: <span>○</span> },
]

describe('Codex compact mobile system', () => {
  it('alt navigasyonu route navigasyonu olarak kurar ve seçimi yönetir', () => {
    const onValueChange = vi.fn()
    render(
      <CodexBottomNavigation
        items={destinations}
        defaultValue="search"
        onValueChange={onValueChange}
      />,
    )

    const navigation = screen.getByRole('navigation', { name: 'Ana navigasyon' })
    expect(navigation.getAttribute('data-destination-count')).toBe('5')
    expect(within(navigation).queryByRole('tablist')).toBeNull()
    expect(within(navigation).getByRole('link', { name: 'Ara' }).getAttribute('aria-current')).toBe('page')
    expect(within(navigation).getByLabelText('3 okunmamış mesaj')).toBeTruthy()

    fireEvent.click(within(navigation).getByRole('button', { name: /Mesajlar/ }))
    expect(onValueChange).toHaveBeenCalledWith('messages')
    expect(within(navigation).getByRole('button', { name: /Mesajlar/ }).getAttribute('aria-current')).toBe('page')
  })

  it('kontrollü alt navigasyonda seçimi sahibine bırakır', () => {
    const onValueChange = vi.fn()
    render(<CodexBottomNavigation items={destinations} value="home" onValueChange={onValueChange} />)

    fireEvent.click(screen.getByRole('link', { name: 'Ara' }))
    expect(onValueChange).toHaveBeenCalledWith('search')
    expect(screen.getByRole('link', { name: 'Ana Sayfa' }).getAttribute('aria-current')).toBe('page')
  })

  it('alt navigasyonda 3–5 benzersiz hedef sözleşmesini zorunlu tutar', () => {
    expect(() => render(<CodexBottomNavigation items={destinations.slice(0, 2)} />)).toThrow(/3 ile 5/)
    expect(() => render(<CodexBottomNavigation items={[
      destinations[0],
      destinations[1],
      { ...destinations[2], id: 'search' },
    ]} />)).toThrow(/benzersiz/)
  })

  it('app bar, bağlamsal action bar ve shell landmarklarını korur', () => {
    render(
      <CodexCompactShell
        mainId="sonuclar"
        mainLabel="Arama sonuçları"
        appBar={<CodexAppBar title="Kadıköy’de satılık" subtitle="124 ilan" leading={<button type="button">Geri</button>} actions={<button type="button">Paylaş</button>} />}
        actionBar={<CodexActionBar summary={<strong>8.950.000 TL</strong>} primaryAction={<button type="button">Mesaj gönder</button>} />}
        bottomNavigation={<CodexBottomNavigation items={destinations} />}
      >
        <article>İlan sonucu</article>
      </CodexCompactShell>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Kadıköy’de satılık' })).toBeTruthy()
    expect(screen.getByRole('main', { name: 'Arama sonuçları' }).id).toBe('sonuclar')
    expect(screen.getByRole('complementary', { name: 'Sayfa işlemleri' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Mesaj gönder' })).toBeTruthy()
  })

  it('kompakt filtre özeti etkin filtreyi duyurur ve tam formu açma olayını yollar', () => {
    const onFilterClick = vi.fn()
    render(
      <CodexCompactFilterBar
        results={<><strong>124</strong> ilan</>}
        activeCount={2}
        onFilterClick={onFilterClick}
      >
        <button type="button">Kadıköy</button>
      </CodexCompactFilterBar>,
    )

    const region = screen.getByRole('region', { name: 'Arama araçları' })
    expect(within(region).getByText('124')).toBeTruthy()
    fireEvent.click(within(region).getByRole('button', { name: 'Filtreler, 2 etkin filtre' }))
    expect(onFilterClick).toHaveBeenCalledTimes(1)
  })

  it('bottom sheet modal semantiği, detent alternatifi, focus trap, Escape ve focus iadesi sağlar', async () => {
    const onOpenChange = vi.fn()
    const onDetentChange = vi.fn()
    render(
      <CodexBottomSheet
        title="Filtreler"
        description="Sonuçları daraltın."
        triggerLabel="Filtreleri aç"
        detents={['medium', 'large']}
        onOpenChange={onOpenChange}
        onDetentChange={onDetentChange}
        footer={<button type="button">124 ilanı göster</button>}
      >
        <label>Minimum fiyat<input /></label>
      </CodexBottomSheet>,
    )

    const trigger = screen.getByRole('button', { name: 'Filtreleri aç' })
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Filtreler' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
    expect(dialog.getAttribute('data-detent')).toBe('medium')

    const handle = within(dialog).getByRole('button', { name: /Panel boyutu Orta/ })
    await waitFor(() => expect(document.activeElement).toBe(handle))
    fireEvent.click(handle)
    expect(onDetentChange).toHaveBeenCalledWith('large')
    expect(dialog.getAttribute('data-detent')).toBe('large')

    const last = within(dialog).getByRole('button', { name: '124 ilanı göster' })
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(handle)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('backdrop tercihini ve body scroll kilidini uygular', async () => {
    render(<CodexBottomSheet title="Sıralama" defaultOpen><button type="button">En yeni</button></CodexBottomSheet>)
    const dialog = screen.getByRole('dialog', { name: 'Sıralama' })
    expect(document.body.className).not.toBe('')
    fireEvent.pointerDown(dialog.parentElement as HTMLElement)
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(document.body.className).toBe(''))
  })

  it('96 componenti on adaptasyon patternine eksiksiz ve tekil eşler', () => {
    expect(CODEX_COMPACT_PATTERNS).toHaveLength(10)
    expect(CODEX_COMPACT_COMPONENT_COUNT).toBe(96)
    expect(CODEX_COMPACT_ADAPTATIONS).toHaveLength(CODEX_COMPONENT_CATALOG.length)
    expect(new Set(CODEX_COMPACT_ADAPTATIONS.map((item) => item.original)).size).toBe(96)
    expect(CODEX_COMPACT_ADAPTATIONS.map((item) => item.original).sort()).toEqual(
      CODEX_COMPONENT_CATALOG.map((item) => item.original).sort(),
    )
  })
})
