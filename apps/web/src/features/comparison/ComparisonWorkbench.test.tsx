import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ComparisonWorkbench } from './ComparisonWorkbench'

describe('ComparisonWorkbench', () => {
  it('retains the enterprise demonstration when no route selection is supplied', () => {
    render(<ComparisonWorkbench />)
    expect(
      screen.getByRole('heading', {
        name: 'İlanları yalnızca değil, kararınızı karşılaştırın.',
      }),
    ).toBeTruthy()
    expect(screen.getAllByText('Kozlu Fatih Sitesi 3+1').length).toBeGreaterThan(
      0,
    )
  })

  it('supports differences-only mode and removing a listing', () => {
    render(<ComparisonWorkbench />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Yalnız farklılıklar' }),
    )
    expect(
      screen
        .getByRole('button', { name: 'Yalnız farklılıklar' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    fireEvent.click(
      screen.getAllByRole('button', {
        name: /Karşılaştırmadan çıkar:/,
      })[0],
    )
    expect(
      screen.queryByRole('columnheader', {
        name: 'Kozlu Fatih Sitesi 3+1',
      }),
    ).toBeNull()
  })

  it('renders the listings selected by the advisor URL handoff', () => {
    render(
      <ComparisonWorkbench
        initialIds={['listing-1-2', 'listing-1-1']}
      />,
    )

    expect(
      screen.getAllByText(/Urla’da denize yakın, imarlı köşe parsel/).length,
    ).toBeGreaterThan(0)
    expect(
      screen
        .getAllByRole('columnheader')
        .slice(1)
        .map((header) => header.textContent),
    ).toEqual([
      '×Urla’da denize yakın, imarlı köşe parsel · 2. portföy',
      '×Urla’da denize yakın, imarlı köşe parsel',
    ])
    expect(
      screen.getByText(
        'Görseller temsili fotoğraflardır; yüklenemezse mevcut ilan görseli gösterilir.',
      ),
    ).toBeTruthy()
    expect(screen.queryByText('Kozlu Fatih Sitesi 3+1')).toBeNull()
  })

  it('shows the stale-selection state for an explicit empty selection', () => {
    render(<ComparisonWorkbench initialIds={[]} />)

    expect(
      screen.getByText('Seçtiğiniz ilanlar artık bulunamıyor'),
    ).toBeTruthy()
    expect(screen.queryByText('Kozlu Fatih Sitesi 3+1')).toBeNull()
  })

  it('shows the stale-selection state when every selected id is unknown', () => {
    render(
      <ComparisonWorkbench initialIds={['unknown', 'retired-id']} />,
    )

    expect(
      screen.getByText('Seçtiğiniz ilanlar artık bulunamıyor'),
    ).toBeTruthy()
    expect(screen.queryByText('Kozlu Fatih Sitesi 3+1')).toBeNull()
  })
})
