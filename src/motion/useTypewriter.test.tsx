import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTypewriter } from './useTypewriter'

// Her timeout, effect yeniden koşunca zamanlanır — act dışına çıkmadan zincir
// ilerlemez; bu yüzden adım adım ilerletilir.
const step = (ms: number) => act(() => vi.advanceTimersByTime(ms))

describe('useTypewriter', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('metni harf harf yazar', () => {
    const { result } = renderHook(() => useTypewriter(['Urla'], { typeMs: 10 }))
    expect(result.current).toBe('')
    step(10)
    expect(result.current).toBe('U')
    step(10)
    step(10)
    step(10)
    expect(result.current).toBe('Urla')
  })

  it('tam yazınca bekler, siler ve sonraki metne geçer', () => {
    const { result } = renderHook(() => useTypewriter(['Ab', 'Cd'], { typeMs: 10, deleteMs: 5, holdMs: 50 }))
    step(10)
    step(10)
    expect(result.current).toBe('Ab')
    step(50) // hold → silme moduna geç
    step(5) // 'A'
    step(5) // ''
    expect(result.current).toBe('')
    step(5) // sonraki metne geçiş
    step(10) // 'C'
    step(10) // 'Cd'
    expect(result.current).toBe('Cd')
  })

  it('boş dizi güvenli: boş string döner', () => {
    const { result } = renderHook(() => useTypewriter([]))
    expect(result.current).toBe('')
  })
})
