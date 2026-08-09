import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlassSparkline } from './GlassSparkline'

describe('GlassSparkline', () => {
  it('erişilebilir ad yönü ve uç değerleri metin olarak taşır', () => {
    render(<GlassSparkline points={[78_400, 84_100, 91_200]} label="Göztepe · son 12 ay" />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('aria-label')).toBe("Göztepe · son 12 ay: yükseliş, 78.400'den 91.200'e")
  })

  it('yönü ilk ve son noktadan türetir', () => {
    const { container: yukari } = render(<GlassSparkline points={[10, 20]} label="a" />)
    expect(yukari.querySelector('svg')?.getAttribute('data-trend')).toBe('up')

    const { container: asagi } = render(<GlassSparkline points={[20, 10]} label="b" />)
    expect(asagi.querySelector('svg')?.getAttribute('data-trend')).toBe('down')
  })

  it('%1 altındaki değişimi yatay sayar', () => {
    const { container } = render(<GlassSparkline points={[1000, 1005]} label="c" />)
    expect(container.querySelector('svg')?.getAttribute('data-trend')).toBe('steady')
  })

  it('açık verilen trend türetmeyi geçersiz kılar', () => {
    const { container } = render(<GlassSparkline points={[10, 20]} label="d" trend="steady" />)
    expect(container.querySelector('svg')?.getAttribute('data-trend')).toBe('steady')
  })

  it('tek nokta trend anlatmaz: çizgi yerine tire ve gerekçe metni verir', () => {
    const { container } = render(<GlassSparkline points={[10]} label="Dumlupınar" />)
    expect(container.querySelector('svg')).toBeNull()
    expect(screen.getByText('Dumlupınar: trend için yeterli veri yok')).toBeTruthy()
  })

  it('çizgi nokta sayısı kadar segment üretir', () => {
    const { container } = render(<GlassSparkline points={[1, 2, 3, 4]} label="e" />)
    const d = container.querySelector('path')?.getAttribute('d') ?? ''
    expect(d.match(/L /g)).toHaveLength(3)
  })
})
