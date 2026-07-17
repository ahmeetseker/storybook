import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassLoanCalculator } from './GlassLoanCalculator'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderCalc = (props: Partial<ComponentProps<typeof GlassLoanCalculator>> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassLoanCalculator {...props} />
    </GlassTierProvider>,
  )

describe('GlassLoanCalculator', () => {
  it('varsayılan değerlerle anüite formülüne göre aylık taksiti hesaplar', () => {
    // P = 4.250.000 * 0.8 = 3.400.000, r = 0.0279, n = 120
    // taksit = P·r·(1+r)^n / ((1+r)^n − 1)
    const r = 0.0279
    const n = 120
    const P = 3400000
    const factor = (1 + r) ** n
    const expected = Math.round((P * r * factor) / (factor - 1))

    renderCalc({
      defaultPrice: 4250000,
      defaultDownPaymentPercent: 20,
      defaultTermYears: 10,
      defaultMonthlyRatePercent: 2.79,
    })

    const formatted = `${expected.toLocaleString('tr-TR')} TL`
    expect(screen.getByText(formatted)).toBeTruthy()
  })

  it('faiz oranı sıfırken taksit basit bölüme döner (P/n)', () => {
    renderCalc({
      defaultPrice: 5000000,
      defaultDownPaymentPercent: 30,
      defaultTermYears: 5,
      defaultMonthlyRatePercent: 0,
    })
    // P = 3.500.000, n = 60 → taksit = 58.333,33 → yuvarlanmış 58.333
    const expected = Math.round(3500000 / 60)
    expect(screen.getByText(`${expected.toLocaleString('tr-TR')} TL`)).toBeTruthy()
  })

  it('variant="full" başlığı ve tüm giriş kontrollerini render eder', () => {
    renderCalc({ title: 'Konut Kredisi Hesaplama' })
    expect(screen.getByRole('heading', { name: 'Konut Kredisi Hesaplama' })).toBeTruthy()
    expect(screen.getByLabelText('Konut Fiyatı')).toBeTruthy()
    expect(screen.getByLabelText('Aylık Faiz Oranı')).toBeTruthy()
    expect(screen.getByRole('slider', { name: 'Peşinat yüzdesi' })).toBeTruthy()
    expect(screen.getByRole('slider', { name: 'Vade — yıl' })).toBeTruthy()
  })

  it('variant="compact" başlık ve girişleri gizler, yalnız taksit + CTA gösterir', () => {
    renderCalc({ variant: 'compact', ctaLabel: 'Hemen Başvur' })
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.queryByLabelText('Konut Fiyatı')).toBeNull()
    expect(screen.getByText('Aylık Taksit')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Hemen Başvur' })).toBeTruthy()
  })

  it('peşinat slider değişince kredi tutarı ve taksit yeniden hesaplanır', () => {
    renderCalc({
      defaultPrice: 4250000,
      defaultDownPaymentPercent: 20,
      defaultTermYears: 10,
      defaultMonthlyRatePercent: 2.79,
    })
    const slider = screen.getByRole('slider', { name: 'Peşinat yüzdesi' })
    fireEvent.change(slider, { target: { value: '50' } })

    // P = 4.250.000 * 0.5 = 2.125.000
    expect(screen.getByText('2.125.000 TL')).toBeTruthy()
  })

  it('onChange her hesap değişiminde güncel sonucu (mount dahil) döner', () => {
    const onChange = vi.fn()
    renderCalc({
      defaultPrice: 4250000,
      defaultDownPaymentPercent: 20,
      defaultTermYears: 10,
      defaultMonthlyRatePercent: 2.79,
      onChange,
    })
    expect(onChange).toHaveBeenCalled()
    const firstCall = onChange.mock.calls[0][0]
    expect(firstCall.loanAmount).toBe(3400000)
    expect(firstCall.termMonths).toBe(120)

    onChange.mockClear()
    const slider = screen.getByRole('slider', { name: 'Vade — yıl' })
    fireEvent.change(slider, { target: { value: '5' } })
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall.termMonths).toBe(60)
  })

  it('CTA butonuna tıklanınca onCtaClick tetiklenir', () => {
    const onCtaClick = vi.fn()
    renderCalc({ onCtaClick, ctaLabel: 'Kredi Başvurusu Yap' })
    fireEvent.click(screen.getByRole('button', { name: 'Kredi Başvurusu Yap' }))
    expect(onCtaClick).toHaveBeenCalledTimes(1)
  })

  it('anapara/faiz oranı çubuğu role="img" ve metinsel özet taşır', () => {
    renderCalc({
      defaultPrice: 4250000,
      defaultDownPaymentPercent: 20,
      defaultTermYears: 10,
      defaultMonthlyRatePercent: 2.79,
    })
    const bar = screen.getByRole('img')
    expect(bar.getAttribute('aria-label')).toMatch(/anapara/i)
    expect(bar.getAttribute('aria-label')).toMatch(/faiz/i)
  })

  it('konut fiyatı girişine yazınca tr-TR biçimli değer görünür ve kredi tutarı güncellenir', () => {
    renderCalc({ defaultPrice: 0, defaultDownPaymentPercent: 20, defaultTermYears: 10, defaultMonthlyRatePercent: 2.79 })
    const priceInput = screen.getByLabelText('Konut Fiyatı') as HTMLInputElement
    fireEvent.change(priceInput, { target: { value: '3000000' } })
    expect(priceInput.value).toBe('3.000.000')
    // P = 3.000.000 * 0.8 = 2.400.000
    expect(screen.getByText('2.400.000 TL')).toBeTruthy()
  })

  it('faiz girişine eksi işareti yazılırsa görünen metin ve hesaplanan değer birbiriyle tutarlı olur (negatif giriş yasak)', () => {
    renderCalc({ defaultPrice: 5000000, defaultDownPaymentPercent: 30, defaultTermYears: 5, defaultMonthlyRatePercent: 2.79 })
    const rateInput = screen.getByLabelText('Aylık Faiz Oranı') as HTMLInputElement
    fireEvent.change(rateInput, { target: { value: '-2' } })
    // Eksi işareti elenir; ekranda görünen "2" ile hesap için kullanılan oran (2) aynı sayıdır.
    expect(rateInput.value).toBe('2')
    // P = 3.500.000, r = 0.02, n = 60
    const r = 0.02
    const n = 60
    const P = 3500000
    const factor = (1 + r) ** n
    const expected = Math.round((P * r * factor) / (factor - 1))
    expect(screen.getByText(`${expected.toLocaleString('tr-TR')} TL`)).toBeTruthy()
  })

  it('faiz girişine "e" (bilimsel gösterim) yazılırsa karakter elenir, görünen ve hesaplanan sayı eşleşir', () => {
    renderCalc({ defaultPrice: 5000000, defaultDownPaymentPercent: 30, defaultTermYears: 5, defaultMonthlyRatePercent: 2.79 })
    const rateInput = screen.getByLabelText('Aylık Faiz Oranı') as HTMLInputElement
    fireEvent.change(rateInput, { target: { value: '1e2' } })
    // "e" elenir; "1" ve "2" rakamları birleşip "12" olarak hem görünür hem hesaplanır (100 değil).
    expect(rateInput.value).toBe('12')
    // Blur'dan ÖNCE henüz kıskaçlanmaz: r = 0.12 ile hesaplanmalı (görünen değerle birebir tutarlı).
    const r = 0.12
    const n = 60
    const P = 3500000
    const factor = (1 + r) ** n
    const expected = Math.round((P * r * factor) / (factor - 1))
    expect(screen.getByText(`${expected.toLocaleString('tr-TR')} TL`)).toBeTruthy()
  })

  it('faiz girişi birden fazla ayraç/geçersiz karakter içerirse tek ayraca indirgenir', () => {
    renderCalc({ defaultPrice: 5000000, defaultDownPaymentPercent: 30, defaultTermYears: 5, defaultMonthlyRatePercent: 2.79 })
    const rateInput = screen.getByLabelText('Aylık Faiz Oranı') as HTMLInputElement
    fireEvent.change(rateInput, { target: { value: '2,7.9abc' } })
    expect(rateInput.value).toBe('2,79')
  })

  it('faiz girişi alan odağını kaybedince üst sınırın (10) üzerindeki değeri kıskaçlar ve metni günceller', () => {
    renderCalc({ defaultPrice: 5000000, defaultDownPaymentPercent: 30, defaultTermYears: 5, defaultMonthlyRatePercent: 2.79 })
    const rateInput = screen.getByLabelText('Aylık Faiz Oranı') as HTMLInputElement
    fireEvent.change(rateInput, { target: { value: '15' } })
    fireEvent.blur(rateInput)
    expect(rateInput.value).toBe('10')
    // r = 0.10 ile hesaplanmalı
    const r = 0.1
    const n = 60
    const P = 3500000
    const factor = (1 + r) ** n
    const expected = Math.round((P * r * factor) / (factor - 1))
    expect(screen.getByText(`${expected.toLocaleString('tr-TR')} TL`)).toBeTruthy()
  })

  it('faiz girişi alan odağını kaybedince alt sınırın (0.01) altındaki sıfır olmayan değeri kıskaçlar', () => {
    renderCalc({ defaultPrice: 5000000, defaultDownPaymentPercent: 30, defaultTermYears: 5, defaultMonthlyRatePercent: 2.79 })
    const rateInput = screen.getByLabelText('Aylık Faiz Oranı') as HTMLInputElement
    fireEvent.change(rateInput, { target: { value: '0,001' } })
    fireEvent.blur(rateInput)
    expect(rateInput.value).toBe('0,01')
  })
})
