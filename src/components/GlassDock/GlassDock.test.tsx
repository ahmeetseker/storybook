import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassDock, type GlassDockItem } from './GlassDock'

function makeItems(overrides: Partial<GlassDockItem>[] = []): GlassDockItem[] {
  const base: GlassDockItem[] = [
    { key: 'home', label: 'Anasayfa', icon: <span>🏠</span> },
    { key: 'search', label: 'Arama', icon: <span>🔍</span> },
    { key: 'compare', label: 'Compare', icon: <span>⇄</span>, active: true },
    { key: 'account', label: 'Hesabım', icon: <span>👤</span>, group: 'Hesap' },
  ]
  return base.map((item, i) => ({ ...item, ...overrides[i] }))
}

describe('GlassDock — kapalı/açık geçişi', () => {
  it('varsayılan (kapalı) durumda yalnız peek butonu render edilir, nav yoktur', () => {
    render(<GlassDock items={makeItems()} behavior="morph" />)
    const peek = screen.getByRole('button', { name: 'Gezinme' })
    expect(peek).toBeTruthy()
    expect(peek.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('peek tıklanınca dock açılır (nav + öğe butonları) ve odak ilk öğeye taşınır', () => {
    render(<GlassDock items={makeItems()} behavior="morph" />)
    fireEvent.click(screen.getByRole('button', { name: 'Gezinme' }))
    expect(screen.getByRole('navigation', { name: 'Gezinme' })).toBeTruthy()
    const first = screen.getByRole('button', { name: 'Anasayfa' })
    expect(document.activeElement).toBe(first)
  })

  it('Escape dock\'u kapatır ve odak peek butonuna döner', async () => {
    render(<GlassDock items={makeItems()} behavior="morph" />)
    fireEvent.click(screen.getByRole('button', { name: 'Gezinme' }))
    fireEvent.keyDown(screen.getByRole('button', { name: 'Anasayfa' }), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('navigation')).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Gezinme' }))
  })

  it('dışarı tıklama (document mousedown) dock\'u kapatır', async () => {
    render(<GlassDock items={makeItems()} behavior="morph" defaultOpen />)
    expect(screen.getByRole('navigation')).toBeTruthy()
    fireEvent.mouseDown(document.body)
    await waitFor(() => expect(screen.queryByRole('navigation')).toBeNull())
  })

  it('öğe seçimi onSelect çağırır, dock\'u kapatır ve odağı peek\'e döndürür', async () => {
    const onSelect = vi.fn()
    render(<GlassDock items={makeItems([{}, { onSelect }])} behavior="morph" />)
    fireEvent.click(screen.getByRole('button', { name: 'Gezinme' }))
    fireEvent.click(screen.getByRole('button', { name: 'Arama' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('navigation')).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Gezinme' }))
  })

  it('defaultOpen uncontrolled başlangıç durumunu uygular', () => {
    render(<GlassDock items={makeItems()} behavior="morph" defaultOpen />)
    expect(screen.getByRole('navigation')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Gezinme' })).toBeNull()
  })

  it('controlled: peek tıklaması yalnız onOpenChange çağırır, parent reddederse açılmaz', () => {
    const onOpenChange = vi.fn()
    render(
      <GlassDock
        items={makeItems()}
        behavior="morph"
        open={false}
        onOpenChange={onOpenChange}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Gezinme' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('href verilen ilk öğe gerçek linktir, açılışta odağı alır ve onRoute ile delege edilir', async () => {
    const onSelect = vi.fn()
    const onRoute = vi.fn()
    const linkedItems = makeItems([{ href: '/', onSelect }])
    render(
      <GlassDock
        items={linkedItems}
        behavior="morph"
        onRoute={onRoute}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Gezinme' }))
    const home = screen.getByRole('link', { name: 'Anasayfa' })
    expect(home.getAttribute('href')).toBe('/')
    expect(document.activeElement).toBe(home)
    fireEvent.click(home)
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onRoute).toHaveBeenCalledWith('/')
    await waitFor(() => expect(screen.queryByRole('navigation')).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Gezinme' }))
  })
})

describe('GlassDock — açık dock içeriği', () => {
  it('aktif öğe aria-current="page" taşır, diğerleri taşımaz', () => {
    render(<GlassDock items={makeItems()} />)
    expect(screen.getByRole('button', { name: 'Compare' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Anasayfa' }).getAttribute('aria-current')).toBeNull()
  })

  it('legacy group verisi verilse de grup etiketi render edilmez', () => {
    render(<GlassDock items={makeItems()} />)
    expect(screen.queryByText('Hesap')).toBeNull()
  })

  it('dikey yönelimde grup etiketi render edilmez (N/A)', () => {
    render(<GlassDock items={makeItems()} orientation="vertical" />)
    expect(screen.queryByText('Hesap')).toBeNull()
  })

  it('her öğe erişilebilir adını label\'dan alır (ikon aria-hidden)', () => {
    render(<GlassDock items={makeItems()} />)
    for (const name of ['Anasayfa', 'Arama', 'Compare', 'Hesabım']) {
      expect(screen.getByRole('button', { name })).toBeTruthy()
    }
  })
})

describe('GlassDock — sürekli açık davranış ve cam malzeme', () => {
  it('varsayılan fixed davranış doğrudan nav render eder ve peek göstermez', () => {
    render(<GlassDock items={makeItems()} />)
    const nav = screen.getByRole('navigation', { name: 'Gezinme' })
    expect(nav.getAttribute('data-behavior')).toBe('fixed')
    expect(screen.queryByRole('button', { name: 'Gezinme' })).toBeNull()
  })

  it('Escape, dışarı tıklama ve öğe seçimi fixed dock navını kapatmaz', () => {
    const onSelect = vi.fn()
    render(<GlassDock items={makeItems([{}, { onSelect }])} />)
    const search = screen.getByRole('button', { name: 'Arama' })

    fireEvent.keyDown(search, { key: 'Escape' })
    fireEvent.mouseDown(document.body)
    fireEvent.click(search)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('navigation', { name: 'Gezinme' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Gezinme' })).toBeNull()
  })

  it('cam yüzey Header ile aynı kararlı blur malzemesini kullanır', () => {
    const { container } = render(<GlassDock items={makeItems()} />)
    const surface = container.querySelector<HTMLElement>(
      '[data-material="glass"]',
    )

    expect(surface).not.toBeNull()
    expect(surface!.style.backdropFilter).toBe(
      'blur(14px) saturate(180%)',
    )
  })

  it('public-site LiquidDock sözleşmesiyle 1x başlar ve edge lens taşır', () => {
    const { container } = render(<GlassDock items={makeItems()} />)
    const items = [
      screen.getByRole('button', { name: 'Anasayfa' }),
      screen.getByRole('button', { name: 'Arama' }),
      screen.getByRole('button', { name: 'Compare' }),
      screen.getByRole('button', { name: 'Hesabım' }),
    ]

    for (const item of items) {
      expect(item.style.transform).toBe('scale(1)')
    }

    const lens = container.querySelector<HTMLElement>('[data-lq-lens="edge"]')
    expect(lens).not.toBeNull()
    expect(lens!.style.backdropFilter).toBe(
      'blur(6px) saturate(180%)',
    )
  })

  it('fine-pointer yoksa sentetik mouse hareketi büyütme veya tooltip başlatmaz', () => {
    const { container } = render(<GlassDock items={makeItems()} />)
    const track = container.querySelector<HTMLElement>('[data-part="track"]')
    const search = screen.getByRole('button', { name: 'Arama' })

    expect(track).not.toBeNull()
    fireEvent.mouseMove(track!, { clientX: 63, clientY: 19 })

    expect(search.getAttribute('data-magnification-scale')).toBe('1.000')
    expect(container.querySelector('[data-part="tooltip"]')).toBeNull()
  })

  it('klavye odağı pointer hedefine üstün gelir ve yalnız bir tooltip gösterir', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) =>
      ({
        matches: query === '(hover: hover) and (pointer: fine)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia

    try {
      const { container } = render(<GlassDock items={makeItems()} />)
      const track = container.querySelector<HTMLElement>('[data-part="track"]')
      const home = screen.getByRole('button', { name: 'Anasayfa' })

      expect(track).not.toBeNull()
      fireEvent.mouseMove(track!, { clientX: 63, clientY: 19 })
      fireEvent.focus(home)

      const tooltips = container.querySelectorAll('[data-part="tooltip"]')
      expect(tooltips).toHaveLength(1)
      expect(tooltips[0]?.textContent).toBe('Anasayfa')
    } finally {
      window.matchMedia = original
    }
  })
})
