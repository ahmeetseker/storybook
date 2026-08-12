import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  GlassAiSearchBar,
  GlassAlert,
  GlassButton,
  GlassCheckbox,
  GlassChip,
  GlassCompareBar,
  GlassCompareTable,
  GlassDrawer,
  GlassEmptyState,
  GlassFilterPanel,
  GlassSkeleton,
  GlassSelect,
  GlassTextarea,
  useGlassToast,
} from '@repo/ui'
import { AppointmentSchedulerModal, availabilityPreview } from '@/features/appointments'
import { sendOfficeMessage } from '@/features/messages/data/office-message-store'
import { officeProposalFilterId } from './domain/office-ai'
import type { OfficeSearchResponse } from './data/office-adapter'
import type { OfficeSearchState } from './domain/office-search-state'
import type {
  OfficeActionDraft,
  OfficeActionType,
  OfficeAiProposal,
  OfficeEvidenceSource,
  OfficeMatch,
  OfficeSummary,
} from './domain/office-types'
import { PageContainer } from '@/components/PageContainer'
import styles from './OfficeDirectoryView.module.css'

type HistoryMode = 'push' | 'replace'

export interface OfficeDirectoryViewProps {
  state: OfficeSearchState
  response?: OfficeSearchResponse
  matches?: OfficeMatch[]
  status: 'loading' | 'refreshing' | 'success' | 'error'
  aiProposal?: OfficeAiProposal
  selectedOfficeId?: string
  compareIds: string[]
  actionDraft?: OfficeActionDraft
  errorMessage?: string
  onRetry?: () => void
  onStateChange(next: OfficeSearchState, options: { history: HistoryMode }): void
  onAiSearch(query: string): void
  onSelectOffice(id: string): void
  onToggleCompare(id: string): void
  onStartAction(action: OfficeActionType, id: string): void
  onApplyProposal(): void
  onDismissProposal(): void
  /** AI teklifindeki tekil filtrenin gözden geçirilerek kaldırılması istenir. */
  onRemoveProposalFilter?: (id: string) => void
  onConfirmAction(): void
  onCloseAction(): void
}

const INTENT_OPTIONS = [
  { value: 'buy', label: 'Ev almak istiyorum' },
  { value: 'rent', label: 'Ev kiralamak istiyorum' },
  { value: 'sell', label: 'Mülkümü satmak istiyorum' },
  { value: 'valuate', label: 'Değerleme yaptırmak istiyorum' },
] as const

const EXPERTISE_OPTIONS = [
  ['land', 'Arsa'],
  ['zoning', 'İmar'],
  ['valuation', 'Değerleme'],
  ['investment', 'Yatırım'],
  ['commercial', 'Ticari'],
  ['touristic', 'Turizm'],
] as const

const PROPERTY_OPTIONS = [
  ['', 'Tüm mülk tipleri'],
  ['residential', 'Konut'],
  ['land', 'Arsa'],
  ['commercial', 'İş yeri'],
  ['building', 'Bina'],
  ['timeshare', 'Devremülk'],
  ['touristic', 'Turistik tesis'],
] as const

const CITY_OPTIONS = [
  ['', 'Tüm Türkiye'],
  ['izmir', 'İzmir'],
  ['istanbul', 'İstanbul'],
  ['ankara', 'Ankara'],
  ['bursa', 'Bursa'],
  ['muğla', 'Muğla'],
  ['antalya', 'Antalya'],
] as const

const DISTRICT_OPTIONS = [
  ['', 'Tüm ilçeler'],
  ['urla', 'Urla'],
  ['çeşme', 'Çeşme'],
  ['karşıyaka', 'Karşıyaka'],
  ['kadıköy', 'Kadıköy'],
  ['beşiktaş', 'Beşiktaş'],
  ['çankaya', 'Çankaya'],
  ['bodrum', 'Bodrum'],
] as const

