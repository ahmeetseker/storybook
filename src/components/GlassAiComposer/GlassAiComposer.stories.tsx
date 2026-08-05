import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, userEvent, within } from 'storybook/test'
import {
  GlassAiComposer,
  type GlassAiComposerAnswer,
  type GlassAiComposerAttachment,
  type GlassAiComposerTool,
} from './GlassAiComposer'

const meta = {
  title: 'Bileşenler/AI/GlassAiComposer',
  component: GlassAiComposer,
  tags: ['autodocs'],
  args: {
    onSubmit: fn(),
    size: 'lg',
    loading: false,
    announcementMode: 'internal',
  },
  argTypes: {
    onSubmit: { control: false },
    onValueChange: { control: false },
    onToolSelect: { control: false },
    onRemoveAttachment: { control: false },
    onAnswerChipSelect: { control: false },
    tools: { control: false },
    attachments: { control: false },
    answer: { control: false },
    size: {
      control: 'inline-radio',
      options: ['md', 'lg'],
      description: 'lg: hero/tam yerleşim · md: dar alan. Anatomi iki ölçekte aynıdır.',
    },
    announcementMode: {
      control: 'select',
      options: ['internal', 'external'],
      description: 'external: parent tek canlı bölge yönetiyorsa iç aria-live kaldırılır.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Konuşmalı brief kompozitörü — tek satırlık arama yerine uzun cümleyle ne arandığını ' +
          'anlatmak, isteğe bağlı bağlam (harita alanı, görsel, ses) eklemek ve karşılığında liste ' +
          'değil özet + takip önerisi + atıf almak için. Tek seferlik akıştır: bir brief, bir cevap. ' +
          'Kabuk düz yüzeydir (surface + hairline); cam yalnız gömülü gönder butonundadır.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 620, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassAiComposer>

export default meta
type Story = StoryObj<typeof meta>

const TOOLS: GlassAiComposerTool[] = [
  { id: 'map', label: 'Haritadan alan', icon: <span aria-hidden="true">◎</span> },
  { id: 'image', label: 'Görselle', icon: <span aria-hidden="true">▣</span> },
  { id: 'voice', label: 'Sesli', icon: <span aria-hidden="true">◍</span> },
]

const ATTACHMENTS: GlassAiComposerAttachment[] = [
  { id: 'alan', label: 'Urla, 4 km²', kind: 'Harita alanı', icon: <span aria-hidden="true">◎</span> },
  { id: 'gorsel', label: 'salon-referans.jpg', kind: 'Görsel', icon: <span aria-hidden="true">▣</span> },
]

const ANSWER: GlassAiComposerAnswer = {
  text:
    'Bütçen ve "okula yakın + bahçeli" kriterine göre üç bölge öne çıkıyor: Urla İskele, ' +
    'Güzelbahçe ve Seferihisar Sığacık. Toplam 27 ilan eşleşti — ortalama 5,4 milyon ₺, ' +
    'ortalama bahçe 180 m².',
  chips: [
    { id: 'harita', label: 'Bunları haritada gör' },
    { id: 'daralt', label: 'Sadece Urla' },
    { id: 'kredi', label: 'Kredi hesapla' },
  ],
  sources: '27 ilan · 3 bölge fiyat verisi · son 90 gün',
}

const BRIEF = 'Ailemle taşınacağız, okula yakın, bahçeli, 6 milyona kadar bir ev arıyoruz.'

export const Default: Story = {
  args: { defaultValue: '' },
}

export const Playground: Story = {
  args: {
    defaultValue: BRIEF,
    tools: TOOLS,
  },
}

export const Sizes: Story = {
  args: { defaultValue: BRIEF, tools: TOOLS },
  render: (args) => (
    <div style={{ display: 'grid', gap: 32 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.6 }}>size="lg" — hero</p>
        <GlassAiComposer {...args} size="lg" />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.6 }}>size="md" — dar alan</p>
        <GlassAiComposer {...args} size="md" />
      </div>
    </div>
  ),
}

export const AraclarIle: Story = {
  name: 'Araçlarla',
  args: { defaultValue: '', tools: TOOLS },
}

export const EklerIle: Story = {
  name: 'Eklerle',
  args: {
    defaultValue: 'Bu alanda, referanstaki salona benzer bir ev arıyorum.',
    tools: TOOLS,
    attachments: ATTACHMENTS,
  },
}

export const Yukleniyor: Story = {
  name: 'Yükleniyor',
  args: {
    defaultValue: BRIEF,
    tools: TOOLS,
    attachments: ATTACHMENTS,
    loading: true,
    loadingLabel: 'Kriterlerin okunuyor, 4.812 ilan taranıyor…',
  },
}

export const Cevapla: Story = {
  args: {
    defaultValue: BRIEF,
    tools: TOOLS,
    answer: ANSWER,
  },
}

function AkisDemo() {
  const [value, setValue] = useState(BRIEF)
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<GlassAiComposerAnswer | null>(null)
  const [attachments, setAttachments] = useState<GlassAiComposerAttachment[]>([])

  return (
    <GlassAiComposer
      value={value}
      onValueChange={setValue}
      tools={TOOLS}
      attachments={attachments}
      onToolSelect={(id) => {
        const tool = TOOLS.find((t) => t.id === id)
        if (!tool || attachments.some((a) => a.id === id)) return
        setAttachments((prev) => [
          ...prev,
          { id, label: tool.label, kind: tool.label, icon: tool.icon },
        ])
      }}
      onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
      loading={loading}
      loadingLabel="Kriterlerin okunuyor, 4.812 ilan taranıyor…"
      answer={answer}
      onSubmit={() => {
        setAnswer(null)
        setLoading(true)
        window.setTimeout(() => {
          setLoading(false)
          setAnswer(ANSWER)
        }, 1400)
      }}
      onAnswerChipSelect={fn()}
    />
  )
}

/** Gerçek akış: araç seç → ek chip'i doğar → gönder → düşünüyor → yapılandırılmış cevap. */
export const AkisSimulasyonu: Story = {
  name: 'Akış simülasyonu',
  args: { defaultValue: BRIEF },
  render: () => <AkisDemo />,
}

/** Uzun TR kelimeler, uzun ek etiketi ve uzun cevap — taşma/kırılma davranışı. */
export const UzunIcerik: Story = {
  name: 'Uzun içerik',
  args: {
    defaultValue:
      'Kahramanmaraşlılaştıramadıklarımızdanmışsınızcasına uzun bir cümleyle anlatıyorum: ' +
      'ailecek taşınacağımız, okula yürüme mesafesinde, bahçesi çocuklar için güvenli, ' +
      'otoparkı olan, ısıtma giderleri düşük bir ev arıyoruz.',
    tools: TOOLS,
    attachments: [
      {
        id: 'uzun',
        label: 'Seferihisar-Sığacık-kıyı-şeridi-genişletilmiş-seçim-alanı',
        kind: 'Harita alanı',
      },
    ],
    answer: {
      ...ANSWER,
      text: ANSWER.text.repeat(2),
    },
  },
}

/** Dar container + dokunmatik hedefler — araç çubuğu sarar, kontroller 44px'e çıkar. */
export const Responsive: Story = {
  args: { defaultValue: BRIEF, tools: TOOLS, attachments: ATTACHMENTS },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <GlassAiComposer {...args} size="md" />
    </div>
  ),
}

/** Düz fildişi zemin: kompozitör canlı arka planlarda da düz yüzey kalır — burada zemin sabittir. */
export const DuzZemin: Story = {
  parameters: { globals: { backgroundKey: 'light' } },
  args: { defaultValue: BRIEF, tools: TOOLS, answer: ANSWER },
}

/** Focus sırası: ek kaldır → textarea → araçlar → gönder → cevap chip'leri. */
export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: {
    defaultValue: BRIEF,
    tools: TOOLS,
    attachments: ATTACHMENTS,
    answer: ANSWER,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Aradığını anlat' })
    await userEvent.click(input)
    await userEvent.tab()
  },
}
