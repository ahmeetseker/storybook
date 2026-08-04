---
name: GlassSwitch
category: form
status: hazır
lastReviewed: 2026-08-03
---

# GlassSwitch Kuralları

## 1. Amaç

Anında etkili aç/kapa anahtarı: cam ray + beyaz thumb, spring ile kayar.
Değişiklik hemen uygulanır — form submit beklemez.

- **Kullan:** ayarlar (bildirim, vitrin), anında etkili tercihler.
- **Kullanma:** form gönderimiyle işlenecek onaylar (→ `GlassCheckbox`),
  birden çok seçenek (→ `GlassRadioGroup`).

| İlgili | Farkı |
|---|---|
| GlassCheckbox | Form değeri taşır; submit ile işlenir |
| GlassIconButton `active` | Basılı-durum butonu; switch semantiği taşımaz |

## 2. Semantik sözleşme

- Element: `<button type="button" role="switch" aria-checked>`.
- Accessible name: `label` prop → `aria-label`. **Görünen çocuk yoktur**;
  `label` vermezsen `aria-label`'ı rest ile geçirmek zorundasın — adsız switch yasak.
- DOM değişmezleri: gerçek `<button>` kalır; thumb `aria-hidden`.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| — | — | — | children almaz; etiket metni dışarıda (ayar satırında) durur |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| checked | prop | `boolean` | — | Controlled durum |
| defaultChecked | prop | `boolean` | `false` | Uncontrolled başlangıç |
| onChange | prop | `(checked: boolean) => void` | — | Yeni durumu döner |
| label | prop | `string` | — | `aria-label`; fiilen zorunlu |
| size | prop | `'sm'\|'md'` | `'md'` | Ray/thumb ölçeği |
| tint | prop | `string` | `--lg-accent` | Açıkken ray vurgusu (`--glass-tint`) |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| disabled | prop | `boolean` | `false` | Native attribute |
| ...rest | — | `ButtonHTMLAttributes` | — | `aria-label`, `id` vb. |

## 5. Seçenek eksenleri

Varsayılan: `md`, kapalı, accent vurgu.

| Yasak / türetilen | Davranış |
|---|---|
| `tint` verilmezse | açık ray `--lg-accent`'ten türetilir |
| children | ❌ — API'de yok; etiket `label` prop'udur |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| on | prop/iç state | — | Ray tint dolgu, thumb sağa spring kayar |
| focus-visible | CSS | — | 2px `--lg-accent` halka |
| disabled | native | tümü | opacity .45 + `pointer-events: none` |

## 7. Davranış

- Keyboard: Space/Enter toggle. Manuel yönetilir (`preventDefault`) — native
  click ile çift tetikleme olmaz, jsdom dahil her ortamda deterministiktir.
- Motion: thumb `layout` animasyonu, `presets.springs.sidebar` (salınımsız).
  `prefers-reduced-motion`: geçiş süresi 0 — anında atlar.
- Touch (`pointer: coarse`): ray ve thumb büyür (md 50×28, sm 40×22). Dokunma
  hedefi = görünen kapsül; görünmez halo mümkün değil, bkz. §9 "Dokunma
  hedefi (bilinen kısıt)".

## 8. İçerik

Etiket durumun adıdır, eylem değil ("Fiyat düşünce bildir"; "Bildirimi aç" değil).
Açık/kapalı metni switch'e yazılmaz; gerekiyorsa satır açıklamasında göster.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| ray (on) | background | `--glass-tint` ← `--lg-accent` |
| focus | outline | `--lg-accent` |
| thumb | background | `#fff` (bilinçli raw — cam üstü kontrast) |

**Borç (raw / mikro-geometri):** ray ölçüleri (34×18 / 44×24, coarse
varyantları CSS'te) kontrol token'ları switch oranına uymadığı için yerel
değişkenlerde (`--lg-switch-w/h/thumb`); kök kapsül padding'i de yerel
değişkende toplandı (`--lg-switch-pad: 3px`). Bilinçli bırakılanlar: thumb
`background: #fff` (cam üstü kontrast — tema token'ı değil, her temada
beyaz) ve thumb gölgesi `0 1px 3px rgba(0,0,0,.3), 0 0 1px rgba(0,0,0,.15)`
(hiçbir `--lg-shadow-*` deseniyle birebir değil — dokunulmadı).
Geçiş süresi `0.18s ease-out` raw (süre token'ı yok).

**Dokunma hedefi (bilinen kısıt):** hedef = görünen kapsül. İmleçli cihazda
md 50×30, sm 40×24; dokunmatikte md 56×34, sm 46×28px. AA 2.5.8 (24px) her
durumda karşılanır, AAA 2.5.5 (44px) **karşılanmaz**. Görünmez bir `::after`
halosu mümkün değil: kök GlassSurface'tir ve kendi köşe kırpması için
`overflow: hidden` taşır — kutunun dışına taşan pseudo-eleman ne boyanır ne
de tıklanır. (2026-08-03'e kadar CSS'te böyle bir coarse halosu duruyordu;
ölçüldüğünde hiçbir etkisi olmadığı görülüp kaldırıldı.) Kapsülü 44px'e
büyütmek iOS switch oranını (51×31) bozar ve "kontroller çok iri" geri
bildirimiyle çelişir; bu yüzden AAA gerektiğinde switch'i 44px'lik bir
satır/etiket içine yerleştirmek çağıranın işidir. Kalıcı çözüm
GlassSurface'te bir "hit-slop" kanalı açmaktır (açık karar).

## 10. Storybook kapsamı

Var: Default, On, Tinted, Disabled, Sizes, States, ControlledSettingRow,
MobileSettings (viewport: mobile1).

## 11. Test kabul kriterleri

- [x] switch rolü + aria-label + aria-checked
- [x] tıklama toggle + onChange(boolean)
- [x] Space/Enter klavye toggle
- [x] disabled aktivasyonu engeller
- [x] controlled değer dışarıdan yönetilir
- [x] tint CSS var + type=button
- [ ] reduced-motion'da spring kapalı (visual)

## 12. Do / Don't

- ✅ Ayar satırında görünen metin + `label` prop'una aynı metni ver.
- ✅ Yıkıcı/tehlikeli tercihlerde `tint` ile `--lg-danger` kullanılabilir.
- ❌ Form submit'e bağlı onay için kullanma.
- ❌ `label`'sız ve `aria-label`'sız render etme.

**Açık kararlar:** ray içinde on/off ikonu (✓/✕) talebi gelirse
değerlendirilecek.

## Changelog

- 2026-07-16: İlk sürüm — role=switch button, layout-spring thumb,
  coarse pointer halo hedefi.
- 2026-08-03: Yeni kontrol ölçeği gözden geçirmesi. Coarse dokunma halosu
  (`.root::after`) kaldırıldı — kök GlassSurface'in `overflow: hidden`'ı
  nedeniyle hiç çalışmıyordu (ölü kod). Ray/thumb ölçüleri değişmedi;
  gerçek hedef ve AAA 2.5.5 kısıtı §9'da açıkça belgelendi.
