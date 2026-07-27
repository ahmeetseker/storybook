import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PropertyStep } from './PropertyStep'
import { LocationStep } from './LocationStep'
import {
  createEmptyDraft,
  type ListingLocation,
  type ListingProperty,
} from './listing-create-domain'

function PropertyHarness({ errors = {} }: { errors?: Record<string, string> }) {
  const [value, setValue] = useState<ListingProperty>(createEmptyDraft().property)
  return <PropertyStep value={value} errors={errors} onChange={setValue} />
}

function LocationHarness({ initial }: { initial?: ListingLocation }) {
  const [value, setValue] = useState<ListingLocation>(
    initial ?? createEmptyDraft().location,
  )
  return (
    <>
      <LocationStep
        value={value}
        propertyFamily="land"
        errors={{}}
        onChange={setValue}
      />
      <output data-testid="district-value">{value.district}</output>
      <output data-testid="coordinates-value">
        {String(value.latitude)}|{String(value.longitude)}
      </output>
    </>
  )
}

async function chooseOption(label: RegExp, option: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('combobox', { name: label }))
  await user.click(screen.getByRole('option', { name: option }))
}

describe('PropertyStep', () => {
  it('shows land-specific fields for arsa and residential fields for konut', async () => {
    const user = userEvent.setup()
    render(<PropertyHarness />)

    await chooseOption(/Mülk türü/, 'Arsa / Arazi')
    expect(screen.getByLabelText(/Toplam alan/)).toBeTruthy()
    expect(screen.getByLabelText(/İmar durumu/)).toBeTruthy()
    expect(screen.getByLabelText(/Tapu türü/)).toBeTruthy()
    expect(screen.queryByLabelText(/Oda sayısı/)).toBeNull()

    await user.type(screen.getByLabelText(/Toplam alan/), '512')
    await chooseOption(/Mülk türü/, 'Konut')

    expect(screen.getByLabelText(/Oda sayısı/)).toBeTruthy()
    expect((screen.getByLabelText(/Brüt alan/) as HTMLInputElement).value).toBe('')
    expect(screen.queryByLabelText(/İmar durumu/)).toBeNull()
  })

  it('connects inline validation errors to the invalid control', () => {
    render(<PropertyHarness errors={{ family: 'Mülk türü seçin' }} />)

    const family = screen.getByLabelText(/Mülk türü/)
    expect(family.getAttribute('aria-invalid')).toBe('true')
    expect(family.getAttribute('aria-describedby')).toBe('property-family-error')
    expect(screen.getByText('Mülk türü seçin').getAttribute('id')).toBe(
      'property-family-error',
    )
  })

  it('shows usage status and gross/net areas for commercial properties', async () => {
    render(<PropertyHarness />)

    await chooseOption(/Mülk türü/, 'İş yeri')

    expect(screen.getByLabelText(/Kullanım durumu/)).toBeTruthy()
    expect(screen.getByLabelText(/Brüt alan/)).toBeTruthy()
    expect(screen.getByLabelText(/Net alan/)).toBeTruthy()
    expect(screen.queryByLabelText(/Kat sayısı/)).toBeNull()
  })

  it('shows total area, floor count and independent units for buildings', async () => {
    render(<PropertyHarness />)

    await chooseOption(/Mülk türü/, 'Bina')

    expect(screen.getByLabelText(/Toplam alan/)).toBeTruthy()
    expect(screen.getByLabelText(/Kat sayısı/)).toBeTruthy()
    expect(screen.getByLabelText(/Bağımsız bölüm sayısı/)).toBeTruthy()
    expect(screen.queryByLabelText(/Kullanım durumu/)).toBeNull()
  })

  it('clears category-specific commercial values when the family changes', async () => {
    const user = userEvent.setup()
    render(<PropertyHarness />)

    await chooseOption(/Mülk türü/, 'İş yeri')
    await chooseOption(/Kullanım durumu/, 'Kiracılı')
    await user.type(screen.getByLabelText(/Brüt alan/), '180')
    await user.type(screen.getByLabelText(/Net alan/), '150')

    await chooseOption(/Mülk türü/, 'Bina')
    await chooseOption(/Mülk türü/, 'İş yeri')

    expect(
      screen.getByRole('combobox', { name: /Kullanım durumu/ }).textContent,
    ).toContain('Seçin')
    expect((screen.getByLabelText(/Brüt alan/) as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText(/Net alan/) as HTMLInputElement).value).toBe('')
  })
})

describe('LocationStep', () => {
  it('clears dependent district and neighborhood when city changes', async () => {
    render(<LocationHarness />)

    await chooseOption(/^İl$/, 'İzmir')
    await chooseOption(/^İlçe$/, 'Urla')
    await chooseOption(/^Mahalle$/, 'İskele')
    expect(screen.getByTestId('district-value').textContent).toBe('urla')

    await chooseOption(/^İl$/, 'İstanbul')

    expect(screen.getByTestId('district-value').textContent).toBe('')
    expect(
      screen.getByRole('combobox', { name: /^Mahalle$/ }).textContent,
    ).toContain('Seçin')
  })

  it('shows ada and parcel controls for land identity', () => {
    render(<LocationHarness />)

    expect(screen.getByLabelText(/^Ada/)).toBeTruthy()
    expect(screen.getByLabelText(/^Parsel/)).toBeTruthy()
    expect(screen.getByText(/Tam adres ilanda gösterilmez/)).toBeTruthy()
  })

  it('offers at least one neighborhood for every selectable district', async () => {
    const user = userEvent.setup()
    render(<LocationHarness />)

    const cases = [
      ['İzmir', ['Urla', 'Çeşme', 'Seferihisar']],
      ['İstanbul', ['Kadıköy', 'Beşiktaş', 'Sarıyer']],
      ['Ankara', ['Gölbaşı', 'Çankaya']],
    ] as const

    for (const [city, districtLabels] of cases) {
      await chooseOption(/^İl$/, city)
      for (const district of districtLabels) {
        await chooseOption(/^İlçe$/, district)
        await user.click(screen.getByRole('combobox', { name: /^Mahalle$/ }))
        expect(
          screen.getAllByRole('option').length,
          `${district} için mahalle seçeneği bulunmalı`,
        ).toBeGreaterThan(0)
        await user.keyboard('{Escape}')
      }
    }
  })

  it.each([
    ['şehir', /^İl$/, 'İstanbul'],
    ['ilçe', /^İlçe$/, 'Çeşme'],
  ])('%s değişince eski harita koordinatlarını temizler', async (_, label, nextValue) => {
    render(
      <LocationHarness
        initial={{
          ...createEmptyDraft().location,
          city: 'izmir',
          district: 'urla',
          neighborhood: 'iskele',
          latitude: 38.322,
          longitude: 26.764,
        }}
      />,
    )

    await chooseOption(label, nextValue)

    expect(screen.getByTestId('coordinates-value').textContent).toBe('null|null')
  })

  it('lets keyboard users select the map center as the exact location', async () => {
    const user = userEvent.setup()
    render(
      <LocationHarness
        initial={{
          ...createEmptyDraft().location,
          city: 'izmir',
          district: 'urla',
          neighborhood: 'iskele',
          precision: 'exact',
        }}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Harita merkezini konum olarak seç' }),
    )

    expect(screen.getByTestId('coordinates-value').textContent).toBe(
      '38.322|26.764',
    )
  })
})
