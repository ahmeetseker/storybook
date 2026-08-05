import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSkeleton } from '@repo/ui'

import {
  loadListingDetail,
  type ListingDetailResult,
  type ListingDetailScenario,
} from './data/listing-detail-adapter'
import { ListingDetailWorkspace } from './ListingDetailWorkspace'
import styles from './ListingDetailWorkspace.module.css'

/**
 * Kanıt kesiti sabittir: story çıktıları çalıştırma anına göre kaymaz.
 * Adapter zamanı kendisi okumaz, `now` her zaman buradan verilir.
 */
const NOW = '2026-07-27T09:00:00.000Z'
const LISTING_ID = 'arsa-214-7'
/**
 * Arama sonucundan yansıtılan ilan: elle yazılmış kanıt defteri yoktur,
 * sayfa yalnız arama kaydının gerçekten taşıdığı alanları gösterir.
 */
const PROJECTED_LISTING_ID = 'listing-3-1'

/** Demo numarası — gerçek numara story'de de sayfa kaynağında durmaz. */
const DEMO_PHONE = '0 (252) 000 00 00'

async function loadScenario(
  scenario: ListingDetailScenario,
  listingId: string = LISTING_ID,
): Promise<ListingDetailResult> {
  const result = await loadListingDetail({ listingId, scenario, now: NOW })
  if (!result) throw new Error('senaryo fixture bulunamadı')
  return result
}

/** İstek anında numara getiren demo sağlayıcısı; gecikme sabittir. */
function demoRevealPhone(delayMs = 220): () => Promise<string> {
  return () =>
    new Promise<string>((resolve) => {
      setTimeout(() => resolve(DEMO_PHONE), delayMs)
    })
}

/** Numara servisi yanıt vermediğinde satıcı bölümünün gerileme yolu. */
function failingRevealPhone(): () => Promise<string> {
  return async () => {
    throw new Error('phone-reveal-failed:503')
  }
}

/**
 * Yükleme iskeleti.
 *
 * Sayfa iskeleti `aria-busy` taşır ve bekleyişin ne olduğunu kelimeyle söyler;
 * boş bir ekran veya süresiz spinner göstermez.
 */
function ListingDetailLoading() {
  return (
    // Yüklenen sayfayla aynı kap/kabuk çifti: iskeletin dolgusu da container
    // sorgularına yanıt verir.
    <div className={styles.page}>
      <div className={styles.shell} role="status" aria-busy="true">
        <p className={styles.blockNote}>İlan detayı yükleniyor…</p>
        <GlassSkeleton variant="rect" height="var(--lg-control-xl)" />
        <GlassSkeleton variant="rect" height="var(--lg-control-lg)" />
        <div className={styles.section}>
          <GlassSkeleton variant="text" lines={3} />
        </div>
        <div className={styles.section}>
          <GlassSkeleton variant="text" lines={5} />
        </div>
        <div className={styles.section}>
          <GlassSkeleton variant="text" lines={4} />
        </div>
      </div>
    </div>
  )
}

/** 90 karakterlik başlık, 8 belge ve 6 altyapı satırıyla taşma senaryosu. */
function withLongContent(result: ListingDetailResult): ListingDetailResult {
  // Taşma senaryosu arsa defterinin altyapı satırlarını çoğaltır; yansıtılmış
  // ilanda böyle bir paket yoktur.
  if (result.detail.kind !== 'land') return result
  const detail = structuredClone(result.detail)

  detail.title =
    'Ören sahiline 1,4 km mesafede 4.850 m² tarla — uygulama imar planı askıda, itiraz sürüyor.'

  const utilityTemplate = detail.access.utilities[0]?.value
  if (utilityTemplate) {
    detail.access.utilities = [
      ...detail.access.utilities,
      {
        id: 'natural-gas',
        label: 'Doğal gaz',
        value: { ...structuredClone(utilityTemplate), value: 'Yok — bölgede şebeke bulunmuyor' },
      },
      {
        id: 'telecom',
        label: 'Telekom',
        value: { ...structuredClone(utilityTemplate), value: 'Yolda — parselde hat yok' },
      },
      {
        id: 'irrigation',
        label: 'Sulama',
        value: { ...structuredClone(utilityTemplate), value: 'Sulama birliği kanalı sınırda' },
      },
    ]
  }

  detail.documents = [
    ...detail.documents,
    {
      id: 'plan-note-doc',
      label: 'Plan notu belgesi',
      state: 'available',
      critical: false,
      issuedAt: '2025-11-19T00:00:00.000Z',
      authority: 'Milas Belediyesi',
    },
    {
      id: 'soil-decision',
      label: 'Toprak koruma kurulu kararı',
      state: 'missing',
      critical: false,
      authority: 'İl Tarım ve Orman Müdürlüğü',
    },
    {
      id: 'forest-limit',
      label: 'Orman sınırı (2/B) sorgu çıktısı',
      state: 'missing',
      critical: false,
      authority: 'Orman Genel Müdürlüğü',
    },
  ]

  return { ...result, detail }
}

