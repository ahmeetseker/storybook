# Codex ↔ Glass Karşılaştırma ve Eksik Raporu

Tarih: 2026-07-18 · Kaynak: 8 paralel inceleme ajanı (`src/variants/codex/*` ↔ `src/components/Glass*`)

## Özet

Codex `src/variants/codex/` altında 14 modül grubu üretti. Bire bir karşılaştırma sonucu:

- **Form ve kontrol katmanında Glass karşılığı olmayan component yok** — eksikler özellik/davranış düzeyinde.
- **Glass'ta hiç karşılığı olmayan 8+ component/pattern var** — çoğu AI şeffaflık ve marketplace yönetim katmanında.
- Glass birçok yerde Codex'ten üstün: GlassSelect (custom listbox), GlassDatePicker (tam takvim), GlassGallery (lightbox), GlassChatDock (focus/IME), GlassMap (guard'lar), motion cilası.

## A) Glass'ta HİÇ olmayan componentler (Dalga 5 — TAMAMLANDI ✅)

> Aşağıdaki 8 component `src/components/` altına eklendi (tsx + module.css +
> stories + test + rules.md + index.ts), `src/index.ts` ve
> `src/demo/ComponentCatalog.tsx` kataloğuna işlendi. 65 yeni test yeşil; tüm
> suite (1089 test) geçiyor; `tsc -b` temiz; yeni dosyalarda lint sorunu yok.


| # | Yeni component | Codex kaynağı | Ne yapar |
|---|---|---|---|
| 1 | `GlassMetricStrip` | `CodexMetricStrip` (data/CodexData.tsx:628) + `CodexStat` (content/CodexContent.tsx:173) | KPI şeridi: `dl/dt/dd`, trend yönü ikon + sr-only metin (renk-dışı kanal) |
| 2 | `GlassFilterPanel` | content/CodexContent.tsx:275 | Adlandırılmış `aside` complementary landmark + sonuç sayısı + sıfırla |
| 3 | `GlassAiEvidenceList` | ai/CodexAi.tsx:260 | AI kaynak/dayanak listesi: tür, doğrulanma, ilgi %, açılabilir kaynak, güvenli boş durum |
| 4 | `GlassAiConfidence` | ai/CodexAi.tsx:348 | `role="meter"` güven göstergesi + seviye metni + etken (factors) listesi |
| 5 | `GlassAiRiskReview` | ai/CodexAi.tsx:665 | Risk incelemesi + insan karar kapısı; ağır açık risk varken onay kilidi |
| 6 | `GlassAiAgentActivity` | ai/CodexAi.tsx:878 | AI ajan denetim kaydı: `role="log"`, izin kapısı (İzin ver/Reddet), durdurma, gizlilik notu |
| 7 | `GlassSavedSearchCard` | marketplace/CodexMarketplace.tsx:542 | Kayıtlı arama/alarm kartı: yeni sonuç sayısı, alarm yönetimi |
| 8 | `GlassListingManagementCard` | marketplace/CodexMarketplace.tsx:585 | Satıcı ilan yönetim kartı: draft/review/live/changes/paused/expired + "İşlem gerekli" |

Not: `CodexAiVisionInspection`, `CodexAiPromptComposer`, `CodexAiSmartFilter` kısmen mevcut Glass componentleriyle örtüşüyor (`GlassPhotoFeatureOverlay`, `GlassAiSearchBar`) — bunlar yeni component değil, mevcutlara özellik eklemesi olarak backlog'da (bölüm B).

## B) Mevcut componentlerdeki özellik eksikleri (backlog — sonraki dalgalar)

### Yüksek öncelik (a11y/semantik)
- **GlassHeader**: skip link yok (`#main-content`).
- **GlassListingCard**: tüm kart tek `<button>` — `article` + heading semantiği + statik/interaktif ayrımı (false affordance) + ayrı favori aksiyonu yok.
- **GlassTabs**: `disabled` tab desteği yok; tablist'e `aria-label` verilmiyor.
- **GlassEmptyState**: başlık heading değil (`<p>`).
- **GlassTimeline**: `<time dateTime>` özniteliği yazılmıyor.
- **GlassToast**: warning → assertive alert değil; görünür dismiss butonu yok.
- **Rest-spread sıralaması**: GlassButton/GlassIconButton/GlassCheckbox'ta `...rest` yönetilen ARIA'yı ezebiliyor (Codex tersini garanti edip test ediyor).
- **GlassField**: child kendi `id`'sini verirse label bağı kopuyor; error anında description `aria-describedby`'dan düşüyor.

