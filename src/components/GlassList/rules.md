---
name: GlassList
category: görüntüleme
status: hazır
lastReviewed: 2026-07-16
---

# GlassList Kuralları

## 1. Amaç

iOS Settings tarzı gruplu liste: başlıklı grup + flat kart içinde satırlar +
hairline ayraçlar. İçerik katmanı component'idir — cam DEĞİL, `--lg-surface`
zemin. Satırlar statik bilgi veya tıklanabilir navigasyon olabilir.

- **Kullan:** ayar/hesap menüleri, etiket–değer satırları karışık gruplar,
  navigasyon listeleri (İlanlarım → sayfa).
- **Kullanma:** saf etiket/değer tablosu (→ `GlassSpecTable`, `dl`
  semantiği), medya kartı ızgarası (→ `GlassListingCard`), sıralanabilir
  veri (→ gerçek `<table>`), kenar çubuğu navigasyonu (→ `GlassSidebar`).

| İlgili | Farkı |
|---|---|
| GlassSpecTable | `dl` etiket/değer; satır tıklaması hiç yok |
| GlassSidebar | Cam navigasyon katmanı; seçili durum + highlight |
| GlassListingCard | Tek zengin medya kartı; liste satırı değil |

## 2. Semantik sözleşme

- GlassList kökü `<div>`; içinde `<ul role="list">` (role açıkça verilir —
  `list-style: none` Safari'de liste semantiğini düşürür).
- `header` verilirse `<ul>` `aria-labelledby` ile ona bağlanır.
- GlassListItem `<li>` üretir; `onClick` verilirse satır içeriği tam
  genişlik `<button type="button">`, verilmezse `<div>` olur.
- `icon` `aria-hidden`'dır — accessible name title(+subtitle+detail)'dan gelir.
- DOM değişmezi: ayraç, sonraki satırların `.inner`'ında (ikondan sonra) —
  ikon hizasından inset başlar.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| header | — | `string` | Footnote, uppercase, secondary |
| footer | — | `string` | Footnote, secondary; açıklama/uyarı |
| children | ✅ | `GlassListItem`'lar | Başka öğe koyma |
| item.icon | — | `ReactNode` | 28px kolon, dekoratif |
| item.title | ✅ | `ReactNode` | Tek satır, ellipsis |
| item.subtitle | — | `ReactNode` | Footnote secondary, ellipsis |
| item.detail | — | `ReactNode` | Sağda secondary değer; sıkışmaz |
| item.chevron | — | `boolean` | Sağda ›; "sayfaya götürür" iması |

## 4. Public API

**GlassList**

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| header | prop | `string` | — | Grup başlığı + `aria-labelledby` |
| footer | prop | `string` | — | Grup altı metin |
| inset | prop | `boolean` | `true` | Radius'lu kart; `false` → kenardan kenara |
| children | prop | `ReactNode` | — (zorunlu) | GlassListItem'lar |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | Köke geçer |

**GlassListItem**

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| icon | prop | `ReactNode` | — | Solda, `aria-hidden` |
| title | prop | `ReactNode` | — (zorunlu) | Satır adı |
| subtitle | prop | `ReactNode` | — | Alt satır |
| detail | prop | `ReactNode` | — | Sağda ikincil değer |
| chevron | prop | `boolean` | `false` | Sağda › |
| onClick | prop | `MouseEventHandler<HTMLButtonElement>` | — | Varsa satır `<button>` olur |
| disabled | prop | `boolean` | `false` | Butonda native, statikte görsel |
| destructive | prop | `boolean` | `false` | title `--lg-danger` |
| ...rest | — | `LiHTMLAttributes` (`title`/`onClick` hariç) | — | `<li>`'ye geçer |

Event sözleşmesi: yalnız `onClick` (buton satırı). Basınç animasyonu
(`useGlassPress`) bilinçli YOK — hafif zemin değişimi yeter.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `inset=true`, statik satır.

| Yasak / türetilen | Davranış |
|---|---|
| `disabled` + `onClick` yok | Yalnız görsel soluklaşma (`pointer-events: none`) |
| `chevron` + `onClick` yok | Görsel olarak izinli ama anlamsız — kullanma |
| `destructive` + `detail` | detail secondary kalır, yalnız title kırmızı |
| size prop'u | ❌ yok — satır 44px minimum, içerik büyütür |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| statik | `onClick` yok | hover/active | Değişim yok |
| hover | CSS (`hover:hover`, buton) | — | Zemin `--lg-hairline` |
| active | CSS (buton) | — | Aynı hafif zemin (jöle/scale YOK) |
| focus-visible | CSS (buton) | — | 2px `--lg-accent`, offset -2 (kart içinde kalır) |
| disabled | native / class | hover, active | opacity .45 + `pointer-events: none` |
| destructive | prop | — | title `--lg-danger` |

## 7. Davranış

- Keyboard: buton satırları Tab ile gezilir, Enter/Space native aktive eder.
  Ok tuşu gezinmesi YOK — bu bir menü değil, doküman akışında listedir.
- Satır min-height 44px (dokunma hedefi); `-webkit-tap-highlight-color`
  kapalı, zemin geçişi 0.12s (reduced-motion'da kapanır).
- Responsive (bp-md): 768px altında yatay padding `--lg-space-3`, üstünde
  `--lg-space-4`. `inset` prop'una HER genişlikte saygı — dar ekranda
  kendiliğinden köşesiz görünüme düşmez; köşesiz istenirse `inset={false}`
  açıkça verilir.
- Ayraçlar `box-shadow: inset` ile (border değil) — satır yüksekliği oynamaz.

## 8. İçerik

`header` 1–3 kelime (uppercase zaten vurgular, bağırma). `title`/`subtitle`
tek satırda kırpılır — uzun açıklama `footer`'a ya da detay sayfasına.
`detail` kısa değer ("118.000 km"); cümle değil. Yıkıcı aksiyonu kendi
grubunda en alta koy (iOS kalıbı).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| list | background | `--lg-surface` |
| list (inset) | radius | `--lg-radius-media` |
| ayraç | renk | `--lg-hairline` |
| hover zemin | background | `--lg-hairline` |
| header/footer | font-size | `--lg-text-footnote` |
| title/detail | font-size | `--lg-text-body` |
| subtitle | font-size | `--lg-text-footnote` |
| destructive title | color | `--lg-danger` |
| focus | outline | `--lg-accent` |
| padding/gap | — | `--lg-space-2/3/4` |

Borç: satır min-height 44px ve ikon kolonu 28px raw — kontrol token'ları
kontrollere ait, liste satırı için ayrı token yok.

## 10. Storybook kapsamı

Var: Default, Interactive, Destructive, NoInset, LongContent, Mobile
(viewport: mobile1). **Eksik:** forced hover/focus görselleri, RTL
(chevron yönü), koyu tema görsel kontrolü.

## 11. Test kabul kriterleri

- [x] `role="list"` + header `aria-labelledby`
- [x] onClick yoksa buton yok (statik satır)
- [x] onClick varsa native `<button type="button">`, tıklama + klavye odağı
- [x] disabled tıklamayı engeller
- [x] destructive sınıfı uygulanır
- [x] icon `aria-hidden`, accessible name title'dan
- [ ] ayraç inset hizası (visual)

## 12. Do / Don't

- ✅ Navigasyon satırına `chevron` ver — tıklanabilirliği ima eder.
- ✅ Yıkıcı aksiyonu ayrı grupta, en altta tut.
- ❌ Satır içine ikinci buton/link koyma (buton içinde buton olur).
- ❌ Saf etiket/değer verisi için kullanma (→ GlassSpecTable).
- ❌ `useGlassPress`/jöle ekleme — liste satırı kontrol değildir.

**Açık kararlar:** satır içi sağ aksesuar (switch/toggle) desteği ·
swipe-to-delete davranışı · RTL chevron aynası.

## Changelog

- 2026-07-16: İlk sürüm — GlassList + GlassListItem, inset/plain, buton
  satırları, destructive, bp-md padding responsive'i.
