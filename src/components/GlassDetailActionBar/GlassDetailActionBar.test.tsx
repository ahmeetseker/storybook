import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GlassDetailActionBar } from './GlassDetailActionBar'

const PRIMARY = { id: 'message', label: 'Mesaj gönder', onSelect: () => {} }

describe('GlassDetailActionBar', () => {
  it('grup olarak adlandırılır', () => {
    render(<GlassDetailActionBar label="Karar ve iletişim" primary={PRIMARY} />)
    expect(screen.getByRole('group', { name: 'Karar ve iletişim' })).toBeTruthy()
  })

  it('yalnız tek cam yüzey üretir — çocuk kontroller yüzey açmaz', () => {
    const { container } = render(
      <GlassDetailActionBar
        label="Karar ve iletişim"
        primary={PRIMARY}
        secondary={{ id: 'tour', label: 'Randevu iste', onSelect: () => {} }}
        utilities={[
          { id: 'save', label: 'Kaydet', onSelect: () => {} },
          { id: 'share', label: 'Paylaş', onSelect: () => {} },
        ]}
      />,
    )
    expect(container.querySelectorAll('[data-material="glass"]').length).toBe(1)
  })

  it('primary eylemi tıklandığında çağırır', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<GlassDetailActionBar label="Karar" primary={{ ...PRIMARY, onSelect }} />)
    await user.click(screen.getByRole('button', { name: 'Mesaj gönder' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('utility eyleminde aria-pressed durumunu yansıtır', () => {
    render(
      <GlassDetailActionBar
        label="Karar"
        primary={PRIMARY}
        utilities={[{ id: 'save', label: 'Kaydet', onSelect: () => {}, pressed: true }]}
      />,
    )
    expect(screen.getByRole('button', { name: 'Kaydet' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('devre dışı eylem tıklanamaz', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <GlassDetailActionBar
        label="Karar"
        primary={{ id: 'message', label: 'Mesaj gönder', onSelect, disabled: true }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Mesaj gönder' }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('not metnini eylemlerin altında gösterir', () => {
    render(<GlassDetailActionBar label="Karar" primary={PRIMARY} note="Ören Emlak · yanıt ~4 saat" />)
    expect(screen.getByText('Ören Emlak · yanıt ~4 saat')).toBeTruthy()
  })

  it('bar düzeninde safe-area sınıfını uygular', () => {
    const { container } = render(<GlassDetailActionBar label="Karar" primary={PRIMARY} layout="bar" />)
    expect(container.firstElementChild?.getAttribute('data-layout')).toBe('bar')
  })
})
