import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassTrustSignalPanel, type GlassTrustSignal } from './GlassTrustSignalPanel'

const signals: GlassTrustSignal[] = [
  { id: 'eids', label: 'EİDS tapu eşleşmesi', status: 'verified', detail: '12 Temmuz 2026, kayıt 2841937465' },
  { id: 'tapu', label: 'Tapu kaydı', status: 'verified', detail: 'Tapu Müdürlüğü sorgusu eşleşti' },
  {
    id: 'moderasyon',
    label: 'AI içerik moderasyonu',
    status: 'warning',
    detail: 'İlan görselleri otomatik incelendi, bir görselde yüz tespit edildi',
    aiGenerated: true,
    confidence: 82,
  },
  { id: 'satici', label: 'Satıcı geçmişi', status: 'info', detail: '3 yıldır ArsaPazar üyesi' },
]

describe('GlassTrustSignalPanel', () => {
  it('role="list" ile render olur ve her sinyal bir listitem üretir (panel varyantı)', () => {
    render(<GlassTrustSignalPanel signals={signals} />)
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('varsayılan başlık "Güven Kontrolleri" render edilir ve section aria-labelledby ile adlandırılır', () => {
    const { container } = render(<GlassTrustSignalPanel signals={signals} />)
    const heading = screen.getByRole('heading', { level: 3, name: 'Güven Kontrolleri' })
    const section = container.querySelector('section') as HTMLElement
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id)
  })

  it('özel title verilince onu render eder ve verified sayısı otomatik özet metni üretir', () => {
    render(<GlassTrustSignalPanel signals={signals} title="Doğrulama Sonuçları" />)
    expect(screen.getByRole('heading', { level: 3, name: 'Doğrulama Sonuçları' })).toBeTruthy()
    expect(screen.getByText('2/4 doğrulama geçti')).toBeTruthy()
  })

  it('failed sinyal varsa --lg-danger vurgulu uyarı metni özet satırında görünür', () => {
    const withFailed: GlassTrustSignal[] = [
      ...signals,
      { id: 'kimlik', label: 'Kimlik doğrulama', status: 'failed', detail: 'Belge okunamadı' },
    ]
    const { container } = render(<GlassTrustSignalPanel signals={withFailed} />)
    expect(screen.getByText('2/5 doğrulama geçti')).toBeTruthy()
    expect(screen.getByText('· 1 kontrol başarısız')).toBeTruthy()
    expect(container.querySelector('[class*="alert"]')).toBeTruthy()
  })

  it('failed sinyal yoksa uyarı metni render edilmez', () => {
    render(<GlassTrustSignalPanel signals={signals} />)
    expect(screen.queryByText(/kontrol başarısız/)).toBeNull()
  })

  it('her durum ikonu role="img" + sabit aria-label taşır (yalnız renkle değil ikon+metinle)', () => {
    render(<GlassTrustSignalPanel signals={signals} />)
    expect(screen.getAllByRole('img', { name: 'Doğrulandı' })).toHaveLength(2)
    expect(screen.getByRole('img', { name: 'Uyarı' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Bilgi' })).toBeTruthy()
  })

  it('aiGenerated sinyalde AI rozeti ve güven yüzdesi görünür; diğer sinyallerde görünmez', () => {
    render(<GlassTrustSignalPanel signals={signals} />)
    const badge = screen.getByLabelText('Yapay zekâ üretimi')
    expect(badge.textContent).toBe('✦ AI')
    expect(screen.getByText('%82 güven')).toBeTruthy()
    // Toplam AI rozeti sayısı 1 olmalı (yalnız moderasyon sinyalinde aiGenerated=true)
    expect(screen.getAllByLabelText('Yapay zekâ üretimi')).toHaveLength(1)
  })

  it('confidence sonlu değilse veya aralık dışıysa güven yüzdesi gizlenir, aralık dışıysa clamp edilir', () => {
    const { unmount } = render(
      <GlassTrustSignalPanel
        signals={[{ id: 'a', label: 'A', status: 'info', aiGenerated: true, confidence: Number.NaN }]}
      />,
    )
    expect(screen.queryByText(/güven/)).toBeNull()
    unmount()

    render(
      <GlassTrustSignalPanel
        signals={[{ id: 'b', label: 'B', status: 'info', aiGenerated: true, confidence: 240 }]}
      />,
    )
    expect(screen.getByText('%100 güven')).toBeTruthy()
  })

  it('onFeedback verilirse aiGenerated satırında 👍/👎 düğmeleri görünür ve tıklanınca id+değerle çağrılır', () => {
    const onFeedback = vi.fn()
    render(<GlassTrustSignalPanel signals={signals} onFeedback={onFeedback} />)

    const up = screen.getByRole('button', { name: 'Faydalı' })
    expect(up.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(up)
    expect(onFeedback).toHaveBeenCalledWith('moderasyon', 'up')
    expect(up.getAttribute('aria-pressed')).toBe('true')
  })

  it('onFeedback verilmezse veya sinyal aiGenerated değilse geri bildirim düğmeleri render edilmez', () => {
    render(<GlassTrustSignalPanel signals={signals} />)
    expect(screen.queryByRole('button', { name: 'Faydalı' })).toBeNull()
  })

  it('compact varyantı: yalnız özet satırı + ikon dizisi render eder, detail metni görünmez', () => {
    render(<GlassTrustSignalPanel signals={signals} variant="compact" />)
    expect(screen.getByText('2/4 doğrulama geçti')).toBeTruthy()
    expect(screen.getAllByRole('img').length).toBe(4)
    expect(screen.queryByText('12 Temmuz 2026, kayıt 2841937465')).toBeNull()
  })

  it('loading=true iken aria-busy taşır ve gerçek liste yerine placeholder render edilir', () => {
    const { container } = render(<GlassTrustSignalPanel signals={signals} loading />)
    const section = container.querySelector('section') as HTMLElement
    expect(section.getAttribute('aria-busy')).toBe('true')
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.queryByText('2/4 doğrulama geçti')).toBeNull()
  })

  it('boş signals dizisi hata fırlatmadan "0/0 doğrulama geçti" render eder', () => {
    render(<GlassTrustSignalPanel signals={[]} />)
    expect(screen.getByText('0/0 doğrulama geçti')).toBeTruthy()
    expect(screen.getByRole('list').children).toHaveLength(0)
  })
})
