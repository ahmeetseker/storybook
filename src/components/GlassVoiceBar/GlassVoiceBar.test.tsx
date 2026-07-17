import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassVoiceBar } from './GlassVoiceBar'

describe('GlassVoiceBar', () => {
  it('idle durumunda "Sesle ara, sesli aramayı başlat" erişilebilir adıyla render olur, aria-pressed false ve ipucu görünür', () => {
    render(<GlassVoiceBar state="idle" onStart={vi.fn()} onStop={vi.fn()} />)
    const button = screen.getByRole('button', { name: 'Sesle ara, sesli aramayı başlat' }) as HTMLButtonElement
    expect(button.getAttribute('aria-pressed')).toBe('false')
    expect(button.disabled).toBe(false)
    expect(screen.getByText('"İzmir Urla imarlı arsa" demeyi dene')).toBeTruthy()
  })

  it('idle butonuna tıklayınca onStart çağrılır, onStop çağrılmaz', () => {
    const onStart = vi.fn()
    const onStop = vi.fn()
    render(<GlassVoiceBar state="idle" onStart={onStart} onStop={onStop} />)
    fireEvent.click(screen.getByRole('button', { name: 'Sesle ara, sesli aramayı başlat' }))
    expect(onStart).toHaveBeenCalledTimes(1)
    expect(onStop).not.toHaveBeenCalled()
  })

  it('listening durumunda "Dinliyor…, sesli aramayı durdur" adıyla render olur, aria-pressed true olur ve tıklayınca onStop çağrılır', () => {
    const onStart = vi.fn()
    const onStop = vi.fn()
    render(<GlassVoiceBar state="listening" onStart={onStart} onStop={onStop} />)
    const button = screen.getByRole('button', { name: 'Dinliyor…, sesli aramayı durdur' })
    expect(button.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(button)
    expect(onStop).toHaveBeenCalledTimes(1)
    expect(onStart).not.toHaveBeenCalled()
  })

  it('processing durumunda buton disabled olur, "Çözümleniyor…, sesli arama işleniyor" adını taşır ve tıklama hiçbir callback tetiklemez', () => {
    const onStart = vi.fn()
    const onStop = vi.fn()
    render(<GlassVoiceBar state="processing" onStart={onStart} onStop={onStop} />)
    const button = screen.getByRole('button', { name: 'Çözümleniyor…, sesli arama işleniyor' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
    expect(onStart).not.toHaveBeenCalled()
    expect(onStop).not.toHaveBeenCalled()
  })

  it('WCAG 2.5.3 "Label in Name": her state için accessible name, görünür buton metnini alt string olarak içerir', () => {
    const cases: Array<{ state: 'idle' | 'listening' | 'processing'; visibleText: string }> = [
      { state: 'idle', visibleText: 'Sesle ara' },
      { state: 'listening', visibleText: 'Dinliyor…' },
      { state: 'processing', visibleText: 'Çözümleniyor…' },
    ]
    for (const { state, visibleText } of cases) {
      const { unmount } = render(<GlassVoiceBar state={state} onStart={vi.fn()} onStop={vi.fn()} />)
      const button = screen.getByText(visibleText).closest('button') as HTMLButtonElement
      expect(button).toBeTruthy()
      const accessibleName = button.getAttribute('aria-label') ?? ''
      expect(accessibleName.startsWith(visibleText)).toBe(true)
      unmount()
    }
  })

  it('durum yalnız renkle değil görünür buton metniyle de ayırt edilir (Sesle ara / Dinliyor… / Çözümleniyor…)', () => {
    const { rerender } = render(<GlassVoiceBar state="idle" onStart={vi.fn()} onStop={vi.fn()} />)
    expect(screen.getByText('Sesle ara')).toBeTruthy()

    rerender(<GlassVoiceBar state="listening" onStart={vi.fn()} onStop={vi.fn()} />)
    expect(screen.getByText('Dinliyor…')).toBeTruthy()

    rerender(<GlassVoiceBar state="processing" onStart={vi.fn()} onStop={vi.fn()} />)
    expect(screen.getByText('Çözümleniyor…')).toBeTruthy()
  })

  it('transcript doluyken state ne olursa olsun ipucu yerine transcript gösterilir', () => {
    render(
      <GlassVoiceBar
        state="listening"
        onStart={vi.fn()}
        onStop={vi.fn()}
        transcript="İzmir Urla imarlı arsa arıyorum"
      />,
    )
    expect(screen.getByText('İzmir Urla imarlı arsa arıyorum')).toBeTruthy()
    expect(screen.queryByText('"İzmir Urla imarlı arsa" demeyi dene')).toBeNull()
  })

  it('özel hint prop\'u varsayılan ipucu metnini geçersiz kılar', () => {
    render(<GlassVoiceBar state="idle" onStart={vi.fn()} onStop={vi.fn()} hint="Örn. konut al" />)
    expect(screen.getByText('Örn. konut al')).toBeTruthy()
    expect(screen.queryByText('"İzmir Urla imarlı arsa" demeyi dene')).toBeNull()
  })

  it('transkript/ipucu bölgesi aria-live="polite" ile daima aynı düğüm olarak mount kalır; processing + boş transcript içeriği katlanır', () => {
    const { container, rerender } = render(<GlassVoiceBar state="idle" onStart={vi.fn()} onStop={vi.fn()} />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeTruthy()
    expect(liveRegion?.textContent).not.toBe('')

    rerender(<GlassVoiceBar state="processing" onStart={vi.fn()} onStop={vi.fn()} />)
    const sameLiveRegion = container.querySelector('[aria-live="polite"]')
    expect(sameLiveRegion).toBe(liveRegion)
    expect(sameLiveRegion?.textContent).toBe('')
  })

  it('mikrofon ikonu dekoratiftir (aria-hidden), erişilebilir isim yalnız butonun aria-label\'ından gelir', () => {
    render(<GlassVoiceBar state="idle" onStart={vi.fn()} onStop={vi.fn()} />)
    const button = screen.getByRole('button', { name: 'Sesle ara, sesli aramayı başlat' })
    const hiddenIcon = button.querySelector('[aria-hidden="true"]')
    expect(hiddenIcon).toBeTruthy()
  })

  it('buton her zaman aria-describedby ile transkript/ipucu bölgesine bağlıdır', () => {
    render(<GlassVoiceBar state="idle" onStart={vi.fn()} onStop={vi.fn()} />)
    const button = screen.getByRole('button', { name: 'Sesle ara, sesli aramayı başlat' })
    const describedBy = button.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy as string)).toBeTruthy()
  })

  it('listening + boş transcript: ipucu gösterilmeye devam eder (transcript yalnız dolduğunda ipucunun yerini alır)', () => {
    render(<GlassVoiceBar state="listening" onStart={vi.fn()} onStop={vi.fn()} />)
    expect(screen.getByText('"İzmir Urla imarlı arsa" demeyi dene')).toBeTruthy()
  })

  it('processing + dolu transcript: ipucu değil, transcript gösterilmeye devam eder', () => {
    render(
      <GlassVoiceBar
        state="processing"
        onStart={vi.fn()}
        onStop={vi.fn()}
        transcript="İzmir Urla imarlı arsa arıyorum"
      />,
    )
    expect(screen.getByText('İzmir Urla imarlı arsa arıyorum')).toBeTruthy()
    expect(screen.queryByText('"İzmir Urla imarlı arsa" demeyi dene')).toBeNull()
  })
})
