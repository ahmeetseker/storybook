import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassAiFlagBanner } from './GlassAiFlagBanner'

const meta = {
  title: 'Components/GlassAiFlagBanner',
  component: GlassAiFlagBanner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'İlan detay sayfasında AI moderasyon sonucunu duyuran tam genişlik yatay bant. İçerik AI çıktısı olduğu için "✦ AI" rozeti koşulsuz görünür; `severity="danger"` dışında etkileşimsiz ve statiktir (yalnız `danger` `role="alert"` alır). AI çıktısı hiçbir otomatik eylem tetiklemez — yalnız `onDetails`/`onFeedback`/`onDismiss` ile kullanıcı onaylı aksiyonlar sunar.',
      },
    },
  },
  argTypes: {
    severity: { control: 'select', options: ['info', 'warning', 'danger'] },
    confidence: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  args: {
    onDetails: fn(),
    onDismiss: fn(),
  },
} satisfies Meta<typeof GlassAiFlagBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    severity: 'warning',
    description: 'İlan görselleri ve fiyat bilgisi otomatik incelemeden geçirildi; küçük tutarsızlıklar tespit edildi.',
    reasons: [
      'İlan fiyatı (4.250.000 TL), bölge ortalamasının %38 altında',
      'Kapak görselinde filigran/başka ilana ait meta veri tespit edildi',
    ],
    confidence: 78,
  },
}

export const Playground: Story = {
  args: {
    severity: 'warning',
    title: 'Bu ilan yapay zekâ tarafından incelemeye alındı',
    description: 'Kadıköy Fenerbahçe\'de "Deniz manzaralı 3+1 daire" ilanı otomatik moderasyondan geçirildi.',
    reasons: ['Satıcı hesabı 2 gün önce açıldı', 'Aynı görsel setiyle 3 farklı ilan yayında'],
    confidence: 64,
    onFeedback: fn(),
  },
}

/** `severity` ekseni: `info` statik (rol yok), `warning` statik (rol yok), yalnız `danger` `role="alert"` alır. */
export const Severities: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
      <GlassAiFlagBanner
        severity="info"
        title="İlan yapay zekâ tarafından tarandı"
        description="Otomatik tarama tamamlandı, herhangi bir tutarsızlık bulunmadı."
        confidence={91}
      />
      <GlassAiFlagBanner
        severity="warning"
        title="Bu ilan yapay zekâ tarafından incelemeye alındı"
        description="İlan fiyatı bölge ortalamasının belirgin şekilde altında."
        reasons={['İlan fiyatı (2.100.000 TL), bölge ortalamasının %45 altında']}
        confidence={72}
      />
      <GlassAiFlagBanner
        severity="danger"
        title="Bu ilan şüpheli bulundu ve incelemeye alındı"
        description="Birden fazla yüksek riskli sinyal aynı anda tespit edildi."
        reasons={[
          'Aynı fotoğraf setiyle 5 farklı ilan tespit edildi',
          'Satıcı ödeme bilgisi, ilan bölgesiyle eşleşmiyor',
          'Tapu belgesi yüklenmiş görselin meta verisi düzenlenmiş',
        ]}
        confidence={95}
      />
    </div>
  ),
}

/** `reasons` yokken yalnız başlık + açıklama; `description` yokken yalnız başlık + gerekçe listesi. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
      <GlassAiFlagBanner severity="info" description="Yalnız açıklama var, gerekçe listesi yok." />
      <GlassAiFlagBanner
        severity="warning"
        reasons={['Yalnız gerekçe listesi var, açıklama yok', 'İkinci madde']}
      />
      <GlassAiFlagBanner severity="danger" />
    </div>
  ),
}

/** Etkileşim durumları: `onDetails`/`onFeedback`/`onDismiss` birlikte; geri bildirim tıklanınca `aria-pressed` güncellenir. */
export const States: Story = {
  args: {
    severity: 'warning',
    title: 'Bu ilan yapay zekâ tarafından incelemeye alındı',
    description: 'Satıcı geçmişi ve ilan içeriği çapraz kontrol edildi.',
    reasons: ['Satıcı, 30 gün içinde 12 farklı ilçede ilan yayınladı'],
    confidence: 68,
    onFeedback: fn(),
  },
}

/** Yükleme: gerçek içerik yerine flat placeholder, "✦ AI" rozeti kaybolmaz. */
export const Yukleniyor: Story = {
  args: {
    severity: 'warning',
    loading: true,
  },
}

export const UzunIcerik: Story = {
  args: {
    severity: 'danger',
    title: 'Gayrimenkul Değerleme ve Dolandırıcılık Önleme Yapay Zekâsı bu ilanı yüksek riskli olarak sınıflandırdı',
    description:
      'İlan; fiyatlandırma tutarlılığı, görsel bütünlük, satıcı hesap geçmişi ve tapu belge doğrulaması olmak üzere dört ayrı model tarafından değerlendirildi ve birden fazla modelde eşik üstü risk sinyali tespit edildi.',
    reasons: [
      'İstanbul Beşiktaş Levazım Mahallesi\'ndeki benzer nitelikli konut ilanlarının bölgesel ortalama metrekare fiyatına kıyasla bu ilanın fiyatı %52 daha düşük',
      'Yüklenen tapu senedi görselinin dijital imza/meta verisi, PDF düzenleme yazılımıyla sonradan değiştirilmiş görünüyor',
      'Satıcı profiliyle ilişkili telefon numarası, son 90 günde 8 farklı şehirde "acil satılık" etiketli ilanlarda kullanılmış',
    ],
    confidence: 97,
    onFeedback: fn(),
  },
}

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    severity: 'warning',
    description: 'Dar ekranda kapatma butonu sağ üste yaslanır, "Ayrıntılar" ve geri bildirim aksiyonları alt satıra sarar.',
    reasons: ['İlan fiyatı bölge ortalamasının %30 altında'],
    confidence: 55,
    onFeedback: fn(),
  },
}

/** Odak sırası: ikon dekoratif değil (`role="img"`), yalnız `danger` `role="alert"` alır; `info`/`warning` statiktir (rol yok). */
export const Erisilebilirlik: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Durum ikonu `role="img"` + sabit `aria-label` ("Bilgi"/"Uyarı"/"Tehlike") taşır — anlam yalnız renkle değil ikon + görünür başlık/açıklama metniyle birlikte iletilir. "✦ AI" rozeti `aria-label="Yapay zekâ üretimi"` ile koşulsuz görünür. `severity="danger"` ekran okuyucunun mevcut konuşmayı kesmesi gereken bir sorunu işaretlediği için `role="alert"` alır; `info`/`warning` akışı kesmemesi gereken statik içerik olduğundan hiçbir rol taşımaz. Kapatma butonu `aria-label="Kapat"` ile odaklanabilir gerçek bir `<button>`; dokunmatik pointer\'da minimum 44×44px hedefe büyür.',
      },
    },
  },
  args: {
    severity: 'danger',
    description: 'Bu ilan birden fazla yüksek riskli sinyal nedeniyle işaretlendi.',
    reasons: ['Satıcı kimlik doğrulaması başarısız oldu'],
    confidence: 88,
    onFeedback: fn(),
  },
}
