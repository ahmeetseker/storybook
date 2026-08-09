import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassFaqMarquee, type GlassFaqMarqueeRow } from './GlassFaqMarquee'

const rows: GlassFaqMarqueeRow[] = [
  {
    id: 'satir-1',
    direction: 'start',
    items: [
      { id: 's1', question: 'Koltuk ne demek?', answer: 'Kendi hesabıyla çalışan her danışman bir koltuktur.' },
      { id: 's2', question: 'Paket değiştirirsem ne olur?', answer: 'Yükseltme anında geçerli olur.' },
    ],
  },
  {
    id: 'satir-2',
    direction: 'end',
    items: [
      { id: 's3', question: 'Vitrin kontenjanı nedir?', answer: 'İlanın öne çıkarıldığı yerdir.' },
    ],
  },
]

const renderFaq = (props = {}) =>
  render(
    <GlassFaqMarquee
      title="Sık sorulanlar"
      subtitle="Aradığınızı bulamadıysanız bize yazın."
      rows={rows}
      {...props}
    />,
  )

describe('GlassFaqMarquee', () => {
  it('başlık h2 olarak basılır ve bölge onunla adlandırılır', () => {
    renderFaq()
    const heading = screen.getByRole('heading', { name: 'Sık sorulanlar', level: 2 })
    expect(heading).toBeTruthy()
    const section = screen.getByRole('region', { name: 'Sık sorulanlar' })
    expect(section.contains(heading)).toBe(true)
  })

  it('her satır kendi listesini basar, soru ve cevap görünür', () => {
    renderFaq()
    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(rows.length)
    const first = within(lists[0])
    expect(first.getByText('Koltuk ne demek?')).toBeTruthy()
    expect(first.getByText('Kendi hesabıyla çalışan her danışman bir koltuktur.')).toBeTruthy()
  })

  // Kesintisiz döngü çift kopya ister; erişilebilirlik ağacına yalnız ilki girer.
  it('döngü kopyası erişilebilirlik ağacından çıkar', () => {
    const { container } = renderFaq()
    const groups = container.querySelectorAll('ul')
    // Satır başına iki grup: görünür + aria-hidden kopya.
    expect(groups).toHaveLength(rows.length * 2)
    // Rol sorgusu aria-hidden'ı dışlar: soru erişilebilirlik ağacında tektir.
    expect(screen.getAllByRole('heading', { name: 'Koltuk ne demek?' })).toHaveLength(1)
    const duplicates = Array.from(groups).filter((ul) => ul.getAttribute('aria-hidden') === 'true')
    expect(duplicates).toHaveLength(rows.length)
  })

  it('duraklat düğmesi hareketi durdurur ve adı eyleme göre değişir', () => {
    const { container } = renderFaq()
    const root = container.firstElementChild
    expect(root?.getAttribute('data-paused')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Şeridi duraklat' }))
    expect(root?.getAttribute('data-paused')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Şeridi sürdür' }))
    expect(root?.getAttribute('data-paused')).toBeNull()
  })

  it('satır yönü DOM kancasına yazılır', () => {
    const { container } = renderFaq()
    const rowNodes = container.querySelectorAll('[data-direction]')
    expect(rowNodes[0].getAttribute('data-direction')).toBe('start')
    expect(rowNodes[1].getAttribute('data-direction')).toBe('end')
  })

  it('başlık verilmezse header hiç basılmaz, bölge label ile adlandırılır', () => {
    render(<GlassFaqMarquee rows={rows} label="Paket soruları" />)
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
    expect(screen.getByRole('region', { name: 'Paket soruları' })).toBeTruthy()
  })
})