### Orta öncelik (özellik)
- Form katmanı: ortak `label/description/error` slot altyapısı + `loading` (aria-busy) sözleşmesi tüm form kontrollerinde eksik (Codex `formInternals`/`formUtils` deseni).
- **GlassTable**: loading skeleton satırları, `density`, `hideOnCompact`, `rowActions`, yapılandırılmış boş durum, zorunlu `caption`.
- **GlassSpecTable**: gruplama + alt başlıklar + öğe açıklaması.
- **GlassCompareTable**: "yalnız farklar" gizleme modu + zengin sütun başlığı.
- **GlassScoreMeter**: yapılandırılabilir `max`.
- **GlassSkeleton**: içerik-şekilli preset blok (`listing/table/detail/message`) + `role="status"` etiketli yüzey.
- **GlassSidebar**: mobil off-canvas panel (focus trap + Escape + scroll lock), rail'e daraltma, item `href/badge/disabled`.
- **GlassBreadcrumb**: `maxItems` taşma/daraltma; `aria-label` prop'u; `href` link desteği.
- **GlassPagination**: uncontrolled mod + `hrefBuilder` link modu.
- **GlassToolbar**: dikey orientation + RTL + iç içe menü odak izolasyonu.
- **GlassMenu**: `href` menuitem + `description` + `shortcut`.
- **GlassBadge**: semantik `tone` seti + `dot` göstergesi.
- **GlassChip**: bağlama duyarlı remove etiketi (`removeLabel`); iç içe interaktif yapı sorunu.
- **GlassSwitch/GlassCheckbox**: görünür `label`/`description` + describedby bağı.
- Medya altyapısı: temsili placeholder medya (`role="img"`), loading/empty/error/retry durumları, `loading="lazy"` (Gallery), Carousel klavye roving + reduced-motion, Map zoom/legend/marker türleri, NearbyPlaces sıralama/seçim, PhotoFeatureOverlay `role="meter"` + marker roving.
- AI/marketplace zenginleştirme: GlassAiSummaryCard'a "güven ölçülmedi" fallback + insan inceleme durumu + evidence entegrasyonu; GlassTrustSignalPanel'e per-sinyal `source/updatedAt/action`; GlassValuationCard'a 3-yönlü kalibrasyon feedback + yasal sınır notu; GlassSellerCard'a doğrulama kanalları + yanıt metrikleri; GlassReviewCard'a satıcı yanıtı; GlassClimateRiskPanel'e `updatedAt` + metodoloji notu; GlassVoiceBar'a transcript onayı + hata durumu; GlassChatDock mesajlarına evidence + reviewed işareti.

### Sistem/altyapı
- Scoped tema provider (aynı sayfada iki tema), üçüncü tema (Mineral), `info` semantik rolü + fg/solid ayrımı, shadow/duration/easing tokenları.
- ComponentCatalog: veri↔sunum ayrımı + katalog sözleşme testi (Codex 88 component + 28 sayfa bütünlük testi yapıyor).
- Rol bazlı sayfa kataloğu (Public/Buyer/Account/Seller/Enterprise) ve sayfa smoke testleri Glass tarafında yok.
- Test açıkları: RTL bağlam testi, loading canlı bölge, `aria-describedby` birleşim doğrulamaları, rest-override koruması testleri.

## C) Glass'ın Codex'ten üstün olduğu yerler (iş çıkarma)

GlassSelect (custom listbox + typeahead), GlassDatePicker (tam erişilebilir takvim), GlassGallery (lightbox), GlassMediaGallery (video track + iframe sandbox), GlassFloorPlanViewer (pointer pan + Ctrl+wheel), GlassMap/GlassPhotoFeatureOverlay (NaN guard), GlassChatDock (focus/IME/scroll anchoring), GlassVoiceBar (WCAG 2.5.3), GlassCompareTable (odak kurtarma + locale parse), GlassTable (controlled+uncontrolled), GlassInput (clearable), motion/press cilası genelinde.
