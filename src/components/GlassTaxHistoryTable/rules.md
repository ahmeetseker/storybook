---
name: GlassTaxHistoryTable
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassTaxHistoryTable Kuralları

## 1. Amaç

İlan detayında bir taşınmazın yıllara göre vergi/aidat tutarlarını ve
önceki yıla göre yüzde değişimini gösteren, salt-okunur, düz (cam olmayan)
içerik tablosu.

- **Kullan:** yıl bazlı vergi/aidat/gider geçmişi — tek boyutlu zaman
  serisi, satır etkileşimi (sıralama/seçim) gerekmiyor.
- **Kullanma:** genel sıralanabilir/seçilebilir kayıt listesi (→
  `GlassTable`), anahtar–değer çiftleri (→ `GlassSpecTable`), fiyat
  trendinin grafiksel gösterimi (bu component'in kapsamı dışında, v2).

| İlgili | Farkı |
|---|---|
| GlassTable | Genel amaçlı, sıralanabilir + seçilebilir; sütun sayısı değişken |
| GlassSpecTable | `dl` etiket/değer çifti; zaman serisi/yön göstergesi yok |

## 2. Semantik sözleşme

- Kök: `<section>` — `aria-labelledby` ile içindeki `<h3>` başlığa bağlıdır
  (component her zaman kendi başlığını üretir, dışarıdan `aria-label`
  vermeye gerek yoktur).
- Başlık altında yatay kaydırma için `<div>` sarmalayıcı (`overflow-x:
  auto`) içinde gerçek `<table>` → `<thead>` > `<tr>` > `<th scope="col">`.
- Değişim hücresi: ok karakteri (`▲`/`▼`) `aria-hidden="true"`; yön bilgisi
  ayrıca görsel olarak gizli (`srOnly`) "Artış:"/"Azalış:"/"Değişim yok:"/
  "Değişim bilgisi yok" metniyle taşınır — durum yalnız renkle iletilmez.
- DOM değişmezi: her satır tam bir `<tr>`; React `key` = `${row.year}-${index}`
  (ham veri `year` DOM `id`'sine YAZILMAZ, yalnız React key olarak kullanılır —
  başlık `id`'si `useId()`'den gelir).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | — | `string` | default `'Vergi ve Aidat Geçmişi'`; `<h3>` olarak render edilir |
| rows | ✅ | `GlassTaxHistoryTableRow[]` | sıra = görünüm sırası; ilk satır en yeni yıl kabul edilir |
| caption | — | `string` | verilirse tablo altında dipnot olarak görünür |
| "Güncel" etiketi | türetilmiş | — | yalnız `rows[0]`'da, `data-latest` ile eşleşir |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| rows | prop | `GlassTaxHistoryTableRow[]` (`{year, amount, changePercent?}`) | — (zorunlu) | — | Zaten çağıran tarafından doğru yıl sırasına (en yeni → en eski) dizilmiş veri |
| title | prop | `string` | `'Vergi ve Aidat Geçmişi'` | — | Kart başlığı, aynı zamanda tablonun erişilebilir adı |
| caption | prop | `string` | — | — | Verilirse tablo altında kaynak/dipnot metni |
| ...rest | — | `HTMLAttributes<HTMLElement>` (`title` VE `children` hariç) | — | — | Kök `<section>` elemanına geçer; `children` tip düzeyinde omit edilmiştir (bkz. §12) |

`GlassTaxHistoryTableRow`:

| Alan | Type | Zorunlu | Açıklama |
|---|---|---|---|
| year | `string` | ✅ | Dönem yılı — ör. `'2026'` |
| amount | `string` | ✅ | Hazır biçimlendirilmiş tutar — ör. `'4.820 TL'` (biçimlendirme çağıranın işi) |
| changePercent | `number` | — | Önceki yıla göre değişim: pozitif artış, negatif azalış; verilmezse veya `Number.isFinite` değilse (`NaN`/`Infinity`) değişim kolonu veri-yok durumunu (`—`) gösterir |

Ref hedefi: yok (v1). Event sözleşmesi: yok — component tamamen salt-okunur,
kullanıcı etkileşimi/callback taşımaz.

## 5. Seçenek eksenleri

Eksen yok (`material`/`tone`/`size`/`variant`/`thickness`/`tint`/`prominent`
N/A — flat içerik yüzeyi, tek görünüm, interaktif kontrol yok).

| Kural | Davranış |
|---|---|
| `changePercent` yok veya sonlu değil | değişim hücresi `—` + srOnly "Değişim bilgisi yok" |
| `changePercent === 0` | ok ikonu YOK, nötr renkte `%0,0` + srOnly "Değişim yok:" |
| `changePercent > 0` | `▲` + `--lg-danger` renkli ok + srOnly "Artış:" |
| `changePercent < 0` | `▼` + `--lg-success` renkli ok + srOnly "Azalış:" |
| `rows[0]` | hafif vurgulu satır (tint zemin + kalın metin) + görünür "Güncel" etiketi |
| `rows.length === 0` | tek satırlık, tüm sütunları kaplayan "Kayıt bulunamadı." |

Yasak kombinasyon yok.

## 6. State modeli

Component'in kendi iç state'i yoktur (tamamen prop'tan türetilen salt-okunur
görünüm). Katman sırası: availability (`rows` boş mu → boş durum) → türetme
(`index === 0` → "Güncel"; `changePercent` işareti/sonluluğu → hücre
varyantı).

## 7. Davranış

- **Sıralama:** component sıralama YAPMAZ — `rows`'u aynen render eder,
  yalnız ilk satırı "en yeni yıl" kabul edip vurgular. Yıl sırasını doğru
  vermek (en yeni → en eski) çağıranın işidir.
- **Klavye:** component'te odaklanabilir/interaktif eleman yoktur (buton,
  link, form kontrolü yok) — bu yüzden `pointer: coarse` 44px kuralı ve
  `:focus-visible` halkası N/A (uygulanacak bir kontrol yok).
