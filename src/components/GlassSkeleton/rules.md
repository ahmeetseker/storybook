---
name: GlassSkeleton
category: durum
status: hazır
lastReviewed: 2026-07-16
---

# GlassSkeleton Kuralları

## 1. Amaç

Yükleme yer tutucusu: içerik gelmeden önce gerçek yerleşimin gri taslağını
gösterir (metin satırı, daire/avatar, dikdörtgen/medya). Layout kaymasını
önler, algılanan hızı artırır.

- **Kullan:** ilan kartı/listesi ilk yüklenirken, profil başlığı beklerken,
  görsel alanı yer tutarken.
- **Kullanma:** kısa aksiyonların beklemesi (→ `GlassButton loading`),
  belirsiz uzun işlem yüzdesi (→ progress, Açık Kararlar), boş durum
  (veri yok ≠ yükleniyor).

| İlgili | Farkı |
|---|---|
| GlassButton `loading` | Aksiyon içi bekleme; skeleton sayfa/blok içindir |
| GlassAvatar | Gerçek içerik; skeleton onun yer tutucusudur (`variant="circle"`) |

## 2. Semantik sözleşme

- Element: `<span display:block>`; çok satırda grup span'i + satır span'leri.
- **Kök her zaman `aria-hidden="true"`.** Gerekçe: iskelet parçaları anlamsız
  grafiklerdir; ekran okuyucuya N adet boş öğe duyurmak gürültüdür ve yükleme
  bilgisini parçalara dağıtır. Yükleme durumunu **çağıran bölge** tek noktadan
  yönetir: kapsayıcıya `aria-busy="true"` ve/veya `role="status"` içinde tek
  bir "Yükleniyor" mesajı. Böylece AT kullanıcısı bir kez bilgilenir, görsel
  kullanıcı N parçalı taslağı görür.
- Accessible name: yok (bilinçli). Rol: yok.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| bar/daire | ✅ | boş span | Zemin `color-mix(--lg-label 8%, transparent)` |
| shimmer | — (`animate`) | background-image bandı | Ayrı DOM yok; reduced-motion'da kapanır |
| grup | — (`lines>1`) | dikey satır dizisi | `gap: --lg-space-2`; son satır %60 |

`children` yok — skeleton içerik almaz.

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| variant | prop | `'text'\|'circle'\|'rect'` | `'text'` | text 0.9em bar · circle 40px daire · rect 96px medya |
| width | prop | `number\|string` | varyanta göre | Sayı → px; `%` string'i önerilir (akışkan grid) |
| height | prop | `number\|string` | varyanta göre | `lines>1`'de satır başına uygulanır |
| lines | prop | `number` | — | Yalnız `text`; >1 ise grup render olur, son satır %60 |
| animate | prop | `boolean` | `true` | Shimmer; `prefers-reduced-motion`'da otomatik statik |
| ...rest | — | `HTMLAttributes<HTMLSpanElement>` | — | Köke geçer |

Ref hedefi: yok. Event sözleşmesi: yok — etkileşimsiz.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=text`, tek satır, animasyonlu.

| Yasak / türetilen | Davranış |
|---|---|
| `lines` + `variant≠text` | lines yok sayılır (tek parça render) |
| `lines=1` | tek bar (grup açılmaz) |
| son satır genişliği | Türetilir: her zaman %60 — prop'la ezilemez |
| cam malzeme | ❌ — skeleton içerik katmanıdır, GlassSurface sarmaz |
| renk prop'u | ❌ — zemin tek kaynaklıdır (tema token'ı) |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| animasyonlu | `animate=true` | — | 1.4s shimmer bandı (ease-in-out, sonsuz) |
| statik | `animate=false` veya reduced-motion | animasyonlu | Düz %8 label zemini |

hover/focus/active/disabled yok.

## 7. Davranış

- Pointer/keyboard: N/A — etkileşimsiz, focus almaz.
- `prefers-reduced-motion: reduce`: shimmer `animation: none` +
  `background-image: none` — tamamen statik; JS koşulu yok, saf CSS.
- **Responsive:** kendi breakpoint'i yoktur; `%` tabanlı `width` ile
  dolduracağı içerikle aynı akışkan grid'de daralır/genişler (story'lerdeki
  kullanım kalıbı).
- Skeleton, dolduracağı içerikle aynı yerleşimde render edilmeli — geçişte
  layout kayması olmamalı (boyutları çağıran gerçek içeriğe göre verir).

## 8. İçerik

Metin içermez. Satır sayısı, beklenen paragrafın gerçek satır sayısına yakın
seçilir (1–4 tipik); 8+ satır iskeleti gürültüdür — bloklara bölünür.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| zemin | background | `color-mix(--lg-label 8%, transparent)` |
| shimmer bandı | background-image | `color-mix(--lg-label 6%, transparent)` |
| text radius | border-radius | `--lg-radius-chip / 2` |
| rect radius | border-radius | `--lg-radius-media` |
| grup | gap | `--lg-space-2` |

**Borç (raw / mikro-geometri):** circle 40px ve rect 96px default'ları component
kökünde yerel değişkende toplandı (`.skeleton { --avatar-size: 40px;
--media-height: 96px; }`) — avatar-md / medya placeholder karşılıkları; iskelet
kontrol olmadığından 40px `--lg-control-md`'ye bağlanmadı; her ikisi de
width/height prop'larıyla ezilir. Shimmer süresi 1.4s raw — motion preset'ine
bağlanması açık karar.

## 10. Storybook kapsamı

Var: Default, CokSatir (son satır %60), Varyantlar (% tabanlı genişlik),
Statik (`animate=false`), IlanKartiIskeleti (kompozisyon + `aria-busy`
kalıbı), MobilListeIskeleti (responsive: % tabanlı akışkanlık, mobile1
viewport). **Eksik:** reduced-motion forced görseli.

## 11. Test kabul kriterleri

- [x] kök `aria-hidden="true"`
- [x] `lines=3` → 3 bar, son satır %60
- [x] width/height (sayı→px, % string) uygulanır
- [x] variant sınıfı uygulanır
- [x] `animate=false` shimmer sınıfını kaldırır
- [x] rol/erişilebilir içerik üretmez
- [ ] reduced-motion'da animasyon kapanır (visual/CSS)

## 12. Do / Don't

- ✅ Kapsayıcıya `aria-busy="true"` ver; tek bir `role="status"` "Yükleniyor"
  mesajı ekle — iskelet parçaları değil bölge duyurulur.
- ✅ Genişlikleri `%` ile ver; gerçek içeriğin yerleşimini birebir taklit et.
- ❌ Skeleton'a `aria-label`/rol ekleme — bilinçli olarak gizlidir.
- ❌ Süresi belli olmayan çok uzun beklemelerde tek başına bırakma; zaman aşımı
  sonrası hata/boş durum göster.
- ❌ İçerik geldikten sonra skeleton'ı animasyonla soldurup bekletme — anında değiş.

**Açık kararlar:** progress/spinner component'i (belirlenmiş süreli işler) ·
shimmer süresinin motion preset'ine taşınması.

## Changelog

- 2026-07-16: İlk sürüm — text/circle/rect, çok satır (%60 son satır),
  shimmer (reduced-motion'da statik), aria-hidden sözleşmesi.
