---
name: GlassSwitch
category: form
status: hazır
lastReviewed: 2026-07-16
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
- Touch (`pointer: coarse`): ray/thumb büyür + görünmez `::after` halo dokunma
  hedefini min 44px'e tamamlar (görsel bozulmadan).

## 8. İçerik

Etiket durumun adıdır, eylem değil ("Fiyat düşünce bildir"; "Bildirimi aç" değil).
Açık/kapalı metni switch'e yazılmaz; gerekiyorsa satır açıklamasında göster.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| ray (on) | background | `--glass-tint` ← `--lg-accent` |
| focus | outline | `--lg-accent` |
| thumb | background | `#fff` (bilinçli raw — cam üstü kontrast) |

Borç: ray ölçüleri (34×18 / 44×24) raw — kontrol token'ları switch oranına
uymadığı için bilinçli; coarse varyantları CSS'te.

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
