---
name: GlassSelect
category: form
status: hazır
lastReviewed: 2026-08-03
---

# GlassSelect Kuralları

## 1. Amaç

Önceden tanımlı seçeneklerden tekli seçim (vites, yakıt, il...). Native
`<select>` yerine, seçilebilir cam/düz malzeme + tam klavye desteğiyle
select-only combobox deseni uygular.

- **Kullan:** 3–30 seçenekli tekli seçim; filtre ve ilan formu alanları.
- **Kullanma:** 2-3 seçenek (→ radyo/segment daha hızlı), serbest metin +
  öneri (autocomplete — Açık Kararlar), çoklu seçim (Açık Kararlar).

| İlgili | Farkı |
|---|---|
| GlassInput | Serbest metin; seçenek listesi yok |
| GlassTabs | İçerik görünümü değiştirir; form değeri değildir |
| GlassField | Label/error sarmalayıcısı; Select onu tüketir |

## 2. Semantik sözleşme

- Trigger: gerçek `<button role="combobox" aria-expanded aria-haspopup="listbox">`;
  açıkken `aria-controls` + `aria-activedescendant` verir. DOM focus'u hep
  trigger'da kalır. Dışarıdan verilen `aria-label`, `aria-labelledby`,
  `aria-required` ve `aria-describedby` gerçek trigger'a taşınır (APG
  select-only combobox deseni).
