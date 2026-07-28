---
name: GlassAiComposer
category: kontroller
status: hazır
lastReviewed: 2026-07-28
---

# GlassAiComposer Kuralları

## 1. Amaç

Konuşmalı brief kompozitörü — kullanıcı tek satırlık sorgu yerine uzun bir
cümleyle ne aradığını anlatır, isteğe bağlı bağlam ekler (harita alanı, görsel,
ses) ve karşılığında liste değil **özet + takip önerisi + atıf** alır. Tek
seferlik akıştır: bir brief, bir cevap.

- **Kullan:** karar süresi uzun ve kriter sayısı yüksek akışların giriş noktası
  (ev alma, yatırım); AI cevabının kendisi sonuç listesi kadar değerliyse.
- **Kullanma:** tek satırlık, filtreye çevrilecek arama (→ `GlassAiSearchBar`);
  çok turlu, geçmişi olan sohbet (→ `GlassChatDock`); yalnız hazır özet
  gösterimi (→ `GlassAiSummaryCard`).

| Component | Farkı |
|---|---|
| `GlassAiSearchBar` | Tek satır, `role="search"`, cevap üretmez — sorgudan filtre chip'i çıkarır |
| `GlassChatDock` | Portal + dock katmanı, çok turlu mesaj geçmişi tutar |
| `GlassAiSummaryCard` | Giriş alanı yoktur, yalnız hazır özeti gösterir |

## 2. Semantik sözleşme

- Kök element `<form>` + `aria-label="AI ile arama"`. `role="search"`
  **kullanılmaz** — bu bir arama alanı değil brief alanıdır ve aynı sayfada
  ayrıca `GlassAiSearchBar` bulunabilir; iki `search` landmark'ı çakışır.
- Gönderim native `submit` event'i üzerinden yürür (`preventDefault` +
  `onSubmit(trimmedValue)`).
- Girdi `<textarea>`; accessible name `label` prop'undan gelir
  (varsayılan `"Aradığını anlat"`), placeholder içeriğinden bağımsızdır.
- Textarea, canlı durum bölgesine `aria-describedby` ile **her zaman** bağlıdır.
- Araç butonları `<button type="button">`, metin taşır → ikon-tek kuralı
  devreye girmez; ikon `aria-hidden`.
- Ek kaldırma butonu ikon-tek → `aria-label="Eki kaldır: <kind>: <label>"`.
  Yalnız `label` yetmez; aynı etiketli iki ek AT'de ayırt edilemez. `kind` yoksa
  ad `"Eki kaldır: <label>"` olur.
- Gönder butonu `GlassButton` (`type="submit"`, ikon-tek, `aria-label="Gönder"`).
  Kare kutu kontrol tokenıyla; yatay padding eklenmez.
- Canlı durum bölgesi **her zaman mount** edilir (boşken `:empty` ile katlanır,
  layout'a boşluk eklemez). Hem "düşünüyor" satırı hem cevap kartı bu bölgenin
  içinde yaşar → tek duyuru kaynağı; cevap kartında ikinci bir `role="status"`
  **yoktur**. `announcementMode="internal"` iken bölge `aria-live="polite"`
  taşır; `external` iken taşımaz (parent tek canlı bölge yönetiyorsa).
- Portal yok, focus trap yok, scroll kilidi yok.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| kabuk | ✅ | form gövdesi | Düz yüzey (surface + hairline), `--lg-radius-card` |
| ek chip'leri | — | `attachments` | Textarea **üstünde**, her biri kaldırılabilir |
| textarea | ✅ | brief metni | `rows=1`, auto-grow, max yükseklikte iç scroll |
| araç çubuğu | ✅ | `tools` + gönder | Gönder her zaman var, sağa yaslı |
| durum bölgesi | ✅ (hep mount) | düşünüyor **veya** cevap | Boşken görsel olarak katlanır |
| cevap kartı | — | `answer` | Düz kart: metin + chip'ler + atıf |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| `value` | değer | `string` | — | ✅ | Controlled brief metni |
| `defaultValue` | değer | `string` | `''` | — | Kontrolsüz başlangıç |
| `onValueChange` | event | `(v: string) => void` | — | — | Her değişimde |
| `onSubmit` | event | `(v: string) => void` | **zorunlu** | — | Trimlenmiş metinle |
| `placeholder` | içerik | `string` | örnek brief | — | |
| `label` | içerik | `string` | `'Aradığını anlat'` | — | Textarea accessible name |
| `size` | eksen | `'md' \| 'lg'` | `'lg'` | — | |
| `tools` | içerik | `GlassAiComposerTool[]` | — | — | Bağlam ekleme butonları |
| `onToolSelect` | event | `(id: string) => void` | — | — | Seçiciyi parent açar |
| `attachments` | içerik | `GlassAiComposerAttachment[]` | — | — | Textarea üstü chip'ler |
| `onRemoveAttachment` | event | `(id: string) => void` | — | — | |
| `loading` | state | `boolean` | `false` | — | Girişi kilitler |
| `loadingLabel` | içerik | `string` | `'Yanıt hazırlanıyor…'` | — | |
| `answer` | içerik | `GlassAiComposerAnswer \| null` | — | — | Tek yapılandırılmış cevap |
| `onAnswerChipSelect` | event | `(id: string) => void` | — | — | Takip önerisi |
| `announcementMode` | state | `'internal' \| 'external'` | `'internal'` | — | Duyuru sahipliği |

**Ref hedefi:** yok (form elementine `...rest` geçer, `ref` yayılmaz).

**Event sözleşmesi:**
- `onSubmit` yalnız metin boş/yalnız-boşluk değilken **ve** `loading` değilken çalışır.
- `onSubmit` metni **temizlemez**; temizleme kararı parent'ındır (kullanıcı
  düzeltip yeniden gönderebilsin).
