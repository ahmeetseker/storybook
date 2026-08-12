import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassPriceRange } from './GlassPriceRange'

// 10 bant × 10 birim: toplam 90 gözlem
const BINS = [2, 5, 9, 14, 20, 16, 11, 7, 4, 2]

const setup = (props: Partial<Parameters<typeof GlassPriceRange>[0]> = {}) =>
  render(
    <GlassPriceRange
      min={0}
      max={100}
      step={10}
      defaultValue={[20, 60]}
      bins={BINS}
      label="Fiyat aralığı"
      {...props}
    />,
  )

const handles = () => ({
  low: screen.getByRole('slider', { name: 'Fiyat aralığı: en düşük' }),
  high: screen.getByRole('slider', { name: 'Fiyat aralığı: en yüksek' }),
})

describe('GlassPriceRange', () => {
  it('adlandırılmış grup ve iki kol render eder', () => {
    setup()
    expect(screen.getByRole('group', { name: 'Fiyat aralığı' })).toBeDefined()
    const { low, high } = handles()
    expect((low as HTMLInputElement).value).toBe('20')
    expect((high as HTMLInputElement).value).toBe('60')
    expect(low.getAttribute('aria-valuetext')).toBe('20')
  })

  it('alan sınırlarını ve kol değerlerini pil olarak gösterir', () => {
    setup()
    expect(screen.getByText('0')).toBeDefined()
    expect(screen.getByText('100')).toBeDefined()
    expect(screen.getByText('20')).toBeDefined()
    expect(screen.getByText('60')).toBeDefined()
  })

  it('kollar yaklaşınca iki pil tek pile birleşir', () => {
    const { container } = setup({ defaultValue: [40, 50] })
    const merged = container.querySelector('[data-merged="true"]')
    expect(merged?.textContent).toBe('40 – 50')
    expect(container.querySelectorAll('[data-handle="min"]')).toHaveLength(2) // input + thumb, pil yok
  })

  it('formatValue pili, sınırı ve aria-valuetext’i biçimlendirir', () => {
    setup({ formatValue: (v) => `${v} ₺` })
    expect(screen.getByText('20 ₺')).toBeDefined()
    expect(screen.getByText('100 ₺')).toBeDefined()
    expect(handles().low.getAttribute('aria-valuetext')).toBe('20 ₺')
  })

  it('histogramda yalnız seçimle kesişen bantlar vurgulanır', () => {
    const { container } = setup()
    expect(container.querySelectorAll('[data-part="bin"]')).toHaveLength(BINS.length)
    // 20–60 aralığı 3., 4., 5. ve 6. bantla kesişir
    expect(container.querySelectorAll('[data-part="bin"][data-active="true"]')).toHaveLength(4)
  })

  it('dağılımı erişilebilir özet olarak da yazar', () => {
    setup({ countLabel: 'ilan' })
    expect(screen.getByText(/seçili aralıkta 59 \/ 90 ilan/)).toBeDefined()
  })

  it('bins verilmezse histogram ve özet render edilmez', () => {
    const { container } = setup({ bins: undefined })
    expect(container.querySelectorAll('[data-part="bin"]')).toHaveLength(0)
    expect(screen.queryByText(/Dağılım:/)).toBeNull()
  })

  it('sol kol sağ kolu geçemez: minGap kadar geride durur', () => {
    const onChange = vi.fn()
    setup({ onChange })
    fireEvent.change(handles().low, { target: { value: '90' } })
    expect(onChange).toHaveBeenCalledWith([50, 60])
    expect((handles().low as HTMLInputElement).value).toBe('50')
  })

  it('sağ kol sol kolun altına inemez', () => {
    const onChange = vi.fn()
    setup({ onChange })
    fireEvent.change(handles().high, { target: { value: '0' } })
    expect(onChange).toHaveBeenCalledWith([20, 30])
  })

  it('klavye ok tuşları kolu step kadar oynatır, Home/End alan uçlarına gider', () => {
    const onChange = vi.fn()
    setup({ onChange })
    fireEvent.keyDown(handles().low, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith([30, 60])
    fireEvent.keyDown(handles().high, { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith([30, 100])
    fireEvent.keyDown(handles().low, { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith([0, 100])
  })

  it('controlled kullanımda kendi kendine oynamaz', () => {
    const onChange = vi.fn()
    setup({ value: [20, 60], onChange })
    fireEvent.keyDown(handles().low, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith([30, 60])
    expect((handles().low as HTMLInputElement).value).toBe('20')
  })

  it('ters sırada gelen değer normalize edilir', () => {
    setup({ value: [80, 30] })
    expect((handles().low as HTMLInputElement).value).toBe('30')
    expect((handles().high as HTMLInputElement).value).toBe('80')
  })

  it('disabled: kollar kapanır ve klavye değer değiştirmez', () => {
    const onChange = vi.fn()
    setup({ disabled: true, onChange })
    const { low } = handles()
    expect((low as HTMLInputElement).disabled).toBe(true)
    fireEvent.keyDown(low, { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('sıvı basış: sürüklenen kolun thumbı cam olur, diğeri kalmaz; bırakınca temizlenir', () => {
    const { container } = setup()
    const { low } = handles()
    fireEvent.pointerDown(low)
    expect(container.querySelector('span[data-handle="min"][data-liquid]')).not.toBeNull()
    expect(container.querySelector('span[data-handle="max"][data-liquid]')).toBeNull()
    fireEvent.pointerUp(low)
    expect(container.querySelector('[data-liquid]')).toBeNull()
  })
})
