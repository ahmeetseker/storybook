# PageContainer — sözleşme

Sitenin tek yatay ölçü kaynağı. Her rotanın kök öğesi budur.

## 1. Sorumluluk

PageContainer şunları **tek başına** sahiplenir:

- içerik genişliği (kademe)
- sayfa kenar boşluğu (`--lg-container-gutter`)
- yüzen kabuk payı (header üstte, dock altta)
- sayfanın container-query kabı (`container-name: page`)
- `<main id="main-content">` landmark'ı — kabuğun "İçeriğe geç" bağlantısının hedefi

Bir feature CSS'inde şunlardan biri görünüyorsa sorumluluk sızmıştır ve geri
alınır: `inline-size: min(100%, …rem)` · `margin-inline: auto` sayfa kökünde ·
`--lg-shell-header-offset` / `--lg-shell-dock-offset` · `container-type` sayfa
kökünde.

## 2. Eksenler

| Prop | Değerler | Varsayılan |
|---|---|---|
| `size` | `narrow` · `base` · `wide` | `base` |
| `shellInsets` | `boolean` | `true` |

Kademe seçimi içeriğin rolüne göredir, ekran boyutuna göre değil:

| Kademe | Ölçü | Rota örneği |
|---|---|---|
| `narrow` | 72rem | ilan detayı — okuma ve tek kolonlu karar akışı |
| `base` | 88rem | hesabım, bölgeler, ofisler, favoriler, karşılaştır, ilan ver |
| `wide` | 104rem | emlak, mesajlar, AI danışman — panelli çalışma masaları |

`shellInsets={false}` yalnız kabuğu kendisi gizleyen odaklı akışlarda kullanılır
(ilan verme sihirbazı). Dikey payı o sayfa kendisi verir.

## 3. Kademe değiştirmenin görünmeyen etkisi

Kap aynı zamanda container-query kabıdır: kademe, sayfanın `@container`
eşiklerinin hangi genişlikte ölçüldüğünü belirler. Kademe değiştirirken o
sayfanın eşikleri hâlâ tetiklenebiliyor mu kontrol edilir.

Somut örnek: `emlak` sayfasında `@container page (min-width: 96rem)` kuralı
dört kolonluk ızgara açar. Kap 92rem'de sınırlıyken bu kural **hiç
eşleşmiyordu**; `wide` (104rem) kademesiyle ilk kez çalışır hale geldi.

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
