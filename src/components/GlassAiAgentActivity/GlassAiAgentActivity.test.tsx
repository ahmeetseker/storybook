import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassAiAgentActivity } from './GlassAiAgentActivity'
import type { GlassAgentActivityEntry } from './GlassAiAgentActivity'

const entries: GlassAgentActivityEntry[] = [
  { id: 'e1', title: 'İlan verileri tarandı', status: 'done', toolLabel: 'search', timeLabel: '10:02' },
  { id: 'e2', title: 'Fiyat analizi çalışıyor', status: 'running', toolLabel: 'valuation' },
  { id: 'e3', title: 'Satıcıya mesaj gönderilecek', status: 'needsApproval', detail: 'Taslak hazır; onayınız gerekiyor.', technical: 'POST /messages' },
]

describe('GlassAiAgentActivity', () => {
  it('koşulsuz "✦ AI" rozeti + role="log" canlı akış render eder', () => {
    render(<GlassAiAgentActivity entries={entries} title="AI ajan etkinliği" />)
    expect(screen.getByText('✦ AI')).toBeTruthy()
    const log = screen.getByRole('log', { name: 'Ajan işlem günlüğü' })
    expect(log.getAttribute('aria-live')).toBe('polite')
  })

  it('durum renk dışında metinle iletilir', () => {
    render(<GlassAiAgentActivity entries={entries} />)
    expect(screen.getByText('Tamamlandı')).toBeTruthy()
    expect(screen.getByText('Çalışıyor')).toBeTruthy()
    expect(screen.getByText('İzin bekliyor')).toBeTruthy()
  })

  it('needsApproval girişte izin ver/reddet callback\'leri çalışır', async () => {
    const onApprove = vi.fn()
    const onReject = vi.fn()
    const user = userEvent.setup()
    render(<GlassAiAgentActivity entries={entries} onApprove={onApprove} onReject={onReject} />)
    await user.click(screen.getByRole('button', { name: 'İzin ver' }))
    expect(onApprove).toHaveBeenCalledWith('e3')
    await user.click(screen.getByRole('button', { name: 'Reddet' }))
    expect(onReject).toHaveBeenCalledWith('e3')
  })

  it('callback verilmezse izin/reddet butonu render edilmez (false affordance yok)', () => {
    render(<GlassAiAgentActivity entries={entries} />)
    expect(screen.queryByRole('button', { name: 'İzin ver' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reddet' })).toBeNull()
  })

  it('çalışan işlem + onStop verilince "durdur" butonu görünür ve çalışır', async () => {
    const onStop = vi.fn()
    const user = userEvent.setup()
    render(<GlassAiAgentActivity entries={entries} onStop={onStop} />)
    await user.click(screen.getByRole('button', { name: 'Çalışmayı durdur' }))
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('çalışan/sırada işlem yoksa durdur butonu görünmez', () => {
    render(
      <GlassAiAgentActivity
        entries={[{ id: 'x', title: 'Bitti', status: 'done' }]}
        onStop={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Çalışmayı durdur' })).toBeNull()
  })

  it('teknik detay details/summary içinde gösterilir', () => {
    render(<GlassAiAgentActivity entries={entries} />)
    expect(screen.getByText('Teknik detay').tagName).toBe('SUMMARY')
    expect(screen.getByText('POST /messages')).toBeTruthy()
  })

  it('boş akışta bilgilendirme mesajı gösterir', () => {
    render(<GlassAiAgentActivity entries={[]} />)
    expect(screen.queryByRole('log')).toBeNull()
    expect(screen.getByText(/Henüz bir ajan işlemi başlatılmadı/)).toBeTruthy()
  })

  it('kalıcı yetki notunu gösterir (varsayılan)', () => {
    render(<GlassAiAgentActivity entries={entries} />)
    expect(screen.getByText(/izin vermeden ilan yayınlamaz/)).toBeTruthy()
  })

  it('aktif işlem varken aria-busy taşır', () => {
    const { container } = render(<GlassAiAgentActivity entries={entries} />)
    expect(container.querySelector('section')?.getAttribute('aria-busy')).toBe('true')
  })
})
