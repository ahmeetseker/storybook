import { describe, expect, it } from 'vitest'
import * as HomeRoute from './index'

type RouteOptions = {
  validateSearch?: (search: Record<string, unknown>) => Record<string, string>
}

function options(): RouteOptions {
  return HomeRoute.Route.options as RouteOptions
}

describe('/ rotası', () => {
  it('geçerli tur parametresini korur', () => {
    expect(options().validateSearch?.({ tur: 'konut' })).toEqual({ tur: 'konut' })
  })

  it('geçersiz tur parametresini düşürür', () => {
    expect(options().validateSearch?.({ tur: 'villa' })).toEqual({})
  })

  it('bilinmeyen parametreleri temizler', () => {
    expect(options().validateSearch?.({ tur: 'arsa', utm: 'x' })).toEqual({ tur: 'arsa' })
  })
})
