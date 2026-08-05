---
name: GlassDivider
category: görüntüleme
status: hazır
lastReviewed: 2026-07-16
---

# GlassDivider Kuralları

## 1. Amaç

İçerik bölümleri arasına 1px hairline ayraç: yatay/dikey, isteğe bağlı ortada
footnote etiket, liste kullanımı için inset. Salt görseldir, cam değildir —
içerik katmanının çizgisidir.

- **Kullan:** açıklama blokları arası, liste satırları arası (inset), satır içi
  metaveri ayırma (dikey), "veya" / bölüm başlığı etiketi.
- **Kullanma:** navigasyon çubuğu sınırı (o GlassSurface'ın kendi hairline'ı),
  görsel dolgu amaçlı dekoratif çizgiler, menü içi ayraç gerekiyorsa menü
  component'inin kendi ayracı (Açık Kararlar).

| İlgili | Farkı |
|---|---|
| GlassSpecTable | Kendi satır çizgilerini içerir; araya Divider koyma |
| GlassSurface | Yüzey primitive'i; Divider yüzey değildir |

## 2. Semantik sözleşme

- Element: etiketsiz yatay → native `<hr>` (implicit `separator` rolü);
  etiketli yatay → `<div role="separator" aria-orientation="horizontal">`;
  dikey → `<div role="separator" aria-orientation="vertical">` (`<hr>` dikeyde
  doğal değildir).
- Accessible name: yok — etiket metni separator'ın adı değil görünür içeriktir;
  çizgi span'leri `aria-hidden`.
- Focus almaz (statik separator; ARIA'daki focusable separator deseni
  desteklenmez).
- DOM değişmezleri: her varyantta kökte `separator` rolü bulunur.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| çizgi | ✅ | 1px hairline | Renk yalnız `--lg-hairline` |
| label | — | kısa footnote metin | Tek satır, `--lg-label-secondary`; çizgi iki yana `gap: --lg-space-3` ile bölünür |

`children` yok — etiket yalnız `label` prop'undan gelir.

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| orientation | prop | `'horizontal'\|'vertical'` | `'horizontal'` | Dikeyde `align-self: stretch` — flex satırında kendini uzatır |
| label | prop | `string` | — | Yalnız horizontal'da; vertical'da yok sayılır |
| spacing | prop | `'sm'\|'md'\|'lg'` | `'md'` | `--lg-space-2/4/6`; horizontal'da `margin-block`, vertical'da `margin-inline` |
| inset | prop | `boolean` | `false` | `margin-inline-start: --lg-space-4`; yalnız horizontal |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | Köke geçer |

Ref hedefi: yok. Event sözleşmesi: yok — etkileşimsiz.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: yatay, `spacing=md`, inset'siz, etiketsiz (`<hr>`).

| Yasak / türetilen | Davranış |
|---|---|
| `label` + `orientation="vertical"` | label yok sayılır (dikey etiketli ayraç anti-pattern) |
| `inset` + `orientation="vertical"` | inset yok sayılır |
| renk/kalınlık prop'u | ❌ — her zaman 1px `--lg-hairline` |
| cam malzeme | ❌ — Divider içerik katmanıdır |

## 6. State modeli

N/A — hover/focus/active/disabled yok; ayraç salt görseldir.

## 7. Davranış

- Pointer/keyboard: N/A — focus almaz; etiket `user-select: none`.
- **Spacing token'ları her breakpoint'te AYNIDIR** (responsive değil):
  ayraç ritmi sayfa genişliğiyle değişmez; dar ekranda içerik daralır, ritim
  sabit kalır.
- Dikey ayraç flex satırında `align-self: stretch` ile satır yüksekliğini alır;
  flex dışı kullanımda `min-height: 1em` görünürlük garantisi verir.
- Animasyon yok — reduced-motion etkisi yok.

## 8. İçerik

Etiket 1–3 kelime footnote'tur ("veya", "Benzer İlanlar"); cümle taşımaz,
`white-space: nowrap`. Başlık hiyerarşisi kurmaz — gerçek bölüm başlığı
gerekiyorsa heading elementi kullanılır, Divider yalnız görsel ayrımdır.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| çizgi | background | `--lg-hairline` |
| label | font-size / color | `--lg-text-footnote` / `--lg-label-secondary` |
| label-çizgi arası | gap | `--lg-space-3` |
| spacing sm/md/lg | margin | `--lg-space-2` / `--lg-space-4` / `--lg-space-6` |
| inset | margin-inline-start | `--lg-space-4` |

Borç: yok — tüm görsel değerler token'lı (1px çizgi kalınlığı hariç; hairline
tanımı gereği 1px).

## 10. Storybook kapsamı

Var: Default, Etiketli ("veya" + bölüm etiketi), Bosluklar (sm/md/lg),
ListeInset (iOS inset kalıbı), Dikey (satır içi metaveri), MobilRitim
(responsive: spacing sabitliği, mobile1 viewport). **Eksik:** RTL (inset
`margin-inline-start` ile hazır, görsel test yok).

## 11. Test kabul kriterleri

- [x] etiketsiz yatay `<hr>` + separator rolü
- [x] label → div separator + görünür metin
- [x] vertical → `aria-orientation="vertical"`
- [x] spacing/inset sınıfları uygulanır
- [x] vertical'da inset yok sayılır
- [ ] flex satırında stretch davranışı (visual)

## 12. Do / Don't

- ✅ Liste satırları arasında `inset + spacing="sm"` kullan.
- ✅ Dikey ayracı yalnız flex satırı içinde kullan.
- ❌ Ayraca renk/kalınlık verme — hiyerarşi gerekiyorsa boşluk veya başlık kullan.
- ❌ Art arda iki Divider koyma (çift çizgi); boşluk gerekiyorsa `spacing="lg"`.
- ❌ Etiketi başlık yerine kullanma.

**Açık kararlar:** menü/select içinde ayraç ihtiyacı (o component'lerin kendi
iç ayracı mı olacak) · focusable separator (pencere böleni) desteklenmeyecek.

## Changelog

- 2026-07-16: İlk sürüm — hr/div ikili semantiği, label, spacing token'ları,
  inset, dikey yönelim.
