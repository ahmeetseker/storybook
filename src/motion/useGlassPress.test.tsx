import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { presets } from './presets'
import { useGlassPress } from './useGlassPress'

const pointerDown = {
  clientX: 30,
  clientY: 10,
  currentTarget: { getBoundingClientRect: () => ({ left: 10, top: 0, width: 100, height: 40 }) },
} as unknown as React.PointerEvent<HTMLElement>

describe('presets', () => {
  it('pressLiquefy displacement çarpanı 1\'den büyük, transform 1\'den küçük', () => {
    expect(presets.pressLiquefy.displacementScale).toBeGreaterThan(1)
    expect(presets.pressLiquefy.transformScale).toBeLessThan(1)
  })
})

describe('useGlassPress', () => {
  it('başlangıç değerleri nötr', () => {
    const { result } = renderHook(() => useGlassPress())
    expect(result.current.displacementScale.get()).toBe(1)
    expect(result.current.transformScale.get()).toBe(1)
    expect(result.current.glowOpacity.get()).toBe(0)
  })

  it('pointer down hedefleri basınç değerlerine çeker ve glow pozisyonunu yerleştirir', () => {
    const { result } = renderHook(() => useGlassPress())
    act(() => result.current.handlers.onPointerDown(pointerDown))
    expect(result.current.glowX.get()).toBe(20) // 30 - left 10
    expect(result.current.glowY.get()).toBe(10)
  })

  it('disabled iken pointer down hiçbir şeyi değiştirmez', () => {
    const { result } = renderHook(() => useGlassPress({ disabled: true }))
    act(() => result.current.handlers.onPointerDown(pointerDown))
    expect(result.current.glowOpacity.getVelocity()).toBe(0)
    expect(result.current.glowX.get()).toBe(0)
  })
})
