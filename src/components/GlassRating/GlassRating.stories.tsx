import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassRating } from './GlassRating'

const meta = {
  title: 'Components/GlassRating',
  component: GlassRating,
  tags: ['autodocs'],
  args: { variant: 'display', value: 4.6, count: 128 },
  argTypes: {
    variant: { control: 'select', options: ['display', 'input', 'summary'] },
    value: { control: { type: 'number', min: 0, max: 5, step: 0.1 } },
    count: { control: { type: 'number', min: 0 } },
  },
} satisfies Meta<typeof GlassRating>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = { args: { value: 3.8, count: 42 } }

/** Üç kullanım biçimi: salt-okunur özet, etkileşimli giriş, ortalama + dağılım özeti. */
export const Variants: Story = {
  name: 'Varyantlar',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: 320 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>display</p>
        <GlassRating variant="display" value={4.6} count={128} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>input</p>
        <GlassRating variant="input" label="Satıcıyı puanlayın" defaultValue={4} onValueChange={fn()} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>summary</p>
        <GlassRating variant="summary" value={4.4} distribution={[212, 96, 22, 8, 4]} />
      </div>
    </div>
  ),
}

/** display: yıldız + sayı biçimi — count verilmezse metin gizlenir, yalnız yıldızlar kalır. */
export const DisplayVaryanti: Story = {
  name: 'Display — Adetli / Adetsiz',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
      <GlassRating variant="display" value={4.9} count={2140} />
      <GlassRating variant="display" value={3.5} count={7} />
      <GlassRating variant="display" value={4} />
      <GlassRating variant="display" value={0.5} count={1} />
    </div>
  ),
}

function ControlledDemo() {
  const [value, setValue] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <GlassRating variant="input" label="Deneyiminizi puanlayın" value={value} onValueChange={setValue} />
      <span style={{ fontSize: 13, opacity: 0.7 }}>
        {value > 0 ? `Seçilen puan: ${value}/5` : 'Henüz puan seçilmedi'}
      </span>
    </div>
  )
}

/** input: controlled kullanım — dışarıdan puan atanır, seçim değiştikçe metin güncellenir. */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

/** State matrisi: boş seçim · seçili · disabled. */
export const States: Story = {
  name: 'Durumlar',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <GlassRating variant="input" label="Boş — henüz puan yok" />
      <GlassRating variant="input" label="Seçili" defaultValue={5} />
      <GlassRating variant="input" label="Devre dışı" defaultValue={3} disabled />
    </div>
  ),
}

/** Ortalama 0'a yakın veya toplam 0 değerlendirme — dağılım barları boş kalır, %'ye bölünmez hata vermez. */
export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: 320 }}>
      <GlassRating
        variant="display"
        value={4.7}
        count={18432}
      />
      <div style={{ borderRadius: 'var(--lg-radius-card)', border: '1px solid var(--lg-hairline)', padding: 20 }}>
        <GlassRating variant="summary" value={0} distribution={[0, 0, 0, 0, 0]} />
      </div>
    </div>
  ),
}

/** Dar konteyner + dokunmatik bağlam: input yıldız hedefleri 44px'e büyür. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <GlassRating variant="display" value={4.3} count={56} />
      <GlassRating variant="input" label="Satıcıyı puanlayın" defaultValue={4} />
      <GlassRating variant="summary" value={4.4} distribution={[212, 96, 22, 8, 4]} />
    </div>
  ),
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { variant: 'display', value: 4.6, count: 128 },
  parameters: {
    docs: {
      description: {
        story:
          '`display`: kök `role="img"` + hesaplanmış `aria-label` ("5 üzerinden 4,6 yıldız, 128 ' +
          'değerlendirme") taşır; yıldız SVG\'leri ve görünür metin AT\'ye ayrıca duyurulmasın diye ' +
          '`aria-hidden`. `input`: `role="radiogroup"` + her yıldız `role="radio"` ve `"N yıldız"` adıyla; ' +
          'roving tabindex — yalnız seçili (veya seçim yoksa ilk) yıldız tab sırasında, ok tuşları ' +
          'önceki/sonraki yıldıza sarar, Home/End uçlara gider. `summary`: ortalama ve toplam adet ' +
          'düz görünür metin, dağılım çubukları dekoratif (`aria-hidden`), etiket + adet `dl/dt/dd` ile eşlenir.',
      },
    },
  },
}
