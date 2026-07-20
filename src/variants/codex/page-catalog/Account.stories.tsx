import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ayarlar } from '../../../pages/Ayarlar'
import { Bildirimler } from '../../../pages/Bildirimler'
import { Faturalarim } from '../../../pages/Faturalarim'
import { HesapOzeti } from '../../../pages/HesapOzeti'
import { Mesajlar } from '../../../pages/Mesajlar'
import { Sikayetlerim } from '../../../pages/Sikayetlerim'

const meta = {
  title: 'Codex Enterprise/10 Sayfalar/03 Hesap',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true, defaultTheme: 'paper' },
    docs: {
      description: {
        component:
          'Oturum açmış kullanıcının hesap özeti, iletişim, bildirim, fatura, ayar ve güvenlik/şikâyet yüzeyleri. İçerikli ve boş durumlar mobil karşılıklarıyla birlikte sunulur.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const desktopGlobals = { designTheme: 'codex-paper', forceTier: 'fallback' } as const
const mobileGlobals = { ...desktopGlobals, viewport: 'mobile1' } as const

export const HesapOzetiMasaustu: Story = {
  name: 'Hesap Özeti · Masaüstü',
  globals: desktopGlobals,
  render: () => <HesapOzeti />,
}

export const HesapOzetiMobil: Story = {
  name: 'Hesap Özeti · Mobil',
  globals: mobileGlobals,
  render: () => <HesapOzeti />,
}

export const MesajlarDolu: Story = {
  name: 'Mesajlar · Konuşmalar',
  globals: desktopGlobals,
  render: () => <Mesajlar />,
}

export const MesajlarDoluMobil: Story = {
  name: 'Mesajlar · Konuşmalar · Mobil',
  globals: mobileGlobals,
  render: () => <Mesajlar />,
}

export const MesajlarBos: Story = {
  name: 'Mesajlar · Boş durum',
  globals: desktopGlobals,
  render: () => <Mesajlar bos />,
}

export const MesajlarBosMobil: Story = {
  name: 'Mesajlar · Boş durum · Mobil',
  globals: mobileGlobals,
  render: () => <Mesajlar bos />,
}

export const BildirimlerMasaustu: Story = {
  name: 'Bildirimler · Masaüstü',
  globals: desktopGlobals,
  render: () => <Bildirimler />,
}

export const BildirimlerMobil: Story = {
  name: 'Bildirimler · Mobil',
  globals: mobileGlobals,
  render: () => <Bildirimler />,
}

export const AyarlarMasaustu: Story = {
  name: 'Ayarlar · Masaüstü',
  globals: desktopGlobals,
  render: () => <Ayarlar />,
}

export const AyarlarMobil: Story = {
  name: 'Ayarlar · Mobil',
  globals: mobileGlobals,
  render: () => <Ayarlar />,
}

export const FaturalarimMasaustu: Story = {
  name: 'Faturalarım · Masaüstü',
  globals: desktopGlobals,
  render: () => <Faturalarim />,
}

export const FaturalarimMobil: Story = {
  name: 'Faturalarım · Mobil',
  globals: mobileGlobals,
  render: () => <Faturalarim />,
}

export const SikayetlerimDolu: Story = {
  name: 'Şikâyetlerim · Başvurular',
  globals: desktopGlobals,
  render: () => <Sikayetlerim />,
}

export const SikayetlerimDoluMobil: Story = {
  name: 'Şikâyetlerim · Başvurular · Mobil',
  globals: mobileGlobals,
  render: () => <Sikayetlerim />,
}

export const SikayetlerimBos: Story = {
  name: 'Şikâyetlerim · Boş durum',
  globals: desktopGlobals,
  render: () => <Sikayetlerim sikayetler={[]} />,
}

export const SikayetlerimBosMobil: Story = {
  name: 'Şikâyetlerim · Boş durum · Mobil',
  globals: mobileGlobals,
  render: () => <Sikayetlerim sikayetler={[]} />,
}
