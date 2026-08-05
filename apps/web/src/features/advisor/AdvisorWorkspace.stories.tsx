import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import {
  expect,
  userEvent,
  waitFor,
  within,
} from 'storybook/test'
import {
  createFixtureAdvisorSearchAdapter,
  type AdvisorSearchAdapter,
} from './data/advisor-search-adapter'
import { AdvisorWorkspace } from './AdvisorWorkspace'

const instantAdapter = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
const pendingAdapter = createFixtureAdvisorSearchAdapter({
  delayMs: 60_000,
})
const failingAdapter = createFixtureAdvisorSearchAdapter({
  delayMs: 0,
  fail: true,
})

const emptyAdapter: AdvisorSearchAdapter = {
  async search(proposal) {
    return {
      proposal,
      matches: [],
      generatedAt: '2026-07-26T12:00:00.000Z',
    }
  },
}

const longContentAdapter: AdvisorSearchAdapter = {
  async search(proposal, options) {
    const result = await instantAdapter.search(proposal, options)
    return {
      ...result,
      matches: result.matches.map((match, index) =>
        index === 0
          ? {
              ...match,
              listing: {
                ...match.listing,
                title:
                  'Urla’da denize yakın, müstakil tapulu ve uzun açıklamalı konut imarlı köşe parsel',
              },
            }
          : match,
      ),
    }
  },
}

const meta = {
  title: 'Sayfalar/Public/AI Danışman',
  component: AdvisorWorkspace,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Doğal dil sorgusunu düzenlenebilir arama profiline ve açıklanabilir ilan karar akışına dönüştüren AI danışman çalışma alanı.',
      },
    },
  },
  argTypes: {
    searchAdapter: { control: false },
    onRouteStateChange: { control: false },
    onOpenComparison: { control: false },
  },
} satisfies Meta<typeof AdvisorWorkspace>

export default meta
type Story = StoryObj<typeof meta>

const fullBleedDecorator: Decorator = (Story) => (
  <div
    style={{
      inlineSize:
        'calc(100% + var(--lg-space-7) + var(--lg-space-7))',
      minBlockSize: '100vh',
      marginBlock:
        'calc(0rem - var(--lg-space-7) - var(--lg-space-7))',
      marginInline: 'calc(0rem - var(--lg-space-7))',
    }}
  >
    <Story />
  </div>
)

/** Tek composer, üç flat örnek ve henüz açılmamış karar yüzeyleri. */
export const Initial: Story = {
  args: { searchAdapter: instantAdapter },
}

/** Sonuç geometrisini koruyan skeleton; istek story unmount olduğunda abort edilir. */
export const Analyzing: Story = {
  args: {
    searchAdapter: pendingAdapter,
    initialQuery: 'Urla’da arsa',
  },
}

/** Açıklanabilir en iyi eşleşme, alternatifler, profil ve karar eylemleri. */
export const Results: Story = {
  args: {
    searchAdapter: instantAdapter,
    initialQuery: 'Urla’da 5 milyon TL altında imarlı arsa',
  },
}

/** İki ilan URL başlangıç state’i üzerinden karşılaştırmaya seçilidir. */
export const CompareSelected: Story = {
  args: {
    searchAdapter: instantAdapter,
    initialQuery: 'Urla’da arsa',
    initialCompareIds: ['listing-1-1', 'listing-1-2'],
  },
}

/** Sabit boş adapter, uygulanmış sorguyu koruyarak sıfır sonucu üretir. */
export const Empty: Story = {
  args: {
    searchAdapter: emptyAdapter,
    initialQuery: 'Urla’da 1 milyon TL altında arsa',
  },
}

/** Sabit hata adapter’ı inline yeniden deneme yüzeyini üretir. */
export const ErrorState: Story = {
  args: {
    searchAdapter: failingAdapter,
    initialQuery: 'İzmir’de satılık emlak',
  },
}

/** Eksik konum/tür sinyali tahmin yerine netleştirme sorusu üretir. */
export const LowConfidence: Story = {
  args: {
    searchAdapter: instantAdapter,
    initialQuery: 'Denize yakın bir yer',
  },
}

/** Uzun Türkçe sorgu ve ilan başlığı sarma davranışını görünür kılar. */
export const LongTurkishContent: Story = {
  args: {
    searchAdapter: longContentAdapter,
    initialQuery: 'İzmir’de satılık emlak için uzun içerik örneği',
  },
}

/** Dar container: query → profile → featured → alternatives → actions. */
export const NarrowContainer: Story = {
  args: {
    searchAdapter: instantAdapter,
    initialQuery: 'Urla’da arsa',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile390' },
  },
  decorators: [fullBleedDecorator],
}

/** Orta container: kompakt profil sonuçların önünde, eylemler sonuçların sonunda. */
export const MediumContainer: Story = {
  args: {
    searchAdapter: instantAdapter,
    initialQuery: 'Urla’da arsa',
  },
  parameters: {
    viewport: { defaultViewport: 'tablet768' },
  },
  decorators: [fullBleedDecorator],
}

/** Portal drawer, Escape focus dönüşü ve kalıcı compare ARIA state’i. */
export const Accessibility: Story = {
  name: 'Klavye ve ARIA sözleşmesi',
  args: {
    searchAdapter: instantAdapter,
    initialQuery: 'Urla’da arsa',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const openListing = (
      await canvas.findAllByRole('button', {
        name: 'İlanı incele',
      })
    )[0]
    openListing.focus()
    await userEvent.keyboard('{Enter}')

    const body = within(document.body)
    await body.findByRole('dialog', { name: /ilan detayı/i })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => {
      expect(
        body.queryByRole('dialog', { name: /ilan detayı/i }),
      ).not.toBeInTheDocument()
      expect(openListing).toHaveFocus()
    })

    const compare = (
      await canvas.findAllByRole('button', {
        name: 'Karşılaştırmaya ekle',
      })
    )[0]
    compare.focus()
    await userEvent.keyboard('{Enter}')
    await expect(compare).toHaveAttribute('aria-pressed', 'true')
  },
}
