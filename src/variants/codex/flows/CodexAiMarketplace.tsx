import { useState, type ReactNode } from 'react'
import {
  CodexAiAgentActivity,
  CodexAiAnswer,
  CodexAiConversation,
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
} from '../ai'
import { CodexBadge, CodexButton, CodexChip, CodexIconButton } from '../controls'
import { CodexEmptyState, CodexHeader, CodexListingCard, CodexNotice, CodexSurface } from '../content'
import { CodexDataTable, CodexMetricStrip, type CodexDataColumn } from '../data'
import {
  CodexAgencyCard,
  CodexFeatureGroup,
  CodexLocationCard,
  CodexPriceHeader,
  CodexTrustPanel,
  CodexValuationCard,
} from '../marketplace'
import { CodexSidebar, CodexToolbar, CodexToolbarGroup } from '../navigation'
import styles from './CodexAiMarketplace.module.css'

export type CodexAiMarketplaceVariant = 'discovery' | 'listing-intelligence' | 'portfolio-copilot' | 'moderation'
export type CodexAiMarketplaceState = 'ready' | 'loading' | 'empty' | 'error'

export interface CodexAiMarketplaceProps {
  variant?: CodexAiMarketplaceVariant
  state?: CodexAiMarketplaceState
}

const evidence: CodexAiEvidence[] = [
  { id: 'official-zoning', title: '1/1000 uygulama imar planı notları', source: 'Urla Belediyesi açık veri', kind: 'official', excerpt: 'Konut alanında emsal 0,30 ve azami yapı yüksekliği iki kat.', updatedAt: '12 Tem 2026', verified: true, relevance: 98 },
  { id: 'parcel', title: '118 ada / 24 parsel özeti', source: 'TKGM açık parsel kaydı', kind: 'official', excerpt: '512 m² yüzölçümü ve arsa niteliği eşleşiyor.', updatedAt: '17 Tem 2026', verified: true, relevance: 96 },
  { id: 'market', title: 'Urla 90 günlük emsal endeksi', source: 'Parsel piyasa verisi', kind: 'market', excerpt: '18 doğrulanmış ilanın ortanca m² fiyatı 7.940 TL.', updatedAt: '18 Tem 2026', verified: true, relevance: 91 },
]

const listings = [
  { id: 'urla', title: 'Denize yakın, imarlı köşe parsel', price: '4.250.000 TL', location: 'İzmir, Urla', meta: '512 m² · 8.301 TL/m² · Müstakil tapu', badge: 'EİDS doğrulandı', mediaTone: 'forest' as const },
  { id: 'guzelbahce', title: 'Villa imarlı, altyapısı hazır arsa', price: '4.680.000 TL', location: 'İzmir, Güzelbahçe', meta: '460 m² · 10.174 TL/m² · Müstakil tapu', badge: 'AI eşleşme %91', mediaTone: 'city' as const },
  { id: 'seferihisar', title: 'Yola cepheli geniş konut parseli', price: '3.760.000 TL', location: 'İzmir, Seferihisar', meta: '625 m² · 6.016 TL/m² · Belge inceleniyor', badge: 'Fiyat fırsatı', mediaTone: 'earth' as const },
  { id: 'cesme', title: 'Kıyı aksında turizm imarlı arsa', price: '6.940.000 TL', location: 'İzmir, Çeşme', meta: '780 m² · 8.897 TL/m² · Müstakil tapu', badge: 'Yeni', mediaTone: 'coast' as const },
]

const smartFilters: CodexAiSmartFilterItem[] = [
  { id: 'location', label: 'Konum', value: 'İzmir · Urla + 30 km', confidence: 99, reason: 'Sorguda açıkça belirtildi.', locked: true },
  { id: 'budget', label: 'Azami bütçe', value: '5.000.000 TL', confidence: 98, reason: '“5 milyon altı” ifadesinden çıkarıldı.' },
  { id: 'zoning', label: 'İmar', value: 'Konut imarlı', confidence: 87, reason: '“Ev yapılabilir” ölçütünden çıkarıldı.' },
  { id: 'deed', label: 'Tapu', value: 'Müstakil', confidence: 92, reason: 'Yatırım güvenliği tercihiyle eşleştirildi.' },
]