- `onToolSelect` yalnız bildirir; harita seçici / dosya dialogu / ses kaydı gibi
  tarayıcı API'leri component'in işi değildir.

## 5. Seçenek eksenleri

| Eksen | Değerler | Varsayılan |
|---|---|---|
| `size` | `md` · `lg` | `lg` |

`lg`: textarea min 72px / max 160px, kabuk padding `--lg-space-4`.
`md`: textarea min 24px / max 120px, kabuk padding `--lg-space-3`.

- **Yasak kombinasyon yok** — anatomi iki ölçekte aynıdır, `size` hiçbir slotu gizlemez.
- **Türetilen seçenek yok.**
- `material` / `tone` / `variant` / `thickness` / `tint` / `prominent` eksenleri
  bu component'te **yoktur**: kabuk her zaman düz yüzeydir, cam yalnız gömülü
  `GlassButton`'dadır ve o kendi eksenlerini taşır.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| `loading` | prop | textarea, araçlar, ek kaldırma, submit | gönder butonunda `aria-busy` |
| boş metin | türetilmiş (`value.trim()`) | submit | gönder `disabled` |
| `answer` var | prop | — | canlı bölgeden duyurulur |

Katman sırası: availability (`loading`) → value (`value`) → interaction (focus).
`loading` iken `answer` gizlenir — eski cevap yeni brief işlenirken görünmez.

## 7. Davranış

**Klavye**

| Tuş | Davranış |
|---|---|
| `Enter` | Gönderir (`onSubmit`) |
| `Shift+Enter` | Satır ekler (varsayılan davranış korunur) |
| `Tab` | Doğal sıra: ek kaldır → textarea → araçlar → gönder → cevap chip'leri |

IME kompozisyonu sürerken (`isComposing`, `key === 'Process'`, `keyCode === 229`)
Enter yutulur — tamamlanmamış aday erken gönderilmez.

**Auto-grow:** her değer/ölçek değişiminde `height='auto'` → `scrollHeight`.
Maksimum yükseklik CSS'te; aşınca `overflow-y: auto` devreye girer.

**Controlled/uncontrolled:** `value` verilirse controlled; `defaultValue` yalnız
ilk render'da okunur. İkisi birlikte verilirse `value` kazanır.

**Async:** `loading` prop'u parent'ındır; component kendi içinde istek yönetmez.

**Overlay:** N/A — portal, focus trap ve scroll kilidi yoktur.

## 8. İçerik kuralları

- Uzun metin: textarea max yükseklikte iç scroll'a geçer; ek etiketleri ve cevap
  metni `overflow-wrap: anywhere` ile kırılır (uzun TR bileşik kelimeler taşmaz).
- Boş içerik: `tools` boşsa araç çubuğunda yalnız gönder butonu kalır; `answer`
  yoksa durum bölgesi görsel olarak katlanır.
- İkon-etiket: araç ikonları dekoratiftir, etiket metni zorunludur.
- `answer.text` markdown **yorumlanmaz** — düz metindir.
- Lokalizasyon: tüm varsayılan metinler Türkçedir ve prop'la değiştirilebilir;
  yalnız `aria-label="AI ile arama"` ve `aria-label="Gönder"` sabittir.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kabuk | background | `--lg-surface` | — |
