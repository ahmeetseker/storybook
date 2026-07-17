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
| Onay ekranı | otomatik | ✓ ikon + özet + (opsiyonel) "Takvime ekle" + "Yeni randevu planla" | Yalnız gönderim sonrası, internal state; "Takvime ekle" yalnız `onAddToCalendar` verilmişse render edilir |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| days | prop | `GlassTourDay[]` | — (zorunlu) | — | `{date, label, slots:{time,available}[]}` |
| tourTypes | prop | `string[]` | `['Yerinde','Canlı video','3D self-tur']` | — | `GlassSegmentedControl` seçeneklerine `{value,label}` olarak eşlenir |
| onRequest | prop | `(r: {date,time,type}) => void` | — (zorunlu) | — | Yalnız "Randevu iste" tıklamasında, gün+saat doluyken çağrılır. **Zorunludur** — onay ekranı yalnız bu callback çağrıldıktan sonra iyimser (optimistic) açılır, callback'siz "başarı" gösterilemez (bkz. §7) |
| onAddToCalendar | prop | `() => void` | — (opsiyonel) | — | Onay ekranındaki "Takvime ekle" butonunu tetikler; verilmezse buton hiç render edilmez (noop buton yasak) |
| variant | prop | `'grid'\|'compact'` | `'grid'` | — | `compact`: tek kolon saat listesi + dar panel (`max-width: 300px`) |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | — | Surface + iç GlassButton/GlassSegmentedControl'e geçer |
| material | prop | `'glass'\|'flat'` | — (GlassSurface default'u `glass`) | — | İçerikte `flat` önerilir |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | — | `className` birleştirilir |

Ref hedefi yok. `date`/`time`/`type` seçimi tamamen uncontrolled internal
state'tir — dışarıdan `value`/`defaultValue` ile açılmaz/kapanmaz (bkz. Açık
kararlar); dışa açık temas noktaları `onRequest` (zorunlu) ve `onAddToCalendar`
(opsiyonel) callback'leridir.

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
| selectedDate | internal, `days[0]?.date` ile başlar; **render sırasında türetilmiş doğrulama**: ham state artık `days` içinde yoksa `days[0]?.date`'e düşer | — | seçili gün chip'i `aria-checked="true"` |
| selectedTime | internal, gün değişince `undefined`'a sıfırlanır; **render sırasında türetilmiş doğrulama**: ham state, geçerli günün `slots`'unda `available:true` olarak yoksa `undefined`'a düşer | "Randevu iste" disabled/enabled | seçili saat `aria-checked="true"` |
| selectedType | internal, `tourTypes[0]` ile başlar; **render sırasında türetilmiş doğrulama**: ham state artık `tourTypes` içinde yoksa `tourTypes[0]`'a düşer | — | `GlassSegmentedControl` `aria-checked` |
| submitted | internal, yalnız "Randevu iste" başarıyla tetiklenince dolar | tüm form → onay ekranı | `role="status"` |

