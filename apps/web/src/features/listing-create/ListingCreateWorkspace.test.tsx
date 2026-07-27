import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ListingCreateWorkspace } from './ListingCreateWorkspace'
import {
  createEmptyDraft,
  type ListingDraft,
  type ListingMediaItem,
} from './listing-create-domain'

function readyPhoto(id: string, isCover = false): ListingMediaItem {
  return {
    id,
    name: `${id}.jpg`,
    src: `data:image/gif;base64,${id}`,
    status: 'ready',
    isCover,
    caption: '',
    qualityHints: [],
  }
}

async function chooseOption(label: RegExp, option: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('combobox', { name: label }))
  await user.click(screen.getByRole('option', { name: option }))
}

function completeDraft(verified = false): ListingDraft {
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
      propertyNumber: '980124771',
      island: '118',
      parcel: '24',
    },
    media: [readyPhoto('one', true), readyPhoto('two'), readyPhoto('three')],
    content: {
      price: '4250000',
      title: 'Urla’da imarlı köşe parsel',
      description: 'Denize yakın, müstakil tapulu ve yola cepheli imarlı parsel.',
      highlights: ['Müstakil tapu'],
      riskAccepted: true,
      legalConsent: true,
    },
    verification: verified
      ? {
          status: 'verified',
          verifiedRole: 'owner',
          verifiedPropertyNumber: '980124771',
          propertyReference: 'EIDS-DEMO-980124771',
          errorCode: null,
        }
      : draft.verification,
    meta: { ...draft.meta, activeStep: 'verification' },
  }
}

