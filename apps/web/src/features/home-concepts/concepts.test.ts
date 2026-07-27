import { describe, expect, it } from 'vitest'
import { homeConcepts } from './concepts'

describe('ana sayfa konsept kaydı', () => {
  it('benzersiz id ve href ile tam beş konsept taşır', () => {
    expect(homeConcepts).toHaveLength(5)
    expect(new Set(homeConcepts.map((item) => item.id)).size).toBe(5)
    expect(new Set(homeConcepts.map((item) => item.href)).size).toBe(5)
    expect(
      homeConcepts.every((item) => item.href.startsWith('/konseptler/')),
    ).toBe(true)
  })

  it('tarayıcı seçim ekranı için kısa ve dolu metin taşır', () => {
    const metadataRules = [
      { key: 'title', maxLength: 32 },
      { key: 'summary', maxLength: 96 },
      { key: 'emphasis', maxLength: 32 },
    ] as const

    expect(
      homeConcepts.every((item) =>
        metadataRules.every(({ key, maxLength }) => {
          const value = item[key]
          const trimmedValue = value.trim()

          return (
            trimmedValue.length > 0 &&
            value === trimmedValue &&
            Array.from(value).length <= maxLength
          )
        }),
      ),
    ).toBe(true)
  })
})
