import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassAccordion, type GlassAccordionItem, type GlassAccordionProps } from './GlassAccordion'

const sikSorulanSorular: GlassAccordionItem[] = [
  {
    id: 'eids-nedir',
    title: 'EİDS doğrulaması nedir, nasıl çalışır?',
    content: (
      <p>
        EİDS (Elektronik İlan Doğrulama Sistemi), ilan sahibinin tapu ve imar
        bilgilerini TAKBİS üzerinden doğrulamasıdır. Doğrulanan ilanlar arama
        sonuçlarında yeşil rozetle işaretlenir; doğrulama zorunlu değildir
        ancak alıcı güvenini artırır.
      </p>
    ),
  },
  {
    id: 'tapu-imar',
    title: 'Tapu ve imar durumu bilgisi ilanda nasıl gösterilir?',
    content: (
      <p>
        İlan sahibi tapu türünü (müstakil, hisseli, kat irtifaklı) ve imar
        durumunu (tarla, bağ-bahçe, konut imarlı, ticari imarlı) ilan
        formunda seçer. Bu bilgiler ilan detayında{' '}
        <strong>Tapu &amp; İmar Bilgileri</strong> bölümünde ayrı bir tabloda
        listelenir.
      </p>
    ),
  },
  {
    id: 'ilan-yayinlama',
    title: 'İlanım ne kadar sürede yayına alınır?',
    content: (
      <p>
        Standart ilanlar otomatik moderasyondan geçer ve genellikle 15 dakika
        içinde yayınlanır. EİDS doğrulaması talep edilen ilanlarda TAKBİS
        sorgusu nedeniyle bu süre 2 iş gününe kadar uzayabilir.
      </p>
    ),
  },
  {
    id: 'odeme-guvenligi',
    title: 'Ödeme güvenliği nasıl sağlanıyor?',
    content: (
      <>
        <p>Doping ve üyelik ödemeleri 3D Secure ile korunur:</p>
        <ul>
          <li>Kart bilgileri ArsaPazar sunucularında saklanmaz.</li>
          <li>Her işlem için tek kullanımlık doğrulama kodu istenir.</li>
          <li>İade talepleri 5 iş günü içinde aynı karta yapılır.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'iletisim',
    title: 'Satıcıyla nasıl iletişime geçebilirim?',
    content: (
      <p>
        İlan detayındaki <strong>Satıcıyı Ara</strong> veya{' '}
        <strong>Mesaj Gönder</strong> butonlarını kullanabilirsin. Telefon
        numarası yalnız uygulama içi arama üzerinden gizlenerek iletilir.
      </p>
    ),
  },
]

const meta = {
  title: 'Components/GlassAccordion',
  component: GlassAccordion,
  tags: ['autodocs'],
  args: { items: sikSorulanSorular, 'aria-label': 'Sık sorulan sorular', onOpenIdsChange: fn() },
  argTypes: {
    mode: { control: 'select', options: ['single', 'multiple'] },
    headingAs: { control: 'select', options: ['h3', 'h4', 'div'] },
    openIds: { control: false, description: 'Kontrollü açık panel id listesi' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Genel amaçlı aç/kapa liste — SSS, yardım merkezi. GlassFeatureGroup\'un ' +
          'künye accordion\'ından (variant="accordion") farklıdır: içerik tamamen ' +
          'serbest ReactNode, künye label:value satırlarına bağlı değildir.',
      },
    },
  },
} satisfies Meta<typeof GlassAccordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { defaultOpenIds: ['eids-nedir'] },
}

export const Playground: Story = {
  args: { defaultOpenIds: [] },
}

/** mode='multiple': birden çok panel bağımsız olarak aynı anda açık kalabilir. */
export const Multiple: Story = {
  args: { mode: 'multiple', defaultOpenIds: ['eids-nedir', 'odeme-guvenligi'] },
}

function ControlledDemo(args: Partial<GlassAccordionProps>) {
  const [openIds, setOpenIds] = useState<string[]>(['ilan-yayinlama'])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setOpenIds(sikSorulanSorular.map((i) => i.id))}>
          Tümünü aç
        </button>
        <button type="button" onClick={() => setOpenIds([])}>
          Tümünü kapat
        </button>
      </div>
      <GlassAccordion
        {...args}
        mode="multiple"
        openIds={openIds}
        onOpenIdsChange={setOpenIds}
        items={sikSorulanSorular}
      />
    </div>
  )
}

/**
 * Controlled kullanım: açık id listesi dışarıdan yönetilir — "Tümünü Aç" /
 * "Tümünü Kapat" gibi harici kontrollerle birlikte kullanılabilir.
 */
export const Controlled: Story = {
  render: (args) => <ControlledDemo {...args} />,
}

/** Uzun içerik: uzun TR başlık kelimeleri sarılır, uzun panel içeriği taşmadan akar. */
export const UzunIcerik: Story = {
  args: {
    defaultOpenIds: ['gayrimenkullestirilebilirlik'],
    items: [
      {
        id: 'gayrimenkullestirilebilirlik',
        title: 'Tarla vasıflı bir parselin konut imarlı gayrimenkulleştirilebilirlik süreci nasıl işler?',
        content: (
          <p>
            Tarla vasfındaki bir parselin konut imarına dönüştürülmesi; belediye
            imar planı tadilat talebi, plan tadilatının il/ilçe imar
            komisyonunda görüşülmesi, askı süresi boyunca itiraz edilmemesi ve
            son olarak tapu müdürlüğünde vasıf değişikliği tescili aşamalarından
            geçer. Bu süreç bölgeye göre 6 ay ile 3 yıl arasında sürebilir ve
            sonucu garanti edilemez — ArsaPazar bu süreci yürütmez, yalnız
            ilan sahibinin beyan ettiği mevcut imar durumunu gösterir.
          </p>
        ),
      },
      ...sikSorulanSorular,
    ],
  },
}

/** Dar konteyner + dokunmatik: tetikleyici min 44-48px hedefte, chevron kırpılmaz. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { defaultOpenIds: ['eids-nedir'] },
  render: (args) => (
    <div style={{ maxWidth: 340, margin: '0 auto' }}>
      <GlassAccordion {...args} />
    </div>
  ),
}

/**
 * Erişilebilirlik: her başlık gerçek `<button aria-expanded aria-controls>`,
 * heading seviyesi `headingAs` ile sayfa hiyerarşisine göre seçilir (default
 * `h3`). Panel `role` taşımaz — açık/kapalı bilgisi tetikleyicideki
 * `aria-expanded`'dan gelir; kapalı panel `inert` ile klavye/AT gezinmesinden
 * çıkarılır. Klavye: `Tab` başlıklar arasında doğal sırayla gezer, `Enter`/`Space`
 * açar-kapar, `↓`/`↑` bitişik başlığa, `Home`/`End` ilk/son başlığa taşır.
 */
export const Erisilebilirlik: Story = {
  args: { defaultOpenIds: ['eids-nedir'] },
  parameters: {
    docs: {
      description: {
        story:
          'Chevron ikonu `aria-hidden` — dönüş bilgisini AT `aria-expanded`\'dan alır. ' +
          '`prefers-reduced-motion: reduce` altında hem chevron dönüşü hem panel ' +
          'açılışı anında (transition kapalı) gerçekleşir.',
      },
    },
  },
}
