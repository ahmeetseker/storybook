import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassFileUpload } from './GlassFileUpload'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const makeFile = (name: string, sizeBytes: number, type = 'image/jpeg') =>
  new File([new Uint8Array(sizeBytes)], name, { type })

const renderUpload = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassFileUpload {...props} />
    </GlassTierProvider>,
  )

const zone = () => screen.getByRole('button', { name: /Dosya seçin veya sürükleyin/ })
const input = (container: HTMLElement) => container.querySelector('input[type="file"]') as HTMLInputElement

describe('GlassFileUpload', () => {
  it('alan button rolüyle ve label ile render olur, native file input gizlidir', () => {
    const { container } = renderUpload({ description: 'JPG veya PNG' })
    expect(zone()).toBeTruthy()
    expect(zone().textContent).toContain('JPG veya PNG')
    const fileInput = input(container)
    expect(fileInput).toBeTruthy()
    expect(fileInput.getAttribute('aria-hidden')).toBe('true')
    expect(fileInput.tabIndex).toBe(-1)
  })

  it('input ile seçilen dosyalar listelenir ve onFiles tüm geçerli listeyle çağrılır', () => {
    const onFiles = vi.fn()
    const { container } = renderUpload({ onFiles, multiple: true })
    const a = makeFile('salon.jpg', 2048)
    const b = makeFile('mutfak.jpg', 4096)
    fireEvent.change(input(container), { target: { files: [a, b] } })
    expect(onFiles).toHaveBeenCalledTimes(1)
    expect(onFiles.mock.calls[0][0].map((f: File) => f.name)).toEqual(['salon.jpg', 'mutfak.jpg'])
    expect(screen.getByText('salon.jpg')).toBeTruthy()
    expect(screen.getByText('2 KB')).toBeTruthy()
  })

  it('maxSize aşan dosya reddedilir, hata listelenir, geçerliler yine iletilir', () => {
    const onFiles = vi.fn()
    const { container } = renderUpload({ onFiles, multiple: true, maxSize: 1024 })
    fireEvent.change(input(container), {
      target: { files: [makeFile('kucuk.jpg', 512), makeFile('buyuk.jpg', 4096)] },
    })
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toContain('buyuk.jpg')
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'kucuk.jpg' })])
    expect(screen.queryByText('buyuk.jpg', { selector: 'span' })).toBeNull()
  })

  it('kaldır butonu aria-label taşır, dosyayı çıkarır ve onFiles kalan listeyle çağrılır', () => {
    const onFiles = vi.fn()
    const { container } = renderUpload({ onFiles, multiple: true })
    fireEvent.change(input(container), {
      target: { files: [makeFile('salon.jpg', 2048), makeFile('mutfak.jpg', 2048)] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'salon.jpg dosyasını kaldır' }))
    expect(onFiles).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'mutfak.jpg' })])
    expect(screen.queryByText('salon.jpg')).toBeNull()
  })

  it('sürükle-bırak dosya ekler, dragover görsel durumu açar', () => {
    const onFiles = vi.fn()
    renderUpload({ onFiles })
    fireEvent.dragOver(zone(), { dataTransfer: { files: [], types: ['Files'] } })
    expect(zone().getAttribute('data-drag')).toBe('true')
    fireEvent.drop(zone(), { dataTransfer: { files: [makeFile('tapu.pdf', 2048, 'application/pdf')] } })
    expect(zone().getAttribute('data-drag')).toBeNull()
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'tapu.pdf' })])
  })

  it('multiple değilken yeni seçim öncekinin yerine geçer', () => {
    const onFiles = vi.fn()
    const { container } = renderUpload({ onFiles })
    fireEvent.change(input(container), { target: { files: [makeFile('a.jpg', 100)] } })
    fireEvent.change(input(container), { target: { files: [makeFile('b.jpg', 100)] } })
    expect(onFiles).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'b.jpg' })])
    expect(screen.queryByText('a.jpg')).toBeNull()
  })

  it('disabled iken alan pasif olur ve drop dosya eklemez', () => {
    const onFiles = vi.fn()
    renderUpload({ onFiles, disabled: true })
    const btn = zone() as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    fireEvent.drop(btn, { dataTransfer: { files: [makeFile('x.jpg', 100)] } })
    expect(onFiles).not.toHaveBeenCalled()
  })
})
