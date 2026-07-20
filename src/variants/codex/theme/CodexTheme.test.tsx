import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CodexTheme } from './index'

describe('CodexTheme', () => {
  it('varsayılan tema ve design-system kimliğini yalnız kendi kökünde işaretler', () => {
    render(
      <CodexTheme data-testid="theme-root">
        <button type="button">Devam et</button>
      </CodexTheme>,
    )

    const root = screen.getByTestId('theme-root')
    expect(root.getAttribute('data-codex-theme')).toBe('paper')
    expect(root.getAttribute('data-design-system')).toBe('codex')
    expect(screen.getByRole('button', { name: 'Devam et' }).closest('[data-codex-theme]')).toBe(root)
    expect(document.body.hasAttribute('data-codex-theme')).toBe(false)
  })

  it('paper, mineral ve graphite seçimlerini data attribute’a yansıtır', () => {
    const { rerender } = render(<CodexTheme theme="paper" data-testid="theme" />)
    expect(screen.getByTestId('theme').dataset.codexTheme).toBe('paper')

    rerender(<CodexTheme theme="mineral" data-testid="theme" />)
    expect(screen.getByTestId('theme').dataset.codexTheme).toBe('mineral')

    rerender(<CodexTheme theme="graphite" data-testid="theme" />)
    expect(screen.getByTestId('theme').dataset.codexTheme).toBe('graphite')
  })

  it('className, aria-label ve event handler gibi div attribute’larını forward eder', () => {
    const onClick = vi.fn()
    render(
      <CodexTheme
        theme="mineral"
        canvas="padded"
        className="consumer-class"
        aria-label="Mineral tema örneği"
        onClick={onClick}
      >
        Tema içeriği
      </CodexTheme>,
    )

    const root = screen.getByLabelText('Mineral tema örneği')
    expect(root.className).toContain('consumer-class')
    expect(root.textContent).toBe('Tema içeriği')
    fireEvent.click(root)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('tema kimliği caller data attribute değeriyle ezilemez', () => {
    render(<CodexTheme theme="graphite" data-codex-theme="paper" data-design-system="başka" data-testid="locked-theme" />)
    const root = screen.getByTestId('locked-theme')
    expect(root.dataset.codexTheme).toBe('graphite')
    expect(root.dataset.designSystem).toBe('codex')
  })
})
