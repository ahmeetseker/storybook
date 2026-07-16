---
name: GlassSearchField
category: kontroller
status: hazır
lastReviewed: 2026-07-16
---

# GlassSearchField Kuralları

## 1. Amaç

Cam arama kutusu: mercek ikonu + `type="search"` input; odaklanınca yumuşak
genişler, değer varken çarpıyla temizlenir. `GlassInput` üzerine kuruludur.

- **Kullan:** liste/katalog filtreleme, navbar/toolbar içi arama.
- **Kullanma:** genel form metni (→ `GlassInput`), çok satır (→ `GlassTextarea`).

| İlgili | Farkı |
|---|---|
| GlassInput | Genel metin girişi; blok/tam genişlik, arama semantiği yok |
| GlassSelect | Kapalı seçenek kümesinden seçim |

## 2. Semantik sözleşme

- Element: `<input type="search">` → implicit `role="searchbox"`.
- Accessible name: görünür etiket yoksa `aria-label` **zorunlu**.
- Mercek ikonu ve çarpı butonu GlassInput sözleşmesini izler (ikon `aria-hidden`,
  çarpı `aria-label="Temizle"`).
- WebKit'in native arama çarpısı gizlidir; temizleme tek kaynaktan (clearable).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| prefix | sabit | Mercek ikonu | Değiştirilemez — arama kimliğidir |
| clear | otomatik | Çarpı butonu | Değer varken görünür |

## 4. Public API

| Ad | Type | Default | Açıklama |
|---|---|---|---|
| size | `'sm'\|'md'\|'lg'` | `'md'` | GlassInput'a geçer (`--lg-control-*`) |
| tone | `'light'\|'dark'\|'auto'` | `'auto'` | GlassInput'a geçer |
| expandOnFocus | `boolean` | `true` | Odakta genişleme |
| onSearch | `(value: string) => void` | — | Enter'da güncel değerle |
| placeholder | `string` | `'Ara…'` | — |
| ...rest | `InputHTMLAttributes` | — | value/defaultValue/onChange (GlassInput controlled kalıbı), `aria-label` |

`type` ve `prefix` dışarı kapalıdır (Omit) — arama kimliği bozulmaz.

## 5. Seçenek eksenleri

Varsayılan: `md`, genişleme açık. Genişlikler CSS custom property ile
özelleşir: `--lg-search-w` (220px) / `--lg-search-w-focus` (300px).

## 6. State modeli

| State | Kaynak | ARIA / Görsel |
|---|---|---|
| focus | CSS `:focus-within` | Halka + genişleme |
| dolu | değer | Çarpı butonu görünür |
| disabled | native | GlassInput disabled görünümü |

## 7. Davranış

- **Enter** → `onSearch(value)`. **Escape** → değer varsa temizler
  (`preventDefault` ile); boşken event'e karışmaz — overlay kapanışı çalışır.
- Temizleme native value setter + input event ile yapılır; controlled ve
  uncontrolled modda `onChange` tetiklenir.
- Genişleme `width` transition'ıdır — **bilinçli layout geçişi** (Açık Karar):
  Apple arama alanı kalıbı; `prefers-reduced-motion`'da kapalı, genişlik anında atlar.
- iOS zoom önlemi GlassInput'tan miras (16px altı font yok).

## 8. İçerik kuralları

Placeholder eylem değil kapsam söyler ("Model veya kelime ara…"; "Tıkla" değil).
Uzun placeholder taşarsa native ellipsis. `max-width: 100%` — dar container'da taşmaz.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| yükseklik/font/focus | — | GlassInput üzerinden `--lg-control-*`, `--lg-accent` |
| genişlik | width | `--lg-search-w` / `--lg-search-w-focus` (component token) |

Borç: genişlik default'ları px raw (220/300) — layout token ölçeği yok; CSS
custom property ile dışarıdan özelleşir.

## 10. Storybook kapsamı

Var: Default, WithValue, NoExpand, Sizes, States, Controlled, NarrowContainer,
Mobile (viewport).

## 11. Test kabul kriterleri

- [x] searchbox rolü + type=search + default placeholder
- [x] Enter → onSearch(value)
- [x] Escape dolu alanı temizler + onChange
- [x] Escape boşken preventDefault yok
- [x] çarpı butonu temizler
- [x] disabled
- [ ] odak genişlemesi (visual)

## 12. Do / Don't

- ✅ Navbar/toolbar içinde `size="sm"` + `expandOnFocus`.
- ✅ Görünür etiket yoksa `aria-label` ver.
- ❌ `onSearch`'ü her tuşta çağırma beklentisiyle kullanma — canlı filtre için `onChange`.
- ❌ Mercek ikonunu başka ikonla değiştirmeye çalışma.

**Açık kararlar:** odak genişlemesi layout tetikler — "animasyon yalnız
transform/opacity/filter" kuralının bilinçli istisnası; scale ile taklidi
metni deforme ettiği için reddedildi.

## Changelog

- 2026-07-16: İlk sürüm — GlassInput tabanı, Enter/Esc sözleşmesi, odak genişlemesi.