const visionFindings: CodexAiVisionFinding[] = [
  { id: 'road', label: 'Araç erişimi', detail: 'Parsel sınırına ulaşan stabilize yol görülüyor.', confidence: 91, severity: 'info', region: { x: 74, y: 70 } },
  { id: 'grade', label: 'Arazi eğimi', detail: 'Görselde yaklaşık %8–12 eğim olasılığı var.', confidence: 76, severity: 'warning', region: { x: 40, y: 50 } },
  { id: 'boundary', label: 'Sınır çizgisi belirsiz', detail: 'Fotoğrafta parsel köşeleri fiziksel işaretle doğrulanamıyor.', confidence: 68, severity: 'danger', region: { x: 23, y: 63 } },
]

const moderationRisks: CodexAiRiskItem[] = [
  { id: 'document-date', title: 'İmar belgesi güncel değil', description: 'Yüklenen belgenin tarihi belediyedeki son plan yayınından önce.', severity: 'high', recommendation: 'Güncel belgeyi belediye kaydından doğrulayın.', evidenceIds: ['official-zoning'] },
  { id: 'boundary', title: 'Görselde parsel sınırı doğrulanamıyor', description: 'Açıklamadaki iki yola cephe beyanı fotoğraflarda açıkça seçilemiyor.', severity: 'medium', recommendation: 'Pafta veya drone görüntüsü isteyin.', evidenceIds: ['parcel'] },
  { id: 'price', title: 'Fiyat kabul edilebilir emsal aralığında', description: 'Metrekare fiyatı doğrulanmış emsal ortancasının %4,5 üzerinde.', severity: 'low', status: 'resolved', evidenceIds: ['market'] },
]

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
}

function ChartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M4 19V9m6 10V5m6 14v-7m4 7H2" /></svg>
}

function AppHeader({ active = 'Ara' }: { active?: string }) {
  return (
    <CodexHeader
      compact
      links={['Ara', 'Harita', 'Değerleme', 'Mesajlar'].map((label) => ({ label, href: `/${label.toLocaleLowerCase('tr-TR')}`, active: label === active }))}
      actions={<><CodexButton variant="quiet" size="sm">Yardım</CodexButton><CodexButton size="sm">İlan ver</CodexButton></>}
    />
  )
}

