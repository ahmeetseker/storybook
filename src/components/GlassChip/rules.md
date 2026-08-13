---
name: GlassChip
category: görüntüleme
status: hazır
lastReviewed: 2026-08-13
---

# GlassChip Kuralları

## 1. Amaç

Etkileşimli etiket: tıklanabilir, seçilebilir (toggle) ve/veya kaldırılabilir
filtre/etiket chip'i. **Badge'den farkı etkileşimdir** — Badge salt görseldir,
Chip kullanıcı girdisi alır.

- **Kullan:** filtre seçimi (Sahibinden, Boyasız), aktif filtre etiketi
  (× ile kaldırılır), öneri/etiket tıklamaları.
- **Kullanma:** salt durum rozeti (→ `GlassBadge`), birincil aksiyon
  (→ `GlassButton`), tekli seçim grubu gerekiyorsa radio semantiği
  (Açık Kararlar).

| İlgili | Farkı |
|---|---|
| GlassBadge | Etkileşimsiz metin rozeti |
| GlassButton | Aksiyon tetikler; chip durum/filtre temsil eder |
| GlassTabs | Tek panel seçer (tablist); chip çoklu seçim/etikettir |

## 2. Semantik sözleşme

- Element: `<span>` (motion.span, GlassSurface üzerinden). Etkileşim niyeti
  varsa (`toggle modu` veya `onClick`) `role="button"` + `tabIndex=0` verilir;
  yoksa rolsüz statik span'dir.
- Toggle modunda (`selected`/`defaultSelected`/`onSelectedChange`'ten biri
  verildiyse) `aria-pressed` seçimi yansıtır.
- Kaldırma `×` ayrı bir native `<button aria-label="Kaldır">`'dır; tıklaması
  chip aktivasyonuna sızmaz (`stopPropagation`).
- Bilinen ödün: `onRemove` + etkileşimli chip birlikteyken `role="button"`
  içinde ikinci bir buton oluşur (iç içe etkileşim). Bu yüzden klavye
  alternatifi olarak chip odaktayken Delete/Backspace da kaldırır.
- Accessible name: children metni. Kök `data-selected` taşır.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| icon | — | inline ikon | `aria-hidden`; metnin soluna, `gap: 0.4em` |
| children | ✅ | kısa etiket metni | Tek satır (`white-space: nowrap`) |
| remove | — (`onRemove` ile) | × butonu | `currentColor` tabanlı zemin — her tint'te okunur; ikon ince çizgili stroke SVG (1.5), görünür daire 16px, dokunma hedefi görünmez `::after` ile 24px |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| selected | prop | `boolean` | — | Controlled seçim |
| defaultSelected | prop | `boolean` | — | Uncontrolled başlangıç |
| onSelectedChange | event | `(selected: boolean) => void` | — | Yeni seçim değeriyle çağrılır |
| onRemove | event | `() => void` | — | × butonu ve Delete/Backspace |
| onClick | event | `MouseEventHandler` | — | Toggle'dan bağımsız da çalışır (filtre chip'i) |
| icon | prop | `ReactNode` | — | Dekoratif inline ikon |
| size | prop | `'sm'\|'md'` | `'md'` | Yükseklik `--lg-control-sm/md`: imleçli 36/40px, dokunmatikte 44px |
| tint | prop | `string` | — | `--glass-tint`; seçiliyken dolgu rengi olur |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'a geçer |
| disabled | prop | `boolean` | `false` | `aria-disabled`; focus almaz, handler çalışmaz |
| ...rest | — | `HTMLAttributes<HTMLSpanElement>` (`onSelect` hariç) | — | Köke geçer |

