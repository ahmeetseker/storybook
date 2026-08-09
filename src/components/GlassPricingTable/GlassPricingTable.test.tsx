import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassPricingTable, type GlassPricingPlan } from './GlassPricingTable'

const plans: GlassPricingPlan[] = [
  {
    id: 'bireysel',
    name: 'Bireysel',
    kind: 'ilan sahibi',
    description: 'Tek portföy, tek gelen kutusu.',
    price: { monthly: 249, yearly: 2390 },
    seats: { included: 1, max: 1 },
    action: { label: 'Planı seç' },
    featuresTitle: 'Plana dahil',
    features: ['3 aktif ilan', 'Mesaj kutusu'],
  },
  {
    id: 'profesyonel',
    name: 'Profesyonel',
    kind: 'danışman',
    description: 'Vitrin önceliği ve alıcı eşleşmesi.',
    price: { monthly: 749, yearly: 7190 },
    seats: { included: 1, max: 3, extraMonthly: 180, extraYearly: 1730 },
    action: { label: 'Planı seç' },
    secondaryAction: { label: 'Demo talep et' },
    prominent: true,
    badge: 'En çok seçilen',
    featuresTitle: 'Bireysel’deki her şey, ayrıca',
    features: ['50 aktif ilan', 'Randevu takvimi'],
  },
]

/** Rulo `aria-hidden` olduğu için fiyat, canlı bölgenin metninden okunur. */
function liveText() {
  return document.querySelector('[aria-live="polite"][class]')?.textContent ?? ''
}