function DiscoveryPage({ state }: { state: CodexAiMarketplaceState }) {
  const [filters, setFilters] = useState(smartFilters)
  const [favorites, setFavorites] = useState<string[]>(['urla'])
  const [prompt, setPrompt] = useState('Urla’da 5 milyon TL altı, ev yapılabilir müstakil tapulu arsa bul')
  const visibleListings = state === 'empty' ? [] : listings
  return (
    <div className={styles.page} data-flow="discovery">
      <AppHeader />
      <main id="main-content" className={styles.discoveryMain}>
        <section className={styles.discoveryHero} aria-labelledby="discovery-title">
          <div className={styles.heroCopy}>
            <CodexBadge tone="accent">Doğal dil + doğrulanmış veri</CodexBadge>
            <h1 id="discovery-title">Aradığınızı tarif edin. Ölçütleri siz onaylayın.</h1>
            <p>AI sorguyu filtrelere çevirir; tapu, imar, fiyat ve risk sonuçları kaynağıyla görünür. Sizin onayınız olmadan arama veya mesaj değişmez.</p>
          </div>
          <CodexAiPromptComposer
            label="Nasıl bir taşınmaz arıyorsunuz?"
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={() => undefined}
            contextLabel="Türkiye ilanları"
            loading={state === 'loading'}
            error={state === 'error' ? 'Piyasa veri servisine ulaşılamadı. Filtreleri elle düzenleyerek devam edebilirsiniz.' : undefined}
            suggestions={['İstanbul’da metroya yakın 2+1 daire', 'Ege’de turizm imarlı arsa', 'Ankara’da sahibinden satılık ofis']}
            voiceControl={<CodexAiVoiceControl compact onStart={() => undefined} />}
          />
        </section>

        {state === 'error' ? <CodexNotice tone="danger" title="AI araması geçici olarak kullanılamıyor" action={<CodexButton variant="quiet" size="sm">Standart aramaya geç</CodexButton>}>Mevcut filtreler ve kayıtlı aramalarınız korunuyor.</CodexNotice> : null}

        <div className={styles.discoveryLayout}>
          <aside className={styles.discoveryAside} aria-label="AI arama açıklaması">
            <CodexAiSmartFilter
              filters={filters}
              status={state === 'loading' ? 'loading' : state === 'error' ? 'error' : filters.length ? 'ready' : 'empty'}
              onFilterChange={(id, applied) => setFilters((items) => items.map((item) => item.id === id ? { ...item, applied } : item))}
              onRemove={(id) => setFilters((items) => items.filter((item) => item.id !== id))}
              onApply={() => undefined}
              onRetry={() => undefined}
            />
            <CodexAiAnswer
              title="Arama açıklaması"
              status={state === 'loading' ? 'loading' : state === 'error' ? 'error' : state === 'empty' ? 'warning' : 'success'}
              confidence={state === 'ready' ? 88 : state === 'empty' ? 54 : undefined}
              evidence={state === 'ready' ? evidence : []}
              humanReview="none"
              onRetry={() => undefined}
            >
              {state === 'empty' ? <p>Kesin ölçütlerle sonuç bulunamadı. Konum yarıçapını 50 km’ye veya bütçeyi 5,5 milyon TL’ye çıkarabilirsiniz.</p> : <p><strong>128 ilan</strong> tarandı; tapu ve imar verisi birlikte doğrulanan 24 sonuç öne alındı. Fiyat medyanı 4,18 milyon TL.</p>}
            </CodexAiAnswer>
          </aside>
          <section className={styles.results} aria-labelledby="results-title">
            <header className={styles.resultsHeader}>
              <div><p>İzmir · Urla + 30 km</p><h2 id="results-title">{state === 'loading' ? 'Sonuçlar hazırlanıyor' : `${visibleListings.length ? 24 : 0} güçlü eşleşme`}</h2></div>
              <div className={styles.resultActions}><CodexButton variant="secondary" size="sm">Sırala: AI uyumu</CodexButton><CodexButton variant="quiet" size="sm">Haritada göster</CodexButton></div>
            </header>
            {state === 'loading' ? (
              <div className={styles.listingGrid} aria-busy="true">{Array.from({ length: 4 }, (_, index) => <CodexSurface key={index} className={styles.listingSkeleton} aria-hidden />)}</div>
            ) : visibleListings.length ? (
              <div className={styles.listingGrid}>
                {visibleListings.map((listing) => <CodexListingCard key={listing.id} {...listing} badgeTone={listing.id === 'seferihisar' ? 'accent' : listing.id === 'cesme' ? 'info' : 'success'} favorite={favorites.includes(listing.id)} onFavoriteChange={(next) => setFavorites((current) => next ? [...current, listing.id] : current.filter((id) => id !== listing.id))} onOpen={() => undefined} />)}
              </div>
            ) : <CodexEmptyState title="Kesin ölçütlerle eşleşme yok" description="AI önerilerinden birini seçin veya filtreleri elle gevşetin." action={<CodexButton>Yakın sonuçları göster</CodexButton>} />}
          </section>
        </div>
      </main>
    </div>
  )
}

