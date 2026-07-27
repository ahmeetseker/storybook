import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassVoiceBar, type GlassVoiceBarState } from './GlassVoiceBar'

const meta = {
  title: 'Bileşenler/AI/GlassVoiceBar',
  component: GlassVoiceBar,
  tags: ['autodocs'],
  args: {
    state: 'idle',
    onStart: fn(),
    onStop: fn(),
  },
  argTypes: {
    state: {
      control: { type: 'radio' },
      options: ['idle', 'listening', 'processing'],
    },
    onStart: { control: false },
    onStop: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Sesli arama çubuğu — mikrofon butonu (idle/listening/processing) ve yanındaki canlı ' +
          'transkript/ipucu satırını tek pakette sunar. `state` daima dışarıdan verilir (controlled ' +
          'zorunlu); ses tanıma entegrasyonu (Web Speech API vb.) component kapsamı dışındadır — ' +
          '`onStart`/`onStop` yalnız kullanıcı niyetini bildirir, `transcript` dışarıdan beslenir.',
      },
    },
  },
} satisfies Meta<typeof GlassVoiceBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { state: 'idle' },
}

export const Playground: Story = {
  args: {
    state: 'idle',
    transcript: '',
  },
}

/** Gerçek bir akışı simüle eden interaktif demo: dinlemeyi başlat → transkript büyür → durdur → işleniyor → sonuç. */
function VoiceBarFlowDemo() {
  const [state, setState] = useState<GlassVoiceBarState>('idle')
  const [transcript, setTranscript] = useState('')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const active = timers.current
    return () => active.forEach(clearTimeout)
  }, [])

  const schedule = (fn: () => void, delay: number) => {
    timers.current.push(setTimeout(fn, delay))
  }

  const handleStart = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setTranscript('')
    setState('listening')
    schedule(() => setTranscript('İzmir Urla'), 650)
    schedule(() => setTranscript('İzmir Urla imarlı'), 1300)
    schedule(() => setTranscript('İzmir Urla imarlı arsa arıyorum'), 1950)
  }

  const handleStop = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setState('processing')
    schedule(() => setState('idle'), 1100)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
      <GlassVoiceBar state={state} onStart={handleStart} onStop={handleStop} transcript={transcript} />
      <p style={{ margin: 0, fontSize: 13, color: 'var(--lg-label-secondary)' }}>
        Güncel durum: <strong>{state}</strong>
      </p>
    </div>
  )
}

/** `state` her zaman dışarıdan gelir — bu demo gerçek çağıranın (Web Speech API vb.) davranışını simüle eder. */
export const Controlled: Story = {
  render: () => <VoiceBarFlowDemo />,
}

/** Üç durumun yan yana görünümü: idle (ipucu), listening (nabız halkası + canlı transkript), processing (soluk + "Çözümleniyor…"). */
export const Durumlar: Story = {
  name: 'Durumlar',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 360 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>idle — henüz konuşulmadı</p>
        <GlassVoiceBar state="idle" onStart={fn()} onStop={fn()} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>listening — canlı transkript geliyor</p>
        <GlassVoiceBar
          state="listening"
          onStart={fn()}
          onStop={fn()}
          transcript="İzmir Urla imarlı arsa arıyorum, bütçem 3 milyon TL civarı"
        />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>listening — henüz ses algılanmadı</p>
        <GlassVoiceBar state="listening" onStart={fn()} onStop={fn()} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>processing — çözümleniyor</p>
        <GlassVoiceBar
          state="processing"
          onStart={fn()}
          onStop={fn()}
          transcript="İzmir Urla imarlı arsa arıyorum, bütçem 3 milyon TL civarı"
        />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>idle — sonuç geldikten sonra</p>
        <GlassVoiceBar
          state="idle"
          onStart={fn()}
          onStop={fn()}
          transcript="İzmir Urla imarlı arsa arıyorum, bütçem 3 milyon TL civarı"
        />
      </div>
    </div>
  ),
}

/** Dar mobil konteyner: buton dokunmatik hedefe büyür, uzun transkript satırı taşmadan sarar. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ width: '100%', padding: 16 }}>
      <GlassVoiceBar
        state="listening"
        onStart={fn()}
        onStop={fn()}
        transcript="Çeşme Alaçatı'da deniz manzaralı bahçeli müstakil yazlık arıyorum"
      />
    </div>
  ),
}

/** Uzun transkript ve uzun ipucu metni — kırpma yerine sarma, taşma yok. */
export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <div style={{ width: 320 }}>
      <GlassVoiceBar
        state="listening"
        onStart={fn()}
        onStop={fn()}
        transcript="İzmir Urla Zeytineli mahallesinde, denize yürüme mesafesinde, imarlı, elektrik ve suyu bağlı, tapulu, kredi kullanmaya uygun, güneybatı cepheli, deniz manzaralı bir arsa arıyorum, bütçem 3 ile 4 milyon TL arasında"
      />
    </div>
  ),
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: {
    state: 'listening',
    transcript: 'İzmir Urla imarlı arsa arıyorum',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Mikrofon butonunun accessible name\'i her state\'te değişir ve WCAG 2.5.3 "Label in Name" ' +
          'gereği görünür buton metnini alt string olarak içerir: `idle` → "Sesle ara, sesli aramayı ' +
          'başlat", `listening` → "Dinliyor…, sesli aramayı durdur", `processing` → "Çözümleniyor…, ' +
          'sesli arama işleniyor" (buton bu durumda `disabled`). Buton ayrıca `aria-pressed` ile kalıcı açık/kapalı durumu ' +
          'taşır (`listening` iken `true`). Transkript/ipucu satırı `aria-live="polite"` ile daima ' +
          'DOM\'da mount kalır (boşken görsel olarak katlanır) — sonradan mount edilen bir bloğa değil, ' +
          'içeriği değişen var olan bir live-region\'a bakılır. Nabız halkası animasyonu yalnız ' +
          'transform/opacity kullanır ve `prefers-reduced-motion: reduce` altında statik hale gelir.',
      },
    },
  },
}
