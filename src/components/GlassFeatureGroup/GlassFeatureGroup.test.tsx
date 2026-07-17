import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { GlassFeatureGroup, type GlassFeatureGroupSection } from './GlassFeatureGroup'

const groups: GlassFeatureGroupSection[] = [
  {
    title: 'İç Özellikler',
    items: [
      { label: 'Isıtma Tipi', value: 'Kombi (Doğalgaz)' },
      { label: 'Klima', present: true },
      { label: 'Jakuzi', present: false },
    ],
  },
  {
    title: 'Dış Özellikler',
    items: [
      { label: 'Asansör', present: true },
      { label: 'Otopark', present: false },
    ],
  },
]

describe('GlassFeatureGroup — accordion', () => {
  it('ilk grup varsayılan açık, diğerleri kapalı render olur', () => {
    render(<GlassFeatureGroup groups={groups} variant="accordion" />)
    const first = screen.getByRole('button', { name: 'İç Özellikler' })
    const second = screen.getByRole('button', { name: 'Dış Özellikler' })
    expect(first.getAttribute('aria-expanded')).toBe('true')
    expect(second.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByText('Kombi (Doğalgaz)')).toBeTruthy()
    expect(screen.queryByText('Asansör')).toBeNull()
  })

  it('başlığa tıklayınca aç/kapa olur ve region aria-labelledby ile eşlenir', async () => {
    render(<GlassFeatureGroup groups={groups} variant="accordion" />)
    const second = screen.getByRole('button', { name: 'Dış Özellikler' })
    fireEvent.click(second)
    expect(second.getAttribute('aria-expanded')).toBe('true')
    await waitFor(() => expect(screen.getByText('Asansör')).toBeTruthy())
    const region = screen.getByRole('region', { name: 'Dış Özellikler' })
    expect(region.id).toBe(second.getAttribute('aria-controls'))

    fireEvent.click(second)
    expect(second.getAttribute('aria-expanded')).toBe('false')
    await waitFor(() => expect(screen.queryByText('Asansör')).toBeNull())
  })

  it('grup sırası değişince başlığa bağlı key sayesinde aç/kapa state\'i korunur', () => {
    const { rerender } = render(<GlassFeatureGroup groups={groups} variant="accordion" />)
    const second = screen.getByRole('button', { name: 'Dış Özellikler' })
    fireEvent.click(second)
    expect(second.getAttribute('aria-expanded')).toBe('true')

    const reordered = [groups[1], groups[0]] as GlassFeatureGroupSection[]
    rerender(<GlassFeatureGroup groups={reordered} variant="accordion" />)

    const secondAfterReorder = screen.getByRole('button', { name: 'Dış Özellikler' })
    expect(secondAfterReorder.getAttribute('aria-expanded')).toBe('true')
  })
})

describe('GlassFeatureGroup — checklist', () => {
  it('present=true/false item\'ları mevcut/yok erişilebilir adıyla ikonlaştırır', () => {
    render(<GlassFeatureGroup groups={groups} variant="checklist" />)
    expect(screen.getAllByRole('img', { name: 'mevcut' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('img', { name: 'yok' }).length).toBeGreaterThan(0)
  })

  it('value verilen item\'ı ayrıca etiket:değer satırı olarak render eder', () => {
    render(<GlassFeatureGroup groups={groups} variant="checklist" />)
    expect(screen.getByText('Isıtma Tipi')).toBeTruthy()
    expect(screen.getByText('Kombi (Doğalgaz)')).toBeTruthy()
  })

  it('value ve present ikisi de yokken ✓ çizmez ve isimsiz role=img üretmez', () => {
    const belirsizGroups: GlassFeatureGroupSection[] = [
      {
        title: 'Belirsiz Özellikler',
        items: [{ label: 'Güvenlik Kamerası' }],
      },
    ]
    render(<GlassFeatureGroup groups={belirsizGroups} variant="checklist" />)
    expect(screen.getByText('Güvenlik Kamerası')).toBeTruthy()
    expect(screen.queryByRole('img', { name: 'mevcut' })).toBeNull()
    expect(screen.queryByRole('img', { name: 'yok' })).toBeNull()
    // aria-label'sız / isimsiz role=img de üretilmemeli
    expect(screen.queryByRole('img')).toBeNull()
  })
})

describe('GlassFeatureGroup — columns', () => {
  it('grup başlıklarını heading OLMADAN render eder', () => {
    render(<GlassFeatureGroup groups={groups} variant="columns" />)
    expect(screen.getByText('İç Özellikler')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'İç Özellikler' })).toBeNull()
  })

  it('columns=2 verilince iki sütun sınıfı uygulanır', () => {
    const { container } = render(<GlassFeatureGroup groups={groups} variant="columns" columns={2} />)
    const lists = container.querySelectorAll('dl')
    expect(lists[0]?.className).toMatch(/twoColumns/)
  })

  it('tüm etiket/değer çiftlerini dl>dt+dd olarak render eder', () => {
    const { container } = render(<GlassFeatureGroup groups={groups} variant="columns" />)
    const firstDl = container.querySelectorAll('dl')[0]
    expect(within(firstDl as HTMLElement).getByText('Isıtma Tipi').tagName).toBe('DT')
  })
})
