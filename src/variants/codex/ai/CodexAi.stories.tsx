import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
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
  type CodexAiConversationMessage,
  type CodexAiEvidence,
  type CodexAiRiskItem,
  type CodexAiSmartFilterItem,
  type CodexAiVisionFinding,
} from './CodexAi'

const meta = {
  title: 'Codex Enterprise/08 AI ve Güven/01 AI Bileşenleri',
  component: CodexAiPromptComposer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { defaultTheme: 'paper' },
    docs: {
      description: {
        component: 'Kaynak, güven, insan onayı, gizlilik ve güvenli hata dönüşünü AI deneyiminin ayrılmaz parçası yapan enterprise bileşen ailesi.',
      },
    },
  },
} satisfies Meta<typeof CodexAiPromptComposer>

export default meta
type Story = StoryObj<typeof meta>

const sources: CodexAiEvidence[] = [
  {
    id: 'zoning',
    title: '1/1000 uygulama imar planı notları',
    source: 'Urla Belediyesi açık veri kaydı',
    kind: 'official',
    url: '#imar-kaydi',
    excerpt: 'Konut alanında emsal 0,30; azami yapı yüksekliği iki kat olarak belirtiliyor.',
    updatedAt: '12 Tem 2026',
    verified: true,
    relevance: 98,
  },
  {
    id: 'listing',
    title: 'İlan #12490817 özellikleri',
    source: 'İlan sahibi beyanı',
    kind: 'listing',
    excerpt: '512 m², müstakil tapu, yola cepheli ve altyapıya yakın.',
    updatedAt: '17 Tem 2026',
    verified: false,
    relevance: 94,
  },
  {
    id: 'market',
    title: 'Urla merkez 90 günlük emsal özeti',
    source: 'Parsel piyasa endeksi',
    kind: 'market',
    excerpt: 'Benzer nitelikteki 18 doğrulanmış ilanın ortanca metrekare fiyatı 7.940 TL.',
    updatedAt: '18 Tem 2026',
    verified: true,
    relevance: 86,
  },
]

const smartFilters: CodexAiSmartFilterItem[] = [
  { id: 'location', label: 'Konum', value: 'İzmir · Urla', confidence: 99, reason: 'Soruda açıkça belirtildi.', locked: true },
  { id: 'budget', label: 'Azami bütçe', value: '5.000.000 TL', confidence: 98, reason: '“5 milyon altı” ifadesinden çıkarıldı.' },
  { id: 'deed', label: 'Tapu tipi', value: 'Müstakil tapu', confidence: 92, reason: 'Yatırım ölçütü olarak yorumlandı.' },
  { id: 'zoning', label: 'İmar', value: 'Konut imarlı', confidence: 64, reason: '“Ev yapılabilir” ifadesinden çıkarıldı.', warning: 'Bu ölçüt belediye kaydıyla doğrulanmalı.' },
]

const riskItems: CodexAiRiskItem[] = [
  {
    id: 'plan-date',
    title: 'İmar planı güncelliği belirsiz',
    description: 'İlan açıklamasındaki plan tarihi, belediyenin son yayın tarihiyle eşleşmiyor.',
    severity: 'high',
    recommendation: 'Ada/parsel numarasıyla güncel plan notunu belediyeden teyit edin.',
    evidenceIds: ['zoning', 'listing'],
  },
  {
    id: 'road',
    title: 'Yol cephesi görselde doğrulanamadı',
    description: 'Uydu görünümü ile fotoğraf arasındaki açı farkı nedeniyle yol bağlantısı kesinleştirilemedi.',
    severity: 'medium',
    recommendation: 'Kadastro yolunu resmî pafta üzerinde kontrol edin.',
    evidenceIds: ['listing'],
  },
  {
    id: 'price',
    title: 'Fiyat bölge aralığında',
    description: 'Metrekare fiyatı son 90 gündeki doğrulanmış emsallerin yüzde 7 üzerinde.',
    severity: 'low',
    status: 'resolved',
    evidenceIds: ['market'],
  },
]

const findings: CodexAiVisionFinding[] = [
  { id: 'retaining', label: 'İstinat yüzeyi', detail: 'Alt bölümde nem izi olabilecek renk değişimi görülüyor.', confidence: 78, severity: 'warning', region: { x: 28, y: 68 } },
  { id: 'facade', label: 'Cephe çatlağı olasılığı', detail: 'İnce çizgi düşük çözünürlük nedeniyle kesin sınıflandırılamadı.', confidence: 57, severity: 'danger', region: { x: 64, y: 38 } },
  { id: 'access', label: 'Araç erişimi', detail: 'Görselde parsel sınırına ulaşan stabilize yol seçiliyor.', confidence: 88, severity: 'info', region: { x: 76, y: 72 } },
]

