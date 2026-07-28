# GlassAiComposer — Tasarım Dokümanı

**Tarih:** 2026-07-28
**Durum:** onaylandı
**Kaynak:** "Sohbet Kompozitörü" konsepti (header AI arama alanı ilham çalışması, konsept 06)

## 1. Amaç

Tek seferlik **brief → tek yapılandırılmış cevap** akışını sahiplenen, büyüyen bir
AI giriş alanı. Kullanıcı tek satırlık sorgu yerine uzun bir cümleyle ne aradığını
anlatır ("Ailemle taşınacağız, okula yakın, bahçeli, 6 milyona kadar"), isteğe bağlı
bağlam ekler (haritadan alan, görsel, ses) ve karşılığında liste değil **özet + takip
önerisi + atıf** alır.

### Kullan

- Karar süresi uzun, kriter sayısı yüksek akışların giriş noktası (ev alma, yatırım).
- AI cevabının kendisi sonuç listesi kadar değerliyse.

### Kullanma

- Tek satırlık, filtreye çevrilecek arama → `GlassAiSearchBar`.
- Çok turlu, geçmişi olan sohbet → `GlassChatDock`.
- Yalnız özet gösterimi (giriş alanı yok) → `GlassAiSummaryCard`.

### Komşularla sınır

| Component | Sorumluluk | Bu component'ten farkı |
|---|---|---|
| `GlassAiSearchBar` | tek satır, `role="search"`, sorgu → filtre chip'leri | tek satır; cevap üretmez, filtre çıkarır |
| `GlassChatDock` | portal + dock, çok turlu mesaj listesi | geçmiş tutar, portal kullanır |
| `GlassAiSummaryCard` | hazır AI özetini gösterir | giriş alanı yoktur |
| **`GlassAiComposer`** | **sayfa içi brief alanı + ekler + tek cevap** | — |

## 2. Katman modeli kararı

`GenelBakis.mdx` katman modeli gereği ve `GlassAiSearchBar` ile tutarlı olacak şekilde:

- Kompozitör kabuğu **düz yüzey** (`--lg-surface` + `--lg-hairline`) — içerik katmanı.
- **Cam yalnız gömülü `GlassButton`'da** (gönder) — kontrol katmanı.
- Cevap kartı da düz yüzey; cam üstüne cam yok, sayfa cam bütçesini tüketmez.

İlham görselindeki cam kabuk bilinçli olarak düzleştirildi; aksi halde aynı ekranda
header + kompozitör + cevap üç cam yüzey doğurur ve "cam üstüne cam yok" kuralı kırılır.

## 3. Public API

```ts
export interface GlassAiComposerTool {
  /** Callback'te geri verilen kimlik — DOM id'sine yazılmaz */
  id: string
  /** Buton metni; ikon-tek buton değildir, metin accessible name'i taşır */
  label: string
  /** Dekoratif ikon (aria-hidden) */
  icon?: ReactNode
  disabled?: boolean
}

export interface GlassAiComposerAttachment {
  id: string
  /** Chip metni, ör. "Urla, 4 km²" */
  label: string
  /** Tür etiketi, kaldır butonunun erişilebilir adında kullanılır, ör. "Harita alanı" */
  kind?: string
  icon?: ReactNode
}

export interface GlassAiComposerAnswerChip {
  id: string
  label: string
}

export interface GlassAiComposerAnswer {
  /** Özet metin — tek paragraf, markdown yok */
  text: string
  /** Takip önerileri; tıklama onAnswerChipSelect ile bildirilir */
  chips?: GlassAiComposerAnswerChip[]
  /** Atıf satırı, ör. "27 ilan · 3 bölge verisi" */
  sources?: string
}

export interface GlassAiComposerProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Enter, gönder butonu veya cevap chip'i seçimiyle değil — yalnız gönderimde çalışır */
  onSubmit: (value: string) => void
  placeholder?: string
  /** Textarea'nın accessible name'i; placeholder'dan bağımsız */
  label?: string
  size?: 'md' | 'lg'
  tools?: GlassAiComposerTool[]
  onToolSelect?: (id: string) => void
  attachments?: GlassAiComposerAttachment[]
  onRemoveAttachment?: (id: string) => void
  loading?: boolean
  loadingLabel?: string
  answer?: GlassAiComposerAnswer | null
  onAnswerChipSelect?: (id: string) => void
  announcementMode?: 'internal' | 'external'
  className?: string
}
```

