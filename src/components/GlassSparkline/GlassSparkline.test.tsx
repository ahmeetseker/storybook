import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlassSparkline } from './GlassSparkline'

// Recharts geçişi notu: role="img", aria-label ve data-trend artık kapta
// (span) yaşar — SVG'yi Recharts çizer.
const wrapper = (container: HTMLElement) => container.firstElementChild as HTMLElement

describe('GlassSparkline', () => {
  it('erişilebilir ad yönü ve uç değerleri metin olarak taşır', () => {
    render(<GlassSparkline points={[78_400, 84_100, 91_200]} label="Göztepe · son 12 ay" />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('aria-label')).toBe("Göztepe · son 12 ay: yükseliş, 78.400'den 91.200'e")
  })

  it('yönü ilk ve son noktadan türetir', () => {
    const { container: yukari } = render(<GlassSparkline points={[10, 20]} label="a" />)
    expect(wrapper(yukari).getAttribute('data-trend')).toBe('up')

    const { container: asagi } = render(<GlassSparkline points={[20, 10]} label="b" />)
    expect(wrapper(asagi).getAttribute('data-trend')).toBe('down')
  })

  it('%1 altındaki değişimi yatay sayar', () => {
    const { container } = render(<GlassSparkline points={[1000, 1005]} label="c" />)
    expect(wrapper(container).getAttribute('data-trend')).toBe('steady')
  })

  it('açık verilen trend türetmeyi geçersiz kılar', () => {
    const { container } = render(<GlassSparkline points={[10, 20]} label="d" trend="steady" />)
    expect(wrapper(container).getAttribute('data-trend')).toBe('steady')
  })

  it('tek nokta trend anlatmaz: çizgi yerine tire ve gerekçe metni verir', () => {
    const { container } = render(<GlassSparkline points={[10]} label="Dumlupınar" />)
    expect(container.querySelector('svg')).toBeNull()
    expect(screen.getByText('Dumlupınar: trend için yeterli veri yok')).toBeTruthy()
  })

  it('çizgiyi ve yalnız son noktada vurgu dairesini çizer', () => {
    const { container } = render(<GlassSparkline points={[1, 2, 3, 4]} label="e" />)
    expect(container.querySelector('.recharts-line-curve')).toBeTruthy()
    expect(container.querySelectorAll('[data-part="last-point"]')).toHaveLength(1)
  })
})
