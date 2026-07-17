import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassInsightNote } from './GlassInsightNote'

describe('GlassInsightNote', () => {
  it('yazar, tarih ve içgörü metnini gösterir', () => {
    render(<GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Parsel yola sıfır." />)
    expect(screen.getByText('Elif Kaya')).toBeDefined()
    expect(screen.getByText('14 Temmuz 2026')).toBeDefined()
    expect(screen.getByText('Parsel yola sıfır.')).toBeDefined()
  })

  it('role verildiğinde gösterir, verilmediğinde render etmez', () => {
    const { rerender } = render(
      <GlassInsightNote author="Elif Kaya" role="Bölge Danışmanı" date="14 Temmuz 2026" text="Not." />,
    )
    expect(screen.getByText('Bölge Danışmanı')).toBeDefined()

    rerender(<GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Not." />)
    expect(screen.queryByText('Bölge Danışmanı')).toBeNull()
  })

  it('verified=true iken "Yerinde inceledi" rozetini gösterir, false/varsayılanda göstermez', () => {
    const { rerender } = render(
      <GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Not." verified />,
    )
    expect(screen.getByText('Yerinde inceledi')).toBeDefined()

    rerender(<GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Not." verified={false} />)
    expect(screen.queryByText('Yerinde inceledi')).toBeNull()

    rerender(<GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Not." />)
    expect(screen.queryByText('Yerinde inceledi')).toBeNull()
  })

  it('varsayılan variant "quote"tur ve data-variant="quote" taşır', () => {
    const { container } = render(<GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Not." />)
    expect(container.querySelector('[data-variant="quote"]')).not.toBeNull()
  })

  it('variant="inline" iken data-variant="inline" taşır', () => {
    const { container } = render(
      <GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Not." variant="inline" />,
    )
    expect(container.querySelector('[data-variant="inline"]')).not.toBeNull()
  })

  it('kök element bir <article>tir', () => {
    const { container } = render(<GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Not." />)
    expect(container.querySelector('article')).not.toBeNull()
  })

  it('avatarSrc verildiğinde GlassAvatar görselini render eder', () => {
    const { container } = render(
      <GlassInsightNote
        author="Elif Kaya"
        date="14 Temmuz 2026"
        text="Not."
        avatarSrc="https://example.com/avatar.jpg"
      />,
    )
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('https://example.com/avatar.jpg')
  })

  it('avatar sarmalayıcısı aria-hidden olduğundan yazar adı erişilebilirlik ağacında yalnız bir kez duyurulur', () => {
    render(<GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Not." />)
    // GlassAvatar (src verilmediğinde) baş harf fallback'ini role="img" +
    // aria-label={author} olarak render eder — sarmalayıcı aria-hidden
    // olmasaydı bu, başlıktaki "Elif Kaya" metniyle birlikte ikinci bir
    // erişilebilir "Elif Kaya" duyurusu üretirdi.
    expect(screen.queryByRole('img', { name: 'Elif Kaya' })).toBeNull()
    expect(screen.getByText('Elif Kaya')).toBeDefined()
  })

  it('className prop birleştirilir', () => {
    const { container } = render(
      <GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Not." className="ozel-sinif" />,
    )
    expect(container.querySelector('.ozel-sinif')).not.toBeNull()
  })

  it('...rest HTML özniteliklerini kök elemente iletir', () => {
    render(<GlassInsightNote author="Elif Kaya" date="14 Temmuz 2026" text="Not." data-testid="not-karti" />)
    expect(screen.getByTestId('not-karti')).toBeDefined()
  })
})
