import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import {
  CodexDatePicker,
  CodexFileUpload,
  CodexProgress,
  CodexRadioGroup,
  CodexSearchField,
  CodexSegmentedControl,
  CodexSlider,
  CodexStepper,
  CodexTextarea,
} from './index'

describe('Codex enterprise forms', () => {
  it('Textarea etiket, açıklama, hata ve karakter sayısını programatik olarak bağlar', () => {
    const onValueChange = vi.fn()
    render(
      <CodexTextarea
        label="İlan açıklaması"
        description="Konumu ve yapıyı anlatın."
        error="Açıklama çok kısa."
        defaultValue="Deniz manzaralı"
        maxLength={100}
        showCount
        required
        onValueChange={onValueChange}
      />,
    )

    const textarea = screen.getByRole('textbox', { name: /İlan açıklaması/ }) as HTMLTextAreaElement
    const alert = screen.getByRole('alert')
    const describedBy = textarea.getAttribute('aria-describedby')?.split(' ') ?? []

    expect(textarea.required).toBe(true)
    expect(textarea.getAttribute('aria-invalid')).toBe('true')
    expect(describedBy).toContain(alert.id)
    expect(describedBy.some((item) => item.endsWith('-description'))).toBe(true)
    expect(screen.getByText('15 / 100').getAttribute('aria-live')).toBe('polite')

    fireEvent.change(textarea, { target: { value: 'Bahçeli müstakil villa' } })
    expect(onValueChange).toHaveBeenCalledWith('Bahçeli müstakil villa')
    expect(textarea.value).toBe('Bahçeli müstakil villa')
  })

  it('controlled Textarea parent güncellemeden görünen değeri değiştirmez', () => {
    const onValueChange = vi.fn()
    render(<CodexTextarea label="Not" value="Sabit metin" onValueChange={onValueChange} />)

    const textarea = screen.getByRole('textbox', { name: 'Not' }) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Yeni metin' } })

    expect(onValueChange).toHaveBeenCalledWith('Yeni metin')
    expect(textarea.value).toBe('Sabit metin')
  })

  it('SearchField arama gönderimini ve ayrı temizleme aksiyonunu yönetir', () => {
    const onSearch = vi.fn()
    const onValueChange = vi.fn()
    render(
      <CodexSearchField
        label="Bölge ara"
        defaultValue="Urla"
        onSearch={onSearch}
        onValueChange={onValueChange}
      />,
    )

    const search = screen.getByRole('search')
    const input = screen.getByRole('searchbox', { name: 'Bölge ara' }) as HTMLInputElement
    expect(input.value).toBe('Urla')

    fireEvent.submit(search)
    expect(onSearch).toHaveBeenCalledWith('Urla', expect.anything())

    fireEvent.click(screen.getByRole('button', { name: 'Aramayı temizle' }))
    expect(onValueChange).toHaveBeenCalledWith('')
    expect(input.value).toBe('')
  })

  it('loading SearchField busy kalır, girdi salt okunur olur ve submit callback çalışmaz', () => {
    const onSearch = vi.fn()
    render(<CodexSearchField label="Benzer ilan ara" defaultValue="3+1" loading onSearch={onSearch} />)

    const search = screen.getByRole('search')
    const input = screen.getByRole('searchbox', { name: 'Benzer ilan ara' }) as HTMLInputElement
    const button = screen.getByRole('button', { name: 'Aranıyor' }) as HTMLButtonElement

    expect(search.getAttribute('aria-busy')).toBe('true')
    expect(input.readOnly).toBe(true)
    expect(button.disabled).toBe(true)
    fireEvent.submit(search)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('RadioGroup native group adını, seçimi ve option disabled durumunu korur', () => {
    const onValueChange = vi.fn()
    render(
      <CodexRadioGroup
        label="Taşınmaz tipi"
        description="Bir kategori seçin."
        defaultValue="daire"
        onValueChange={onValueChange}
        options={[
          { value: 'daire', label: 'Daire' },
          { value: 'villa', label: 'Villa' },
          { value: 'arsa', label: 'Arsa', disabled: true },
        ]}
      />,
    )

    const group = screen.getByRole('group', { name: 'Taşınmaz tipi' })
    const daire = within(group).getByRole('radio', { name: 'Daire' }) as HTMLInputElement
    const villa = within(group).getByRole('radio', { name: 'Villa' }) as HTMLInputElement
    const arsa = within(group).getByRole('radio', { name: 'Arsa' }) as HTMLInputElement

    expect(daire.checked).toBe(true)
    expect(arsa.disabled).toBe(true)
    fireEvent.click(villa)
    expect(onValueChange).toHaveBeenCalledWith('villa')
    expect(villa.checked).toBe(true)
  })

  it('RadioGroup invalid hata ilişkisini tüm grup üzerinde taşır', () => {
    render(
      <CodexRadioGroup
        label="Kullanım durumu"
        options={[{ value: 'bos', label: 'Boş' }]}
        error="Bir durum seçin."
        required
      />,
    )

    const group = screen.getByRole('group', { name: /Kullanım durumu/ })
    const alert = screen.getByRole('alert')
    expect(group.getAttribute('aria-invalid')).toBe('true')
    expect(group.getAttribute('aria-describedby')).toContain(alert.id)
    expect(screen.getByRole('radio', { name: 'Boş' }).getAttribute('aria-invalid')).toBe('true')
  })

  it('SegmentedControl varsayılan ve değişen seçimi native radio sözleşmesiyle iletir', () => {
    const onValueChange = vi.fn()
    render(
      <CodexSegmentedControl
        label="Sonuç düzeni"
        defaultValue="kart"
        onValueChange={onValueChange}
        options={[
          { value: 'kart', label: 'Kart' },
          { value: 'liste', label: 'Liste' },
        ]}
      />,
    )

    const group = screen.getByRole('group', { name: 'Sonuç düzeni' })
    const card = within(group).getByRole('radio', { name: 'Kart' }) as HTMLInputElement
    const list = within(group).getByRole('radio', { name: 'Liste' }) as HTMLInputElement

    expect(card.checked).toBe(true)
    fireEvent.click(list)
    expect(onValueChange).toHaveBeenCalledWith('liste')
    expect(list.checked).toBe(true)
  })

  it('Radio ve segment bileşenleri yinelenen value ile açık hata verir', () => {
    expect(() => render(
      <CodexRadioGroup label="Bozuk" options={[
        { value: 'aynı', label: 'A' },
        { value: 'aynı', label: 'B' },
      ]} />,
    )).toThrow(/benzersiz/)

    expect(() => render(
      <CodexSegmentedControl options={[
        { value: '', label: 'Boş' },
      ]} />,
    )).toThrow(/boş olmayan/)
  })

  it('Slider min/max, formatlanmış aria değeri ve callback sayısını korur', () => {
    const onValueChange = vi.fn()
    render(
      <CodexSlider
        label="Brüt alan"
        min={40}
        max={500}
        step={5}
        defaultValue={180}
        formatValue={(value) => `${value} m²`}
        onValueChange={onValueChange}
      />,
    )

    const slider = screen.getByRole('slider', { name: 'Brüt alan' }) as HTMLInputElement
    expect(slider.min).toBe('40')
    expect(slider.max).toBe('500')
    expect(slider.getAttribute('aria-valuetext')).toBe('180 m²')
    fireEvent.change(slider, { target: { value: '220' } })
    expect(onValueChange).toHaveBeenCalledWith(220)
    expect(slider.getAttribute('aria-valuetext')).toBe('220 m²')
  })

  it('Stepper butonları sınırda kapanır, değer artışı ve manuel girişi iletir', () => {
    const onValueChange = vi.fn()
    render(
      <CodexStepper
        label="Banyo sayısı"
        min={1}
        max={3}
        defaultValue={2}
        onValueChange={onValueChange}
      />,
    )

    const input = screen.getByRole('spinbutton', { name: 'Banyo sayısı' }) as HTMLInputElement
    const decrease = screen.getByRole('button', { name: 'Değeri azalt' }) as HTMLButtonElement
    const increase = screen.getByRole('button', { name: 'Değeri artır' }) as HTMLButtonElement

    fireEvent.click(increase)
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    expect(input.value).toBe('3')
    expect(increase.disabled).toBe(true)

    fireEvent.click(decrease)
    expect(onValueChange).toHaveBeenLastCalledWith(2)
    fireEvent.change(input, { target: { value: '1' } })
    expect(onValueChange).toHaveBeenLastCalledWith(1)
  })

  it('Progress determinate değeri sınırlar, indeterminate durumda value attribute üretmez', () => {
    const { rerender } = render(<CodexProgress label="İlan kalitesi" value={125} tone="success" />)
    const progress = screen.getByRole('progressbar') as HTMLProgressElement

    expect(progress.value).toBe(100)
    expect(progress.getAttribute('aria-valuetext')).toBe('100%')

    rerender(<CodexProgress label="AI fiyat analizi" loadingLabel="Emsaller inceleniyor" />)
    const indeterminate = screen.getByRole('progressbar')
    expect(indeterminate.hasAttribute('value')).toBe(false)
    expect(indeterminate.getAttribute('aria-valuetext')).toBe('Emsaller inceleniyor')
  })

  it('FileUpload geçerli dosyayı listeler, callback verir ve kaldırır', () => {
    const onFilesChange = vi.fn()
    const file = new File(['fotoğraf'], 'salon.webp', { type: 'image/webp', lastModified: 10 })
    render(
      <CodexFileUpload
        label="İlan fotoğrafları"
        accept="image/webp"
        onFilesChange={onFilesChange}
      />,
    )

    const input = screen.getByLabelText('İlan fotoğrafları') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(onFilesChange).toHaveBeenCalledWith([file])
    expect(screen.getByText('salon.webp')).not.toBeNull()
    expect(screen.getByRole('list', { name: 'Seçilen dosyalar' })).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'salon.webp dosyasını kaldır' }))
    expect(onFilesChange).toHaveBeenLastCalledWith([])
    expect(screen.queryByText('salon.webp')).toBeNull()
  })

  it('FileUpload tür, boyut ve adet ihlallerini reddedip metinsel hata sunar', () => {
    const onFilesChange = vi.fn()
    const onRejected = vi.fn()
    const invalidFile = new File(['çok uzun içerik'], 'plan.txt', { type: 'text/plain' })
    render(
      <CodexFileUpload
        label="Kat planı"
        accept="application/pdf"
        maxSize={4}
        onFilesChange={onFilesChange}
        onRejected={onRejected}
      />,
    )

    fireEvent.change(screen.getByLabelText('Kat planı'), { target: { files: [invalidFile] } })

    expect(onFilesChange).not.toHaveBeenCalled()
    expect(onRejected).toHaveBeenCalledWith([
      expect.objectContaining({ file: invalidFile, reason: 'type' }),
    ])
    expect(screen.getByRole('alert').textContent).toContain('dosya türü desteklenmiyor')
  })

  it('DatePicker ISO değeri, native sınırları, invalid ilişkisi ve callback taşır', () => {
    const onValueChange = vi.fn()
    render(
      <CodexDatePicker
        label="Yayın tarihi"
        description="Bugünden sonraki bir günü seçin."
        error="Tarih uygun değil."
        defaultValue="2026-07-24"
        min="2026-07-18"
        max="2026-08-18"
        onValueChange={onValueChange}
      />,
    )

    const input = screen.getByLabelText('Yayın tarihi') as HTMLInputElement
    const alert = screen.getByRole('alert')
    expect(input.type).toBe('date')
    expect(input.value).toBe('2026-07-24')
    expect(input.min).toBe('2026-07-18')
    expect(input.max).toBe('2026-08-18')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toContain(alert.id)

    fireEvent.change(input, { target: { value: '2026-08-01' } })
    expect(onValueChange).toHaveBeenCalledWith('2026-08-01')
    expect(input.value).toBe('2026-08-01')
  })

  it('loading form kontrolleri disabled veya busy sözleşmesini eksiksiz uygular', () => {
    render(
      <>
        <CodexTextarea label="Metin" loading />
        <CodexRadioGroup label="Kategori" options={[{ value: 'a', label: 'A' }]} loading />
        <CodexSegmentedControl label="Düzen" options={[{ value: 'a', label: 'A' }]} loading />
        <CodexSlider label="Aralık" loading />
        <CodexStepper label="Sayı" loading />
        <CodexFileUpload label="Dosya" loading />
        <CodexDatePicker label="Tarih" loading />
      </>,
    )

    expect((screen.getByRole('textbox', { name: 'Metin' }) as HTMLTextAreaElement).disabled).toBe(true)
    expect((screen.getByRole('group', { name: 'Kategori' }) as HTMLFieldSetElement).disabled).toBe(true)
    expect((screen.getByRole('group', { name: 'Düzen' }) as HTMLFieldSetElement).disabled).toBe(true)
    expect((screen.getByRole('slider', { name: 'Aralık' }) as HTMLInputElement).disabled).toBe(true)
    expect((screen.getByRole('spinbutton', { name: 'Sayı' }) as HTMLInputElement).readOnly).toBe(true)
    expect((screen.getByLabelText('Dosya') as HTMLInputElement).disabled).toBe(true)
    expect((screen.getByLabelText('Tarih') as HTMLInputElement).disabled).toBe(true)
  })
})
