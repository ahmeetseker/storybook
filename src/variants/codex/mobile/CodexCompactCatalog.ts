import {
  CODEX_COMPONENT_CATALOG,
  type CodexCatalogCategoryId,
  type CodexCoverageStrategy,
} from '../catalog/CodexCatalog'

export type CodexCompactPatternId =
  | 'touch-scale'
  | 'stacked-form'
  | 'adaptive-navigation'
  | 'overlay-feedback'
  | 'marketplace-stack'
  | 'data-representation'
  | 'list-disclosure'
  | 'immersive-media'
  | 'layout-reflow'
  | 'task-flow'

export interface CodexCompactPattern {
  id: CodexCompactPatternId
  label: string
  summary: string
  implementation: string
  components: readonly string[]
}

export interface CodexCompactAdaptation {
  original: string
  codex: string
  category: CodexCatalogCategoryId
  strategy: CodexCoverageStrategy
  pattern: CodexCompactPatternId
  patternLabel: string
  decision: string
  implementation: string
}

export const CODEX_COMPACT_PATTERNS: readonly CodexCompactPattern[] = [
  {
    id: 'touch-scale',
    label: 'Aynı component · touch scale',
    summary: 'Semantik ve içerik değişmez; genişlik akışkanlaşır ve ana hedefler 44–48px olur.',
    implementation: 'Aynı Codex API kullanılır; pointer/hover sorguları, fluid ölçü ve görünür focus korunur.',
    components: [
      'GlassSurface',
      'GlassButton',
      'GlassIconButton',
      'GlassAvatar',
      'GlassBadge',
      'GlassDivider',
      'GlassSkeleton',
      'GlassProgress',
      'GlassLink',
    ],
  },
  {
    id: 'stacked-form',
    label: 'Tek sütun form',
    summary: 'Alanlar görev sırasına göre tek sütuna iner; etiketler görünür, klavye ve hata bağı korunur.',
    implementation: 'Tam genişlik kontrol, en az 16px giriş metni, 48px ana aksiyon ve uzun seçenekler için sheet kullanılır.',
    components: [
      'GlassField',
      'GlassInput',
      'GlassTextarea',
      'GlassSelect',
      'GlassDatePicker',
      'GlassFileUpload',
      'GlassCheckbox',
      'GlassRadioGroup',
      'GlassSwitch',
      'GlassSlider',
      'GlassStepper',
      'GlassSegmentedControl',
      'GlassChip',
      'GlassSearchField',
      'GlassAiSearchBar',
    ],
  },
  {
    id: 'adaptive-navigation',
    label: 'Adaptif navigasyon',
    summary: 'Global, sayfa içi ve bağlamsal navigasyon aynı kontrol tipine sıkıştırılmaz.',
    implementation: 'Üst seviye 3–5 hedef CodexBottomNavigation; sayfa bağlamı CodexAppBar; derin hiyerarşi mevcut CodexSidebar sheet olur.',
    components: [
      'GlassHeader',
      'GlassNavbar',
      'GlassSidebar',
      'GlassToolbar',
      'GlassBreadcrumb',
      'GlassPagination',
      'GlassTabs',
      'GlassMenu',
      'GlassContextMenu',
      'GlassCommandPalette',
      'GlassTooltip',
      'GlassPopover',
    ],
  },
  {
    id: 'overlay-feedback',
    label: 'Overlay ve geri bildirim',
    summary: 'İkincil görevler alttan açılır; kritik kararlar dialog olarak kalır; bildirimler içeriği örtmez.',
    implementation: 'CodexBottomSheet focus trap, Escape, focus iadesi, safe area ve tıklanabilir detent alternatifi sağlar.',
    components: [
      'GlassModal',
      'GlassDrawer',
      'GlassSheet',
      'GlassToast',
      'GlassChatDock',
      'GlassAlert',
      'GlassCompareBar',
    ],
  },
  {
    id: 'marketplace-stack',
    label: 'Pazar yeri kart akışı',
    summary: 'İlan ve güven içeriği tek sütunda okunur; kart ana bağlantısı ve kardeş aksiyonlar ayrılır.',
    implementation: 'Arama sonucu row/list, vitrin tile, öne çıkan featured kalır; filtre içeriği CodexBottomSheet içine taşınır.',
    components: [
      'GlassListingCard',
      'GlassAgencyCard',
      'GlassSellerCard',
      'GlassSavedSearchCard',
      'GlassListingManagementCard',
      'GlassLocationCard',
      'GlassPriceHeader',
      'GlassValuationCard',
      'GlassReviewCard',
      'GlassInsightNote',
      'GlassPersonalNote',
      'GlassEmptyState',
      'GlassFilterPanel',
    ],
  },
  {
    id: 'data-representation',
    label: 'Veriyi yeniden temsil et',
    summary: 'Verinin anlamı korunur; metin tabloları stack, sayısal/karşılaştırma tabloları yatay kaydırılır.',
    implementation: 'Label/value kart, focus alınabilir yatay scroll, sticky ilk sütun, 1–2 sütun metrik ve açık AI karar sırası kullanılır.',
    components: [
      'GlassTable',
      'GlassCompareTable',
      'GlassSpecTable',
      'GlassTaxHistoryTable',
      'GlassChart',
      'GlassMetricStrip',
      'GlassScoreMeter',
      'GlassMatchScore',
      'GlassMatchBreakdown',
      'GlassValuationDrivers',
      'GlassClimateRiskPanel',
      'GlassTrustSignalPanel',
      'GlassAiEvidenceList',
      'GlassAiConfidence',
      'GlassAiRiskReview',
      'GlassAiAgentActivity',
      'GlassAiSummaryCard',
      'GlassAiFlagBanner',
    ],
  },
  {
    id: 'list-disclosure',
    label: 'Liste ve progressive disclosure',
    summary: 'Satırlar tam genişlikte kalır; ikincil ayrıntı gerektiğinde açılır, ana bilgi saklanmaz.',
    implementation: 'CodexList, timeline, accordion ve yatay kategori rail aynı DOM sırasını ve erişilebilir adı korur.',
    components: [
      'GlassList',
      'GlassInfiniteList',
      'GlassTimeline',
      'GlassAccordion',
      'GlassFeatureGroup',
      'GlassRating',
      'GlassNearbyPlaces',
    ],
  },
  {
    id: 'immersive-media',
    label: 'Edge-to-edge medya',
    summary: 'Medya ekran genişliğini kullanır; seçim ve açıklama kontrolleri ayrı, okunabilir bir katmanda kalır.',
    implementation: 'Full-bleed görüntü, snap film şeridi, 44px medya chrome ve seçili harita/plan ayrıntısı için sheet kullanılır.',
    components: [
      'GlassGallery',
      'GlassMediaGallery',
      'GlassCarousel',
      'GlassMap',
      'GlassFloorPlanViewer',
      'GlassPhotoFeatureOverlay',
      'GlassRoomClassifierTabs',
    ],
  },
  {
    id: 'layout-reflow',
    label: 'Önem sıralı reflow',
    summary: 'Masaüstü kolonları küçültülmez; DOM sırası görev önemine göre tek akışa döner.',
    implementation: 'Hero tek görevle açılır, bento/list rail olur, vitrin tek kolon veya carousel, footer bağlantıları disclosure olur.',
    components: [
      'GlassHero',
      'GlassBento',
      'GlassVitrin',
      'GlassFooter',
    ],
  },
  {
    id: 'task-flow',
    label: 'Adımlı görev akışı',
    summary: 'Karmaşık hesaplama ve planlama tek ekrana sıkışmaz; karar adımları görünür sırayla ilerler.',
    implementation: 'Progressive adımlar, tam genişlik girişler ve CodexActionBar içinde bağlamsal 48px CTA kullanılır.',
    components: [
      'GlassLoanCalculator',
      'GlassTourPlanner',
      'GlassTourScheduler',
      'GlassVoiceBar',
    ],
  },
] as const

