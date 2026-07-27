import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ContentPricingStep } from './ContentPricingStep'
import {
  createEmptyDraft,
  type ListingContent,
} from './listing-create-domain'

function Harness() {
  const base = createEmptyDraft()
  const [value, setValue] = useState<ListingContent>(base.content)
  return (
    <>
      <ContentPricingStep
        value={value}
        property={{ ...base.property, family: 'land', area: '500' }}
        location={{
          ...base.location,
          city: 'izmir',
          district: 'urla',
          neighborhood: 'iskele',
        }}
        media={[
          {
            id: 'cover',
            name: 'arsa.jpg',
            src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
            status: 'ready',
            isCover: true,
            caption: '',
            qualityHints: [],
          },
        ]}
        errors={{}}
        onChange={setValue}
      />
      <output data-testid="content-title">{value.title}</output>
      <output data-testid="content-description">{value.description}</output>
    </>
  )
}

describe('ContentPricingStep', () => {
  it('calculates unit price and keeps title length visible', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText(/Satış fiyatı/), '5000000')
    expect(screen.getByText('10.000 TL/m²')).toBeTruthy()

    await user.type(screen.getByLabelText(/İlan başlığı/), 'Denize yakın imarlı arsa')
    expect(screen.getByText('24/70')).toBeTruthy()
  })

  it('labels regional pricing intelligence as a dated demo estimate', () => {
    render(<Harness />)

    expect(screen.getByText('Urla için bölgesel görünüm')).toBeTruthy()
    expect(screen.getByText('18 benzer ilan')).toBeTruthy()
    expect(screen.getByText('25 Temmuz 2026')).toBeTruthy()
    expect(screen.getByText(/resmi değerleme değildir/)).toBeTruthy()
  })

  it('keeps AI copy as a proposal until the user explicitly applies it', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'AI metni öner' }))

    expect(screen.getByText('Öneri hazır · Henüz uygulanmadı')).toBeTruthy()
    expect(screen.getByTestId('content-title').textContent).toBe('')
    expect(screen.queryByText(/güncel belgeler üzerinden kontrol edilmiştir/)).toBeNull()
    expect(screen.getByText(/Neden bu değişiklik/)).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Metni uygula' }))

    expect(screen.getByTestId('content-title').textContent).toContain('Urla')
  })

  it('lets the user apply title and description proposals independently', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'AI metni öner' }))
    await user.click(screen.getByRole('button', { name: 'Yalnız başlığı uygula' }))

    expect(screen.getByTestId('content-title').textContent).toContain('Urla')
    expect(screen.getByTestId('content-description').textContent).toBe('')

    await user.click(screen.getByRole('button', { name: 'Yalnız açıklamayı uygula' }))
    expect(screen.getByTestId('content-description').textContent).toContain(
      'kendi belgelerinizle',
    )
  })

  it('warns when copy contains unsupported certainty claims', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(
      screen.getByLabelText(/İlan açıklaması/),
      'Bu mülk kesin kazanç sağlar ve en iyi yatırım fırsatıdır.',
    )

    expect(screen.getByText('Kesinlik bildiren ifadeleri gözden geçirin')).toBeTruthy()
  })

  it('offers legal and accuracy confirmations beside a semantic listing preview', () => {
    render(<Harness />)

    expect(screen.getByLabelText(/İlan bilgilerinin doğru olduğunu/)).toBeTruthy()
    expect(screen.getByLabelText(/yayın koşullarını/)).toBeTruthy()
    expect(screen.getByRole('article', { name: 'İlan önizlemesi' })).toBeTruthy()
    expect(screen.getByAltText('İlan kapak önizlemesi')).toBeTruthy()
  })
})
