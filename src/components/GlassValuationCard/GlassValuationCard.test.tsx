import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassValuationCard } from './GlassValuationCard'

describe('GlassValuationCard', () => {
  it('group rolü + AI rozetiyle render olur, tahmin ve aralık görünür', () => {
    render(<GlassValuationCard estimate={4850000} rangeLow={4400000} rangeHigh={5300000} />)
    const group = screen.getByRole('group', { name: 'AI değerleme' })
    expect(group).toBeTruthy()
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.getByText('4.850.000 TL')).toBeTruthy()
    expect(screen.getByText('4.400.000 TL')).toBeTruthy()
    expect(screen.getByText('5.300.000 TL')).toBeTruthy()
  })

  it('rangeLow > rangeHigh verilirse sessizce takas edilir', () => {
    render(<GlassValuationCard estimate={3000000} rangeLow={3500000} rangeHigh={2500000} />)
    expect(screen.getByText('2.500.000 TL')).toBeTruthy()
    expect(screen.getByText('3.500.000 TL')).toBeTruthy()
  })

  it('estimate/range sonlu olmayan veya negatifse boş duruma düşer', () => {
    const { unmount: u1 } = render(<GlassValuationCard estimate={NaN} rangeLow={100} rangeHigh={200} />)
    expect(screen.getByText('Değerleme yok')).toBeTruthy()
    u1()

    const { unmount: u2 } = render(<GlassValuationCard estimate={-5000} rangeLow={100} rangeHigh={200} />)
    expect(screen.getByText('Değerleme yok')).toBeTruthy()
    u2()

    render(<GlassValuationCard estimate={Infinity} rangeLow={100} rangeHigh={200} />)
    expect(screen.getByText('Değerleme yok')).toBeTruthy()
  })

  it('boş durumda dahi AI rozeti görünür kalır', () => {
    render(<GlassValuationCard estimate={NaN} rangeLow={0} rangeHigh={0} />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
  })

  it('listPrice verilince gerçek yüzde farkı ve karşılaştırma metni hesaplanır', () => {
    render(<GlassValuationCard estimate={5000000} rangeLow={4500000} rangeHigh={5500000} listPrice={5500000} />)
    // (5.500.000 - 5.000.000) / 5.000.000 = %10 üstünde
    expect(screen.getByText(/%10/)).toBeTruthy()
    expect(screen.getByText(/üstünde/)).toBeTruthy()
  })

  it('listPrice tahminden düşükse "altında" metni gösterilir', () => {
    render(<GlassValuationCard estimate={5000000} rangeLow={4500000} rangeHigh={5500000} listPrice={4500000} />)
    expect(screen.getByText(/%10/)).toBeTruthy()
    expect(screen.getByText(/altında/)).toBeTruthy()
  })

  it('confidence 0-100 dışıysa clamp edilir, sonlu değilse hiç gösterilmez', () => {
    const { unmount: u1 } = render(
      <GlassValuationCard estimate={1000000} rangeLow={900000} rangeHigh={1100000} confidence={140} />,
    )
    expect(screen.getByText('%100 güven')).toBeTruthy()
    u1()

    const { unmount: u2 } = render(
      <GlassValuationCard estimate={1000000} rangeLow={900000} rangeHigh={1100000} confidence={NaN} />,
    )
    expect(screen.queryByText(/güven/)).toBeNull()
    u2()

    render(<GlassValuationCard estimate={1000000} rangeLow={900000} rangeHigh={1100000} confidence={62} />)
    expect(screen.getByText('%62 güven')).toBeTruthy()
  })

  it('onFeedback verilince 👍/👎 butonları basıldığında aria-pressed ve callback çalışır', async () => {
    const user = userEvent.setup()
    const onFeedback = vi.fn()
    render(<GlassValuationCard estimate={1000000} rangeLow={900000} rangeHigh={1100000} onFeedback={onFeedback} />)

    const up = screen.getByRole('button', { name: 'Faydalı' })
    const down = screen.getByRole('button', { name: 'Faydalı değil' })
    expect(up.getAttribute('aria-pressed')).toBe('false')
    expect(down.getAttribute('aria-pressed')).toBe('false')

    await user.click(up)
    expect(onFeedback).toHaveBeenCalledWith('up')
    expect(up.getAttribute('aria-pressed')).toBe('true')
    expect(down.getAttribute('aria-pressed')).toBe('false')

    await user.click(down)
    expect(onFeedback).toHaveBeenCalledWith('down')
    expect(down.getAttribute('aria-pressed')).toBe('true')
    expect(up.getAttribute('aria-pressed')).toBe('false')
  })

  it('onFeedback verilmezse geri bildirim butonları render edilmez', () => {
    render(<GlassValuationCard estimate={1000000} rangeLow={900000} rangeHigh={1100000} />)
    expect(screen.queryByRole('button', { name: 'Faydalı' })).toBeNull()
  })

  it('loading true iken placeholder gösterilir, gerçek tahmin metni render edilmez', () => {
    render(<GlassValuationCard estimate={1000000} rangeLow={900000} rangeHigh={1100000} loading />)
    const group = screen.getByRole('group', { name: 'AI değerleme' })
    expect(group.getAttribute('aria-busy')).toBe('true')
    expect(screen.queryByText('1.000.000 TL')).toBeNull()
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
  })

  it('inline varyant tek satırda rozet + tahmin + aralık metni gösterir', () => {
    render(
      <GlassValuationCard estimate={4850000} rangeLow={4400000} rangeHigh={5300000} variant="inline" />,
    )
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.getByText(/4\.850\.000 TL/)).toBeTruthy()
    expect(screen.getByText(/4\.400\.000 TL–5\.300\.000 TL/)).toBeTruthy()
  })
})
