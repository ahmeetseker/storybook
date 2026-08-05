import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassPersonalNote } from './GlassPersonalNote'

describe('GlassPersonalNote — boş/kayıtlı durum geçişleri', () => {
  it('not yokken yalnız "Not ekle" satırı render edilir, textarea/"Düzenle" yok', () => {
    render(<GlassPersonalNote />)
    expect(screen.getByRole('button', { name: /Not ekle/ })).toBeTruthy()
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.queryByRole('button', { name: /Düzenle/ })).toBeNull()
  })

  it('gizlilik satırı boş durumda da her zaman görünür', () => {
    render(<GlassPersonalNote />)
    expect(screen.getByText('Yalnız sen görürsün')).toBeTruthy()
  })

  it('defaultValue ile kayıtlı not varsa metin + "Düzenle" butonu render edilir, "Not ekle" yok', () => {
    render(<GlassPersonalNote defaultValue="Fiyat pazarlığa açık, sahibiyle görüştüm." />)
    expect(screen.getByText('Fiyat pazarlığa açık, sahibiyle görüştüm.')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Düzenle/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Not ekle/ })).toBeNull()
    expect(screen.getByText('Yalnız sen görürsün')).toBeTruthy()
  })

  it('"Not ekle" tıklanınca textarea açılır (aria-label ile) ve odak alır; gizlilik satırı yine görünür', () => {
    render(<GlassPersonalNote />)
    fireEvent.click(screen.getByRole('button', { name: /Not ekle/ }))
    const textarea = screen.getByRole('textbox', { name: 'Not metni' })
    expect(textarea).toBeTruthy()
    expect(document.activeElement).toBe(textarea)
    expect(screen.getByText('Yalnız sen görürsün')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Vazgeç' })).toBeTruthy()
  })
})