function ListingIntelligencePage({ state }: { state: CodexAiMarketplaceState }) {
  const [favorite, setFavorite] = useState(false)
  const [question, setQuestion] = useState('')
  const messages: CodexAiConversationMessage[] = state === 'empty' ? [] : [
    { id: 'system', role: 'system', content: 'TKGM ve belediye açık kayıtları 18 Temmuz 2026 itibarıyla kontrol edildi.', timestamp: '10:41' },
    { id: 'user', role: 'user', content: 'Bu parsel çevredeki emsallere göre pahalı mı?', timestamp: '10:42' },
    { id: 'assistant', role: 'assistant', content: '8.301 TL/m² fiyatı doğrulanmış emsal ortancasının %4,5 üzerinde. İki yola cephe doğrulanırsa bu fark makul aralıkta.', timestamp: '10:42', evidence: evidence.slice(0, 2), reviewed: true },
  ]
  return (
    <div className={styles.page} data-flow="listing-intelligence">
      <AppHeader active="Ara" />
      <main id="main-content" className={styles.detailMain}>
        <CodexPriceHeader
          title="Denize yakın, iki yola cepheli konut imarlı köşe parsel"
          location="İzmir · Urla · Kalabak"
          referenceId="11842891"
          price="4.250.000 TL"
          unitPrice="8.301 TL/m²"
          previousPrice="4.480.000 TL"
          badges={<><CodexBadge tone="success" dot>EİDS doğrulandı</CodexBadge><CodexBadge tone="accent">AI uyumu %92</CodexBadge><CodexBadge>Fiyat düştü</CodexBadge></>}
          favorite={favorite}
          onFavoriteChange={setFavorite}
          actions={<CodexButton>Satıcıya yaz</CodexButton>}
        />

        {state === 'error' ? <CodexNotice tone="danger" title="Bazı intelligence kaynakları yenilenemedi">Son doğrulanmış değerler gösteriliyor; tarihleri kontrol edin.</CodexNotice> : null}

        <div className={styles.detailGrid}>
          <div className={styles.detailPrimary}>
            <CodexAiVisionInspection
              title="Fotoğraf ve arazi incelemesi"
              status={state === 'loading' ? 'analyzing' : state === 'error' ? 'error' : state === 'empty' ? 'empty' : 'ready'}
              findings={state === 'ready' ? visionFindings : []}
              photoLabel="Urla köşe parsel kuzey ve yol cephesi görünümü"
              onRetry={() => undefined}
              onRequestHumanReview={() => undefined}
            />
            <CodexFeatureGroup title="Doğrulanmış parsel özellikleri" sections={[
              { id: 'official', title: 'Resmî kayıtlar', items: [{ id: 'deed', label: 'Müstakil tapu', available: true }, { id: 'area', label: 'Yüzölçümü', value: '512 m²', available: true }, { id: 'zoning', label: 'Konut imarı', value: 'Emsal 0,30', available: true }, { id: 'encumbrance', label: 'Şerh veya ipotek', available: false }] },
              { id: 'site', title: 'Saha ve erişim', items: [{ id: 'road', label: 'Kadastro yolu', available: true }, { id: 'front', label: 'İki yola cephe', value: '34 m', available: true }, { id: 'slope', label: 'Eğim', value: 'Tahmini %8–12', available: true }, { id: 'utilities', label: 'Altyapı parsel sınırında', available: true }] },
            ]} />
            <CodexLocationCard title="Urla · Kalabak" address="118 ada çevresi · yaklaşık konum" facts={[{ label: 'Denize', value: '900 m' }, { label: 'Merkeze', value: '4,8 km' }, { label: 'Ana yola', value: '320 m' }]} nearby={['Sahil · 900 m', 'Devlet hastanesi · 5,2 km', 'İlkokul · 1,1 km']} onOpenMap={() => undefined} />
          </div>
          <aside className={styles.detailAside} aria-label="İlan intelligence özeti">
            <CodexValuationCard estimate="4.310.000 TL" low="4.080.000 TL" high="4.560.000 TL" confidence={state === 'error' ? 61 : 86} updatedAt="18 Temmuz 2026" comparables={state === 'error' ? 9 : 27} drivers={[{ label: 'İki yola cephe', effect: '+%4,8', direction: 'positive' }, { label: 'Denize 900 m', effect: '+%3,1', direction: 'positive' }, { label: 'Merkeze 4,8 km', effect: '−%1,2', direction: 'negative' }]} onOpenReport={() => undefined} />
            <CodexTrustPanel score={84} compact signals={[
              { id: 'identity', label: 'İlan sahibi kimliği', description: 'EİDS eşleşti', status: 'verified' },
              { id: 'authority', label: 'İlan verme yetkisi', description: 'EİDS eşleşti', status: 'verified' },
              { id: 'parcel', label: 'Ada / parsel kaydı', description: 'TKGM eşleşti', status: 'verified' },
              { id: 'zoning', label: 'İmar belgesi', description: 'Güncel nüsha bekleniyor', status: 'pending' },
            ]} />
            <CodexAgencyCard name="Ege Parsel Gayrimenkul" location="Urla, İzmir" verified premium responseTime="18 dakika" activeSince="Mart 2014" compact onViewStore={() => undefined} onContact={() => undefined} />
          </aside>
        </div>
        <CodexAiConversation
          title="Bu ilan hakkında AI asistana sor"
          messages={messages}
          loading={state === 'loading'}
          composer={<CodexAiPromptComposer label="Devam sorusu" value={question} onValueChange={setQuestion} onSubmit={() => setQuestion('')} contextLabel="İlan #11842891" suggestions={['Teklif aralığı öner', 'İmar risklerini açıkla', 'Satıcıya sorulacakları hazırla']} />}
        />
      </main>
    </div>
  )
}

