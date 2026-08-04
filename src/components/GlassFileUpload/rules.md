---
name: GlassFileUpload
category: form
status: hazır
lastReviewed: 2026-08-03
---

# GlassFileUpload Kuralları

## 1. Amaç

Sürükle-bırak + tıkla-seç dosya yükleme alanı: cam bırakma alanı, altında
seçilen dosyaların flat listesi. Yalnız dosya SEÇİMİNİ yönetir; ağa yükleme
(progress, retry) çağıranın işidir.

- **Kullan:** ilan fotoğrafı, ekspertiz raporu, tapu/evrak yükleme formları.
- **Kullanma:** avatar gibi tek görselli kırpmalı akışlar (ayrı ihtiyaç),
  upload progress göstermek (→ Açık Kararlar).

| İlgili | Farkı |
|---|---|
| GlassButton | Tek aksiyon; dosya listesi tutmaz |
| GlassGallery | Yüklenmiş görselleri sergiler; seçim yapmaz |

## 2. Semantik sözleşme

- Alan: gerçek `<button type="button">` (GlassSurface) — tıklama gizli
  `<input type="file">`'ı tetikler (button+click deseni).
- Native input DOM'da kalır ama `display:none` + `aria-hidden` + `tabIndex=-1`;
  erişilebilir yüzey button'dır, accessible name = label (+description).
- Hatalar `role="alert"` listesinde (kullanıcı aksiyonu sonrası dinamik içerik).
- Kaldır butonları `aria-label="<ad> dosyasını kaldır"` taşır (ikon-tek kural).
- DOM değişmezleri: (1) input her zaman render edilir, (2) dosya listesi
  `<ul>/<li>` kalır.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| label | ✅ (default'lu) | eylem cümlesi | Kısa; "Dosya seçin veya sürükleyin" |
| description | — | format/sınır ipucu | Secondary renk |
| errors | otomatik | reddedilen dosyalar | Ad + boyut + sınır; bir sonraki seçimde sıfırlanır |
| files | otomatik | ad + boyut + kaldır | Flat liste (içerik katmanı — cam değil) |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| accept | prop | `string` | — | Native input'a geçer (drop'ta zorlanmaz — bkz. Borç) |
| multiple | prop | `boolean` | `false` | false'ta yeni seçim öncekinin yerine geçer |
| maxSize | prop | `number` (byte) | — | Aşan dosya reddedilir + hata listelenir |
| onFiles | event | `(files: File[]) => void` | — | Geçerli listenin HER değişiminde tüm listeyle |
| disabled | prop | `boolean` | `false` | Alan pasif; drop yok sayılır |
| label | prop | `string` | `'Dosya seçin veya sürükleyin'` | Alanın accessible name'i |
| description | prop | `string` | — | Format/sınır ipucu |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| ...rest | — | `HTMLAttributes<div>` | — | Root wrapper'a |

## 5. Seçenek eksenleri

Varsayılan kombinasyon: tekli seçim, sınırsız boyut.

| Yasak / türetilen | Davranış |
|---|---|
| tüm seçim maxSize'ı aşarsa | liste değişmez → `onFiles` çağrılmaz, yalnız hata |
| aynı dosya tekrar seçimi | input her seçimden sonra sıfırlanır → tekrar seçilebilir |
| `multiple=false` + çoklu drop | yalnız ilk geçerli dosya alınır |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| idle | — | — | Hairline kesikli çerçeve |
| drag | dragenter/over | hover | Accent kesikli çerçeve + scale 1.01 |
| hover | CSS | — | Çerçeve koyulaşır |
| focus-visible | CSS | — | 2px `--lg-accent` halka |
| error | maxSize reddi | — | Danger metinli `role="alert"` listesi |
| disabled | prop | drag, hover, click | opacity .45 + `pointer-events: none` |

## 7. Davranış

- İç liste kontrolsüzdür; dışarıdan value verilemez (bilinçli — File nesnesi
  controlled akışa uygun değil). `onFiles` her geçerli değişimde tam listeyle çağrılır.
- Klavye: alan gerçek button → Enter/Space dosya seçiciyi açar; kaldır
  butonları Tab ile gezilir.
