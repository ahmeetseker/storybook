import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassMap, type GlassMapPin } from './GlassMap'
import { GlassMapPopupCard } from './GlassMapPopupCard'

const ARSA_PINS: GlassMapPin[] = [
  { id: 'p1', x: 0.22, y: 0.3, price: '4.250.000 TL' },
  { id: 'p2', x: 0.42, y: 0.18, price: '6.900.000 TL' },
  { id: 'p3', x: 0.58, y: 0.42, price: '1.850.000 TL' },
  { id: 'p4', x: 0.74, y: 0.28, count: 12 },
  { id: 'p5', x: 0.34, y: 0.62, price: '3.100.000 TL' },
  { id: 'p6', x: 0.66, y: 0.68, price: '980.000 TL' },
  { id: 'p7', x: 0.85, y: 0.6, count: 4 },
]

const ILAN_DETAY: Record<string, { title: string; location: string }> = {
  p1: { title: 'İzmir Urla İmarlı Köşe Parsel', location: 'İzmir, Urla · 850 m²' },
  p2: { title: 'Antalya Kaş Deniz Manzaralı Arsa', location: 'Antalya, Kaş · 1.200 m²' },
  p3: { title: 'Bursa Nilüfer Yatırımlık Tarla', location: 'Bursa, Nilüfer · 3.400 m²' },
  p5: { title: 'Tekirdağ Şarköy Villa İmarlı Arsa', location: 'Tekirdağ, Şarköy · 620 m²' },
  p6: { title: 'Eskişehir Tepebaşı Bağ Evi İzinli Tarla', location: 'Eskişehir, Tepebaşı · 5.100 m²' },
}

function popupFor(pinId: string) {
  const detay = ILAN_DETAY[pinId]
  if (!detay) return `${pinId} için 12 ilan — yakınlaştırıp listeyi görüntüleyin`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <strong style={{ fontSize: 13, fontWeight: 700 }}>{detay.title}</strong>
      <span style={{ color: 'var(--lg-label-secondary)', fontSize: 12 }}>{detay.location}</span>
    </div>
  )
}

const meta = {
  title: 'Bileşenler/Medya ve Harita/GlassMap',
  component: GlassMap,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    pins: ARSA_PINS,
    popupContent: popupFor,
    seed: 'urla-mah-42',
  },
} satisfies Meta<typeof GlassMap>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default (Inline)',
  args: { variant: 'inline', label: 'Urla mahalle haritası', defaultSelectedId: 'p1' },
}

export const Playground: Story = {
  args: { variant: 'inline', label: 'Harita' },
}

export const Panel: Story = {
  name: 'Panel — dikey dolu',
  args: { variant: 'panel', label: 'İlan detay haritası' },
  decorators: [(Story) => <div style={{ height: 480 }}><Story /></div>],
}

export const UyduKatmani: Story = {
  name: 'Katman — Uydu',
  args: { variant: 'inline', layer: 'uydu', label: 'Uydu görünümü' },
}

export const Cluster: Story = {
  name: 'Cluster Rozetleri',
  args: {
    variant: 'inline',
    label: 'Bölge kümeleri',
    pins: [
      { id: 'c1', x: 0.3, y: 0.35, count: 24 },
      { id: 'c2', x: 0.62, y: 0.3, count: 7 },
      { id: 'c3', x: 0.45, y: 0.65, count: 3 },
      { id: 'c4', x: 0.78, y: 0.55, price: '2.400.000 TL' },
    ],
  },
}

export const PrivacyCircle: Story = {
  name: 'Yaklaşık Konum Dairesi',
  args: {
    variant: 'inline',
    label: 'Yaklaşık konum',
    pins: [],
    privacyCircle: { x: 0.5, y: 0.5, r: 0.22 },
  },
}