Katman sırası: availability (slot.available) → value (selectedDate/Time/Type,
her render'da `days`/`tourTypes`'a karşı uzlaştırılır) → interaction
(submitted). Uzlaştırma bir `useEffect` değil, render gövdesinde saf türetim
(stale seçim hiçbir zaman bir render karesi boyunca bile dışarı sızmaz —
örn. `onRequest`'e stale `date`/`time` asla gitmez). hover/focus/active prop
değildir, component'te yok.

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
- **İyimser (optimistic) onay:** `handleRequest` `onRequest(request)`'i
  **senkron çağırdıktan hemen sonra**, koşulsuz `setSubmitted(request)` ile
  onay ekranına geçer — component `onRequest`'in dönüş değerini/başarısını
  beklemez veya sormaz. Bu yüzden `onRequest` **zorunlu prop'tur**: opsiyonel
  olsaydı, çağıran hiç geçmese bile onay ekranı sanki sunucuya kayıt olmuş
  gibi açılırdı (yanlış-pozitif "Randevunuz alındı"). Zorunlu yapmak, en
  azından çağıranın bilinçli olarak bir callback sağlamasını (ör. gerçek API
  çağrısı yapan ya da en azından niyet ileten bir fonksiyon) garanti eder;
  gerçek sunucu onayını component beklemez — bu v1 sınırıdır (bkz. Açık
  kararlar: "async onay için controlled confirmation v2").
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
- [x] `onAddToCalendar` verilmezse onay ekranında "Takvime ekle" butonu render edilmez (unit)
- [x] `onAddToCalendar` verilince "Takvime ekle" görünür, tıklanınca yalnız `onAddToCalendar` çağrılır, `onRequest` tekrar tetiklenmez (interaction)
- [x] tur tipi varsayılan üç seçenekle render olur ve değiştirilebilir (unit)
- [x] özel `tourTypes` render edilir (unit)
- [x] `variant="compact"` kökte `data-variant` ile işaretlenir (unit)
- [x] seçili gün yeni `days`'te artık yoksa render sırasında ilk güne uzlaştırılır (interaction, rerender)
- [x] boş `days`'ten dolu `days`'e geçince ilk gün tabbable (seçili) olur (interaction, rerender)
- [x] seçili saat yeni `slots`'ta artık `available` değilse "Randevu iste" tekrar disabled olur (interaction, rerender)
- [x] seçili tur tipi yeni `tourTypes`'te artık yoksa ilk tipe uzlaştırılır (interaction, rerender)
- [ ] ok tuşlarıyla roving tabindex gezinmesi (interaction — SegmentedControl'de kapsanan desenle aynı, ayrıca eklenmedi)
- [ ] `:focus-visible` halkası ve dokunma hedefi ≥44px (visual, Chrome)

## 12. Do / Don't

- ✅ İçerik sayfasında `material="flat"`; iç GlassButton/SegmentedControl cam kalır.
- ✅ `onRequest`'i sunucuya kayıt için kullan; onay ekranı yalnız iyimser
  (optimistic) UI'dır, sunucu hatasını component yönetmez (bkz. §7).
- ✅ `onAddToCalendar` verildiğinde gerçek takvim entegrasyonuna (ör. .ics
  indirme, Google Calendar linki) bağla; verilmezse buton hiç render edilmez
  — noop buton kalmaz.
- ✅ `days` dizisini her render'da yeniden hesapla (server state) — component
  kendi içinde tarih/saat üretmez. Seçili gün/saat/tip `days`/`tourTypes` ile
  artık uyumsuzsa component render sırasında kendini otomatik uzlaştırır,
  çağıranın ayrıca sıfırlama yapmasına gerek yok.
- ❌ `onRequest`'i opsiyonel say / geçmeden component'i kullan — TypeScript
  bunu zaten engeller (prop zorunlu).
- ❌ `days[].date`'i farklı formatlarda karıştırma — her zaman ISO string.

**Bilinen kısıtlar:** `date`/`time`/`type` controlled değil (yalnız
`onRequest` ile dışarı sızar) · `onRequest` başarı/hata dönüşünü component
beklemez — çağrıldığı an onay ekranı koşulsuz açılır (iyimser UI; gerçek
sunucu onayı yok, bkz. Açık kararlar) · "Dolu" chip metni boş `slots` ile
tamamen dolu `slots`'u ayırt etmez (ikisi de aynı metni gösterir) · i18n yok
· `days` boşken gün şeridi tamamen boş kalır (boş durum mesajı yok).

**Açık kararlar:** `value`/`defaultValue` + `onDateChange`/`onTimeChange`
controlled çiftlerinin eklenmesi · "Dolu" (kapalı) / "0 saat uygun" (tamamen
dolu) ayrımının içerik düzeyinde netleştirilmesi · **async onay için
controlled confirmation v2** — `onRequest`'in bir Promise döndürüp
reddedilirse onay ekranına hiç geçilmemesi (veya hata state'i gösterilmesi)
ve/veya `submitted`'ın dışarıdan `value`/`defaultValue` ile kontrol
edilebilir olması; bu v1'de yok, `onRequest` çağrıldığı an her zaman iyimser
onaya geçilir · `days` boşken component içi boş durum mesajı.

**Changelog:** 2026-07-17 — İlk sürüm. · 2026-07-17 — Code review fix:
`onRequest` zorunlu prop yapıldı (iyimser onay artık yalnız gerçek bir
callback verildiğinde açılır); `days`/`tourTypes` değişince seçili
gün/saat/tip render sırasında türetilmiş doğrulamayla uzlaştırılıyor (stale
seçim sızmaz, boş→dolu `days` geçişinde ilk gün tabbable olur); `onAddToCalendar`
prop'u eklendi, verilmezse "Takvime ekle" hiç render edilmiyor (eski noop
buton kaldırıldı).
