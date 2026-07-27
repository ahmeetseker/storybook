import { describe, expect, it } from 'vitest'
import { createPageHead } from '@/config/routes'
import { ListingCreateWorkspace } from '@/features/listing-create'
import { Route } from './ilan-ver'

describe('/ilan-ver rotası', () => {
  it('enterprise ilan çalışma alanını ve doğru sayfa meta verisini kullanır', () => {
    expect(Route.options.component).toBe(ListingCreateWorkspace)
    expect(Route.options.head?.({} as never)).toEqual(
      createPageHead('create-listing'),
    )
  })
})
