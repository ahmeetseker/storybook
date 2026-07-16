import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassRadioGroup, type GlassRadioGroupProps } from './GlassRadioGroup'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const options = [
  { value: 'benzin', label: 'Benzin' },
  { value: 'dizel', label: 'Dizel' },
  { value: 'elektrik', label: 'Elektrik' },
]

const renderGroup = (props: Partial<GlassRadioGroupProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassRadioGroup label="Yakıt tipi" options={options} {...props} />
    </GlassTierProvider>,
  )

describe('GlassRadioGroup', () => {
  it('radiogroup rolü + aria-label ile render olur, seçenekler radio rolündedir', () => {
    renderGroup()
    expect(screen.getByRole('radiogroup', { name: 'Yakıt tipi' })).toBeTruthy()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.getByRole('radio', { name: 'Dizel' })).toBeTruthy()
  })

  it('tıklama seçer ve onChange değeri döner', () => {
    const onChange = vi.fn()
    renderGroup({ onChange, defaultValue: 'benzin' })
    fireEvent.click(screen.getByRole('radio', { name: 'Elektrik' }))
    expect(onChange).toHaveBeenCalledWith('elektrik')
    expect((screen.getByRole('radio', { name: 'Elektrik' }) as HTMLInputElement).checked).toBe(true)
  })

  it('ok tuşları seçimi taşır, uçlarda sarar ve disabled seçeneği atlar', () => {
    const onChange = vi.fn()
    renderGroup({
      onChange,
      defaultValue: 'benzin',
      options: [
        { value: 'benzin', label: 'Benzin' },
        { value: 'dizel', label: 'Dizel', disabled: true },
        { value: 'elektrik', label: 'Elektrik' },
      ],
    })
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'ArrowDown' })
    // dizel disabled → elektrik'e atlar
    expect(onChange).toHaveBeenLastCalledWith('elektrik')
    fireEvent.keyDown(group, { key: 'ArrowDown' })
    // sondan başa sarar
    expect(onChange).toHaveBeenLastCalledWith('benzin')
    fireEvent.keyDown(group, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith('elektrik')
  })

  it('disabled seçenek tıklamayla seçilemez', () => {
    const onChange = vi.fn()
    renderGroup({
      onChange,
      options: [
        { value: 'aktif', label: 'Aktif' },
        { value: 'arsiv', label: 'Arşiv', disabled: true },
      ],
    })
    fireEvent.click(screen.getByRole('radio', { name: 'Arşiv' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('tüm inputlar aynı name ile native radyo grubu oluşturur', () => {
    renderGroup({ name: 'yakit' })
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios.every((r) => r.name === 'yakit')).toBe(true)
  })

  it('controlled: value dışarıdan güncellenmeden değişmez', () => {
    const onChange = vi.fn()
    renderGroup({ value: 'benzin', onChange })
    fireEvent.click(screen.getByRole('radio', { name: 'Dizel' }))
    expect(onChange).toHaveBeenCalledWith('dizel')
    expect((screen.getByRole('radio', { name: 'Benzin' }) as HTMLInputElement).checked).toBe(true)
  })
})
