import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { presets } from './presets'
import { useGlassPress } from './useGlassPress'

describe('presets', () => {
  it("pressLiquefy displacement çarpanı 1'den büyük, transform 1'den küçük", () => {
    expect(presets.pressLiquefy.displacementScale).toBeGreaterThan(1)
    expect(presets.pressLiquefy.transformScale).toBeLessThan(1)
  })
})

describe('useGlassPress', () => {
  it('başlangıç değerleri nötr', () => {
    const { result } = renderHook(() => useGlassPress())
    expect(result.current.displacementScale.get()).toBe(1)
    expect(result.current.transformScale.get()).toBe(1)
  })

  it('pointer down/up event nesnesi olmadan güvenle çağrılabilir', () => {
    const { result } = renderHook(() => useGlassPress())
    act(() => result.current.handlers.onPointerDown())
    act(() => result.current.handlers.onPointerUp())
    act(() => result.current.handlers.onPointerCancel())
    expect(result.current.transformScale).toBeDefined()
  })

  it('disabled iken pointer down hiçbir şeyi değiştirmez', () => {
    const { result } = renderHook(() => useGlassPress({ disabled: true }))
    act(() => result.current.handlers.onPointerDown())
    expect(result.current.displacementScale.getVelocity()).toBe(0)
    expect(result.current.transformScale.get()).toBe(1)
  })
})
