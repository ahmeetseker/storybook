import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassMediaGallery, type GlassMediaGalleryItem } from './GlassMediaGallery'

const items: GlassMediaGalleryItem[] = [
  { type: 'image', src: 'data:image/svg+xml,salon', alt: 'Salon', label: 'Salon' },
  { type: 'image', src: 'data:image/svg+xml,mutfak', alt: 'Mutfak', label: 'Mutfak' },
  { type: 'video', src: 'https://example.com/video.mp4', poster: 'data:image/svg+xml,poster', label: 'Tanıtım Videosu' },
  { type: 'floorPlan', src: 'data:image/svg+xml,plan', alt: 'Kat planı', label: 'Kat Planı' },
  { type: 'tour360', src: 'https://example.com/tur', alt: '360° sanal tur', label: 'Sanal Tur' },
]

describe('GlassMediaGallery', () => {
  it('kök bölge role="region" ile adlandırılır ve ilk medyayı gösterir', () => {
    render(<GlassMediaGallery items={items} label="Test galerisi" />)
    expect(screen.getByRole('region', { name: 'Test galerisi' })).toBeDefined()
    expect(screen.getByAltText('Salon')).toBeDefined()
    expect(screen.getByText('1 / 5')).toBeDefined()
  })

  it('thumbnail tıklaması sahneyi değiştirir ve aria-current güncellenir', () => {
    render(<GlassMediaGallery items={items} />)
    const thumb = screen.getByRole('button', { name: '2. medyaya git: Mutfak' })
    fireEvent.click(thumb)
    expect(screen.getByAltText('Mutfak')).toBeDefined()
    expect(thumb.getAttribute('aria-current')).toBe('true')
    expect(screen.getByText('2 / 5')).toBeDefined()
  })

  it('video: controls açık, autoplay yok, poster ayarlı', () => {
    render(<GlassMediaGallery items={items} />)
    fireEvent.click(screen.getByRole('button', { name: '3. medyaya git: Tanıtım Videosu' }))
    const video = document.querySelector('video')
    expect(video).not.toBeNull()
    expect(video?.hasAttribute('controls')).toBe(true)
    expect(video?.hasAttribute('autoplay')).toBe(false)
    expect(video?.getAttribute('poster')).toBe('data:image/svg+xml,poster')
  })

  it('video: aria-label ile programatik olarak adlandırılır ve caption track render edilir', () => {
    const withTracks: GlassMediaGalleryItem[] = [
      {
        type: 'video',
        src: 'https://example.com/video.mp4',
        poster: 'data:image/svg+xml,poster',
        label: 'Tanıtım Videosu',
        tracks: [{ src: 'https://example.com/video.tr.vtt', srclang: 'tr', label: 'Türkçe', kind: 'captions' }],
      },
    ]
    render(<GlassMediaGallery items={withTracks} />)
    const video = document.querySelector('video')
    expect(video?.getAttribute('aria-label')).toBe('Tanıtım Videosu')
    const track = video?.querySelector('track')
    expect(track).not.toBeNull()
    expect(track?.getAttribute('src')).toBe('https://example.com/video.tr.vtt')
    expect(track?.getAttribute('srclang')).toBe('tr')
    expect(track?.getAttribute('label')).toBe('Türkçe')
    expect(track?.getAttribute('kind')).toBe('captions')
  })

  it('video: tracks verilmezse ve label yoksa aria-label alt sonra jenerik metne düşer', () => {
    const noLabelVideo: GlassMediaGalleryItem[] = [{ type: 'video', src: 'https://example.com/video.mp4' }]
    render(<GlassMediaGallery items={noLabelVideo} />)
    const video = document.querySelector('video')
    expect(video?.getAttribute('aria-label')).toBe('İlan videosu')
    expect(video?.querySelector('track')).toBeNull()
  })

  it('tour360: sandbox ve zorunlu title ile iframe render eder', () => {
    render(<GlassMediaGallery items={items} />)
    fireEvent.click(screen.getByRole('button', { name: '5. medyaya git: Sanal Tur' }))
    const iframe = screen.getByTitle('360° sanal tur')
    expect(iframe.tagName).toBe('IFRAME')
    expect(iframe.hasAttribute('sandbox')).toBe(true)
  })

  it('floorPlan ve image türleri <img> olarak render edilir', () => {
    render(<GlassMediaGallery items={items} />)
    fireEvent.click(screen.getByRole('button', { name: '4. medyaya git: Kat Planı' }))
    expect(screen.getByAltText('Kat planı').tagName).toBe('IMG')
  })

  it('tabbed varyantı yalnız dolu türler için sekme gösterir', () => {
    const sadeceGorsel = items.filter((item) => item.type === 'image')
    render(<GlassMediaGallery items={sadeceGorsel} variant="tabbed" />)
    expect(screen.getByRole('tab', { name: /Fotoğraflar/ })).toBeDefined()
    expect(screen.queryByRole('tab', { name: /Video/ })).toBeNull()
    expect(screen.queryByRole('tab', { name: /Sanal Tur/ })).toBeNull()
  })

  it('tabbed varyantında sekme değişince panel içeriği değişir', () => {
    render(<GlassMediaGallery items={items} variant="tabbed" />)
    const videoTab = screen.getByRole('tab', { name: /Video/ })
    fireEvent.click(videoTab)
    expect(videoTab.getAttribute('aria-selected')).toBe('true')
    expect(document.querySelector('video')).not.toBeNull()
  })

  it('thumbnail rozetleri türe göre doğru gösterilir (▶ video, 360° tur, PLAN kat planı, image rozetsiz)', () => {
    render(<GlassMediaGallery items={items} />)
    expect(screen.getByRole('button', { name: '1. medyaya git: Salon' }).textContent).not.toMatch(/▶|360°|PLAN/)
    expect(screen.getByRole('button', { name: '3. medyaya git: Tanıtım Videosu' }).textContent).toContain('▶')
    expect(screen.getByRole('button', { name: '4. medyaya git: Kat Planı' }).textContent).toContain('PLAN')
    expect(screen.getByRole('button', { name: '5. medyaya git: Sanal Tur' }).textContent).toContain('360°')
  })

  it('tabbed varyantında ok tuşuyla sekme gezinmesi roving tabindex ile çalışır', () => {
    render(<GlassMediaGallery items={items} variant="tabbed" />)
    const photoTab = screen.getByRole('tab', { name: /Fotoğraflar/ })
    const videoTab = screen.getByRole('tab', { name: /Video/ })
    expect(photoTab.getAttribute('tabindex')).toBe('0')
    expect(videoTab.getAttribute('tabindex')).toBe('-1')

    fireEvent.keyDown(photoTab, { key: 'ArrowRight' })
    expect(videoTab.getAttribute('aria-selected')).toBe('true')
    expect(videoTab.getAttribute('tabindex')).toBe('0')
    expect(photoTab.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(videoTab)
  })

  it('tek öğede thumbnail şeridi ve sayaç gizlenir', () => {
    render(<GlassMediaGallery items={[items[0]]} />)
    expect(screen.queryByText('1 / 1')).toBeNull()
    expect(screen.queryByRole('button', { name: /medyaya git/ })).toBeNull()
  })

  it('boş items dizisinde hiçbir şey render etmez', () => {
    const { container } = render(<GlassMediaGallery items={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
