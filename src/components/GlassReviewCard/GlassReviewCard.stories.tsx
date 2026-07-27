import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassReviewCard } from './GlassReviewCard'
import { placeholderImage } from '../../demo/placeholderImage'

const avatar = (initials: string, from: string, to: string) => placeholderImage(initials, from, to, 160, 160)

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassReviewCard',
  component: GlassReviewCard,
  tags: ['autodocs'],
  args: {
    author: 'Elif Kaya',
    rating: 4.5,
    date: '12 Mayıs 2026',
    text: 'Satıcı ilan bilgilerine tam uyumlu bir arsa sundu; tapu devri de aynı hafta içinde sorunsuz tamamlandı. Kesinlikle tavsiye ederim.',
    verified: true,
    helpfulCount: 18,
    onHelpful: fn(),
  },
  argTypes: {
    rating: { control: { type: 'range', min: 0, max: 5, step: 0.5 } },
    variant: { control: 'select', options: ['full', 'compact'] },
    avatarSrc: { control: false },
  },
} satisfies Meta<typeof GlassReviewCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = { args: { avatarSrc: avatar('EK', '#2e5f50', '#12312a') } }

/** Eksen: `variant`. `full` bağımsız yorum bölümü, `compact` liste/panel içi özet satırı. */
export const Variants: Story = {
  name: 'Varyantlar',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--lg-label-secondary)' }}>
          variant=&quot;full&quot;
        </p>
        <GlassReviewCard {...args} variant="full" avatarSrc={avatar('EK', '#2e5f50', '#12312a')} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--lg-label-secondary)' }}>
          variant=&quot;compact&quot;
        </p>
        <GlassReviewCard {...args} variant="compact" avatarSrc={avatar('EK', '#2e5f50', '#12312a')} />
      </div>
    </div>
  ),
}

/**
 * State matrisi: doğrulanmış + faydalı sayaçlı (etkileşimli) · doğrulanmamış +
 * sayaçsız (yalnız `onHelpful`) · faydalı bilgisi hiç yok · yalnız `helpfulCount`
 * verilip `onHelpful` verilmediğinde aksiyon tıklanamaz düz metne düşer (sahte
 * buton üretilmez — bkz. rules.md §4/§6). Odak halkasını klavyeyle doğrulayın.
 */
export const States: Story = {
  name: 'Durumlar',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <GlassReviewCard
        author="Mert Aydın"
        avatarSrc={avatar('MA', '#3a6f5f', '#1f4a3a')}
        rating={5}
        date="3 Nisan 2026"
        text="Görüşme öncesi tüm imar durumu belgelerini paylaştı; hiç sürpriz yaşamadık."
        verified
        helpfulCount={41}
        onHelpful={fn()}
      />
      <GlassReviewCard
        author="Sena Yıldız"
        rating={3}
        date="28 Şubat 2026"
        text="Arsa güzeldi ama randevu saatine biraz geç kalındı."
        onHelpful={fn()}
      />
      <GlassReviewCard
        author="Kerem Şahin"
        rating={4}
        date="15 Ocak 2026"
        text="Fiyat pazarlığında esnek davrandı, süreç genel olarak iyi geçti."
      />
      <GlassReviewCard
        author="Aylin Demir"
        rating={2}
        date="9 Aralık 2025"
        text="İlan fotoğrafları ile araziyi görünce arada fark vardı."
        helpfulCount={0}
      />
    </div>
  ),
}

/** Uzun ad, çok satırlı metin: `full` sarar; `compact` 2 satırda `-webkit-line-clamp` ile kırpar. */
export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 460 }}>
      <GlassReviewCard
        author="Muhammed Emin Karahasanoğlu-Değirmencioğlu"
        avatarSrc={avatar('MK', '#8a6f3a', '#5f4a1f')}
        rating={4.5}
        date="6 Haziran 2026"
        text={
          'Arsanın tapu kaydında herhangi bir ipotek ya da haciz bulunmadığını önceden kontrol ettim, ' +
          'ilan sahibi de bu konuda tüm belgeleri eksiksiz şekilde paylaştı. İmar durumu görüşmesi için ' +
          'belediyeye birlikte gittik, süreç boyunca hiçbir aşamada iletişimsizlik yaşamadık. Tapu devri ' +
          'gününde de her şey planlandığı gibi ilerledi, kesinlikle güvenilir bir satıcıydı.'
        }
        verified
        helpfulCount={7}
        onHelpful={fn()}
      />
      <GlassReviewCard
        author="Muhammed Emin Karahasanoğlu-Değirmencioğlu"
        rating={4.5}
        date="6 Haziran 2026"
        text={
          'Arsanın tapu kaydında herhangi bir ipotek ya da haciz bulunmadığını önceden kontrol ettim, ' +
          'ilan sahibi de bu konuda tüm belgeleri eksiksiz şekilde paylaştı.'
        }
        variant="compact"
        verified
        helpfulCount={7}
        onHelpful={fn()}
      />
    </div>
  ),
}

/** Dar container: `compact` tek satır özeti daralır (isim kısalır), aksiyon dokunmatikte 44px'e büyür. */
export const Responsive: Story = {
  name: 'Duyarlı Genişlik',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ maxWidth: 300 }}>
      <GlassReviewCard
        author="Zeynep Arslan"
        avatarSrc={avatar('ZA', '#3a5f8a', '#1f3a5f')}
        rating={4}
        date="20 Şubat 2026"
        text="Tarla yolu biraz bozuktu ama satıcı ulaşımı önceden söylemişti."
        variant="compact"
        verified
        helpfulCount={3}
        onHelpful={fn()}
      />
    </div>
  ),
}

function KontrolluFaydaliDemo() {
  const [count, setCount] = useState(5)
  return (
    <div style={{ maxWidth: 460 }}>
      <GlassReviewCard
        author="Burak Kılıç"
        rating={5}
        date="30 Mart 2026"
        text="Satıcı ile pazarlık kısa sürede olumlu sonuçlandı, herkese tavsiye ederim."
        helpfulCount={count}
        onHelpful={() => setCount((c) => c + 1)}
      />
    </div>
  )
}

/** Kontrollü kullanım örneği: `helpfulCount` component içinde tutulmaz — her tıklamada çağıran artırır. */
export const KontrolluFaydali: Story = {
  name: 'Kontrollü "Faydalı" Sayacı',
  render: () => <KontrolluFaydaliDemo />,
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { avatarSrc: avatar('EK', '#2e5f50', '#12312a') },
  parameters: {
    docs: {
      description: {
        story:
          'Yıldız puanı `role="img"` + tek bir `aria-label` ile duyurulur (ör. "5 üzerinden 4,5 yıldız") — ' +
          'tek tek yıldız SVG\'leri `aria-hidden`, ayrı bir tablist/radiogroup DEĞİLDİR (statik gösterge, ' +
          'GlassRating\'in girdi bileşeninden farklı — bkz. rules.md §2). "Faydalı" yalnız `onHelpful` verildiğinde ' +
          'gerçek bir `<button>` olur ve `--lg-control-md` ile dokunmatikte 44px hedefe ulaşır; `onHelpful` yokken ' +
          'aynı bilgi tıklanamaz düz metne düşer (aksiyonsuz gerçek buton üretilmez). "Doğrulanmış görüşme" rozeti ' +
          'metinle taşınır (yalnız renkle değil). Avatar görseli `alt` olarak yazar adını taşır.',
      },
    },
  },
}
