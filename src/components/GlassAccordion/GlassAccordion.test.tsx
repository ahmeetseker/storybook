import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassAccordion, type GlassAccordionItem, type GlassAccordionProps } from './GlassAccordion'

const items: GlassAccordionItem[] = [
  { id: 'a', title: 'Birinci soru', content: <p>Birinci cevap</p> },
  { id: 'b', title: 'İkinci soru', content: <p>İkinci cevap</p> },
  { id: 'c', title: 'Üçüncü soru', content: <p>Üçüncü cevap</p> },
]

const renderAccordion = (props: Partial<GlassAccordionProps> = {}) =>
  render(<GlassAccordion items={items} aria-label="SSS" {...props} />)

describe('GlassAccordion', () => {
  it('varsayılan: tüm başlıklar aria-expanded=false ile render olur, panel içeriği DOM\'dadır', () => {
    renderAccordion()
    const button = screen.getByRole('button', { name: 'Birinci soru' })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByText('Birinci cevap')).toBeTruthy()
  })

  it('tıklama panel açar; aria-expanded ve aria-controls tutarlıdır', () => {
    renderAccordion()
    const button = screen.getByRole('button', { name: 'Birinci soru' })
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    const panelId = button.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    const panel = document.getElementById(panelId as string)
    expect(panel).toBeTruthy()
    expect(panel?.getAttribute('data-open')).toBe('true')
    expect(panel?.hasAttribute('role')).toBe(false)
  })

  it('kapalı panel inert\'tir, açık panel değildir', () => {
    renderAccordion()
    const button = screen.getByRole('button', { name: 'Birinci soru' })
    const panelId = button.getAttribute('aria-controls') as string
    const panel = document.getElementById(panelId) as HTMLElement
    expect(panel.hasAttribute('inert')).toBe(true)
    fireEvent.click(button)
    expect(panel.hasAttribute('inert')).toBe(false)
  })

  it("mode='single' (varsayılan): bir paneli açmak diğerini kapatır", () => {
    renderAccordion()
    fireEvent.click(screen.getByRole('button', { name: 'Birinci soru' }))
    expect(screen.getByRole('button', { name: 'Birinci soru' }).getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'İkinci soru' }))
    expect(screen.getByRole('button', { name: 'Birinci soru' }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByRole('button', { name: 'İkinci soru' }).getAttribute('aria-expanded')).toBe('true')
  })

  it("mode='multiple': paneller birbirinden bağımsız açık kalır", () => {
    renderAccordion({ mode: 'multiple' })
    fireEvent.click(screen.getByRole('button', { name: 'Birinci soru' }))
    fireEvent.click(screen.getByRole('button', { name: 'İkinci soru' }))
    expect(screen.getByRole('button', { name: 'Birinci soru' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('button', { name: 'İkinci soru' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('aynı panele tekrar tıklamak onu kapatır (single modda hiçbiri açık kalmayabilir)', () => {
    renderAccordion({ defaultOpenIds: ['a'] })
    const button = screen.getByRole('button', { name: 'Birinci soru' })
    expect(button.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('controlled: openIds dışarıdan verilince tıklama iç state\'i değiştirmez, yalnız onOpenIdsChange çağrılır', () => {
    const onOpenIdsChange = vi.fn()
    renderAccordion({ openIds: ['a'], onOpenIdsChange })
    const buttonA = screen.getByRole('button', { name: 'Birinci soru' })
    const buttonB = screen.getByRole('button', { name: 'İkinci soru' })
    fireEvent.click(buttonB)
    expect(onOpenIdsChange).toHaveBeenCalledWith(['b'])
    // Prop güncellenmediği için görünüm hâlâ 'a' açık gösterir
    expect(buttonA.getAttribute('aria-expanded')).toBe('true')
    expect(buttonB.getAttribute('aria-expanded')).toBe('false')
  })

  it('klavye: ArrowDown/ArrowUp bitişik başlığa, Home/End ilk/son başlığa odaklanır', () => {
    renderAccordion()
    const [first, second, third] = items.map((i) =>
      screen.getByRole('button', { name: i.title as string }),
    )
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(second)
    fireEvent.keyDown(second, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(third)
    fireEvent.keyDown(third, { key: 'ArrowDown' })
    // Sondan başa sarar
    expect(document.activeElement).toBe(first)
    fireEvent.keyDown(first, { key: 'End' })
    expect(document.activeElement).toBe(third)
    fireEvent.keyDown(third, { key: 'Home' })
    expect(document.activeElement).toBe(first)
  })

  it('headingAs: varsayılan h3, verilirse h4/div sarmalayıcıya geçer', () => {
    const { rerender } = renderAccordion()
    expect(screen.getByRole('heading', { level: 3, name: 'Birinci soru' })).toBeTruthy()
    rerender(<GlassAccordion items={items} aria-label="SSS" headingAs="h4" />)
    expect(screen.getByRole('heading', { level: 4, name: 'Birinci soru' })).toBeTruthy()
    rerender(<GlassAccordion items={items} aria-label="SSS" headingAs="div" />)
    expect(screen.queryByRole('heading', { name: 'Birinci soru' })).toBeNull()
  })

  it('kök aria-label ile adlandırılır', () => {
    const { container } = renderAccordion({ 'aria-label': 'Yardım merkezi' })
    expect(container.querySelector('[aria-label="Yardım merkezi"]')).toBeTruthy()
  })
})