const activities: CodexAiActivityItem[] = [
  { id: 'parse', label: 'Arama ölçütleri çıkarıldı', description: 'Konum, bütçe, tapu ve imar ölçütleri ayrıştırıldı.', tool: 'Sorgu ayrıştırıcı', time: '10:42:03', status: 'success' },
  { id: 'registry', label: 'Açık belediye kaydı taranıyor', description: 'Urla uygulama imar planı notları karşılaştırılıyor.', tool: 'Açık veri bağlayıcısı', time: '10:42:05', status: 'running', detail: 'GET /open-data/zoning?district=urla · kişisel veri gönderilmedi' },
  { id: 'private', label: 'Tapu belgesine erişim istendi', description: 'Kullanıcı tarafından sağlanan özel belge olmadan devam edilemez.', tool: 'Belge okuyucu', time: '10:42:06', status: 'needsApproval' },
  { id: 'message', label: 'Emlak danışmanına mesaj', description: 'Dışarıya mesaj göndermek için açık kullanıcı onayı gerekir.', tool: 'Mesajlaşma', status: 'queued' },
]

const messages: CodexAiConversationMessage[] = [
  { id: 'm1', role: 'system', content: 'Piyasa verileri 18 Temmuz 2026 itibarıyla güncel. Kişisel belge eklenmedi.', timestamp: '10:41' },
  { id: 'm2', role: 'user', content: 'Bu ilan çevredeki emsallere göre pahalı mı?', timestamp: '10:42' },
  {
    id: 'm3',
    role: 'assistant',
    content: 'İlanın 8.301 TL/m² fiyatı, doğrulanmış 18 emsalin 7.940 TL/m² ortancasından yaklaşık %4,5 yüksek. Yol cephesi ve müstakil tapu doğrulanırsa fark makul aralıkta; teklif öncesinde güncel imar kaydını kontrol edin.',
    timestamp: '10:42',
    reviewed: true,
    evidence: sources.slice(0, 2),
  },
]

function PromptInteractive() {
  const [prompt, setPrompt] = useState('')
  const [lastQuestion, setLastQuestion] = useState('')

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 820 }}>
      <CodexAiPromptComposer
        value={prompt}
        onValueChange={setPrompt}
        onSubmit={(question) => setLastQuestion(question)}
        onAttach={() => undefined}
        contextLabel="1 ilan seçili"
        suggestions={['Bu ilanın fiyatını emsallerle karşılaştır', 'İmar risklerini özetle', 'Görsellerde sorun var mı?']}
      />
      {lastQuestion ? <p role="status" style={{ margin: 0 }}>Gönderilen soru: <strong>{lastQuestion}</strong></p> : null}
    </div>
  )
}

export const PromptDefault: Story = {
  name: 'Prompt · Varsayılan ve öneriler',
  args: {},
  render: () => <PromptInteractive />,
}

export const PromptLoading: Story = {
  name: 'Prompt · Yükleniyor',
  args: {},
  render: () => (
    <CodexAiPromptComposer
      defaultValue="Urla’daki sonuçları imar ve fiyat açısından sırala"
      loading
      contextLabel="42 ilan taranıyor"
      onAttach={() => undefined}
    />
  ),
}

export const PromptError: Story = {
  name: 'Prompt · Hata ve gizlilik',
  args: {},
  render: () => (
    <CodexAiPromptComposer
      defaultValue="Tapu belgemdeki bilgileri analiz et"
      error="Belge numarası gibi hassas bilgiler algılandı. Göndermeden önce bu alanları maskeleyin."
      onAttach={() => undefined}
    />
  ),
}

export const AnswerLoading: Story = {
  name: 'Yanıt · Kaynaklar yükleniyor',
  args: {},
  render: () => <CodexAiAnswer status="loading" title="İlan karşılaştırması" />,
}

export const AnswerStreaming: Story = {
  name: 'Yanıt · Canlı akış',
  args: {},
  render: () => (
    <CodexAiAnswer status="streaming" title="İlan karşılaştırması" confidence={71} evidence={sources.slice(0, 1)}>
      <p>Urla merkezdeki doğrulanmış emsalleri taradım. İlanın metrekare fiyatı bölge ortancasının üzerinde, ancak yol cephesi ve müstakil tapu beyanı bu farkı kısmen</p>
    </CodexAiAnswer>
  ),
}

