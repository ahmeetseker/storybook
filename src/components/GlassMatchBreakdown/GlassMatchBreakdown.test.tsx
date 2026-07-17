import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassMatchBreakdown, type GlassMatchBreakdownGroup } from './GlassMatchBreakdown'

const groups: GlassMatchBreakdownGroup[] = [
  {
    id: 'konum',
    label: 'Konum tercihlerin',
    score: 88,
    weight: '%30',
    details: [
      { label: 'Metroya 5 dk', matched: true },
      { label: 'Sahil manzarası', matched: false },
    ],
  },
  {
    id: 'butce',
    label: 'Bütçe uyumu',
    score: 35,
    weight: '%25',
  },
]

describe('GlassMatchBreakdown', () => {
  it('genel skor için meter rolü + aria değer sözleşmesiyle render olur', () => {
    render(<GlassMatchBreakdown overall={84} groups={groups} />)
    const overallMeter = screen.getByRole('meter', { name: 'Genel Uyum' })
    expect(overallMeter.getAttribute('aria-valuemin')).toBe('0')
    expect(overallMeter.getAttribute('aria-valuemax')).toBe('100')
    expect(overallMeter.getAttribute('aria-valuenow')).toBe('84')
  })

  it('overall [0,100] aralığına clamp edilir; NaN/Infinity 0’a düşer', () => {
    const { unmount: u1 } = render(<GlassMatchBreakdown overall={140} groups={groups} />)
    expect(screen.getByRole('meter', { name: 'Genel Uyum' }).getAttribute('aria-valuenow')).toBe('100')
    u1()

    const { unmount: u2 } = render(<GlassMatchBreakdown overall={-30} groups={groups} />)
    expect(screen.getByRole('meter', { name: 'Genel Uyum' }).getAttribute('aria-valuenow')).toBe('0')
    u2()

    render(<GlassMatchBreakdown overall={NaN} groups={groups} />)
    expect(screen.getByRole('meter', { name: 'Genel Uyum' }).getAttribute('aria-valuenow')).toBe('0')
  })

  it('her grup kendi meter rolünü, skorunu ve otomatik ton eşiğini taşır', () => {
    render(<GlassMatchBreakdown overall={70} groups={groups} />)
    const konumMeter = screen.getByRole('meter', { name: /Konum tercihlerin/ })
    expect(konumMeter.getAttribute('aria-valuenow')).toBe('88')
    expect(konumMeter.dataset.tone).toBe('success')

    const butceMeter = screen.getByRole('meter', { name: /Bütçe uyumu/ })
    expect(butceMeter.getAttribute('aria-valuenow')).toBe('35')
    expect(butceMeter.dataset.tone).toBe('danger')
  })

  it('grup ağırlığı verilince accessible name içine dahil edilir, verilmezse yalnız etiket kullanılır', () => {
    render(<GlassMatchBreakdown overall={70} groups={groups} />)
    expect(screen.getByRole('meter', { name: 'Konum tercihlerin Ağırlık %30' })).toBeTruthy()
  })

  it('detay chip’leri matched/unmatched data-matched ile ayrışır ve eşleşme durumu görsel-gizli metinle iletilir', () => {
    render(<GlassMatchBreakdown overall={70} groups={groups} />)
    // Detay chip'leri de <li>, kapsayan grup satırı da <li> — yalnız
    // `data-matched` taşıyan yaprak öğeleri seçiyoruz (grup satırı taşımaz).
    const items = screen.getAllByRole('listitem').filter((li) => li.dataset.matched !== undefined)
    const matchedItem = items.find((li) => li.textContent?.includes('Metroya 5 dk'))
    const unmatchedItem = items.find((li) => li.textContent?.includes('Sahil manzarası'))
    expect(matchedItem?.dataset.matched).toBe('true')
    expect(unmatchedItem?.dataset.matched).toBe('false')
    expect(matchedItem?.textContent).toContain('(eşleşti)')
    expect(unmatchedItem?.textContent).toContain('(eşleşmedi)')
    expect(matchedItem?.querySelectorAll('[aria-hidden="true"]').length).toBe(1)
  })

  it('details verilmeyen grupta detay listesi hiç render edilmez', () => {
    render(<GlassMatchBreakdown overall={70} groups={groups} />)
    // "Bütçe uyumu" grubunun details'i yok — kendi altında <ul> olmamalı
    const butceMeter = screen.getByRole('meter', { name: /Bütçe uyumu/ })
    const groupLi = butceMeter.closest('li')
    expect(groupLi?.querySelector('ul')).toBeNull()
  })

  it('AI rozeti daima render edilir; confidence geçerliyse metin eklenir, sonlu değilse gizlenir', () => {
    const { unmount } = render(<GlassMatchBreakdown overall={70} groups={groups} confidence={87.6} />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.getByText('%88 güven')).toBeTruthy()
    unmount()

    render(<GlassMatchBreakdown overall={70} groups={groups} confidence={Infinity} />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.queryByText(/güven/)).toBeNull()
  })

  it('geri bildirim butonları onFeedback’i doğru yönle çağırır ve aria-pressed görsel seçimi işaretler (aynı yöne tekrar tıklama toggle-off yapar)', () => {
    const onFeedback = vi.fn()
    render(<GlassMatchBreakdown overall={70} groups={groups} onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })
    const down = screen.getByRole('button', { name: 'Faydalı değil' })
    expect(up.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(up)
    expect(onFeedback).toHaveBeenNthCalledWith(1, 'up')
    expect(up.getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(down)
    expect(onFeedback).toHaveBeenNthCalledWith(2, 'down')
    expect(down.getAttribute('aria-pressed')).toBe('true')
    expect(up.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(down)
    expect(onFeedback).toHaveBeenNthCalledWith(3, 'down')
    expect(down.getAttribute('aria-pressed')).toBe('false')
  })

  it('onFeedback verilmezse geri bildirim butonları hiç render edilmez', () => {
    render(<GlassMatchBreakdown overall={70} groups={groups} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('regresyon: overall/groups değişince geri bildirim seçimi sıfırlanır, aynı içerikte korunur', () => {
    const onFeedback = vi.fn()
    const { rerender } = render(<GlassMatchBreakdown overall={70} groups={groups} onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })
    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')

    // Aynı içerikle (yeni ama eşdeğer dizi referansı) tekrar render — seçim korunmalı
    rerender(<GlassMatchBreakdown overall={70} groups={[...groups]} onFeedback={onFeedback} />)
    expect(screen.getByRole('button', { name: 'Faydalı' }).getAttribute('aria-pressed')).toBe('true')

    // overall gerçekten değişince seçim sıfırlanmalı
    rerender(<GlassMatchBreakdown overall={91} groups={groups} onFeedback={onFeedback} />)
    expect(screen.getByRole('button', { name: 'Faydalı' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('loading=true iken meter/grup/feedback yerine skeleton render edilir; role=status metniyle duyurulur', () => {
    render(<GlassMatchBreakdown overall={70} title="Uyum" groups={groups} onFeedback={vi.fn()} loading />)
    expect(screen.queryByRole('meter')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByText('Konum tercihlerin')).toBeNull()
    expect(screen.getByRole('status').textContent).toBe('Uyum hesaplanıyor')
  })

  it('regresyon: loading=true iken zorunlu AI rozeti yine görünür kalır; loading=false olunca role=status "hazır" metnine döner (boşalmaz)', () => {
    const { rerender } = render(<GlassMatchBreakdown overall={70} title="Uyum" groups={groups} confidence={90} loading />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.queryByText(/güven/)).toBeNull()
    const status = screen.getByRole('status')
    expect(status.textContent).toBe('Uyum hesaplanıyor')

    rerender(<GlassMatchBreakdown overall={70} title="Uyum" groups={groups} confidence={90} />)
    // Aynı düğüm mount kalmalı; metin BOŞALMAZ, tamamlanma açıkça "hazır"
    // metniyle duyurulur — yalnız "yükleniyor" duyurup tamamlanmayı hiç
    // duyurmamak durum geçişini bazı ekranokuyucularda güvenilmez kılar
    // (Codex bulgusu).
    expect(screen.getByRole('status')).toBe(status)
    expect(status.textContent).toBe('Uyum hazır')
  })

  it('groups boş dizi verilince grup listesi hiç render edilmez, genel satır yine görünür', () => {
    render(<GlassMatchBreakdown overall={55} groups={[]} />)
    expect(screen.getByRole('meter', { name: 'Genel Uyum' })).toBeTruthy()
    expect(screen.queryAllByRole('listitem').length).toBe(0)
  })

  it('regresyon: eşleşmeyen detay chip metni element-genelinde opacity ile soldurulmaz (WCAG AA kontrast)', () => {
    const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'GlassMatchBreakdown.module.css')
    const css = readFileSync(cssPath, 'utf-8')
    const unmatchedBlockMatch = css.match(/\.detail\[data-matched='false'\]\s*\{([^}]*)\}/)
    expect(unmatchedBlockMatch).not.toBeNull()
    expect(unmatchedBlockMatch![1]).not.toMatch(/opacity\s*:/)
  })

  it('regresyon: AI rozeti CSS bloğu kontrat ölçülerine (GlassMatchScore .aiBadge) hizalı', () => {
    const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'GlassMatchBreakdown.module.css')
    const css = readFileSync(cssPath, 'utf-8')
    const badgeBlockMatch = css.match(/\.aiBadge\s*\{([^}]*)\}/)
    expect(badgeBlockMatch).not.toBeNull()
    const block = badgeBlockMatch![1]
    expect(block).toMatch(/padding:\s*3px var\(--lg-space-2\)/)
    expect(block).toMatch(/letter-spacing:\s*0\.02em/)
    expect(block).toMatch(/font-size:\s*10\.5px/)
    expect(block).toMatch(/font-weight:\s*700/)
  })

  it('regresyon: children prop tipinden açıkça omit edilir (public HTMLAttributes yüzeyi children taşımaz)', () => {
    // Tip seviyesinde omit edildiği için normal kullanımda TS derlemesi
    // `children` geçirilmesine izin vermez. Bir çağıran yine de zorla
    // (`as any`) geçirirse component kendi sabit JSX ağacını render eder —
    // dışarıdan gelen children sessizce yutulmaz, hiç kabul edilmediği
    // için render sonucu tamamen component'in kendi içeriğidir.
    render(
      <GlassMatchBreakdown
        overall={70}
        groups={groups}
        {...({ children: 'dışarıdan-children-metni' } as Record<string, unknown>)}
      />,
    )
    expect(screen.queryByText('dışarıdan-children-metni')).toBeNull()
    expect(screen.getByRole('meter', { name: 'Genel Uyum' })).toBeTruthy()
  })

  it('regresyon: grup ve detay listeleri role="list" taşır (Safari/VoiceOver list-style:none semantik kaybına karşı)', () => {
    render(<GlassMatchBreakdown overall={70} groups={groups} />)
    const lists = screen.getAllByRole('list')
    // Konum grubunun detay listesi + grup listesinin kendisi → en az 2 liste
    expect(lists.length).toBeGreaterThanOrEqual(2)
  })

  it('regresyon: geri bildirim buton grubu role="group" + aria-labelledby ile görünür soruya bağlanır', () => {
    render(<GlassMatchBreakdown overall={70} groups={groups} onFeedback={vi.fn()} />)
    const group = screen.getByRole('group', { name: 'Bu döküm faydalı mıydı?' })
    expect(group.querySelectorAll('button').length).toBe(2)
  })

  it('regresyon: eşleşme işareti ve eşleşmeyen metin/işareti WCAG AA eşiklerini kaçıran ham token yerine koyulaştırılmış color-mix kullanır', () => {
    const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'GlassMatchBreakdown.module.css')
    const css = readFileSync(cssPath, 'utf-8')

    // Eşleşen ikon: ham `--lg-success` (~2:1) yerine ≥3:1 sağlayan label ile
    // koyulaştırılmış türev.
    const matchedIconBlock = css.match(/\.detail\[data-matched='true'\] \.detailIcon\s*\{([^}]*)\}/)
    expect(matchedIconBlock).not.toBeNull()
    expect(matchedIconBlock![1]).toMatch(/color-mix\(in srgb, var\(--lg-success\) 68%, var\(--lg-label\)\)/)
    expect(matchedIconBlock![1]).not.toMatch(/color:\s*var\(--lg-success\);/)

    // Eşleşmeyen metin: ham `--lg-label-secondary` (~4.23:1) yerine ≥4.5:1
    // sağlayan label ile koyulaştırılmış türev.
    const unmatchedBlock = css.match(/\.detail\[data-matched='false'\]\s*\{([^}]*)\}/)
    expect(unmatchedBlock).not.toBeNull()
    expect(unmatchedBlock![1]).toMatch(/color-mix\(in srgb, var\(--lg-label-secondary\) 65%, var\(--lg-label\)\)/)
    expect(unmatchedBlock![1]).not.toMatch(/color:\s*var\(--lg-label-secondary\);/)
  })
})