const LANGUAGE_OPTIONS = [
  ['', 'Tüm diller'],
  ['Türkçe', 'Türkçe'],
  ['English', 'English'],
  ['Deutsch', 'Deutsch'],
] as const

const SORT_OPTIONS = [
  ['match', 'En uygun eşleşme'],
  ['response', 'En hızlı yanıt'],
  ['portfolio', 'En geniş portföy'],
  ['rating', 'En yüksek puan'],
] as const

const EVIDENCE_SOURCE_LABELS: Record<OfficeEvidenceSource, string> = {
  'listing-data': 'İlan verisi',
  'office-profile': 'Ofis profili',
  'verified-transaction': 'Doğrulanmış işlem',
  review: 'Kullanıcı değerlendirmesi',
}

const ACTION_CONFIRM_TITLES: Record<OfficeActionType, string> = {
  message: 'Mesajı onayla',
  meeting: 'Görüşme talebini onayla',
  offer: 'Teklif talebini onayla',
}

function updateState(
  state: OfficeSearchState,
  update: Partial<OfficeSearchState>,
): OfficeSearchState {
  return { ...state, ...update, page: 1 }
}

function toggleItem(items: string[], item: string): string[] {
  return items.includes(item)
    ? items.filter((value) => value !== item)
    : [...items, item]
}

function matchFor(officeId: string, matches: OfficeMatch[] | undefined): OfficeMatch | undefined {
  return matches?.find((match) => match.officeId === officeId)
}

function selectedOffice(
  response: OfficeSearchResponse | undefined,
  id: string | undefined,
): OfficeSummary | undefined {
  return response?.items.find((office) => office.id === id)
}

