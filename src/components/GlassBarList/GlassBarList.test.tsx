import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlassBarList } from './GlassBarList'

const fill = (container: HTMLElement, index: number) =>
  container.querySelectorAll<HTMLElement>('[data-part="fill"]')[index]

describe('GlassBarList', () => {
  it('erişilebilir adlı liste olarak render olur; her öğe etiket ve değeri metin taşır', () => {
    render(
      <GlassBarList
        label="Yaş dağılımı"
        items={[
          { id: '0-14', label: '0–14', value: 18 },
          { id: '15-24', label: '15–24', value: 22 },
        ]}
      />,
    )
    const list = screen.getByRole('list', { name: 'Yaş dağılımı' })
    expect(list).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('0–14')).toBeTruthy()
    expect(screen.getByText('%18')).toBeTruthy()
  })

  it('varsayılan ölçek toplamdır: bar genişliği değerin toplam içindeki payıdır', () => {
    const { container } = render(
      <GlassBarList
        label="a"
        items={[
          { id: 'x', label: 'X', value: 50 },
          { id: 'y', label: 'Y', value: 25 },
          { id: 'z', label: 'Z', value: 25 },
        ]}
      />,
    )
    expect(fill(container, 0).style.width).toBe('50%')
    expect(fill(container, 1).style.width).toBe('25%')
  })

  it("scale='max' en büyük değeri %100'e oturtur", () => {
    const { container } = render(
      <GlassBarList
        label="b"
        scale="max"
        items={[
          { id: 'x', label: 'X', value: 40 },
          { id: 'y', label: 'Y', value: 20 },
        ]}
      />,
    )
    expect(fill(container, 0).style.width).toBe('100%')
    expect(fill(container, 1).style.width).toBe('50%')
  })

  it('formatValue görünür değeri, valueLabel ise tek öğeyi geçersiz kılar', () => {
    render(
      <GlassBarList
        label="c"
        formatValue={(v) => `${v.toLocaleString('tr-TR')} kişi`}
        items={[
          { id: 'x', label: 'X', value: 4_250 },
          { id: 'y', label: 'Y', value: 900, valueLabel: 'veri yok' },
        ]}
      />,
    )
    expect(screen.getByText('4.250 kişi')).toBeTruthy()
    expect(screen.getByText('veri yok')).toBeTruthy()
  })

  it('prominent öğe data-prominent taşır (seçili bölge vurgusu)', () => {
    const { container } = render(
      <GlassBarList
        label="d"
        items={[
          { id: 'x', label: 'X', value: 10 },
          { id: 'y', label: 'Y', value: 20, prominent: true },
        ]}
      />,
    )
    const rows = container.querySelectorAll('[role="listitem"]')
    expect(rows[0].getAttribute('data-prominent')).toBeNull()
    expect(rows[1].getAttribute('data-prominent')).toBe('true')
  })

  it('bar dekoratiftir: erişilebilirlik ağacına girmez, bilgi metinde taşınır', () => {
    const { container } = render(
      <GlassBarList label="e" items={[{ id: 'x', label: 'X', value: 10 }]} />,
    )
    const track = container.querySelector('[data-part="track"]')
    expect(track?.getAttribute('aria-hidden')).toBe('true')
  })

  it('tüm değerler sıfırken genişlikler NaN olmaz', () => {
    const { container } = render(
      <GlassBarList
        label="f"
        items={[
          { id: 'x', label: 'X', value: 0 },
          { id: 'y', label: 'Y', value: 0 },
        ]}
      />,
    )
    expect(fill(container, 0).style.width).toBe('0%')
  })
})