export const Controlled: Story = {
  name: 'Controlled',
  render: (args) => {
    function ControlledMap() {
      const [selectedId, setSelectedId] = useState<string | undefined>('p2')
      const [layer, setLayer] = useState<'yol' | 'uydu'>('yol')
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--lg-label-secondary)' }}>
            Seçili: {selectedId ?? '—'} · Katman: {layer}
          </p>
          <GlassMap
            {...args}
            selectedId={selectedId}
            onPinSelect={setSelectedId}
            layer={layer}
            onLayerChange={setLayer}
          />
        </div>
      )
    }
    return <ControlledMap />
  },
  args: { variant: 'inline', label: 'Kontrollü harita' },
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    variant: 'inline',
    label: 'Uzun popup içeriği',
    defaultSelectedId: 'p1',
    popupContent: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <strong style={{ fontSize: 13, fontWeight: 700 }}>
          Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine Uzun Başlıklı Parsel
        </strong>
        <span style={{ color: 'var(--lg-label-secondary)', fontSize: 12 }}>
          İzmir, Urla · Zeytinlik + bağ evi izinli · Tapu devri hazır · 850 m² imarlı köşe parsel
        </span>
      </div>
    ),
  },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { variant: 'inline', label: 'Erişilebilirlik testi haritası', defaultSelectedId: 'p3' },
  parameters: {
    docs: {
      description: {
        story:
          'Pinler gerçek <button>; fiyat/adet metinleri erişilebilir adı oluşturur. Katman toggle\'ı ' +
          'role="radiogroup" ile radio semantiğini kullanır. Seçili pin `aria-pressed`; ok tuşlarıyla pinler ' +
          'arasında gezinilir, Escape popup\'ı kapatır. Odak halkası `:focus-visible` ile 2px amber.',
      },
    },
  },
}

const osmBasemap = {
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: (
    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
      © OpenStreetMap katkıcıları
    </a>
  ),
  center: [39, 35.2] as [number, number],
  zoom: 6,
  maxZoom: 19,
}

const geoPins: GlassMapPin[] = [
  { id: 'urla', lat: 38.322, lng: 26.764, price: '4.250.000 TL' },
  { id: 'golbasi', lat: 39.783, lng: 32.809, price: '1.850.000 TL' },
  { id: 'kas', lat: 36.2, lng: 29.64, price: '6.900.000 TL' },
  { id: 'ege', lat: 37.04, lng: 27.43, count: 18 },
]

/** Gerçek tile zemini — sessiz ton, sitenin sıcak nötrlerine yaklaştırılmış. */
export const GercekZeminSessiz: Story = {
  args: { pins: geoPins, basemap: osmBasemap, label: 'Arsa ilanları haritası' },
}

/** Filtresiz tile — sağlayıcının kendi paleti. */
export const GercekZeminHam: Story = {
  args: { pins: geoPins, basemap: { ...osmBasemap, tone: 'raw' }, label: 'Ham zemin' },
}

/** Popup ile birlikte gerçek zemin. */
export const GercekZeminPopup: Story = {
  args: {
    pins: geoPins,
    basemap: osmBasemap,
    defaultSelectedId: 'golbasi',
    popupContent: (id: string) => <strong>{id === 'golbasi' ? 'Gölbaşı · 1.240 m²' : id}</strong>,
    label: 'Popuplı harita',
  },
}

/**
 * `satelliteTileUrl` verilince Yol/Uydu toggle'ı görünür ve gerçekten iki
 * tile katmanı arasında geçiş yapar (bkz. Bulgu 1, task-9-report.md — yukarıdaki
 * `GercekZemin*` story'lerinde `satelliteTileUrl` YOK, bu yüzden onlarda toggle
 * hiç render edilmez; bu, gerçekte hiçbir şeyi değiştirmeyen yanıltıcı bir
 * kontrolün kullanıcıya gösterilmesini engeller).
 */
export const GercekZeminUyduToggle: Story = {
  args: {
    pins: geoPins,
    basemap: {
      ...osmBasemap,
      satelliteTileUrl:
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    },
    label: 'Uydu geçişli harita',
  },
}

