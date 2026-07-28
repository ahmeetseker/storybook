import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  GlassAiComposer,
  type GlassAiComposerAttachment,
  type GlassAiComposerTool,
} from './GlassAiComposer'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const TOOLS: GlassAiComposerTool[] = [
  { id: 'map', label: 'Haritadan alan' },
  { id: 'image', label: 'Görselle' },
]

const ATTACHMENTS: GlassAiComposerAttachment[] = [
  { id: 'a1', label: 'Urla, 4 km²', kind: 'Harita alanı' },
  { id: 'a2', label: 'ev.jpg', kind: 'Görsel' },
]

const renderComposer = (props: Partial<ComponentProps<typeof GlassAiComposer>> = {}) => {
  const onSubmit = props.onSubmit ?? vi.fn()
  const utils = render(
    <GlassTierProvider tier="fallback">
      <GlassAiComposer onSubmit={onSubmit} {...props} />
    </GlassTierProvider>,
  )
  return { onSubmit, ...utils }
}

const getInput = () => screen.getByRole('textbox', { name: 'Aradığını anlat' })

describe('GlassAiComposer', () => {
  it('aria-label taşıyan form içinde textarea render eder', () => {
    renderComposer()
    expect(screen.getByRole('form', { name: 'AI ile arama' })).toBeTruthy()
    expect(getInput().tagName).toBe('TEXTAREA')
  })

  it('role="search" kullanmaz — bu bir brief alanı, arama alanı değil', () => {
    renderComposer()
    expect(screen.queryByRole('search')).toBeNull()
  })

  it('uncontrolled: defaultValue render olur ve yazınca değişir', () => {
    renderComposer({ defaultValue: 'bahçeli ev' })
    const input = getInput() as HTMLTextAreaElement
    expect(input.value).toBe('bahçeli ev')
    fireEvent.change(input, { target: { value: 'bahçeli ev, okula yakın' } })
    expect(input.value).toBe('bahçeli ev, okula yakın')
  })

  it('controlled: value sabitken DOM değeri değişmez, onValueChange çağrılır', () => {
    const onValueChange = vi.fn()
    renderComposer({ value: 'sabit', onValueChange })
    const input = getInput() as HTMLTextAreaElement
    fireEvent.change(input, { target: { value: 'yeni' } })
    expect(input.value).toBe('sabit')
    expect(onValueChange).toHaveBeenCalledWith('yeni')
  })

  it('Enter gönderir, Shift+Enter göndermez', () => {
    const { onSubmit } = renderComposer({ defaultValue: 'okula yakın bahçeli ev' })
    const input = getInput()

    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('okula yakın bahçeli ev')
  })

  it('IME kompozisyonu sürerken Enter göndermez', () => {
    const { onSubmit } = renderComposer({ defaultValue: 'taslak' })
    fireEvent.keyDown(getInput(), { key: 'Enter', isComposing: true })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('yalnız boşluk içeren metin gönderilmez, gönder butonu devre dışıdır', () => {
    const { onSubmit } = renderComposer({ defaultValue: '   ' })
    fireEvent.keyDown(getInput(), { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Gönder' }).hasAttribute('disabled')).toBe(true)
  })

  it('gönderimde metin trimlenir', () => {
    const { onSubmit } = renderComposer({ defaultValue: '  deniz manzaralı  ' })
    fireEvent.click(screen.getByRole('button', { name: 'Gönder' }))
    expect(onSubmit).toHaveBeenCalledWith('deniz manzaralı')
  })

  it('araç butonu tıklaması onToolSelect çağırır', () => {
    const onToolSelect = vi.fn()
    renderComposer({ tools: TOOLS, onToolSelect })
    fireEvent.click(screen.getByRole('button', { name: 'Haritadan alan' }))
    expect(onToolSelect).toHaveBeenCalledWith('map')
  })

  it('ek kaldır butonunun adı tür + etiket içerir ve onRemoveAttachment çağırır', () => {
    const onRemoveAttachment = vi.fn()
    renderComposer({ attachments: ATTACHMENTS, onRemoveAttachment })
    const remove = screen.getByRole('button', { name: 'Eki kaldır: Harita alanı: Urla, 4 km²' })
    fireEvent.click(remove)
    expect(onRemoveAttachment).toHaveBeenCalledWith('a1')
  })

  it('loading iken giriş, araçlar ve ek kaldırma butonları devre dışıdır', () => {
    renderComposer({
      defaultValue: 'bahçeli ev',
      loading: true,
      tools: TOOLS,
      attachments: ATTACHMENTS,
    })
    expect((getInput() as HTMLTextAreaElement).disabled).toBe(true)
    expect(
      (screen.getByRole('button', { name: 'Haritadan alan' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect(
      (
        screen.getByRole('button', {
          name: 'Eki kaldır: Harita alanı: Urla, 4 km²',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
  })

  it('loading iken Enter göndermez', () => {
    const { onSubmit } = renderComposer({ defaultValue: 'bahçeli ev', loading: true })
    fireEvent.keyDown(getInput(), { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('loading iken loadingLabel görünür, cevap gizlenir', () => {
    renderComposer({
      loading: true,
      loadingLabel: '4.812 ilan taranıyor…',
      answer: { text: 'Eski cevap' },
    })
    expect(screen.getByText('4.812 ilan taranıyor…')).toBeTruthy()
    expect(screen.queryByText('Eski cevap')).toBeNull()
  })

  it('answer verilince metin, chip ve atıf render olur; chip callback çalışır', () => {
    const onAnswerChipSelect = vi.fn()
    renderComposer({
      answer: {
        text: '3 bölge öne çıkıyor.',
        chips: [{ id: 'map', label: 'Bunları haritada gör' }],
        sources: '27 ilan · 3 bölge verisi',
      },
      onAnswerChipSelect,
    })
    expect(screen.getByText('3 bölge öne çıkıyor.')).toBeTruthy()
    expect(screen.getByText('27 ilan · 3 bölge verisi')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Bunları haritada gör' }))
    expect(onAnswerChipSelect).toHaveBeenCalledWith('map')
  })

  it('announcementMode="internal" canlı bölgeye aria-live verir, "external" vermez', () => {
    const { container, rerender } = render(
      <GlassTierProvider tier="fallback">
        <GlassAiComposer onSubmit={vi.fn()} loading loadingLabel="Hazırlanıyor…" />
      </GlassTierProvider>,
    )
    const internal = container.querySelector('[aria-live="polite"]')
    expect(internal).not.toBeNull()
    expect(internal?.textContent).toContain('Hazırlanıyor…')

    rerender(
      <GlassTierProvider tier="fallback">
        <GlassAiComposer
          onSubmit={vi.fn()}
          loading
          loadingLabel="Hazırlanıyor…"
          announcementMode="external"
        />
      </GlassTierProvider>,
    )
    expect(container.querySelector('[aria-live]')).toBeNull()
    expect(screen.getByText('Hazırlanıyor…')).toBeTruthy()
  })

  it('textarea canlı durum bölgesine aria-describedby ile bağlıdır', () => {
    renderComposer({ loading: true, loadingLabel: 'Hazırlanıyor…' })
    const describedBy = getInput().getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const region = document.getElementById(describedBy!)
    expect(region).not.toBeNull()
    expect(region?.textContent).toContain('Hazırlanıyor…')
  })

  it('gönderim sonrası metni component temizlemez — karar parent\'ındır', () => {
    const { onSubmit } = renderComposer({ defaultValue: 'bahçeli ev' })
    fireEvent.keyDown(getInput(), { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalled()
    expect((getInput() as HTMLTextAreaElement).value).toBe('bahçeli ev')
  })

  it('size ekseni data-size olarak yansır ve anatomiyi gizlemez', () => {
    const { container } = renderComposer({ size: 'md', tools: TOOLS })
    expect(container.querySelector('form')?.getAttribute('data-size')).toBe('md')
    expect(screen.getByRole('button', { name: 'Haritadan alan' })).toBeTruthy()
  })
})
