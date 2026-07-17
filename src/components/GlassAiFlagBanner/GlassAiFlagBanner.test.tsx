import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassAiFlagBanner } from './GlassAiFlagBanner'

describe('GlassAiFlagBanner', () => {
  it('varsayılan başlık render edilir ve severity="warning" (varsayılan) hiçbir ARIA rolü taşımaz (statik)', () => {
    const { container } = render(<GlassAiFlagBanner />)
    expect(screen.getByText('Bu ilan yapay zekâ tarafından incelemeye alındı')).toBeTruthy()
    const root = container.firstElementChild as HTMLElement
    expect(root.getAttribute('role')).toBeNull()
  })

  it('severity="info" da hiçbir rol taşımaz; yalnız severity="danger" role="alert" alır', () => {
    const { container: infoContainer } = render(<GlassAiFlagBanner severity="info" />)
    expect((infoContainer.firstElementChild as HTMLElement).getAttribute('role')).toBeNull()

    render(<GlassAiFlagBanner severity="danger" title="Şüpheli ilan" />)
    expect(screen.getByRole('alert').textContent).toContain('Şüpheli ilan')
  })

  it('severity ikonu role="img" + severity\'ye özgü sabit aria-label taşır (yalnız renkle değil ikon+metinle)', () => {
    const { rerender } = render(<GlassAiFlagBanner severity="info" />)
    expect(screen.getByRole('img', { name: 'Bilgi' })).toBeTruthy()

    rerender(<GlassAiFlagBanner severity="warning" />)
    expect(screen.getByRole('img', { name: 'Uyarı' })).toBeTruthy()

    rerender(<GlassAiFlagBanner severity="danger" />)
    expect(screen.getByRole('img', { name: 'Tehlike' })).toBeTruthy()
  })

  it('"✦ AI" rozeti koşulsuz görünür ve confidence verilince "%N güven" metni yanında görünür', () => {
    render(<GlassAiFlagBanner confidence={82} />)
    const badge = screen.getByLabelText('Yapay zekâ üretimi')
    expect(badge.textContent).toBe('✦ AI')
    expect(screen.getByText('%82 güven')).toBeTruthy()
  })

  it('confidence sonlu değilse gizlenir, aralık dışıysa [0,100]\'e clamp edilir', () => {
    const { unmount } = render(<GlassAiFlagBanner confidence={Number.NaN} />)
    expect(screen.queryByText(/güven/)).toBeNull()
    unmount()

    render(<GlassAiFlagBanner confidence={240} />)
    expect(screen.getByText('%100 güven')).toBeTruthy()
  })

  it('reasons verilince madde listesi render edilir, verilmeyince/boşsa liste render edilmez', () => {
    const { rerender } = render(
      <GlassAiFlagBanner reasons={['Fiyat bölge ortalamasının altında', 'Aynı görsel başka ilanda']} />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Fiyat bölge ortalamasının altında')).toBeTruthy()

    rerender(<GlassAiFlagBanner reasons={[]} />)
    expect(screen.queryByRole('listitem')).toBeNull()

    rerender(<GlassAiFlagBanner />)
    expect(screen.queryByRole('listitem')).toBeNull()
  })

  it('onDetails verilince "Ayrıntılar" metin aksiyonu görünür ve tıklanınca çağrılır; verilmezse render edilmez', () => {
    const onDetails = vi.fn()
    const { rerender } = render(<GlassAiFlagBanner onDetails={onDetails} />)
    const btn = screen.getByRole('button', { name: 'Ayrıntılar' })
    fireEvent.click(btn)
    expect(onDetails).toHaveBeenCalledTimes(1)

    rerender(<GlassAiFlagBanner />)
    expect(screen.queryByRole('button', { name: 'Ayrıntılar' })).toBeNull()
  })

  it('onDismiss verilince "Kapat" butonu görünür ve tıklanınca çağrılır; verilmezse render edilmez (kapanmaz)', () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<GlassAiFlagBanner onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)

    rerender(<GlassAiFlagBanner />)
    expect(screen.queryByRole('button', { name: 'Kapat' })).toBeNull()
  })

  it('onFeedback verilince 👍/👎 düğmeleri görünür, tıklanınca değerle çağrılır ve aria-pressed güncellenir', () => {
    const onFeedback = vi.fn()
    render(<GlassAiFlagBanner onFeedback={onFeedback} />)

    const up = screen.getByRole('button', { name: 'Faydalı' })
    const down = screen.getByRole('button', { name: 'Faydalı değil' })
    expect(up.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(up)
    expect(onFeedback).toHaveBeenCalledWith('up')
    expect(up.getAttribute('aria-pressed')).toBe('true')
    expect(down.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(up)
    expect(onFeedback).toHaveBeenCalledTimes(2)
    expect(up.getAttribute('aria-pressed')).toBe('false')
  })

  it('onFeedback verilmezse geri bildirim düğmeleri render edilmez', () => {
    render(<GlassAiFlagBanner />)
    expect(screen.queryByRole('button', { name: 'Faydalı' })).toBeNull()
  })

  it('loading=true iken aria-busy taşır, gerçek içerik/aksiyonlar gizlenir ama "✦ AI" rozeti kaybolmaz', () => {
    const { container } = render(
      <GlassAiFlagBanner
        loading
        description="Gizlenmesi gereken açıklama"
        reasons={['Gizlenmesi gereken gerekçe']}
        onDetails={vi.fn()}
        onFeedback={vi.fn()}
      />,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.getAttribute('aria-busy')).toBe('true')
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.queryByText('Gizlenmesi gereken açıklama')).toBeNull()
    expect(screen.queryByText('Gizlenmesi gereken gerekçe')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ayrıntılar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Faydalı' })).toBeNull()
  })

  it('loading duyurusu her zaman mount\'lu aria-live="polite" bölgede taşınır ve yalnız loading=true iken metin içerir', () => {
    const { container, rerender } = render(<GlassAiFlagBanner loading={false} />)
    const liveRegion = container.querySelector('[aria-live="polite"]') as HTMLElement
    expect(liveRegion).toBeTruthy()
    expect(liveRegion.textContent).toBe('')

    rerender(<GlassAiFlagBanner loading />)
    const sameLiveRegion = container.querySelector('[aria-live="polite"]') as HTMLElement
    expect(sameLiveRegion).toBe(liveRegion)
    expect(sameLiveRegion.textContent).toBe('Yapay zekâ incelemesi yükleniyor')
  })

  it('regresyon: "Ayrıntılar" metin rengi --flag-color\'a değil --lg-label\'a bağlı (kontrast dersi, rules.md §12)', () => {
    const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'GlassAiFlagBanner.module.css')
    const css = readFileSync(cssPath, 'utf-8')
    const blockMatch = css.match(/\.detailsAction\s*\{([^}]*)\}/)
    expect(blockMatch).not.toBeNull()
    const block = blockMatch![1]
    expect(block).toMatch(/color:\s*var\(--lg-label\)/)
    expect(block).not.toMatch(/color:\s*var\(--flag-color/)

    const hoverBlockMatch = css.match(/\.detailsAction:hover\s*\{([^}]*)\}/)
    expect(hoverBlockMatch).not.toBeNull()
    expect(hoverBlockMatch![1]).not.toMatch(/--flag-color/)
  })

  it('regresyon: aynı mount üzerinde title/description/reasons değişince önceki geri bildirim seçimi sıfırlanır (içerik-imzalı reset)', () => {
    const onFeedback = vi.fn()
    const { rerender } = render(
      <GlassAiFlagBanner
        title="A ilanı tespiti"
        reasons={['A ilanı için X sinyali']}
        onFeedback={onFeedback}
      />,
    )

    const up = screen.getByRole('button', { name: 'Faydalı' })
    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')

    // Aynı component örneği farklı bir ilanın AI tespitine geçiyor —
    // önceki seçim yeni, alakasız içeriğe miras kalmamalı.
    rerender(
      <GlassAiFlagBanner
        title="B ilanı tespiti"
        reasons={['B ilanı için Y sinyali']}
        onFeedback={onFeedback}
      />,
    )

    const upAfterReset = screen.getByRole('button', { name: 'Faydalı' })
    expect(upAfterReset.getAttribute('aria-pressed')).toBe('false')

    // Aynı içerikle tekrar render edilirse (referans değişse bile) seçim korunur.
    rerender(
      <GlassAiFlagBanner
        title="B ilanı tespiti"
        reasons={['B ilanı için Y sinyali']}
        onFeedback={onFeedback}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Faydalı' }))
    expect(screen.getByRole('button', { name: 'Faydalı' }).getAttribute('aria-pressed')).toBe('true')

    rerender(
      <GlassAiFlagBanner
        title="B ilanı tespiti"
        reasons={['B ilanı için Y sinyali']}
        onFeedback={onFeedback}
      />,
    )
    expect(screen.getByRole('button', { name: 'Faydalı' }).getAttribute('aria-pressed')).toBe('true')
  })
})
