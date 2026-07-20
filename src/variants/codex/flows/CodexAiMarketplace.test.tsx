import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { CodexAiMarketplace } from './CodexAiMarketplace'

describe('Codex AI marketplace ürün akışları', () => {
  it('doğal dil aramasını açıklanabilir filtre, kaynak ve sonuçlarla kurar', () => {
    render(<CodexAiMarketplace variant="discovery" />)

    expect(screen.getByRole('heading', { name: 'Aradığınızı tarif edin. Ölçütleri siz onaylayın.', level: 1 })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Nasıl bir taşınmaz arıyorsunuz?' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: /Azami bütçe/ })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Dayanaklar' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '24 güçlü eşleşme' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Denize yakın, imarlı köşe parsel' })).toBeTruthy()
  })

  it('arama favorisini kullanıcı kontrolünde tutar', () => {
    render(<CodexAiMarketplace variant="discovery" />)
    const favorite = screen.getByRole('button', { name: 'Favorilerden çıkar' })
    expect(favorite.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(favorite)
    expect(favorite.getAttribute('aria-label')).toBe('Favorilere ekle')
    expect(favorite.getAttribute('aria-pressed')).toBe('false')
  })

  it('arama loading, empty ve error durumlarında güvenli geri dönüş sunar', () => {
    const { rerender } = render(<CodexAiMarketplace variant="discovery" state="loading" />)
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull()

    rerender(<CodexAiMarketplace variant="discovery" state="empty" />)
    expect(screen.getByRole('heading', { name: 'Kesin ölçütlerle eşleşme yok' })).toBeTruthy()
    expect(screen.getByText(/bütçeyi 5,5 milyon TL’ye çıkarabilirsiniz/)).toBeTruthy()

    rerender(<CodexAiMarketplace variant="discovery" state="error" />)
    expect(screen.getAllByRole('alert').some((alert) => alert.textContent?.includes('Standart aramaya geç'))).toBe(true)
  })

  it('ilan intelligence akışı görsel, değerleme ve güven dayanaklarını aynı kararda birleştirir', () => {
    render(<CodexAiMarketplace variant="listing-intelligence" />)

    expect(screen.getByRole('heading', { name: /Denize yakın, iki yola cepheli/, level: 1 })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Urla köşe parsel kuzey ve yol cephesi görünümü' })).toBeTruthy()
    expect(screen.getByRole('meter', { name: 'Model güveni' }).getAttribute('aria-valuenow')).toBe('86')
    expect(screen.getByLabelText('Güven puanı 84/100')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Bu ilan hakkında AI asistana sor' })).toBeTruthy()
  })

  it('portföy copilot tablo, seçim ve açık izin kapısını korur', () => {
    render(<CodexAiMarketplace variant="portfolio-copilot" />)

    const table = screen.getByRole('table', { name: 'Kurumsal portföy' })
    expect(within(table).getAllByRole('row')).toHaveLength(5)
    expect(screen.getByText('2 seçili')).toBeTruthy()
    const approve = screen.getByRole('button', { name: 'İzin ver' })
    fireEvent.click(approve)
    expect(screen.queryByRole('button', { name: 'İzin ver' })).toBeNull()
    const approvedItem = screen.getByText('6 ilana fiyat güncellemesi önerildi').closest('li')
    expect(approvedItem && within(approvedItem).getByText('Tamamlandı')).toBeTruthy()
  })

  it('moderasyon akışı yüksek risk çözülmeden insan onayını açmaz', () => {
    render(<CodexAiMarketplace variant="moderation" />)

    expect(screen.getByText(/AI karar vermez/)).toBeTruthy()
    expect(screen.getByRole('table', { name: 'Risk inceleme kuyruğu' })).toBeTruthy()
    const approval = screen.getByRole('button', { name: 'İncelemeyi onayla' })
    expect(approval.hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getAllByRole('button', { name: 'Çözüldü işaretle' })[0])
    expect(screen.getByRole('button', { name: 'İncelemeyi onayla' }).hasAttribute('disabled')).toBe(false)
  })

  it('dört ürün varyantında tek bir ana içerik alanı üretir', () => {
    const variants = ['discovery', 'listing-intelligence', 'portfolio-copilot', 'moderation'] as const
    for (const variant of variants) {
      const view = render(<CodexAiMarketplace variant={variant} />)
      expect(screen.getAllByRole('main')).toHaveLength(1)
      view.unmount()
    }
  })
})
