import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassSavedSearchCard } from './GlassSavedSearchCard'

const criteria = ['İzmir · Urla', '3+1', 'Bahçeli', '5–8 milyon']

describe('GlassSavedSearchCard', () => {
  it('article + gerçek heading olarak render olur (kart tümü button değil)', () => {
    const { container } = render(
      <GlassSavedSearchCard title="Urla deniz manzaralı" criteria={criteria} headingAs="h2" />,
    )
    expect(container.querySelector('article')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Urla deniz manzaralı', level: 2 })).toBeTruthy()
    // Kartın kendisi tıklanabilir bir buton DEĞİL
    expect(container.firstElementChild?.tagName).toBe('ARTICLE')
  })

  it('yeni sonuç sayısı >0 ise rozet gösterilir', () => {
    render(<GlassSavedSearchCard title="X" criteria={criteria} newResultCount={4} />)
    expect(screen.getByText(/4 yeni/)).toBeTruthy()
  })

  it('yeni sonuç 0/undefined ise rozet gösterilmez', () => {
    render(<GlassSavedSearchCard title="X" criteria={criteria} />)
    expect(screen.queryByText(/yeni/)).toBeNull()
  })

  it('alarm anahtarı uncontrolled çalışır (defaultAlertsEnabled + onAlertsChange)', async () => {
    const onAlertsChange = vi.fn()
    const user = userEvent.setup()
    render(
      <GlassSavedSearchCard
        title="X"
        criteria={criteria}
        defaultAlertsEnabled
        onAlertsChange={onAlertsChange}
      />,
    )
    const sw = screen.getByRole('switch', { name: 'Arama alarmı' })
    expect(sw.getAttribute('aria-checked')).toBe('true')
    await user.click(sw)
    expect(onAlertsChange).toHaveBeenCalledWith(false)
  })

  it('alarm callback\'i ve değeri verilmezse switch render edilmez', () => {
    render(<GlassSavedSearchCard title="X" criteria={criteria} />)
    expect(screen.queryByRole('switch')).toBeNull()
  })

  it('silme butonu bağlama duyarlı erişilebilir ad taşır', () => {
    render(<GlassSavedSearchCard title="Urla evi" criteria={criteria} onDelete={() => {}} />)
    expect(screen.getByRole('button', { name: 'Urla evi aramasını sil' })).toBeTruthy()
  })

  it('callback verilmeyen aksiyon butonları render edilmez (false affordance yok)', () => {
    render(<GlassSavedSearchCard title="X" criteria={criteria} onOpen={() => {}} />)
    expect(screen.getByRole('button', { name: 'Sonuçları aç' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Düzenle' })).toBeNull()
    expect(screen.queryByRole('button', { name: /sil/ })).toBeNull()
  })

  it('onOpen callback\'i çalışır', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    render(<GlassSavedSearchCard title="X" criteria={criteria} onOpen={onOpen} />)
    await user.click(screen.getByRole('button', { name: 'Sonuçları aç' }))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('ölçüt listesini adlandırılmış liste olarak gösterir', () => {
    render(<GlassSavedSearchCard title="X" criteria={criteria} />)
    const list = screen.getByRole('list', { name: 'Arama ölçütleri' })
    expect(list.querySelectorAll('li').length).toBe(4)
  })
})
