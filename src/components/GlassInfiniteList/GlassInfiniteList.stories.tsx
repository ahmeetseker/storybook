import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassInfiniteList } from './GlassInfiniteList'
import { placeholderImage } from '../../demo/placeholderImage'

interface IlanOzeti {
  id: string
  baslik: string
  konum: string
  fiyat: string
  renk: [string, string]
}

// 24 gerçekçi arsa/tarla ilanı — sonsuz kaydırmada sayfa sayfa açılır.
const TUM_ILANLAR: IlanOzeti[] = [
  { id: 'ARS-1001', baslik: 'İmarlı Köşe Parsel', konum: 'İzmir, Urla', fiyat: '4.250.000 TL', renk: ['#3a5f8a', '#1f3a5f'] },
  { id: 'ARS-1002', baslik: 'Deniz Manzaralı Villa Arsası', konum: 'Muğla, Bodrum', fiyat: '8.900.000 TL', renk: ['#5f3a8a', '#3a1f5f'] },
  { id: 'ARS-1003', baslik: 'Sanayi İmarlı Arsa', konum: 'Kocaeli, Gebze', fiyat: '12.500.000 TL', renk: ['#8a5f3a', '#5f3a1f'] },
  { id: 'ARS-1004', baslik: 'Bahçeli Tarla', konum: 'Sakarya, Adapazarı', fiyat: '1.850.000 TL', renk: ['#3a8a5f', '#1f5f3a'] },
  { id: 'ARS-1005', baslik: 'Yola Cepheli Ticari Arsa', konum: 'Antalya, Kaş', fiyat: '6.400.000 TL', renk: ['#8a3a5f', '#5f1f3a'] },
  { id: 'ARS-1006', baslik: 'Zeytinlikli Bahçe Parseli', konum: 'Balıkesir, Ayvalık', fiyat: '2.150.000 TL', renk: ['#3a5f8a', '#5f3a1f'] },
  { id: 'ARS-1007', baslik: 'Göl Manzaralı Tarla', konum: 'Bursa, İznik', fiyat: '1.475.000 TL', renk: ['#5f8a3a', '#3a5f1f'] },
  { id: 'ARS-1008', baslik: 'Villa İmarlı Köşe Parsel', konum: 'Yalova, Termal', fiyat: '3.650.000 TL', renk: ['#8a5f3a', '#3a1f5f'] },
  { id: 'ARS-1009', baslik: 'Ana Yola Sıfır Ticari Arsa', konum: 'Sakarya, Serdivan', fiyat: '9.750.000 TL', renk: ['#3a8a5f', '#5f1f3a'] },
  { id: 'ARS-1010', baslik: 'Dağ Manzaralı Tarla', konum: 'Bolu, Mudurnu', fiyat: '985.000 TL', renk: ['#8a3a5f', '#1f3a5f'] },
  { id: 'ARS-1011', baslik: 'Toplu Konut İmarlı Arsa', konum: 'İstanbul, Silivri', fiyat: '18.200.000 TL', renk: ['#3a5f8a', '#1f5f3a'] },
  { id: 'ARS-1012', baslik: 'Fındık Bahçesi', konum: 'Ordu, Ünye', fiyat: '2.900.000 TL', renk: ['#5f3a8a', '#3a5f1f'] },
  { id: 'ARS-1013', baslik: 'Sahil Şeridine Yakın Arsa', konum: 'Çanakkale, Ayvacık', fiyat: '5.100.000 TL', renk: ['#8a5f3a', '#1f3a5f'] },
  { id: 'ARS-1014', baslik: 'Nizamlı Villa Parseli', konum: 'İzmir, Çeşme', fiyat: '11.300.000 TL', renk: ['#3a8a5f', '#3a1f5f'] },
  { id: 'ARS-1015', baslik: 'Kayısı Bahçeli Tarla', konum: 'Malatya, Yeşilyurt', fiyat: '1.240.000 TL', renk: ['#8a3a5f', '#5f3a1f'] },
  { id: 'ARS-1016', baslik: 'Otoyol Bağlantılı Depo Arsası', konum: 'Kocaeli, Dilovası', fiyat: '22.750.000 TL', renk: ['#3a5f8a', '#5f1f3a'] },
  { id: 'ARS-1017', baslik: 'Manzaralı Yamaç Parsel', konum: 'Trabzon, Akçaabat', fiyat: '3.180.000 TL', renk: ['#5f8a3a', '#1f3a5f'] },
  { id: 'ARS-1018', baslik: 'Köşe Başı Ticari Parsel', konum: 'Ankara, Gölbaşı', fiyat: '14.600.000 TL', renk: ['#8a5f3a', '#5f1f3a'] },
  { id: 'ARS-1019', baslik: 'Zeytinlik Yatırımlık Arazi', konum: 'Aydın, Kuşadası', fiyat: '4.820.000 TL', renk: ['#3a8a5f', '#1f5f3a'] },
  { id: 'ARS-1020', baslik: 'İkiz Villa İmarlı Parsel', konum: 'Muğla, Fethiye', fiyat: '9.400.000 TL', renk: ['#8a3a5f', '#3a5f1f'] },
  { id: 'ARS-1021', baslik: 'Nadas Tarlası', konum: 'Konya, Ereğli', fiyat: '720.000 TL', renk: ['#3a5f8a', '#3a1f5f'] },
  { id: 'ARS-1022', baslik: 'Deniz Manzaralı Teraslı Arsa', konum: 'Antalya, Kalkan', fiyat: '16.900.000 TL', renk: ['#5f3a8a', '#5f1f3a'] },
  { id: 'ARS-1023', baslik: 'Turizm İmarlı Yatırımlık Arsa', konum: 'Muğla, Marmaris', fiyat: '13.750.000 TL', renk: ['#8a5f3a', '#1f5f3a'] },
  { id: 'ARS-1024', baslik: 'Organik Tarıma Uygun Tarla', konum: 'Manisa, Salihli', fiyat: '1.610.000 TL', renk: ['#3a8a5f', '#5f3a1f'] },
]

