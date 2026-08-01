import { describe, expect, it, vi, afterEach } from 'vitest'
import { alanHataId, ilkHataliAlanaOdaklan } from './form-erisilebilirlik'

describe('alanHataId', () => {
  it('alan id sonuna -hata ekler', () => {
    expect(alanHataId('kayit-eposta')).toBe('kayit-eposta-hata')
  })
})

describe('ilkHataliAlanaOdaklan', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('görsel sırada ilk hatalı alana odaklanır — hatalar objesindeki sıraya değil', () => {
    document.body.innerHTML = `
      <input id="alan-a" />
      <input id="alan-b" />
      <input id="alan-c" />
    `
    const odaklan = vi.spyOn(document.getElementById('alan-b') as HTMLElement, 'focus')

    ilkHataliAlanaOdaklan(
      [
        { ad: 'a', id: 'alan-a' },
        { ad: 'b', id: 'alan-b' },
        { ad: 'c', id: 'alan-c' },
      ],
      // `a` hatasız, `c` de hatalı ama görsel sırada `b` önce gelir.
      { c: 'C hatalı', b: 'B hatalı' },
    )

    expect(odaklan).toHaveBeenCalledTimes(1)
  })

  it('hata yoksa hiçbir şeye odaklanmaz', () => {
    document.body.innerHTML = `<input id="alan-a" />`
    const odaklan = vi.spyOn(document.getElementById('alan-a') as HTMLElement, 'focus')
    ilkHataliAlanaOdaklan([{ ad: 'a', id: 'alan-a' }], {})
    expect(odaklan).not.toHaveBeenCalled()
  })
})