export const AnswerSuccess: Story = {
  name: 'Yanıt · Başarılı, güven ve dayanak',
  args: {},
  render: () => (
    <CodexAiAnswer status="success" title="İlan karşılaştırması" generatedAt="10:42" confidence={86} evidence={sources} humanReview="approved">
      <p>İlan fiyatı doğrulanmış bölge ortancasının yaklaşık <strong>%4,5 üzerinde</strong>. Yol cephesi ve müstakil tapu doğrulanırsa bu fark makul aralıkta kalıyor.</p>
      <ul><li>Fiyat: emsal aralığında, üst çeyreğe yakın</li><li>İmar: güncel belediye kaydıyla teyit edilmeli</li><li>Likidite: benzer ilanlar ortalama 46 günde kapanıyor</li></ul>
    </CodexAiAnswer>
  ),
}

export const AnswerWarning: Story = {
  name: 'Yanıt · Uyarı ve insan onayı',
  args: {},
  render: () => (
    <CodexAiAnswer
      status="warning"
      title="Yatırım uygunluğu"
      confidence={62}
      evidence={sources.slice(0, 2)}
      humanReview="required"
      onApprove={() => undefined}
      onReject={() => undefined}
    >
      <p>Getiri potansiyeli orta görünüyor; ancak imar planı tarihi ve kadastro yolu teyit edilmediği için teklif üretmek güvenli değil.</p>
    </CodexAiAnswer>
  ),
}

export const AnswerError: Story = {
  name: 'Yanıt · Hata ve güvenli geri dönüş',
  args: {},
  render: () => <CodexAiAnswer status="error" title="Emsal analizi" onRetry={() => undefined} />,
}

export const AnswerEmpty: Story = {
  name: 'Yanıt · Boş',
  args: {},
  render: () => <CodexAiAnswer status="empty" />,
}

export const EvidenceStates: Story = {
  name: 'Dayanak · Dolu ve boş',
  args: {},
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <CodexAiEvidenceList evidence={sources} />
      <CodexAiEvidenceList title="Eksik dayanak" evidence={[]} />
    </div>
  ),
}

export const ConfidenceScale: Story = {
  name: 'Güven · Düşük, orta, yüksek',
  args: {},
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
      <CodexAiConfidence score={38} description="Tek kaynak var ve kayıt tarihi belirsiz." factors={['Kaynak az', 'Kayıt eski']} />
      <CodexAiConfidence score={67} description="Kaynaklar tutarlı; belediye kaydı henüz teyit edilmedi." factors={['3 kaynak', '1 açık risk']} />
      <CodexAiConfidence score={91} description="Üç güncel ve bağımsız kaynak aynı sonucu destekliyor." factors={['Güncel kayıt', 'Tutarlı emsaller']} />
    </div>
  ),
}

function SmartFilterInteractive() {
  const [filters, setFilters] = useState(smartFilters)
  const [applied, setApplied] = useState(false)

  return (
    <CodexAiSmartFilter
      filters={filters}
      onFilterChange={(id, next) => setFilters((items) => items.map((item) => item.id === id ? { ...item, applied: next } : item))}
      onRemove={(id) => setFilters((items) => items.filter((item) => item.id !== id))}
      onApply={() => setApplied(true)}
      description={applied ? 'Seçili ölçütler aramaya uygulandı.' : undefined}
    />
  )
}

export const SmartFilterDefault: Story = {
  name: 'Akıllı filtre · İnceleme ve uygulama',
  args: {},
  render: () => <SmartFilterInteractive />,
}

export const SmartFilterStates: Story = {
  name: 'Akıllı filtre · Loading, error, empty',
  args: {},
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <CodexAiSmartFilter filters={[]} status="loading" />
      <CodexAiSmartFilter filters={[]} status="error" onRetry={() => undefined} />
      <CodexAiSmartFilter filters={[]} status="empty" />
    </div>
  ),
}

export const RiskReviewPending: Story = {
  name: 'Risk · Açık riskler ve karar',
  args: {},
  render: () => <CodexAiRiskReview risks={riskItems} onInspect={() => undefined} onResolve={() => undefined} onDecisionChange={() => undefined} />,
}

export const RiskReviewApproved: Story = {
  name: 'Risk · İnsan tarafından onaylandı',
  args: {},
  render: () => <CodexAiRiskReview risks={riskItems.map((risk) => ({ ...risk, status: 'resolved' }))} decision="approved" reviewer="Selin Kaya · Gayrimenkul Uzmanı" />,
}

