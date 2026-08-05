import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PAROLA_KURALLARI } from '../domain/parola-gucu'
import { ParolaGucu } from './ParolaGucu'

describe('ParolaGucu', () => {
  it('ölçeği meter olarak sunar ve puanı değere yazar', () => {
    render(<ParolaGucu parola="Kavakli7" />)
    const olcek = screen.getByRole('meter', { name: 'Parola gücü' })
    expect(olcek.getAttribute('aria-valuenow')).toBe('3')
    expect(olcek.getAttribute('aria-valuemax')).toBe(String(PAROLA_KURALLARI.length))
    expect(olcek.getAttribute('aria-valuetext')).toBe('Orta')
  })

  it('boş parolada ölçek sıfırdır ve değer metni bunu söyler', () => {
    render(<ParolaGucu parola="" />)
    const olcek = screen.getByRole('meter')
    expect(olcek.getAttribute('aria-valuenow')).toBe('0')
    expect(olcek.getAttribute('aria-valuetext')).toBe('Parola girilmedi')
  })

  it('her kuralı listeler ve karşılanma durumunu görsel-gizli metinle söyler', () => {
    render(<ParolaGucu parola="Kavakli7" />)
    for (const kural of PAROLA_KURALLARI) {
      expect(screen.getByText(kural.etiket)).toBeTruthy()
    }
    // Üç zorunlu sağlandı, iki öneri sağlanmadı.
    expect(screen.getAllByText('— sağlandı')).toHaveLength(3)
    expect(screen.getAllByText('— henüz sağlanmadı')).toHaveLength(2)
  })

  it('zorunlu olmayan kuralları "önerilir" ile işaretler', () => {
    render(<ParolaGucu parola="" />)
    const onerilenSayisi = PAROLA_KURALLARI.filter((kural) => !kural.zorunlu).length
    expect(screen.getAllByText('önerilir')).toHaveLength(onerilenSayisi)
  })

  it('kural listesi kapatılabilir; ölçek yerinde kalır', () => {
    render(<ParolaGucu parola="Kavakli7" kurallariGoster={false} />)
    expect(screen.getByRole('meter')).toBeTruthy()
    expect(screen.queryByText('En az 8 karakter')).toBeNull()
  })

  it('ton sınıfları çözülür — şablon dizgisiyle kurulan sınıf adı boşa düşmez', () => {
    // `styles[`serit${ton}`]` bir CSS Modules anahtarını çalışma zamanında
    // kurar: sınıf yeniden adlandırılırsa TypeScript susar, `undefined`
    // sınıfa yazılır ve renk sessizce kaybolur.
    const { container } = render(<ParolaGucu parola="Kavaklidere7!" />)
    const isaretli = Array.from(container.querySelectorAll('[class]'))
    expect(isaretli.length).toBeGreaterThan(0)
    for (const eleman of isaretli) {
      expect(eleman.getAttribute('class')).not.toContain('undefined')
    }
  })

  it('duyuru gecikmeden sonra canlı bölgeye yazılır', async () => {
    const { container } = render(<ParolaGucu parola="kavakli" duyuruGecikmesi={0} />)
    const canliBolge = container.querySelector('[aria-live="polite"]')
    expect(canliBolge).toBeTruthy()
    await waitFor(() => {
      expect(canliBolge?.textContent).toContain('Parola gücü: çok zayıf')
    })
    expect(canliBolge?.textContent).toContain('Zorunlu, eksik:')
  })

  it('boş parolada duyuru yapılmaz — canlı bölge sessiz kalır', () => {
    const { container } = render(<ParolaGucu parola="" duyuruGecikmesi={0} />)
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe('')
  })

  it('tahmin edilebilir parolada uyarı duyurulur', async () => {
    const { container } = render(<ParolaGucu parola="Parola123!" duyuruGecikmesi={0} />)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('1')
    await waitFor(() => {
      expect(container.querySelector('[aria-live="polite"]')?.textContent).toContain(
        'sık denenen bir kalıp',
      )
    })
  })
})
