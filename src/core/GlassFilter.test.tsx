import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { GlassFilter } from './GlassFilter'

const base = {
  id: 'glass-x',
  width: 200,
  height: 60,
  displacementMapUrl: 'data:image/png;base64,AAA',
  maxDisplacement: 40,
}

describe('GlassFilter', () => {
  it('filter ve feDisplacementMap doğru attribute\'larla render olur', () => {
    const { container } = render(<GlassFilter {...base} />)
    const filter = container.querySelector('filter')
    expect(filter?.getAttribute('id')).toBe('glass-x')
    const disp = container.querySelector('feDisplacementMap')
    expect(disp?.getAttribute('scale')).toBe('40')
    expect(disp?.getAttribute('xChannelSelector')).toBe('R')
    expect(disp?.getAttribute('yChannelSelector')).toBe('G')
  })

  it('specular yokken feComposite render olmaz, varken olur', () => {
    const { container, rerender } = render(<GlassFilter {...base} />)
    expect(container.querySelector('feComposite')).toBeNull()
    rerender(<GlassFilter {...base} specularMapUrl="data:image/png;base64,BBB" />)
    expect(container.querySelector('feComposite')).not.toBeNull()
  })

  it('feImage boyutları elemana eşit (filtre otomatik ölçeklenmez)', () => {
    const { container } = render(<GlassFilter {...base} />)
    const img = container.querySelector('feImage')
    expect(img?.getAttribute('width')).toBe('200')
    expect(img?.getAttribute('height')).toBe('60')
  })
})