- **Yön hesaplaması:** `changePercent > 0` → artış, `< 0` → azalış,
  `=== 0` → nötr (ok yok), `undefined`/sonlu değil → veri yok (`—`). Bu
  dörtlü ayrım TEK yerde (`ChangeCell`) hesaplanır.
- **Sayı biçimi:** yüzde metni işaretsizdir (`Math.abs`), yön ok ikonuyla
  taşınır; `%N,N` biçimi `toLocaleString('tr-TR', {minimumFractionDigits:1,
  maximumFractionDigits:1})` ile üretilir (Türkçe ondalık virgül).
- **Responsive:** breakpoint YOK — tablo `overflow-x: auto` sarmalayıcı
  içinde dar ekranda yatay kaydırmada kalır (içsel akış kuralı,
  `ErisilebilirlikMotionResponsive.mdx`). 2026-07-24: eski 480px satır→kart
  reflow'u kaldırıldı.

## 8. İçerik kuralları

- Uzun kaynak notu (`caption`) satır içinde serbestçe kırılır.
- Tutar biçimlendirmesi (`4.250.000 TL`) çağıranın işi; `amount` zaten hazır
  string olarak verilir (`GlassTable`/`GlassSpecTable` ile aynı konvansiyon).
- Yüzde metni her zaman tek ondalık basamakla gösterilir (`%N,N`) — tam sayı
  değişimlerde bile (`%0,0`, `%8,0`).
- Boş `rows`: tek satırlık, tüm sütunları kaplayan (`colSpan=3`) ortalanmış
  metin; varsayılan "Kayıt bulunamadı." (özelleştirme prop'u v1'de yok —
  §12 açık karar).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| wrapper | background/border/radius/padding | `--lg-surface` / `--lg-hairline` / `--lg-radius-media` / `--lg-space-4` | — |
| title | tipografi | `--lg-text-headline` / `--lg-label` | — |
| th | renk/tipografi | `--lg-label-secondary` / `--lg-text-footnote` | — |
| tr | ayraç | `--lg-hairline` | en yeni yıl: `color-mix(--lg-accent 6%)` zemin + kalın metin |
| değişim metni | renk | `--lg-label` (artış/azalış) / `--lg-label-secondary` (nötr/veri yok) | renk asla `--lg-danger`/`--lg-success` ile karıştırılmaz — bu tonlar YALNIZ ok ikonunda |
| ok ikonu | renk | `color-mix(in srgb, var(--lg-danger) 65%, var(--lg-label))` (artış) / `color-mix(in srgb, var(--lg-success) 65%, var(--lg-label))` (azalış) | nötr/veri-yok durumunda render edilmez; ham semantik token YASAK — bkz. §9 kontrast notu |
| "Güncel" etiketi | zemin/metin | `color-mix(--lg-accent 12%, --lg-surface)` / `color-mix(--lg-accent 70%, --lg-label)` / `--lg-radius-capsule` | AI rozetiyle aynı görsel tarif — kasıtlı kopya CSS (bkz. dalga1-kontrat.md §AI-first); burada AI içeriği DEĞİL, "en güncel yıl" durumu işaretlenir |
| caption | tipografi | `--lg-text-caption` / `--lg-label-secondary` | — |

**Kontrast notu (2026-07-17 fix):** ok ikonu rengi ham `var(--lg-danger)`/
`var(--lg-success)` yerine `color-mix(in srgb, var(--lg-<tone>) 65%,
var(--lg-label))` kullanır. Açık temada ham `--lg-success` beyaz zemine
karşı ~2,2:1 kontrastta kalıp anlam taşıyan grafik için WCAG 3:1 eşiğini
kaçırıyordu (ham `--lg-danger` ~3,55:1 ile sınırda geçiyordu, tutarlılık
için o da aynı teknikle koyulaştırıldı). `--lg-label` ile karışım açık
temada rengi koyulaştırarak kontrastı doğru yönde artırır — aynı desen
`GlassTimeline`'daki ton işaretlerinde de kullanılır, kasıtlı tekrar.

