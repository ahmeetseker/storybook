import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createPageHead } from '@/config/routes'
import { AuthSessionProvider } from '@/features/auth'
import { sahteAuthAdapters } from '@/features/auth/test-utils'
import { Route } from './ilan-ver'

vi.mock('@/features/listing-create', () => ({
  ListingCreateWorkspace: () => <h1>İlan çalışma alanı</h1>,
}))

describe('/ilan-ver rotası', () => {
  it('doğru sayfa meta verisini kullanır', () => {
    expect(Route.options.head?.({} as never)).toEqual(
      createPageHead('create-listing'),
    )
  })

  // İlan vermek hesap gerektirir. Rota İP-1'e kadar hiç korunmuyordu; bu iki
  // test korumanın İKİ katmanını da sabitler.
  it('beforeLoad guardı taşır', () => {
    expect(Route.options.beforeLoad).toBeTypeOf('function')
  })

  it('oturumsuz kullanıcıya çalışma alanını çizmez', () => {
    const Bilesen = Route.options.component as () => ReactElement
    render(
      <AuthSessionProvider adapters={sahteAuthAdapters()}>
        <Bilesen />
      </AuthSessionProvider>,
    )
    expect(screen.queryByRole('heading', { name: 'İlan çalışma alanı' })).toBeNull()
  })
})