Varsayılanlar: `size='lg'`, `loading=false`, `announcementMode='internal'`,
`label='Aradığını anlat'`, `loadingLabel='Yanıt hazırlanıyor…'`.

Eksen disiplini: tek seçenek ekseni `size`. `hover`/`focus`/`active` prop değildir.
Birleşik variant yoktur. Controlled deseni `value` + `defaultValue` + `onValueChange`.

## 4. Anatomi

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| kabuk | ✅ | form | Düz yüzey, `--lg-radius-card`, hairline |
| ek chip'leri | — | `attachments` | Textarea **üstünde**; her biri kaldırılabilir |
| textarea | ✅ | brief metni | `rows=1`, auto-grow, max yükseklik sonra iç scroll |
| araç çubuğu | — | `tools` + gönder | Gönder her zaman var, sağa yaslı |
| düşünüyor | ✅ (hep mount) | `loadingLabel` | `:empty` ile katlanır, layout zıplatmaz |
| cevap | — | `answer` | Düz kart: metin + chip'ler + atıf |

## 5. Semantik sözleşme

- Kök `<form>` + `aria-label="AI ile arama"`. `role="search"` **kullanılmaz** — bu bir
  arama alanı değil brief alanıdır ve sayfada ayrıca `GlassAiSearchBar` olabilir.
- Gönderim native `submit` event'i üzerinden (`preventDefault` + `onSubmit(value)`).
- `<textarea>`; accessible name `label` prop'undan (`aria-label`), placeholder'dan bağımsız.
- Auto-grow: her değer değişiminde `height='auto'` → `min(scrollHeight, max)`. Max
  yükseklik `size`'a bağlı; aşınca `overflow-y: auto`.
- Klavye: **Enter → gönder**, **Shift+Enter → satır**. `GlassChatDock` ile birebir aynı,
  IME kompozisyonu (`isComposing` / `keyCode === 229`) sırasında Enter yutulmaz.
- Boş veya yalnız boşluk içeren metin `onSubmit` **çağırmaz**; gönder butonu o an `disabled`.
- `loading` iken textarea, araç butonları ve ek kaldırma butonları `disabled`;
  gönder butonu `GlassButton loading` ile `aria-busy`.
