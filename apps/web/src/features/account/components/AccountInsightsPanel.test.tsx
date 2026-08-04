import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type {
  AccountInsights,
  AccountInsightSummary,
  AccountTrendPoint,
} from '../domain/account-types'

import { AccountInsightsPanel } from './AccountInsightsPanel'

function makeSeries(values: number[], prefix = 'G'): AccountTrendPoint[] {
  return values.map((value, index) => ({
    label: `${prefix}${index + 1}`,
    occurredAt: new Date(Date.UTC(2026, 6, index + 1)).toISOString(),
    value,
  }))
}

function makeInsights(
  summaryOverrides: Partial<AccountInsightSummary> = {},
  overrides: Partial<AccountInsights> = {},
): AccountInsights {
  return {
    periodLabel: 'Son 14 gün',
    listingViews: makeSeries([38, 44, 137]),
    messages: makeSeries([1, 3, 7], 'M'),
    favorites: makeSeries([2, 5, 11], 'F'),
    spendByMonth: [
      { label: 'Haz', occurredAt: '2026-06-01T00:00:00.000Z', value: 749 },
      { label: 'Tem', occurredAt: '2026-07-01T00:00:00.000Z', value: 1098 },
    ],
    summary: {
      totalViews: 1084,
      viewsChangePct: 32,
      totalMessages: 45,
      messagesChangePct: 18,
      contactRatePct: 4.2,
      ...summaryOverrides,
    },
    ...overrides,
  }
}

describe('AccountInsightsPanel', () => {
  it('renders the performance region with its period label', () => {
    const { container } = render(<AccountInsightsPanel insights={makeInsights()} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Performans' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Performans' })).toBeTruthy()
    expect(
      container.querySelector('[data-account-section="insights"]'),
    ).toBeTruthy()
    expect(container.querySelector('[data-part="insights-period"]')?.textContent).toBe(
      'Son 14 gün',
    )
  })

  it('shows the summary values with a direction that is readable without colour', () => {
    const { container } = render(<AccountInsightsPanel insights={makeInsights()} />)

    expect(screen.getByText('Toplam görüntülenme')).toBeTruthy()
    expect(screen.getByText('1.084')).toBeTruthy()
    expect(screen.getByText('45')).toBeTruthy()
    expect(screen.getByText('%4,2')).toBeTruthy()

    const viewsChange = container.querySelector('[data-part="summary-views-change"]')
    expect(viewsChange?.getAttribute('data-direction')).toBe('up')
    expect(viewsChange?.textContent).toContain('%32 artış')

    const messagesChange = container.querySelector(
      '[data-part="summary-messages-change"]',
    )
    expect(messagesChange?.textContent).toContain('%18 artış')
  })

  it('describes a negative change as a decrease in words', () => {
    const { container } = render(
      <AccountInsightsPanel
        insights={makeInsights({ viewsChangePct: -12, messagesChangePct: 0 })}
      />,
    )

    const viewsChange = container.querySelector('[data-part="summary-views-change"]')
    expect(viewsChange?.getAttribute('data-direction')).toBe('down')
    expect(viewsChange?.textContent).toContain('%12 azalış')

    const messagesChange = container.querySelector(
      '[data-part="summary-messages-change"]',
    )
    expect(messagesChange?.getAttribute('data-direction')).toBe('flat')
    expect(messagesChange?.textContent).toContain('değişim yok')
  })

  it('titles every chart and pairs it with a text summary', () => {
    const { container } = render(<AccountInsightsPanel insights={makeInsights()} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Görüntülenme trendi' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Gelen mesajlar' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Favoriye eklenme' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Aylık harcama' })).toBeTruthy()

    expect(container.querySelectorAll('figure')).toHaveLength(4)
    expect(
      container.querySelector('[data-part="chart-listing-views"] figcaption')?.textContent,
    ).toBe('G1 38 görüntülenme, G3 137 görüntülenme — yükseliş.')
    expect(
      container.querySelector('[data-part="chart-spend"] figcaption')?.textContent,
    ).toBe('Haz 749 TL, Tem 1.098 TL — yükseliş.')

    // Grafik gövdesi AT için tek imgedir; her seri için bir tane olmalı.
    expect(screen.getAllByRole('img')).toHaveLength(4)
  })

  it('converts trend points into chart points in source order', () => {
    const { container } = render(<AccountInsightsPanel insights={makeInsights()} />)

    const spendRows = container.querySelectorAll(
      '[data-part="chart-spend"] [data-part="data-table"] tbody tr',
    )
    expect(Array.from(spendRows, (row) => row.textContent)).toEqual([
      'Haz749 TL',
      'Tem1.098 TL',
    ])
  })

  it('renders nothing when there are no insights and no error', () => {
    const { container } = render(<AccountInsightsPanel />)

    expect(container.firstChild).toBeNull()
  })

  it('keeps the section name but draws no chart when the section failed', () => {
    const { container } = render(
      <AccountInsightsPanel
        insights={makeInsights()}
        error={{ section: 'insights', message: 'Performans verileri yüklenemedi.' }}
      />,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'Performans' })).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain(
      'Performans verileri yüklenemedi.',
    )
    expect(container.querySelector('[data-part="section-error"]')).toBeTruthy()
    expect(container.querySelector('[data-part="insights-charts"]')).toBeNull()
    expect(container.querySelectorAll('figure')).toHaveLength(0)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('explains an empty series instead of implying missing data', () => {
    const { container } = render(
      <AccountInsightsPanel insights={makeInsights({}, { messages: [] })} />,
    )

    expect(
      container.querySelector('[data-part="chart-messages"] figcaption')?.textContent,
    ).toBe('Bu dönem için veri yok.')
    expect(screen.getByText('Veri yok')).toBeTruthy()
  })
})