Ref hedefi: yok. Kontrollü/kontrolsüz: `selected` verildiyse iç state yazılmaz
(GlassTabs kalıbı).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=md`, seçimsiz, nötr cam.

| Yasak / türetilen | Davranış |
|---|---|
| seçim prop'u yok + `onClick` yok | Etkileşimsiz: rol/tabIndex verilmez — ama bu kullanım için `GlassBadge` tercih edilir |
| `selected` + `tint` | Dolgu `--glass-tint`; tint yoksa `--lg-accent` |
| `tint` + seçili değil | Yarı saydam tint (%30) — Apple adaptif ton kuralı |
| `aria-pressed` toggle modu dışında | ❌ — yalnız onClick'li chip pressed bildirmez |
| hover/focus prop olarak | ❌ — yalnız CSS |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| selected | prop/iç state | tinted | Accent (veya tint) dolgu + `--lg-accent-contrast` metin |
| hover | CSS (`hover:hover`) | — | Nötrde hafif label zemini; seçilide dolgu koyulaşır |
| active | useGlassPress | — | Sıvılaşma + jöle (yalnız etkileşimliyken) |
| focus-visible | CSS | — | 2px `--lg-accent` halka |
| disabled | prop | tümü | opacity .45 + `pointer-events: none` + `aria-disabled` |

## 7. Davranış

- Keyboard: Enter/Space aktive eder (toggle + onClick); Delete/Backspace
  `onRemove` çağırır; × butonu Tab sırasında ayrı durak.
- `prefers-reduced-motion`: basınç spring'i kapanır (useGlassPress), renk
  geçişleri anlık olur.
- Touch: yükseklik kontrol token'larından gelir — imleçli cihazda kompakt
  (sm 36 / md 40px), dokunmatikte token'ın kendisi 44px'e çıkar; CSS'te ayrı
  bir `pointer: coarse` kuralı yoktur.
- Controlled kullanımda tıklama yalnız `onSelectedChange` çağırır; görünüm
  dışarıdan gelen `selected`'a kilitlidir.

## 8. İçerik

1–3 kelime; `white-space: nowrap` — uzun metin chip'i büyütür, kırpılmaz.
İkon her zaman metinle birliktedir; ikon-tek chip yapılmaz (→ GlassIconButton).
× butonunun erişilebilir adı sabit Türkçe "Kaldır"dır.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | focus outline | `--lg-accent` |
| root | font-size | `--lg-text-caption` (sm) / `--lg-text-footnote` (md) |
| selected | background | `--glass-tint` ← `--lg-accent` |
| selected | color | `--lg-accent-contrast` |
| hover (nötr) | background | `color-mix(--lg-label 8%, transparent)` |
| root | radius | capsule (`shape="capsule"`) |

**Borç (raw / mikro-geometri):** `--chip-pad-x-sm`/`--chip-pad-x-md` kökte
yerel değişken olarak kalır ama artık ikisi de birebir token'a bağlı
(`--lg-space-3` / `--lg-space-4`) — raw değer değil, yalnız isimlendirme
kolaylığı. Geçiş süreleri `0.16s ease-out` raw kalır (süre token'ı yok).

**Yükseklik / dokunma hedefi:** `.sm`/`.md` artık kontrol ölçeğinden okur
(`--lg-control-sm` / `--lg-control-md`) — imleçli cihazda 36/40px, dokunmatikte
token kendiliğinden 44px'e çıktığı için ayrı bir `pointer: coarse` yükseltmesi
yok (AAA 2.5.5 token katmanında karşılanıyor). Chip böylece yanındaki
input/buton ile aynı satır yüksekliğini paylaşır; kompaktlığı taşıyan asıl
oran yatay dolgudur. Kaldırma butonunda (`.remove`) görünür daire ile dokunma
hedefi ayrıktır (GlassSiteHeader/GlassSlider deseni): buton kutusu
`--lg-space-4` (16px) zarif bir daire, görünmez `::after` taşması hedefi
`--lg-space-6`ya (24px, AA 2.5.8) genişletir. Chip kökündeki
`overflow: hidden` bunu engellemez — kırpma kök sınırındadır, 24px'lik hedef
36/40px'lik chip'in içinde kalır (hedefi 44px'e taşımak hâlâ mümkün değil,
o kök sınırını aşardı). Boşluk simetrisi: metin↔daire ve daire↔kapsül kenarı
`--lg-space-2` (8px); soldaki marj chip `gap`'ini (0.4em) tamamlar, sağdaki
kapsül dolgusunu (`--chip-pad-x`) telafi eder.

## 10. Storybook kapsamı

Var: Default, Secilebilir (uncontrolled), Kaldirilabilir, Disabled, Boyutlar
(+ikon), FiltreGrubu (controlled, useState), TintliSecim, MobilFiltreSatiri
(responsive: sarma + 44px hedef, mobile1 viewport). **Eksik:** forced
hover/focus görselleri, RTL.

## 11. Test kabul kriterleri

- [x] toggle modunda role=button + aria-pressed, tıklama toggle eder
- [x] Space/Enter klavye aktivasyonu
- [x] controlled'da iç state yazılmaz
- [x] × butonu onRemove çağırır, onClick'e sızmaz
- [x] Delete/Backspace kaldırır
- [x] disabled: aria-disabled + handler çalışmaz + focus almaz
- [x] etkileşimsizken rol verilmez
- [x] tint CSS var'a yazılır
- [ ] coarse pointer'da 44px (visual)

## 12. Do / Don't

- ✅ Filtre gruplarında controlled kullan — seçim listesi tek kaynaktan yönetilsin.
- ✅ Semantik vurgu için `tint` (success/warning) ver; tema rengi verme.
- ❌ Etkileşimsiz chip render etme — o iş `GlassBadge`'in.
- ❌ Chip'i form submit butonu yapma.
- ❌ `onRemove`'u onay gerektiren yıkıcı aksiyona bağlama (chip anında kaldırılır varsayımı).

**Açık kararlar:** tekli seçim grubu (radiogroup semantiği) ihtiyacı ·
iç içe etkileşim yerine "chip = tek buton + Delete kısayolu" modeline geçiş
değerlendirmesi.

## Changelog

- 2026-07-16: İlk sürüm — toggle (controlled/uncontrolled), onRemove (× +
  Delete/Backspace), icon, tint/tone, coarse pointer 36px hedefi, useGlassPress.
- 2026-07-30: Görsel yükseklik ölçeğe indirildi (`.sm`/`.md` 32px,
  `--lg-space-7`); 44px dokunma hedefi yalnız `@media (pointer: coarse)`
  altına taşındı. Yatay padding'ler token'a bağlandı (`--lg-space-3`/`-4`).
- 2026-08-03: Yeni kontrol ölçeğine uyum. Yükseklik `--lg-space-7`'den
  kontrol token'larına geçti: `.sm` 32→36px, `.md` 32→40px (imleçli cihaz);
  dokunmatikte ikisi de 44px'te kaldığı için `pointer: coarse` yükseltmesi
  kaldırıldı (artık token'ın işi). `.remove` kutusu 1.5em → `max(1.5em,
  --lg-space-6)`; sm chip'te 18px olan hedef 24px'e çıktı (AA 2.5.8).
- 2026-08-13: Kaldırma butonu inceltildi — koca gri daire şikâyeti. Görünür
  daire `max(1.5em, --lg-space-6)` (24px) → `--lg-space-4` (16px); dokunma
  hedefi görünmez `::after` taşmasıyla 24px'te kalıyor (AA 2.5.8,
  GlassSiteHeader/GlassSlider deseni — chip kökündeki `overflow: hidden`
  buton içi taşmayı kırpmaz, önceki "mümkün değil" notu yalnız kök sınırı
  için geçerliydi). Font glyph'i `×` yerine ince çizgili stroke SVG (10px,
  stroke 1.5). Boşluklar simetrik tokene bağlandı: metin↔daire ve
  daire↔kapsül kenarı `--lg-space-2` (8px; eski: gap 0.4em + `-0.3em` marj).
