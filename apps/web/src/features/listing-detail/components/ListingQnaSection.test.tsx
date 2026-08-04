import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { OREN_LAND_LISTING } from '../data/listing-detail-fixtures'
import type { ListingQna, ListingQnaViewer } from '../domain/listing-detail-types'
import { ListingQnaSection } from './ListingQnaSection'

/**
 * Referans ilanın gerçek soru kaydı — uydurma veriyle test edilmez.
 *
 * Kaynak `loadListingDetail` DEĞİL ham fixture'dır: adapter görünürlük
 * kısıtlı yanıtları yükten siler (bkz. `redactQna`), oysa buradaki testlerin
 * konusu tam da bileşenin o yanıtlarla ne yaptığı. Ham kayıt, oturumu
 * doğrulanmış bir uç noktanın ilan sahibine döndüreceği şeyin karşılığıdır.
 */
async function fixtureQna(): Promise<ListingQna> {
  const qna = structuredClone(OREN_LAND_LISTING).qna
  if (!qna) throw new Error('soru kaydı bulunamadı')
  return qna
}

/** Fixture'daki ilan sahibi — gizlenmiş içeriği okuyabilen tek rol. */
const SAHIP: ListingQnaViewer = {
  signedIn: true,
  id: 'seller-1',
  label: 'Nur Y.',
  initials: 'NY',
  isOwner: true,
}

/** Fixture'da 'Son fiyat ne olur?' sorusunu soran alıcı. */
const SORAN: ListingQnaViewer = {
  signedIn: true,
  id: 'buyer-be',
  label: 'B. E.',
  initials: 'BE',
}

/** Yazışmanın tarafı olmayan, oturumu açık bir alıcı. */
const YABANCI: ListingQnaViewer = {
  signedIn: true,
  id: 'buyer-zz',
  label: 'Z. Z.',
  initials: 'ZZ',
}

/** Soru satırları — yanıtların `li`'leri sayıma karışmasın diye süzülür. */
function questionItems() {
  return screen.getAllByRole('listitem').filter((item) => item.dataset.part === 'entry')
}

function questionItem(text: string) {
  const found = questionItems().find((item) => item.textContent?.includes(text))
  if (!found) throw new Error(`soru bulunamadı: ${text}`)
  return found
}