describe('GlassPersonalNote — kaydet / vazgeç', () => {
  it('Kaydet trimlenmiş metinle onValueChange + onSave çağırır, görünüm not metnine döner ve odak Düzenle butonuna taşınır', () => {
    const onValueChange = vi.fn()
    const onSave = vi.fn()
    render(<GlassPersonalNote onValueChange={onValueChange} onSave={onSave} />)

    fireEvent.click(screen.getByRole('button', { name: /Not ekle/ }))
    const textarea = screen.getByRole('textbox', { name: 'Not metni' })
    fireEvent.change(textarea, { target: { value: '  Otoparklı, güney cepheli.  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(onValueChange).toHaveBeenCalledWith('Otoparklı, güney cepheli.')
    expect(onSave).toHaveBeenCalledWith('Otoparklı, güney cepheli.')
    expect(screen.getByText('Otoparklı, güney cepheli.')).toBeTruthy()
    const editButton = screen.getByRole('button', { name: /Düzenle/ })
    expect(document.activeElement).toBe(editButton)
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('Vazgeç taslağı atar, onValueChange/onSave çağrılmaz, odak "Not ekle" butonuna döner', () => {
    const onValueChange = vi.fn()
    const onSave = vi.fn()
    render(<GlassPersonalNote onValueChange={onValueChange} onSave={onSave} />)

    fireEvent.click(screen.getByRole('button', { name: /Not ekle/ }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Not metni' }), { target: { value: 'Yarım kalan not' } })
    fireEvent.click(screen.getByRole('button', { name: 'Vazgeç' }))

    expect(onValueChange).not.toHaveBeenCalled()
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).toBeNull()
    const addButton = screen.getByRole('button', { name: /Not ekle/ })
    expect(document.activeElement).toBe(addButton)
  })

  it('mevcut notu Düzenle ile açıp boş metinle kaydedince not silinmiş sayılır, "Not ekle" görünümüne döner', () => {
    const onValueChange = vi.fn()
    render(<GlassPersonalNote defaultValue="Eski not" onValueChange={onValueChange} />)

    fireEvent.click(screen.getByRole('button', { name: /Düzenle/ }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Not metni' }), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(onValueChange).toHaveBeenCalledWith('')
    expect(screen.getByRole('button', { name: /Not ekle/ })).toBeTruthy()
    expect(screen.queryByText('Eski not')).toBeNull()
  })
})

describe('GlassPersonalNote — Escape ve IME', () => {
  it('textarea içinde Escape düzenlemeyi vazgeçirir', () => {
    render(<GlassPersonalNote />)
    fireEvent.click(screen.getByRole('button', { name: /Not ekle/ }))
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Not metni' }), { key: 'Escape' })
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('regresyon: IME kompozisyonu sürerken Escape düzenlemeyi kapatmaz', () => {
    render(<GlassPersonalNote />)
    fireEvent.click(screen.getByRole('button', { name: /Not ekle/ }))
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Not metni' }), { key: 'Escape', isComposing: true })
    expect(screen.getByRole('textbox', { name: 'Not metni' })).toBeTruthy()
  })

  it('regresyon: Escape kapanışı e.stopPropagation() çağırır — dış document dinleyicileri olayı almaz', () => {
    const outerSpy = vi.fn()
    document.addEventListener('keydown', outerSpy)
    try {
      render(<GlassPersonalNote />)
      fireEvent.click(screen.getByRole('button', { name: /Not ekle/ }))
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Not metni' }), { key: 'Escape' })
      expect(outerSpy).not.toHaveBeenCalled()
    } finally {
      document.removeEventListener('keydown', outerSpy)
    }
  })
})

describe('GlassPersonalNote — maxLength ve sayaç', () => {
  it('varsayılan maxLength 500 iken kalan karakter sayacı doğru hesaplanır', () => {
    render(<GlassPersonalNote />)
    fireEvent.click(screen.getByRole('button', { name: /Not ekle/ }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Not metni' }), { target: { value: 'abcde' } })
    expect(screen.getByText('495 karakter kaldı')).toBeTruthy()
  })

  it('özel maxLength ile girdi sınırın üzerine kırpılır, sayaç 0\'da kalır', () => {
    render(<GlassPersonalNote maxLength={10} />)
    fireEvent.click(screen.getByRole('button', { name: /Not ekle/ }))
    const textarea = screen.getByRole('textbox', { name: 'Not metni' }) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '0123456789ABCDEF' } })
    expect(textarea.value).toBe('0123456789')
    expect(screen.getByText('0 karakter kaldı')).toBeTruthy()
  })

  it('sonlu olmayan/negatif maxLength varsayılan 500\'e düşer', () => {
    render(<GlassPersonalNote maxLength={-5} />)
    fireEvent.click(screen.getByRole('button', { name: /Not ekle/ }))
    expect(screen.getByText('500 karakter kaldı')).toBeTruthy()
  })
})

describe('GlassPersonalNote — regresyon (Codex dalga4 bulguları)', () => {
  it('regresyon: children prop tipinden açıkça omit edilir (public HTMLAttributes yüzeyi children taşımaz)', () => {
    // Tip seviyesinde omit edildiği için normal kullanımda TS derlemesi
    // `children` geçirilmesine izin vermez. Bir çağıran yine de zorla
    // (`as any`) geçirirse component kendi sabit JSX ağacını render eder —
    // dışarıdan gelen children sessizce yutulmaz, hiç kabul edilmediği
    // için render sonucu tamamen component'in kendi içeriğidir.
    render(
      <GlassPersonalNote
        defaultValue="Fiyat pazarlığa açık."
        {...({ children: 'dışarıdan-children-metni' } as Record<string, unknown>)}
      />,
    )
    expect(screen.queryByText('dışarıdan-children-metni')).toBeNull()
    expect(screen.getByText('Fiyat pazarlığa açık.')).toBeTruthy()
    expect(screen.getByText('Yalnız sen görürsün')).toBeTruthy()
  })

  it('regresyon: textarea placeholder opaklığı 1\'e kilitlenir (tarayıcı varsayılanı kontrastı ~2.1-2.8:1\'e düşürüyordu)', () => {
    const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'GlassPersonalNote.module.css')
    const css = readFileSync(cssPath, 'utf-8')
    const blockMatch = css.match(/\.textarea::placeholder\s*\{([^}]*)\}/)
    expect(blockMatch).not.toBeNull()
    const block = blockMatch![1]
    expect(block).toMatch(/opacity:\s*1/)
    // Renk --lg-label-secondary'den geliyor: fildişi zeminde ~4.74:1 —
    // ≥4.5:1 küçük metin eşiğini karşılar.
    expect(block).toMatch(/color:\s*var\(--lg-label-secondary\)/)
  })
})
