import type { Meta, StoryObj } from '@storybook/react-vite'
import { DopingOdeme } from '../../../pages/DopingOdeme'
import { IlanVer } from '../../../pages/IlanVer'
import { Ilanlarim } from '../../../pages/Ilanlarim'
import { IlanYonetimi } from '../../../pages/IlanYonetimi'
import { YeniIlanSihirbazi } from '../../../pages/YeniIlanSihirbazi'
import { ilanlar } from '../../../pages/shared/data'

const meta = {
  title: 'Codex Enterprise/10 Sayfalar/04 Satıcı',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true, defaultTheme: 'paper' },
    docs: {
      description: {
        component:
          'Bireysel satıcının ilan başlatma, 13 adımlı oluşturma, moderasyon, yayın yönetimi ve öne çıkarma ödeme akışları. Kritik EİDS ve değişiklik talebi durumları ayrı örneklenir.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const desktopGlobals = { designTheme: 'codex-paper', forceTier: 'fallback' } as const
const mobileGlobals = { ...desktopGlobals, viewport: 'mobile1' } as const

export const IlanVerMasaustu: Story = {
  name: 'İlan Ver · Masaüstü',
  globals: desktopGlobals,
  render: () => <IlanVer />,
}

export const IlanVerMobil: Story = {
  name: 'İlan Ver · Mobil',
  globals: mobileGlobals,
  render: () => <IlanVer />,
}

export const IlanlarimMasaustu: Story = {
  name: 'İlanlarım · Masaüstü',
  globals: desktopGlobals,
  render: () => <Ilanlarim />,
}

export const IlanlarimMobil: Story = {
  name: 'İlanlarım · Mobil',
  globals: mobileGlobals,
  render: () => <Ilanlarim />,
}

export const IlanYonetimiYayinda: Story = {
  name: 'İlan Yönetimi · Yayında',
  globals: desktopGlobals,
  render: () => <IlanYonetimi ilan={ilanlar[0]} />,
}

export const IlanYonetimiMobil: Story = {
  name: 'İlan Yönetimi · Mobil',
  globals: mobileGlobals,
  render: () => <IlanYonetimi ilan={ilanlar[0]} />,
}

export const IlanYonetimiDegisiklikIstendi: Story = {
  name: 'İlan Yönetimi · Değişiklik istendi',
  globals: desktopGlobals,
  render: () => (
    <IlanYonetimi
      ilan={{ ...ilanlar[1], durum: 'degisiklik-istendi' }}
      moderasyonNotu="İlan başlığındaki getiri vaadini kaldırın ve hisseli tapu oranını açıklamaya ekleyin."
    />
  ),
}

export const IlanYonetimiDegisiklikIstendiMobil: Story = {
  name: 'İlan Yönetimi · Değişiklik istendi · Mobil',
  globals: mobileGlobals,
  render: () => (
    <IlanYonetimi
      ilan={{ ...ilanlar[1], durum: 'degisiklik-istendi' }}
      moderasyonNotu="İlan başlığındaki getiri vaadini kaldırın ve hisseli tapu oranını açıklamaya ekleyin."
    />
  ),
}

export const DopingOdemeMasaustu: Story = {
  name: 'Doping Ödeme · Masaüstü',
  globals: desktopGlobals,
  render: () => <DopingOdeme />,
}

export const DopingOdemeMobil: Story = {
  name: 'Doping Ödeme · Mobil',
  globals: mobileGlobals,
  render: () => <DopingOdeme />,
}

export const YeniIlanAdim01IlanTipi: Story = {
  name: 'Yeni İlan · 01 İlan ve taşınmaz tipi',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={1} />,
}

export const YeniIlanAdim02Sifat: Story = {
  name: 'Yeni İlan · 02 İlan verme sıfatı',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={2} />,
}

export const YeniIlanAdim03EidsBasarili: Story = {
  name: 'Yeni İlan · 03 EİDS başarılı',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={3} eidsSonucu="basarili" />,
}

export const YeniIlanAdim03EidsBasarisiz: Story = {
  name: 'Yeni İlan · 03 EİDS başarısız',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={3} eidsSonucu="basarisiz" />,
}

export const YeniIlanAdim03EidsBasarisizMobil: Story = {
  name: 'Yeni İlan · 03 EİDS başarısız · Mobil',
  globals: mobileGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={3} eidsSonucu="basarisiz" />,
}

export const YeniIlanAdim04Konum: Story = {
  name: 'Yeni İlan · 04 Konum',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={4} />,
}

export const YeniIlanAdim05AdaParsel: Story = {
  name: 'Yeni İlan · 05 Ada ve parsel',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={5} />,
}

export const YeniIlanAdim06ImarTapu: Story = {
  name: 'Yeni İlan · 06 İmar ve tapu',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={6} />,
}

export const YeniIlanAdim07Teknik: Story = {
  name: 'Yeni İlan · 07 Teknik özellikler',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={7} />,
}

export const YeniIlanAdim08Fiyat: Story = {
  name: 'Yeni İlan · 08 Fiyat ve paket',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={8} />,
}

export const YeniIlanAdim09Medya: Story = {
  name: 'Yeni İlan · 09 Fotoğraf ve video',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={9} />,
}

export const YeniIlanAdim10Aciklama: Story = {
  name: 'Yeni İlan · 10 Açıklama',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={10} />,
}

export const YeniIlanAdim11Iletisim: Story = {
  name: 'Yeni İlan · 11 İletişim tercihleri',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={11} />,
}

export const YeniIlanAdim12Onizleme: Story = {
  name: 'Yeni İlan · 12 Önizleme',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={12} />,
}

export const YeniIlanAdim13Beyan: Story = {
  name: 'Yeni İlan · 13 Beyan ve gönderim',
  globals: desktopGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={13} />,
}

export const YeniIlanSihirbaziMobil: Story = {
  name: 'Yeni İlan · Mobil',
  globals: mobileGlobals,
  render: () => <YeniIlanSihirbazi baslangicAdimi={3} />,
}
