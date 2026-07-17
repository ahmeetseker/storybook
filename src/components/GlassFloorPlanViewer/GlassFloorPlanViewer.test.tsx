import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassFloorPlanViewer, type GlassFloorPlanPlan, type GlassFloorPlanViewerProps } from './GlassFloorPlanViewer'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const plans: GlassFloorPlanPlan[] = [
  {
    label: 'Zemin Kat',
    src: 'data:image/svg+xml,zemin-kat',
    hotspots: [{ x: 0.3, y: 0.4, label: 'Salon' }],
  },
  {
    label: '1. Kat',
    src: 'data:image/svg+xml,birinci-kat',
    hotspots: [{ x: 0.5, y: 0.5, label: 'Yatak Odası' }],
  },
]

const renderViewer = (props: Partial<GlassFloorPlanViewerProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassFloorPlanViewer plans={plans} {...props} />
    </GlassTierProvider>,
  )

describe('GlassFloorPlanViewer', () => {
  it('ilk kat varsayılan seçilidir ve ilgili görsel render olur', () => {
    renderViewer()
    expect(screen.getByRole('tab', { name: 'Zemin Kat' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('img', { name: 'Zemin Kat kat planı' })).toBeDefined()
  })

  it('kat sekmesine tıklayınca görsel değişir ve onActiveIndexChange doğru index ile çağrılır', () => {
    const onActiveIndexChange = vi.fn()
    renderViewer({ onActiveIndexChange })
    fireEvent.click(screen.getByRole('tab', { name: '1. Kat' }))
    expect(onActiveIndexChange).toHaveBeenCalledWith(1)
    expect(screen.getByRole('img', { name: '1. Kat kat planı' })).toBeDefined()
  })

  it('controlled activeIndex belirleyicidir — tıklama görseli değiştirmez', () => {
    renderViewer({ activeIndex: 1 })
    expect(screen.getByRole('img', { name: '1. Kat kat planı' })).toBeDefined()
    fireEvent.click(screen.getByRole('tab', { name: 'Zemin Kat' }))
    expect(screen.getByRole('img', { name: '1. Kat kat planı' })).toBeDefined()
  })

  it('hotspot tıklanınca etiket balonu açılır, tekrar tıklayınca kapanır', () => {
    renderViewer()
    const hotspot = screen.getByRole('button', { name: 'Salon' })
    expect(screen.queryByRole('tooltip')).toBeNull()
    fireEvent.click(hotspot)
    expect(screen.getByRole('tooltip').textContent).toBe('Salon')
    expect(hotspot.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(hotspot)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('yakınlaştır/uzaklaştır butonları erişilebilir isme sahiptir ve 1x–4x aralığında kıskaçlanır', () => {
    renderViewer()
    const zoomOutBtn = screen.getByRole('button', { name: 'Uzaklaştır' })
    const zoomInBtn = screen.getByRole('button', { name: 'Yakınlaştır' })
    expect(zoomOutBtn.hasAttribute('disabled')).toBe(true)
    for (let i = 0; i < 10; i++) fireEvent.click(zoomInBtn)
    expect(zoomInBtn.hasAttribute('disabled')).toBe(true)
    expect(screen.getByText('400%')).toBeDefined()
  })

  it('Sıfırla butonu yakınlaştırmayı başa döndürür', () => {
    renderViewer()
    fireEvent.click(screen.getByRole('button', { name: 'Yakınlaştır' }))
    expect(screen.getByText('150%')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Sıfırla' }))
    expect(screen.getByText('100%')).toBeDefined()
  })

  it('kat değişince yakınlaştırma otomatik sıfırlanır', () => {
    renderViewer()
    fireEvent.click(screen.getByRole('button', { name: 'Yakınlaştır' }))
    expect(screen.getByText('150%')).toBeDefined()
    fireEvent.click(screen.getByRole('tab', { name: '1. Kat' }))
    expect(screen.getByText('100%')).toBeDefined()
  })

  it('Ctrl+wheel görüntü alanında yakınlaştırır', () => {
    renderViewer()
    const viewport = screen.getByRole('tabpanel')
    fireEvent.wheel(viewport, { deltaY: -100, ctrlKey: true })
    expect(screen.getByText('150%')).toBeDefined()
  })

  it('düz wheel (Ctrl yok) yakınlaştırmayı değiştirmez', () => {
    renderViewer()
    const viewport = screen.getByRole('tabpanel')
    fireEvent.wheel(viewport, { deltaY: -100 })
    expect(screen.getByText('100%')).toBeDefined()
  })

  it('pointer sürüklemesi görseli kaydırır (translate değişir)', () => {
    renderViewer()
    const viewport = screen.getByRole('tabpanel')
    const imageWrap = viewport.firstElementChild as HTMLElement
    expect(imageWrap.style.transform).toContain('translate(0px, 0px)')
    fireEvent.pointerDown(viewport, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(viewport, { clientX: 140, clientY: 120, pointerId: 1 })
    fireEvent.pointerUp(viewport, { clientX: 140, clientY: 120, pointerId: 1 })
    expect(imageWrap.style.transform).toContain('translate(40px, 20px)')
  })

  it('farklı pointerId ile gelen ikinci pointer aktif sürüklemeyi bozmaz', () => {
    renderViewer()
    const viewport = screen.getByRole('tabpanel')
    const imageWrap = viewport.firstElementChild as HTMLElement

    // pointerId=1 sürüklemeyi başlatır
    fireEvent.pointerDown(viewport, { clientX: 100, clientY: 100, pointerId: 1 })
    // ikinci bir pointer (ör. multi-touch) devreye girer — yoksayılmalı, drag'i devralmamalı
    fireEvent.pointerDown(viewport, { clientX: 500, clientY: 500, pointerId: 2 })
    // pointerId=2'nin move'u sürükleneni etkilemez
    fireEvent.pointerMove(viewport, { clientX: 900, clientY: 900, pointerId: 2 })
    expect(imageWrap.style.transform).toContain('translate(0px, 0px)')
    // pointerId=1'in move'u normal şekilde uygulanır
    fireEvent.pointerMove(viewport, { clientX: 140, clientY: 120, pointerId: 1 })
    expect(imageWrap.style.transform).toContain('translate(40px, 20px)')
    // pointerId=2'nin up'ı aktif sürüklemeyi (pointerId=1) sonlandırmaz
    fireEvent.pointerUp(viewport, { clientX: 900, clientY: 900, pointerId: 2 })
    expect(viewport.getAttribute('data-dragging')).toBe('true')
    fireEvent.pointerMove(viewport, { clientX: 150, clientY: 130, pointerId: 1 })
    expect(imageWrap.style.transform).toContain('translate(50px, 30px)')
    // doğru pointerId ile up gelince sürükleme gerçekten sona erer
    fireEvent.pointerUp(viewport, { clientX: 150, clientY: 130, pointerId: 1 })
    expect(viewport.hasAttribute('data-dragging')).toBe(false)
  })

  it('lostpointercapture aktif sürüklemeyi temizler', () => {
    renderViewer()
    const viewport = screen.getByRole('tabpanel')
    const imageWrap = viewport.firstElementChild as HTMLElement

    fireEvent.pointerDown(viewport, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(viewport, { clientX: 140, clientY: 120, pointerId: 1 })
    expect(viewport.getAttribute('data-dragging')).toBe('true')

    fireEvent.lostPointerCapture(viewport, { pointerId: 1 })
    expect(viewport.hasAttribute('data-dragging')).toBe(false)

    // capture kaybından sonra aynı pointerId ile gelen move artık pan'i değiştirmemeli
    fireEvent.pointerMove(viewport, { clientX: 300, clientY: 300, pointerId: 1 })
    expect(imageWrap.style.transform).toContain('translate(40px, 20px)')
  })

  it('sürükleme ortasında kat değişince drag state sızmaz', () => {
    renderViewer()
    const viewport = screen.getByRole('tabpanel')

    fireEvent.pointerDown(viewport, { clientX: 100, clientY: 100, pointerId: 1 })
    expect(viewport.getAttribute('data-dragging')).toBe('true')

    // pointerup/lostpointercapture hiç gelmeden kat değişir (ör. sekmeye tıklanır)
    fireEvent.click(screen.getByRole('tab', { name: '1. Kat' }))
    expect(viewport.hasAttribute('data-dragging')).toBe(false)

    // yeni kattaki aynı pointerId'li move artık eski sürüklemeyi devam ettirmemeli
    const imageWrapAfter = viewport.firstElementChild as HTMLElement
    fireEvent.pointerMove(viewport, { clientX: 400, clientY: 400, pointerId: 1 })
    expect(imageWrapAfter.style.transform).toContain('translate(0px, 0px)')
  })

  it('kat planı görseli object-fit: contain kullanır (kırpma yasak — cover değil)', () => {
    const cssPath = resolve(
      process.cwd(),
      'src/components/GlassFloorPlanViewer/GlassFloorPlanViewer.module.css',
    )
    const cssText = readFileSync(cssPath, 'utf-8')
    expect(cssText).toContain('object-fit: contain')
    expect(cssText).not.toContain('object-fit: cover')
  })
})
