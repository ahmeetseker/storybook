import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { GlassToastProvider, useGlassToast, type GlassToastApi, type GlassToastOptions } from './GlassToast'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

// Bu dosya davranış/zamanlayıcı mantığını test eder, animasyon görselini değil.
// motion'ın global frame saati, real ↔ fake timer geçişlerinde ileri-geri sıçrayıp
// exit animasyonlarını asılı bırakabiliyor (AnimatePresence çıkışı hiç tamamlanmıyor).
// Resmî test anahtarı skipAnimations bunu kökten çözer (vitest dosya izolasyonu
// sayesinde yalnız bu dosyayı etkiler).
MotionGlobalConfig.skipAnimations = true

let lastId = -1
let api: GlassToastApi | undefined

function Fire({ options }: { options: GlassToastOptions }) {
  const toast = useGlassToast()
  api = toast
  return (
    <button
      type="button"
      onClick={() => {
        lastId = toast(options)
      }}
    >
      tetikle
    </button>
  )
}

const renderToast = (options: GlassToastOptions) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassToastProvider>
        <Fire options={options} />
      </GlassToastProvider>
    </GlassTierProvider>,
  )

afterEach(() => {
  vi.useRealTimers()
  api = undefined
  lastId = -1
})

describe('GlassToast', () => {
  it('toast çağrısı status rolüyle bildirimi region yığınında gösterir ve id döner', () => {
    renderToast({ title: 'İlan yayında', description: 'Passat ilanınız onaylandı.' })
    fireEvent.click(screen.getByRole('button', { name: 'tetikle' }))
    expect(screen.getByRole('region', { name: 'Bildirimler' })).toBeTruthy()
    const toast = screen.getByRole('status')
    expect(toast.textContent).toContain('İlan yayında')
    expect(toast.textContent).toContain('Passat ilanınız onaylandı.')
    expect(lastId).toBeGreaterThan(0)
  })

  it('severity danger olduğunda role="alert" verilir', () => {
    renderToast({ title: 'Mesaj gönderilemedi', severity: 'danger' })
    fireEvent.click(screen.getByRole('button', { name: 'tetikle' }))
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('duration: null kalıcıdır; Kapat butonu kapatır', async () => {
    renderToast({ title: 'İlan arşivlendi', duration: null })
    fireEvent.click(screen.getByRole('button', { name: 'tetikle' }))
    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull())
  })

  it('toast.dismiss(id) programatik kapatır (fonksiyon + metod deseni)', async () => {
    renderToast({ title: 'Fotoğraf yüklendi', duration: null })
    fireEvent.click(screen.getByRole('button', { name: 'tetikle' }))
    expect(screen.getByRole('status')).toBeTruthy()
    act(() => {
      api?.dismiss(lastId)
    })
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull())
  })

  it('action butonu onClick çağırır ve toast kapanır', async () => {
    const onAction = vi.fn()
    renderToast({ title: 'İlan silindi', duration: null, action: { label: 'Geri Al', onClick: onAction } })
    fireEvent.click(screen.getByRole('button', { name: 'tetikle' }))
    fireEvent.click(screen.getByRole('button', { name: 'Geri Al' }))
    expect(onAction).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull())
  })

  it('api referansı stabildir ve provider dışında useGlassToast fırlatır', () => {
    const apis: GlassToastApi[] = []
    function Capture() {
      apis.push(useGlassToast())
      return null
    }
    const { rerender } = render(
      <GlassToastProvider>
        <Capture />
      </GlassToastProvider>,
    )
    rerender(
      <GlassToastProvider>
        <Capture />
      </GlassToastProvider>,
    )
    expect(apis[0]).toBe(apis[1])

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Capture />)).toThrow(/GlassToastProvider/)
    spy.mockRestore()
  })

  it('süre dolunca otomatik düşer; hover sayacı duraklatır, ayrılınca yeniden kurar', async () => {
    vi.useFakeTimers()
    renderToast({ title: 'Kaydedildi' })
    fireEvent.click(screen.getByRole('button', { name: 'tetikle' }))

    // default 4000ms dolmadan düşmez
    await act(async () => {
      vi.advanceTimersByTime(3900)
    })
    expect(screen.getByRole('status')).toBeTruthy()

    // hover: sayaç iptal — süre fazlasıyla aşılsa da kalır
    // (React onMouseEnter/Leave'i mouseover/mouseout'tan sentezler → mouseOver/mouseOut kullan)
    const wrapper = screen.getByRole('status').parentElement as HTMLElement
    fireEvent.mouseOver(wrapper)
    await act(async () => {
      vi.advanceTimersByTime(10000)
    })
    expect(screen.getByRole('status')).toBeTruthy()

    // ayrılınca tam süreyle yeniden kurulur; dolunca düşer
    fireEvent.mouseOut(wrapper)
    await act(async () => {
      vi.advanceTimersByTime(4100)
    })
    await act(async () => {
      vi.advanceTimersByTime(1000) // exit/unmount karelerine pay
    })
    expect(screen.queryByRole('status')).toBeNull()
  })
})