export const VisionAnalyzing: Story = {
  name: 'Görsel inceleme · Analiz ediliyor',
  args: {},
  render: () => <CodexAiVisionInspection status="analyzing" findings={[]} photoLabel="Bahçe cephesi fotoğrafı" />,
}

export const VisionReady: Story = {
  name: 'Görsel inceleme · Bulgular',
  args: {},
  render: () => <CodexAiVisionInspection status="ready" findings={findings} photoLabel="İlanın kuzey cephe fotoğrafı" onRequestHumanReview={() => undefined} />,
}

export const VisionFallbacks: Story = {
  name: 'Görsel inceleme · Hata ve boş',
  args: {},
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <CodexAiVisionInspection status="error" findings={[]} onRetry={() => undefined} />
      <CodexAiVisionInspection status="empty" findings={[]} />
    </div>
  ),
}

function ActivityInteractive() {
  const [items, setItems] = useState(activities)
  const decide = (id: string, status: 'success' | 'warning') => setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item))
  return (
    <CodexAiAgentActivity
      items={items}
      live
      onCancel={() => setItems((current) => current.map((item) => item.status === 'running' ? { ...item, status: 'warning' } : item))}
      onInspect={() => undefined}
      onApprove={(item) => decide(item.id, 'success')}
      onReject={(item) => decide(item.id, 'warning')}
    />
  )
}

export const AgentActivity: Story = {
  name: 'Ajan etkinliği · Canlı ve onay kapılı',
  args: {},
  render: () => <ActivityInteractive />,
}

export const AgentActivityEmpty: Story = {
  name: 'Ajan etkinliği · Boş',
  args: {},
  render: () => <CodexAiAgentActivity items={[]} />,
}

export const ConversationDefault: Story = {
  name: 'Görüşme · Kaynaklı mesajlar',
  args: {},
  render: () => (
    <CodexAiConversation
      messages={messages}
      composer={<CodexAiPromptComposer label="Devam sorusu" placeholder="Bu sonuçla ilgili devam sorusu yazın" />}
    />
  ),
}

export const ConversationStreamingAndError: Story = {
  name: 'Görüşme · Streaming ve hata',
  args: {},
  render: () => (
    <CodexAiConversation
      loading
      onRetryMessage={() => undefined}
      messages={[
        { id: 's1', role: 'user', content: 'İmar risklerini tek tek açıkla.', timestamp: '10:48' },
        { id: 's2', role: 'assistant', content: 'Öncelikle plan tarihi tutarsızlığını kontrol ediyorum', status: 'streaming', timestamp: '10:48' },
        { id: 's3', role: 'assistant', content: 'Belediye kaydına erişim kesildi.', status: 'error', timestamp: '10:49' },
      ]}
    />
  ),
}

export const ConversationEmpty: Story = {
  name: 'Görüşme · Boş',
  args: {},
  render: () => <CodexAiConversation messages={[]} composer={<CodexAiPromptComposer />} />,
}

export const VoiceStates: Story = {
  name: 'Ses · Tüm durumlar',
  args: {},
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 16 }}>
      <CodexAiVoiceControl status="idle" onStart={() => undefined} />
      <CodexAiVoiceControl status="listening" transcript="Urla’da denize yakın" onStop={() => undefined} onCancel={() => undefined} />
      <CodexAiVoiceControl status="processing" transcript="Urla’da denize yakın arsa..." onCancel={() => undefined} />
      <CodexAiVoiceControl status="success" transcript="Urla’da denize yakın, 5 milyon TL altı arsa bul" onTranscriptAccept={() => undefined} />
      <CodexAiVoiceControl status="error" onStart={() => undefined} />
    </div>
  ),
}

export const MobileAssistant: Story = {
  name: 'Mobil · Uçtan uca AI asistanı',
  args: {},
  globals: { viewport: 'mobile1' },
  render: () => (
    <div style={{ width: 'min(100%, 390px)', marginInline: 'auto', display: 'grid', gap: 12 }}>
      <CodexAiConversation
        title="İlan asistanı"
        messages={messages.slice(1)}
        composer={
          <CodexAiPromptComposer
            label="Devam sorusu"
            contextLabel="1 ilan"
            voiceControl={<CodexAiVoiceControl compact status="idle" onStart={() => undefined} />}
          />
        }
      />
      <CodexAiSmartFilter filters={smartFilters.slice(0, 3)} onApply={() => undefined} />
    </div>
  ),
}