- Panel: `role="listbox"`, seçenekler `role="option" aria-selected`
  (+ `aria-disabled`). Portal YOK — relative kök içinde absolute panel
  (brief'teki overlay kalıbı).
- Accessible name: dışarıdan `aria-label` / `aria-labelledby` ya da GlassField
  label'ı. GlassField `required` bağlamı trigger'da `aria-required` üretir.
- DOM değişmezleri: (1) trigger gerçek button kalır, (2) options sırası
  `options` prop sırasıdır, sıralama yapılmaz.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| trigger değeri | ✅ | seçili label / placeholder | Tek satır, ellipsis |
| chevron | ✅ | otomatik | Dekoratif; açıkken 180° döner |
| panel/listbox | ✅ | options'tan üretilir | Alt kenara hizalı, tam genişlik |
| option | ✅ | `label` metni + seçili tiki | Custom node yok (Açık Kararlar) |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| options | prop | `GlassSelectOption[]` | — (zorunlu) | `{ value, label, disabled? }` |
| value | prop | `string` | — | Controlled değer |
| defaultValue | prop | `string` | — | Uncontrolled başlangıç |
| onChange | prop | `(value: string) => void` | — | Event değil, değer döner |
| placeholder | prop | `string` | `'Seçin'` | Seçim yokken trigger metni |
| size | prop | `'sm'\|'md'\|'lg'` | `'md'` | Yükseklik `--lg-control-*` token'ından |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Zemin bağlamı ipucu |
| material | prop | `'glass'\|'flat'` | `'glass'` | Trigger malzemesi |
| panelMaterial | prop | `'glass'\|'flat'` | `'flat'` | Açılan panelin malzemesi; varsayılan opak `--lg-surface` |
| invalid | prop | `boolean` | field context ?? `false` | `aria-invalid` + `--lg-danger` çerçeve |
| disabled | prop | `boolean` | `false` | Trigger devre dışı; panel açılmaz |
| ...rest | — | `Omit<HTMLAttributes, 'onChange'\|'defaultValue'>` | — | Genel nitelikler köke; adlandırma/required/describedBy ARIA'ları ve `id` trigger'a |

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `material=glass`, `size=md`, kapalı, seçimsiz
(placeholder).

| Yasak / türetilen | Davranış |
|---|---|
| `value` verildi | iç state devre dışı; etiket yalnız prop'la değişir |
| `material` | yalnız trigger'ı belirler; panel `panelMaterial` ekseninden gelir |
| `panelMaterial` verilmedi | panel opaktır (`flat`) — trigger cam olsa bile liste okunur |
| açılışta aktif öğe | seçili seçenek; yoksa ilk enabled seçenek |
| `option.disabled` | klavye gezinmesi atlar, tıklama seçmez |
| `invalid`/`id` verilmedi + GlassField içinde | context'ten türetilir |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| open | click / ok tuşları | — | Panel fade+drop; chevron döner; `aria-expanded` |
| active option | ok tuşları / pointer enter | — | `--lg-accent` %18 dolgu; `aria-activedescendant` |
| selected | value | — | Semibold + accent + tik; `aria-selected` |
| focus-visible | CSS | — | Trigger'da `--lg-focus-ring-*` ile accent halka |
| invalid | prop / context | — | `--lg-danger` sınır; focus halkasını bastırmaz |
| disabled | prop | open | opacity .45 + `pointer-events: none` |

## 7. Davranış

- Keyboard (focus trigger'dayken): ArrowDown/Up açar ve gezer (enabled'lar
  arasında sarar), Home/End uçlara, Enter/Space açar/seçer, Escape kapatır,
  Tab kapatıp geçer. **Typeahead:** yazılan harfler 500ms tamponla birikir;
  açıkken aktif öğeyi taşır, kapalıyken ilk eşleşeni doğrudan seçer.
- Dış tıklama (`pointerdown` document listener) kapatır. Seçim/Escape sonrası
  focus trigger'da kalır/geri döner.
- Aktif öğe panel scroll'unda `scrollIntoView({ block: 'nearest' })` ile görünür.
- Animasyon: `AnimatePresence` + "materialize" açılışı — panel blur(8px) +
  scale(0.96) + −6px düşüşten `presets.springs.popover` yayıyla belirir
  (kritik sönüm, sekme yok) ve **aynı yoldan** kapanır (giriş/çıkış simetrisi).
  Seçenek satırları 25ms basamakla (tavan 150ms) opacity/translate ile oturur;
  satır başına blur yok (uzun listede filter maliyeti). Kapanış basamaksız —
  kapanış bekletmez. `prefers-reduced-motion`'da yalnız opacity (0.12s),
  satır basamağı yok, chevron dönüşü transition'sız.
- Responsive: genişlik %100. `pointer: coarse` yeteneğinde dokunmatik
  tipografi token'ı ve panelde `50vh` tavanı (içeride scroll) kullanılır;
  `pointer: fine` yeteneğinde liste tavanı kontrol token'ından türetilir.

## 8. İçerik

Option label'ları kısa ve paralel yapıda ("Manuel", "Otomatik"); cümle değil.
Placeholder eylem dili: "Vites seçin". 30+ seçenekte arama/autocomplete
düşünülmeli (Açık Kararlar).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| trigger | min-height | `--lg-control-{size}` |
| trigger | material | `material=glass` veya `material=flat` |
| panel | material | `panelMaterial=flat` (opak `--lg-surface`) veya `glass` (%94 dolgu) |
| panel | elevation | `--lg-surface-shadow: var(--lg-shadow-md)` |
| trigger/panel | border / radius | `--lg-hairline`, `--lg-stroke-hairline`, `--lg-radius-chip` |
| trigger | focus outline / invalid | `--lg-accent` / `--lg-danger` |
| trigger/panel | background | `--lg-surface` tabanlı malzeme dolgusu |
| option | min-height | `--lg-control-hit` (dokunma satırı — 44px) |
| option | radius / active bg | `--lg-radius-chip` / `--lg-accent` %18 |
| placeholder, chevron | color | `--lg-label-secondary` |
| boşluklar | gap/padding | `--lg-space-1/2`; md/lg trigger padding `--lg-space-3/4` |

Component CSS'inde raw ölçü/renk bulunmaz; geometriler ve durum renkleri
`--lg-*` token'larından tüketilir.

**Dokunma hedefi:** trigger yüksekliği kontrol ölçeğini izler (imleçli
36/40/44, dokunmatik 44/44/48px) — kontroller küçülürken trigger da küçülür.
Panel seçeneği ise bir "dokunma satırı"dır ve bu küçülmeye katılmaz:
`min-height: var(--lg-control-hit)` ile her cihazda 44px'te kalır (AAA
2.5.5). `pointer: fine` panel yüksekliği de aynı tabanla ölçülür
(`calc(var(--lg-control-hit) * 6)` ≈ 6 satır).

