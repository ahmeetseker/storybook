import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MediaStudioStep } from './MediaStudioStep'
import type { ListingMediaItem } from './listing-create-domain'

function Harness({
  revokePreviewUrl,
}: {
  revokePreviewUrl?: (src: string) => void
} = {}) {
  const [value, setValue] = useState<ListingMediaItem[]>([])
  return (
    <>
      <MediaStudioStep
        value={value}
        errors={{}}
        revokePreviewUrl={revokePreviewUrl}
        onChange={setValue}
      />
      <output data-testid="media-order">
        {value.map((item) => `${item.name}:${item.isCover}`).join('|')}
      </output>
    </>
  )
}

describe('MediaStudioStep', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(
      (file) => `blob:${file instanceof File ? file.name : 'media'}`,
    )
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds image files, selects the first image as cover and announces progress', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const files = [
      new File(['a'], 'cephe.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'salon.jpg', { type: 'image/jpeg' }),
      new File(['c'], 'bahce.jpg', { type: 'image/jpeg' }),
    ]
    await user.upload(screen.getByLabelText('Fotoğraf ekle'), files)

    expect(screen.getByText('3 fotoğraf eklendi')).toBeTruthy()
    expect(screen.getByText('Kapak fotoğrafı', { selector: 'span' })).toBeTruthy()
    expect(screen.getByTestId('media-order').textContent).toContain('cephe.jpg:true')
    const preview = screen.getByAltText('cephe.jpg önizlemesi')
    expect(preview.getAttribute('loading')).toBe('lazy')
    expect(preview.getAttribute('decoding')).toBe('async')
  })

  it('supports explicit cover selection, reordering and removal', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.upload(screen.getByLabelText('Fotoğraf ekle'), [
      new File(['a'], 'cephe.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'salon.jpg', { type: 'image/jpeg' }),
      new File(['c'], 'bahce.jpg', { type: 'image/jpeg' }),
    ])

    await user.click(screen.getByRole('button', { name: 'salon.jpg fotoğrafını kapak yap' }))
    expect(screen.getByTestId('media-order').textContent).toContain('salon.jpg:true')

    await user.click(screen.getByRole('button', { name: 'bahce.jpg fotoğrafını sola taşı' }))
    expect(screen.getByTestId('media-order').textContent).toContain(
      'cephe.jpg:false|bahce.jpg:false|salon.jpg:true',
    )

    await user.click(screen.getByRole('button', { name: 'cephe.jpg fotoğrafını kaldır' }))
    expect(screen.queryByAltText('cephe.jpg önizlemesi')).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:cephe.jpg')
  })

  it('supports drag and drop and explains rejected file types', () => {
    render(<Harness />)
    const dropZone = screen.getByText('Fotoğraf ekle').closest('label')
    expect(dropZone).toBeTruthy()

    fireEvent.drop(dropZone as HTMLLabelElement, {
      dataTransfer: {
        files: [
          new File(['a'], 'cephe.jpg', { type: 'image/jpeg' }),
          new File(['b'], 'salon.jpg', { type: 'image/jpeg' }),
          new File(['c'], 'bahce.jpg', { type: 'image/jpeg' }),
        ],
      },
    })
    expect(screen.getByText('3 fotoğraf eklendi')).toBeTruthy()

    fireEvent.drop(dropZone as HTMLLabelElement, {
      dataTransfer: {
        files: [
          new File(['pdf'], 'tapu.pdf', { type: 'application/pdf' }),
          new File(['gif'], 'animasyon.gif', { type: 'image/gif' }),
        ],
      },
    })
    expect(
      screen.getByText('Yalnızca JPG, PNG veya WebP görseller eklenebilir'),
    ).toBeTruthy()
  })

  it('marks duplicate and explicitly named low-resolution files as unusable', () => {
    render(<Harness />)
    const dropZone = screen.getByText('Fotoğraf ekle').closest('label')
    const original = new File(['same'], 'cephe.jpg', {
      type: 'image/jpeg',
      lastModified: 10,
    })
    const duplicate = new File(['same'], 'cephe.jpg', {
      type: 'image/jpeg',
      lastModified: 10,
    })

    fireEvent.drop(dropZone as HTMLLabelElement, {
      dataTransfer: {
        files: [
          original,
          duplicate,
          new File(['small'], 'bahce-lowres.webp', { type: 'image/webp' }),
        ],
      },
    })

    expect(screen.getByText('Tekrar görsel')).toBeTruthy()
    expect(screen.getByText('Kaliteyi kontrol edin')).toBeTruthy()
    expect(screen.getByText(/daha önce eklenmiş/)).toBeTruthy()
    expect(
      screen.getAllByRole('button', { name: /yerine yeni dosya seç/ }),
    ).toHaveLength(2)
  })

  it('replaces an invalid photo at the same index and revokes its previous preview URL', async () => {
    const user = userEvent.setup()
    const revokePreviewUrl = vi.fn()
    render(<Harness revokePreviewUrl={revokePreviewUrl} />)

    await user.upload(screen.getByLabelText('Fotoğraf ekle'), [
      new File(['a'], 'cephe.jpg', { type: 'image/jpeg' }),
      new File(['small'], 'bahce-lowres.webp', { type: 'image/webp' }),
      new File(['c'], 'salon.jpg', { type: 'image/jpeg' }),
    ])

    await user.click(
      screen.getByRole('button', {
        name: 'bahce-lowres.webp yerine yeni dosya seç',
      }),
    )
    await user.upload(
      screen.getByLabelText('Fotoğraf ekle'),
      new File(['replacement'], 'bahce-yeni.jpg', { type: 'image/jpeg' }),
    )

    expect(screen.queryByAltText('bahce-lowres.webp önizlemesi')).toBeNull()
    expect(screen.getByAltText('bahce-yeni.jpg önizlemesi')).toBeTruthy()
    expect(screen.getByTestId('media-order').textContent).toBe(
      'cephe.jpg:true|bahce-yeni.jpg:false|salon.jpg:false',
    )
    expect(revokePreviewUrl).toHaveBeenCalledWith('blob:bahce-lowres.webp')
  })

  it('does not offer the cover action for invalid photos', () => {
    render(<Harness />)
    const dropZone = screen.getByText('Fotoğraf ekle').closest('label')
    const original = new File(['same'], 'cephe.jpg', {
      type: 'image/jpeg',
      lastModified: 10,
    })
    const oversized = new File(['large'], 'buyuk.jpg', {
      type: 'image/jpeg',
    })
    Object.defineProperty(oversized, 'size', {
      configurable: true,
      value: 20 * 1024 * 1024 + 1,
    })

    fireEvent.drop(dropZone as HTMLLabelElement, {
      dataTransfer: {
        files: [
          original,
          new File(['same'], 'cephe.jpg', {
            type: 'image/jpeg',
            lastModified: 10,
          }),
          new File(['small'], 'bahce-lowres.webp', { type: 'image/webp' }),
          oversized,
        ],
      },
    })

    expect(
      screen.queryByRole('button', {
        name: 'cephe.jpg fotoğrafını kapak yap',
      }),
    ).toBeNull()
    expect(
      screen.queryByRole('button', {
        name: 'bahce-lowres.webp fotoğrafını kapak yap',
      }),
    ).toBeNull()
    expect(
      screen.queryByRole('button', {
        name: 'buyuk.jpg fotoğrafını kapak yap',
      }),
    ).toBeNull()
  })

  it('does not promote an invalid photo when the ready cover is removed', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const original = new File(['same'], 'cephe.jpg', {
      type: 'image/jpeg',
      lastModified: 10,
    })

    await user.upload(screen.getByLabelText('Fotoğraf ekle'), [
      original,
      new File(['same'], 'cephe.jpg', {
        type: 'image/jpeg',
        lastModified: 10,
      }),
      new File(['small'], 'bahce-lowres.webp', { type: 'image/webp' }),
    ])
    await user.click(
      screen.getAllByRole('button', {
        name: 'cephe.jpg fotoğrafını kaldır',
      })[0]!,
    )

    expect(
      screen.queryByText('Kapak fotoğrafı', { selector: 'span' }),
    ).toBeNull()
    expect(screen.getByTestId('media-order').textContent).toBe(
      'cephe.jpg:false|bahce-lowres.webp:false',
    )
  })
})
