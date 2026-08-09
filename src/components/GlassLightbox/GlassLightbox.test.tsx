import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassLightbox } from './GlassLightbox'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const images = [
  { src: 'data:image/svg+xml,a', alt: 'Ön görünüm' },
  { src: 'data:image/svg+xml,b', alt: 'Yan görünüm' },
  { src: 'data:image/svg+xml,c', alt: 'Arka görünüm' },
]

const renderLightbox = (props: Partial<React.ComponentProps<typeof GlassLightbox>> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassLightbox open onClose={() => {}} images={images} {...props} />
    </GlassTierProvider>,
  )

/** Tetikleyicisi olan gerçek akış: focus dönüşü ancak böyle sınanabilir. */
function Harness({ onIndexChange }: { onIndexChange?: (index: number) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <GlassTierProvider tier="fallback">
      <button type="button" onClick={() => setOpen(true)}>
        Aç
      </button>
      <GlassLightbox
        open={open}
        onClose={() => setOpen(false)}
        images={images}
        defaultIndex={1}
        onIndexChange={onIndexChange}
      />
    </GlassTierProvider>
  )
}

describe('GlassLightbox', () => {
  it('açıkken dialog kurar; kare, sayaç ve şerit görünür', () => {
    renderLightbox()
    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-label')).toContain('Görsel 1 / 3: Ön görünüm')
    expect(screen.getByText('1 / 3')).toBeDefined()
    expect(screen.getByRole('button', { name: '3. görsele git: Arka görünüm' })).toBeDefined()
  })

  it('kapalıyken hiçbir şey render etmez', () => {
    renderLightbox({ open: false })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('görsel yoksa açıkken bile dialog kurmaz', () => {
    renderLightbox({ images: [] })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('ok butonları gezinir ve uçlarda sarar', () => {
    const onIndexChange = vi.fn()
    renderLightbox({ onIndexChange })
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki görsel' }))
    expect(onIndexChange).toHaveBeenCalledWith(1)
    expect(screen.getByText('2 / 3')).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: 'Önceki görsel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Önceki görsel' }))
    expect(screen.getByText('3 / 3')).toBeDefined()
  })

  it('ok tuşları gezinir, thumbnail atlar', () => {
    renderLightbox()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByRole('dialog').getAttribute('aria-label')).toContain('2 / 3')
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByRole('dialog').getAttribute('aria-label')).toContain('1 / 3')

    fireEvent.click(screen.getByRole('button', { name: '3. görsele git: Arka görünüm' }))
    expect(screen.getByText('3 / 3')).toBeDefined()
  })

  it('Escape, Kapat butonu ve boşluk tıklaması onClose çağırır; görsele tıklama çağırmaz', () => {
    const onClose = vi.fn()
    renderLightbox({ onClose })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
    expect(onClose).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByAltText('Ön görünüm'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('controlled indeks dışarıdan sürülür; component kendi kendine değişmez', () => {
    const onIndexChange = vi.fn()
    renderLightbox({ index: 1, onIndexChange })
    expect(screen.getByText('2 / 3')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki görsel' }))
    expect(onIndexChange).toHaveBeenCalledWith(2)
    // Çağıran state'i güncellemediği için gösterilen kare aynı kalır.
    expect(screen.getByText('2 / 3')).toBeDefined()
  })

  it('ray bütün kareleri çizer; aktif olmayanlar aria-hidden taşır', () => {
    renderLightbox()
    // Sürüklenebilir ray için üç kare de DOM'dadır…
    const front = screen.getByAltText('Ön görünüm')
    const side = screen.getByAltText('Yan görünüm')
    expect(front).toBeDefined()
    expect(side).toBeDefined()
    // …ama ekran okuyucuya yalnız aktif kare açıktır.
    expect(front.closest('[aria-hidden="true"]')).toBeNull()
    expect(side.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('note satırı aria-describedby ile bağlanır', () => {
    renderLightbox({ note: 'Görseller temsilidir.' })
    const dialog = screen.getByRole('dialog')
    const describedBy = dialog.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy as string)?.textContent).toBe('Görseller temsilidir.')
  })

  it('thumbnails={false} şeridi kaldırır, gezinme okları kalır', () => {
    renderLightbox({ thumbnails: false })
    expect(screen.queryByRole('button', { name: /görsele git/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Sonraki görsel' })).toBeDefined()
  })

  it('açılışta scroll kilitlenir, kapanışta odak tetikleyiciye döner', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Aç' })
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog')
    // defaultIndex her açılışta uygulanır.
    expect(dialog.getAttribute('aria-label')).toContain('2 / 3')
    expect(document.body.style.overflow).toBe('hidden')
    await waitFor(() => expect(document.activeElement).toBe(dialog))

    await user.keyboard('{Escape}')
    // Çıkış animasyonu bazen await'ten önce biter: waitForElementToBeRemoved o
    // durumda hata atar, bu bekleme her iki sırayı da kabul eder.
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.body.style.overflow).not.toBe('hidden')
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('Tab odağı dialog içinde tutar', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Aç' }))
    const dialog = await screen.findByRole('dialog')

    await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
    // Şeridin son karesinden sonra ilk kontrole sarar.
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>('button'))
    focusables[focusables.length - 1].focus()
    await user.tab()
    expect(document.activeElement).toBe(focusables[0])
  })
})
