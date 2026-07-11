import { useEffect, useRef } from 'react'
import type { MotionValue } from 'motion/react'

export interface GlassFilterProps {
  id: string
  width: number
  height: number
  displacementMapUrl: string
  maxDisplacement: number
  specularMapUrl?: string | null
  scaleValue?: MotionValue<number>
  blur?: number
  saturation?: number
}

export function GlassFilter({
  id,
  width,
  height,
  displacementMapUrl,
  maxDisplacement,
  specularMapUrl,
  scaleValue,
  blur = 0.8,
  saturation = 4,
}: GlassFilterProps) {
  const dispRef = useRef<SVGFEDisplacementMapElement>(null)

  useEffect(() => {
    if (!scaleValue) return
    return scaleValue.on('change', (v) => {
      dispRef.current?.setAttribute('scale', String(maxDisplacement * v))
    })
  }, [scaleValue, maxDisplacement])

  return (
    <svg aria-hidden width="0" height="0" style={{ position: 'absolute' }} colorInterpolationFilters="sRGB">
      <filter id={id} x="0" y="0" width={width} height={height} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse">
        <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred" />
        <feImage href={displacementMapUrl} x={0} y={0} width={width} height={height} result="map" />
        <feDisplacementMap
          ref={dispRef}
          in="blurred"
          in2="map"
          scale={maxDisplacement}
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        <feColorMatrix in="displaced" type="saturate" values={String(saturation)} result="saturated" />
        {specularMapUrl ? (
          <>
            <feImage href={specularMapUrl} x={0} y={0} width={width} height={height} result="spec" />
            <feComposite in="saturated" in2="spec" operator="in" result="specSat" />
            <feComponentTransfer in="spec" result="specFaded">
              <feFuncA type="linear" slope="0.25" />
            </feComponentTransfer>
            <feBlend in="specSat" in2="displaced" mode="normal" result="withSat" />
            <feBlend in="specFaded" in2="withSat" mode="normal" />
          </>
        ) : null}
      </filter>
    </svg>
  )
}
