import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassFilterPanel } from './GlassFilterPanel'

describe('GlassFilterPanel', () => {
  it('adlandırılmış complementary landmark olarak render olur', () => {
    render(
      <GlassFilterPanel label="Filtreler">
        <div>içerik</div>
      </GlassFilterPanel>,
    )
    const region = screen.getByRole('complementary', { name: 'Filtreler' })
    expect(region.tagName).toBe('ASIDE')
  })

  it('varsayılan landmark adı "Filtreler"dir ve başlık olarak da görünür', () => {
    render(<GlassFilterPanel>x</GlassFilterPanel>)
    expect(screen.getByRole('complementary', { name: 'Filtreler' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Filtreler', level: 2 })).toBeTruthy()
  })

  it('resultCount verilince aria-live="polite" sonuç satırı çizer', () => {
    render(<GlassFilterPanel resultCount={42}>x</GlassFilterPanel>)
    const result = screen.getByText('42 sonuç')
    expect(result.getAttribute('aria-live')).toBe('polite')
  })

  it('resultLabel ile sonuç metni biçimlendirilir', () => {
    render(
      <GlassFilterPanel resultCount={3} resultLabel={(n) => `${n} ilan eşleşti`}>
        x
      </GlassFilterPanel>,
    )
    expect(screen.getByText('3 ilan eşleşti')).toBeTruthy()
  })

  it('onReset verilince erişilebilir sıfırlama butonu çalışır', async () => {
    const onReset = vi.fn()
    const user = userEvent.setup()
    render(
      <GlassFilterPanel onReset={onReset} resetLabel="Filtreleri sıfırla">
        x
      </GlassFilterPanel>,
    )
    await user.click(screen.getByRole('button', { name: 'Filtreleri sıfırla' }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('onReset yoksa sıfırlama butonu render edilmez (false affordance yok)', () => {
    render(<GlassFilterPanel>x</GlassFilterPanel>)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('resultCount verilmezse sonuç satırı çizilmez', () => {
    render(<GlassFilterPanel>x</GlassFilterPanel>)
    expect(screen.queryByText(/sonuç/)).toBeNull()
  })

  it('caller rest ile yönetilen aria-label ezilemez', () => {
    render(
      <GlassFilterPanel label="Doğru" aria-label="Yanlış">
        x
      </GlassFilterPanel>,
    )
    expect(screen.getByRole('complementary', { name: 'Doğru' })).toBeTruthy()
  })
})
