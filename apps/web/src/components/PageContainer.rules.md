# PageContainer — sözleşme

Sitenin tek yatay ölçü kaynağı. Her rotanın kök öğesi budur.

## 1. Sorumluluk

PageContainer şunları **tek başına** sahiplenir:

- içerik genişliği (`--lg-container-page` standardı)
- sayfa kenar boşluğu (`--lg-container-gutter`)
- yüzen kabuk payı (header üstte, dock altta)
- sayfanın container-query kabı (`container-name: page`)
- `<main id="main-content">` landmark'ı — kabuğun "İçeriğe geç" bağlantısının hedefi

Bir feature CSS'inde şunlardan biri görünüyorsa sorumluluk sızmıştır ve geri
alınır: `inline-size: min(100%, …rem)` · `max-inline-size` sayfa kökünde ·
`margin-inline: auto` sayfa kökünde · `--lg-shell-header-offset` /
`--lg-shell-dock-offset` · `container-type` sayfa kökünde.

## 2. Genişlik standardı — her rotada aynı

Genişlik artık kademe değil TEK formüldür (tanımı token dosyasında,
`--lg-container-page`):

```
inline-size: min(100%, min(max(80%, 72rem), 104rem))
```

- **Dar ekran** (kapsayıcı < 72rem): kap kenara dayanır; yatay ritim yalnız
  `--lg-container-gutter`'dan gelir ve iki yanda eşittir.
- **Orta/geniş**: içerik kapsayıcının ~%80'i, merkezli — kalan boşluk iki
  yana eşit dağılır.
- **Çok geniş** (%80 > 104rem): kap 104rem tavanında durur.

Yüzde kapsayıcı bloğa göre çözüldüğü için raylı kabuklar da (hesabım) aynı
orana uyar: ray düşüldükten sonra kalan sütunun ~%80'i. Sol ray hariç içerik
alanı her sayfada aynı kurala oturur.

Eski `size` prop'u (`narrow`/`base`/`wide`) kaldırıldı — kademeler rotalar
arasında yatay kayma üretiyordu. Yeni bir sayfaya farklı bir genişlik
GEREKTİĞİNİ düşünüyorsan önce bu sözleşmeyi güncelle; PageContainer'ı feature
CSS'inden ezme.

| Prop | Değerler | Varsayılan |
|---|---|---|
| `shellInsets` | `boolean` | `true` |

`shellInsets={false}` yalnız kabuğu kendisi gizleyen odaklı akışlarda kullanılır
(ilan verme sihirbazı, hesap kabuğu — dikey nefes `AccountAppShell`'den gelir).

## 3. Genişlik formülünün görünmeyen etkisi

Kap aynı zamanda container-query kabıdır: sayfanın `@container` eşikleri artık
viewport'un ~%80'i üzerinden ölçülür. Yüksek eşikler buna göre değerlendirilir.

Somut örnek: `emlak` sayfasında `@container page (min-width: 96rem)` kuralı
dört kolonluk ızgara açar. Kap `wide` (104rem) kademesindeyken ≈1700px
viewport'ta tetikleniyordu; %80 standardında kap 96rem'i ancak ≈2020px
viewport'ta aşar — kural yalnız çok geniş ekranlarda açılır.

## 4. Sorgu kabı kendini sorgulayamaz

Bir öğe kendi `@container` kabı olamaz. Sayfa içi yerleşimini genişliğe göre
değiştiren bir blok (ör. ilan detayında `.shell`) PageContainer'ın **içinde**
durur, onun yerine geçmez. Aynı sebeple PageContainer'ın kendi dikey nefesi
`@container` ile değil akışkan bir `clamp()` ile ölçeklenir.

## 5. Kabuk payı nereden gelir

Pay sabit sayı değildir, kabuğun kendi token'larından okunur:

- `--lg-shell-header-offset` = adanın üst boşluğu + bar yüksekliği
  (`--lg-space-4 + 2 × --lg-space-2 + --lg-control-md` = 76px, Chrome'da ölçüldü)
- `--lg-shell-dock-offset` = dock yüksekliği rezervi

Kabuk dışında (Storybook, izole test) her iki token da tanımsızdır ve fallback
`0px` ile pay ayrılmaz — component kabuğunu varsaymaz.

## 6. Erişilebilirlik

- Her rotada tam olarak bir `<main id="main-content">` üretilir. Geçişten önce
  `regions`, `ofisler`, `favoriler` ve `karsilastir` bu id'yi taşımıyordu; skip
  link hedefsizdi.
- Odak, yapışkan kabuk katmanlarının altında kalmaz: kabuk `scroll-margin-block`
  ile header ve dock payını odaklanan öğeye taşır (AAA 2.4.12).