- Araç butonları metin taşır → ikon-tek kuralı devreye girmez; ikon `aria-hidden`.
- Ek kaldırma butonu ikon-tek → `aria-label="Eki kaldır: <kind>: <label>"` (yalnız
  `label` yetmez; aynı etiketli iki ek AT'de ayırt edilemez).
- "Düşünüyor" kapsayıcısı her zaman mount edilir; `announcementMode='internal'` iken
  `aria-live="polite"` taşır, `external` iken taşımaz (parent tek canlı bölge yönetir).
  Cevap metni de aynı canlı bölgeden duyurulur; cevap kartında ikinci bir
  `role="status"` **yoktur** (çift duyuru olmaz).
- Portal yok, focus trap yok, scroll kilidi yok.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| loading | prop | tüm etkileşim, submit | `aria-busy` (gönder butonu) |
| boş metin | türetilmiş | submit | gönder `disabled` |
| answer var | prop | — | canlı bölgeden duyurulur |

Katman sırası: availability (`loading`) → value (`value`) → interaction (focus).

## 7. Seçenek eksenleri

| Eksen | Değerler | Varsayılan | Etkisi |
|---|---|---|---|
| `size` | `md` \| `lg` | `lg` | Textarea min/max yüksekliği, iç padding, araç butonu boyutu |

`lg`: min 3 satır (~72px), max 160px. `md`: min 1 satır (~24px), max 120px.
Anatomi iki ölçekte aynıdır; slot gizlenmez.

## 8. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| kabuk | background | `--lg-surface` |
| kabuk | border | `--lg-hairline` |
| kabuk | radius | `--lg-radius-card` |
| kabuk | shadow | `--lg-shadow-xs` |
| ek/araç chip | radius | `--lg-radius-capsule` |
| ek/araç chip | min-height | `--lg-control-sm` |
| cevap kartı | radius | `--lg-radius-media` |
| metin | size | `--lg-text-body` / `--lg-text-footnote` / `--lg-text-caption` |
| focus | outline | `--lg-accent`, `--lg-focus-ring-width` |

Mikro-geometri (kaldır butonu 20/28px, ikon 16px) `.root` üzerinde yerel custom
property olarak tanımlanır ve `rules.md` §9'a borç olarak yazılır — `GlassAiSearchBar`
ile aynı desen.

## 9. Motion

- Yalnız `transform` / `opacity`.
- Ek chip'leri ve cevap kartı girişte kısa fade+translate; `presets` üzerinden.
- Gönder butonu basınç etkileşimini `GlassButton` içindeki `useGlassPress`'ten alır.
- `prefers-reduced-motion: reduce` altında tüm giriş animasyonları ve düşünüyor
  nabzı kapanır (opacity sabitlenir).

## 10. Dosya seti

```
src/components/GlassAiComposer/
├── GlassAiComposer.tsx
├── GlassAiComposer.module.css
├── GlassAiComposer.stories.tsx
├── GlassAiComposer.test.tsx
├── rules.md
└── index.ts
```

Kayıtlar: `src/index.ts` export, `src/demo/ComponentCatalog.tsx` girdisi
(kategori: `İçerik`, statü: `hazır`).

Storybook: `title: 'Bileşenler/AI/GlassAiComposer'`, `autodocs`.

## 11. Storybook kapsamı

Default · Playground · Sizes · Araçlarla · Eklerle · Yükleniyor · Cevapla ·
Uzun içerik (TR uzun kelime + taşma) · Responsive (dar container) · Temalar ·
Erişilebilirlik (focus sırası, ARIA).

## 12. Test kabul kriterleri

1. Uncontrolled: `defaultValue` render edilir, yazınca değer değişir.
2. Controlled: `value` sabitken yazmak DOM değerini değiştirmez, `onValueChange` çalışır.
3. Enter → `onSubmit` çağrılır; Shift+Enter → çağrılmaz, satır eklenir.
4. Yalnız boşluk içeren metinle Enter → `onSubmit` çağrılmaz.
5. Boş metinde gönder butonu `disabled`.
6. `loading` iken textarea, araç ve ek kaldırma butonları `disabled`.
7. Araç tıklaması `onToolSelect(id)` çağırır.
8. Ek kaldırma butonunun erişilebilir adı `kind` + `label` içerir; tıklama
   `onRemoveAttachment(id)` çağırır.
9. `answer` verildiğinde metin, chip'ler ve atıf render edilir; chip tıklaması
   `onAnswerChipSelect(id)` çağırır.
10. `announcementMode='external'` iken canlı bölgede `aria-live` niteliği yoktur.
11. Gönderim sonrası metin temizlenmez (parent kararı) — `onSubmit` yalnız bildirir.

## 13. Açık kararlar

- Gönderim sonrası textarea'yı component temizlemez; controlled kullanımda parent
  karar verir. Uncontrolled kullanımda da metin kalır (kullanıcı düzeltip yeniden
  gönderebilsin).
- Çok turlu akış kapsam dışı; ihtiyaç doğarsa `GlassChatDock` kullanılır.
- Ses kaydı/dosya seçici gibi tarayıcı API'leri component'in işi değildir;
  `onToolSelect` ile parent'a devredilir.
