import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassPersonalNote } from './GlassPersonalNote'

const meta = {
  title: 'Components/GlassPersonalNote',
  component: GlassPersonalNote,
  tags: ['autodocs'],
  args: {
    onValueChange: fn(),
    onSave: fn(),
  },
  argTypes: {
    value: { control: false, description: 'Controlled kullanım — Controls yerine kod ile yönetin' },
    defaultValue: { control: 'text' },
    placeholder: { control: 'text' },
    maxLength: { control: { type: 'number', min: 10, max: 1000 } },
    onValueChange: { control: false },
    onSave: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Kullanıcının bir ilana özel yazdığı gizli not — ilan sahibine veya başka kullanıcılara ASLA ' +
          'gösterilmez. Not yokken kalem ikonlu "Not ekle" satırı, düzenlenirken flat textarea + Kaydet/Vazgeç, ' +
          'kayıtlı not varken metin + "Düzenle" aksiyonu render edilir. "Yalnız sen görürsün" gizlilik satırı ' +
          'üç durumda da sabit görünür.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(420px, 92vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassPersonalNote>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    defaultValue: '',
    placeholder: 'Bu ilan hakkında not al — yalnız sen görürsün',
    maxLength: 500,
  },
}

/** Not yokken: kalem ikonlu "Not ekle" satırı. */
export const Bos: Story = {
  name: 'Boş (not yok)',
}

/** Kayıtlı not varken: not metni + "Düzenle" aksiyonu. */
export const Kayitli: Story = {
  name: 'Kayıtlı Not',
  args: {
    defaultValue:
      'Sahibiyle telefonda görüştüm: fiyatta 150.000 TL\'ye kadar pazarlık payı olduğunu söyledi. ' +
      'Kombi 2 yıllık, aidat 1.850 TL. Perşembe günü ikinci kez yerinde görmeye gidiyoruz.',
  },
}

/** Uçtan uca akış: "Not ekle" → yaz → Kaydet, sonra "Düzenle" ile tekrar aç — yerel state ile canlı demo. */
export const Duzenleme: Story = {
  name: 'Düzenleme Akışı',
  render: () => {
    function Demo() {
      const [value, setValue] = useState('Kadıköy, Caddebostan\'daki dairenin balkon manzarası çok iyiydi.')
      return <GlassPersonalNote value={value} onValueChange={setValue} onSave={(text) => console.log('kaydedildi:', text)} />
    }
    return <Demo />
  },
  parameters: {
    docs: {
      description: {
        story:
          '"Düzenle" butonuna tıklayınca textarea açılır, odak metne taşınır. Metni değiştirip "Kaydet"e ' +
          'basarak veya Escape/"Vazgeç" ile taslağı atarak deneyebilirsin — controlled `value` + `onValueChange` ' +
          'ile yönetiliyor.',
      },
    },
  },
}

/** `maxLength` düşük tutulmuş bir örnek — kalan karakter sayacı sınıra yaklaşınca vurgulanır. */
export const KarakterSiniri: Story = {
  name: 'Karakter Sınırı',
  args: {
    defaultValue: '',
    maxLength: 40,
  },
  parameters: {
    docs: {
      description: {
        story:
          '"Not ekle"ye tıklayıp 20 karakterden fazla yazınca sayaç (kalan ≤ 20) vurgulu bir rozete döner — ' +
          'bilgi yalnız renkle değil sayının kendisiyle de taşınır.',
      },
    },
  },
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    defaultValue:
      'Bina 1998 yapımı, güçlendirme raporu ilan sahibinde mevcut ama henüz paylaşmadı — ikinci görüşmede ' +
      'isteyeceğim. Site içinde 2 asansör var, biri arızalıymış. Otopark kapalı ama daire için ayrılan yer yok, ' +
      'ortak kullanım. Komşu daire geçen yıl 5.100.000 TL\'ye satılmış, emlakçı öyle söyledi ama tapudan teyit ' +
      'etmedim. Mutlaka ikinci kez gündüz saatinde gidip gürültü seviyesine bakmalıyım — cadde tarafı.',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(320px, 92vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

/** Dar/mobil viewport — dokunmatik hedefler ≥44px'e yükselir. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    defaultValue: 'Otoparklı, metroya 5 dk.',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  parameters: {
    docs: {
      description: {
        story:
          '"Not ekle"/"Düzenle" gerçek `<button>`, tıklanınca odak doğrudan textarea\'ya taşınır (`aria-label="Not ' +
          'metni"`). Escape yalnız textarea odaktayken çalışır (`e.stopPropagation()` ile üst katmanlara sızmaz), ' +
          'IME kompozisyonu sürerken yok sayılır. "Kaydet" sonrası odak "Düzenle" butonuna, "Vazgeç"/Escape ' +
          'sonrası "Not ekle"/"Düzenle" butonuna geri döner — odak asla body\'ye düşmez. "Not kaydedildi" onayı ' +
          'her zaman mount edilmiş bir `role="status" aria-live="polite"` bölgesiyle duyurulur. "Yalnız sen ' +
          'görürsün" gizlilik satırı üç durumda da sabit görünür.',
      },
    },
  },
}
