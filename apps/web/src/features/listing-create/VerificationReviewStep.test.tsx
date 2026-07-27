import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { VerificationReviewStep } from './VerificationReviewStep'
import {
  createEmptyDraft,
  type ListingDraft,
  type PublisherRole,
} from './listing-create-domain'

function draftFor(role: Exclude<PublisherRole, ''>): ListingDraft {
  const draft = createEmptyDraft()
  draft.property.publisherRole = role
  draft.location.propertyNumber = '980124771'
  return draft
}

describe('VerificationReviewStep', () => {
  it.each([
    ['owner', 'Taşınmaz sahibi ile tapu kaydı eşleştirilir'],
    ['relative', 'Eş veya birinci / ikinci derece kan hısımlığı kontrol edilir'],
    ['agency', 'Mülk sahibinin e-Devlet üzerinden verdiği süreli ilan yetkisi aranır'],
  ] as const)('shows role-aware guidance for %s', (role, copy) => {
    render(
      <VerificationReviewStep
        draft={draftFor(role)}
        errors={{}}
        onVerify={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(screen.getByText(copy)).toBeTruthy()
    expect(
      screen.getByText(/Demo bağlantısı — gerçek Ticaret Bakanlığı veya e-Devlet/),
    ).toBeTruthy()
  })

  it('starts verification explicitly and exposes the checking state', async () => {
    const user = userEvent.setup()
    const onVerify = vi.fn()
    const idleDraft = draftFor('owner')
    const { rerender } = render(
      <VerificationReviewStep
        draft={idleDraft}
        errors={{}}
        onVerify={onVerify}
        onEdit={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'EİDS demo doğrulamasını başlat' }))
    expect(onVerify).toHaveBeenCalledTimes(1)

    rerender(
      <VerificationReviewStep
        draft={{
          ...idleDraft,
          verification: { ...idleDraft.verification, status: 'checking' },
        }}
        errors={{}}
        onVerify={onVerify}
        onEdit={() => undefined}
      />,
    )

    expect(screen.getByText('Yetki ve taşınmaz kaydı kontrol ediliyor')).toBeTruthy()
    expect(
      screen
        .getByText('Yetki ve taşınmaz kaydı kontrol ediliyor')
        .closest('[aria-busy="true"]'),
    ).toBeTruthy()
  })

  it('preserves recovery actions for an unauthorized result', async () => {
    const user = userEvent.setup()
    const onVerify = vi.fn()
    const onEdit = vi.fn()
    const draft = draftFor('agency')
    draft.verification.status = 'unauthorized'
    draft.verification.errorCode = 'NO_AUTHORITY'

    render(
      <VerificationReviewStep
        draft={draft}
        errors={{ verification: 'EİDS doğrulaması gerekli' }}
        onVerify={onVerify}
        onEdit={onEdit}
      />,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeTruthy()
    expect(screen.getByText(/Taslağınız korundu/)).toBeTruthy()
    await user.click(within(alert).getByRole('button', { name: 'Mülk bilgilerini düzenle' }))
    expect(onEdit).toHaveBeenCalledWith('property')
    await user.click(screen.getByRole('button', { name: 'Yetkiyi yeniden kontrol et' }))
    expect(onVerify).toHaveBeenCalledTimes(1)
  })

  it('turns stale successful verification into an explicit recheck state', async () => {
    const user = userEvent.setup()
    const onVerify = vi.fn()
    const draft = draftFor('owner')
    draft.verification = {
      status: 'verified',
      verifiedRole: 'owner',
      verifiedPropertyNumber: '980124770',
      propertyReference: 'EIDS-DEMO-980124770',
      errorCode: null,
    }

    render(
      <VerificationReviewStep
        draft={draft}
        errors={{}}
        onVerify={onVerify}
        onEdit={() => undefined}
      />,
    )

    expect(screen.queryByText('Yetki doğrulandı')).toBeNull()
    expect(screen.getByText('Doğrulama bilgileri güncelliğini yitirdi')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Yetkiyi yeniden doğrula' }))
    expect(onVerify).toHaveBeenCalledTimes(1)
  })

  it('provides explicit edit actions for every review section', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <VerificationReviewStep
        draft={draftFor('owner')}
        errors={{}}
        onVerify={() => undefined}
        onEdit={onEdit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Konum bilgilerini düzenle' }))
    await user.click(screen.getByRole('button', { name: 'Fotoğrafları düzenle' }))
    await user.click(screen.getByRole('button', { name: 'Fiyat ve ilan metnini düzenle' }))

    expect(onEdit).toHaveBeenNthCalledWith(1, 'location')
    expect(onEdit).toHaveBeenNthCalledWith(2, 'media')
    expect(onEdit).toHaveBeenNthCalledWith(3, 'content')
    expect(
      screen.getByRole('heading', { name: 'EİDS doğrulaması', level: 3 }),
    ).toBeTruthy()
  })
})