describe('GlassPricingTable — ızgara yerleşimi', () => {
  it('planları kart olarak çizer; vurgulanan plan işaretlenir', () => {
    render(<GlassPricingTable plans={plans} layout="grid" />)
    expect(screen.getByRole('heading', { name: 'Bireysel', level: 3 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Profesyonel', level: 3 })).toBeTruthy()
    expect(screen.getByText('En çok seçilen')).toBeTruthy()

    const prominent = document.querySelector('[data-prominent]')
    expect(prominent).toBeTruthy()
    expect(within(prominent as HTMLElement).getByRole('heading', { level: 3 }).textContent).toBe(
      'Profesyonel',
    )
  })

  it('dönem değişince tutar yıllığa geçer (uncontrolled)', () => {
    render(<GlassPricingTable plans={plans} layout="grid" />)
    expect(liveText()).toContain('₺249 aylık')

    fireEvent.click(screen.getByRole('radio', { name: 'Yıllık' }))
    expect(liveText()).toContain('₺2.390 yıllık')
    expect(liveText()).toContain('₺7.190 yıllık')
  })

  it('controlled dönemde iç durum tutulmaz; yalnız onPeriodChange çalışır', () => {
    const onPeriodChange = vi.fn()
    render(
      <GlassPricingTable plans={plans} layout="grid" period="monthly" onPeriodChange={onPeriodChange} />,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Yıllık' }))
    expect(onPeriodChange).toHaveBeenCalledWith('yearly')
    // Değer dışarıdan gelmediği için görünen tutar aylık kalır.
    expect(liveText()).toContain('₺249 aylık')
  })

  it('yıllık indirim rozeti verilmezse ilk plandan hesaplanır', () => {
    render(<GlassPricingTable plans={plans} layout="grid" />)
    // 249 × 12 = 2988 → 2390 ⇒ %20
    expect(screen.getByText('%20 indirim')).toBeTruthy()
  })

  it('birincil eylem plan id ile çağrılır', () => {
    const onSelect = vi.fn()
    const withAction = [{ ...plans[0], action: { label: 'Planı seç', onSelect } }, plans[1]]
    render(<GlassPricingTable plans={withAction} layout="grid" />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Planı seç' })[0])
    expect(onSelect).toHaveBeenCalledWith('bireysel')
  })
})

describe('GlassPricingTable — kompakt yerleşim', () => {
  it('planlar radiogroup olur; varsayılan seçim vurgulanan plandır', () => {
    render(<GlassPricingTable plans={plans} layout="compact" />)
    const group = screen.getByRole('radiogroup', { name: 'Plan seçimi' })
    const radios = within(group).getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(radios[1].getAttribute('aria-checked')).toBe('true')
    expect(radios[0].getAttribute('aria-checked')).toBe('false')
    // Roving tabindex: gruba Tab ile bir kez girilir.
    expect(radios[1].tabIndex).toBe(0)
    expect(radios[0].tabIndex).toBe(-1)
  })

  it('seçili olmayan gövde DOM’da kalır ama inert’tir', () => {
    render(<GlassPricingTable plans={plans} layout="compact" />)
    const radios = within(screen.getByRole('radiogroup', { name: 'Plan seçimi' })).getAllByRole('radio')
    const closed = document.getElementById(radios[0].getAttribute('aria-controls')!)!
    const open = document.getElementById(radios[1].getAttribute('aria-controls')!)!
    expect(closed.hasAttribute('inert')).toBe(true)
    expect(closed.getAttribute('data-open')).toBe('false')
    expect(open.hasAttribute('inert')).toBe(false)
    expect(open.getAttribute('data-open')).toBe('true')
  })

  it('satıra tıklayınca seçim taşınır ve tek eylem etiketi güncellenir', () => {
    const onSelectedPlanChange = vi.fn()
    render(
      <GlassPricingTable
        plans={plans}
        layout="compact"
        onSelectedPlanChange={onSelectedPlanChange}
        compactActionLabel="{plan} ile devam et"
      />,
    )
    expect(screen.getByRole('button', { name: 'Profesyonel ile devam et' })).toBeTruthy()

    const radios = within(screen.getByRole('radiogroup', { name: 'Plan seçimi' })).getAllByRole('radio')
    fireEvent.click(radios[0])
    expect(onSelectedPlanChange).toHaveBeenCalledWith('bireysel')
    expect(screen.getByRole('button', { name: 'Bireysel ile devam et' })).toBeTruthy()
  })

  it('ok tuşu seçimi bir sonraki plana taşır', () => {
    render(<GlassPricingTable plans={plans} layout="compact" />)
    const group = screen.getByRole('radiogroup', { name: 'Plan seçimi' })
    fireEvent.keyDown(group, { key: 'ArrowDown' })
    const radios = within(group).getAllByRole('radio')
    // Profesyonel (son) → başa döner
    expect(radios[0].getAttribute('aria-checked')).toBe('true')
  })

  it('adet kontrolü fiyatı büyütür ve tavanda pasifleşir', () => {
    render(<GlassPricingTable plans={plans} layout="compact" />)
    const artir = screen.getByRole('button', { name: 'Profesyonel kullanıcı sayısını artır' })
    const azalt = screen.getByRole('button', { name: 'Profesyonel kullanıcı sayısını azalt' })

    // included = 1 ⇒ taban seviyede azaltma kapalı
    expect((azalt as HTMLButtonElement).disabled).toBe(true)
    expect(liveText()).toContain('₺749 aylık')

    fireEvent.click(artir) // 2 kullanıcı → 749 + 180
    expect(liveText()).toContain('₺929 aylık, 2 kullanıcı')
    expect((azalt as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(artir) // 3 kullanıcı = max
    expect(liveText()).toContain('₺1.109 aylık, 3 kullanıcı')
    expect((artir as HTMLButtonElement).disabled).toBe(true)
  })

  it('ek kullanıcı ücretlendirilmeyen planda adet kontrolü çizilmez', () => {
    render(<GlassPricingTable plans={plans} layout="compact" defaultSelectedPlanId="bireysel" />)
    expect(screen.queryByRole('button', { name: /Bireysel kullanıcı sayısını/ })).toBeNull()
    expect(screen.getByText('Tek kullanıcı')).toBeTruthy()
  })

  it('controlled adet dışarıdan yönetilir', () => {
    const onSeatsChange = vi.fn()
    render(
      <GlassPricingTable
        plans={plans}
        layout="compact"
        seats={{ profesyonel: 2 }}
        onSeatsChange={onSeatsChange}
      />,
    )
    expect(liveText()).toContain('₺929 aylık, 2 kullanıcı')
    fireEvent.click(screen.getByRole('button', { name: 'Profesyonel kullanıcı sayısını artır' }))
    expect(onSeatsChange).toHaveBeenCalledWith('profesyonel', 3)
    // Dışarıdan yeni değer gelmediği için görünen tutar değişmez.
    expect(liveText()).toContain('₺929 aylık, 2 kullanıcı')
  })
})

describe('GlassPricingTable — sözleşme', () => {
  it('fiyat rulosu AT’den gizlenir; duyuru canlı bölgeden yapılır', () => {
    const { container } = render(<GlassPricingTable plans={plans} layout="grid" />)
    const prices = container.querySelectorAll('[aria-hidden="true"]')
    expect(prices.length).toBeGreaterThan(0)
    expect(liveText()).toContain('Bireysel:')
    expect(liveText()).toContain('Profesyonel:')
  })

  it('para birimi ve yerelleştirme dışarıdan verilebilir', () => {
    render(<GlassPricingTable plans={plans} layout="grid" currency="$" locale="en-US" />)
    expect(liveText()).toContain('$249 aylık')
    // Binlik ayracı yerelden gelir: tr-TR "7.190", en-US "7,190"
    fireEvent.click(screen.getByRole('radio', { name: 'Yıllık' }))
    expect(liveText()).toContain('$7,190')
  })

  it('className birleşir ve rest kök öğeye geçer', () => {
    const { container } = render(
      <GlassPricingTable plans={plans} layout="grid" className="ozel" data-testid="tablo" />,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.classList.contains('ozel')).toBe(true)
    expect(root.getAttribute('data-testid')).toBe('tablo')
    expect(root.getAttribute('data-layout')).toBe('grid')
  })
})
