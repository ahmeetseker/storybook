---
name: GlassTourScheduler
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassTourScheduler Kuralları

## 1. Amaç

Yerinde görme randevusu akışı: gün şeridi (yatay kaydırılabilir chip'ler) → saat
ızgarası (dolu slotlar disabled) → tur tipi → "Randevu iste" → iç state onay
ekranı. Tek component içinde uçtan uca dört adımlı bir mini-form.

- **Kullan:** ilan detayında "Görme randevusu al" akışı (emlak/arsa yerinde
  ziyaret, canlı video, 3D self-tur).
- **Kullanma:** genel tarih/saat seçimi (→ `GlassDatePicker`), tekil tarih
  seçimi olmadan doğrudan iletişim (→ `GlassSellerCard`'ın mesaj aksiyonu).

| İlgili | Farkı |
|---|---|
| GlassDatePicker | Takvim ayı gezinen genel tarih seçici; burada gün seçimi sabit bir liste (`days`) üzerinden chip şeridiyle yapılır, ay gezinme yok |
| GlassSegmentedControl | Tur tipi ekseni doğrudan bu component'ten kompoze edilir (gerçek public API'siyle) |
| GlassButton | "Randevu iste" / "Takvime ekle" aksiyonları bu component'ten kompoze edilir |

## 2. Semantik sözleşme

- Element: `<section>` (`GlassSurface as="section"`, `shape={20}`, `thickness={0.4}`).
- Gün şeridi ve saat ızgarası birer `role="radiogroup"` (tekil seçim, radio
  deseni); her ikisi de görünür başlığa `aria-labelledby` ile bağlıdır (metin
  tekrarı yok — `aria-label` yerine).
- Tur tipi ekseni `GlassSegmentedControl`'ün kendi `role="radiogroup"`
  sözleşmesini üstlenir (`label="Tur tipi"`).
- Onay ekranı `role="status" aria-live="polite"` — ekran okuyucuya otomatik
  duyurulur, odak taşınmaz (buton DOM'da kalmaya devam etmez, form tamamen
  onay içeriğiyle değişir).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Gün şeridi | ✅ | `days[].label` chip'leri + uygun saat sayısı | Yatay scroll, `overflow-x: auto`; ilk gün varsayılan seçili |
| Saat ızgarası | ✅ | Seçili günün `slots[]`'ı | Dolu slot `disabled`; gün boşsa "Bu gün için uygun saat bulunmuyor." |
| Tur tipi | ✅ | `GlassSegmentedControl` | Varsayılan `['Yerinde','Canlı video','3D self-tur']` |
| "Randevu iste" | ✅ | `GlassButton prominent` | Gün + saat seçilmeden `disabled` |
| Onay ekranı | otomatik | ✓ ikon + özet + "Takvime ekle" + "Yeni randevu planla" | Yalnız gönderim sonrası, internal state |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| days | prop | `GlassTourDay[]` | — (zorunlu) | — | `{date, label, slots:{time,available}[]}` |
| tourTypes | prop | `string[]` | `['Yerinde','Canlı video','3D self-tur']` | — | `GlassSegmentedControl` seçeneklerine `{value,label}` olarak eşlenir |
| onRequest | prop | `(r: {date,time,type}) => void` | — | — | Yalnız "Randevu iste" tıklamasında, gün+saat doluyken çağrılır |
| variant | prop | `'grid'\|'compact'` | `'grid'` | — | `compact`: tek kolon saat listesi + dar panel (`max-width: 300px`) |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | — | Surface + iç GlassButton/GlassSegmentedControl'e geçer |
| material | prop | `'glass'\|'flat'` | — (GlassSurface default'u `glass`) | — | İçerikte `flat` önerilir |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | — | `className` birleştirilir |

Ref hedefi yok. `date`/`time`/`type` seçimi tamamen uncontrolled internal
state'tir — dışarıdan `value`/`defaultValue` ile açılmaz/kapanmaz (bkz. Açık
kararlar); tek dışa açık temas noktası `onRequest` callback'idir.

## 5. Seçenek eksenleri

`material` yok sayılırsa tek gerçek eksen `variant`'tır; `size` ekseni **N/A —
gerekçe:** component'in tüm ölçüleri (`--lg-control-sm` chip yüksekliği) sabit,
sayfa yoğunluğu `variant` ile çözülür.

| Kural | Davranış |
|---|---|
| `days` boş | Gün şeridi boş render edilir (hiçbir chip yok) — üst seviyede boş durum ele alınmalı (Açık kararlar) |
| Seçili günün `slots` boş | Saat ızgarası yerine "Bu gün için uygun saat bulunmuyor." metni |
| `tourTypes` tek eleman | Segment barı tek segmentle render edilir, gezinme no-op |
| Yasak kombinasyon | Yok — eksenler bağımsız |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| selectedDate | internal, `days[0]?.date` ile başlar | — | seçili gün chip'i `aria-checked="true"` |
| selectedTime | internal, gün değişince `undefined`'a sıfırlanır | "Randevu iste" disabled/enabled | seçili saat `aria-checked="true"` |
| selectedType | internal, `tourTypes[0]` ile başlar | — | `GlassSegmentedControl` `aria-checked` |
| submitted | internal, yalnız "Randevu iste" başarıyla tetiklenince dolar | tüm form → onay ekranı | `role="status"` |

Katman sırası: availability (slot.available) → value (selectedDate/Time/Type)
→ interaction (submitted). hover/focus/active prop değildir, component'te yok.

## 7. Davranış

- **Pointer/klavye:** Gün ve saat grupları roving-tabindex `radiogroup`
  deseni paylaşır (ortak `nextRovingKey` yardımcı fonksiyonu): ArrowRight/Down
  bir sonraki etkin öğeye, ArrowLeft/Up öndekine, Home/End uçlara gider;
  disabled saatler gezinmede atlanır, sarmalı döngü (son → baş).
- **Focus akışı:** Gün seçince odak chip'te kalır (yeniden focus taşınmaz);
  saat seçimi sıfırlanınca roving tabindex referansı `selectedTime ?? ilk
  uygun saat`'e düşer (hiç saat seçilmemişken de grup tab sırasında kalır).
- **Controlled/uncontrolled:** Tamamen uncontrolled; `onRequest` tek çıkış
  noktası. "Yeni randevu planla" tıklanınca `submitted=null`'a döner, önceki
  gün/saat/tur seçimleri korunur (yeniden seçmeye gerek kalmaz).
- **Async:** Yok — `onRequest` senkron çağrılır, aynı tık içinde onay
  ekranına geçilir (yükleme/hata durumu component dışı, çağıranın işi).
- **Overlay:** Yok, portalsız, sayfa akışında.

## 8. İçerik kuralları

- Gün chip'i alt metni: `"{n} saat uygun"` / `"Dolu"` (n=0 dahil, `slots`
  boşsa da "Dolu" görünür — Açık kararlar'da ayrım notu).
- Buton/başlık metinleri hardcoded Türkçe: "Gün seç", "Saat seç", "Tur tipi",
  "Randevu iste", "Randevunuz alındı", "Takvime ekle", "Yeni randevu planla",
  "Bu gün için uygun saat bulunmuyor." — i18n borcu.
- Gün etiketi (`label`) ve saat (`time`) biçimi tamamen çağırana aittir;
  component doğrulama/parse yapmaz (`date` yalnız ISO string olarak taşınır,
  `Date` nesnesine çevrilmez).
- Uzun `tourTypes` etiketleri segment barını daraltmaz, yatay scroll'a düşer
  (`GlassSegmentedControl` sözleşmesi).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | padding/gap | `--lg-space-5` / `--lg-space-3` / `--lg-space-2` |
| root (flat) | background / border | `--lg-surface` / `--lg-hairline` (GlassSurface) |
| dayChip / slot | border-radius | `--lg-radius-chip` |
| dayChip / slot yükseklik | min-height | `--lg-control-sm` |
| dayChipActive / slotActive | background/color | `--lg-accent` / `--lg-accent-contrast` |
| checkIcon | background | `--lg-success` |
| resetLink | color | `--lg-accent` |
| focus halkası | outline | `--lg-accent`, yalnız `:focus-visible` |

**Borç (raw):** chip/slot iç `padding` (6-14px), `slotGrid` minmax kolon
genişliği (76px), `checkIcon` çapı (40px) ve font boyutları (11.5-19px) —
mevcut kütüphane konvansiyonuyla tutarlı (bkz. GlassSellerCard §9).

## 10. Storybook kapsamı

Var: Default, Playground, Variants (`grid`/`compact`), Materials
(`glass`/`flat`), States (boş form · dolu gün · onay ekranı, play ile),
Uzun İçerik (uzun tur tipi etiketleri + uzun gün etiketi), Erişilebilirlik
(docs), Mobil (Responsive, `compact` + `pointer: coarse` dokunma hedefi).
**Sizes: N/A** — `size` ekseni yok (§5). Temalar: proje toolbar'ıyla
(Kağıt/Grafit) her story'de sınanır, ayrı story gerekmez.

## 11. Test kabul kriterleri

- [x] ilk gün varsayılan seçili, saat ızgarası ona göre render olur (unit)
- [x] dolu slot `disabled` + tıklanamaz (unit)
- [x] gün değişince seçili saat sıfırlanır, yeni günün slotları görünür (interaction)
- [x] boş `slots` günü "uygun saat bulunmuyor" metnini gösterir (unit)
- [x] gün+saat seçilmeden "Randevu iste" disabled, seçilince aktif (unit)
- [x] gönderimde `onRequest` doğru `{date,time,type}` ile çağrılır + onay ekranı açılır (interaction)
- [x] "Takvime ekle" `onRequest`'i tekrar tetiklemez (interaction, noop)
- [x] tur tipi varsayılan üç seçenekle render olur ve değiştirilebilir (unit)
- [x] özel `tourTypes` render edilir (unit)
- [x] `variant="compact"` kökte `data-variant` ile işaretlenir (unit)
- [ ] ok tuşlarıyla roving tabindex gezinmesi (interaction — SegmentedControl'de kapsanan desenle aynı, ayrıca eklenmedi)
- [ ] `:focus-visible` halkası ve dokunma hedefi ≥44px (visual, Chrome)

## 12. Do / Don't

- ✅ İçerik sayfasında `material="flat"`; iç GlassButton/SegmentedControl cam kalır.
- ✅ `onRequest`'i sunucuya kayıt için kullan; onay ekranı yalnız iyimser
  (optimistic) UI'dır, sunucu hatasını component yönetmez.
- ✅ `days` dizisini her render'da yeniden hesapla (server state) — component
  kendi içinde tarih/saat üretmez.
- ❌ "Takvime ekle"ye gerçek takvim entegrasyonu bağlamayı bu component'in
  içine gömme — noop'tur, entegrasyon çağıranın `onRequest` sonrası akışına
  aittir (v2'de ayrı `onAddToCalendar` prop'u düşünülebilir).
- ❌ `days[].date`'i farklı formatlarda karıştırma — her zaman ISO string.

**Bilinen kısıtlar:** `date`/`time`/`type` controlled değil (yalnız
`onRequest` ile dışarı sızar) · "Dolu" chip metni boş `slots` ile tamamen
dolu `slots`'u ayırt etmez (ikisi de aynı metni gösterir) · i18n yok ·
`days` boşken gün şeridi tamamen boş kalır (boş durum mesajı yok).

**Açık kararlar:** `value`/`defaultValue` + `onDateChange`/`onTimeChange`
controlled çiftlerinin eklenmesi · "Dolu" (kapalı) / "0 saat uygun" (tamamen
dolu) ayrımının içerik düzeyinde netleştirilmesi · `onAddToCalendar` ayrı
callback'i · `days` boşken component içi boş durum mesajı.

**Changelog:** 2026-07-17 — İlk sürüm.