// ── İniş zinciri (ülke → bölge → ilan) ────────────────────────────────────
// Kümeleme rozetlerinin ortaya çıkması için haritada gerçek bir yoğunluk
// gerekir; birkaç pin ile eşik hiç aşılmaz ve zincir başlamaz.
const yogunPinler: GlassMapPin[] = [
  { name: 'İstanbul', lat: 41.01, lng: 28.98, adet: 14 },
  { name: 'İzmir', lat: 38.42, lng: 27.14, adet: 11 },
  { name: 'Balıkesir', lat: 39.65, lng: 27.89, adet: 9 },
  { name: 'Muğla', lat: 37.03, lng: 27.43, adet: 8 },
  { name: 'Antalya', lat: 36.9, lng: 30.7, adet: 7 },
  { name: 'Ankara', lat: 39.93, lng: 32.86, adet: 7 },
].flatMap(({ name, lat, lng, adet }) =>
  Array.from({ length: adet }, (_, index) => {
    // Altın oranlı açı: ardışık ilanlar birbirine en uzak yönlere düşer.
    const aci = index * 2.39996
    const yaricap = 0.06 * Math.sqrt(index + 1)
    return {
      id: `${name}-${index}`,
      lat: lat + yaricap * Math.cos(aci),
      lng: lng + yaricap * Math.sin(aci) * 1.25,
      price: `₺${(2 + ((index * 7) % 18) / 2).toFixed(1).replace('.', ',')}M`,
    }
  }),
)

/**
 * Kümeleme açık: yakın ilanlar tek rozette toplanır. Rozete tıklamak kadrajı
 * o bölgeye indirir, alt rozetler açılır ve zincir tek tek fiyat kapsüllerine
 * kadar sürer. Rozet bir SEÇİM değil bir iniş kontrolüdür.
 */
export const KumelemeInisZinciri: Story = {
  args: {
    variant: 'panel',
    pins: yogunPinler,
    basemap: osmBasemap,
    cluster: true,
    label: 'Yoğunluk haritası',
    popupContent: (id: string) => (
      <GlassMapPopupCard
        title={`${id.split('-')[0]} ilanı`}
        meta="İlçe merkezi · 850 m²"
        price="4.250.000 TL"
        status={{ label: 'Doğrulanmış', tone: 'success' }}
        actionLabel="Detayı aç"
        onAction={() => undefined}
      />
    ),
  },
}

/** Kümeleme eşiği geniş: aynı veri daha az, daha kalabalık rozete iner. */
export const KumelemeGenisYaricap: Story = {
  args: {
    variant: 'panel',
    pins: yogunPinler,
    basemap: osmBasemap,
    cluster: { radius: 110 },
    label: 'Geniş eşikli yoğunluk haritası',
  },
}

/** Pin tonları durum rengini semantic token'dan okur (birleşik variant değildir). */
export const PinTonlari: Story = {
  args: {
    pins: [
      { id: 't1', lat: 41.01, lng: 28.98, price: '₺12M', tone: 'accent' },
      { id: 't2', lat: 39.93, lng: 32.86, price: '₺6,4M', tone: 'success' },
      { id: 't3', lat: 38.42, lng: 27.14, price: '₺3,1M', tone: 'warning' },
      { id: 't4', lat: 36.9, lng: 30.7, price: '₺2,7M', tone: 'danger' },
    ],
    basemap: osmBasemap,
    label: 'Durum tonlu pinler',
  },
}

/** Gerçek zemin üzerinde mahremiyet dairesi: merkez lat/lng, yarıçap metre. */
export const GercekZeminMahremiyetDairesi: Story = {
  args: {
    pins: [],
    basemap: { ...osmBasemap, center: [38.322, 26.764], zoom: 13 },
    privacyCircle: { x: 0.5, y: 0.5, r: 0.18, lat: 38.322, lng: 26.764, radiusMeters: 750 },
    label: 'Yaklaşık konum haritası',
  },
}

/** Popup gövdesinin ortak biçimi — her haritada aynı sıra. */
export const PopupKarti: Story = {
  args: {
    pins: geoPins,
    basemap: osmBasemap,
    defaultSelectedId: 'urla',
    label: 'Detay kartlı harita',
    popupContent: () => (
      <GlassMapPopupCard
        title="İzmir Urla İmarlı Köşe Parsel"
        meta="Urla, İzmir · 850 m²"
        price="4.250.000 TL"
        status={{ label: 'Doğrulanmış', tone: 'success' }}
        href="#urla"
      />
    ),
  },
}
