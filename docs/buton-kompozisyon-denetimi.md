# Buton Kompozisyon Denetimi — Konsolide Rapor

Tarih: 2026-07-24 · Kaynak: 6 paralel denetim ajanı (53 component'teki tüm ham `<button>` kullanımları)

Katman modeli gereği içerik componentleri eylem butonlarını **compose** eder: genel amaçlı eylem → `GlassButton`, ikon-tek eylem → `GlassIconButton`. Kanonik örnek: GlassTourScheduler.

## A) SAPMA — GlassButton kompozisyonuna çevrildi ✅

| Component | Buton | Eski görünüm | Yeni |
|---|---|---|---|
| GlassTourPlanner | `confirmButton` "Planı Onayla" | opak accent kapsül | `GlassButton prominent` |
| GlassPersonalNote | `saveButton` "Kaydet" | accent dolgu, control-sm | `GlassButton prominent size="sm"` |
| GlassPersonalNote | `cancelButton` "Vazgeç" | hairline kenarlıklı | `GlassButton size="sm"` |
| GlassSavedSearchCard | `primary` "Sonuçları aç" | accent dolgu, control-md | `GlassButton prominent size="sm"` |
| GlassSavedSearchCard | `secondary` "Düzenle" | hairline kenarlıklı | `GlassButton size="sm"` |
| GlassAiAgentActivity | `stop` "Çalışmayı durdur" | danger-karışım kenarlıklı pill | `GlassButton size="sm"` |
| GlassAiAgentActivity | izin kapısı `approve`/`reject` | elle çizilmiş pill çifti | `GlassButton prominent size="sm"` / `GlassButton size="sm"` |
| GlassAiRiskReview | karar kapısı `approve`/`reject` | GlassButton görünümünün elle kopyası | `GlassButton prominent` / `GlassButton` (onay kilidi sözleşmesi korunarak) |
| GlassInfiniteList | `loadMoreButton` "Daha fazla yükle" | GlassButton default'un elle kopyası | `GlassButton` |

Not: AI karar kapılarında (AiAgentActivity/AiRiskReview) davranış sözleşmesi (disabled kilidi, `aria-describedby`) birebir korundu — yalnız görsel kompozisyon değişti.

**Sistem düzeltmesi:** Dönüşümler `size="sm"` kullanınca dokunmatik hedef 36px'e düşüyordu (eski elle çizilmiş butonlar 44px'e büyütüyordu). Tek yerde çözüldü: GlassButton `sm` artık `pointer: coarse`'ta `--lg-control-md`ye (44px) yükselir (GlassButton.module.css + rules.md §7). Bilinen küçük görsel fark: SavedSearchCard aksiyonlarının ince-pointer taban yüksekliği 40→32px (`sm` footnote ölçeğine uygun boy).

## B) SINIRDA — karar bekliyor (dokunulmadı)

1. **Dismiss/remove-X ailesi (8 üye, kendi içinde tutarlı):** GlassAlert `.dismiss` (tek belgeli gerekçeli üye: "cam maliyeti gereksiz"), GlassToast `.close`, GlassChatDock `.close`, GlassAiFlagBanner `.dismiss`, GlassChip `.remove`, GlassCompareBar `.remove`, GlassCompareTable `.removeButton`, GlassFileUpload `.remove`, GlassMap `.popupClose`, GlassInput `.clear`. Karar: aile olarak kalır + ortak gerekçe rules.md'lere yazılır **ya da** GlassIconButton'a toplu geçiş.
2. **GlassChatDock `.send`:** ikon-tek accent dolgulu gönder — GlassIconButton'da `prominent` ekseni yok (`active` yanlış semantik: aria-pressed ekler). Karar: GlassIconButton'a `prominent` ekseni eklemek.
3. **GlassButton'da eksik eksenler yüzünden çevrilemeyenler:** SavedSearchCard "Sil" (danger/quiet ekseni yok), PersonalNote "Düzenle" (düz-metin aksiyon) ve "Not ekle" (dashed boş-durum affordance'ı), PhotoFeatureOverlay "Etiketleri göster" (pressed ekseni yok), ReviewCard "Faydalı" (feedback-pill ailesiyle tutarlı).
4. **Yön okları:** GlassDatePicker `.nav`, GlassPagination prev/next — kendi aralarında tutarlı gezinme kontrolleri.

## C) BİLİNÇLİ DESEN — temiz (örnekler)

Tab/segment/chip/menü öğesi/takvim günü/sayfa numarası/satır tetikleyicisi/thumbnail/marker/rating yıldızı/sort başlığı/grabber; ✦ AI feedback pill'leri (👍/👎, tüm AI componentlerinde ortak kontrat); belgeli spec kararları (AiFlagBanner "Ayrıntılar" düz metin, ChatDock launcher, AgencyCard "ilanı görüntüle" metin-link, VoiceBar 3-durumlu mikrofon toggle'ı, Vitrin/Bento tıklanabilir kartları, FileUpload dropzone).