interface PortfolioRow {
  id: string
  title: string
  city: string
  price: string
  views: number
  leads: number
  aiStatus: 'Hazır' | 'İncelenmeli' | 'Çalışıyor'
}

const portfolioRows: PortfolioRow[] = [
  { id: 'ILN-48291', title: 'Urla köşe parsel', city: 'İzmir', price: '4.250.000 TL', views: 1284, leads: 38, aiStatus: 'Hazır' },
  { id: 'ILN-48277', title: 'Gölbaşı yatırımlık tarla', city: 'Ankara', price: '1.850.000 TL', views: 742, leads: 16, aiStatus: 'Çalışıyor' },
  { id: 'ILN-48193', title: 'Kaş turizm imarlı arsa', city: 'Antalya', price: '6.900.000 TL', views: 2411, leads: 64, aiStatus: 'İncelenmeli' },
  { id: 'ILN-48056', title: 'Nilüfer villa parseli', city: 'Bursa', price: '3.100.000 TL', views: 896, leads: 21, aiStatus: 'Hazır' },
]

const portfolioColumns: Array<CodexDataColumn<PortfolioRow>> = [
  { key: 'title', header: 'İlan', sortable: true, render: (row) => <span className={styles.tableEntity}><strong>{row.title}</strong><small>{row.id} · {row.city}</small></span> },
  { key: 'price', header: 'Fiyat', align: 'end', render: (row) => row.price },
  { key: 'views', header: 'Görüntülenme', align: 'end', sortable: true, render: (row) => row.views.toLocaleString('tr-TR') },
  { key: 'leads', header: 'Talep', align: 'end', sortable: true, render: (row) => row.leads },
  { key: 'aiStatus', header: 'AI durumu', render: (row) => <CodexBadge tone={row.aiStatus === 'Hazır' ? 'success' : row.aiStatus === 'Çalışıyor' ? 'info' : 'warning'} dot>{row.aiStatus}</CodexBadge> },
]

