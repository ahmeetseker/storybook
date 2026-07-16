import { useMemo } from 'react'
import { useSpring } from 'motion/react'
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

  const handlers = useMemo(() => {
    const release = () => {
      if (disabled) return
      displacementScale.set(1)
      transformScale.set(1)
    }
    return {
      onPointerDown: () => {
        if (disabled) return
        displacementScale.set(presets.pressLiquefy.displacementScale)
        transformScale.set(presets.pressLiquefy.transformScale)
      },
      onPointerUp: release,
      onPointerLeave: release,
      onPointerCancel: release,
    }
  }, [disabled, displacementScale, transformScale])

  return { displacementScale, transformScale, handlers }
}
