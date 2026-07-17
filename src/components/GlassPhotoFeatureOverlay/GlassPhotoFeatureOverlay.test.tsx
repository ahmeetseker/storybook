import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassPhotoFeatureOverlay, type GlassPhotoFeatureOverlayFeature } from './GlassPhotoFeatureOverlay'

const image = { src: 'data:image/svg+xml,mutfak', alt: 'Ankastre mutfak görseli' }

const features: GlassPhotoFeatureOverlayFeature[] = [
  { id: 'ankastre', label: 'Ankastre mutfak', x: 0.3, y: 0.5, confidence: 92 },
  { id: 'tezgah', label: 'Mermer tezgah', x: 0.6, y: 0.4 },
]

describe('GlassPhotoFeatureOverlay', () => {
  it('görseli + AI rozetini + grup rolünü render eder', () => {
    render(<GlassPhotoFeatureOverlay image={image} features={features} />)
    expect(screen.getByRole('img', { name: 'Ankastre mutfak görseli' })).toBeTruthy()
    expect(screen.getByRole('group')).toBeTruthy()
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
  })

  it('her özellik için accessible name = label olan gerçek buton render eder', () => {
    render(<GlassPhotoFeatureOverlay image={image} features={features} />)
    expect(screen.getByRole('button', { name: 'Ankastre mutfak' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Mermer tezgah' })).toBeTruthy()
  })

  it('NaN/Infinity koordinatlı özellikler render edilmez; aralık dışı sonlu değerler [0,1]\'e kenetlenir', () => {
    const invalid: GlassPhotoFeatureOverlayFeature[] = [
      { id: 'a', label: 'Görünmemeli NaN', x: NaN, y: 0.5 },
      { id: 'b', label: 'Görünmemeli Infinity', x: 0.5, y: Infinity },
      { id: 'c', label: 'Kenetlenmeli AralikDisi', x: 1.4, y: -0.3 },
      { id: 'd', label: 'Görünmeli', x: 0.5, y: 0.5 },
    ]
    render(<GlassPhotoFeatureOverlay image={image} features={invalid} />)
    expect(screen.queryByRole('button', { name: 'Görünmemeli NaN' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Görünmemeli Infinity' })).toBeNull()
    // Sonlu ama aralık dışı koordinat render edilir — [0,1]'e kenetlenmiş konumda (görsel kenarında)
    expect(screen.getByRole('button', { name: 'Kenetlenmeli AralikDisi' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Görünmeli' })).toBeTruthy()
  })

  it('varsayılan: etiketler kapalı — noktalar aria-expanded=false, balon metni görünmez', () => {
    render(<GlassPhotoFeatureOverlay image={image} features={features} />)
    const dot = screen.getByRole('button', { name: 'Ankastre mutfak' })
    expect(dot.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('%92')).toBeNull()
  })

  it('"Etiketleri göster" butonu tüm noktaların varsayılan görünürlüğünü değiştirir', () => {
    const onShowLabelsChange = vi.fn()
    render(<GlassPhotoFeatureOverlay image={image} features={features} onShowLabelsChange={onShowLabelsChange} />)
    const toggle = screen.getByRole('button', { name: 'Etiketleri göster' })
    expect(toggle.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(toggle)
    expect(onShowLabelsChange).toHaveBeenCalledWith(true)
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Ankastre mutfak' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('button', { name: 'Mermer tezgah' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('bir noktaya tıklamak yalnız o noktayı global varsayılandan bağımsız açar', () => {
    render(<GlassPhotoFeatureOverlay image={image} features={features} />)
    const dot = screen.getByRole('button', { name: 'Ankastre mutfak' })
    const other = screen.getByRole('button', { name: 'Mermer tezgah' })

    fireEvent.click(dot)
    expect(dot.getAttribute('aria-expanded')).toBe('true')
    expect(other.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(dot)
    expect(dot.getAttribute('aria-expanded')).toBe('false')
  })

  it('confidence varsa balonda "%N" eki + aria-describedby ile bağlanır; yoksa hiç eklenmez', () => {
    render(<GlassPhotoFeatureOverlay image={image} features={features} defaultShowLabels />)
    const withConfidence = screen.getByRole('button', { name: 'Ankastre mutfak' })
    expect(screen.getByText('%92')).toBeTruthy()
    const descId = withConfidence.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    expect(document.getElementById(descId as string)?.textContent).toBe('%92')

    const withoutConfidence = screen.getByRole('button', { name: 'Mermer tezgah' })
    expect(withoutConfidence.getAttribute('aria-describedby')).toBeNull()
  })

  it('controlled showLabels: dahili state değişmez, yalnız onShowLabelsChange çağrılır', () => {
    const onShowLabelsChange = vi.fn()
    render(
      <GlassPhotoFeatureOverlay
        image={image}
        features={features}
        showLabels={false}
        onShowLabelsChange={onShowLabelsChange}
      />,
    )
    const toggle = screen.getByRole('button', { name: 'Etiketleri göster' })
    fireEvent.click(toggle)
    expect(onShowLabelsChange).toHaveBeenCalledWith(true)
    // Prop hâlâ false olduğundan (parent güncellemedi) buton kontrollü kalıp false görünmeli
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
  })

  it('regresyon: global toggle değişince tekil (özellik bazlı) sapmalar sıfırlanır', () => {
    render(<GlassPhotoFeatureOverlay image={image} features={features} />)
    const dot = screen.getByRole('button', { name: 'Ankastre mutfak' })
    const other = screen.getByRole('button', { name: 'Mermer tezgah' })
    const toggle = screen.getByRole('button', { name: 'Etiketleri göster' })

    // Tekil olarak yalnız 'dot' açılır (global hâlâ kapalı)
    fireEvent.click(dot)
    expect(dot.getAttribute('aria-expanded')).toBe('true')
    expect(other.getAttribute('aria-expanded')).toBe('false')

    // Global "göster"e basınca tekil sapma sıfırlanır — artık ikisi de yeni global ile aynı (açık)
    fireEvent.click(toggle)
    expect(dot.getAttribute('aria-expanded')).toBe('true')
    expect(other.getAttribute('aria-expanded')).toBe('true')
  })

  it('odaklı bir noktada Escape açık balonu kapatır (kapsayıcı-scoped, document dinleyicisi yok)', () => {
    render(<GlassPhotoFeatureOverlay image={image} features={features} />)
    const dot = screen.getByRole('button', { name: 'Ankastre mutfak' })
    fireEvent.click(dot)
    expect(dot.getAttribute('aria-expanded')).toBe('true')

    fireEvent.keyDown(dot, { key: 'Escape' })
    expect(dot.getAttribute('aria-expanded')).toBe('false')
  })

  it('özellik sayısı özet metni olarak görünür', () => {
    render(<GlassPhotoFeatureOverlay image={image} features={features} />)
    expect(screen.getByText('2 özellik tespit edildi')).toBeTruthy()
  })

  it('regresyon: children tip düzeyinde kabul edilmez — kaçak geçilse bile sessizce yutulmaz/render edilmez', () => {
    // `children` prop tipinden açıkça omit edilmiştir (bkz. rules.md §2/§4); TS bunu derleme
    // zamanında engeller. Burada tip kontrolünü bilinçli olarak atlayıp (`as any`) çalışma
    // zamanı sözleşmesini doğruluyoruz: dışarıdan sızan children component'in kendi sabit
    // anatomisini (sahne/rozet/araç çubuğu) BOZMAZ — sessiz içerik kaybı yerine, prop hiç
    // etkili olmaz çünkü kök `<div>` her zaman kendi JSX çocuklarını render eder.
    const props = { image, features, children: 'kaçak çocuk içerik' } as unknown as Parameters<
      typeof GlassPhotoFeatureOverlay
    >[0]
    render(<GlassPhotoFeatureOverlay {...props} />)
    expect(screen.queryByText('kaçak çocuk içerik')).toBeNull()
    // Component kendi sabit anatomisini yine de render etmeye devam eder.
    expect(screen.getByText('2 özellik tespit edildi')).toBeTruthy()
  })
})