describe('ListingQnaSection', () => {
  it('yanıtlı, yanıtsız ve sık sorulan kayıtları birlikte gösterir', async () => {
    render(<ListingQnaSection qna={await fixtureQna()} />)

    const section = screen.getByRole('region', { name: 'Sorular ve yanıtlar' })
    expect(section.getAttribute('data-listing-section')).toBe('qna')

    expect(screen.getByText('Parsele araçla giriş var mı, yol stabilize mi?')).toBeTruthy()
    expect(screen.getByText('A. D.')).toBeTruthy()
    expect(screen.getByText(/Stabilize yol parsel sınırına kadar geliyor/)).toBeTruthy()
    expect(screen.getAllByText('İlan sahibi').length).toBeGreaterThan(0)

    // Yanıtsız soru gizlenmez.
    expect(screen.getByText('Elektrik ve su aboneliği parsele çekilebiliyor mu?')).toBeTruthy()
    expect(screen.getByText('Henüz yanıtlanmadı')).toBeTruthy()

    expect(screen.getByText('Sık sorulan')).toBeTruthy()
    expect(screen.getByText(/genelde 4 saat içinde yanıtlıyor/)).toBeTruthy()
  })

  it('sık sorulan kayıt listenin başındadır', async () => {
    render(<ListingQnaSection qna={await fixtureQna()} />)

    const items = questionItems()
    expect(items).toHaveLength(5)
    expect(items[0].getAttribute('data-pinned')).toBe('true')
    expect(within(items[0]).getByText('Sık sorulan')).toBeTruthy()
    expect(items[1].getAttribute('data-pinned')).toBeNull()
  })

  // ── Avatar ────────────────────────────────────────────────────────
  it('avatar fotoğraf değil baş harf taşır ve rolü tonuyla söyler', async () => {
    const { container } = render(<ListingQnaSection qna={await fixtureQna()} viewer={SORAN} />)

    expect(container.querySelector('img')).toBeNull()

    const soru = questionItem('Son fiyat ne olur?')
    const avatar = soru.querySelector('[data-size="question"]')
    expect(avatar?.textContent).toBe('BE')
    // Görüntüleyenin kendi satırı: "self" tonunda ve künyesinde "Siz" var.
    expect(avatar?.getAttribute('data-kind')).toBe('self')
    expect(within(soru).getByText('Siz')).toBeTruthy()

    // Satıcının yanıtı satıcı tonundadır.
    const yol = questionItem('yol stabilize mi?')
    expect(yol.querySelector('[data-size="reply"]')?.getAttribute('data-kind')).toBe('seller')
  })

  // ── Katlama ───────────────────────────────────────────────────────
  it('çok yanıtlı soruda yalnız son cevap durur; sayı önceden yazılır', async () => {
    const user = userEvent.setup()
    render(<ListingQnaSection qna={await fixtureQna()} />)

    const soru = questionItem('Sizinle nasıl iletişim kurabilirim?')

    // Oturumu olmayan iki yanıt görür (üçüncüsü platform maskesi taşır).
    const ac = within(soru).getByRole('button', { name: 'Tüm cevapları gör · 2 cevap' })
    expect(ac.getAttribute('aria-expanded')).toBe('false')

    // Katlıyken yalnız SON görünen yanıt çizilir.
    expect(within(soru).queryByText(/Mesaj kutusundan yazabilirsiniz/)).toBeNull()
    expect(within(soru).getByText(/Telefonla konuşmak benim için daha kolay/)).toBeTruthy()

    await user.click(ac)
    expect(within(soru).getByText(/Mesaj kutusundan yazabilirsiniz/)).toBeTruthy()
    expect(within(soru).getByRole('button', { name: 'Cevapları gizle' })).toBeTruthy()
  })

  it('katlama sayısı GÖRÜNEN yanıtları sayar: maskeli yanıt sayacı şişirmez', async () => {
    const { rerender } = render(<ListingQnaSection qna={await fixtureQna()} />)
    const qna = await fixtureQna()

    expect(screen.getByRole('button', { name: 'Tüm cevapları gör · 2 cevap' })).toBeTruthy()

    // İlan sahibi maskeli yanıtı da okur; sayı bir artar.
    rerender(<ListingQnaSection qna={qna} viewer={SAHIP} />)
    expect(screen.getByRole('button', { name: 'Tüm cevapları gör · 3 cevap' })).toBeTruthy()
  })

  // ── Gizleme ───────────────────────────────────────────────────────
  it('gizlenen yanıt başkalarında HİÇBİR iz bırakmaz', async () => {
    render(<ListingQnaSection qna={await fixtureQna()} viewer={YABANCI} />)

    const soru = questionItem('Son fiyat ne olur?')
    expect(within(soru).queryByText(/Pazarlık payı var/)).toBeNull()
    // Açıklama, damga, gerekçe — hiçbiri yok.
    expect(soru.textContent).not.toMatch(/gizle/i)
    expect(within(soru).queryByText('Gizli · yalnız siz')).toBeNull()
  })

  it('yanıtı gizlenmiş soru "yanıtsız" diye ETİKETLENMEZ', async () => {
    render(<ListingQnaSection qna={await fixtureQna()} viewer={YABANCI} />)

    const gizlenen = questionItem('Son fiyat ne olur?')
    expect(within(gizlenen).queryByText('Henüz yanıtlanmadı')).toBeNull()

    // Gerçekten yanıtsız olan soruda etiket durur — ayrım korunur.
    const yanitsiz = questionItem('Elektrik ve su aboneliği')
    expect(within(yanitsiz).getByText('Henüz yanıtlanmadı')).toBeTruthy()
  })

  it('gizlenen yanıt sahibine damgalı olarak okunur kalır', async () => {
    render(<ListingQnaSection qna={await fixtureQna()} viewer={SAHIP} />)

    const soru = questionItem('Son fiyat ne olur?')
    expect(within(soru).getByText(/Pazarlık payı var/)).toBeTruthy()
    expect(within(soru).getByText('Gizli · yalnız siz')).toBeTruthy()
  })

  it('sayaç görünen yanıtları sayar: gizli yanıt "yanıtlandı" göstermez', async () => {
    const qna = await fixtureQna()
    const { rerender } = render(<ListingQnaSection qna={qna} viewer={YABANCI} />)
    expect(screen.getByText('5 soru · 3 yanıtlandı')).toBeTruthy()

    rerender(<ListingQnaSection qna={qna} viewer={SAHIP} />)
    expect(screen.getByText('5 soru · 4 yanıtlandı')).toBeTruthy()
  })

  // ── İşlemler ──────────────────────────────────────────────────────
  it('kendi sorusunu silme yalnız soranda çıkar', async () => {
    const user = userEvent.setup()
    const onSoruSil = vi.fn()
    const qna = await fixtureQna()
    const { rerender } = render(
      <ListingQnaSection qna={qna} viewer={SORAN} onSoruSil={onSoruSil} />,
    )

    const soru = questionItem('Son fiyat ne olur?')
    await user.click(within(soru).getByRole('button', { name: /sorusu için işlemler/ }))
    await user.click(screen.getByRole('menuitem', { name: /Soruyu sil/ }))
    expect(onSoruSil).toHaveBeenCalledWith('qna-pazarlik')

    // Başkasının sorusunda silme YOKTUR; yerine bildirim gelir.
    rerender(
      <ListingQnaSection qna={qna} viewer={YABANCI} onSoruSil={onSoruSil} onBildir={() => {}} />,
    )
    const baskasi = questionItem('Son fiyat ne olur?')
    await user.click(within(baskasi).getByRole('button', { name: /sorusu için işlemler/ }))
    expect(screen.queryByRole('menuitem', { name: /Soruyu sil/ })).toBeNull()
    expect(screen.getByRole('menuitem', { name: /Uygunsuz olarak bildir/ })).toBeTruthy()
  })

  it('ilan sahibi soruyu silemez — yalnız kendi yanıtını gizler', async () => {
    const user = userEvent.setup()
    render(
      <ListingQnaSection
        qna={await fixtureQna()}
        viewer={SAHIP}
        onSoruSil={() => {}}
        onYanitGizle={() => {}}
        onYanitGoster={() => {}}
        onBildir={() => {}}
      />,
    )

    const soru = questionItem('Son fiyat ne olur?')
    await user.click(within(soru).getByRole('button', { name: /sorusu için işlemler/ }))
    expect(screen.queryByRole('menuitem', { name: /Soruyu sil/ })).toBeNull()
  })

  it('gizli yanıtta "görünür yap", açık yanıtta "gizle" çıkar', async () => {
    const user = userEvent.setup()
    const onYanitGoster = vi.fn()
    render(
      <ListingQnaSection
        qna={await fixtureQna()}
        viewer={SAHIP}
        onYanitGizle={() => {}}
        onYanitGoster={onYanitGoster}
      />,
    )

    const gizli = questionItem('Son fiyat ne olur?')
    await user.click(within(gizli).getByRole('button', { name: 'Yanıt için işlemler' }))
    await user.click(screen.getByRole('menuitem', { name: /Herkese görünür yap/ }))
    expect(onYanitGoster).toHaveBeenCalledWith('qna-pazarlik-1')

    const acik = questionItem('yol stabilize mi?')
    await user.click(within(acik).getByRole('button', { name: 'Yanıt için işlemler' }))
    expect(screen.getByRole('menuitem', { name: /Gizle/ })).toBeTruthy()
  })

  it('platform maskesi bir KURALDIR: tercih menüsü hiç açılmaz', async () => {
    const user = userEvent.setup()
    render(
      <ListingQnaSection
        qna={await fixtureQna()}
        viewer={SAHIP}
        onYanitGizle={() => {}}
        onYanitGoster={() => {}}
        onYanitSil={() => {}}
      />,
    )

    const soru = questionItem('Sizinle nasıl iletişim kurabilirim?')
    await user.click(within(soru).getByRole('button', { name: 'Tüm cevapları gör · 3 cevap' }))

    const maskeli = within(soru).getByText('Numara yayımlanmaz').closest('[data-visibility]')
    expect(maskeli?.getAttribute('data-visibility')).toBe('masked')
    expect(within(maskeli as HTMLElement).queryByRole('button')).toBeNull()
  })

  it('geri çağrısı verilmemiş işlem menüde çizilmez', async () => {
    render(<ListingQnaSection qna={await fixtureQna()} viewer={SORAN} />)
    // Hiçbir işlem bağlanmadı: "İşlemler" kontrolü de yok.
    expect(screen.queryByRole('button', { name: /işlemler/i })).toBeNull()
  })

  it('oturum kapalıyken işlem menüsü hiç çizilmez', async () => {
    render(
      <ListingQnaSection qna={await fixtureQna()} onSoruSil={() => {}} onBildir={() => {}} />,
    )
    expect(screen.queryByRole('button', { name: /işlemler/i })).toBeNull()
  })

  // ── Yanıtlama ─────────────────────────────────────────────────────
  it('yanıtlama kutusu soruya bağlı açılır ve metni kırpar', async () => {
    const user = userEvent.setup()
    const onYanitla = vi.fn()
    render(
      <ListingQnaSection
        qna={await fixtureQna()}
        viewer={SAHIP}
        onSoruGonder={() => {}}
        onYanitla={onYanitla}
      />,
    )

    const soru = questionItem('yol stabilize mi?')
    await user.click(within(soru).getByRole('button', { name: 'Yanıtla' }))

    const alan = within(soru).getByLabelText('Yanıtınız')
    await user.type(alan, '  Yol geçen ay bakımdan geçti.  ')
    await user.click(within(soru).getByRole('button', { name: 'Yanıtı gönder' }))

    expect(onYanitla).toHaveBeenCalledWith('qna-yol', 'Yol geçen ay bakımdan geçti.')
    expect(within(soru).queryByLabelText('Yanıtınız')).toBeNull()
  })

  it('boş yanıt gönderilemez', async () => {
    const user = userEvent.setup()
    const onYanitla = vi.fn()
    render(
      <ListingQnaSection
        qna={await fixtureQna()}
        viewer={SAHIP}
        onSoruGonder={() => {}}
        onYanitla={onYanitla}
      />,
    )

    const soru = questionItem('yol stabilize mi?')
    await user.click(within(soru).getByRole('button', { name: 'Yanıtla' }))
    await user.type(within(soru).getByLabelText('Yanıtınız'), '   ')
    await user.click(within(soru).getByRole('button', { name: 'Yanıtı gönder' }))

    expect(onYanitla).not.toHaveBeenCalled()
    expect(within(soru).getByText('Göndermeden önce yanıtınızı yazın.')).toBeTruthy()
  })

  // ── Boş durum ─────────────────────────────────────────────────────
  it('kayıt yoksa bölüm yine görünür ve boş durumu yazar', () => {
    render(<ListingQnaSection onSoruGonder={() => {}} viewer={YABANCI} />)

    expect(screen.getByRole('region', { name: 'Sorular ve yanıtlar' })).toBeTruthy()
    expect(screen.getByText('Henüz soru yok')).toBeTruthy()
    expect(screen.getByText('Bu ilana henüz soru sorulmadı.')).toBeTruthy()
    expect(screen.getByText(/İlk soruyu siz sorabilirsiniz/)).toBeTruthy()
    expect(screen.getByLabelText('Sorunuz')).toBeTruthy()
  })

  it('yansıtılmış kayıtta boşluğun nedeni yazılır; yeni bir eylem vaat edilmez', () => {
    const { container } = render(<ListingQnaSection projected />)

    expect(screen.getByText('Bu kayıtta soru-cevap dosyası yok.')).toBeTruthy()
    expect(screen.getByText(/arama kaydından yansıtıldı/)).toBeTruthy()
    expect(screen.queryByText('Bu ilana henüz soru sorulmadı.')).toBeNull()
    expect(screen.getByText('Kayıtta soru bulunmuyor')).toBeTruthy()
    expect(container.querySelectorAll('button')).toHaveLength(0)
  })

  // ── Kapı ve kapalı kanal ──────────────────────────────────────────
  it('kanal açık + oturum kapalı: paragraf değil GİRİŞ KONTROLÜ çizilir', async () => {
    const user = userEvent.setup()
    const onGirisIste = vi.fn()
    render(
      <ListingQnaSection
        qna={await fixtureQna()}
        onSoruGonder={() => {}}
        onGirisIste={onGirisIste}
      />,
    )

    expect(screen.queryByLabelText('Sorunuz')).toBeNull()
    expect(screen.getByText('Soru sormak için giriş yapın')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Giriş yapıp sorun' }))
    expect(onGirisIste).toHaveBeenCalledTimes(1)
  })

  it('kanal kapalıysa giriş kontrolü ÇİZİLMEZ — giriş yapmak onu açmaz', async () => {
    const qna = { ...(await fixtureQna()), askDisabledReason: 'İlan süresi doldu — soru kapalı.' }
    render(<ListingQnaSection qna={qna} onSoruGonder={() => {}} onGirisIste={() => {}} />)

    expect(screen.getByText('İlan süresi doldu — soru kapalı.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Giriş yapıp sorun' })).toBeNull()
    expect(screen.queryByLabelText('Sorunuz')).toBeNull()
  })

  it('onSoruGonder verilmezse yazma çizilmez, gerekçesi görünür kalır', async () => {
    render(<ListingQnaSection qna={await fixtureQna()} viewer={YABANCI} />)

    expect(screen.queryByLabelText('Sorunuz')).toBeNull()
    expect(screen.getByText(/Soru gönderme bu görünümde bağlı değil/)).toBeTruthy()
  })

  it('yazılan soruyu kırpılmış olarak gönderir ve alanı temizler', async () => {
    const user = userEvent.setup()
    const onSoruGonder = vi.fn()
    render(
      <ListingQnaSection qna={await fixtureQna()} viewer={YABANCI} onSoruGonder={onSoruGonder} />,
    )

    const field = screen.getByLabelText('Sorunuz')
    await user.type(field, '  Tapu devri ne zaman yapılabilir?  ')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))

    expect(onSoruGonder).toHaveBeenCalledWith('Tapu devri ne zaman yapılabilir?')
    expect((field as HTMLTextAreaElement).value).toBe('')
    expect(screen.getByText(/Sorunuz iletildi/)).toBeTruthy()
  })

  it('boş soru gönderilemez; gerekçe canlı bölgede yazılır', async () => {
    const user = userEvent.setup()
    const onSoruGonder = vi.fn()
    render(
      <ListingQnaSection qna={await fixtureQna()} viewer={YABANCI} onSoruGonder={onSoruGonder} />,
    )

    const field = screen.getByLabelText('Sorunuz')
    await user.type(field, '   ')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))

    expect(onSoruGonder).not.toHaveBeenCalled()
    expect(screen.getByText('Göndermeden önce sorunuzu yazın.')).toBeTruthy()
    expect(field.getAttribute('aria-invalid')).toBe('true')
  })

  it('başlık seviyesi: bölüm tek bir h2 taşır', async () => {
    render(<ListingQnaSection qna={await fixtureQna()} viewer={YABANCI} onSoruGonder={() => {}} />)

    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
    const level2 = screen.getAllByRole('heading', { level: 2 })
    expect(level2).toHaveLength(1)
    expect(level2[0].textContent).toBe('Sorular ve yanıtlar')
  })
})
