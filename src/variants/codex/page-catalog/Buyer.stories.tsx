import type { Meta, StoryObj } from '@storybook/react-vite'
import { Arama } from '../../../pages/Arama'
import { AramaAlarmlari } from '../../../pages/AramaAlarmlari'
import { ArsaIlanDetay } from '../../../pages/ArsaIlanDetay'
import { Karsilastir } from '../../../pages/Karsilastir'
import { Kaydettiklerim } from '../../../pages/Kaydettiklerim'
import { KonutIlanDetay } from '../../../pages/KonutIlanDetay'

const meta = {
  title: 'Codex Enterprise/10 Sayfalar/02 Alıcı',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true, defaultTheme: 'paper' },
    docs: {
      description: {
        component:
          'Alıcının keşif, arama, harita, karşılaştırma, favori ve alarm iş akışları. Liste, harita ve bölünmüş arama görünümü ayrı senaryolar olarak denetlenebilir.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const desktopGlobals = { designTheme: 'codex-paper', forceTier: 'fallback' } as const
const mobileGlobals = { ...desktopGlobals, viewport: 'mobile1' } as const

export const AramaListe: Story = {
  name: 'Arama · Liste',
  globals: desktopGlobals,
  render: () => <Arama baslangicGorunumu="liste" />,
}

export const AramaListeMobil: Story = {
  name: 'Arama · Liste · Mobil',
  globals: mobileGlobals,
  render: () => <Arama baslangicGorunumu="liste" />,
}

export const AramaHarita: Story = {
  name: 'Arama · Harita',
  globals: desktopGlobals,
  render: () => <Arama baslangicGorunumu="harita" />,
}

export const AramaHaritaMobil: Story = {
  name: 'Arama · Harita · Mobil',
  globals: mobileGlobals,
  render: () => <Arama baslangicGorunumu="harita" />,
}

export const AramaBolunmus: Story = {
  name: 'Arama · Bölünmüş',
  globals: desktopGlobals,
  render: () => <Arama baslangicGorunumu="bolunmus" />,
}

export const AramaBolunmusMobil: Story = {
  name: 'Arama · Bölünmüş · Mobil',
  globals: mobileGlobals,
  render: () => <Arama baslangicGorunumu="bolunmus" />,
}

export const AramaAlarmlariDolu: Story = {
  name: 'Arama Alarmları · Kayıtlı aramalar',
  globals: desktopGlobals,
  render: () => <AramaAlarmlari />,
}

export const AramaAlarmlariDoluMobil: Story = {
  name: 'Arama Alarmları · Kayıtlı aramalar · Mobil',
  globals: mobileGlobals,
  render: () => <AramaAlarmlari />,
}

export const AramaAlarmlariBos: Story = {
  name: 'Arama Alarmları · Boş durum',
  globals: desktopGlobals,
  render: () => <AramaAlarmlari alarmlar={[]} />,
}

export const AramaAlarmlariBosMobil: Story = {
  name: 'Arama Alarmları · Boş durum · Mobil',
  globals: mobileGlobals,
  render: () => <AramaAlarmlari alarmlar={[]} />,
}

export const ArsaIlanDetayMasaustu: Story = {
  name: 'Arsa İlan Detayı · Masaüstü',
  globals: desktopGlobals,
  render: () => <ArsaIlanDetay />,
}

export const ArsaIlanDetayMobil: Story = {
  name: 'Arsa İlan Detayı · Mobil',
  globals: mobileGlobals,
  render: () => <ArsaIlanDetay />,
}

export const KonutIlanDetayMasaustu: Story = {
  name: 'Konut İlan Detayı · Masaüstü',
  globals: desktopGlobals,
  render: () => <KonutIlanDetay />,
}

export const KonutIlanDetayMobil: Story = {
  name: 'Konut İlan Detayı · Mobil',
  globals: mobileGlobals,
  render: () => <KonutIlanDetay />,
}

export const KarsilastirMasaustu: Story = {
  name: 'Karşılaştır · Masaüstü',
  globals: desktopGlobals,
  render: () => <Karsilastir />,
}

export const KarsilastirMobil: Story = {
  name: 'Karşılaştır · Mobil',
  globals: mobileGlobals,
  render: () => <Karsilastir />,
}

export const KaydettiklerimMasaustu: Story = {
  name: 'Kaydettiklerim · Masaüstü',
  globals: desktopGlobals,
  render: () => <Kaydettiklerim />,
}

export const KaydettiklerimMobil: Story = {
  name: 'Kaydettiklerim · Mobil',
  globals: mobileGlobals,
  render: () => <Kaydettiklerim />,
}
