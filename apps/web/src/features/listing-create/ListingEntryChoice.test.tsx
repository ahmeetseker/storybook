import { act } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createListingAdapters } from './listing-create-adapters'
import { ListingEntryChoice } from './ListingEntryChoice'

describe('ListingEntryChoice', () => {
  it('ignores an AI response when the source text changes during the request', async () => {
    const user = userEvent.setup()
    const baseAdapters = createListingAdapters({ delayMs: 0 })
    const staleProposal = await baseAdapters.proposeFromText(
      'Urla’da 512 metrekare satılık arsa',
    )
    let resolveProposal: (value: typeof staleProposal) => void = () => undefined
    const pendingProposal = new Promise<typeof staleProposal>((resolve) => {
      resolveProposal = resolve
    })
    const adapters = {
      ...baseAdapters,
      proposeFromText: vi.fn(() => pendingProposal),
    }

    render(
      <ListingEntryChoice
        adapters={adapters}
        onManualStart={vi.fn()}
        onApplyProposal={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'AI ile hızlı başla' }))
    const source = screen.getByLabelText('Mülkünüzü kısaca anlatın')
    await user.type(source, 'Urla’da 512 metrekare satılık arsa')
    await user.click(screen.getByRole('button', { name: 'Öneriyi hazırla' }))
    await user.clear(source)
    await user.type(source, 'Ankara’da 120 metrekare kiralık daire')

    await act(async () => {
      resolveProposal(staleProposal)
      await pendingProposal
    })

    expect(screen.queryByLabelText('AI önerisi')).toBeNull()
    expect(
      screen
        .getByRole('button', { name: 'Öneriyi hazırla' })
        .hasAttribute('disabled'),
    ).toBe(false)
  })
})