**Borç (raw / mikro-geometri):** "Güncel" etiketi dikey padding'i component
kökünde yerel değişken `--tax-latest-pad-block: 2px` olarak toplanır (token
karşılığı yok) · sr-only clip tekniği (diğer component'lerle aynı raw
değerler, ortak yardımcıya taşınmadı). 2026-07-24: ok karakteri ve "Güncel"
etiketi font-size'ı `--lg-text-badge`'e, etiket yatay padding'i
`--lg-space-2`'ye taşındı; 480px kırılım noktası borcu breakpoint'in
kaldırılmasıyla kapandı.

## 10. Storybook kapsamı

Var: Default, Playground, DegisimTurleri (dört değişim durumu bir arada:
artış/azalış/nötr/veri yok), Empty, UzunIcerik, Responsive (mobile
viewport), Erisilebilirlik (docs açıklamalı).
**Eksik:** Sizes/Variants (N/A — eksen yok, §5).

## 11. Test kabul kriterleri

- [x] varsayılan başlık render edilir, tablo `aria-labelledby` ile ona
      bağlanır (unit)
- [x] özel `title` prop'u render edilir (unit)
- [x] her satırın `year`/`amount` değeri render edilir (unit)
- [x] yalnız `rows[0]` "Güncel" etiketi + `data-latest` taşır (unit)
- [x] artış: `▲` (`aria-hidden`) + işaretsiz `%N,N` metni + "Artış:" srOnly
      metni (unit)
- [x] azalış: `▼` + "Azalış:" srOnly metni (unit)
- [x] `changePercent === 0`: ok YOK, nötr `%0,0` + "Değişim yok:" srOnly
      metni (unit)
- [x] `changePercent` verilmemiş VEYA sonlu değil (`NaN`/`Infinity`): `—` +
      "Değişim bilgisi yok" srOnly metni; ham `NaN` asla ekrana yazılmaz
      (unit)
- [x] boş `rows` → varsayılan boş durum metni (unit)
- [x] `caption` verilince görünür, verilmeyince hiç render edilmez (unit)
- [ ] dar ekranda tablo yatay kaydırma davranışı (visual, Chrome)
- [ ] Ok ikonu renk kontrastı (visual)

## 12. Do / Don't

- ✅ `rows`'u en yeni yıl önce olacak şekilde ver — component sıralama
  yapmaz, yalnız ilk elemanı vurgular.
- ✅ `amount`'ı hazır TR biçimli string olarak ver (`4.820 TL`).
- ✅ Değişim yüzdesini `changePercent` sayısal alanından ver — component
  işareti (yön) kendi hesaplar, metni kendisi biçimlendirir.
- ❌ `changePercent` içine önceden biçimlendirilmiş string/işaret koyma
  (`'+12.4%'` gibi) — yalnız ham `number` bekler.
- ❌ Değişim yönünü yalnız renkle ayırt etme varsayımıyla `caption`/başka
  metinde tekrar açıklama yapma ihtiyacı yok — component zaten srOnly yön
  metni sağlıyor.

**Bilinen kısıtlar:** boş durum metni özelleştirilemez (v1 sabit "Kayıt
bulunamadı.") · satır etkileşimi (tıklama/detay açma) yok — salt görüntüleme
· en yeni yıl tespiti her zaman `rows[0]`'dır, tarih alanına bakılmaz
(çağıran sıralamazsa yanlış satır vurgulanır).

**Açık kararlar:** boş durum metni için `emptyState` prop'u eklenmesi (v2) ·
`changePercent` yerine `previousAmount` verilip yüzdenin component
tarafından hesaplanması (v1'de bilinçli olarak dışarıda bırakıldı — ham
sayısal input daha öngörülebilir).

**Changelog:**
- 2026-07-17 — İlk sürüm: yıl/tutar/değişim üç sütunlu düz tablo, dört
  durumlu değişim göstergesi (artış/azalış/nötr/veri yok — renk yalnız
  ikonda, metin nötr), en yeni yıl vurgusu, 480px altı kart görünümü.
- 2026-07-17 — QA fix (Codex dalga4 raporu): (1) `children` prop tipten
  açıkça omit edildi (`Omit<HTMLAttributes<HTMLElement>, 'title' |
  'children'>`) — önceden tip children'a izin verip DOM'da sessizce
  yutuyordu; (2) ok ikonu rengi açık temada 3:1 anlamlı-grafik eşiğini
  kaçırdığı için `color-mix(in srgb, var(--lg-<tone>) 65%,
  var(--lg-label))` ile koyulaştırıldı (bkz. §9 kontrast notu). Her iki
  fix için regresyon testi eklendi.
- 2026-07-24 — Tasarım sistemi uyum düzeltmesi: `480px` satır→kart reflow
  breakpoint'i kaldırıldı (içsel akış — `overflow-x: auto` yatay kaydırma
  kalır), `data-label` attribute'ları söküldü; ok + "Güncel" etiketi
  font-size → `--lg-text-badge`, etiket yatay padding → `--lg-space-2`,
  dikey padding yerel mikro-geometri değişkenine (`--tax-latest-pad-block`)
  taşındı. Görsel kimlik korunur (yalnız 10.5→11px etiket kayması).
