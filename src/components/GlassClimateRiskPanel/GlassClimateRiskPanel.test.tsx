import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassClimateRiskPanel, type GlassClimateRiskHazard } from './GlassClimateRiskPanel'

const hazards: GlassClimateRiskHazard[] = [
  { id: 'deprem', label: 'Deprem', level: 4, levelLabel: 'Yüksek', description: 'Fay hattına 8 km', source: 'AFAD 2025' },
  { id: 'sel', label: 'Sel', level: 1, levelLabel: 'Düşük', description: 'Dere yatağından uzak', source: 'AFAD 2025' },
  { id: 'yangin', label: 'Yangın', level: 3, levelLabel: 'Orta', description: 'Orman sınırına yakın', source: 'AFAD 2025' },
]

describe('GlassClimateRiskPanel', () => {
  it('role="list" ile render olur ve her tehlike bir listitem üretir', () => {
    render(<GlassClimateRiskPanel hazards={hazards} />)
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('title verilince h3 render eder ve section’ı aria-labelledby ile adlandırır', () => {
    const { container } = render(<GlassClimateRiskPanel hazards={hazards} title="İklim ve Afet Riski" />)
    const heading = screen.getByRole('heading', { level: 3, name: 'İklim ve Afet Riski' })
    const section = container.querySelector('section') as HTMLElement
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id)
  })

  it('title verilmezse başlık render edilmez ve aria-labelledby yok', () => {
    const { container } = render(<GlassClimateRiskPanel hazards={hazards} />)
    expect(screen.queryByRole('heading')).toBeNull()
    expect(container.querySelector('section')?.getAttribute('aria-labelledby')).toBeNull()
  })

  it('badges varyantı: ikon dekoratiftir, etiket ve levelLabel metni görünür render edilir', () => {
    render(
      <GlassClimateRiskPanel
        hazards={[{ id: 'deprem', label: 'Deprem', icon: <span data-testid="ikon">🏚️</span>, level: 4, levelLabel: 'Yüksek' }]}
      />,
    )
    expect(screen.getByText('Deprem')).toBeTruthy()
    expect(screen.getByText('Yüksek')).toBeTruthy()
    const iconWrap = screen.getByTestId('ikon').parentElement!
    expect(iconWrap.getAttribute('aria-hidden')).toBe('true')
  })

  it('badges varyantında description ve source render edilmez (kompakt)', () => {
    render(
      <GlassClimateRiskPanel
        hazards={[
          { id: 'sel', label: 'Sel', level: 2, levelLabel: 'Düşük', description: 'Yok sayılmalı', source: 'AFAD 2025' },
        ]}
        variant="badges"
      />,
    )
    expect(screen.queryByText('Yok sayılmalı')).toBeNull()
    expect(screen.queryByText('AFAD 2025')).toBeNull()
  })

  it('detailed varyantı: açıklama ve kaynak metni render edilir', () => {
    render(<GlassClimateRiskPanel hazards={hazards} variant="detailed" />)
    expect(screen.getByText('Fay hattına 8 km')).toBeTruthy()
    expect(screen.getAllByText('AFAD 2025')).toHaveLength(3)
  })

  it('detailed varyantında seviye ölçeği her zaman 5 birim taşır; dolu birim sayısı level ile eşleşir', () => {
    const { container } = render(
      <GlassClimateRiskPanel hazards={[{ id: 'deprem', label: 'Deprem', level: 4, levelLabel: 'Yüksek' }]} variant="detailed" />,
    )
    const filled = container.querySelectorAll('[class*="unitFilled"]')
    const empty = container.querySelectorAll('[class*="unitEmpty"]')
    expect(filled).toHaveLength(4)
    expect(empty).toHaveLength(1)
  })

  it('seviye ölçeği role="img" ile hem sayısal hem metinsel bilgiyi aria-label’da taşır', () => {
    render(<GlassClimateRiskPanel hazards={[{ id: 'deprem', label: 'Deprem', level: 4, levelLabel: 'Yüksek' }]} variant="detailed" />)
    const scale = screen.getByRole('img', { name: 'Deprem: 5 üzerinden 4, Yüksek' })
    expect(scale).toBeTruthy()
  })

  it('seviye rengi semantik eşiğe göre data-tone’a yansır (1-2 success, 3 warning, 4-5 danger)', () => {
    const { container } = render(
      <GlassClimateRiskPanel
        hazards={[
          { id: 'a', label: 'A', level: 1, levelLabel: 'Düşük' },
          { id: 'b', label: 'B', level: 3, levelLabel: 'Orta' },
          { id: 'c', label: 'C', level: 5, levelLabel: 'Çok Yüksek' },
        ]}
      />,
    )
    const items = container.querySelectorAll('li')
    expect(items[0].getAttribute('data-tone')).toBe('success')
    expect(items[1].getAttribute('data-tone')).toBe('warning')
    expect(items[2].getAttribute('data-tone')).toBe('danger')
  })

  it('boş hazards dizisi boş liste render eder, hata fırlatmaz', () => {
    render(<GlassClimateRiskPanel hazards={[]} />)
    expect(screen.getByRole('list').children).toHaveLength(0)
  })
})
