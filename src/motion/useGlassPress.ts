import { useMemo } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import type { PointerEvent } from 'react'
import { prefersReducedMotion } from '../core/tier'
import { presets } from './presets'

export interface GlassPressOptions {
  disabled?: boolean
}

export function useGlassPress(opts: GlassPressOptions = {}) {
  const reduced = prefersReducedMotion()
  const disabled = opts.disabled || reduced

  const displacementScale = useSpring(1, presets.springs.press)
  const transformScale = useSpring(1, presets.springs.jelly)
  const glowX = useMotionValue(0)
  const glowY = useMotionValue(0)
  const glowOpacity = useSpring(0, presets.springs.press)

  const handlers = useMemo(() => {
    const release = () => {
      if (disabled) return
      displacementScale.set(1)
      transformScale.set(1)
      glowOpacity.set(0)
    }
    return {
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        if (disabled) return
        const rect = e.currentTarget.getBoundingClientRect()
        glowX.jump(e.clientX - rect.left)
        glowY.jump(e.clientY - rect.top)
        displacementScale.set(presets.pressLiquefy.displacementScale)
        transformScale.set(presets.pressLiquefy.transformScale)
        glowOpacity.set(0.6)
      },
      onPointerUp: release,
      onPointerLeave: release,
      onPointerCancel: release,
    }
  }, [disabled, displacementScale, transformScale, glowOpacity, glowX, glowY])

  return { displacementScale, transformScale, glowX, glowY, glowOpacity, handlers }
}
