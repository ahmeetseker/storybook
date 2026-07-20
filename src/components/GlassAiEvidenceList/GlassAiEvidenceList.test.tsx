import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassAiEvidenceList } from './GlassAiEvidenceList'
import type { GlassAiEvidenceItem } from './GlassAiEvidenceList'

const evidence: GlassAiEvidenceItem[] = [
  { id: 'tapu', title: 'Tapu kaydı — 34/1284', sourceType: 'official', verified: true, relevance: 96, href: 'https://ornek/tapu' },
  { id: 'ilan', title: 'İlan metni beyanı', sourceType: 'listing', verified: false, relevance: 62 },
  { id: 'emsal', title: 'Bölge emsal analizi', sourceType: 'market', verified: true, relevance: 128 },
]

describe('GlassAiEvidenceList', () => {
  it('koşulsuz "✦ AI" rozeti ve adlandırılmış bölüm render eder', () => {
    render(<GlassAiEvidenceList evidence={evidence} title="Dayanaklar" />)
    expect(screen.getByText('✦ AI')).toBeTruthy()
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Dayanaklar' })).toBeTruthy()
  })

  it('kaynak türünü görünür Türkçe etiketle gösterir', () => {
    render(<GlassAiEvidenceList evidence={evidence} />)
    expect(screen.getByText('Resmî kayıt')).toBeTruthy()
    expect(screen.getByText('İlan verisi')).toBeTruthy()
    expect(screen.getByText('Piyasa verisi')).toBeTruthy()
  })

  it('doğrulama durumunu renk dışında metinle iletir', () => {
    render(<GlassAiEvidenceList evidence={evidence} />)
    expect(screen.getAllByText('Doğrulandı').length).toBe(2)
    expect(screen.getByText('Doğrulanmalı')).toBeTruthy()
  })

  it('relevance [0,100]e clamp edilir', () => {
    render(<GlassAiEvidenceList evidence={evidence} />)
    expect(screen.getByText('İlgi %96')).toBeTruthy()
    expect(screen.getByText('İlgi %100')).toBeTruthy() // 128 → 100
  })

  it('href verilen kaynak <a>, yalnız onOpen verilen kaynak <button> olur', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    render(
      <GlassAiEvidenceList
        evidence={[
          { id: 'a', title: 'Linkli', sourceType: 'document', href: 'https://ornek' },
          { id: 'b', title: 'Callbackli', sourceType: 'document', onOpen },
          { id: 'c', title: 'Statik', sourceType: 'document' },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: /Linkli/ })).toBeTruthy()
    const button = screen.getByRole('button', { name: /Callbackli/ })
    await user.click(button)
    expect(onOpen).toHaveBeenCalledWith('b')
    // Statik kaynak interaktif değildir
    expect(screen.queryByRole('button', { name: /Statik/ })).toBeNull()
    expect(screen.queryByRole('link', { name: /Statik/ })).toBeNull()
  })

  it('boş listede güvenli mesaj role="note" ile gösterilir (alert değil)', () => {
    render(<GlassAiEvidenceList evidence={[]} />)
    const note = screen.getByRole('note')
    expect(note.textContent).toMatch(/doğrulayın/i)
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('0 kaynak')).toBeTruthy()
  })

  it('caller rest ile yönetilen aria-labelledby ezilemez', () => {
    render(<GlassAiEvidenceList evidence={evidence} title="Doğru" aria-label="Yanlış" />)
    expect(screen.getByRole('region', { name: 'Doğru' })).toBeTruthy()
  })
})
