import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import {
  CodexAiAgentActivity,
  CodexAiAnswer,
  CodexAiConfidence,
  CodexAiConversation,
  CodexAiEvidenceList,
  CodexAiPromptComposer,
  CodexAiRiskReview,
  CodexAiSmartFilter,
  CodexAiVisionInspection,
  CodexAiVoiceControl,
  type CodexAiActivityItem,
  type CodexAiEvidence,
  type CodexAiRiskItem,
  type CodexAiVisionFinding,
} from './index'

const evidence: CodexAiEvidence[] = [
  {
    id: 'official',
    title: 'Güncel imar planı',
    source: 'Urla Belediyesi',
    kind: 'official',
    url: '#imar',
    verified: true,
    relevance: 96,
  },
  {
    id: 'listing',
    title: 'İlan sahibi beyanı',
    source: 'İlan #42',
    kind: 'listing',
    verified: false,
    relevance: 72,
  },
]

describe('Codex AI enterprise bileşenleri', () => {
  it('PromptComposer öneriyi alana taşır, karakter sayısını günceller ve temizlenmiş soruyu gönderir', () => {
    const onSubmit = vi.fn()
    const onSuggestionSelect = vi.fn()
    const onAttach = vi.fn()
    render(
      <CodexAiPromptComposer
        suggestions={['İmar risklerini göster']}
        onSubmit={onSubmit}
        onSuggestionSelect={onSuggestionSelect}
        onAttach={onAttach}
      />,
    )

    const prompt = screen.getByRole('textbox', { name: 'AI asistana sor' }) as HTMLTextAreaElement
    expect(prompt.getAttribute('aria-describedby')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'İmar risklerini göster' }))
    expect(prompt.value).toBe('İmar risklerini göster')
    expect(onSuggestionSelect).toHaveBeenCalledWith('İmar risklerini göster')
    fireEvent.click(screen.getByRole('button', { name: 'Bağlam dosyası ekle' }))
    expect(onAttach).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Yanıt oluştur' }))
    expect(onSubmit).toHaveBeenCalledWith('İmar risklerini göster')
  })

  it('PromptComposer hata ilişkisini ve yükleme sırasında kilitli durumu açıklar', () => {
    const { rerender } = render(<CodexAiPromptComposer defaultValue="Belgeyi oku" error="Hassas bilgi algılandı" />)
    const prompt = screen.getByRole('textbox', { name: 'AI asistana sor' })
    const alert = screen.getByRole('alert')
    expect(prompt.getAttribute('aria-invalid')).toBe('true')
    expect(prompt.getAttribute('aria-describedby')).toContain(alert.id)

    rerender(<CodexAiPromptComposer defaultValue="Belgeyi oku" loading />)
    expect(screen.getByRole('textbox', { name: 'AI asistana sor' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Yanıt oluştur' }).getAttribute('aria-busy')).toBe('true')
  })

  it('EvidenceList kaynak türünü, doğrulama durumunu ve güvenli boş açıklamasını taşır', () => {
    const onOpen = vi.fn()
    const { rerender } = render(<CodexAiEvidenceList evidence={evidence} onEvidenceOpen={onOpen} />)
    const region = screen.getByRole('region', { name: 'Dayanaklar' })
    expect(within(region).getByText('Resmî kayıt', { exact: false })).toBeTruthy()
    expect(within(region).getByText('Doğrulandı')).toBeTruthy()
    fireEvent.click(within(region).getByRole('link', { name: /Güncel imar planı/ }))
    expect(onOpen).toHaveBeenCalledWith(evidence[0])

    rerender(<CodexAiEvidenceList evidence={[]} />)
    expect(screen.getByRole('status').textContent).toContain('karar vermeden önce doğrulayın')
  })

  it('Confidence skoru sınırlar ve renk dışında okunabilir seviye sunar', () => {
    render(<CodexAiConfidence score={128} factors={['Güncel kaynak']} />)
    const meter = screen.getByRole('meter', { name: 'Yanıt güveni' })
    expect(meter.getAttribute('aria-valuenow')).toBe('100')
    expect(meter.getAttribute('aria-valuetext')).toBe('Yüksek güven, yüzde 100')
    expect(screen.getByText('Yüksek güven · %100')).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Güven düzeyini etkileyen etkenler' })).toBeTruthy()
  })

  it('Answer streaming durumunu canlı bildirir, güven ve kaynakları aynı article içinde gösterir', () => {
    render(
      <CodexAiAnswer status="streaming" title="Emsal analizi" confidence={68} evidence={evidence}>
        <p>Veriler karşılaştırılıyor</p>
      </CodexAiAnswer>,
    )

    const article = screen.getByRole('article', { name: 'Emsal analizi' })
    expect(article.getAttribute('aria-busy')).toBe('true')
    expect(within(article).getByRole('status').textContent).toContain('Veriler karşılaştırılıyor')
    expect(within(article).getByRole('meter').getAttribute('aria-valuenow')).toBe('68')
    expect(within(article).getByRole('region', { name: 'Dayanaklar' })).toBeTruthy()
  })

  it('Answer hata geri dönüşü ve insan onayı aksiyonlarını çalıştırır', () => {
    const onRetry = vi.fn()
    const onApprove = vi.fn()
    const onReject = vi.fn()
    const { rerender } = render(<CodexAiAnswer status="error" onRetry={onRetry} />)
    expect(screen.getByRole('alert').textContent).toContain('Güvenli geri dönüş')
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }))
    expect(onRetry).toHaveBeenCalledTimes(1)

    rerender(
      <CodexAiAnswer status="warning" humanReview="required" onApprove={onApprove} onReject={onReject}>
        <p>Kontrol edilmesi gereken çıkarım</p>
      </CodexAiAnswer>,
    )
    const review = screen.getByRole('region', { name: 'İnsan incelemesi' })
    fireEvent.click(within(review).getByRole('button', { name: 'Kontrol ettim' }))
    fireEvent.click(within(review).getByRole('button', { name: 'Reddet' }))
    expect(onApprove).toHaveBeenCalledTimes(1)
    expect(onReject).toHaveBeenCalledTimes(1)
  })

  it('SmartFilter gerçek checkbox sözleşmesiyle seçimi, kaldırmayı ve uygulamayı parent’a iletir', () => {
    const onFilterChange = vi.fn()
    const onRemove = vi.fn()
    const onApply = vi.fn()
    render(
      <CodexAiSmartFilter
        filters={[{ id: 'budget', label: 'Bütçe', value: '5.000.000 TL', confidence: 95, applied: true }]}
        onFilterChange={onFilterChange}
        onRemove={onRemove}
        onApply={onApply}
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: /Bütçe/ })
    expect(checkbox.getAttribute('checked')).toBe('')
    fireEvent.click(checkbox)
    expect(onFilterChange).toHaveBeenCalledWith('budget', false)
    fireEvent.click(screen.getByRole('button', { name: 'Bütçe filtresini kaldır' }))
    expect(onRemove).toHaveBeenCalledWith('budget')
    fireEvent.click(screen.getByRole('button', { name: 'Seçili filtreleri uygula' }))
    expect(onApply).toHaveBeenCalledTimes(1)
  })

  it('SmartFilter loading, error ve empty durumlarını semantik olarak ayırır', () => {
    const onRetry = vi.fn()
    const { rerender } = render(<CodexAiSmartFilter filters={[]} status="loading" />)
    expect(screen.getByRole('status', { name: 'Filtreler çıkarılıyor' })).toBeTruthy()

    rerender(<CodexAiSmartFilter filters={[]} status="error" onRetry={onRetry} />)
    expect(screen.getByRole('alert').textContent).toContain('elle seçebilir')
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }))
    expect(onRetry).toHaveBeenCalledTimes(1)

    rerender(<CodexAiSmartFilter filters={[]} status="empty" />)
    expect(screen.getByRole('status').textContent).toContain('uygulanabilir bir filtre bulunamadı')
  })

  it('RiskReview yüksek açık riskte onayı kilitler ve inceleme kararını iletir', () => {
    const risks: CodexAiRiskItem[] = [{ id: 'r1', title: 'İmar kaydı eski', description: 'Plan tarihi eşleşmiyor.', severity: 'high' }]
    const onInspect = vi.fn()
    const onResolve = vi.fn()
    const onDecisionChange = vi.fn()
    render(<CodexAiRiskReview risks={risks} onInspect={onInspect} onResolve={onResolve} onDecisionChange={onDecisionChange} />)

    expect(screen.getByLabelText('1 açık risk, 1 yüksek veya kritik risk')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'İncele' }))
    fireEvent.click(screen.getByRole('button', { name: 'Çözüldü işaretle' }))
    expect(onInspect).toHaveBeenCalledWith(risks[0])
    expect(onResolve).toHaveBeenCalledWith(risks[0])
    expect(screen.getByRole('button', { name: 'İncelemeyi onayla' }).hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Reddet' }))
    expect(onDecisionChange).toHaveBeenCalledWith('rejected')
  })

  it('VisionInspection semantik medya, eşleşen marker ve liste seçimini sunar', () => {
    const findings: CodexAiVisionFinding[] = [
      { id: 'f1', label: 'Nem izi', detail: 'Alt bölümde renk farkı.', confidence: 78, severity: 'warning', region: { x: 30, y: 60 } },
      { id: 'f2', label: 'Araç erişimi', detail: 'Yol seçiliyor.', confidence: 89, region: { x: 70, y: 40 } },
    ]
    const onFindingSelect = vi.fn()
    render(<CodexAiVisionInspection findings={findings} photoLabel="Kuzey cephe fotoğrafı" onFindingSelect={onFindingSelect} />)

    expect(screen.getByRole('img', { name: 'Kuzey cephe fotoğrafı' })).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Görsel analiz bulguları' })).toBeTruthy()
    const secondMarker = screen.getByRole('button', { name: '2. bulgu: Araç erişimi' })
    fireEvent.click(secondMarker)
    expect(secondMarker.getAttribute('aria-pressed')).toBe('true')
    expect(onFindingSelect).toHaveBeenCalledWith(findings[1])
  })

  it('VisionInspection analiz, hata ve boş durumlarında güvenli açıklama sağlar', () => {
    const onRetry = vi.fn()
    const { rerender } = render(<CodexAiVisionInspection status="analyzing" findings={[]} />)
    expect(screen.getByRole('status').textContent).toContain('Görsel taranıyor')

    rerender(<CodexAiVisionInspection status="error" findings={[]} onRetry={onRetry} />)
    expect(screen.getByRole('alert').textContent).toContain('elle inceleyin')
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }))
    expect(onRetry).toHaveBeenCalledTimes(1)

    rerender(<CodexAiVisionInspection status="empty" findings={[]} />)
    expect(screen.getByRole('status').textContent).toContain('hassas veriler')
  })

  it('AgentActivity log akışını, açık izin kapısını ve iptali destekler', () => {
    const item: CodexAiActivityItem = { id: 'a1', label: 'Belgeye erişim', status: 'needsApproval', tool: 'Belge okuyucu' }
    const running: CodexAiActivityItem = { id: 'a2', label: 'Kayıt taraması', status: 'running' }
    const onApprove = vi.fn()
    const onReject = vi.fn()
    const onCancel = vi.fn()
    render(<CodexAiAgentActivity items={[running, item]} live onApprove={onApprove} onReject={onReject} onCancel={onCancel} />)

    expect(screen.getByRole('log', { name: 'Ajan işlem günlüğü' }).getAttribute('aria-live')).toBe('polite')
    fireEvent.click(screen.getByRole('button', { name: 'İzin ver' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reddet' }))
    fireEvent.click(screen.getByRole('button', { name: 'Çalışmayı durdur' }))
    expect(onApprove).toHaveBeenCalledWith(item)
    expect(onReject).toHaveBeenCalledWith(item)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('Conversation mesaj rolleri, kaynakları, streaming ve hata tekrarını korur', () => {
    const failed = { id: 'm3', role: 'assistant' as const, content: 'Bağlantı koptu', status: 'error' as const }
    const onRetryMessage = vi.fn()
    render(
      <CodexAiConversation
        loading
        onRetryMessage={onRetryMessage}
        messages={[
          { id: 'm1', role: 'user', content: 'Fiyat uygun mu?' },
          { id: 'm2', role: 'assistant', content: 'Emsaller taranıyor', status: 'streaming', evidence: evidence.slice(0, 1) },
          failed,
        ]}
      />,
    )

    const log = screen.getByRole('log', { name: 'AI görüşme mesajları' })
    expect(within(log).getByText('Siz')).toBeTruthy()
    expect(within(log).getByLabelText('Yanıt devam ediyor')).toBeTruthy()
    expect(within(log).getByRole('region', { name: 'Bu yanıttaki dayanaklar' })).toBeTruthy()
    fireEvent.click(within(log).getByRole('button', { name: 'Yeniden dene' }))
    expect(onRetryMessage).toHaveBeenCalledWith(failed)
  })

  it('Conversation boş durumunda kullanıcıya başlangıç yönü verir', () => {
    render(<CodexAiConversation messages={[]} />)
    expect(screen.getByRole('status').textContent).toContain('Bir bölge, ilan veya yatırım ölçütü')
  })

  it('VoiceControl mikrofon durumu, transcript onayı, hata ve compact erişilebilir adını yönetir', () => {
    const onStop = vi.fn()
    const onAccept = vi.fn()
    const { rerender } = render(<CodexAiVoiceControl status="listening" transcript="Urla’da arsa" onStop={onStop} />)
    const stop = screen.getByRole('button', { name: 'Ses kaydını durdur' })
    expect(stop.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(stop)
    expect(onStop).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status').textContent).toContain('Urla’da arsa')

    rerender(<CodexAiVoiceControl status="success" transcript="5 milyon altı" onTranscriptAccept={onAccept} />)
    fireEvent.click(screen.getByRole('button', { name: 'Metni kullan' }))
    expect(onAccept).toHaveBeenCalledWith('5 milyon altı')

    rerender(<CodexAiVoiceControl status="error" />)
    expect(screen.getByRole('alert').textContent).toContain('Tarayıcı iznini kontrol edin')

    rerender(<CodexAiVoiceControl compact status="idle" />)
    expect(screen.getByRole('button', { name: 'Sesle soru sor' })).toBeTruthy()
  })
})

