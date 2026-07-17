---
name: GlassVoiceBar
category: kontroller
status: hazır
lastReviewed: 2026-07-17
---

# GlassVoiceBar Kuralları

## 1. Amaç

Sesli arama çubuğu: mikrofon butonu (idle/listening/processing) ve yanındaki
canlı transkript satırını tek pakette sunar. Kullanıcı butona basıp
konuşur, gerçek zamanlı olarak tanınan metin (`transcript`) altında belirir.

- **Kullan:** vitrin/liste sayfası arama alanına ek "sesle ara" girişi,
  filtre panelinde sesli sorgu başlatma noktası.
- **Kullanma:** metin tabanlı doğal dil arama (→ `GlassAiSearchBar`),
  yapılandırılmış alan arama (→ `GlassSearchField`/`GlassSelect`). İki
  component birlikte kullanılabilir (ör. `GlassAiSearchBar`'ın yanında
  ikinci bir giriş yöntemi olarak) ama biri diğerini sarmalamaz/İTHAL ETMEZ.

**Kapsam dışı — kasıtlı:** Web Speech API (veya başka bir konuşma tanıma
servisi) entegrasyonu bu component'in işi DEĞİLDİR. `GlassVoiceBar` saf
sunum katmanıdır: mikrofona ne zaman basıldığını (`onStart`/`onStop`)
bildirir, tanınan metni (`transcript`) yalnız gösterir. Ses izni isteme,
`SpeechRecognition` örneği kurma/durdurma, ara sonuç/final sonuç ayrımı
tamamen çağıranın sorumluluğundadır.

## 2. Semantik sözleşme

- Kök element düz `<div data-state>` — landmark/grup rolü üstlenmez (tek bir
  buton + tek bir metin satırı; roving tabindex/ok tuşu deseni gerektiren
  bir widget değildir, bu yüzden `role="group"` gibi ek bir ARIA rolü
  BİLİNÇLİ OLARAK eklenmez).
