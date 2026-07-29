import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageContainer } from './PageContainer'
import styles from './PageContainer.module.css'

describe('PageContainer', () => {
  it('kabuğun skip-link hedefi olan tek main landmark`ını üretir', () => {
    render(<PageContainer>İçerik</PageContainer>)

    const main = screen.getByRole('main')
    expect(main.id).toBe('main-content')
    expect(main.textContent).toBe('İçerik')
  })

  it('varsayılan kademe base`tir; narrow ve wide ayrı sınıf taşır', () => {
    const { rerender } = render(<PageContainer>base</PageContainer>)
    const base = screen.getByRole('main')
    expect(base.className).toContain(styles.container)
    expect(base.className).not.toContain(styles.narrow)
    expect(base.className).not.toContain(styles.wide)

    rerender(<PageContainer size="narrow">narrow</PageContainer>)
    expect(screen.getByRole('main').className).toContain(styles.narrow)

    rerender(<PageContainer size="wide">wide</PageContainer>)
    const wide = screen.getByRole('main')
    expect(wide.className).toContain(styles.wide)
    expect(wide.className).not.toContain(styles.narrow)
  })

  it('kabuk payını varsayılan olarak ayırır, kabuksuz akışta bırakır', () => {
    const { rerender } = render(<PageContainer>kabuklu</PageContainer>)
    expect(screen.getByRole('main').className).toContain(styles.shellInsets)

    rerender(<PageContainer shellInsets={false}>kabuksuz</PageContainer>)
    expect(screen.getByRole('main').className).not.toContain(styles.shellInsets)
  })

  it('sayfaya özel className ve nitelikleri korur', () => {
    render(
      <PageContainer className="ozel" aria-busy id="ozel-hedef">
        içerik
      </PageContainer>,
    )

    const main = screen.getByRole('main')
    expect(main.className).toContain('ozel')
    expect(main.className).toContain(styles.container)
    expect(main.id).toBe('ozel-hedef')
    expect(main.getAttribute('aria-busy')).toBe('true')
  })
})
