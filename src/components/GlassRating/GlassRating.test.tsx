import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassRating } from './GlassRating'

// Tip seviyesinde regresyon (rules.md §2: "children kabul edilmez"): bu fonksiyon
// hiçbir zaman çağrılmaz, yalnızca `tsc -b` sırasında children'ın GlassRating
// prop tipine artık kabul edilmediğini doğrular — @ts-expect-error kullanılmayan
// bir hata bastırırsa derleme (ts 2578) başarısız olur.
function _typeOnly_childrenReddedilir() {
  // @ts-expect-error — GlassRatingBaseProps children'ı Omit eder (HTMLAttributes üzerinden sızmamalı)
  // oxlint-disable-next-line react/no-children-prop -- kasıtlı: yasak kullanımın derlemede reddedildiğini doğrular
  return <GlassRating value={4} children="sızıntı" />
}
void _typeOnly_childrenReddedilir

describe('GlassRating — display', () => {
  it('img rolü ve tam açıklamalı aria-label ile render olur', () => {
    render(<GlassRating value={4.6} count={128} />)
    const img = screen.getByRole('img', { name: '5 üzerinden 4,6 yıldız, 128 değerlendirme' })
    expect(img).toBeTruthy()
    expect(screen.getByText('4,6 · 128 değerlendirme')).toBeTruthy()
  })

  it('count verilmezse görünür metin render edilmez, aria-label adet içermez', () => {
    render(<GlassRating value={3.5} />)
    expect(screen.getByRole('img', { name: '5 üzerinden 3,5 yıldız' })).toBeTruthy()
    expect(screen.queryByText(/değerlendirme/)).toBeNull()
  })

  it('value [0, 5] aralığına clamp edilir', () => {
    const { unmount } = render(<GlassRating value={9} count={10} />)
    expect(screen.getByRole('img', { name: '5 üzerinden 5 yıldız, 10 değerlendirme' })).toBeTruthy()
    unmount()

    render(<GlassRating value={-3} count={10} />)
    expect(screen.getByRole('img', { name: '5 üzerinden 0 yıldız, 10 değerlendirme' })).toBeTruthy()
  })

  it('yıldız SVG dolgu katmanları aria-hidden köke sahiptir (AT stars\'ı ayrıca duyurmaz)', () => {
    const { container } = render(<GlassRating value={4} count={1} />)
    const starsWrap = container.querySelector('[aria-hidden="true"]')
    expect(starsWrap).toBeTruthy()
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
  })
})

