---
name: GlassBarList
category: içerik
status: hazır
lastReviewed: 2026-08-14
---

# GlassBarList Kuralları

## 1. Amaç

Kategorik payları **etiket + yatay bar + değer** satırlarıyla okutan dağılım listesi — demografik kırılımlar (yaş, eğitim, alt bölge nüfusu) için.

**Kullan:** yüzde/paya bölünen kategorik veri; sıralı büyüklük kıyası; "seçili bölge vurgulu" alt kırılım listeleri.
**Kullanma:** eksenli histogram ve medyan bandı gerektiğinde (→ `GlassDistributionChart`), zaman serisinde (→ `GlassTrendChart` / `GlassSparkline`), tek metrik gösteriminde (→ `GlassMetricStrip`).

**Neden ayrı component:** `GlassDistributionChart` sayısal bantlar üzerinde eksenli histogram çizer ve medyan vurgular; burada kategoriler adlarıyla okunur, eksen yoktur — sahibindex'in demografi sunumundaki "grafik-hafif" desen.

## 2. Semantik sözleşme

- Kök `div[role="list"]` + zorunlu `aria-label`; satırlar `role="listitem"`.
- Bilgi tamamen metinde taşınır: her satır "etiket, değer" olarak okunur.
- Bar (`track` + `fill`) **dekoratiftir** → `aria-hidden="true"`; genişlik yüzdesi erişilebilirlik ağacına girmez.
- Kendi cam yüzeyi yoktur — içerik katmanıdır, kabın zeminini kullanır.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Etiket | Evet | `span` | Tek satır, taşarsa ellipsis |
| Bar | Evet | `track > fill` | `aria-hidden`; genişlik `scale`den türetilir |
| Değer | Evet | `span` | `valueLabel ?? formatValue(value)`; tabular-nums |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| `items` | zorunlu | `GlassBarListItem[]` | — | — | `{ id, label, value, valueLabel?, prominent? }` |
| `label` | zorunlu | `string` | — | — | Erişilebilir liste adı |
| `scale` | seçenek | `'total' \| 'max'` | `'total'` | — | Genişlik ölçeği (aşağıda) |
| `tint` | seçenek | `string` | `--lg-accent` | — | Bar rengi (`--bar-tint` değişkeni) |
| `formatValue` | seçenek | `(v: number) => string` | `%{v}` (tr-TR) | — | Görünür değer biçimi |

Ref hedefi yok. Event yok.

## 5. Seçenek eksenleri

| Eksen | Değerler | Etki |
|---|---|---|
| `scale` | `total` · `max` | `total`: genişlik = değerin toplam içindeki payı (yüzde verisinde değerin kendisi). `max`: en büyük değer %100'e oturur — mutlak sayılarda sıralamayı okutur. |

Payda 0 ise tüm genişlikler %0 olur (NaN üretilmez).

## 6. State modeli

Etkileşim state'i yoktur: hover/focus/active yok, odaklanmaz.

| State | Kaynak | Etki |
|---|---|---|
| vurgulu satır | `item.prominent` | `data-prominent="true"`; etiket birincil renk + 600, bar tam dolulukta |
| veri yok | `item.valueLabel` | görünür metin ezilir; bar `value`ya göre çizilmeye devam eder (0 önerilir) |

## 7. Davranış

- **Pointer/touch/keyboard:** yok — salt okunur içerik.
- **Motion:** animasyon yok → `prefers-reduced-motion` kuralı gerekmez. Bar genişliği veridir, girişte büyütülmez.

## 8. İçerik kuralları

- `label` veri setini adlandırır: "Yaş dağılımı", "Eğitim durumu" — yalnız "dağılım" yetersizdir.
- Mutlak sayılarda `formatValue` ile tr-TR biçim verilir; yüzde varsayılanı `%{v}`dir.
- Bastırılmış/eksik veri gizlenmez: `valueLabel: 'veri yok'` ile gerekçesiyle görünür.
- 12'den fazla satır listeyi taramaya çevirir — çağıran ilk N + "diğer" toplamına indirger.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| etiket / değer | font-size | `--lg-text-footnote` | — |
| etiket | color | `--lg-label-secondary` | prominent: `--lg-label-primary` |
| değer | color | `--lg-label-primary` | — |
| track | background | `--lg-label-secondary` %12 mix | — |
| track | border-radius | `--lg-radius-capsule` | — |
| fill | background | `--bar-tint` (→ `--lg-accent`) %55 mix | prominent: tam dolu |
| satır arası | gap | `--lg-space-2` | — |
| kolon arası | gap | `--lg-space-3` | — |

**Borç (raw değer):** track yüksekliği `8px` (bar kalınlığı ölçek token'ı değil, tipografiye görsel oran); etiket kolonu `minmax(72px, max-content)` ve değer `min-width: 3.5ch` yerleşim sabitleridir.

## 10. Storybook kapsamı

| Story | Var |
|---|---|
| Default / Overview | ✅ |
| Playground (Controls) | ✅ |
| Variants | ✅ `Mutlak değer + vurgulu satır` |
| States | ✅ `Veri yok satırı` |
| Uzun içerik | ✅ |
| Responsive | ✅ |
| (ek) Gerçek bağlam | ✅ `Yan yana` |

## 11. Test kabul kriterleri

- **Unit:** `role="list"` + `aria-label`; satır sayısı; varsayılan `%` biçimi; `scale='total'` payı, `scale='max'` normalizasyonu; `formatValue`/`valueLabel` öncelikleri; `prominent` → `data-prominent`; payda 0 → %0.
- **Interaction:** N/A (etkileşimsiz).
- **A11y:** bar `aria-hidden`; bilgi metinde.
- **Visual:** N/A.

## 12. Do / Don't

**Do:** yüzdelerde varsayılan ölçeği kullan · mutlak sayılarda `scale="max"` + tr-TR `formatValue` ver · sayfanın kendi bölgesini `prominent` işaretle.
**Don't:** barı tek bilgi kanalı yapma (değer metni kaldırılamaz) · iki listeyi ortak eksende kıyaslatmaya çalışma — her liste kendi paydasına normalize olur · nüfus piramidi gibi çift yönlü kıyas için kullanma.

### Bilinen kısıtlar

- Çift yönlü (kadın/erkek aynalı) piramit desteklenmez; ihtiyaç doğarsa ayrı component gerekir.
- Satır içi link/etkileşim yoktur; tıklanabilir kırılım gerekiyorsa tablo kullanılır.

### Changelog

- 2026-08-14 — ilk sürüm. Emlak Endeksi demografi bölümü (yaş/eğitim/alt bölge nüfusu) için yazıldı.
