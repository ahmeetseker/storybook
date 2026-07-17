import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { GlassCompareBar, type GlassCompareBarItem } from './GlassCompareBar'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'
import styles from './GlassCompareBar.module.css'

// GlassButton (Karşılaştır) GlassSurface kullanır — GlassTierProvider sarmalayıcısı gerekli.
const renderBar = (props: Partial<ComponentProps<typeof GlassCompareBar>> & { items: GlassCompareBarItem[] }) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassCompareBar onRemove={vi.fn()} onCompare={vi.fn()} {...props} />
    </GlassTierProvider>,
  )

const twoItems: GlassCompareBarItem[] = [
  { id: 'ilan-1', title: 'Kadıköy Caddebostan Deniz Manzaralı 3+1', image: 'data:image/svg+xml,a' },
  { id: 'ilan-2', title: 'Beşiktaş Levent Ofis Katı 2+1' },
]

describe('GlassCompareBar — görünürlük', () => {
  it('items boşken hiçbir şey render edilmez (role="region" yok)', () => {
    renderBar({ items: [] })
    expect(screen.queryByRole('region', { name: 'Karşılaştırma tepsisi' })).toBeNull()
  })

  it('items doluyken role="region" + aria-label ile tepsi render edilir, her ilanın başlığı görünür', () => {
    renderBar({ items: twoItems })
    const region = screen.getByRole('region', { name: 'Karşılaştırma tepsisi' })
    expect(within(region).getByText('Kadıköy Caddebostan Deniz Manzaralı 3+1')).toBeTruthy()
    expect(within(region).getByText('Beşiktaş Levent Ofis Katı 2+1')).toBeTruthy()
  })

  it('image verilen kart <img alt=""> render eder, verilmeyen kart dekoratif yer tutucu simge gösterir', () => {
    const { container } = renderBar({ items: twoItems })
    const images = container.querySelectorAll('img')
    // Yalnız `image` verilen ilk ilan gerçek <img> üretir; alt metni boş (dekoratif).
    expect(images.length).toBe(1)
    expect(images[0].getAttribute('alt')).toBe('')
    expect(images[0].getAttribute('src')).toContain('data:image/svg+xml')
    // İkinci (görselsiz) ilan dekoratif SVG yer tutucu ile temsil edilir.
    expect(container.querySelectorAll('svg').length).toBe(1)
  })
})

describe('GlassCompareBar — kaldırma', () => {
  it('kaldır butonu ilan başlığını içeren erişilebilir isim taşır ve tıklanınca onRemove doğru id ile çağrılır', () => {
    const onRemove = vi.fn()
    renderBar({ items: twoItems, onRemove })
    fireEvent.click(screen.getByRole('button', { name: 'Karşılaştırmadan çıkar: Kadıköy Caddebostan Deniz Manzaralı 3+1' }))
    expect(onRemove).toHaveBeenCalledWith('ilan-1')
  })

  it('bir ilan kaldırılıp liste güncellenince odak kalan ilk kaldırma butonuna taşınır', () => {
    const { rerender } = renderBar({ items: twoItems })
    fireEvent.click(
      screen.getByRole('button', { name: 'Karşılaştırmadan çıkar: Kadıköy Caddebostan Deniz Manzaralı 3+1' }),
    )
    rerender(
      <GlassTierProvider tier="fallback">
        <GlassCompareBar items={[twoItems[1]]} onRemove={vi.fn()} onCompare={vi.fn()} />
      </GlassTierProvider>,
    )
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Karşılaştırmadan çıkar: Beşiktaş Levent Ofis Katı 2+1' }),
    )
  })
})