function OfficeFilterForm({
  state,
  response,
  onChange,
  onReset,
  footer,
}: {
  state: OfficeSearchState
  response?: OfficeSearchResponse
  onChange: (next: OfficeSearchState) => void
  onReset: () => void
  footer?: ReactNode
}) {
  const filterId = useId()
  return (
    <GlassFilterPanel
      label="Ofis filtreleri"
      title="Filtreler"
      resultCount={response?.total}
      resultLabel={(count) => `${count} ofis`}
      onReset={onReset}
      material="flat"
      footer={footer}
      className={styles.filterPanel}
    >
      <div className={styles.filterGroup}>
        <p className={styles.filterLabel}>Amaç</p>
        <div className={styles.filterChips}>
          {INTENT_OPTIONS.map((option) => (
            <GlassChip
              key={option.value}
              size="sm"
              selected={state.intent === option.value}
              onSelectedChange={() => onChange(updateState(state, { intent: option.value, expertise: [] }))}
            >
              {option.label.replace(' istiyorum', '')}
            </GlassChip>
          ))}
        </div>
      </div>
      <div className={styles.filterGroup}>
        <p className={styles.filterLabel}>Uzmanlık</p>
        <div className={styles.filterChips}>
          {EXPERTISE_OPTIONS.map(([value, label]) => (
            <GlassChip
              key={value}
              size="sm"
              selected={state.expertise.includes(value)}
              onSelectedChange={() => onChange(updateState(state, { expertise: toggleItem(state.expertise, value) }))}
            >
              {label}
            </GlassChip>
          ))}
        </div>
      </div>
      <div className={styles.filterGroup}>
        <p className={styles.filterLabel}>Mülk ve bölge</p>
        <div className={styles.selectStack}>
          <label htmlFor={`${filterId}-property`}>
            Mülk tipi
            <GlassSelect id={`${filterId}-property`} options={PROPERTY_OPTIONS.map(([value, label]) => ({ value, label }))} value={state.propertyType ?? ''} onChange={(propertyType) => onChange(updateState(state, { propertyType: propertyType || undefined }))} />
          </label>
          <label htmlFor={`${filterId}-city`}>
            Şehir
            <GlassSelect id={`${filterId}-city`} options={CITY_OPTIONS.map(([value, label]) => ({ value, label }))} value={state.city ?? ''} onChange={(city) => onChange(updateState(state, { city: city || undefined, district: undefined }))} />
          </label>
          <label htmlFor={`${filterId}-district`}>
            İlçe
            <GlassSelect id={`${filterId}-district`} options={DISTRICT_OPTIONS.map(([value, label]) => ({ value, label }))} value={state.district ?? ''} onChange={(district) => onChange(updateState(state, { district: district || undefined }))} />
          </label>
        </div>
      </div>
      <div className={styles.filterGroup}>
        <p className={styles.filterLabel}>Güven ve hız</p>
        <div className={styles.checkStack}>
          <GlassCheckbox
            label="Yalnız doğrulanmış ofisler"
            checked={state.verifiedOnly}
            onChange={() => onChange(updateState(state, { verifiedOnly: !state.verifiedOnly }))}
          />
          <GlassCheckbox
            label="30 dakika içinde yanıtlar"
            checked={state.maxResponseMinutes === 30}
            onChange={() => onChange(updateState(state, { maxResponseMinutes: state.maxResponseMinutes === 30 ? undefined : 30 }))}
          />
        </div>
      </div>
      <div className={styles.filterGroup}>
        <p className={styles.filterLabel}>Kapasite ve deneyim</p>
        <div className={styles.checkStack}>
          <GlassCheckbox label="En az 10 danışman" checked={state.minConsultants === 10} onChange={() => onChange(updateState(state, { minConsultants: state.minConsultants === 10 ? undefined : 10 }))} />
          <GlassCheckbox label="En az 40 aktif ilan" checked={state.minActiveListings === 40} onChange={() => onChange(updateState(state, { minActiveListings: state.minActiveListings === 40 ? undefined : 40 }))} />
          <GlassCheckbox label="Satış tecrübesi" checked={state.transactionExperience === 'sell'} onChange={() => onChange(updateState(state, { transactionExperience: state.transactionExperience === 'sell' ? undefined : 'sell' }))} />
          <GlassCheckbox label="Kiralama tecrübesi" checked={state.transactionExperience === 'rent'} onChange={() => onChange(updateState(state, { transactionExperience: state.transactionExperience === 'rent' ? undefined : 'rent' }))} />
        </div>
      </div>
      <div className={styles.filterGroup}>
        <p className={styles.filterLabel}>Dil ve sıralama</p>
        <div className={styles.selectStack}>
          <label htmlFor={`${filterId}-language`}>
            Hizmet dili
            <GlassSelect id={`${filterId}-language`} options={LANGUAGE_OPTIONS.map(([value, label]) => ({ value, label }))} value={state.language ?? ''} onChange={(language) => onChange(updateState(state, { language: language || undefined }))} />
          </label>
          <label htmlFor={`${filterId}-sort`}>
            Sıralama
            <GlassSelect id={`${filterId}-sort`} options={SORT_OPTIONS.map(([value, label]) => ({ value, label }))} value={state.sort} onChange={(sort) => onChange(updateState(state, { sort: sort as OfficeSearchState['sort'] }))} />
          </label>
        </div>
      </div>
    </GlassFilterPanel>
  )
}

