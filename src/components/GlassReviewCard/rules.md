---
name: GlassReviewCard
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassReviewCard Kuralları

## 1. Amaç

Kullanıcı yorumu kartı: avatar + isim + puan + tarih + yorum metni +
opsiyonel "Doğrulanmış görüşme" rozeti + opsiyonel "Faydalı" aksiyonu.
İlan/satıcı değerlendirme bölümlerinde tekil yorum birimi.

- **Kullan:** ilan/satıcı yorum listesi, "Değerlendirmeler" sekmesi,
  özet panel içinde son yorumlar (`compact`).
- **Kullanma:** toplu puan özeti/dağılımı (→ ayrı bir özet component'i,
  bu kart tekil yorumdur) · yıldız girdisi/derecelendirme formu
  (→ `GlassRating`, bu kart yalnız GÖRÜNTÜLER, girdi almaz).

| İlgili | Farkı |
|---|---|
| GlassRating | Etkileşimli puan GİRDİSİ (form); bu component statik GÖSTERGE — birbirine bağımlı değiller (paralel üretildi) |
| GlassSellerCard | Satıcı kimlik/iletişim kartı; yorum/puan taşımaz |
| GlassScoreMeter | Tek sayısal skor göstergesi (0-100); yorum metni/yazar taşımaz |

## 2. Semantik sözleşme

- Kök: gerçek `<article>` — tekil, bağımsız anlamlı bir içerik birimi
  (yorum). Landmark değildir, `aria-label` zorunlu değildir.
- Puan: `role="img"` + tek `aria-label` (ör. `"5 üzerinden 4,5 yıldız"`).
  Tek tek yıldız SVG'leri `aria-hidden="true"` — **tablist/radiogroup
  DEĞİLDİR**, roving tabindex/ok tuşu gerekmez çünkü etkileşimli bir
  seçim bileşeni değil, statik bir görüntüdür (bkz. §6, Açık Kararlar).
- "Faydalı": yalnız `onHelpful` verildiğinde gerçek bir
  `<button type="button">` render edilir ve tıklanınca çağrılır.
  `onHelpful` verilmeden yalnız `helpfulCount` verilirse **buton
  render edilmez** — tıklamanın hiçbir etkisi olmayacağı "sahte buton"
  yerine tıklanamaz düz metin (`<span>`) gösterilir.
- "Doğrulanmış görüşme" rozeti bilgiyi **metinle** taşır (yalnız renkle
  değil) — `--lg-success` yalnız destekleyici vurgu.
- Avatar: `GlassAvatar` — `name` yine `author`'dan geçilir (baş harf
  fallback görseli için) ama sarmalayıcı `<span aria-hidden="true">`'dır:
  `GlassAvatar`'ın kendi ürettiği `role="img"` + `aria-label={author}`
  erişilebilirlik ağacına GİRMEZ — yazar adı zaten başlık metninde
  (`.author`) duyurulduğu için avatar ikinci bir "Elif Kaya" duyurusu
  üretmez (ekran okuyucu tek duyuru).
- DOM değişmezi yok (tekil, listesiz statik yapı); `key` yönetimi
  çağıranın işidir (listede render edilirken).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| avatar | ✅ (örtük) | `GlassAvatar` | `author`'dan baş harf; `avatarSrc` verilirse görsel |
| author | ✅ | `string` | `full`'da ayrı satır, `compact`'ta tek satırda kısaltılır (ellipsis) |
| verified rozeti | — | sabit metin "Doğrulanmış görüşme" | yalnız `verified=true` |
| rating | ✅ | `0-5` sayı | `role="img"`, tek `aria-label`, ondalık destekli (yarım yıldız) |
| date | ✅ | hazır metin | component tarih ayrıştırmaz/biçimlendirmez |
| text | ✅ | yorum gövdesi | `full`: tam, sarar · `compact`: 2 satır `line-clamp` |
| helpful aksiyonu | — | buton veya düz metin | `onHelpful` varsa buton, yoksa (`helpfulCount` varsa) düz metin, ikisi de yoksa render edilmez |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| author | prop | `string` | — (zorunlu) | — | Yazar adı; avatar baş harfi + accessible name kaynağı |
| avatarSrc | prop | `string` | — | — | `GlassAvatar`'ın `src`'i; yüklenemez/verilmezse baş harf |
| rating | prop | `number` | — (zorunlu) | — | 0-5, ondalık desteklenir; aralık dışı değer sessizce clamp edilir |
| date | prop | `string` | — (zorunlu) | — | Hazır biçimlendirilmiş metin (ör. `"12 Mayıs 2026"`) |
| text | prop | `string` | — (zorunlu) | — | Yorum gövdesi |
| verified | prop | `boolean` | `false` | — | "Doğrulanmış görüşme" rozeti |
| helpfulCount | prop | `number` | — | — (tamamen çağıranda) | Aksiyon metnine sayaç ekler: `"Faydalı (N)"` |
| onHelpful | event | `() => void` | — | — | "Faydalı" tıklanınca çağrılır; component "zaten tıklandı" durumunu TUTMAZ — tekrar tıklamayı engellemek/sayacı artırmak çağıranın işi |
| variant | prop | `'full' \| 'compact'` | `'full'` | — | Yerleşim ekseni |
| ...rest | — | `HTMLAttributes<HTMLElement>` (`children` hariç) | — | — | `<article>` köküne geçer; `className` birleştirilir |

