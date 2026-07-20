import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassAiRiskReview } from './GlassAiRiskReview'
import type { GlassAiRiskItem } from './GlassAiRiskReview'

const mixed: GlassAiRiskItem[] = [
  { id: 'r1', title: 'Tapu-ilan alan uyuşmazlığı', severity: 'high', status: 'open', description: 'İlan 140 m², tapu 120 m².' },
  { id: 'r2', title: 'Fotoğraf metaverisi eksik', severity: 'low', status: 'open' },
  { id: 'r3', title: 'Fiyat emsalin çok altında', severity: 'medium', status: 'resolved' },
]

const mildOnly: GlassAiRiskItem[] = [
  { id: 'a', title: 'Küçük tutarsızlık', severity: 'low', status: 'open' },
  { id: 'b', title: 'Bilgi notu', severity: 'medium', status: 'resolved' },
]

describe('GlassAiRiskReview', () => {
  it('koşulsuz "✦ AI" rozeti + adlandırılmış bölüm + özet render eder', () => {
    render(<GlassAiRiskReview items={mixed} title="AI risk incelemesi" />)
    expect(screen.getByText('✦ AI')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'AI risk incelemesi' })).toBeTruthy()
    expect(screen.getByText(/2 açık risk · 1 yüksek\/engelleyici/)).toBeTruthy()
  })

  it('açık yüksek/engelleyici risk varken onay butonu kilitlenir', () => {
    render(<GlassAiRiskReview items={mixed} onApprove={() => {}} onReject={() => {}} />)
    const approve = screen.getByRole('button', { name: 'İncelemeyi onayla' })
    expect(approve).toHaveProperty('disabled', true)
    expect(screen.getByText(/ağır risk açıkken onaylanamaz/)).toBeTruthy()
  })

  it('ağır açık risk yoksa onay butonu aktif olur ve çağrılır', async () => {
    const onApprove = vi.fn()
    const user = userEvent.setup()
    render(<GlassAiRiskReview items={mildOnly} onApprove={onApprove} onReject={() => {}} />)
    const approve = screen.getByRole('button', { name: 'İncelemeyi onayla' })
    expect(approve).toHaveProperty('disabled', false)
    await user.click(approve)
    expect(onApprove).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/onaylanamaz/)).toBeNull()
  })

  it('severity ve status renk dışında metinle iletilir', () => {
    render(<GlassAiRiskReview items={mixed} />)
    expect(screen.getByText('Yüksek')).toBeTruthy()
    expect(screen.getByText('Orta')).toBeTruthy()
    expect(screen.getByText('Düşük')).toBeTruthy()
    expect(screen.getByText('Çözüldü')).toBeTruthy()
    expect(screen.getAllByText('Açık').length).toBe(2)
  })

  it('karar verilmişse aksiyon yerine karar özeti + reviewer gösterir', () => {
    render(<GlassAiRiskReview items={mixed} decision="approved" reviewer="Ayşe K." onApprove={() => {}} onReject={() => {}} />)
    expect(screen.queryByRole('button', { name: 'İncelemeyi onayla' })).toBeNull()
    expect(screen.getByText('İncelendi ve onaylandı')).toBeTruthy()
    expect(screen.getByText('İnceleyen: Ayşe K.')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toMatch(/Onaylandı/)
  })

  it('onReject callback\'i çalışır', async () => {
    const onReject = vi.fn()
    const user = userEvent.setup()
    render(<GlassAiRiskReview items={mildOnly} onApprove={() => {}} onReject={onReject} />)
    await user.click(screen.getByRole('button', { name: 'Reddet' }))
    expect(onReject).toHaveBeenCalledTimes(1)
  })

  it('callback verilmezse onay/red butonu render edilmez (false affordance yok)', () => {
    render(<GlassAiRiskReview items={mildOnly} />)
    expect(screen.queryByRole('button', { name: 'İncelemeyi onayla' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reddet' })).toBeNull()
  })

  it('boş liste güvenli mesaj (note) gösterir', () => {
    render(<GlassAiRiskReview items={[]} />)
    expect(screen.getByText(/İncelenecek risk bulunamadı/)).toBeTruthy()
  })

  it('onItemToggle ile açık riske "Çözüldü işaretle" butonu gelir', async () => {
    const onItemToggle = vi.fn()
    const user = userEvent.setup()
    render(<GlassAiRiskReview items={mixed} onItemToggle={onItemToggle} />)
    const buttons = screen.getAllByRole('button', { name: 'Çözüldü işaretle' })
    expect(buttons.length).toBe(2) // yalnız açık riskler (r1, r2)
    await user.click(buttons[0])
    expect(onItemToggle).toHaveBeenCalledWith('r1')
  })
})
