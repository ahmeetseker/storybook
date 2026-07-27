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
    const items = screen.getAllByRole('listitem')
    const matchedItem = items.find((li) => li.textContent?.includes('3+1'))
    const unmatchedItem = items.find((li) => li.textContent?.includes('Asansörlü'))
    expect(matchedItem?.dataset.matched).toBe('true')
    expect(unmatchedItem?.dataset.matched).toBe('false')
  })

  it('regresyon: kriter eşleşme durumu görsel-gizli metinle AT’ye iletilir (yalnız ikon aria-hidden)', () => {
    render(<GlassMatchScore value={70} title="Uyum" criteria={criteria} />)
    const items = screen.getAllByRole('listitem')
    const matchedItem = items.find((li) => li.textContent?.includes('3+1'))
    const unmatchedItem = items.find((li) => li.textContent?.includes('Asansörlü'))

    // Görünür ikon (✓/✕) dekoratif olduğu için aria-hidden kalmalı, ama
    // eşleşme durumu metinle (AT ağacından gizlenmeyen) de taşınmalı.
    expect(matchedItem?.textContent).toContain('(eşleşti)')
    expect(unmatchedItem?.textContent).toContain('(eşleşmedi)')
    expect(matchedItem?.querySelectorAll('[aria-hidden="true"]').length).toBe(1)
    expect(unmatchedItem?.querySelectorAll('[aria-hidden="true"]').length).toBe(1)
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

  it('regresyon: aynı yöne tekrar tıklama seçimi geri alır (toggle)', () => {
    const onFeedback = vi.fn()
    render(<GlassMatchScore value={70} title="Uyum" onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })

    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')
    expect(onFeedback).toHaveBeenNthCalledWith(1, 'up')

    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('false')
    expect(onFeedback).toHaveBeenNthCalledWith(2, 'up')
    expect(onFeedback).toHaveBeenCalledTimes(2)
  })

  it('regresyon: value değişince geri bildirim seçimi sıfırlanır', () => {
    const onFeedback = vi.fn()
    const { rerender } = render(<GlassMatchScore value={70} title="Uyum" onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })
    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')

    rerender(<GlassMatchScore value={85} title="Uyum" onFeedback={onFeedback} />)
    expect(screen.getByRole('button', { name: 'Faydalı' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'Faydalı değil' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('regresyon: criteria değişince geri bildirim seçimi sıfırlanır', () => {
    const onFeedback = vi.fn()
    const { rerender } = render(<GlassMatchScore value={70} title="Uyum" criteria={criteria} onFeedback={onFeedback} />)
    const down = screen.getByRole('button', { name: 'Faydalı değil' })
    fireEvent.click(down)
    expect(down.getAttribute('aria-pressed')).toBe('true')

    const nextCriteria = [...criteria, { label: 'Bahçeli', matched: true }]
    rerender(<GlassMatchScore value={70} title="Uyum" criteria={nextCriteria} onFeedback={onFeedback} />)
    expect(screen.getByRole('button', { name: 'Faydalı değil' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('regresyon: aynı value/criteria ile yeniden render olunca geri bildirim seçimi korunur', () => {
    const onFeedback = vi.fn()
    const { rerender } = render(<GlassMatchScore value={70} title="Uyum" criteria={criteria} onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })
    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')

    // Aynı içerikle (yeni ama eşdeğer dizi referansı) tekrar render — seçim korunmalı
    rerender(<GlassMatchScore value={70} title="Uyum" criteria={[...criteria]} onFeedback={onFeedback} />)
    expect(screen.getByRole('button', { name: 'Faydalı' }).getAttribute('aria-pressed')).toBe('true')
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

  it('regresyon: loading=true iken zorunlu AI rozeti yine görünür kalır', () => {
    render(<GlassMatchScore value={70} title="Uyum" confidence={90} loading />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    // Skor henüz hesaplanmadığı için güven metni placeholder'da gösterilmez
    expect(screen.queryByText(/güven/)).toBeNull()
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

  it('regresyon: AI rozeti CSS bloğu kontrat ölçülerine (GlassAiSummaryCard .badge) hizalı', () => {
    const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'GlassMatchScore.module.css')
    const css = readFileSync(cssPath, 'utf-8')
    const badgeBlockMatch = css.match(/\.aiBadge\s*\{([^}]*)\}/)
    expect(badgeBlockMatch).not.toBeNull()
    const block = badgeBlockMatch![1]
    // Kontrat ölçüleri token/yerel değişken üzerinden ifade edilir:
    // dikey padding mikro-geometri değişkeni (3px), font boyutu badge token'ı.
    expect(block).toMatch(/padding:\s*var\(--ms-badge-pad-block\) var\(--lg-space-2\)/)
    expect(block).toMatch(/letter-spacing:\s*0\.02em/)
    expect(block).toMatch(/font-size:\s*var\(--lg-text-badge\)/)
    expect(block).toMatch(/font-weight:\s*700/)
  })
})
