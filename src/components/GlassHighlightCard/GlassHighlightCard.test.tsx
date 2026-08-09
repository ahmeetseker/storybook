import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GlassHighlightCard } from './GlassHighlightCard'

describe('GlassHighlightCard', () => {
  it('başlıktan accessible name alan bir section çizer', () => {
    render(
      <GlassHighlightCard
        title="Ege Arsa Ofisi"
        description="İzmir ve çevresinde imarlı arsa uzmanı"
      />,
    )
    expect(screen.getByRole('region', { name: 'Ege Arsa Ofisi' })).toBeDefined()
    expect(
      screen.getByText('İzmir ve çevresinde imarlı arsa uzmanı'),
    ).toBeDefined()
  })

  it('metrikleri dt→dd sırasıyla tanım listesi olarak çizer', () => {
    render(
      <GlassHighlightCard
        title="Ege Arsa Ofisi"
        metrics={[
          { label: 'Aktif İlan', value: '48' },
          { label: 'Uzmanlık', value: '12 bölge' },
        ]}
      />,
    )
    const terms = screen.getAllByRole('term')
    expect(terms.map((t) => t.textContent)).toEqual(['Aktif İlan', 'Uzmanlık'])
    expect(screen.getByText('48').tagName).toBe('DD')
    expect(screen.getByText('12 bölge').tagName).toBe('DD')
  })

  it('actionHref verilince aksiyonu link olarak çizer ve onAction da çalışır', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <GlassHighlightCard
        title="Ege Arsa Ofisi"
        actionLabel="0 (232) 456 78 90"
        actionHref="tel:02324567890"
        onAction={onAction}
      />,
    )
    const link = screen.getByRole('link', { name: '0 (232) 456 78 90' })
    expect(link.getAttribute('href')).toBe('tel:02324567890')
    await user.click(link)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('actionHref yoksa aksiyonu button olarak çizer', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <GlassHighlightCard
        title="Ege Arsa Ofisi"
        actionLabel="Tümünü gör"
        onAction={onAction}
      />,
    )
    const button = screen.getByRole('button', { name: 'Tümünü gör' })
    await user.click(button)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('actionLabel verilmezse aksiyon hiç render edilmez', () => {
    render(<GlassHighlightCard title="Ege Arsa Ofisi" onAction={() => {}} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('iconLabel verilince rozet img rolü alır, verilmeyince dekoratiftir', () => {
    const { rerender } = render(
      <GlassHighlightCard title="Ofis" iconLabel="Doğrulanmış kurumsal ofis" />,
    )
    expect(
      screen.getByRole('img', { name: 'Doğrulanmış kurumsal ofis' }),
    ).toBeDefined()

    rerender(<GlassHighlightCard title="Ofis" />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('href verilince başlık kartı kaplayan bir link olur, sade sol tık SPA gezinmesine devreder', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <GlassHighlightCard
        title="Ege Arsa Ofisi"
        href="/ofisler"
        onNavigate={onNavigate}
      />,
    )
    const link = screen.getByRole('link', { name: 'Ege Arsa Ofisi' })
    expect(link.getAttribute('href')).toBe('/ofisler')
    await user.click(link)
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it('modifier’lı tık SPA gezinmesini tetiklemez (tarayıcıya bırakılır)', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <GlassHighlightCard
        title="Ege Arsa Ofisi"
        href="/ofisler"
        onNavigate={onNavigate}
      />,
    )
    const link = screen.getByRole('link', { name: 'Ege Arsa Ofisi' })
    await user.keyboard('{Meta>}')
    await user.click(link)
    await user.keyboard('{/Meta}')
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('href yokken başlık link değildir', () => {
    render(<GlassHighlightCard title="Ege Arsa Ofisi" />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('tint prop’u kartın --hl-tint değişkenine yansır', () => {
    render(<GlassHighlightCard title="Ofis" tint="#3a7a8a" data-testid="kart" />)
    expect(screen.getByTestId('kart').style.getPropertyValue('--hl-tint')).toBe(
      '#3a7a8a',
    )
  })
})
