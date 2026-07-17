import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassReviewCard } from './GlassReviewCard'

describe('GlassReviewCard', () => {
  it('yazar, tarih ve yorum metnini gösterir', () => {
    render(<GlassReviewCard author="Elif Kaya" rating={4} date="12 Mayıs 2026" text="Satıcı çok ilgiliydi." />)
    expect(screen.getByText('Elif Kaya')).toBeDefined()
    expect(screen.getByText('12 Mayıs 2026')).toBeDefined()
    expect(screen.getByText('Satıcı çok ilgiliydi.')).toBeDefined()
  })

  it('puanı role="img" + tam sayı aria-label ile duyurur', () => {
    render(<GlassReviewCard author="Elif Kaya" rating={4} date="12 Mayıs 2026" text="İlgiliydi." />)
    expect(screen.getByRole('img', { name: '5 üzerinden 4 yıldız' })).toBeDefined()
  })

  it('ondalık puanı virgüllü Türkçe biçimle duyurur', () => {
    render(<GlassReviewCard author="Elif Kaya" rating={3.5} date="12 Mayıs 2026" text="Fena değil." />)
    expect(screen.getByRole('img', { name: '5 üzerinden 3,5 yıldız' })).toBeDefined()
  })

  it('aralık dışı puanı sessizce clamp eder (negatif → 0, 5 üstü → 5)', () => {
    const { rerender } = render(<GlassReviewCard author="A" rating={-2} date="1 Ocak 2026" text="x" />)
    expect(screen.getByRole('img', { name: '5 üzerinden 0 yıldız' })).toBeDefined()

    rerender(<GlassReviewCard author="A" rating={9} date="1 Ocak 2026" text="x" />)
    expect(screen.getByRole('img', { name: '5 üzerinden 5 yıldız' })).toBeDefined()
  })

  it('verified=true iken "Doğrulanmış görüşme" rozetini gösterir, false iken göstermez', () => {
    const { rerender } = render(
      <GlassReviewCard author="Elif Kaya" rating={5} date="12 Mayıs 2026" text="Harika." verified />,
    )
    expect(screen.getByText('Doğrulanmış görüşme')).toBeDefined()

    rerender(<GlassReviewCard author="Elif Kaya" rating={5} date="12 Mayıs 2026" text="Harika." verified={false} />)
    expect(screen.queryByText('Doğrulanmış görüşme')).toBeNull()
  })

  it('onHelpful verildiğinde gerçek bir buton render eder ve tıklanınca çağrılır', () => {
    const onHelpful = vi.fn()
    render(
      <GlassReviewCard
        author="Elif Kaya"
        rating={5}
        date="12 Mayıs 2026"
        text="Harika."
        helpfulCount={12}
        onHelpful={onHelpful}
      />,
    )
    const button = screen.getByRole('button', { name: 'Faydalı (12)' })
    fireEvent.click(button)
    expect(onHelpful).toHaveBeenCalledTimes(1)
  })

  it('onHelpful yokken helpfulCount verilirse tıklanamaz düz metin gösterir (sahte buton yok)', () => {
    render(<GlassReviewCard author="Elif Kaya" rating={5} date="12 Mayıs 2026" text="Harika." helpfulCount={7} />)
    expect(screen.getByText('Faydalı (7)')).toBeDefined()
    expect(screen.queryByRole('button', { name: /Faydalı/ })).toBeNull()
  })

  it('ne helpfulCount ne onHelpful verilmezse aksiyon alanı render edilmez', () => {
    const { container } = render(<GlassReviewCard author="Elif Kaya" rating={5} date="12 Mayıs 2026" text="Harika." />)
    expect(screen.queryByText(/Faydalı/)).toBeNull()
    expect(container.querySelector('[class*="actions"]')).toBeNull()
  })

  it('variant="compact" iken data-variant="compact" taşır ve tek satır özet render eder', () => {
    const { container } = render(
      <GlassReviewCard author="Elif Kaya" rating={4} date="12 Mayıs 2026" text="Kısa özet." variant="compact" />,
    )
    expect(container.querySelector('[data-variant="compact"]')).not.toBeNull()
  })

  it('avatarSrc verildiğinde GlassAvatar görseli render eder', () => {
    const { container } = render(
      <GlassReviewCard
        author="Elif Kaya"
        avatarSrc="https://example.com/avatar.jpg"
        rating={4}
        date="12 Mayıs 2026"
        text="İlgiliydi."
      />,
    )
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('https://example.com/avatar.jpg')
  })

  it('avatar sarmalayıcısı aria-hidden olduğundan yazar adı erişilebilirlik ağacında yalnız bir kez duyurulur', () => {
    const { container } = render(
      <GlassReviewCard author="Elif Kaya" rating={4} date="12 Mayıs 2026" text="İlgiliydi." />,
    )
    // GlassAvatar (src verilmediğinde) baş harf fallback'ini role="img" +
    // aria-label={author} olarak render eder — sarmalayıcı aria-hidden
    // olmasaydı bu, başlıktaki "Elif Kaya" metniyle birlikte ikinci bir
    // erişilebilir "Elif Kaya" duyurusu üretirdi.
    expect(screen.queryByRole('img', { name: 'Elif Kaya' })).toBeNull()
    expect(screen.getByText('Elif Kaya')).toBeDefined()
    const avatarAccessibleNode = container.querySelector('[aria-label="Elif Kaya"]')
    expect(avatarAccessibleNode).not.toBeNull()
    expect(avatarAccessibleNode?.closest('[aria-hidden="true"]')).not.toBeNull()
  })
})