describe('ListingCreateWorkspace', () => {
  it('starts with a focused hybrid AI or manual choice', () => {
    render(<ListingCreateWorkspace />)

    expect(screen.getByRole('heading', { name: 'İlanınızı güvenle yayına hazırlayın' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'AI ile hızlı başla' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Bilgileri kendim gireceğim' })).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: 'İlan oluşturma adımları' })).toBeNull()
  })

  it('manual entry opens an exact five-step process and disables future steps', async () => {
    const user = userEvent.setup()
    render(<ListingCreateWorkspace />)

    await user.click(screen.getByRole('button', { name: 'Bilgileri kendim gireceğim' }))

    const navigation = screen.getByRole('navigation', { name: 'İlan oluşturma adımları' })
    const stepButtons = navigation.querySelectorAll('ol button')
    expect(stepButtons).toHaveLength(5)
    expect(screen.getByRole('button', { name: /Mülk bilgileri/ }).getAttribute('aria-current')).toBe(
      'step',
    )
    expect(screen.getByRole('button', { name: /Konum ve taşınmaz/ }).hasAttribute('disabled')).toBe(
      true,
    )
    expect(
      screen.getByRole('combobox', { name: 'Aktif ilan oluşturma adımı' }),
    ).toBeTruthy()
    expect(screen.queryByText('Önizleme', { selector: 'button *' })).toBeNull()
  })

  it('shows an AI proposal for review and applies it only after explicit consent', async () => {
    const user = userEvent.setup()
    render(<ListingCreateWorkspace adapterDelayMs={0} />)

    await user.click(screen.getByRole('button', { name: 'AI ile hızlı başla' }))
    await user.type(
      screen.getByLabelText('Mülkünüzü kısaca anlatın'),
      'Urla İskele’de 512 metrekare konut imarlı satılık arsa',
    )
    await user.click(screen.getByRole('button', { name: 'Öneriyi hazırla' }))

    expect(await screen.findByText('Öneri hazır, henüz forma uygulanmadı')).toBeTruthy()
    expect(screen.getByText('Urla’da imarlı, yola cepheli köşe parsel')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Önerileri forma uygula' }))

    expect(screen.getByRole('heading', { name: 'Mülk bilgileri' })).toBeTruthy()
    expect(screen.getByText(/AI önerisi uygulandı/)).toBeTruthy()
  })

  it('derives the AI proposal summary from the actual proposal fields', async () => {
    const user = userEvent.setup()
    render(<ListingCreateWorkspace adapterDelayMs={0} />)

    await user.click(screen.getByRole('button', { name: 'AI ile hızlı başla' }))
    await user.type(
      screen.getByLabelText('Mülkünüzü kısaca anlatın'),
      'Ankara’da 120 metrekare kiralık daire',
    )
    await user.click(screen.getByRole('button', { name: 'Öneriyi hazırla' }))

    const proposal = await screen.findByLabelText('AI önerisi')
    expect(
      within(within(proposal).getByText('Mülk').closest('div') as HTMLElement)
        .getByText('Konut'),
    ).toBeTruthy()
    expect(
      within(within(proposal).getByText('Konum').closest('div') as HTMLElement)
        .getByText('Ankara'),
    ).toBeTruthy()
    expect(
      within(within(proposal).getByText('Alan').closest('div') as HTMLElement)
        .getByText('120 m²'),
    ).toBeTruthy()
  })

  it('blocks progression with inline validation and advances after valid data', async () => {
    const user = userEvent.setup()
    render(<ListingCreateWorkspace adapterDelayMs={0} />)

    await user.click(screen.getByRole('button', { name: 'Bilgileri kendim gireceğim' }))
    await user.click(screen.getByRole('button', { name: 'Devam et' }))

    expect(screen.getAllByText('Mülk türü seçin').length).toBeGreaterThan(0)
    const summary = screen.getByRole('alert', {
      name: 'Bu adımda düzeltilmesi gereken alanlar',
    })
    expect(within(summary).getAllByRole('link').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Mülk bilgileri' })).toBeTruthy()
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('radio', { name: 'Satılık' }),
      ),
    )

    await chooseOption(/Mülk türü/, 'Arsa / Arazi')
    expect(screen.getAllByText('İlan amacını seçin').length).toBeGreaterThan(0)
  })

  it('recovers a failed autosave from the persistent action rail', async () => {
    const user = userEvent.setup()
    render(
      <ListingCreateWorkspace
        adapterDelayMs={0}
        adapterScenario={{ save: 'error-once' }}
        initialDraft={completeDraft(false)}
      />,
    )

    const retry = await screen.findByRole('button', {
      name: 'Taslak kaydedilemedi · Tekrar dene',
    })
    await user.click(retry)

    expect(await screen.findByText('Kaydedildi 21:42')).toBeTruthy()
    expect(
      screen.queryByRole('button', {
        name: 'Taslak kaydedilemedi · Tekrar dene',
      }),
    ).toBeNull()
  })

  it('completes the full five-step flow from a blank draft without losing data', async () => {
    const createUrl = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation((file) =>
        `blob:${file instanceof File ? file.name : 'media'}`,
      )
    const revokeUrl = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined)
    const user = userEvent.setup()

    try {
      render(<ListingCreateWorkspace adapterDelayMs={0} />)
      await user.click(
        screen.getByRole('button', { name: 'Bilgileri kendim gireceğim' }),
      )

      await user.click(screen.getByRole('radio', { name: 'Satılık' }))
      await chooseOption(/Mülk türü/, 'Arsa / Arazi')
      await chooseOption(/Alt tür/, 'İmarlı arsa')
      await user.click(screen.getByRole('radio', { name: /Mülk sahibiyim/ }))
      await user.type(screen.getByLabelText(/Toplam alan/), '512')
      await chooseOption(/İmar durumu/, 'Konut imarlı')
      await chooseOption(/Tapu türü/, 'Müstakil tapu')
      await user.click(screen.getByRole('button', { name: 'Devam et' }))

      await chooseOption(/^İl$/, 'İzmir')
      await chooseOption(/^İlçe$/, 'Urla')
      await chooseOption(/^Mahalle$/, 'İskele')
      await user.type(screen.getByLabelText(/Taşınmaz numarası/), '980124771')
      await user.type(screen.getByLabelText(/^Ada/), '118')
      await user.type(screen.getByLabelText(/^Parsel/), '24')

      await user.click(screen.getByRole('button', { name: '← Geri' }))
      expect((screen.getByLabelText(/Toplam alan/) as HTMLInputElement).value).toBe(
        '512',
      )
      await user.click(screen.getByRole('button', { name: /Konum ve taşınmaz/ }))
      expect(
        (screen.getByLabelText(/Taşınmaz numarası/) as HTMLInputElement).value,
      ).toBe('980124771')
      await user.click(screen.getByRole('button', { name: 'Devam et' }))

      await user.upload(screen.getByLabelText('Fotoğraf ekle'), [
        new File(['a'], 'cephe.jpg', { type: 'image/jpeg' }),
        new File(['b'], 'parsel.jpg', { type: 'image/jpeg' }),
        new File(['c'], 'cevre.jpg', { type: 'image/jpeg' }),
      ])
      await user.click(screen.getByRole('button', { name: 'Devam et' }))

      await user.type(screen.getByLabelText(/Satış fiyatı/), '4250000')
      await user.type(
        screen.getByLabelText(/İlan başlığı/),
        'Urla’da imarlı köşe parsel',
      )
      await user.type(
        screen.getByLabelText(/İlan açıklaması/),
        'Denize yakın, müstakil tapulu ve yola cepheli imarlı parsel.',
      )
      await user.click(screen.getByLabelText(/İlan bilgilerinin doğru olduğunu/))
      await user.click(screen.getByLabelText(/yayın koşullarını/))
      await user.click(screen.getByRole('button', { name: 'Devam et' }))

      await user.click(
        screen.getByRole('button', { name: 'EİDS demo doğrulamasını başlat' }),
      )
      expect(await screen.findByText('Yetki doğrulandı')).toBeTruthy()
      const publish = screen.getByRole('button', { name: 'İlanı yayınla' })
      await waitFor(() => expect(publish.hasAttribute('disabled')).toBe(false))
      await user.click(publish)

      expect(
        screen.getByRole('status', { name: 'Yayın durumu' }).textContent,
      ).toContain('İlanınız yayına hazır')
    } finally {
      createUrl.mockRestore()
      revokeUrl.mockRestore()
    }
  })

  it('runs the EİDS demo gate and publishes only after verification', async () => {
    const user = userEvent.setup()
    render(
      <ListingCreateWorkspace
        adapterDelayMs={0}
        initialDraft={completeDraft(false)}
      />,
    )

    const publish = screen.getByRole('button', { name: 'İlanı yayınla' })
    expect(publish.hasAttribute('disabled')).toBe(true)

    await user.click(
      screen.getByRole('button', { name: 'EİDS demo doğrulamasını başlat' }),
    )
    expect(await screen.findByText('Yetki doğrulandı')).toBeTruthy()
    expect(publish.hasAttribute('disabled')).toBe(true)
    await waitFor(() => expect(publish.hasAttribute('disabled')).toBe(false))

    await user.click(publish)
    expect(
      screen.getByRole('status', { name: 'Yayın durumu' }).textContent,
    ).toContain('İlanınız yayına hazır')
  })

  it.each([
    {
      scenario: 'unauthorized' as const,
      message: 'Bu rol için aktif ilan yetkisi bulunamadı',
      retry: 'Yetkiyi yeniden kontrol et',
    },
    {
      scenario: 'unavailable' as const,
      message: 'Doğrulama servisine şu anda ulaşılamıyor',
      retry: 'Tekrar dene',
    },
  ])(
    'keeps the draft and publish gate closed when EİDS is $scenario',
    async ({ scenario, message, retry }) => {
      const user = userEvent.setup()
      render(
        <ListingCreateWorkspace
          adapterDelayMs={0}
          adapterScenario={{ eids: scenario }}
          initialDraft={completeDraft(false)}
        />,
      )

      const publish = screen.getByRole('button', { name: 'İlanı yayınla' })
      await user.click(
        screen.getByRole('button', { name: 'EİDS demo doğrulamasını başlat' }),
      )

      expect(await screen.findByText(message)).toBeTruthy()
      expect(publish.hasAttribute('disabled')).toBe(true)
      expect(screen.getByText('Urla’da imarlı köşe parsel')).toBeTruthy()

      await user.click(screen.getByRole('button', { name: retry }))
      expect(await screen.findByText(message)).toBeTruthy()
      expect(publish.hasAttribute('disabled')).toBe(true)
    },
  )

  it('moves focus to the new step heading after review editing', async () => {
    const user = userEvent.setup()
    render(
      <ListingCreateWorkspace
        adapterDelayMs={0}
        initialDraft={completeDraft(true)}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Fiyat ve ilan metnini düzenle' }),
    )

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('heading', { name: 'Fiyat ve ilan metni' }),
      ),
    )
  })

  it('returns directly to final review after editing a completed section', async () => {
    const user = userEvent.setup()
    render(
      <ListingCreateWorkspace
        adapterDelayMs={0}
        initialDraft={completeDraft(true)}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Fiyat ve ilan metnini düzenle' }))
    expect(screen.getByRole('heading', { name: 'Fiyat ve ilan metni' })).toBeTruthy()
    await user.click(
      screen.getByRole('button', { name: 'Kaydet ve son kontrole dön' }),
    )

    expect(screen.getByRole('heading', { name: 'Doğrulama ve yayın' })).toBeTruthy()
  })

  it('keeps EİDS verification for non-identity edits and resets it when the role changes', async () => {
    const user = userEvent.setup()
    render(
      <ListingCreateWorkspace
        adapterDelayMs={0}
        initialDraft={completeDraft(true)}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Mülk bilgilerini düzenle' }),
    )
    const area = screen.getByLabelText(/Toplam alan/)
    await user.clear(area)
    await user.type(area, '520')
    await user.click(
      screen.getByRole('button', { name: 'Kaydet ve son kontrole dön' }),
    )
    expect(screen.getByText('Yetki doğrulandı')).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Mülk bilgilerini düzenle' }),
    )
    await user.click(screen.getByRole('radio', { name: /Yakını.*eşiyim/ }))
    await user.click(
      screen.getByRole('button', { name: 'Kaydet ve son kontrole dön' }),
    )

    expect(screen.queryByText('Yetki doğrulandı')).toBeNull()
    expect(
      screen.getByRole('button', {
        name: 'EİDS demo doğrulamasını başlat',
      }),
    ).toBeTruthy()
  })

  it('keeps photo preview URLs alive between steps and revokes them on workspace exit', async () => {
    const createUrl = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation((file) =>
        `blob:${file instanceof File ? file.name : 'media'}`,
      )
    const revokeUrl = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined)
    const draft = completeDraft(false)
    draft.media = []
    draft.meta.activeStep = 'media'
    const user = userEvent.setup()
    const { unmount } = render(
      <ListingCreateWorkspace adapterDelayMs={0} initialDraft={draft} />,
    )

    await user.upload(screen.getByLabelText('Fotoğraf ekle'), [
      new File(['a'], 'cephe.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'salon.jpg', { type: 'image/jpeg' }),
      new File(['c'], 'bahce.jpg', { type: 'image/jpeg' }),
    ])
    await user.click(screen.getByRole('button', { name: 'Devam et' }))

    expect(screen.getByRole('heading', { name: 'Fiyat ve ilan metni' })).toBeTruthy()
    expect(revokeUrl).not.toHaveBeenCalled()

    unmount()
    expect(revokeUrl).toHaveBeenCalledTimes(3)
    createUrl.mockRestore()
    revokeUrl.mockRestore()
  })
})
