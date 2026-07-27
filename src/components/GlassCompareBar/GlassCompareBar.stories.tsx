import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassCompareBar, type GlassCompareBarItem } from './GlassCompareBar'
import { placeholderImage } from '../../demo/placeholderImage'

const uc1: GlassCompareBarItem = {
  id: 'ilan-caddebostan',
  title: 'Kadıköy Caddebostan Deniz Manzaralı 3+1',
  image: placeholderImage('Caddebostan', '#0f766e', '#134e4a', 240, 240),
}
const uc2: GlassCompareBarItem = {
  id: 'ilan-levent',
  title: 'Beşiktaş Levent Ofis Katı 2+1',
  image: placeholderImage('Levent', '#92400e', '#78350f', 240, 240),
}
const uc3: GlassCompareBarItem = {
  id: 'ilan-cengelkoy',
  title: 'Üsküdar Çengelköy Bahçeli Müstakil Ev',
  image: placeholderImage('Çengelköy', '#155e75', '#164e63', 240, 240),
}
const uc4: GlassCompareBarItem = {
  id: 'ilan-etiler',
  title: 'Beşiktaş Etiler Rezidans 1+1',
  // Görsel yok — dekoratif yer tutucu simgeyle gösterilir
}

const uzunBaslikliUcIlan: GlassCompareBarItem[] = [
  {
    id: 'ilan-uzun-1',
    title: 'Sarıyer Tarabya, boğaz manzaralı, deniz sıfırı, özel iskeleli müstakil villa',
  },
  {
    id: 'ilan-uzun-2',
    title: 'Beykoz Kanlıca, koru içinde tarihi yalı dairesi, restore edilmiş',
  },
  {
    id: 'ilan-uzun-3',
    title: 'Zekeriyaköy site içi, güvenlikli, havuzlu, bahçe katı dubleks',
  },
]

/** Kendi favoriler listesini tutan interaktif demo — kaldırma/temizle gerçekten listeyi günceller. */
function CompareBarDemo({ initialItems }: { initialItems: GlassCompareBarItem[] }) {
  const [items, setItems] = useState(initialItems)
  return (
    <GlassCompareBar
      items={items}
      onRemove={(id) => setItems((prev) => prev.filter((item) => item.id !== id))}
      onCompare={() => window.alert(`${items.length} ilan karşılaştırılıyor`)}
      onClear={() => setItems([])}
    />
  )
}

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassCompareBar',
  component: GlassCompareBar,
  tags: ['autodocs'],
  args: {
    items: [uc1, uc2, uc3],
    onRemove: fn(),
    onCompare: fn(),
  },
  argTypes: {
    items: { control: false },
    onRemove: { control: false },
    onCompare: { control: false },
    onClear: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Sayfa altında sabit karşılaştırma tepsisi. Ayrı bir `open` prop\'u yoktur — `items.length > 0` iken ' +
          'otomatik görünür, `translateY` ile süzülerek girer/çıkar (hareket azaltmada anlık). Mini kartlar ' +
          '(görsel + kısaltılmış başlık + kaldır ×), sağda "Karşılaştır (N)" ve opsiyonel "Temizle" aksiyonu içerir.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', minHeight: 420, width: '100%' }}>
        <p style={{ maxWidth: 480, color: 'var(--lg-label-secondary)', fontSize: 13 }}>
          Favorilere eklenen ilanlar — tepsi sayfanın altında sabit kalır (bu demo alanının değil, viewport'un
          altına sabitlenir).
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassCompareBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  render: () => <CompareBarDemo initialItems={[uc1, uc2, uc3, uc4]} />,
  parameters: {
    docs: {
      description: {
        story:
          'Kaldır (×) ve "Temizle" gerçekten yerel state\'i günceller; son ilan kaldırılınca tepsi kaybolur. ' +
          '"Karşılaştır" bir uyarı penceresiyle seçim sayısını gösterir.',
      },
    },
  },
}

export const TekIlan: Story = {
  name: 'Durum — Tek İlan (yetersiz seçim)',
  args: { items: [uc1] },
  parameters: {
    docs: {
      description: {
        story:
          '`items.length < 2` iken "Karşılaştır" butonu disabled olur ve butonun altında görünür (renkle sınırlı ' +
          'olmayan) bir ipucu metni belirir: "En az 2 ilan seç".',
      },
    },
  },
}

export const MaxLimitAsimi: Story = {
  name: 'Durum — maxItems Aşımı',
  args: {
    items: [uc1, uc2, uc3, uc4, { ...uc1, id: 'ilan-fazladan' }],
    maxItems: 4,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`items.length > maxItems` (varsayılan 4) olduğunda component listeyi KIRPMAZ — tüm kartlar görünür ' +
          'kalır, yalnızca "Karşılaştır" butonu geçici olarak disabled olur ve "En fazla N ilan karşılaştırılabilir" ' +
          'ipucu görünür. Sınırı fiilen uygulamak (ör. "karşılaştırmaya ekle" butonunu kısıtlamak) çağıranın işidir.',
      },
    },
  },
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: { items: uzunBaslikliUcIlan },
  parameters: {
    docs: {
      description: {
        story:
          'Uzun ilan başlıkları kart içinde tek satırda CSS ile kırpılır (`text-overflow: ellipsis`); tam metin ' +
          '`title` özniteliğinde ve kaldırma butonunun erişilebilir isminde korunur.',
      },
    },
  },
}

export const Responsive: Story = {
  args: { items: [uc1, uc2, uc3] },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', minHeight: 360, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'Dar viewport\'ta kart listesi yatay kaydırma şeridine dönüşür, eylem grubu sağda sabit kalır (breakpoint yok — içsel akış).',
      },
    },
  },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { items: [uc1, uc2] },
  parameters: {
    docs: {
      description: {
        story:
          'Kök `role="region" aria-label="Karşılaştırma tepsisi"` — kalıcı bir bölge olduğundan görünürlük ' +
          'değişimi `aria-live` ile duyurulmaz (spesifik bir bildirim değil, sayfanın her zaman var olabilecek bir ' +
          'parçasıdır). Her kaldırma butonunun erişilebilir ismi ilan başlığını içerir ("Karşılaştırmadan çıkar: ' +
          '…"). "Karşılaştır" butonu disabled olduğunda yanındaki ipucu `aria-describedby` ile bağlanır ve her ' +
          'zaman görünür metindir — durum yalnızca renkle iletilmez. Kaldırma butonuna tıklandıktan sonra odak, ' +
          'kalan ilk kartın kaldırma butonuna taşınır; son kart kaldırıldığında tepsi tamamen kaybolur.',
      },
    },
  },
}
