import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassAiSummaryCard } from './GlassAiSummaryCard'

const SUMMARY =
  'Bu 3+1 daire, Kadıköy Fenerbahçe mahallesinde sahil şeridine 400 metre mesafede. Bölge son bir yılda ortalama %18 değer kazandı.'

describe('GlassAiSummaryCard', () => {
  it('"AI Özeti" başlığını ve aiGenerated rozetini koşulsuz render eder', () => {
    render(<GlassAiSummaryCard summary={SUMMARY} />)
    expect(screen.getByRole('heading', { name: 'AI Özeti' })).toBeDefined()
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeDefined()
    expect(screen.getByText('✦ AI')).toBeDefined()
  })

  it('özet metnini render eder', () => {
    render(<GlassAiSummaryCard summary={SUMMARY} />)
    expect(screen.getByText(SUMMARY)).toBeDefined()
  })

  it('confidence verildiğinde "%N güven" metnini rozetin yanında gösterir', () => {
    render(<GlassAiSummaryCard summary={SUMMARY} confidence={82} />)
    expect(screen.getByText('%82 güven')).toBeDefined()
  })

  it('confidence aralık dışıysa clamp eder, sonlu değilse tamamen gizler', () => {
    const { rerender } = render(<GlassAiSummaryCard summary={SUMMARY} confidence={150} />)
    expect(screen.getByText('%100 güven')).toBeDefined()

    rerender(<GlassAiSummaryCard summary={SUMMARY} confidence={-30} />)
    expect(screen.getByText('%0 güven')).toBeDefined()

    rerender(<GlassAiSummaryCard summary={SUMMARY} confidence={Number.NaN} />)
    expect(screen.queryByText(/güven/)).toBeNull()

    rerender(<GlassAiSummaryCard summary={SUMMARY} confidence={Number.POSITIVE_INFINITY} />)
    expect(screen.queryByText(/güven/)).toBeNull()
  })

  it('pros verildiğinde "Artılar" kolonunu ve işaretlerin aria-hidden olduğunu doğrular', () => {
    render(<GlassAiSummaryCard summary={SUMMARY} pros={['Metroya yürüme mesafesi', 'Yeni yapı']} />)
    expect(screen.getByText('Artılar')).toBeDefined()
    expect(screen.getByText('Metroya yürüme mesafesi')).toBeDefined()
    const markers = screen.getAllByText('✓')
    expect(markers.length).toBeGreaterThan(0)
    markers.forEach((marker) => expect(marker.getAttribute('aria-hidden')).toBe('true'))
  })

  it('cons verilmediğinde ya da boş dizi olduğunda "Eksiler" kolonunu render etmez', () => {
    const { rerender } = render(<GlassAiSummaryCard summary={SUMMARY} pros={['Metroya yakın']} />)
    expect(screen.queryByText('Eksiler')).toBeNull()

    rerender(<GlassAiSummaryCard summary={SUMMARY} pros={['Metroya yakın']} cons={[]} />)
    expect(screen.queryByText('Eksiler')).toBeNull()
  })

  it('ne pros ne cons verilmezse yalnız özet render edilir', () => {
    const { container } = render(<GlassAiSummaryCard summary={SUMMARY} />)
    expect(container.querySelector('ul')).toBeNull()
    expect(screen.queryByText('Artılar')).toBeNull()
    expect(screen.queryByText('Eksiler')).toBeNull()
  })

  it('sourceNote default değerini gösterir, verilirse override eder', () => {
    const { rerender } = render(<GlassAiSummaryCard summary={SUMMARY} />)
    expect(screen.getByText('İlan verisi ve bölge istatistiklerinden üretildi')).toBeDefined()

    rerender(<GlassAiSummaryCard summary={SUMMARY} sourceNote="Emlak danışmanı notlarından üretildi" />)
    expect(screen.getByText('Emlak danışmanı notlarından üretildi')).toBeDefined()
    expect(screen.queryByText('İlan verisi ve bölge istatistiklerinden üretildi')).toBeNull()
  })

  it('onFeedback verildiğinde 👍/👎 butonlarını render eder, tıklanan yön aria-pressed olur ve karşılıklı dışlar', () => {
    const onFeedback = vi.fn()
    render(<GlassAiSummaryCard summary={SUMMARY} onFeedback={onFeedback} />)

    const up = screen.getByRole('button', { name: 'Faydalı' })
    const down = screen.getByRole('button', { name: 'Faydalı değil' })
    expect(up.getAttribute('aria-pressed')).toBe('false')
    expect(down.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(up)
    expect(onFeedback).toHaveBeenCalledWith('up')
    expect(up.getAttribute('aria-pressed')).toBe('true')
    expect(down.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(down)
    expect(onFeedback).toHaveBeenCalledWith('down')
    expect(up.getAttribute('aria-pressed')).toBe('false')
    expect(down.getAttribute('aria-pressed')).toBe('true')
    expect(onFeedback).toHaveBeenCalledTimes(2)
  })

  it('aynı yöne tekrar tıklama seçimi kaldırır (toggle) ve onFeedback yine çağrılır', () => {
    const onFeedback = vi.fn()
    render(<GlassAiSummaryCard summary={SUMMARY} onFeedback={onFeedback} />)

    const up = screen.getByRole('button', { name: 'Faydalı' })

    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')
    expect(onFeedback).toHaveBeenCalledTimes(1)

    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('false')
    expect(onFeedback).toHaveBeenCalledTimes(2)
    expect(onFeedback).toHaveBeenNthCalledWith(2, 'up')
  })

  it('summary değiştiğinde önceki geri bildirim seçimi sıfırlanır (yeni içerik eski aria-pressed\'i miras almaz)', () => {
    const onFeedback = vi.fn()
    const { rerender } = render(
      <GlassAiSummaryCard summary={SUMMARY} onFeedback={onFeedback} />,
    )

    const up = screen.getByRole('button', { name: 'Faydalı' })
    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')

    rerender(<GlassAiSummaryCard summary="Yepyeni bir özet metni." onFeedback={onFeedback} />)

    const upAfter = screen.getByRole('button', { name: 'Faydalı' })
    const downAfter = screen.getByRole('button', { name: 'Faydalı değil' })
    expect(upAfter.getAttribute('aria-pressed')).toBe('false')
    expect(downAfter.getAttribute('aria-pressed')).toBe('false')
  })

  it('pros/cons değiştiğinde önceki geri bildirim seçimi sıfırlanır (summary aynı kalsa bile)', () => {
    const onFeedback = vi.fn()
    const { rerender } = render(
      <GlassAiSummaryCard summary={SUMMARY} pros={['Metroya yakın']} onFeedback={onFeedback} />,
    )

    const down = screen.getByRole('button', { name: 'Faydalı değil' })
    fireEvent.click(down)
    expect(down.getAttribute('aria-pressed')).toBe('true')

    rerender(
      <GlassAiSummaryCard summary={SUMMARY} pros={['Metroya yakın', 'Yeni yapı']} onFeedback={onFeedback} />,
    )

    const downAfter = screen.getByRole('button', { name: 'Faydalı değil' })
    expect(downAfter.getAttribute('aria-pressed')).toBe('false')
  })

  it('aynı içerikle yeniden render edilmesi geri bildirim seçimini korur (gereksiz reset yok)', () => {
    const onFeedback = vi.fn()
    const { rerender } = render(
      <GlassAiSummaryCard summary={SUMMARY} onFeedback={onFeedback} />,
    )

    const up = screen.getByRole('button', { name: 'Faydalı' })
    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')

    rerender(<GlassAiSummaryCard summary={SUMMARY} onFeedback={onFeedback} />)

    expect(screen.getByRole('button', { name: 'Faydalı' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('onFeedback verilmezse geri bildirim butonları render edilmez', () => {
    render(<GlassAiSummaryCard summary={SUMMARY} />)
    expect(screen.queryByRole('button', { name: 'Faydalı' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Faydalı değil' })).toBeNull()
  })

  it('loading=true iken özeti/kolonları/geri bildirimi gizler ve aria-busy taşır, rozet yine görünür', () => {
    const onFeedback = vi.fn()
    const { container } = render(
      <GlassAiSummaryCard
        summary={SUMMARY}
        pros={['Metroya yakın']}
        confidence={90}
        onFeedback={onFeedback}
        loading
      />,
    )
    expect(screen.queryByText(SUMMARY)).toBeNull()
    expect(screen.queryByText('Artılar')).toBeNull()
    expect(screen.queryByText(/güven/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Faydalı' })).toBeNull()
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeDefined()

    const article = container.querySelector('article')
    expect(article?.getAttribute('aria-busy')).toBe('true')
  })
})