describe('GlassCompareBar — Karşılaştır eylemi', () => {
  it('tek ilanla (N<2) "Karşılaştır (1)" butonu disabled olur ve "En az 2 ilan seç" ipucu görünür', () => {
    renderBar({ items: [twoItems[0]] })
    const button = screen.getByRole('button', { name: 'Karşılaştır (1)' })
    expect(button.hasAttribute('disabled')).toBe(true)
    expect(screen.getByText('En az 2 ilan seç')).toBeTruthy()
  })

  it('iki ve daha fazla ilanla buton etkinleşir, ipucu görünmez, tıklama onCompare çağırır', () => {
    const onCompare = vi.fn()
    renderBar({ items: twoItems, onCompare })
    const button = screen.getByRole('button', { name: 'Karşılaştır (2)' })
    expect(button.hasAttribute('disabled')).toBe(false)
    expect(screen.queryByText('En az 2 ilan seç')).toBeNull()
    fireEvent.click(button)
    expect(onCompare).toHaveBeenCalledTimes(1)
  })

  it('maxItems aşıldığında (varsayılan 4) buton disabled olur + "En fazla 4 ilan karşılaştırılabilir" ipucu görünür, AMA hiçbir ilan gizlenmez', () => {
    const fiveItems: GlassCompareBarItem[] = Array.from({ length: 5 }, (_, i) => ({
      id: `ilan-${i}`,
      title: `İlan ${i}`,
    }))
    renderBar({ items: fiveItems })
    expect(screen.getByRole('button', { name: 'Karşılaştır (5)' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByText('En fazla 4 ilan karşılaştırılabilir')).toBeTruthy()
    fiveItems.forEach((item) => expect(screen.getByText(item.title)).toBeTruthy())
  })

  it('geçersiz maxItems (ör. 0) sessizce varsayılan 4\'e döner — 3 ilan aşım ipucu göstermez', () => {
    const threeItems: GlassCompareBarItem[] = [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
      { id: 'c', title: 'C' },
    ]
    renderBar({ items: threeItems, maxItems: 0 })
    expect(screen.getByRole('button', { name: 'Karşılaştır (3)' }).hasAttribute('disabled')).toBe(false)
    expect(screen.queryByText(/En fazla/)).toBeNull()
  })

  // Regresyon: kontrast bulgusu (semantik uyarı rengi doğrudan ipucu METNİNE
  // karışıyordu, Kağıt temada AA'nın altına düşüyordu — bkz. rules.md §11).
  // Düzeltme: metin her zaman `.hint` sınıfını (salt `--lg-label-secondary`)
  // taşır; `--lg-warning` yalnız dekoratif, `aria-hidden` bir `.hintDot`
  // üzerinde yaşar. Bu test o ayrımın regresyona uğramadığını doğrular.
  it('maxItems aşımında semantik uyarı rengi metne değil dekoratif bir noktaya uygulanır', () => {
    const fiveItems: GlassCompareBarItem[] = Array.from({ length: 5 }, (_, i) => ({
      id: `ilan-${i}`,
      title: `İlan ${i}`,
    }))
    renderBar({ items: fiveItems })
    const hint = screen.getByText('En fazla 4 ilan karşılaştırılabilir').closest(`.${styles.hint}`)
    expect(hint).toBeTruthy()
    // İpucu metni her koşulda aynı (yalnız label tabanlı) sınıfı taşır —
    // uyarı durumu için ayrı/renkli bir metin sınıfı YOKTUR.
    expect(hint?.className).toBe(styles.hint)
    const dot = hint?.querySelector(`.${styles.hintDot}`)
    expect(dot).toBeTruthy()
    expect(dot?.getAttribute('aria-hidden')).toBe('true')
  })

  it('N<2 ipucunda (renk semantiği gerekmez) uyarı noktası render edilmez', () => {
    renderBar({ items: [twoItems[0]] })
    const hint = screen.getByText('En az 2 ilan seç').closest(`.${styles.hint}`)
    expect(hint?.querySelector(`.${styles.hintDot}`)).toBeNull()
  })
})

describe('GlassCompareBar — Temizle', () => {
  it('onClear verilmezse "Temizle" butonu render edilmez', () => {
    renderBar({ items: twoItems })
    expect(screen.queryByRole('button', { name: 'Temizle' })).toBeNull()
  })

  it('onClear verilirse "Temizle" butonu render edilir ve tıklama onClear\'ı çağırır', () => {
    const onClear = vi.fn()
    renderBar({ items: twoItems, onClear })
    fireEvent.click(screen.getByRole('button', { name: 'Temizle' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