| kabuk | border | `--lg-hairline` | — |
| kabuk | radius | `--lg-radius-card` | — |
| kabuk | box-shadow | `--lg-shadow-xs` | — |
| kabuk | outline | `--lg-accent` | `:has(textarea:focus-visible)` |
| kabuk | opacity | — | `[data-disabled]` → `.7` |
| ek chip / araç / cevap chip | min-height | `--lg-control-sm` → coarse `--lg-control-md` | — |
| ek chip / araç / cevap chip | radius | `--lg-radius-capsule` | — |
| gönder | boyut | `--lg-control-md` → coarse `--lg-control-lg` | — |
| cevap kartı | radius | `--lg-radius-media` | — |
| metin | font-size | `--lg-text-body` / `--lg-text-footnote` / `--lg-text-caption` | — |
| vurgu | renk | `--lg-accent` (`color-mix` ile karıştırılır) | — |

**Borç — token karşılığı olmayan mikro-geometri** (`.root` üzerinde yerel custom
property): `--dot-size: 6px`, `--remove-size: 20px`,
`--remove-size-coarse: 28px`, `--chip-gap: 6px`,
`--textarea-min-lg: 72px`, `--textarea-max-lg: 160px`,
`--textarea-min-md: 24px`, `--textarea-max-md: 120px`.
`GlassAiSearchBar` ile aynı desen; ölçek token'ı tanımlanırsa buradan silinir.

## 10. Storybook kapsamı

| Story | Durum |
|---|---|
| Default / Overview | ✅ |
| Playground (Controls) | ✅ |
| Variants / Materials | N/A — `material`/`variant` ekseni yok (§5) |
| Sizes | ✅ |
| States | ✅ (Yükleniyor, Cevapla, Akış simülasyonu) |
| Uzun içerik | ✅ |
| Responsive | ✅ |
| Temalar | ✅ |
| Erişilebilirlik | ✅ |

Ek: Araçlarla, Eklerle, Akış simülasyonu.

## 11. Test kabul kriterleri

**Unit / interaction**
- Uncontrolled `defaultValue` render + yazma; controlled `value` sabit kalır,
  `onValueChange` çalışır.
- Enter gönderir, Shift+Enter göndermez, IME sırasında Enter göndermez.
- Yalnız boşluk içeren metin gönderilmez; gönder butonu `disabled`.
- Gönderimde metin trimlenir; gönderim sonrası metin temizlenmez.
- `loading` iken textarea, araçlar ve ek kaldırma butonları `disabled`;
  Enter göndermez; `answer` gizlenir.
- `onToolSelect` / `onRemoveAttachment` / `onAnswerChipSelect` doğru id ile çalışır.
- `answer` metin + chip + atıf render eder.
- `size` `data-size` olarak yansır, anatomiyi gizlemez.

**A11y**
- Form `aria-label="AI ile arama"`; sayfada `search` landmark'ı **oluşmaz**.
- Ek kaldır butonunun adı tür + etiket içerir.
- Textarea `aria-describedby` ile canlı bölgeye bağlıdır.
- `announcementMode="internal"` → `aria-live="polite"`; `external` → nitelik yok,
  görsel metin korunur.

**Visual**
- Kağıt/Grafit temada düz yüzey ve hairline okunur kalır.
- Dar container'da araç çubuğu sarar, dokunmatikte hedefler 44px'e çıkar.

## 12. Do / Don't

**Do**
- Harita/dosya/ses seçicisini parent'ta aç, sonucu `attachments` olarak geri ver.
- Tek canlı bölge disiplini için sayfada başka `aria-live` varsa
  `announcementMode="external"` kullan.
- Cevabı kısa tut; derinlik gerekiyorsa chip ile ayrı bir görünüme yönlendir.

**Don't**
- Kabuğa cam verme — cam yalnız gönder butonundadır (katman modeli).
- Çok turlu sohbeti bu component'le kurma; `GlassChatDock` kullan.
- `answer.text` içine markdown/HTML gömme.
- Gönderim sonrası metni component'in temizlemesini bekleme.

**Bilinen kısıtlar**
- `:has()` desteklemeyen tarayıcılarda focus halkası kabuk yerine textarea
  üzerinde kalır (erişilebilirlik korunur, görsel birleşiklik kaybolur).
- Auto-grow `scrollHeight` okuduğu için ilk paint'te bir layout ölçümü yapar.

**Açık kararlar**
- Çoklu cevap / cevap geçmişi kapsam dışı bırakıldı (YAGNI).
- Sesli giriş için görsel kayıt durumu (dalga formu) eklenmedi; ihtiyaç doğarsa
  ayrı bir component olur.

## 13. Changelog

- **2026-07-28** — İlk sürüm. Konsept 06 "Sohbet Kompozitörü"nden türetildi;
  spec: `docs/superpowers/specs/2026-07-28-glass-ai-composer-design.md`.
