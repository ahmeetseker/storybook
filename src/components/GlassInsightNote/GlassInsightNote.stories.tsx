import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassInsightNote } from './GlassInsightNote'
import { placeholderImage } from '../../demo/placeholderImage'

const avatar = (initials: string, from: string, to: string) => placeholderImage(initials, from, to, 160, 160)

const meta = {
  title: 'Components/GlassInsightNote',
  component: GlassInsightNote,
  tags: ['autodocs'],
  args: {
    author: 'Elif Kaya',
    authorRole: 'Bölge Danışmanı',
    date: '14 Temmuz 2026',
    text:
      'Arsayı bizzat gezdim; güney cephesi düzlük ve yola sıfır, elektrik direği parsel sınırının hemen ' +
      'dışında kalıyor. İmar durumunu belediyeden teyit ettim — konut yapılaşmasına uygun, ayrık nizam.',
    verified: true,
  },
  argTypes: {
    variant: { control: 'select', options: ['quote', 'inline'] },
    avatarSrc: { control: false },
  },
} satisfies Meta<typeof GlassInsightNote>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = { args: { avatarSrc: avatar('EK', '#2e5f50', '#12312a') } }

/** Eksen: `variant`. `quote` sol accent çizgili bağımsız kart, `inline` kendi zemini olmayan gömülü kompakt satır. */
export const Variants: Story = {
  name: 'Varyantlar',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480 }}>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--lg-label-secondary)',
          }}
        >
          variant=&quot;quote&quot;
        </p>
        <GlassInsightNote {...args} variant="quote" avatarSrc={avatar('EK', '#2e5f50', '#12312a')} />
      </div>
      <div style={{ padding: 16, border: '1px solid var(--lg-hairline)', borderRadius: 'var(--lg-radius-card)' }}>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--lg-label-secondary)',
          }}
        >
          variant=&quot;inline&quot; (bir liste içine gömülü)
        </p>
        <GlassInsightNote {...args} variant="inline" avatarSrc={avatar('EK', '#2e5f50', '#12312a')} />
      </div>
    </div>
  ),
}

/**
 * `verified` durumu: doğrulanmış (Yerinde inceledi rozeti) / doğrulanmamış (rozetsiz) ·
 * `authorRole` verilmediğinde başlık satırında yalnız ad kalır.
 */
export const Durumlar: Story = {
  name: 'Durumlar',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <GlassInsightNote
        author="Mert Aydın"
        authorRole="Kıdemli Danışman"
        avatarSrc={avatar('MA', '#3a6f5f', '#1f4a3a')}
        date="3 Nisan 2026"
        text="Parselin yol cephesi asfalt, tapuda herhangi bir şerh yok. Görüşme öncesi imar durumunu kontrol ettim."
        verified
      />
      <GlassInsightNote
        author="Sena Yıldız"
        date="28 Şubat 2026"
        text="Arazi güzel ancak elektrik hattı henüz bağlanmamış; bağlantı için belediyeyle görüşülmesi gerekiyor."
      />
      <GlassInsightNote
        author="Kerem Şahin"
        authorRole="Bölge Danışmanı"
        date="15 Ocak 2026"
        text="Ölçümler ilanla birebir uyumlu, sınır taşları belirgin durumda."
        verified
      />
    </div>
  ),
}

/** Uzun ad, uzun rol ve çok satırlı metin: `quote` tamamını sarar; `inline` metni 2 satırda `-webkit-line-clamp` ile kırpar. */
export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 460 }}>
      <GlassInsightNote
        author="Muhammed Emin Karahasanoğlu-Değirmencioğlu"
        authorRole="Bölgesel Gayrimenkul Değerleme Uzmanı"
        avatarSrc={avatar('MK', '#8a6f3a', '#5f4a1f')}
        date="6 Haziran 2026"
        text={
          'Parseli sabah erken saatte, güneşin doğuş açısını da görebilmek için bizzat gezdim. Toprak yapısı ' +
          'killi-tınlı karışım, tarımsal kullanıma da uygun görünüyor. Komşu parsellerle sınır anlaşmazlığı ' +
          'bulunmuyor, sınır taşları belediye ölçümüyle birebir örtüşüyor. Yola cephe genişliği ilanda belirtilen ' +
          'ölçüyle aynı; içme suyu hattı parsel sınırına kadar getirilmiş, yalnızca bağlantı bedeli kalıyor.'
        }
        verified
      />
      <GlassInsightNote
        author="Muhammed Emin Karahasanoğlu-Değirmencioğlu"
        authorRole="Bölgesel Gayrimenkul Değerleme Uzmanı"
        date="6 Haziran 2026"
        text={
          'Parseli sabah erken saatte, güneşin doğuş açısını da görebilmek için bizzat gezdim. Toprak yapısı ' +
          'killi-tınlı karışım, tarımsal kullanıma da uygun görünüyor. Komşu parsellerle sınır anlaşmazlığı yok.'
        }
        variant="inline"
        verified
      />
    </div>
  ),
}

/** Dar container: `inline` başlıkta ad kısalır (ellipsis), metin dokunmatik genişlikte 2 satırda kalır. */
export const Responsive: Story = {
  name: 'Duyarlı Genişlik',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ maxWidth: 300, padding: 12, border: '1px solid var(--lg-hairline)', borderRadius: 'var(--lg-radius-card)' }}>
      <GlassInsightNote
        author="Zeynep Arslan"
        authorRole="Bölge Danışmanı"
        avatarSrc={avatar('ZA', '#3a5f8a', '#1f3a5f')}
        date="20 Şubat 2026"
        text="Tarla yolu biraz bozuk ama satıcı ulaşım güzergahını önceden belirtmişti; kışın erişim zor olabilir."
        variant="inline"
        verified
      />
    </div>
  ),
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { avatarSrc: avatar('EK', '#2e5f50', '#12312a') },
  parameters: {
    docs: {
      description: {
        story:
          'Avatar sarmalayıcısı `aria-hidden` — `GlassAvatar`\'ın baş harf fallback\'i `author` ile aynı ' +
          'erişilebilir adı taşıdığından, başlıktaki görünür isimle birlikte çift duyuru üretmez (bkz. ' +
          'GlassReviewCard dersi). "Yerinde inceledi" rozeti görünür metinle taşınır (yalnız renkle/ikonla ' +
          'değil) — zemin `--lg-success` karışımı, ikon `--lg-success`, ancak METİN küçük punto/soluk zemin ' +
          'kontrastı için `--lg-label` (birincil etiket rengi) kullanır. Component tamamen statik/prop güdümlü ' +
          'içeriktir; kendiliğinden özel bir ARIA rolü üstlenmez, klavye etkileşimi/odak yönetimi taşımaz. ' +
          '`authorRole` (ör. "Bölge Danışmanı") yalnız görünür bir etikettir — native `role` HTML özniteliğiyle ' +
          'karıştırılmaz; çağıran `...rest` üzerinden kök `<article>`e kendi `role` değerini (ör. `role="note"`) ' +
          'serbestçe geçirebilir.',
      },
    },
  },
}