Ref hedefi: yok (v1). Event sözleşmesi: `onHelpful` yalnız kullanıcı
tıklamasıyla tetiklenir, prop değişiminden değil.

## 5. Seçenek eksenleri

`material`/`tone`/`size`/`thickness`/`tint`/`prominent` — **N/A**: içerik
katmanı flat (cam yok, tek görünüm; bkz. §9). Tek eksen `variant`.

| Kural | Davranış |
|---|---|
| `variant='full'` (default) | Avatar `md`, ayrı isim satırı + ayrı puan/tarih satırı, metin tam |
| `variant='compact'` | Avatar `sm`, isim+puan+tarih tek satırda özet, metin 2 satır clamp |
| `verified=false` (default) | Rozet hiç render edilmez |
| `onHelpful` yok + `helpfulCount` yok | Aksiyon alanı hiç render edilmez |
| `onHelpful` yok + `helpfulCount` var | Düz metin (tıklanamaz) |
| `onHelpful` var | Gerçek buton (helpfulCount varsa etiketine eklenir) |

Yasak kombinasyon yok. Türetilen: `rating` clamp'i hem görsel yıldız
dolumunu hem `aria-label`'daki sayıyı aynı anda etkiler (asla birbirinden
sapmaz — bkz. GlassScoreMeter'daki aynı ilke).

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| rating görünümü | `rating` prop (türetilmiş, 0.1 hassasiyete yuvarlanır) | — | `role="img"` + `aria-label` |
| verified rozeti | `verified` prop | — | metin içeriği (ayrı ARIA yok, `--lg-label` kontrast metin) |
| helpful aksiyon biçimi | `onHelpful`/`helpfulCount` varlığı (türetilmiş) | — | buton modunda native `<button>` |
| focus-visible (helpful butonu) | CSS | — | `outline: var(--lg-accent)` |

Stateless component: kendi içinde "tıklandı mı" / "kaç kez tıklandı" state'i
YOK — bilinçli tasarım kararı (spesifikasyon: "helpful state'i çağıranda").
Katman sırası: availability (`onHelpful` var mı → buton/düz metin/yok) →
value (`verified`, `helpfulCount`) → interaction (hover/focus yalnız butonda).

**Yasak birliktelik yok** (disabled/loading ekseni bu component'te yok —
tekil statik kart, form kontrolü değil).

## 7. Davranış

- Pointer/touch: yalnız "Faydalı" butonu etkileşimlidir; `--lg-control-md`
  (dokunmatikte 44px) kullanır — kartın geri kalanı statik içeriktir.
- Keyboard: Tab sırası DOM sırasını izler (avatar → [buton varsa] Faydalı);
  yıldız göstergesi odaklanabilir/etkileşimli DEĞİLDİR (§2).
- Controlled/uncontrolled: N/A — `helpfulCount` tamamen dışarıdan gelen bir
  görüntüleme değeridir, component onu artırmaz/saklamaz.
- Async: yok.
- Overlay: yok.

## 8. İçerik kuralları