describe('GlassRating — input', () => {
  it('radiogroup rolü + 5 radio "N yıldız" etiketiyle render olur', () => {
    render(<GlassRating variant="input" label="Puanınız" />)
    expect(screen.getByRole('radiogroup', { name: 'Puanınız' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: '1 yıldız' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: '5 yıldız' })).toBeTruthy()
    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })

  it('seçim yokken hiçbir radio checked değildir, ilk yıldız roving hedefidir', () => {
    render(<GlassRating variant="input" label="Puanınız" />)
    const radios = screen.getAllByRole('radio')
    expect(radios.every((r) => r.getAttribute('aria-checked') === 'false')).toBe(true)
    expect(screen.getByRole('radio', { name: '1 yıldız' }).getAttribute('tabindex')).toBe('0')
  })

  it('tıklama seçer, onValueChange değeri döner, roving tabindex seçimi izler', () => {
    const onValueChange = vi.fn()
    render(<GlassRating variant="input" label="Puanınız" onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('radio', { name: '4 yıldız' }))
    expect(onValueChange).toHaveBeenCalledWith(4)
    expect(screen.getByRole('radio', { name: '4 yıldız' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('radio', { name: '4 yıldız' }).getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('radio', { name: '1 yıldız' }).getAttribute('tabindex')).toBe('-1')
  })

  it('ok tuşları seçimi taşır ve uçlarda sarar', () => {
    const onValueChange = vi.fn()
    render(<GlassRating variant="input" label="Puanınız" defaultValue={5} onValueChange={onValueChange} />)
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(onValueChange).toHaveBeenLastCalledWith(1)
    fireEvent.keyDown(group, { key: 'ArrowLeft' })
    expect(onValueChange).toHaveBeenLastCalledWith(5)
  })

  it('seçim yokken ArrowLeft/ArrowUp roving hedefinden (1. yıldız) 5. yıldıza sarar, 4\'ü atlamaz', () => {
    const onValueChange = vi.fn()
    render(<GlassRating variant="input" label="Puanınız" onValueChange={onValueChange} />)
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'ArrowLeft' })
    expect(onValueChange).toHaveBeenLastCalledWith(5)
  })

  it('seçim yokken ArrowRight/ArrowDown roving hedefinden (1. yıldız) sonrakine (2) geçer', () => {
    const onValueChange = vi.fn()
    render(<GlassRating variant="input" label="Puanınız" onValueChange={onValueChange} />)
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(onValueChange).toHaveBeenLastCalledWith(2)
  })

  it('Home/End ilk ve son yıldıza gider', () => {
    const onValueChange = vi.fn()
    render(<GlassRating variant="input" label="Puanınız" defaultValue={3} onValueChange={onValueChange} />)
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'End' })
    expect(onValueChange).toHaveBeenLastCalledWith(5)
    fireEvent.keyDown(group, { key: 'Home' })
    expect(onValueChange).toHaveBeenLastCalledWith(1)
  })

  it('controlled: value dışarıdan sabitken tıklama iç state\'i değiştirmez ama onValueChange çalışır', () => {
    const onValueChange = vi.fn()
    render(<GlassRating variant="input" label="Puanınız" value={2} onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('radio', { name: '5 yıldız' }))
    expect(onValueChange).toHaveBeenCalledWith(5)
    expect(screen.getByRole('radio', { name: '2 yıldız' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('radio', { name: '5 yıldız' }).getAttribute('aria-checked')).toBe('false')
  })

  it('disabled kontrol hiçbir etkileşim almaz', () => {
    const onValueChange = vi.fn()
    render(<GlassRating variant="input" label="Puanınız" disabled onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('radio', { name: '3 yıldız' }))
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' })
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('GlassRating — module.css', () => {
  it('.starButton .starCell hover büyütmesi için bir transition tanımlar (reduced-motion override\'ının iptal edecek bir şeyi olsun)', () => {
    const cssPath = join(process.cwd(), 'src/components/GlassRating/GlassRating.module.css')
    const css = readFileSync(cssPath, 'utf-8')
    const ruleMatch = css.match(/\.starButton \.starCell\s*\{([^}]*)\}/)
    expect(ruleMatch).toBeTruthy()
    expect(ruleMatch?.[1]).toMatch(/transition\s*:\s*transform/)
  })
})

describe('GlassRating — summary', () => {
  it('ortalama değeri ve toplam adedi görünür metin olarak render eder', () => {
    render(<GlassRating variant="summary" value={4.2} distribution={[60, 30, 5, 3, 2]} />)
    expect(screen.getByText('4,2')).toBeTruthy()
    expect(screen.getByText('100 değerlendirme')).toBeTruthy()
  })

  it('5 satır dağılım barı, 5→1 yıldız sırasıyla adetleri render eder', () => {
    render(<GlassRating variant="summary" value={4.2} distribution={[60, 30, 5, 3, 2]} />)
    expect(screen.getByText('5 yıldız')).toBeTruthy()
    expect(screen.getByText('1 yıldız')).toBeTruthy()
    expect(screen.getByText('60')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('dağılım barı genişliği toplam içindeki yüzdeyle birebir örtüşür', () => {
    const { container } = render(
      <GlassRating variant="summary" value={4} distribution={[50, 25, 15, 5, 5]} />,
    )
    const fills = container.querySelectorAll('[class*="distBarFill"]') as NodeListOf<HTMLElement>
    expect(fills[0].style.width).toBe('50%')
    expect(fills[4].style.width).toBe('5%')
  })
})