function OfficeInsightPanel({
  office,
  match,
  onAction,
  onClose,
}: {
  office?: OfficeSummary
  match?: OfficeMatch
  onAction: (action: OfficeActionType, id: string) => void
  onClose?: () => void
}) {
  if (!office) {
    return (
      <aside className={styles.insightEmpty} aria-label="AI içgörüleri">
        <p className={styles.eyebrow}>AI İÇGÖRÜ</p>
        <h2>Bir ofis seçin</h2>
        <p>Seçtiğiniz ofisin eşleşme gerekçesini, kaynaklarını ve sonraki en güvenli adımı burada göreceksiniz.</p>
      </aside>
    )
  }

  return (
    <aside className={styles.insightPanel} aria-label={`${office.name} içgörüleri`}>
      <div className={styles.insightHeading}>
        <div>
          <p className={styles.eyebrow}>AI İÇGÖRÜ</p>
          <h2>Neden bu ofis?</h2>
        </div>
        {onClose ? <button type="button" className={styles.closeButton} onClick={onClose} aria-label="İçgörüleri kapat">×</button> : null}
      </div>
      <p className={styles.insightOffice}>{office.name}</p>
      {match ? (
        <>
          <div className={styles.scoreRow}>
            <strong>%{match.score}</strong>
            <span>Eşleşme skoru</span>
          </div>
          <ul className={styles.reasonList}>
            {match.reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </>
      ) : null}
      <div className={styles.evidenceBlock}>
        <h3>Kanıt kaynakları</h3>
        <ul className={styles.evidenceList}>
          {(match?.evidence ?? office.evidence).map((evidence) => (
            <li key={`${evidence.source}-${evidence.label}`}>
              <span>{EVIDENCE_SOURCE_LABELS[evidence.source]}</span>
              <strong>{evidence.label}</strong>
              <small>{evidence.value}</small>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.insightActions}>
        <GlassButton onClick={() => onAction('meeting', office.id)}>Görüşme talep et</GlassButton>
        <GlassButton onClick={() => onAction('offer', office.id)}>Teklif iste</GlassButton>
      </div>
    </aside>
  )
}

function OfficeResultCard({
  office,
  match,
  compared,
  compareLimitReached,
  onSelect,
  onToggleCompare,
  onStartAction,
}: {
  office: OfficeSummary
  match?: OfficeMatch
  compared: boolean
  compareLimitReached: boolean
  onSelect: () => void
  onToggleCompare: () => void
  onStartAction: (action: OfficeActionType) => void
}) {
  const evidence = match?.evidence[0] ?? office.evidence[0]
  // Müsaitlik önizlemesi `new Date()`e bağlı: sunucu render'ı ile istemcinin
  // ilk render'ı arasında saat gece yarısını/saat dilimi sınırını geçerse
  // metin FARKLI üretilir → React hydration mismatch uyarısı. `mounted`
  // bayrağı sunucu HTML'inde her zaman sabit bir yer tutucu üretir; gerçek
  // (saate bağlı) metin yalnız istemcide, ilk commit sonrası effect'te
  // devreye girer — böylece sunucu/istemci ilk render çıktısı hep eşleşir.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <article className={styles.resultCard} aria-label={`${office.name} ofisi`}>
      <div className={styles.cardTopline}>
        {match ? <span className={styles.matchScore}>%{match.score} eşleşme</span> : <span className={styles.matchScore}>Profil eşleşmesi</span>}
        <button type="button" className={styles.insightTrigger} onClick={onSelect} aria-label={`${office.name} içgörülerini aç`}>
          Neden önerildi?
        </button>
      </div>
      <div className={styles.cardIdentity}>
        {office.logoSrc ? (
          <img className={styles.cardLogo} src={office.logoSrc} alt="" />
        ) : (
          <span className={styles.cardLogoFallback} aria-hidden>{office.name.slice(0, 2).toUpperCase()}</span>
        )}
        <div>
          <h3 className={styles.cardName}>
            {office.name}
            {office.verified ? (
              <span
                className={styles.verifiedMark}
                role="img"
                aria-label={office.verifiedBy ? `Doğrulanmış kurumsal ofis: ${office.verifiedBy}` : 'Doğrulanmış kurumsal ofis'}
                title={office.verifiedBy ?? 'Doğrulanmış'}
              >
                ✓
              </span>
            ) : null}
          </h3>
          <p className={styles.cardTagline}>{office.tagline}</p>
        </div>
      </div>
      <dl className={styles.cardStats}>
        <div><dt>Aktif ilan</dt><dd>{office.activeListings}</dd></div>
        <div><dt>Yanıt</dt><dd>{office.responseMinutes} dk</dd></div>
        <div><dt>Puan</dt><dd>{office.rating} ({office.reviewCount})</dd></div>
      </dl>
      <p className={styles.cardAvailability}>
        {mounted ? availabilityPreview(office.id, new Date()) : 'Müsaitlik yükleniyor…'}
      </p>
      <div className={styles.cardMeta}>
        <span>{office.districts.slice(0, 2).join(' · ')}</span>
        {evidence ? <span className={styles.evidenceBadge} title={evidence.value}>{EVIDENCE_SOURCE_LABELS[evidence.source]} · {evidence.label}</span> : null}
        <span>{office.lastActiveLabel}</span>
      </div>
      <div className={styles.cardActions}>
        <GlassButton prominent onClick={() => onStartAction('meeting')}>Görüşme talep et</GlassButton>
        <GlassButton material="flat" onClick={() => onStartAction('message')}>Mesaj</GlassButton>
        <button type="button" className={styles.compareButton} onClick={onToggleCompare} disabled={!compared && compareLimitReached}>
          {compared ? 'Karşılaştırmadan çıkar' : 'Karşılaştır'}
        </button>
      </div>
    </article>
  )
}

function LoadingResults() {
  return (
    <div className={styles.skeletonList} aria-label="Ofisler hazırlanıyor">
      <p className={styles.loadingLabel}>Ofisler hazırlanıyor</p>
      {[0, 1, 2].map((item) => (
        <div key={item} className={styles.skeletonCard}>
          <GlassSkeleton variant="circle" width="var(--lg-control-xl)" height="var(--lg-control-xl)" />
          <GlassSkeleton lines={3} height="var(--lg-space-3)" />
        </div>
      ))}
    </div>
  )
}

export function OfficeDirectoryView({
  state,
  response,
  matches,
  status,
  aiProposal,
  selectedOfficeId,
  compareIds,
  actionDraft,
  errorMessage = 'Bağlantıyı kontrol edip tekrar deneyin.',
  onRetry,
  onStateChange,
  onAiSearch,
  onSelectOffice,
  onToggleCompare,
  onStartAction,
  onApplyProposal,
  onDismissProposal,
  onRemoveProposalFilter,
  onConfirmAction,
  onCloseAction,
}: OfficeDirectoryViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [insightOpen, setInsightOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [aiInput, setAiInput] = useState(state.query)
  const [meetingOffice, setMeetingOffice] = useState<OfficeSummary | null>(null)
  const [messageOffice, setMessageOffice] = useState<OfficeSummary | null>(null)
  const [messageText, setMessageText] = useState('')
  const aiSearchRef = useRef<HTMLDivElement>(null)
  const toast = useGlassToast()
  const matchIndex = useMemo(() => new Map(matches?.map((match) => [match.officeId, match])), [matches])
  const activeOffice = selectedOffice(response, selectedOfficeId)
  const comparedOffices = response?.items.filter((office) => compareIds.includes(office.id)) ?? []
  const compareLimitReached = compareIds.length >= 3
  const mobileInsightOffice = insightOpen ? activeOffice : undefined

  useEffect(() => {
    setAiInput(state.query)
  }, [state.query])

  const resetFilters = () => onStateChange({ ...state, propertyType: undefined, city: undefined, district: undefined, expertise: [], verifiedOnly: false, maxResponseMinutes: undefined, language: undefined, minConsultants: undefined, minActiveListings: undefined, transactionExperience: undefined, sort: 'match', page: 1 }, { history: 'replace' })
  const chooseIntent = (intent: OfficeSearchState['intent']) => onStateChange(updateState(state, { intent, expertise: [] }), { history: 'push' })
  const handleAiSearch = (query: string) => onAiSearch(query)

  // "Görüşme" randevu modalına, "Mesaj" serbest metinli yazma çekmecesine
  // gider — ikisi de view içinde çözülür. Yalnız "teklif" rota seviyesindeki
  // taslak-onay akışına (onStartAction) devam eder.
  const startAction = (action: OfficeActionType, office: OfficeSummary) => {
    if (action === 'meeting') {
      setMeetingOffice(office)
      return
    }
    if (action === 'message') {
      setMessageText('')
      setMessageOffice(office)
      return
    }
    onStartAction(action, office.id)
  }

  // İçgörü panelleri ofis kimliğiyle çağırıyor; panelin kendisi ofis
  // nesnesini bilmediği için burada response'tan geri buluyoruz.
  const handlePanelAction = (action: OfficeActionType, officeId: string) => {
    const office = selectedOffice(response, officeId)
    if (office && (action === 'meeting' || action === 'message')) {
      startAction(action, office)
      return
    }
    onStartAction(action, officeId)
  }

  const sendMessageToOffice = () => {
    if (!messageOffice || !messageText.trim()) return
    sendOfficeMessage({
      officeId: messageOffice.id,
      officeName: messageOffice.name,
      district: messageOffice.districts[0],
      body: messageText,
    })
    setMessageOffice(null)
    toast({
      title: 'Mesajınız ofise iletildi',
      description: 'Yanıtları Hesabım → Mesajlar altında takip edebilirsiniz.',
      severity: 'success',
    })
  }

  return (
    <PageContainer className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>OFİS EŞLEŞTİRME</p>
          <h1>Doğru emlak ofisini, nedenleriyle bulun.</h1>
          <p>AI niyetinizi yapılandırır; siz onaylamadan hiçbir ofise bilgi veya talep gönderilmez.</p>
        </div>
        <div ref={aiSearchRef}>
          <GlassAiSearchBar
            className={styles.aiSearch}
            value={aiInput}
            onValueChange={setAiInput}
            onSubmit={handleAiSearch}
            placeholder="Örn. Urla’da arsa satışı için imar uzmanı arıyorum"
            suggestions={[
              'İzmir Urla’da arsa satışı için imar uzmanı arıyorum',
              'Kadıköy’de kiralık konut için hızlı yanıt veren ofis bul',
              'Mülküm için değerleme desteği istiyorum',
            ]}
            parsedFilters={aiProposal?.filters.map((filter) => ({ id: officeProposalFilterId(filter), label: filter.label, value: filter.displayValue }))}
            confidence={aiProposal?.confidence}
            onRemoveFilter={onRemoveProposalFilter ? (id) => {
              onRemoveProposalFilter(id)
              aiSearchRef.current?.querySelector<HTMLInputElement>('input')?.focus()
            } : undefined}
            loading={status === 'loading'}
            aria-label="Ofisleri yapay zekâ ile ara"
          />
        </div>
        <div className={styles.intentRow} aria-label="Hızlı niyet seçenekleri">
          {INTENT_OPTIONS.map((option) => (
            <GlassChip key={option.value} selected={state.intent === option.value} onSelectedChange={() => chooseIntent(option.value)}>
              {option.label}
            </GlassChip>
          ))}
          <GlassChip selected={state.propertyType === 'land' && state.expertise.includes('land')} onSelectedChange={() => onStateChange(updateState(state, { propertyType: 'land', expertise: ['land'] }), { history: 'push' })}>Arsa veya ticari mülk için uzman arıyorum</GlassChip>
        </div>
      </header>

      {aiProposal ? (
        <GlassAlert
          severity="info"
          title="AI eşleşme önerisi"
          onDismiss={onDismissProposal}
          action={<GlassButton size="sm" prominent onClick={onApplyProposal}>Öneriyi uygula</GlassButton>}
          className={styles.proposal}
        >
          {aiProposal.summary} Uygulamadan önce filtreleriniz değişmez. <button type="button" className={styles.editProposal} onClick={() => aiSearchRef.current?.querySelector<HTMLInputElement>('input')?.focus()}>Düzenle</button>
        </GlassAlert>
      ) : null}

      <div className={styles.mobileControls}>
        <GlassButton onClick={() => setFiltersOpen(true)}>Filtreleri aç</GlassButton>
        <GlassButton onClick={() => setInsightOpen(true)} disabled={!activeOffice}>AI içgörülerini aç</GlassButton>
      </div>

      <div className={styles.workspace}>
        <div className={styles.desktopFilters}>
          <OfficeFilterForm state={state} response={response} onChange={(next) => onStateChange(next, { history: 'replace' })} onReset={resetFilters} />
        </div>
        <section className={styles.results} aria-labelledby="office-results-title" aria-busy={status === 'loading' || undefined}>
          <div className={styles.resultsHeading}>
            <div>
              <p className={styles.eyebrow}>KEŞİF WORKSPACE</p>
              <h2 id="office-results-title">{response ? `${response.total} ofis bulundu` : 'Ofisler'}</h2>
            </div>
            {status === 'refreshing' ? <span className={styles.refreshing}>Sonuçlar güncelleniyor</span> : null}
          </div>
          {status === 'loading' ? <LoadingResults /> : null}
          {status === 'error' ? <GlassEmptyState variant="error" title="Ofisler yüklenemedi" description={errorMessage} action={onRetry ? <GlassButton onClick={onRetry}>Tekrar dene</GlassButton> : undefined} /> : null}
          {status !== 'loading' && status !== 'error' && response?.items.length === 0 ? <GlassEmptyState title="Bu filtrelerle eşleşen ofis bulunamadı" description="Niyetinizi veya uzmanlık filtrelerinizi genişletmeyi deneyin." /> : null}
          {status !== 'loading' && status !== 'error' && response?.items.length ? (
            <div className={styles.cardList}>
              {response.items.map((office) => (
                <OfficeResultCard
                  key={office.id}
                  office={office}
                  match={matchIndex.get(office.id)}
                  compared={compareIds.includes(office.id)}
                  compareLimitReached={compareLimitReached}
                  onSelect={() => onSelectOffice(office.id)}
                  onToggleCompare={() => onToggleCompare(office.id)}
                  onStartAction={(action) => startAction(action, office)}
                />
              ))}
            </div>
          ) : null}
        </section>
        <div className={styles.desktopInsights}>
          <OfficeInsightPanel office={activeOffice} match={selectedOfficeId ? matchFor(selectedOfficeId, matches) : undefined} onAction={handlePanelAction} />
        </div>
      </div>

      <GlassCompareBar
        items={comparedOffices.map((office) => ({ id: office.id, title: office.name, image: office.logoSrc }))}
        maxItems={3}
        onRemove={onToggleCompare}
        onClear={() => compareIds.forEach(onToggleCompare)}
        onCompare={() => setCompareOpen(true)}
      />

      <GlassDrawer
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="Ofis karşılaştırması"
        description="Seçtiğiniz ofislerin doğrulanabilir profil ve eşleşme verileri."
        side="bottom"
        size="lg"
      >
        <GlassCompareTable
          aria-label="Seçili emlak ofisleri karşılaştırması"
          fields={[
            { key: 'match', label: 'AI eşleşme', higherIsBetter: true },
            { key: 'response', label: 'Ortalama yanıt', higherIsBetter: false },
            { key: 'verified', label: 'Doğrulama' },
            { key: 'portfolio', label: 'Aktif portföy', higherIsBetter: true },
            { key: 'consultants', label: 'Ofis büyüklüğü', higherIsBetter: true },
            { key: 'rating', label: 'Değerlendirme', higherIsBetter: true },
            { key: 'evidence', label: 'Kanıt kaynağı' },
          ]}
          listings={comparedOffices.map((office) => ({
            id: office.id,
            title: office.name,
            image: office.logoSrc,
            values: {
              match: `%${matchIndex.get(office.id)?.score ?? 0}`,
              response: `${office.responseMinutes} dk`,
              verified: office.verified ? 'Tam doğrulandı' : 'Doğrulanmadı',
              portfolio: office.activeListings,
              consultants: office.consultants,
              rating: `${office.rating} / 5`,
              evidence: office.evidence[0] ? EVIDENCE_SOURCE_LABELS[office.evidence[0].source] : 'Veri yok',
            },
          }))}
          onRemove={onToggleCompare}
        />
      </GlassDrawer>

      <GlassDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Ofis filtreleri"
        description="Değişiklikleriniz sonuçlara uygulanır."
        side="bottom"
        size="lg"
        footer={<GlassButton prominent onClick={() => setFiltersOpen(false)}>Sonuçları göster</GlassButton>}
      >
        <OfficeFilterForm state={state} response={response} onChange={(next) => onStateChange(next, { history: 'replace' })} onReset={resetFilters} />
      </GlassDrawer>

      <GlassDrawer
        open={insightOpen && Boolean(mobileInsightOffice)}
        onClose={() => setInsightOpen(false)}
        title="AI içgörüleri"
        side="right"
        size="lg"
      >
        <OfficeInsightPanel office={mobileInsightOffice} match={selectedOfficeId ? matchFor(selectedOfficeId, matches) : undefined} onAction={handlePanelAction} />
      </GlassDrawer>

      <GlassDrawer
        open={Boolean(actionDraft)}
        onClose={onCloseAction}
        title={ACTION_CONFIRM_TITLES[actionDraft?.action ?? 'message']}
        ariaLabel="Ofis aksiyonu onayı"
        description="Bu bilgiler siz onay vermeden ofisle paylaşılmaz."
        side="right"
        size="md"
        footer={(
          <div className={styles.consentFooter}>
            <GlassButton onClick={onCloseAction}>Vazgeç</GlassButton>
            <GlassButton prominent onClick={onConfirmAction}>Gönderimi onayla</GlassButton>
          </div>
        )}
      >
        {actionDraft ? (
          <div className={styles.consentBody}>
            <h3>{actionDraft.summary}</h3>
            <p><strong>Alıcı:</strong> {selectedOffice(response, actionDraft.officeId)?.name ?? 'Seçili ofis'}</p>
            <p>Paylaşılacak bilgiler</p>
            <dl>
              {actionDraft.fields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}
            </dl>
            <p className={styles.consentQuestion}>Bu bilgileri seçtiğiniz ofise iletmek istediğinizi onaylıyor musunuz?</p>
          </div>
        ) : null}
      </GlassDrawer>

      <GlassDrawer
        open={Boolean(messageOffice)}
        onClose={() => setMessageOffice(null)}
        title="Ofise mesaj gönder"
        description="Mesajınız yalnız seçtiğiniz ofise iletilir."
        side="right"
        size="md"
        footer={(
          <div className={styles.consentFooter}>
            <GlassButton onClick={() => setMessageOffice(null)}>Vazgeç</GlassButton>
            <GlassButton prominent disabled={!messageText.trim()} onClick={sendMessageToOffice}>
              Mesajı gönder
            </GlassButton>
          </div>
        )}
      >
        {messageOffice ? (
          <div className={styles.consentBody}>
            <p><strong>Alıcı:</strong> {messageOffice.name}</p>
            <GlassTextarea
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              minRows={5}
              autoResize
              placeholder="Örn. Urla tarafında imarlı arsa arıyorum; portföyünüzü görüşmek isterim."
              aria-label="Mesajınız"
            />
            <p className={styles.consentQuestion}>
              Gönderdiğiniz mesajı ve ofis yanıtlarını Hesabım → Mesajlar altında bulabilirsiniz.
            </p>
          </div>
        ) : null}
      </GlassDrawer>

      <AppointmentSchedulerModal
        office={meetingOffice ? { id: meetingOffice.id, name: meetingOffice.name, responseMinutes: meetingOffice.responseMinutes } : null}
        onClose={() => setMeetingOffice(null)}
        onScheduled={() =>
          toast({
            title: 'Randevu talebiniz iletildi',
            description: 'Durumunu Hesabım → Randevularım altında takip edebilirsiniz.',
            severity: 'success',
          })
        }
      />
    </PageContainer>
  )
}