- `text` uzun olabilir: `full`'da `overflow-wrap: anywhere` ile sarar,
  kırpılmaz; `compact`'ta 2 satırda `-webkit-line-clamp` ile kırpılır
  (üçüncü satır ve sonrası kaybolur — kısa özet amaçlıdır, "devamını oku"
  aksiyonu v1'de yok, bkz. Açık Kararlar).
- `author` çok uzunsa `compact`'ta `text-overflow: ellipsis` ile kısaltılır
  (satırın diğer öğelerine — puan/tarih — yer açmak için, `max-width: 40%`).
  `full`'da kısaltılmaz, sarar.
- Boş `text=""` render edilir (boş `<p>`) — çağıran boş yorum göndermemeli.
- Tarih/puan biçimlendirmesi (yerelleştirme, göreli tarih vb.) çağıranın
  işidir; component yalnız `rating`'i Türkçe ondalık (`4,5`) biçimler.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kök (flat) | background / border / radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` | — |
| author | font-size / weight | `--lg-text-headline` / 600 | compact: `--lg-text-body` |
| metaRow/date | font-size / color | `--lg-text-footnote` / `--lg-label-secondary` | — |
| text | font-size / color | `--lg-text-body` / `--lg-label` | — |
| verified rozet | radius / background / metin rengi | `--lg-radius-chip` / `color-mix(--lg-success 14%)` / `--lg-label` | ikon rengi `--lg-success` |
| yıldız dolgu/iz | `stop-color` | `--lg-accent` (dolu) / `color-mix(--lg-label-secondary 32%)` (boş) | — |
| helpful butonu | min-height / radius / focus | `--lg-control-md` / `--lg-radius-capsule` / `outline: --lg-accent` | hover yalnız `@media (hover:hover)` |

**Borç (mikro-geometri, `.card` üzerinde yerel değişken):**
- `--grc-star-gap: 1px` — yıldızlar arası mikro boşluk.
- `--grc-verified-padding-block: 2px` — doğrulanmış rozet dikey dolgusu
  (yatay dolgu `--lg-space-2`, ikon/metin arası `--lg-space-1`).

**Borç (raw, değişkene alınmayan):** yıldız SVG `viewBox="0 0 24 24"` +
poligon koordinatları (geometri, renk değil) · ikon boyutları 13/14/15px
(avatar/ikon ölçeğinde mevcut repo konvansiyonuyla tutarlı, ör. `GlassAvatar`
sabit px boyutları) · compact yazar `max-width: 40%` (layout oranı, token
kapsamında değil).

## 10. Storybook kapsamı

Var: Default, Playground, Variants (full/compact), States (doğrulanmış+
etkileşimli · doğrulanmamış+etkileşimli · aksiyonsuz · yalnız sayaç/düz
metin), UzunIcerik (uzun ad + uzun metin, full vs compact), Responsive
(dar container + dokunmatik viewport), KontrolluFaydali (kontrollü sayaç
örneği), Erisilebilirlik (docs). Sizes: N/A (tek boyut ekseni yok, yalnız
`variant`).

## 11. Test kabul kriterleri

- [x] author/date/text render (unit)
- [x] rating `role="img"` + tam sayı `aria-label` (unit)
- [x] ondalık rating Türkçe virgülle duyurulur (unit)
- [x] rating clamp: negatif → 0, 5 üstü → 5 (unit)
- [x] verified rozeti koşullu render (unit)
- [x] `onHelpful` verildiğinde gerçek buton + tıklama çağrısı (unit/interaction)
- [x] `onHelpful` yokken `helpfulCount` düz metne düşer, buton YOK (unit)
- [x] aksiyonsuz durumda hiçbir aksiyon render edilmez (unit)
- [x] `variant="compact"` → `data-variant` işareti (unit)
- [x] `avatarSrc` verildiğinde `GlassAvatar` görseli render eder (unit)
- [x] avatar sarmalayıcısı `aria-hidden` → yazar adı erişilebilirlik
      ağacında yalnız bir kez duyurulur (unit)
- [ ] `compact` metin 2 satırda görsel olarak kırpılır (visual, Chrome)
- [ ] odak halkası `--lg-accent` ile görünür (visual)

## 12. Do / Don't

- ✅ Yorum listesinde her karta benzersiz `key` (id) ver — component
  kendi kimliğini üretmez.
- ✅ `compact`'ı yalnız dar panel/özet bağlamında kullan; ana yorum
  listesinde `full` tercih et (kısaltılmış metin okunabilirliği düşürür).
- ✅ `onHelpful` verirken sayacı da kendi state'inde tut ve güncel
  `helpfulCount`'u geri ver (bkz. `KontrolluFaydali` story'si).
- ❌ Yıldız göstergesine `tabIndex`/klavye etkileşimi ekleme — girdi
  gerekiyorsa ayrı bileşen (`GlassRating`) kullan.
- ❌ `helpfulCount` verip `onHelpful` vermeden "tıklanabilir görünsün"
  diye ayrıca stillendirmeye çalışma — component bunu bilinçli olarak
  düz metne düşürür.

**Bilinen kısıtlar:** `compact`'ta "devamını oku" genişletmesi yok (v1) ·
tek satır özet çok dar container'da (< ~220px) sarabilir (CSS `flex-wrap`
güvenlik ağı, ideal genişlik değil).

**Açık kararlar:** yıldız renginin `--lg-accent` (amber) yerine ayrı bir
"star/rating" semantic token'a taşınması (sistemde şu an sarı/yıldız
token'ı yok) · `compact`'a "devamını oku" aksiyonu eklenmesi · rozetin
i18n'i (şimdilik sabit Türkçe metin, `verified` yalnız boolean).

**Changelog:** 2026-07-17 — İlk sürüm (dalga 1): `full`/`compact` varyantı,
kendi yıldız göstergesi (GlassRating'e bağımlı değil), koşullu
buton/düz-metin "Faydalı" aksiyonu.
**Changelog:** 2026-07-17 — Codex review fix: avatar sarmalayıcısı
`aria-hidden="true"` yapıldı (yazar adının ekran okuyucuda iki kez
duyurulması giderildi); regresyon testi eklendi.
**Changelog:** 2026-07-24 — Uyum düzeltmesi: verified rozet `gap: 4px` →
`--lg-space-1`; mikro-geometri (1px yıldız gap, 2px rozet dikey dolgusu)
`.card` üzerinde yerel değişkenlere toplandı (§9). Görsel değişiklik yok.
