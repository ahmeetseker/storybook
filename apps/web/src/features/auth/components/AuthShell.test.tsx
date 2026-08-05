import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthShell } from './AuthShell'

function shellIleRouter() {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
      <AuthShell>
        <h1>Giriş</h1>
      </AuthShell>
    ),
  })
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

describe('AuthShell', () => {
  it('çocuklarını çizer', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    expect(await screen.findByRole('heading', { name: 'Giriş' })).toBeTruthy()
  })

  it('kendi main landmark öğesini üretmez — o sayfanın sorumluluğudur', async () => {
    const { container } = render(<RouterProvider router={shellIleRouter()} />)
    await screen.findByRole('heading', { name: 'Giriş' })
    expect(container.querySelectorAll('main')).toHaveLength(0)
  })

  it('markayı ana sayfaya bağlar', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    const marka = await screen.findByRole('link', { name: 'arsam.net' })
    expect(marka.getAttribute('href')).toBe('/')
  })

  /**
   * Marka paneli tamamen dekoratiftir. Erişilebilirlik ağacına girerse
   * ekran okuyucu kullanıcısı giriş alanına ulaşmadan önce üç paragraf
   * dinler — görsel kullanıcının bir bakışta atladığı şeyi.
   */
  it('dekoratif marka panelini erişilebilirlik ağacından gizler', async () => {
    const { container } = render(<RouterProvider router={shellIleRouter()} />)
    await screen.findByRole('heading', { name: 'Giriş' })

    const panel = container.querySelector('[aria-hidden="true"]')
    expect(panel, 'marka paneli aria-hidden taşımalı').toBeTruthy()
    expect(panel?.textContent).toContain('Doğrulanmış ofisler')

    // ROL sorguları erişilebilirlik ağacını okur (metin sorguları okumaz):
    // paneldeki rozet listesi ağaçta görünmemeli.
    expect(screen.queryAllByRole('list')).toHaveLength(0)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('panel içinde başlık öğesi kullanmaz — sayfanın başlık sırası tek kaynaktır', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    await screen.findByRole('heading', { name: 'Giriş' })
    // Gizli de olsa DOM'da ikinci bir h1/h2 bulunmamalı.
    expect(screen.getAllByRole('heading', { hidden: true })).toHaveLength(1)
  })
})
