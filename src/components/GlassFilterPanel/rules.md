---
name: GlassFilterPanel
category: navigasyon
status: hazır
lastReviewed: 2026-08-06
---

# GlassFilterPanel Kuralları

## 1. Amaç

Arama/liste sayfalarında filtre kontrollerini barındıran adlandırılmış
`complementary` landmark. Ekran okuyucu kullanıcıları "Filtreler" bölgesine
doğrudan atlayabilir; sonuç sayısı canlı bölge olarak duyurulur.

- **Kullan:** ilan arama, katalog daraltma, facet paneli.
- **Kullanma:** genel içerik kartı (→ `GlassSurface`), boş durum (→
  `GlassEmptyState`), tekil kontrol grubu (→ `GlassRadioGroup`/`GlassField`).

## 2. Semantik sözleşme

- Kök `<aside aria-label={label}>` — adlandırılmış complementary landmark.
- `title` görünür başlık (`<h2>`); verilmezse `label` başlık olur.
- `resultCount` verilirse `<p aria-live="polite">` sonuç satırı çizilir —
  filtre değişince güncel sonuç sesli okunur.
- `onReset` verilmezse sıfırlama butonu hiç render edilmez (false affordance yok).
- Sıfırlama butonu native `<button>`; `:focus-visible` halkası + min 44px
  (dokunmatik) hedef.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik |
|---|---|---|
| title (`h2`) | — (label fallback) | başlık |
| result | — | `aria-live` sonuç sayısı |
| reset | — | yalnız `onReset` ile |
| children (body) | — | filtre kontrolleri |
| footer | — | ör. "Uygula" butonu |

## 4. Public API

| Ad | Tür | Default | Açıklama |
|---|---|---|---|
| label | `string` | `'Filtreler'` | landmark `aria-label` |
| title | `ReactNode` | `label` | görünür başlık |
| resultCount | `number` | — | verilirse `aria-live` satırı |
| resultLabel | `(n)=>string` | `` `${n} sonuç` `` | sonuç metni biçimi |
| onReset | `()=>void` | — | verilmezse buton yok |
| resetLabel | `string` | `'Filtreleri sıfırla'` | buton metni |
| footer | `ReactNode` | — | panel altı slot |
| material | `'flat'\|'glass'` | `'flat'` | yüzey biçimi |
| ...rest | `HTMLAttributes<HTMLElement>` (title hariç) | — | birleşir |

`...rest` yönetilen `aria-label`/`className`'den ÖNCE yayılır.

## 5. Seçenek eksenleri

Varsayılan: `material=flat`. Cam yalnız gerçek chrome bağlamında (`glass`) —
tasarım sistemi "sayfa başına max 6 cam yüzey" ve "cam üstüne cam yok" kuralına
tabidir; içerik daraltma paneli varsayılan olarak düz yüzeydir.

## 6. State modeli

Panelin kendisi durum tutmaz — filtre state'i children kontrollerinde ve
`resultCount`/`onReset` ile ebeveynde yönetilir.

## 7. Davranış

- `aria-live="polite"` sonuç satırı yalnız `resultCount` tanımlıyken var.
- Responsive: dar ekranda tam genişliğe uyar; footer `flex-wrap`.
- Reset hover'da hafif accent zemin; `:focus-visible` outline.

## 8. İçerik kuralları

- `title` kısa ("Filtreler", "Daralt"); `resultLabel` çoğul/tekil için
  biçimlendirilebilir.
- Boş sonuç durumunda children içinde `GlassEmptyState` ile "sonraki adım"
  önerilmeli (yalnız "0 sonuç" demek yetmez).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | padding/radius | `--lg-space-5` / `--lg-radius-card` |
| flat/glass | background/border | `--lg-surface` / `--lg-hairline` |
| title | font-size | `--lg-text-headline` |
| reset | color | `--lg-accent` |
| reset | min-height | `--lg-control-sm` → `--lg-control-md` (coarse) |
| reset hover zemini | background | `color-mix(--lg-accent 10%)` — yalnız `@media (hover: hover)` |

Raw px: yok. Borç (yerel değişkenler, kökte): `--glass-filterpanel-blur`
(20px) + `--glass-filterpanel-saturate` (1.6) — cam malzeme parametreleri
(token'laşmamış backdrop-filter reçetesi), `--glass-filterpanel-heading-gap`
(2px başlık/sonuç satırı arası mikro boşluk). Görsel değerler değişmedi.

## 10. Storybook kapsamı

Default, Sıfırlamasız, Sonuç Sayısız, Footer Aksiyonlu, Cam Yüzey, Responsive
(mobile1), **Referans Emlak Filtresi**, Erişilebilirlik (docs).

`Referans Emlak Filtresi` panelin bütünsel kullanımını gösterir: segmentli
oda/banyo satırları (`GlassSegmentedControl`), dağılım histogramlı fiyat
aralığı (`GlassPriceRange`), anahtar satırları (`GlassSwitch`) ve footer'da
sonucu **sayan** birincil eylem. Sonuç sayısı seçimden türer — kullanıcı
paneli kapatmadan kaç ilan kaldığını görür (sıfır sonuç sürprizi olmaz).

## 11. Test kabul kriterleri

- [x] adlandırılmış complementary landmark
- [x] varsayılan ad "Filtreler" + başlık
- [x] `resultCount` → `aria-live="polite"` satır
- [x] `resultLabel` biçimlendirme
- [x] `onReset` callback + buton
- [x] `onReset` yokken buton yok
- [x] `resultCount` yokken satır yok
- [x] rest-override koruması

## 12. Do / Don't

- ✅ Panel içine `GlassCheckbox`/`GlassChip`/`GlassPriceRange` gibi gerçek kontroller koy.
- ✅ Sonuç değişince `resultCount`'u güncelle — canlı bölge otomatik duyurur.
- ❌ `material="glass"`'ı içerik listesi üstüne koyma (cam üstüne cam yasağı).
- ❌ Sıfırlama butonunu boş callback ile "görünsün diye" ekleme (false affordance).

## Changelog

- 2026-08-06: `Referans Emlak Filtresi` story'si eklendi — panelin
  `GlassPriceRange` + `GlassSegmentedControl` + `GlassSwitch` ile bütünsel
  kullanımı ve canlı sayan footer eylemi. Component API'si değişmedi.
- 2026-07-18: İlk sürüm — complementary landmark, `aria-live` sonuç sayısı,
  koşullu reset. Codex `CodexFilterPanel` deseninden türetildi.
