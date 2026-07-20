import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import {
  CodexBadge,
  CodexButton,
  CodexCheckbox,
  CodexChip,
  CodexField,
  CodexIconButton,
  CodexInput,
  CodexSelect,
  CodexSwitch,
  CodexTabs,
  type CodexTabItem,
} from './index'

const tabs: CodexTabItem[] = [
  { id: 'summary', label: 'Özet', panel: <p>Özet içeriği</p> },
  { id: 'archive', label: 'Arşiv', panel: <p>Arşiv içeriği</p>, disabled: true },
  { id: 'location', label: 'Konum', panel: <p>Konum içeriği</p> },
]

describe('Codex controls', () => {
  it('loading button erişilebilir adını korur, busy/disabled olur ve tekrar çalışmaz', () => {
    const onClick = vi.fn()
    render(<CodexButton loading onClick={onClick}>Kaydediliyor</CodexButton>)

    const button = screen.getByRole('button', { name: 'Kaydediliyor' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button.dataset.loading).toBe('true')
    expect(button.querySelector('[aria-hidden]')).not.toBeNull()

    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('yönetilen button, icon ve checkbox ARIA durumları caller rest değerleriyle ezilmez', () => {
    render(
      <>
        <CodexButton loading aria-busy={false}>Gönderiliyor</CodexButton>
        <CodexIconButton label="Seçili görünüm" pressed aria-pressed={false} icon={<span>✓</span>} />
        <CodexCheckbox label="Kısmi seçim" indeterminate aria-checked={false} />
      </>,
    )

    expect(screen.getByRole('button', { name: 'Gönderiliyor' }).getAttribute('aria-busy')).toBe('true')
    expect(screen.getByRole('button', { name: 'Seçili görünüm' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('checkbox', { name: 'Kısmi seçim' }).getAttribute('aria-checked')).toBe('mixed')
  })

  it('icon button label, pressed durumu ve dekoratif ikon sözleşmesini taşır', () => {
    const onClick = vi.fn()
    render(<CodexIconButton label="İlanı kaydet" icon={<span>♥</span>} pressed onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'İlanı kaydet' })
    expect(button.getAttribute('aria-pressed')).toBe('true')
    expect(button.getAttribute('title')).toBe('İlanı kaydet')
    expect(button.dataset.pressed).toBe('true')
    expect(button.querySelector('[aria-hidden]')?.textContent).toBe('♥')

    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('badge durum metnini korur ve noktasını yardımcı teknolojiden gizler', () => {
    const { container } = render(<CodexBadge tone="success" dot>Doğrulandı</CodexBadge>)
    const badge = container.querySelector('span')
    expect(badge?.textContent).toContain('Doğrulandı')
    expect(badge?.querySelector('[aria-hidden]')).not.toBeNull()
  })

  it('uncontrolled chip seçimi değiştirir ve ayrı kaldırma aksiyonunu adlandırır', () => {
    const onSelectedChange = vi.fn()
    const onRemove = vi.fn()
    render(
      <CodexChip onSelectedChange={onSelectedChange} onRemove={onRemove}>
        Urla
      </CodexChip>,
    )

    const toggle = screen.getByRole('button', { name: 'Urla' })
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(onSelectedChange).toHaveBeenCalledWith(true)

    fireEvent.click(screen.getByRole('button', { name: 'Urla filtresini kaldır' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('controlled chip parent güncellemeden görsel seçimi değiştirmez', () => {
    const onSelectedChange = vi.fn()
    render(<CodexChip selected onSelectedChange={onSelectedChange}>Doğrulanmış</CodexChip>)

    const toggle = screen.getByRole('button', { name: 'Doğrulanmış' })
    fireEvent.click(toggle)
    expect(onSelectedChange).toHaveBeenCalledWith(false)
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
  })

  it('Field label, açıklama, required ve hata kimliklerini Input ile birleştirir', () => {
    render(
      <CodexField
        label="E-posta"
        hint="Kurumsal e-posta adresinizi girin."
        error="Geçerli bir adres girin."
        required
      >
        <CodexInput type="email" aria-describedby="harici-aciklama" />
      </CodexField>,
    )

    const input = screen.getByRole('textbox', { name: 'E-posta' }) as HTMLInputElement
    const alert = screen.getByRole('alert')
    const describedBy = input.getAttribute('aria-describedby')?.split(' ') ?? []

    expect(input.required).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.closest('[data-invalid="true"]')).not.toBeNull()
    expect(describedBy).toContain('harici-aciklama')
    expect(describedBy).toContain(alert.id)
    expect(describedBy.some((id) => id.startsWith('cx-description-'))).toBe(true)
  })

  it('Field, child control için verilen özel id ile label bağını korur', () => {
    render(
      <CodexField label="Parsel numarası">
        <CodexInput id="custom-parcel-id" />
      </CodexField>,
    )

    const input = screen.getByRole('textbox', { name: 'Parsel numarası' })
    expect(input.id).toBe('custom-parcel-id')
    expect(document.querySelector('label')?.htmlFor).toBe('custom-parcel-id')
  })

  it('Select native combobox semantiğini ve Field invalid ilişkisini korur', () => {
    render(
      <CodexField label="Şehir" error="Bir şehir seçin." required>
        <CodexSelect defaultValue="" placeholder="Şehir seçin">
          <option value="izmir">İzmir</option>
          <option value="ankara">Ankara</option>
        </CodexSelect>
      </CodexField>,
    )

    const select = screen.getByRole('combobox', { name: 'Şehir' }) as HTMLSelectElement
    expect(select.required).toBe(true)
    expect(select.value).toBe('')
    expect(select.getAttribute('aria-invalid')).toBe('true')
    expect(select.getAttribute('aria-describedby')).toContain(screen.getByRole('alert').id)
  })

  it('indeterminate checkbox mixed durumunu ve açıklamasını programatik taşır', () => {
    render(
      <CodexCheckbox
        label="Bazı şehirler seçili"
        description="İzmir ve Ankara seçildi."
        indeterminate
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Bazı şehirler seçili' }) as HTMLInputElement
    expect(checkbox.indeterminate).toBe(true)
    expect(checkbox.getAttribute('aria-checked')).toBe('mixed')
    expect(checkbox.dataset.indeterminate).toBe('true')
    expect(checkbox.getAttribute('aria-describedby')).not.toBeNull()
  })

  it('uncontrolled switch native checked state ve callback değerini birlikte günceller', () => {
    const onCheckedChange = vi.fn()
    render(
      <CodexSwitch
        label="Fiyat düşünce bildir"
        description="Değişiklikleri e-posta ile al."
        onCheckedChange={onCheckedChange}
      />,
    )

    const control = screen.getByRole('switch', { name: 'Fiyat düşünce bildir' }) as HTMLInputElement
    expect(control.checked).toBe(false)
    fireEvent.click(control)
    expect(control.checked).toBe(true)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(control.getAttribute('aria-describedby')).not.toBeNull()
  })

  it('Tabs seçili paneli bağlar ve klavyede disabled tabı atlar', () => {
    const onValueChange = vi.fn()
    render(
      <CodexTabs
        items={tabs}
        defaultValue="summary"
        onValueChange={onValueChange}
        ariaLabel="İlan ayrıntıları"
      />,
    )

    const tablist = screen.getByRole('tablist', { name: 'İlan ayrıntıları' })
    const summary = within(tablist).getByRole('tab', { name: 'Özet' })
    const archive = within(tablist).getByRole('tab', { name: 'Arşiv' }) as HTMLButtonElement
    const location = within(tablist).getByRole('tab', { name: 'Konum' })

    expect(summary.getAttribute('aria-selected')).toBe('true')
    expect(archive.disabled).toBe(true)
    expect(screen.getByRole('tabpanel', { name: 'Özet' }).hidden).toBe(false)

    summary.focus()
    fireEvent.keyDown(summary, { key: 'ArrowRight' })

    expect(onValueChange).toHaveBeenCalledWith('location')
    expect(document.activeElement).toBe(location)
    expect(location.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel', { name: 'Konum' }).hidden).toBe(false)
    expect(location.getAttribute('aria-controls')).toBe(screen.getByRole('tabpanel', { name: 'Konum' }).id)
  })

  it('Tabs boş veya yinelenen id ile bozuk ARIA ilişkisi üretmek yerine açıkça hata verir', () => {
    expect(() => render(<CodexTabs items={[{ id: '', label: 'Boş' }]} />)).toThrow(/boş olmayan bir id/)
    expect(() => render(<CodexTabs items={[{ id: 'same', label: 'A' }, { id: 'same', label: 'B' }]} />)).toThrow(/benzersiz/)
  })
})
