import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import {
  CodexBreadcrumb,
  CodexDrawer,
  CodexMenu,
  CodexModal,
  CodexPagination,
  CodexPopover,
  CodexSidebar,
  CodexToast,
  CodexToolbar,
  CodexToolbarGroup,
} from './index'

describe('Codex enterprise navigation', () => {
  it('Breadcrumb landmark, sıralı liste, current page ve erişilebilir daraltma üretir', () => {
    render(
      <CodexBreadcrumb
        maxItems={3}
        items={[
          { label: 'Ana sayfa', href: '/ana' },
          { label: 'Emlak', href: '/emlak' },
          { label: 'Satılık', href: '/satilik' },
          { label: 'İzmir', href: '/izmir' },
          { label: 'Urla' },
        ]}
      />,
    )

    const breadcrumb = screen.getByRole('navigation', { name: 'Sayfa yolu' })
    expect(within(breadcrumb).getByRole('list').tagName).toBe('OL')
    expect(within(breadcrumb).getByText('Urla').getAttribute('aria-current')).toBe('page')
    expect(within(breadcrumb).queryByText('Emlak')).toBeNull()

    fireEvent.click(within(breadcrumb).getByRole('button', { name: '3 gizli seviyeyi göster' }))
    expect(within(breadcrumb).getByRole('link', { name: 'Emlak' }).getAttribute('href')).toBe('/emlak')
    expect(within(breadcrumb).getByRole('link', { name: 'Satılık' })).toBeTruthy()
  })

  it('Pagination uncontrolled sayfayı değiştirir, callback çağırır ve sınırları devre dışı bırakır', () => {
    const onPageChange = vi.fn()
    render(<CodexPagination pageCount={8} defaultPage={3} onPageChange={onPageChange} />)

    const pagination = screen.getByRole('navigation', { name: 'Sayfalama' })
    expect(within(pagination).getByRole('button', { name: '3. sayfaya git' }).getAttribute('aria-current')).toBe('page')

    fireEvent.click(within(pagination).getByRole('button', { name: '5. sayfaya git' }))
    expect(onPageChange).toHaveBeenCalledWith(5)
    expect(within(pagination).getByRole('button', { name: '5. sayfaya git' }).getAttribute('aria-current')).toBe('page')

    fireEvent.click(within(pagination).getByRole('button', { name: 'Sonraki sayfa' }))
    expect(onPageChange).toHaveBeenLastCalledWith(6)
  })

  it('Toolbar tek tab durağı ve yön/Home/End klavye gezinmesi kurar', () => {
    render(
      <CodexToolbar label="İlan araçları">
        <CodexToolbarGroup label="Görünüm">
          <button type="button">Liste</button>
          <button type="button">Harita</button>
        </CodexToolbarGroup>
        <CodexToolbarGroup label="İşlemler" separated>
          <button type="button">Dışa aktar</button>
        </CodexToolbarGroup>
      </CodexToolbar>,
    )

    const toolbar = screen.getByRole('toolbar', { name: 'İlan araçları' })
    const buttons = within(toolbar).getAllByRole('button')
    expect(buttons.map((button) => button.tabIndex)).toEqual([0, -1, -1])

    buttons[0].focus()
    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[1])
    fireEvent.keyDown(buttons[1], { key: 'End' })
    expect(document.activeElement).toBe(buttons[2])
    fireEvent.keyDown(buttons[2], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[0])
  })

  it('Toolbar içindeki açılır menünün kendi odak modeline müdahale etmez', async () => {
    render(
      <CodexToolbar label="İlan araçları">
        <button type="button">Filtrele</button>
        <CodexMenu trigger="Diğer" items={[
          { id: 'edit', label: 'Düzenle' },
          { id: 'archive', label: 'Arşivle' },
        ]} />
      </CodexToolbar>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Diğer' }))
    const firstMenuItem = screen.getByRole('menuitem', { name: 'Düzenle' })
    await waitFor(() => expect(document.activeElement).toBe(firstMenuItem))
    expect(firstMenuItem.tabIndex).toBe(-1)
  })

  it('Sidebar active ve collapsed state’lerini yönetir; mobil panel Escape ile kapanır', async () => {
    const onActiveChange = vi.fn()
    const onMobileOpenChange = vi.fn()
    render(
      <CodexSidebar
        defaultActiveId="overview"
        onActiveChange={onActiveChange}
        onMobileOpenChange={onMobileOpenChange}
        sections={[{
          id: 'main',
          label: 'Çalışma alanı',
          items: [
            { id: 'overview', label: 'Genel bakış' },
            { id: 'listings', label: 'İlanlarım', children: [{ id: 'drafts', label: 'Taslaklar' }] },
          ],
        }]}
      />,
    )

    const nav = screen.getByRole('navigation', { name: 'Hesap navigasyonu' })
    expect(within(nav).getByRole('button', { name: 'Genel bakış' }).getAttribute('aria-current')).toBe('page')
    fireEvent.click(within(nav).getByRole('button', { name: 'Taslaklar' }))
    expect(onActiveChange).toHaveBeenCalledWith('drafts')
    expect(within(nav).getByRole('button', { name: 'Taslaklar' }).getAttribute('aria-current')).toBe('page')

    const collapse = screen.getByRole('button', { name: 'Kenar çubuğunu daralt' })
    fireEvent.click(collapse)
    expect(screen.getByRole('button', { name: 'Kenar çubuğunu genişlet' }).getAttribute('aria-pressed')).toBe('true')

    const mobileTrigger = screen.getByRole('button', { name: 'Gezinmeyi aç' })
    fireEvent.click(mobileTrigger)
    expect(onMobileOpenChange).toHaveBeenLastCalledWith(true)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onMobileOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(document.activeElement).toBe(mobileTrigger))
  })

  it('Menu tetikleyici, menü semantiği, ok tuşları, seçim ve Escape odak iadesi sağlar', async () => {
    const onSelect = vi.fn()
    render(
      <CodexMenu
        trigger="İşlemler"
        items={[
          { id: 'edit', label: 'Düzenle', onSelect },
          { id: 'copy', label: 'Kopyala' },
          { id: 'separator', type: 'separator' },
          { id: 'archive', label: 'Arşivle', danger: true },
        ]}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'İşlemler' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const menu = screen.getByRole('menu', { name: 'İşlem menüsü' })
    const items = within(menu).getAllByRole('menuitem')
    await waitFor(() => expect(document.activeElement).toBe(items[0]))

    fireEvent.keyDown(items[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
    fireEvent.keyDown(items[1], { key: 'End' })
    expect(document.activeElement).toBe(items[2])
    fireEvent.keyDown(items[2], { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(trigger))

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Düzenle' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('Popover dialog ilişkisini kurar, dış tık ve Escape ile kontrollü kapanır', async () => {
    const onOpenChange = vi.fn()
    render(
      <CodexPopover trigger="AI fiyat görüşü" title="Fiyat sinyali" description="38 ilan üzerinden" onOpenChange={onOpenChange}>
        <button type="button">Raporu aç</button>
      </CodexPopover>,
    )

    const trigger = screen.getByRole('button', { name: 'AI fiyat görüşü' })
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Fiyat sinyali' })
    expect(dialog.getAttribute('aria-modal')).toBe('false')
    expect(within(dialog).getByText('38 ilan üzerinden')).toBeTruthy()
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Bilgi penceresini kapat' })))

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(trigger))

    fireEvent.click(trigger)
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('Modal aria-modal, focus trap, backdrop tercihi, Escape ve odak iadesini uygular', async () => {
    const onOpenChange = vi.fn()
    render(
      <CodexModal
        title="İlanı yayınla"
        description="Son kontrolleri doğrulayın."
        triggerLabel="Yayın penceresini aç"
        onOpenChange={onOpenChange}
        footer={<button type="button">Şimdi yayınla</button>}
      >
        <button type="button">Önizlemeyi aç</button>
      </CodexModal>,
    )

    const trigger = screen.getByRole('button', { name: 'Yayın penceresini aç' })
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'İlanı yayınla' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
    const buttons = within(dialog).getAllByRole('button')
    await waitFor(() => expect(document.activeElement).toBe(buttons[0]))

    buttons[buttons.length - 1].focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(buttons[0])
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('Drawer yön bilgisini taşır ve close kontrolüyle state’i kapatır', () => {
    const onOpenChange = vi.fn()
    render(
      <CodexDrawer side="start" defaultOpen title="Gelişmiş filtreler" onOpenChange={onOpenChange}>
        <label>Minimum fiyat<input /></label>
      </CodexDrawer>,
    )

    const drawer = screen.getByRole('dialog', { name: 'Gelişmiş filtreler' })
    expect(drawer.getAttribute('data-side')).toBe('start')
    expect(within(drawer).getByRole('textbox', { name: 'Minimum fiyat' })).toBeTruthy()
    fireEvent.click(within(drawer).getByRole('button', { name: 'Paneli kapat' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('Toast role/tone sözleşmesini, aksiyonu ve kontrollü kapatmayı uygular', () => {
    const onAction = vi.fn()
    const onDismiss = vi.fn()
    const onVisibleChange = vi.fn()
    render(
      <CodexToast
        tone="danger"
        title="Fotoğraflar yüklenemedi"
        actionLabel="Tekrar dene"
        onAction={onAction}
        onDismiss={onDismiss}
        onVisibleChange={onVisibleChange}
      >
        Taslağınız korundu.
      </CodexToast>,
    )

    const toast = screen.getByRole('alert')
    expect(toast.getAttribute('aria-live')).toBe('assertive')
    fireEvent.click(within(toast).getByRole('button', { name: 'Tekrar dene' }))
    expect(onAction).toHaveBeenCalledTimes(1)

    fireEvent.click(within(toast).getByRole('button', { name: 'Bildirimi kapat' }))
    expect(onVisibleChange).toHaveBeenCalledWith(false)
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
