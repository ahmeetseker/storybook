import type { Meta, StoryObj } from '@storybook/react-vite'
import { KurumsalBasvuru } from '../../../pages/KurumsalBasvuru'
import { KurumsalDogrulama } from '../../../pages/KurumsalDogrulama'
import { KurumsalTanitim } from '../../../pages/KurumsalTanitim'
import { MagazaVitrin } from '../../../pages/MagazaVitrin'

const meta = {
  title: 'Codex Enterprise/10 Sayfalar/05 Kurumsal',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true, defaultTheme: 'paper' },
    docs: {
      description: {
        component:
          'Kurumsal üyelik edinimi, başvuru, belge doğrulama ve mağaza vitrini yaşam döngüsü. Doğrulama düzeltme talebi bağımsız bir operasyon senaryosu olarak kataloglanır.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const desktopGlobals = { designTheme: 'codex-paper', forceTier: 'fallback' } as const
const mobileGlobals = { ...desktopGlobals, viewport: 'mobile1' } as const

export const KurumsalTanitimMasaustu: Story = {
  name: 'Kurumsal Tanıtım · Masaüstü',
  globals: desktopGlobals,
  render: () => <KurumsalTanitim />,
}

export const KurumsalTanitimMobil: Story = {
  name: 'Kurumsal Tanıtım · Mobil',
  globals: mobileGlobals,
  render: () => <KurumsalTanitim />,
}

export const KurumsalBasvuruMasaustu: Story = {
  name: 'Kurumsal Başvuru · Masaüstü',
  globals: desktopGlobals,
  render: () => <KurumsalBasvuru />,
}

export const KurumsalBasvuruMobil: Story = {
  name: 'Kurumsal Başvuru · Mobil',
  globals: mobileGlobals,
  render: () => <KurumsalBasvuru />,
}

export const KurumsalDogrulamaIncelemede: Story = {
  name: 'Kurumsal Doğrulama · İncelemede',
  globals: desktopGlobals,
  render: () => <KurumsalDogrulama />,
}

export const KurumsalDogrulamaIncelemedeMobil: Story = {
  name: 'Kurumsal Doğrulama · İncelemede · Mobil',
  globals: mobileGlobals,
  render: () => <KurumsalDogrulama />,
}

export const KurumsalDogrulamaDuzeltme: Story = {
  name: 'Kurumsal Doğrulama · Düzeltme talebi',
  globals: desktopGlobals,
  render: () => <KurumsalDogrulama duzeltmeTalebi />,
}

export const KurumsalDogrulamaDuzeltmeMobil: Story = {
  name: 'Kurumsal Doğrulama · Düzeltme talebi · Mobil',
  globals: mobileGlobals,
  render: () => <KurumsalDogrulama duzeltmeTalebi />,
}

export const MagazaVitrinMasaustu: Story = {
  name: 'Mağaza Vitrini · Masaüstü',
  globals: desktopGlobals,
  render: () => <MagazaVitrin />,
}

export const MagazaVitrinMobil: Story = {
  name: 'Mağaza Vitrini · Mobil',
  globals: mobileGlobals,
  render: () => <MagazaVitrin />,
}