function PortfolioCopilotPage({ state }: { state: CodexAiMarketplaceState }) {
  const [selected, setSelected] = useState<string[]>(['ILN-48291', 'ILN-48193'])
  const [activities, setActivities] = useState<CodexAiActivityItem[]>([
    { id: 'stats', label: 'Portföy performansı toplandı', description: '184 aktif ilanın son 30 günlük görünüm ve talep verisi özetlendi.', tool: 'Portföy analitiği', time: '09:41:02', status: 'success' },
    { id: 'pricing', label: 'Fiyat sapmaları taranıyor', description: 'Bölge emsallerinden %12’den fazla ayrışan 18 ilan inceleniyor.', tool: 'Fiyat modeli', time: '09:41:04', status: state === 'loading' ? 'running' : 'success' },
    { id: 'bulk', label: '6 ilana fiyat güncellemesi önerildi', description: 'Dışarıya yansımadan önce portföy yöneticisi onayı gerekli.', tool: 'Toplu düzenleme', time: '09:41:09', status: 'needsApproval' },
    { id: 'message', label: 'Danışmanlara görev mesajı', description: '18 danışmana mesaj gönderme işlemi açık izin bekliyor.', tool: 'Kurumsal mesajlaşma', status: 'queued' },
  ])
  const visibleRows = state === 'empty' ? [] : portfolioRows
  const decide = (id: string, status: 'success' | 'warning') => setActivities((items) => items.map((item) => item.id === id ? { ...item, status } : item))
  return (
    <div className={styles.enterprisePage} data-flow="portfolio-copilot">
      <CodexSidebar
        sections={[
          { id: 'workspace', label: 'Çalışma alanı', items: [{ id: 'overview', label: 'Genel bakış', icon: <ChartIcon /> }, { id: 'listings', label: 'İlanlar', badge: '184' }, { id: 'messages', label: 'Mesajlar', badge: '12' }] },
          { id: 'ai', label: 'Yapay zekâ', items: [{ id: 'copilot', label: 'Portföy asistanı', icon: <SearchIcon /> }, { id: 'review', label: 'İnceleme kuyruğu', badge: '6' }] },
          { id: 'system', items: [{ id: 'settings', label: 'Ayarlar' }] },
        ]}
        defaultActiveId="copilot"
        brand="Parsel Pro"
        footer={<p>Kurumsal · 18 kullanıcı</p>}
      />
      <main className={styles.enterpriseMain}>
        <header className={styles.enterpriseHeader}>
          <div><p>Kurumsal portföy · Ege bölgesi</p><h1>Portföy asistanı</h1></div>
          <div><CodexButton variant="secondary">Rapor oluştur</CodexButton><CodexButton>Yeni ilan</CodexButton></div>
        </header>
        <CodexMetricStrip items={[
          { id: 'live', label: 'Aktif ilan', value: '184', change: '%3,4', direction: 'up' },
          { id: 'views', label: 'Görüntülenme', value: '48.296', change: '%8,7', direction: 'up' },
          { id: 'leads', label: 'Nitelikli talep', value: '1.246', change: '%2,1', direction: 'down' },
          { id: 'response', label: 'Yanıt süresi', value: '18 dk', change: '−6 dk', direction: 'up' },
        ]} />
        {state === 'error' ? <CodexNotice tone="danger" title="Fiyat modeli son veriye ulaşamadı">Son başarılı model çıktısı 17 Temmuz 22:10 tarihli. Toplu değişiklik kapalı.</CodexNotice> : null}
        <div className={styles.enterpriseGrid}>
          <section className={styles.portfolioTable} aria-labelledby="portfolio-title">
            <CodexToolbar label="Portföy araçları">
              <CodexToolbarGroup label="Seçim"><CodexBadge tone={selected.length ? 'accent' : 'neutral'}>{selected.length} seçili</CodexBadge><CodexButton variant="secondary" size="sm" disabled={!selected.length}>Toplu düzenle</CodexButton></CodexToolbarGroup>
              <CodexToolbarGroup label="Görünüm" separated><CodexChip selected>Aktif</CodexChip><CodexChip>İncelemede</CodexChip></CodexToolbarGroup>
            </CodexToolbar>
            <h2 id="portfolio-title" className={styles.srOnly}>Kurumsal portföy tablosu</h2>
            <CodexDataTable caption="Kurumsal portföy" columns={portfolioColumns} rows={visibleRows} loading={state === 'loading'} selectedIds={selected} onSelectionChange={setSelected} getRowLabel={(row) => row.title} emptyTitle="Bu görünümde ilan yok" emptyDescription="Durum filtresini değiştirin veya yeni ilan ekleyin." rowActions={(row) => <CodexIconButton size="sm" label={`${row.title} işlemleri`}>•••</CodexIconButton>} />
          </section>
          <aside className={styles.copilotPanel} aria-label="AI ajan denetimi">
            <CodexAiAgentActivity
              items={state === 'empty' ? [] : activities}
              live
              onInspect={() => undefined}
              onApprove={(item) => decide(item.id, 'success')}
              onReject={(item) => decide(item.id, 'warning')}
              onCancel={() => setActivities((items) => items.map((item) => item.status === 'running' ? { ...item, status: 'warning' } : item))}
            />
          </aside>
        </div>
      </main>
    </div>
  )
}

interface ModerationRow {
  id: string
  title: string
  account: string
  risk: 'Kritik' | 'Yüksek' | 'Orta'
  age: string
}