const SAYFA_BOYUTU = 6

function IlanSatiri({ ilan }: { ilan: IlanOzeti }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--lg-space-4)',
        padding: 'var(--lg-space-3) 0',
        borderBottom: '1px solid var(--lg-hairline)',
        listStyle: 'none',
      }}
    >
      <img
        src={placeholderImage(ilan.id, ilan.renk[0], ilan.renk[1], 160, 120)}
        alt=""
        width={72}
        height={54}
        style={{ borderRadius: 'var(--lg-radius-media)', objectFit: 'cover', flex: 'none' }}
      />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 'var(--lg-text-body)', fontWeight: 600, color: 'var(--lg-label)' }}>{ilan.baslik}</span>
        <span style={{ fontSize: 'var(--lg-text-footnote)', color: 'var(--lg-label-secondary)' }}>{ilan.konum}</span>
      </span>
      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontSize: 'var(--lg-text-footnote)',
          fontWeight: 700,
          color: 'var(--lg-label)',
          flex: 'none',
        }}
      >
        {ilan.fiyat}
      </span>
    </li>
  )
}

function IlanListesi({ ilanlar }: { ilanlar: IlanOzeti[] }) {
  return (
    <ul style={{ margin: 0, padding: 0 }} aria-label="Arsa ve tarla ilanları">
      {ilanlar.map((ilan) => (
        <IlanSatiri key={ilan.id} ilan={ilan} />
      ))}
    </ul>
  )
}

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassInfiniteList',
  component: GlassInfiniteList,
  tags: ['autodocs'],
  args: {
    hasMore: true,
    loading: false,
    onLoadMore: fn(),
  },
  argTypes: {
    children: { control: false },
    onLoadMore: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, margin: '32px auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassInfiniteList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <IlanListesi ilanlar={TUM_ILANLAR.slice(0, SAYFA_BOYUTU)} />,
  },
}

export const Playground: Story = {
  args: {
    children: <IlanListesi ilanlar={TUM_ILANLAR.slice(0, SAYFA_BOYUTU)} />,
    threshold: 400,
  },
}

/**
 * Gerçek çalışan akış: "Daha fazla yükle" her tıklamada 700ms'lik sahte bir
 * ağ isteği simüle eder, altışar ilan ekler, tüm 24 ilan bittiğinde
 * `hasMore=false` olur. Component sayfalamayı yönetmez — bu mantık tamamen
 * story'nin (çağıranın) sorumluluğundadır.
 */
