import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassListingManagementCard } from './GlassListingManagementCard'

const stats = [
  { id: 'v', label: 'Görüntülenme', value: '1.284' },
  { id: 'm', label: 'Mesaj', value: '37' },
]

describe('GlassListingManagementCard', () => {
  it('article + gerçek heading olarak render olur (kart tümü button değil)', () => {
    const { container } = render(
      <GlassListingManagementCard title="Urla müstakil ev" state="live" headingAs="h2" imageSrc="/x.jpg" />,
    )
    expect(container.firstElementChild?.tagName).toBe('ARTICLE')
    expect(screen.getByRole('heading', { name: 'Urla müstakil ev', level: 2 })).toBeTruthy()
  })

  it('durum rozetini renk dışında metinle gösterir', () => {
    const { unmount } = render(<GlassListingManagementCard title="X" state="changes" imageSrc="/x.jpg" />)
    expect(screen.getByText('Değişiklik istendi')).toBeTruthy()
    unmount()
    render(<GlassListingManagementCard title="Y" state="expired" imageSrc="/x.jpg" />)
    expect(screen.getByText('Süresi doldu')).toBeTruthy()
  })

  it('issue verilince role="status" uyarı bölümü gösterir', () => {
    render(<GlassListingManagementCard title="X" state="changes" issue="Tapu belgesi eksik." />)
    const status = screen.getByRole('status')
    expect(status.textContent).toMatch(/İşlem gerekli/)
    expect(status.textContent).toMatch(/Tapu belgesi eksik/)
  })

  it('görsel yoksa temsili medya role="img" + etiketle çizilir', () => {
    render(<GlassListingManagementCard title="Urla ev" state="draft" />)
    expect(screen.getByRole('img', { name: 'Urla ev — görsel yok' })).toBeTruthy()
  })

  it('onOpen verilince başlık erişilebilir tetikleyici olur ve çalışır', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    render(<GlassListingManagementCard title="Urla ev" state="live" onOpen={onOpen} imageSrc="/x.jpg" />)
    const button = screen.getByRole('button', { name: 'Urla ev' })
    await user.click(button)
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('onOpen yoksa başlık statik kalır (buton değil)', () => {
    render(<GlassListingManagementCard title="Urla ev" state="live" imageSrc="/x.jpg" />)
    expect(screen.queryByRole('button', { name: 'Urla ev' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Urla ev' })).toBeTruthy()
  })

  it('metrikleri dl/dt/dd ile gösterir', () => {
    render(<GlassListingManagementCard title="X" state="live" stats={stats} imageSrc="/x.jpg" />)
    expect(screen.getByText('Görüntülenme').tagName).toBe('DT')
    expect(screen.getByText('1.284').tagName).toBe('DD')
  })

  it('actions slotu footer\'da render edilir', () => {
    render(
      <GlassListingManagementCard
        title="X"
        state="live"
        imageSrc="/x.jpg"
        actions={<button type="button">Düzenle</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Düzenle' })).toBeTruthy()
  })
})
