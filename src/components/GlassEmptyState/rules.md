---
name: GlassEmptyState
category: durum
status: hazır
lastReviewed: 2026-07-16
---

# GlassEmptyState Kuralları

## 1. Amaç

Boş/hata durumu paneli: ortalanmış ikon + başlık + açıklama + opsiyonel aksiyon.
İçerik katmanıdır — flat yüzey, cam DEĞİL (büyük alan, backdrop-filter maliyeti
ve okunabilirlik nedeniyle).

- **Kullan:** boş arama sonucu, boş favori/mesaj listesi, liste yükleme hatası.
- **Kullanma:** anlık geri bildirim/toast (→ canlı bölge gerektirir), form
  alan hatası (→ input yanında inline mesaj), tam sayfa 404 (sayfa şablonu işi).

| İlgili | Farkı |
|---|---|
| GlassBadge | Satır içi durum etiketi; panel değil |
| GlassButton | Aksiyonun kendisi; `action` slot'una verilir |

## 2. Semantik sözleşme

- Root: sade `<div>` — landmark/rol yok; statik içerik.
- `variant="error"` bilinçli olarak `role="alert"` VERMEZ: panel sayfayla
  birlikte render olur, canlı bölge duyurusu spam olur. Anlık hata duyurusu
  gerekiyorsa çağıran dışarıda `aria-live` bölge yönetir.
- Başlık `<p>` (heading değil — sayfa başlık hiyerarşisine karışmaz; gerekirse
  çağıran `aria-labelledby` ile bağlar).
- İkon her zaman `aria-hidden` — dekoratiftir.
- DOM değişmezleri: (1) title her zaman render edilir, (2) `data-variant`
  attribute'u stil/test kancasıdır.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| icon | — | ReactNode (SVG önerilir) | Kapsül zeminli 44→56px daire içinde |
| title | ✅ | tek cümle | Headline (bp-sm üstü md'de title ölçeği) |
| description | — | 1–2 cümle | Secondary; `max-width: 40ch` |
| action | — | GlassButton (çağıran verir) | Tek birincil aksiyon önerilir |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| icon | prop | `ReactNode` | — | Dekoratif; zemin variant'a göre renklenir |
| title | prop | `string` | zorunlu | Tek cümle durum özeti |
| description | prop | `string` | — | Yol gösteren ikinci satır |
| action | prop | `ReactNode` | — | Çağıran GlassButton verir; component buton üretmez |
| variant | prop | `'empty'\|'error'` | `'empty'` | error: ikon zemini `--lg-danger` tonu |
| size | prop | `'sm'\|'md'` | `'md'` | sm: dar panel/kart içi |
| ...rest | — | `HTMLAttributes<div>` | — | Root'a (`aria-label` vb.) |

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=empty`, `size=md`.

| Yasak / türetilen | Davranış |
|---|---|
| `variant=error` + `action` yok | geçerli ama zayıf — kurtarma aksiyonu öner |
| icon verilmezse | ikon alanı hiç render edilmez (boş daire yok) |
| birden çok aksiyon | slot kabul eder ama tek birincil öner (Do/Don't) |

## 6. State modeli

Statik component — etkileşimli state'i yoktur.

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| empty | prop | — | Nötr ikon zemini (`--lg-label` %6) |
| error | prop | — | Danger ikon zemini (`--lg-danger` %14) + danger ikon rengi |

## 7. Davranış

- Etkileşim yalnız `action` slot'undadır; klavye/focus davranışı slot'taki
  component'e aittir.
- Animasyon yok — bilinçli; durum panelinin dikkat çekmesi içerik işidir.
- Responsive: bp-sm altında md boyutta ikon 44px, padding `--lg-space-6/4`,
  başlık headline; bp-sm üstünde ikon 56px, padding `--lg-space-7/6`, başlık
  title ölçeği. `sm` boyutu her genişlikte kompakt kalır.

## 8. İçerik

Title durumu söyler ("Aramanla eşleşen ilan yok"), description çıkış yolu
gösterir ("Filtreleri gevşetmeyi dene"). Suçlayıcı dil yok; hata metni teknik
detay içermez. Aksiyon etiketi eylem dilinde ("Tekrar Dene", "İlanlara Göz At").

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | bg / border / radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` |
| root | padding | `--lg-space-4..7` (boyut + breakpoint) |
| icon | zemin | `--lg-label` %6 / error: `--lg-danger` %14 (color-mix) |
| icon | radius | `--lg-radius-capsule` |
| title | font | `--lg-text-headline` → bp-sm md: `--lg-text-title` |
| description | font / color | `--lg-text-footnote→body` / `--lg-label-secondary` |

**Borç (raw / mikro-geometri):** ikon daire çapları (36/44/56px) boyut
token'ı olmadığından boyut sınıflarında yerel değişkende toplandı
(`.md { --icon-size: 44px; }` / `.sm { --icon-size: 36px; }` / bp-sm'de
`.md { --icon-size: 56px; }`) — dekoratif daire, kontrol değil; control
token'ı bilinçli verilmedi. bp-sm (640px) breakpoint'i yorumla işaretli.

## 10. Storybook kapsamı

Var: Default, Aksiyonlu, Hata, Boyutlar, Mobil (viewport: mobile1).
**Eksik:** çok uzun description taşma örneği.

## 11. Test kabul kriterleri

- [x] title + description render
- [x] icon aria-hidden; verilmeyince alan yok
- [x] action slot'u render + tıklanabilir
- [x] error varyantı data-variant verir, role="alert" vermez
- [x] size sınıfı + rest attribute geçişi
- [ ] responsive ikon küçülmesi (visual)

## 12. Do / Don't

- ✅ Her boş listeye çıkış yolu koy (arama sıfırla, ilan ekle...).
- ✅ `sm` boyutu sidebar/kart gibi dar kaplarda kullan.
- ❌ Canlı hata duyurusu için kullanma — `role="alert"` bilinçli yok.
- ❌ İçine ikinci bir kart/cam yüzey koyma (kart-içinde-kart).

**Açık kararlar:** illüstrasyon (büyük görsel) slot'u · inline (bordersız)
görünüm varyantı.

## Changelog

- 2026-07-16: İlk sürüm — flat içerik yüzeyi, empty/error varyantı,
  sm/md + mobile-first responsive ölçek.