const catalogByOriginal = new Map(CODEX_COMPONENT_CATALOG.map((component) => [component.original, component]))
const groupedNames = CODEX_COMPACT_PATTERNS.flatMap((pattern) => [...pattern.components])
const duplicateNames = groupedNames.filter((name, index) => groupedNames.indexOf(name) !== index)
const unknownNames = groupedNames.filter((name) => !catalogByOriginal.has(name))
const missingNames = CODEX_COMPONENT_CATALOG
  .map((component) => component.original)
  .filter((name) => !groupedNames.includes(name))

if (duplicateNames.length || unknownNames.length || missingNames.length) {
  throw new Error([
    'Codex compact adaptation catalog is incomplete.',
    duplicateNames.length ? `Duplicate: ${[...new Set(duplicateNames)].join(', ')}` : '',
    unknownNames.length ? `Unknown: ${unknownNames.join(', ')}` : '',
    missingNames.length ? `Missing: ${missingNames.join(', ')}` : '',
  ].filter(Boolean).join(' '))
}

export const CODEX_COMPACT_ADAPTATIONS: readonly CodexCompactAdaptation[] = CODEX_COMPACT_PATTERNS
  .flatMap((pattern) => pattern.components.map((original) => {
    const component = catalogByOriginal.get(original)
    if (!component) throw new Error(`Codex compact adaptation catalog: ${original} katalogda bulunamadı.`)
    return {
      original,
      codex: component.codex,
      category: component.category,
      strategy: component.strategy,
      pattern: pattern.id,
      patternLabel: pattern.label,
      decision: pattern.summary,
      implementation: pattern.implementation,
    }
  }))

export const CODEX_COMPACT_COMPONENT_COUNT = CODEX_COMPACT_ADAPTATIONS.length

export const CODEX_COMPACT_ADAPTATION_BY_COMPONENT = new Map(
  CODEX_COMPACT_ADAPTATIONS.map((adaptation) => [adaptation.original, adaptation]),
)