const moderationRows: ModerationRow[] = [
  { id: 'MOD-1982', title: 'Kaş turizm imarlı arsa', account: 'Likya Emlak', risk: 'Kritik', age: '12 dk' },
  { id: 'MOD-1974', title: 'Urla köşe parsel', account: 'Ege Parsel', risk: 'Yüksek', age: '34 dk' },
  { id: 'MOD-1961', title: 'Gölbaşı yatırımlık tarla', account: 'Başkent Arazi', risk: 'Orta', age: '1 sa 18 dk' },
]

const moderationColumns: Array<CodexDataColumn<ModerationRow>> = [
  { key: 'title', header: 'İlan', render: (row) => <span className={styles.tableEntity}><strong>{row.title}</strong><small>{row.id}</small></span> },
  { key: 'account', header: 'Hesap', render: (row) => row.account },
  { key: 'risk', header: 'Risk', render: (row) => <CodexBadge tone={row.risk === 'Kritik' ? 'danger' : 'warning'} dot>{row.risk}</CodexBadge> },
  { key: 'age', header: 'Bekleme', align: 'end', render: (row) => row.age },
]

function ModerationPage({ state }: { state: CodexAiMarketplaceState }) {
  const [decision, setDecision] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [risks, setRisks] = useState(moderationRisks)
  const queue = state === 'empty' ? [] : moderationRows
  return (
    <div className={styles.page} data-flow="moderation">
      <AppHeader active="Mesajlar" />
      <main id="main-content" className={styles.moderationMain}>
        <header className={styles.enterpriseHeader}><div><p>Güven operasyonu</p><h1>AI destekli inceleme kuyruğu</h1></div><div><CodexBadge tone="danger" dot>3 öncelikli</CodexBadge><CodexButton variant="secondary">Vardiya özeti</CodexButton></div></header>
        <CodexNotice tone="info" title="AI karar vermez; önceliklendirir">Yayınlama, reddetme ve kullanıcıya yaptırım uygulama kararı yalnız yetkili insan incelemesiyle tamamlanır.</CodexNotice>
        <div className={styles.moderationGrid}>
          <section aria-labelledby="queue-title"><h2 id="queue-title">İnceleme kuyruğu</h2><CodexDataTable caption="Risk inceleme kuyruğu" columns={moderationColumns} rows={queue} loading={state === 'loading'} emptyTitle="İnceleme kuyruğu boş" emptyDescription="Yeni riskli kayıtlar oluştuğunda burada önceliklendirilecek." /></section>
          <section aria-labelledby="case-title" className={styles.casePanel}>
            <h2 id="case-title">MOD-1982 · Kaş turizm imarlı arsa</h2>
            {state === 'error' ? <CodexNotice tone="danger" title="Belge okuyucuya ulaşılamıyor">İlanı otomatik reddetmeyin; belgeyi elle açarak inceleyin.</CodexNotice> : null}
            <CodexAiRiskReview risks={state === 'empty' ? [] : risks} decision={decision} reviewer={decision === 'pending' ? undefined : 'Selin Kaya · Güven Uzmanı'} onInspect={() => undefined} onResolve={(risk) => setRisks((items) => items.map((item) => item.id === risk.id ? { ...item, status: 'resolved' } : item))} onDecisionChange={setDecision} />
            <CodexAiVisionInspection status={state === 'loading' ? 'analyzing' : state === 'error' ? 'error' : state === 'empty' ? 'empty' : 'ready'} findings={state === 'ready' ? visionFindings : []} photoLabel="Moderasyon için yüklenen parsel cephe fotoğrafı" onRetry={() => undefined} onRequestHumanReview={() => undefined} />
          </section>
        </div>
      </main>
    </div>
  )
}

export function CodexAiMarketplace({ variant = 'discovery', state = 'ready' }: CodexAiMarketplaceProps) {
  if (variant === 'listing-intelligence') return <ListingIntelligencePage state={state} />
  if (variant === 'portfolio-copilot') return <PortfolioCopilotPage state={state} />
  if (variant === 'moderation') return <ModerationPage state={state} />
  return <DiscoveryPage state={state} />
}

export function CodexAiFlowFrame({ children }: { children: ReactNode }) {
  return <div className={styles.flowFrame}>{children}</div>
}