## 10. Storybook kapsamı

Var: Default, Preselected, Invalid, Required, Disabled, Materials, PanelMaterials,
DisabledOption, Sizes, Controlled, Mobile (viewport mobile1, uzun il listesi
ve 50vh scroll).
**Eksik:** çok uzun label ellipsis görseli, RTL, gruplu seçenekler.

## 11. Test kabul kriterleri

- [x] combobox rolü + aria-haspopup/expanded sözleşmesi
- [x] click ile açılır, option click seçer + kapatır + onChange(value)
- [x] klavye: ArrowDown açar/gezer, Enter seçer, aria-activedescendant izler
- [x] Escape kapatır
- [x] disabled trigger açılmaz; disabled option atlanır/seçilmez
- [x] typeahead kapalıyken doğrudan seçer
- [x] invalid → aria-invalid; controlled değer dışarıda kalır
- [x] `aria-label` / `aria-labelledby` gerçek combobox'ı adlandırır
- [x] GlassField required → trigger'da `aria-required`
- [x] material ekseni trigger'a uygulanır
- [x] panel varsayılanı opak (`flat`); `panelMaterial` ile cama çevrilebilir

## 12. Do / Don't

- ✅ GlassField ile etiketle; filtre barlarında `aria-label` ver.
- ✅ Seçenekleri kullanıcı sıklığına göre sırala (alfabetik şart değil).
- ❌ 2 seçenek için kullanma — segment/radio daha hızlı.
- ❌ Option label'ına ikon/HTML gömme; düz metin sözleşmesi.
- ❌ Paneli portal'a taşıma — overlay kalıbı relative/absolute'tur; kırpan
  `overflow: hidden` ata varsa yerleşimi üst katmanda çöz.

**Açık kararlar:** çoklu seçim varyantı · aranabilir combobox (30+ seçenek) ·
option grupları (`optgroup` eşleniği) · form submit için hidden input.

## Changelog

- 2026-08-07: Panel açılışı "materialize" desenine geçirildi (Apple fluid
  interfaces): tween (0.16s ease-out) yerine `presets.springs.popover` yayı;
  blur + scale + düşüş birlikte animasyonlanır, çıkış girişin aynadaki hali.
  Seçenek satırlarına 25ms basamaklı giriş eklendi (tavan 150ms, blur'suz).
- 2026-08-06: Panel malzemesi trigger'dan ayrıldı (`panelMaterial`, varsayılan
  `flat`). Açılan liste artık opak `--lg-surface` üzerinde ve `--lg-shadow-md`
  yükseltisiyle geliyor — yoğun sayfa içeriği üzerinde okunmama sorunu giderildi.
  `panelMaterial="glass"` seçilirse dolgu %72 → %94'e çıkarıldı.
- 2026-08-03: Yeni kontrol ölçeği. Trigger imleçli cihazda 44/44/48 →
  36/40/44px (token değişimi). Seçenek satırı `--lg-control-sm`'den
  `--lg-control-hit`e alındı → 44px'te kaldı (aksi halde 36px'e düşecekti);
  `pointer: fine` panel yüksekliği `--lg-control-xl × 6` yerine
  `--lg-control-hit × 6` (336px → 264px, gerçek satır yüksekliğiyle uyumlu).
- 2026-07-25: Accessible name/required nitelikleri trigger'a taşındı;
  `material=glass|flat` ekseni eklendi; odak/invalid ve responsive CSS
  token sözleşmesine geçirildi; Required/Materials story'leri ve regresyon
  testleri eklendi.
- 2026-07-16: İlk sürüm — select-only combobox deseni (aria-activedescendant),
  typeahead, overlay kalıbı (portal'sız), mobil 50vh panel.