interface ScenarioPageProps {
  /** Adapter senaryosu — durum matrisinin tek girdisi */
  scenario: ListingDetailScenario
  /** Hangi ilan yüklensin; verilmezse elle yazılmış referans defter */
  listingId?: string
  /** Yüklenen sonucu story'ye özel biçimde dönüştürür (ör. uzun içerik) */
  transform?: (result: ListingDetailResult) => ListingDetailResult
  /** Numara sağlayıcısı; verilmezse satıcı bölümü kontrolü hiç göstermez */
  revealPhone?: () => Promise<string>
  /** Container genişliği — yerleşim container sorgularıyla yanıt verir */
  containerWidth?: number | string
}

function ScenarioPage({
  scenario,
  listingId,
  transform,
  revealPhone,
  containerWidth,
}: ScenarioPageProps) {
  const [result, setResult] = useState<ListingDetailResult | null>(null)

  useEffect(() => {
    let alive = true
    void loadScenario(scenario, listingId).then((loaded) => {
      if (alive) setResult(transform ? transform(loaded) : loaded)
    })
    return () => {
      alive = false
    }
  }, [scenario, listingId, transform])

  const page = result ? (
    <ListingDetailWorkspace result={result} onRevealPhone={revealPhone} />
  ) : (
    <ListingDetailLoading />
  )

  return containerWidth === undefined ? (
    page
  ) : (
    <div style={{ inlineSize: containerWidth, maxInlineSize: '100%', marginInline: 'auto' }}>
      {page}
    </div>
  )
}

const meta = {
  title: 'Sayfalar/Public/İlan Detayı',
  component: ScenarioPage,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { scenario: 'default', revealPhone: demoRevealPhone() },
} satisfies Meta<typeof ScenarioPage>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Yön A (Karar Dosyası) yerleşiminin tam hâli: karar özeti, kaynaklı kanıt
 * bölümleri, karar rayı ve satıcı bölümü. Numara yalnız "Numarayı göster"e
 * basıldığında getirilir ve odak numaraya taşınır.
 *
 * Durum tonları (çelişki, eksik, bayat) rengin yanında kelimeyle de taşınır;
 * sayfadaki cam yüzey sayısı katman modelinin sınırında kalır.
 */
export const Default: Story = {}

/** Plan durumu kaynağı bayatladığında künye "Güncel değil" der; değer gizlenmez. */
export const BayatPlanKaynagi: Story = {
  name: 'Bayat plan kaynağı',
  args: { scenario: 'stale-planning' },
}

/** Asistan yanıt veremez: yalnız karar özeti düşer, kaynaklı bölümler eksiksiz kalır. */
export const AiKullanilamiyor: Story = {
  name: 'AI kullanılamıyor',
  args: { scenario: 'ai-unavailable' },
}

/** Harita sağlayıcısı düşer: konum ve parsel bilgisi metin/tablo olarak kalır. */
export const HaritaKullanilamiyor: Story = {
  name: 'Harita kullanılamıyor',
  args: { scenario: 'map-unavailable' },
}

/**
 * Süresi dolmuş ilan: sayfa sessizce aramaya yönlenmez, arşiv kaydı olarak
 * kalır; iletişim eylemleri gerekçesiyle kapanır ve numara paylaşımı durur.
 */
export const SuresiDolmus: Story = {
  name: 'Süresi dolmuş',
  args: { scenario: 'inactive' },
}

/** Veri gelene kadar `aria-busy` taşıyan iskelet; boş ekran veya süresiz spinner yok. */
export const Yukleniyor: Story = {
  name: 'Yükleniyor',
  render: () => <ListingDetailLoading />,
}

/** 90 karakterlik başlık, 8 belge ve 6 altyapı satırı — taşma ve sarma davranışı. */
export const UzunIcerik: Story = {
  name: 'Uzun içerik',
  args: { transform: withLongContent },
}

/**
 * Dar container (390px): iki kolonlu yerleşimler tek kolona iner, karar rayı
 * sticky'yi bırakır, dokunmatik hedefler ≥44px kalır. Ara genişlik için
 * toolbar'dan "Tablet · 834×1112" viewport'u seçilir — yerleşim viewport
 * breakpoint'i değil container sorgusu kullanır.
 */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile390' } },
  args: { containerWidth: 390 },
}

/**
 * Arama sonucundan yansıtılan ilan (`/ilan/listing-3-1`).
 *
 * Kanıt defteri derlenmemiştir: parsel, imar, altyapı, arazi ve piyasa
 * bölümleri hiç açılmaz; bölüm indeksi de yalnız gerçekten render edilen üç
 * bölümü bağlar. Değerleme çekinir, karar özeti üretilmez ve cevabı olmayan
 * alanlar tire yerine gerekçesiyle görünür.
 */
export const YansitilmisIlan: Story = {
  name: 'Yansıtılmış ilan (arama sonucu)',
  args: { listingId: PROJECTED_LISTING_ID },
}

/**
 * Numara servisi yanıt vermediğinde gerekçe görünür ve kontrol tekrar
 * denenebilir kalır — çıkmaz sokak yok.
 */
export const NumaraAlinamadi: Story = {
  name: 'Numara alınamadı',
  args: { revealPhone: failingRevealPhone() },
}
