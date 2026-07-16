import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassList, GlassListItem } from './GlassList'

/* Satır ikonları: emoji yerine tek renkli çizgi SVG (currentColor) */
const ikon = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)
const IkonBelge = ikon('M4 1.5h5l3.5 3.5v9.5h-9v-13Z M9 1.5v3.5h3.5 M6 8h4 M6 10.5h4')
const IkonYildiz = ikon('M8 1.8 9.9 5.7l4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.8Z')
const IkonMesaj = ikon('M2 3h12v8H8.5L5 13.8V11H2V3Z')
const IkonZil = ikon('M8 2a4 4 0 0 0-4 4v2.5L2.8 11h10.4L12 8.5V6a4 4 0 0 0-4-4Z M6.5 13a1.5 1.5 0 0 0 3 0')
const IkonBina = ikon('M3 14.5V2.5h6v12 M9 6h4v8.5 M5 5h2 M5 7.5h2 M5 10h2 M2 14.5h12')
const IkonArac = ikon('M2.5 9.5 4 5.5h8l1.5 4v3.5h-2v-1.5h-7v1.5h-2V9.5Z M2.5 9.5h11')

const meta = {
  title: 'Components/GlassList',
  component: GlassList,
  tags: ['autodocs'],
  args: {
    header: 'İlan Bilgileri',
    children: null,
  },
  argTypes: {
    inset: { control: 'boolean', description: 'Radius’lu kart görünümü; false → kenardan kenara' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(420px, 92vw)', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <GlassList header="İlan Bilgileri" footer="Bilgiler satıcı beyanına dayanır.">
      <GlassListItem title="Marka" detail="Volkswagen" />
      <GlassListItem title="Model" detail="Passat 1.6 TDI" />
      <GlassListItem title="Yıl" detail="2019" />
      <GlassListItem title="Kilometre" detail="118.000 km" />
    </GlassList>
  ),
}

/** Tıklanabilir satırlar: onClick verilen satır tam genişlik <button> olur;
    chevron satırın bir sayfaya götürdüğünü ima eder. */
export const Interactive: Story = {
  render: () => (
    <GlassList header="Hesabım">
      <GlassListItem icon={IkonBelge} title="İlanlarım" subtitle="3 aktif ilan" chevron onClick={fn()} />
      <GlassListItem icon={IkonYildiz} title="Favorilerim" detail="12" chevron onClick={fn()} />
      <GlassListItem icon={IkonMesaj} title="Mesajlarım" subtitle="2 okunmamış" chevron onClick={fn()} />
      <GlassListItem icon={IkonZil} title="Aramalarım" chevron onClick={fn()} disabled />
    </GlassList>
  ),
}

/** Yıkıcı aksiyon: başlık --lg-danger; grubun en altında tek başına durur. */
export const Destructive: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GlassList header="İlan Yönetimi">
        <GlassListItem title="İlanı Düzenle" chevron onClick={fn()} />
        <GlassListItem title="Dopingleri Gör" detail="2 aktif" chevron onClick={fn()} />
      </GlassList>
      <GlassList>
        <GlassListItem title="İlanı Yayından Kaldır" destructive onClick={fn()} />
      </GlassList>
    </div>
  ),
}

/** inset=false: kenardan kenara — köşe radius'u yok; tam genişlik yerleşimlerde. */
export const NoInset: Story = {
  render: () => (
    <GlassList header="Satıcı" inset={false}>
      <GlassListItem icon={IkonBina} title="Yılmaz Otomotiv" subtitle="Kurumsal satıcı" chevron onClick={fn()} />
      <GlassListItem title="Konum" detail="İstanbul, Kadıköy" />
      <GlassListItem title="Üyelik" detail="2017’den beri" />
    </GlassList>
  ),
}

/** Uzun içerik: başlık/alt başlık tek satırda kırpılır (ellipsis), detay sıkışmaz. */
export const LongContent: Story = {
  render: () => (
    <GlassList header="Açıklama Alanları">
      <GlassListItem
        icon={IkonArac}
        title="Hatasız boyasız değişensiz ilk sahibinden garaj arabası"
        subtitle="Tüm bakımları yetkili serviste yapıldı, faturaları mevcuttur"
        detail="2019"
        chevron
        onClick={fn()}
      />
      <GlassListItem title="Takas" detail="Olabilir" />
    </GlassList>
  ),
}

/** Responsive: bp-md altında yalnız yatay padding daralır — inset prop'una
    saygı sürer, liste kendi kendine köşesiz görünüme DÜŞMEZ. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <GlassList header="Hesabım" footer="Dar ekranda satır iç boşluğu daralır, köşeler korunur.">
      <GlassListItem icon={IkonBelge} title="İlanlarım" subtitle="3 aktif ilan" chevron onClick={fn()} />
      <GlassListItem icon={IkonYildiz} title="Favorilerim" detail="12" chevron onClick={fn()} />
      <GlassListItem icon={IkonMesaj} title="Mesajlarım" chevron onClick={fn()} />
    </GlassList>
  ),
}
