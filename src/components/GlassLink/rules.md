---
name: GlassLink
category: navigasyon
status: hazır
lastReviewed: 2026-07-16
---

# GlassLink Kuralları

## 1. Amaç

Tipografik link: gövde metni içinde (`inline`) veya bağımsız satırda chevron'lu
(`standalone`) gezinme bağlantısı.

**Neden cam DEĞİL:** Link metin akışının parçasıdır — cam yüzey
(backdrop-filter/refraction) satır içinde okunabilirliği bozar, her linki
"kontrol katmanına" yükseltir ve satır başına compositor maliyeti üretir.
Cam, navigasyon/kontrol *yüzeyleri* içindir; link ise içerik *tipografisidir*.
Bu yüzden GlassSurface kullanmaz, saf CSS'tir.

- **Kullan:** paragraf içi bağlantı, "Satıcının diğer ilanları ›" gibi satır
  linkleri, dış siteye çıkışlar.
- **Kullanma:** aksiyon tetikleme (→ GlassButton — link gezinir, buton yapar),
  kart bütününü tıklanabilir yapma (→ GlassListingCard), menü öğesi
  (→ GlassMenuItem).

| İlgili | Farkı |
|---|---|
| GlassButton | Aksiyon; cam kapsül. Link gezinme + tipografi |
| GlassBreadcrumb | Hiyerarşi dizisi; tek link değil |

## 2. Semantik sözleşme

- Element: her zaman gerçek `<a>` — Enter native aktivasyon, orta tık/yeni
  sekme/kopyala çalışır.
- `external`: `target="_blank"` + `rel="noopener noreferrer"` otomatik
  (çağıranın verdiği `rel` korunup birleştirilir) + `↗` ikonu (`aria-hidden`) +
  sr-only `" (yeni sekme)"` — ekran okuyucu sekme değişimini önceden duyar.
- `disabled`: `href`/`target`/`rel` kaldırılır (href'siz `<a>` link rolü
  almaz ve focus edilemez) + `aria-disabled="true"` + `pointer-events: none`
  + JS click guard.
- DOM değişmezleri: (1) kök hep `<a>`, (2) dekoratif ikonlar (`↗`, `›`)
  `aria-hidden`, (3) accessible name = children (+ external'da "(yeni sekme)").

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| children | ✅ | metin | Anlamlı link metni ("buraya tıkla" değil) |
| external ikonu | otomatik | `↗` | `aria-hidden`, sr-only metinle çiftlenir |
| chevron | otomatik (standalone) | `›` | `aria-hidden`, hover'da 2px kayar |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| variant | prop | `'inline'\|'standalone'` | `'inline'` | inline: alt çizgi + akış; standalone: chevron, çizgisiz, semibold |
| external | prop | `boolean` | `false` | target/rel + ikon + sr-only metin |
| disabled | prop | `boolean` | `false` | href kaldırılır, `aria-disabled`, etkileşim kapalı |
| href | prop | `string` | — | Native; disabled'da yok sayılır |
| ...rest | — | `AnchorHTMLAttributes` | — | `onClick`, `rel`, `target` vb. (external kazanır) |

Event: `onClick` — disabled'da çağrılmaz (JS guard; `pointer-events: none`
tek başına programatik click'i durdurmaz).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=inline`.

| Yasak / türetilen | Davranış |
|---|---|
| `external` + `target` prop'u | external kazanır (`_blank`) |
| `external` + `rel` prop'u | Birleştirilir — çağıranın değeri kaybolmaz |
| `disabled` + `href` | href render edilmez |
| `size` / `tone` / `tint` | ❌ yok — font-size ve renk bağlamdan/token'dan |
| responsive varyant | ❌ yok — link her yerde aynı (bilinçli) |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel / ARIA |
|---|---|---|---|
| hover | CSS (`hover:hover`) | — | Renk koyulaşır (`accent` %72 + `label` karışımı); inline'da alt çizgi tam renk; standalone'da chevron 2px kayar |
| focus-visible | CSS | — | 2px `--lg-accent` halka, offset 2px |
| disabled | prop | hover, focus, click | `--lg-label-secondary` + opacity .6; focus edilemez (href yok) |
| visited | — | — | Stillenmiyor (bilinçli — uygulama içi gezinmede visited gürültü) |

## 7. Davranış

- Keyboard: native `<a>` — Tab ile gezilir, Enter aktive eder. Disabled'da
  focus'a girmez.
- `prefers-reduced-motion`: renk/chevron geçişleri kapalı.
- Responsive: **yok** — link her yerde aynı; inline metinle birlikte sarar.
- Hover koyulaşması `color-mix(accent, label)` — açık temada koyulaşır, koyu
  temada aydınlanır; iki temada da kontrast artar.

## 8. İçerik

- Link metni hedefi tanımlar: "ekspertiz raporunu inceleyin" ✅, "tıklayın" ❌.
- inline birden çok satıra sarabilir (display: inline); standalone tek
  satır kabul eder, sarma gerekiyorsa metni kısalt.
- sr-only "(yeni sekme)" Türkçe hardcoded — farklı dilde borç (bkz. kısıtlar).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | color | `--lg-accent` |
| root hover | color | `color-mix(--lg-accent 72%, --lg-label)` |
| root | focus outline | `--lg-accent` |
| standalone | gap | `--lg-space-1` |
| disabled | color | `--lg-label-secondary` |
| font | — | miras (bağlamın font-size/family'si) |

Borç: focus halkası `border-radius: 2px`, chevron kayması `2px`, opacity `.6`,
alt çizgi offset `.18em` raw.

## 10. Storybook kapsamı

Var: Default (paragraf içi inline), Standalone, External, Disabled,
Varyantlar (matris), MobilAkis (viewport: mobile1 — responsive davranışın
*olmadığını* gösterir). **Eksik:** koyu tema forced story, visited tartışması.

## 11. Test kabul kriterleri

- [x] link rolü + href
- [x] click onClick çağırır (Enter native — gerçek `<a>`)
- [x] external: target/rel + sr-only isim + `aria-hidden` ikon
- [x] external çağıran `rel`'ini korur
- [x] disabled: href/target yok, `aria-disabled`, onClick guard
- [x] standalone chevron var / inline yok
- [ ] hover kontrastı iki temada (visual)

## 12. Do / Don't

- ✅ Router kullanıyorsan `onClick`'te `e.preventDefault()` + programatik
  gezinme yap, `href`'i yine de ver (orta tık/SEO).
- ✅ Dış bağlantıda her zaman `external` ver — güvenlik `rel`'i otomatik gelir.
- ❌ Aksiyon (silme, gönderme) için kullanma — o GlassButton'dur.
- ❌ `disabled` linki kalıcı UI olarak bırakma — mümkünse linki hiç render etme.

**Bilinen kısıtlar:** sr-only metnin i18n'i yok. Router `Link` bileşenine
polimorfik `as` desteği yok — `onClick` + `href` deseniyle sarılır.
**Açık kararlar:** `as` prop'u (Next/React Router entegrasyonu) · visited
stili gerekli mi · external ikonu için SVG'ye geçiş.

## Changelog

- 2026-07-16: İlk sürüm — inline/standalone varyantları, external güvenlik
  otomasyonu, disabled sözleşmesi. Cam kullanılmama gerekçesi §1'e yazıldı.