export const CanliAkis: Story = {
  name: 'Canlı Akış',
  args: {
    // `render` kendi state'ini yönetir ve bu children'ı kullanmaz — burada
    // yalnızca `children` zorunlu prop'unu tip düzeyinde karşılamak için var.
    children: <IlanListesi ilanlar={TUM_ILANLAR.slice(0, SAYFA_BOYUTU)} />,
  },
  render: () => {
    function Demo() {
      const [gosterilen, setGosterilen] = useState(SAYFA_BOYUTU)
      const [loading, setLoading] = useState(false)
      const hasMore = gosterilen < TUM_ILANLAR.length

      const handleLoadMore = () => {
        setLoading(true)
        setTimeout(() => {
          setGosterilen((n) => Math.min(n + SAYFA_BOYUTU, TUM_ILANLAR.length))
          setLoading(false)
        }, 700)
      }

      return (
        <GlassInfiniteList onLoadMore={handleLoadMore} hasMore={hasMore} loading={loading}>
          <IlanListesi ilanlar={TUM_ILANLAR.slice(0, gosterilen)} />
        </GlassInfiniteList>
      )
    }
    return <Demo />
  },
}

/** Üç durum yan yana: sırada daha fazla ilan var, yükleniyor, ve liste tükendi. */
export const Durumlar: Story = {
  args: {
    // `render` her paneli kendi sabit `ilanlar` alt kümesiyle basar — burada
    // yalnızca `children` zorunlu prop'unu tip düzeyinde karşılamak için var.
    children: <IlanListesi ilanlar={TUM_ILANLAR.slice(0, 3)} />,
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>hasMore=true, loading=false</p>
        <GlassInfiniteList onLoadMore={args.onLoadMore} hasMore loading={false}>
          <IlanListesi ilanlar={TUM_ILANLAR.slice(0, 3)} />
        </GlassInfiniteList>
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>loading=true</p>
        <GlassInfiniteList onLoadMore={args.onLoadMore} hasMore loading>
          <IlanListesi ilanlar={TUM_ILANLAR.slice(0, 3)} />
        </GlassInfiniteList>
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>hasMore=false</p>
        <GlassInfiniteList onLoadMore={args.onLoadMore} hasMore={false}>
          <IlanListesi ilanlar={TUM_ILANLAR.slice(0, 3)} />
        </GlassInfiniteList>
      </div>
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    children: (
      <IlanListesi
        ilanlar={[
          {
            id: 'ARS-9001',
            baslik:
              'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmiş Sınırında Tapu Kaydı Netleştirilmiş Yatırımlık Köşe Parsel',
            konum: 'Çanakkale, Bozcaada — Merkez Mahallesi, sahil şeridine 300 metre mesafede, imar planında turizm+konut karma kullanım alanı içinde kalan parsel',
            fiyat: '7.480.000 TL',
            renk: ['#3a5f8a', '#1f3a5f'],
          },
          ...TUM_ILANLAR.slice(0, 3),
        ]}
      />
    ),
  },
}

/** Dar konteyner (320px): satır düzeni korunur, buton/durum satırı ortalanır, dokunmatikte 44px hedef. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    children: <IlanListesi ilanlar={TUM_ILANLAR.slice(0, SAYFA_BOYUTU)} />,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, margin: '32px auto' }}>
        <Story />
      </div>
    ),
  ],
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: {
    children: <IlanListesi ilanlar={TUM_ILANLAR.slice(0, SAYFA_BOYUTU)} />,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Dipteki gözlem noktası `IntersectionObserver` destekleniyorsa `onLoadMore`\'u ' +
          'otomatik tetikler, ancak "Daha fazla yükle" butonu bu otomasyondan BAĞIMSIZ ' +
          'olarak HER ZAMAN render edilir — klavye ve yardımcı teknoloji kullanıcıları ' +
          'kaydırma davranışına muhtaç kalmaz. `loading` sırasında buton `disabled` olur; ' +
          'alt durum satırı `role="status" aria-live="polite"` ile her zaman DOM\'da bulunur ' +
          've yalnız yükleniyor/bitti durumlarında metin taşır — sonradan mount edilen canlı ' +
          'bölgeler ekran okuyucu tarafından duyurulmayacağından bu bölge koşulsuz mount edilir.',
      },
    },
  },
}