- Mikrofon butonu native `<button type="button">`; accessible name durum
  başına `aria-label` ile taşınır. WCAG 2.5.3 "Label in Name" (Level A)
  gereği bu `aria-label` görünür buton metnini (`BUTTON_TEXT`) DAİMA alt
  string olarak başında içerir — aksi halde ses-komut kullanıcıları
  (Dragon/Voice Control) görünen metni söyleyerek butonu tetikleyemez;
  axe-core `label-content-name-mismatch` kuralı bunu otomatik yakalar
  (§4/§6'da tablo, tam metinler). Kalıcı açık/kapalı durumu `aria-pressed` ile de
  taşınır (`listening` → `true`, aksi halde `false`) — bu bir toggle
  butonu, `EksenlerVeDurumlar.mdx`'teki "pressed (kalıcı) → prop →
  aria-pressed" satırıyla birebir örtüşür.
- `processing` iken buton native `disabled` — o an ne başlatılabilir ne
  durdurulabilir (transkripsiyon sürüyor).
- Transkript/ipucu satırı `<p aria-live="polite">` — **her zaman mount**
  edilir (bkz. `GlassAiSearchBar` "Düşünüyor…" dersi): ekran okuyucu,
  sonradan DOM'a eklenmiş dolu bir bloğa değil, içeriği değişen zaten var
  olan bir live-region'a bakar. Boşken CSS `:empty` ile görsel olarak
  katlanır, DOM'dan kaldırılmaz. Buton `aria-describedby` ile bu satıra
  daima bağlıdır.
- Mikrofon ikonu dekoratif SVG, `aria-hidden="true"` — emoji DEĞİL, kendi
  çizilmiş path'i (bkz. `MicIcon`).
- Portal yok.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| mikrofon butonu | ✅ | ikon + durum metni | Kapsül; idle: flat yüzey, listening: accent zemin + nabız halkası, processing: soluk + disabled |
| ikon | ✅ | kendi SVG mikrofonu | `aria-hidden`, emoji yok |
| nabız halkası | yalnız `listening` | iki eşmerkezli genişleyen halka | transform/opacity, `reduced-motion`'da statik |
| transkript/ipucu satırı | ✅ (her zaman mount) | `transcript` doluysa o, aksi halde (processing hariç) `hint` | `aria-live="polite"`, butona `aria-describedby` ile bağlı |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| state | prop | `'idle' \| 'listening' \| 'processing'` | — zorunlu | ✅ (tek kaynak) | Akışın güncel durumu; component kendi state'ini tutmaz |
| onStart | event | `() => void` | — zorunlu | — | `idle` butonuna tıklanınca |
| onStop | event | `() => void` | — zorunlu | — | `listening` butonuna tıklanınca |
| transcript | prop | `string` | — | — | Dolu olduğunda ipucunun yerini alır, tüm state'lerde geçerli |
| hint | prop | `string` | `'"İzmir Urla imarlı arsa" demeyi dene'` | — | `transcript` boş ve `state !== 'processing'` iken görünür |

Ref hedefi: yok (kök `<div>`'e `ref` iletilmez; `...rest` yalnız
`HTMLAttributes<HTMLDivElement>`, `children` override edilir çünkü içerik
component tarafından tam kontrol edilir).

`state` **daima controlled'dır** — `GlassAiSearchBar`'ın `value`/`defaultValue`
ikilisinin aksine burada uncontrolled bir mod yoktur: sesli arama akışının
tek doğruluk kaynağı zaten çağıranın ses tanıma entegrasyonudur, component
bunu asla kendi başına taklit edemez/tahmin edemez.

## 5. Seçenek eksenleri

`variant`/`material`/`tone`/`size`/`thickness`/`tint`/`prominent` — **N/A**,
tek görsel desen (kapsül buton + durum metni). Görsel farklılaşma tamamen
`state` eksenine bağlı, bu bir "durum" (state) olduğu için ayrı bir prop
eksenine dönüştürülmedi (kontrat: geçici/durumsal olan prop değil state'tir
— burada `state` zaten dışarıdan yönetilen kalıcı bir durum olduğu için
public prop olması doğru, bkz. §6). Yasak kombinasyon yok.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| idle / listening / processing | `state` prop (zorunlu, controlled) | — | buton `aria-label` + `aria-pressed`, buton metni |
| processing | `state === 'processing'` | tıklama (onStart/onStop tetiklenmez) | buton `disabled` |
| transcript var/yok | `transcript` prop | `hint` görünürlüğü | `aria-live` içeriği |

Katman sırası: availability (`processing` → buton disabled) → value
(`transcript` varsa ipucunun önüne geçer) → interaction (tıklama →
`onStart`/`onStop`, yalnız `idle`/`listening`'de).

hover/focus/active hiçbir zaman prop değildir (yalnız CSS
`:hover`/`:focus-visible`).

## 7. Davranış

- **Pointer:** `idle` butonuna tıklamak `onStart()` çağırır; `listening`
  butonuna tıklamak `onStop()` çağırır; `processing` iken buton `disabled`
  olduğu için tıklama tarayıcı tarafından zaten engellenir (component'teki
  `handleClick` yine de state kontrolü yapar, savunma amaçlı).
  Aynı buton üç durumda da tek etkileşim noktasıdır — ayrı
  başlat/durdur butonu yok (tek toggle).
- **Klavye:** buton native `<button>` — Enter/Space doğal olarak tıklamayla
  aynı davranışı tetikler, özel bir klavye deseni (ok tuşu, roving
  tabindex) gerekmez çünkü component tek bir etkileşimli öğe içerir (bkz.
  §2 — bilinçli olarak grup/liste rolü üstlenmedi).
  Bu component container-scoped/document-genelinde bir Escape dinleyicisi
  **taşımaz** — kapanacak bir overlay/panel yok.
- **Focus akışı:** hiçbir durumda programatik `.focus()` çağrılmaz; odak
  yalnız kullanıcının Tab/tıklama etkileşimiyle değişir. `state` dışarıdan
  değişse de (ör. ses tanıma otomatik `processing`'e geçse de) odak
  taşınmaz/çalınmaz.
- **Async:** `processing`, çağıranın ses tanımayı işlediği anki durumdur;
  component kendi zamanlayıcısı yok, tamamen `state` prop'una tepki verir.
- **Overlay:** yok.

## 8. İçerik kuralları

- Uzun `transcript`/`hint` metinleri sarılır, kırpılmaz (bkz. UzunIcerik
  story) — `overflow-wrap: break-word`.
- `transcript` boşsa (veya yalnız boşluksa, `trim()` ile kontrol edilir)
  `hint` gösterilir (processing hariç); `transcript` doluysa state'ten
  bağımsız her zaman öncelik transcript'tedir (ör. `idle` + eski
  `transcript` = önceki oturumun sonucu, gösterilmeye devam eder).
- Lokalizasyon: tüm sabit metinler (buton metni/aria-label, varsayılan
  `hint`) Türkçe; `hint` dışarıdan override edilebilir.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| buton | background/border | `--lg-surface` / `--lg-hairline` | `listening`: `--lg-accent` zemin+border; `processing`: `opacity 0.6` |
| buton | radius | `--lg-radius-capsule` | — |
| buton | yükseklik | `--lg-control-lg` (coarse pointer'da otomatik büyür) | — |
| buton metni/ikon | color | `--lg-label` | `listening`: `--lg-accent-contrast` |
| nabız halkası | border-color | `color-mix(accent-contrast 75%, transparent)` | `reduced-motion`: animasyon kapalı, sabit `opacity 0.4` |
| transkript/ipucu | color | `--lg-label-secondary` | — (kontrat: küçük metin renk yalnız label token'larından, semantik renk yalnız buton zemininde) |
| focus halkası | outline | `--lg-accent` (yalnız `:focus-visible`) | — |

**Borç (raw):** nabız halkası `inset: -7px` / `border-width: 1.5px` ve
keyframe `scale(0.55→1.9)` değerleri raw px/oran — token karşılığı yok,
salt görsel efekt geometrisi (GlassScoreMeter'daki `R = 40` SVG sabiti ile
aynı gerekçe).

## 10. Storybook kapsamı

Default, Playground, Controlled (tam akış simülasyonu), Durumlar
(idle/listening/processing yan yana), Uzun İçerik, Responsive,
Erişilebilirlik (docs). Variants/Materials/Sizes: **N/A** — eksen yok
(bkz. §5).

## 11. Test kabul kriterleri

- [x] `idle`: `aria-label="Sesle ara, sesli aramayı başlat"`,
      `aria-pressed="false"`, ipucu görünür
- [x] `idle` tıklaması `onStart` çağırır, `onStop` çağrılmaz
- [x] `listening`: `aria-label="Dinliyor…, sesli aramayı durdur"`,
      `aria-pressed="true"`, tıklaması `onStop` çağırır
- [x] `processing`: buton `disabled`,
      `aria-label="Çözümleniyor…, sesli arama işleniyor"`,
      tıklama hiçbir callback tetiklemez
- [x] Durum yalnız renkle değil görünür buton metniyle de ayırt edilir
      (Sesle ara / Dinliyor… / Çözümleniyor…)
- [x] Her state'te `aria-label`, görünür buton metnini alt string olarak
      başında içerir (WCAG 2.5.3 "Label in Name")
- [x] `transcript` doluyken state'ten bağımsız ipucunun yerini alır
- [x] Özel `hint` prop'u varsayılanı geçersiz kılar
- [x] `aria-live="polite"` bölgesi state değişimlerinde aynı DOM düğümü
      olarak kalır; `processing` + boş `transcript`'te içerik boşalır
- [x] `listening` + boş `transcript`'te ipucu gösterilmeye devam eder
- [x] `processing` + dolu `transcript`'te ipucu değil transcript gösterilir
- [x] İkon `aria-hidden`, accessible name yalnız buton `aria-label`'ından
- [x] Buton `aria-describedby` ile transkript/ipucu bölgesine daima bağlı
- [ ] Görsel: nabız halkası animasyon zamanlaması/opaklığı (visual, Chrome)
- [ ] Görsel: `prefers-reduced-motion: reduce` altında statik halka
      görünümü (visual, Chrome)

## 12. Do / Don't

- ✅ `state`'i her zaman gerçek ses tanıma durumunla senkron tut — component
  kendi zamanlayıcısı yok, sen kontrol edersin.
- ✅ `transcript`'i ara sonuçlarla sık güncelle — `aria-live="polite"`
  bunun için var, kullanıcı her kelimeyi duyar (aşırı sık güncellemeler AT
  tarafından kendi hızında gruplanır, bu normal).
- ❌ Component'e Web Speech API/mikrofon izni mantığı ekleme — bu kasıtlı
  bir sınır (bkz. §1); çağıranın işi.
- ❌ `processing` iken butonu tıklanabilir bırakma / `disabled` kaldırma —
  o an başlatılacak/durdurulacak bir şey yok.
- ❌ İpucu ve transkripti aynı anda iki ayrı `aria-live` bölgesine bölme —
  tek bir satırda, tek bir live-region'da tutulmalı (çakışan duyuru riski).

**Açık kararlar:** `listening` sırasında ara transkript sık değiştiğinde
`aria-live="polite"` yerine `aria-live="off"` + periyodik "assertive" özet
mi daha iyi olur — v2'de kullanıcı testiyle değerlendirilecek (bugünkü
seçim: `polite`, AiSearchBar ile tutarlı) · sesli komutla filtre
uygulama (transcript'i otomatik `GlassAiSearchBar`'a besleme) — bu
component'in kapsamı dışında, ayrı bir composition noktası.

**Changelog:** 2026-07-17 — İlk sürüm (mikrofon butonu + canlı transkript,
controlled `state`, kendi SVG mikrofon ikonu, `reduced-motion` altında
statik nabız halkası).

**Changelog:** 2026-07-17 — Review düzeltmesi: `aria-label` artık her
state'te görünür buton metnini (`BUTTON_TEXT`) alt string olarak başında
içeriyor (`idle`: "Sesle ara, sesli aramayı başlat", `listening`:
"Dinliyor…, sesli aramayı durdur", `processing`: "Çözümleniyor…, sesli
arama işleniyor") — WCAG 2.5.3 "Label in Name" (Level A) ihlalini giderir.
Ayrıca `listening` + boş `transcript` ve `processing` + dolu `transcript`
çapraz kombinasyonları için ayrı regresyon testleri eklendi.
