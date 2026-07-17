import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassMatchScore } from './GlassMatchScore'

const criteria = [
  { label: '3+1', matched: true },
  { label: 'Otoparklı', matched: true },
  { label: 'Asansörlü', matched: false },
]

describe('GlassMatchScore', () => {
  it('varsayılan başlıkla meter rolü + aria değer sözleşmesiyle render olur', () => {
    render(<GlassMatchScore value={82} />)
    const meter = screen.getByRole('meter', { name: 'Sana Uygunluk' })
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
    expect(meter.getAttribute('aria-valuenow')).toBe('82')
  })

  it('value [0,100] aralığına clamp edilir; NaN/Infinity 0’a düşer', () => {
    const { unmount: u1 } = render(<GlassMatchScore value={140} title="Uyum" />)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('100')
    u1()

    const { unmount: u2 } = render(<GlassMatchScore value={-30} title="Uyum" />)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('0')
    u2()

    render(<GlassMatchScore value={NaN} title="Uyum" />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('aria-valuenow')).toBe('0')
    expect(screen.getByText('0')).toBeTruthy()
  })

  it('otomatik renk eşiği meter üzerinde data-tone olarak yansır', () => {
    const { unmount: u1 } = render(<GlassMatchScore value={90} title="A" />)
    expect(screen.getByRole('meter').dataset.tone).toBe('success')
    u1()

    const { unmount: u2 } = render(<GlassMatchScore value={55} title="B" />)
    expect(screen.getByRole('meter').dataset.tone).toBe('accent')
    u2()

    render(<GlassMatchScore value={20} title="C" />)
    expect(screen.getByRole('meter').dataset.tone).toBe('danger')
  })

  it('explanation verilince card varyantında aria-describedby ile bağlanır', () => {
    render(<GlassMatchScore value={75} title="Uyum" explanation="Bütçene ve konum tercihine uyuyor" variant="card" />)
    const meter = screen.getByRole('meter')
    const descId = meter.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    expect(document.getElementById(descId as string)?.textContent).toBe('Bütçene ve konum tercihine uyuyor')
  })

  it('compact varyantında explanation/criteria/feedback render edilmez', () => {
    const onFeedback = vi.fn()
    render(
      <GlassMatchScore
        value={64}
        title="Uyum"
        explanation="Görünmemeli"
        criteria={criteria}
        onFeedback={onFeedback}
        variant="compact"
      />,
    )
    expect(screen.getByRole('meter').getAttribute('aria-describedby')).toBeNull()
    expect(screen.queryByText('Görünmemeli')).toBeNull()
    expect(screen.queryByText('Otoparklı')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Faydalı' })).toBeNull()
  })

  it('criteria eşleşen/eşleşmeyen chip’leri data-matched ile render eder', () => {
    render(<GlassMatchScore value={70} title="Uyum" criteria={criteria} />)
    expect(screen.getByText('3+1').closest('li')?.dataset.matched).toBe('true')
    expect(screen.getByText('Asansörlü').closest('li')?.dataset.matched).toBe('false')
  })

  it('AI rozeti daima render edilir; confidence geçerliyse metin eklenir, sonlu değilse gizlenir', () => {
    const { unmount } = render(<GlassMatchScore value={70} title="Uyum" confidence={87.6} />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.getByText('%88 güven')).toBeTruthy()
    unmount()

    render(<GlassMatchScore value={70} title="Uyum" confidence={Infinity} />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.queryByText(/güven/)).toBeNull()
  })

  it('geri bildirim butonları onFeedback’i doğru yönle çağırır ve aria-pressed görsel seçimi işaretler', () => {
    const onFeedback = vi.fn()
    render(<GlassMatchScore value={70} title="Uyum" onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })
    const down = screen.getByRole('button', { name: 'Faydalı değil' })
    expect(up.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(up)
    expect(onFeedback).toHaveBeenCalledWith('up')
    expect(up.getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(down)
    expect(onFeedback).toHaveBeenCalledWith('down')
    expect(down.getAttribute('aria-pressed')).toBe('true')
    expect(up.getAttribute('aria-pressed')).toBe('false')
  })

  it('onFeedback verilmezse geri bildirim butonları hiç render edilmez', () => {
    render(<GlassMatchScore value={70} title="Uyum" />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('loading=true iken meter/criteria/feedback yerine durum metni render edilir', () => {
    render(
      <GlassMatchScore
        value={70}
        title="Uyum"
        criteria={criteria}
        onFeedback={vi.fn()}
        loading
      />,
    )
    expect(screen.queryByRole('meter')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByText('Otoparklı')).toBeNull()
    expect(screen.getByRole('status').textContent).toBe('Uyum hesaplanıyor')
  })

  it('regresyon: eşleşmeyen kriter chip metni element-genelinde opacity ile soldurulmaz (WCAG AA kontrast)', () => {
    // jsdom gerçek CSS kurallarını hesaplamadığı için kontrastı doğrudan
    // ölçemiyoruz; kaynak CSS'te `[data-matched='false']` bloğunun metni de
    // kapsayan bir `opacity` bildirmediğini garanti ederek regresyonu
    // kaynağında kilitliyoruz (bkz. review bulgusu: opacity:0.75 zaten
    // ikincil tonda olan metni AA eşiğinin altına düşürüyordu).
    const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'GlassMatchScore.module.css')
    const css = readFileSync(cssPath, 'utf-8')
    const unmatchedBlockMatch = css.match(/\.criterion\[data-matched='false'\]\s*\{([^}]*)\}/)
    expect(unmatchedBlockMatch).not.toBeNull()
    expect(unmatchedBlockMatch![1]).not.toMatch(/opacity\s*:/)
  })
})