- `prefers-reduced-motion`: drag scale'i kapalı, yalnız çerçeve rengi değişir.
- Boyut biçimi: <1 MB → KB (tam sayı), üstü → MB (1 ondalık, Türkçe virgül).

## 8. İçerik

Label eylem dilinde; description'a format + sınır yaz ("PDF, en fazla 2 MB").
Dosya adı kırpılır (ellipsis), boyut `tabular-nums`.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| zone | padding | `--lg-space-5/4` → bp-sm `--lg-space-7/6` |
| zone | border | `--lg-hairline` → drag `--lg-accent` |
| zone icon | color | `--lg-accent` |
| label / description | font | `--lg-text-headline` / `--lg-text-footnote` |
| file satırı | bg / border / radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-media` |
| error | color | `--lg-danger` |
| focus | outline | `--lg-accent` |

Borç: `accept` drop'ta doğrulanmıyor (yalnız dosya seçiciyi filtreler) —
MIME kontrolü eklenmesi değerlendirilecek.

**Borç (raw / mikro-geometri):** kaldır butonu taban boyutu (28px) ve zone
kesikli çerçeve kalınlığı (1.5px) token karşılığı olmadığından component
kökünde yerel değişkene toplandı (`.root { --zone-border-w: 1.5px;
--remove-size: 28px; }`); geçiş süresi/easing (`0.16s ease-out`) süre
token'ı olmadığından raw.

**Dokunma hedefi:** kaldır butonu ikon-tek kontroldür. Görünen kutu her
cihazda 28px kalır (dosya satırını şişirmemesi için) ama `::after` ile her
iki eksende `--lg-control-hit`e (44px) uzanır — satır düz bir `<li>`,
`overflow: hidden` yok, pseudo-eleman gerçekten tıklanır (AAA 2.5.5, imleçli
cihazda da). Bu sayede butonu dokunmatikte görünür şekilde büyüten eski
`pointer: coarse` kuralı gereksizleşti ve kaldırıldı; o kural yeni ölçekte
butonu 44px'e çıkarıp dosya satırını 44'ten 60px'e şişirecekti.

## 10. Storybook kapsamı

Var: Default, IlanFotograflari (multiple+accept), BoyutSinirli (maxSize),
Disabled, Mobil (viewport: mobile1). **Eksik:** drag durumunun forced görseli
(gerçek sürükleme story'de simüle edilemiyor), upload-progress kompozisyonu.

## 11. Test kabul kriterleri

- [x] button rolü + label; input gizli ve focus dışı
- [x] seçim → liste + onFiles tam geçerli listeyle
- [x] maxSize reddi: alert + yalnız geçerliler iletilir
- [x] kaldır: aria-label, listeden çıkar, onFiles kalanla
- [x] drop dosya ekler; dragover görsel durumu açar
- [x] multiple=false yer değiştirir; disabled drop'u yok sayar
- [ ] klavye ile dosya seçici açılışı (jsdom'da native picker yok — manuel QA)

## 12. Do / Don't

- ✅ `maxSize`'ı sunucu sınırıyla eşle; description'da belirt.
- ✅ Yükleme durumunu (progress/hata) listeyi dışarıda kopyalayarak göster.
- ❌ Alanı form submit butonu olarak kullanma (`type="button"` sabittir).
- ❌ `onFiles` içinde listeyi mutasyona uğratma — yeni istek için kopyala.

**Açık kararlar:** drop'ta accept/MIME doğrulaması · upload progress slot'u ·
görsel dosyalar için thumbnail önizleme.

## Changelog

- 2026-07-16: İlk sürüm — button+click deseni, maxSize reddi + alert listesi,
  kontrolsüz iç liste, drag'de accent çerçeve + scale.
- 2026-08-03: Yeni kontrol ölçeği gözden geçirmesi. Kaldır butonunun
  `pointer: coarse` görsel büyütmesi (`--lg-control-sm`) kaldırıldı — yeni
  ölçekte butonu 44px'e çıkarıp satırı şişiriyordu. Yerine görünmez `::after`
  hedef genişletmesi: görünen kutu 28px, hedef 44×44px (her cihazda).
  Bırakma alanı ve dosya satırı ölçüleri değişmedi.
