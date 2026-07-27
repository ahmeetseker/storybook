import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LeafletPropertyPicker } from './LeafletPropertyPicker'

describe('LeafletPropertyPicker', () => {
  it('retries a failed loader and synchronizes the latest center and marker props', async () => {
    const user = userEvent.setup()
    const setView = vi.fn().mockReturnThis()
    const removeMap = vi.fn()
    const mapOn = vi.fn().mockReturnThis()
    const invalidateSize = vi.fn()
    const addMarkerTo = vi.fn().mockReturnThis()
    const setLatLng = vi.fn().mockReturnThis()
    const removeMarker = vi.fn()
    const circleMarker = vi.fn(() => ({
      addTo: addMarkerTo,
      setLatLng,
      remove: removeMarker,
    }))
    const map = {
      setView,
      remove: removeMap,
      invalidateSize,
      on: mapOn,
    }
    const { rerender } = render(
      <LeafletPropertyPicker
        center={[38.322, 26.764]}
        latitude={null}
        longitude={null}
        onPointChange={() => undefined}
      />,
    )

    const firstScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"]',
    )
    expect(firstScript).toBeTruthy()
    firstScript?.dispatchEvent(new Event('error'))

    expect(
      await screen.findByText('Harita yüklenemedi. Adres bilgileriyle devam edebilirsiniz.'),
    ).toBeTruthy()

    rerender(
      <LeafletPropertyPicker
        center={[41.008, 28.978]}
        latitude={null}
        longitude={null}
        onPointChange={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Haritayı yeniden yükle' }))

    const retryScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"]',
    )
    expect(retryScript).toBeTruthy()
    expect(retryScript).not.toBe(firstScript)

    Object.defineProperty(window, 'L', {
      configurable: true,
      writable: true,
      value: {
        map: vi.fn(() => map),
        tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
        circleMarker,
      },
    })
    retryScript?.dispatchEvent(new Event('load'))

    await waitFor(() => {
      expect(setView).toHaveBeenCalledWith([41.008, 28.978], 14)
    })

    rerender(
      <LeafletPropertyPicker
        center={[41.008, 28.978]}
        latitude={41.043}
        longitude={29.009}
        onPointChange={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(circleMarker).toHaveBeenCalledWith(
        [41.043, 29.009],
        expect.objectContaining({ color: 'var(--lg-accent)' }),
      )
    })

    rerender(
      <LeafletPropertyPicker
        center={[39.933, 32.86]}
        latitude={null}
        longitude={null}
        onPointChange={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(setView).toHaveBeenCalledWith([39.933, 32.86], 14)
      expect(removeMarker).toHaveBeenCalledTimes(1)
    })

    Reflect.deleteProperty(window, 'L')
  })
})
