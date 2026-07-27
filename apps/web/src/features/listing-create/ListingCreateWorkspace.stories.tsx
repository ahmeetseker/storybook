import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
import { ListingCreateWorkspace } from './ListingCreateWorkspace'
import {
  createEmptyDraft,
  type ListingDraft,
  type ListingMediaItem,
  type ListingStepId,
  type VerificationStatus,
} from './listing-create-domain'

function photo(id: string, isCover = false): ListingMediaItem {
  const sources: Record<string, string> = {
    cephe:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=960&q=82',
    parsel:
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=960&q=82',
    cevre:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=960&q=82',
  }
  return {
    id,
    name: `${id}.jpg`,
    src: sources[id] ?? sources.cephe,
    status: 'ready',
    isCover,
    caption: '',
    qualityHints: [],
  }
}

function enterpriseDraft(
  activeStep: ListingStepId,
  verificationStatus: VerificationStatus = 'idle',
): ListingDraft {
  const draft = createEmptyDraft()
  return {
    ...draft,
    entryMode: 'manual',
    property: {
      ...draft.property,
      transaction: 'sale',
      family: 'land',
      subtype: 'zoned-land',
      publisherRole: 'owner',
      area: '512',
      zoning: 'residential',
      deedType: 'detached',
    },
    location: {
      ...draft.location,
      city: 'izmir',
      district: 'urla',
      neighborhood: 'iskele',
      address: 'İskele Mahallesi, Urla',
      propertyNumber: '980124771',
      island: '118',
      parcel: '24',
    },
    media: [photo('cephe', true), photo('parsel'), photo('cevre')],
    content: {
      price: '4250000',
      title: 'Urla’da imarlı, yola cepheli köşe parsel',
      description:
        'İskele Mahallesi’nde konut imarlı, müstakil tapulu ve kadastro yoluna cepheli parsel. Çevre ve ulaşım bilgileri güncel kaynaklardan kontrol edilmiştir.',
      highlights: ['Yola cepheli', 'Müstakil tapu'],
      riskAccepted: true,
      legalConsent: true,
    },
    verification: {
      status: verificationStatus,
      verifiedRole: verificationStatus === 'verified' ? 'owner' : null,
      verifiedPropertyNumber:
        verificationStatus === 'verified' ? '980124771' : null,
      propertyReference:
        verificationStatus === 'verified' ? 'EIDS-DEMO-980124771' : '',
      errorCode:
        verificationStatus === 'unauthorized'
          ? 'NO_AUTHORITY'
          : verificationStatus === 'unavailable'
            ? 'SERVICE_UNAVAILABLE'
            : null,
    },
    meta: {
      ...draft.meta,
      activeStep,
      savedAt: '21:42',
    },
  }
}

const meta = {
  title: 'Sayfalar/İlan Ver/ListingCreateWorkspace',
  component: ListingCreateWorkspace,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    adapterDelayMs: {
      control: { type: 'number', min: 0, max: 1500, step: 50 },
      description: 'Demo adaptörlerinin gecikmesi.',
    },
    adapterScenario: {
      control: 'object',
      description: 'Kaydetme, AI ve EİDS demo durumlarını belirler.',
    },
    initialDraft: {
      control: false,
      description: 'Story ve testler için kontrollü başlangıç taslağı.',
    },
  },
} satisfies Meta<typeof ListingCreateWorkspace>

export default meta
type Story = StoryObj<typeof meta>

export const GenelBakis: Story = {}

export const Playground: Story = {
  args: {
    adapterDelayMs: 350,
    adapterScenario: {
      save: 'success',
      ai: 'success',
      eids: 'verified',
    },
  },
}

export const ManuelMulkAdimi: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: {
      ...createEmptyDraft(),
      entryMode: 'manual',
    },
  },
}

export const FotoğrafStudyosu: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: enterpriseDraft('media'),
  },
}

export const YetkiBulunamadi: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: enterpriseDraft('verification', 'unauthorized'),
    adapterScenario: { eids: 'unauthorized' },
  },
}

export const ServisKullanilamiyor: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: enterpriseDraft('verification', 'unavailable'),
    adapterScenario: { eids: 'unavailable' },
  },
}

export const KayitHatasi: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: enterpriseDraft('property'),
    adapterScenario: { save: 'error' },
  },
}

export const AiKullanilamiyor: Story = {
  args: {
    adapterDelayMs: 0,
    adapterScenario: { ai: 'unavailable' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'AI ile hızlı başla' }),
    )
    await userEvent.type(
      canvas.getByLabelText('Mülkünüzü kısaca anlatın'),
      'Urla’da 512 metrekare satılık arsa',
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Öneriyi hazırla' }))
    await canvas.findByText(
      'AI önerisi hazırlanamadı. Bilgileri elle girebilirsiniz.',
    )
  },
}

export const Dogrulaniyor: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: enterpriseDraft('verification', 'checking'),
  },
}

export const MedyaKaliteDurumlari: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: {
      ...enterpriseDraft('media'),
      media: [
        photo('cephe', true),
        {
          ...photo('parsel'),
          status: 'low-quality',
          qualityHints: ['Daha yüksek çözünürlüklü özgün görsel kullanın'],
        },
        {
          ...photo('cevre'),
          status: 'duplicate',
          qualityHints: ['Bu dosya daha önce eklenmiş görünüyor'],
        },
      ],
    },
  },
}

export const AlanHatalari: Story = {
  args: {
    adapterDelayMs: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Bilgileri kendim gireceğim' }),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Devam et' }))
  },
}

export const Yayinlandi: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: {
      ...enterpriseDraft('verification', 'verified'),
      meta: {
        ...enterpriseDraft('verification', 'verified').meta,
        published: true,
      },
    },
  },
}

export const UzunIcerik: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: {
      ...enterpriseDraft('content'),
      content: {
        ...enterpriseDraft('content').content,
        title:
          'Urla İskele’de denize yakın, konut imarlı, müstakil tapulu parsel',
        description:
          'Uzun içerik ve yerelleştirme denetimi için mülkün çevresel özellikleri, ulaşım bağlantıları, teknik kayıtları ve alıcının karar verirken ihtiyaç duyacağı doğrulanabilir ayrıntılar kapsamlı fakat okunabilir bir anlatımla sunulur.',
      },
    },
  },
}

export const Mobil: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: enterpriseDraft('location'),
  },
  globals: {
    viewport: { value: 'mobile390', isRotated: false },
  },
}

export const GrafitTema: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: enterpriseDraft('verification', 'verified'),
  },
  globals: {
    backgroundKey: 'dark',
  },
}

export const Erisilebilirlik: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: enterpriseDraft('property'),
  },
  parameters: {
    a11y: {
      element: 'main',
    },
  },
}

export const HareketAzaltilmis: Story = {
  args: {
    adapterDelayMs: 0,
    initialDraft: enterpriseDraft('media'),
  },
  parameters: {
    emulateMedia: {
      reducedMotion: 'reduce',
      reducedTransparency: 'reduce',
    },
  },
}
