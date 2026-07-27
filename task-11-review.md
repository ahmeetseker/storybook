# Task 11 review

## Verdict: BLOCK — Task 11 tamamlanmış değil

### Yüksek — Zorunlu scroll-contract E2E testi yok

Planın Task 11 / Test 3 maddesi uzun thread fixture'ı üzerinde ilk görünür mesajın
konumunu koruma, eski sayfayı prepend etme ve “latest” kontrolüne dönmeyi ister
(`docs/superpowers/plans/2026-07-27-enterprise-messages.md:1217`).
`apps/web/e2e/messages.spec.ts` yalnız üç test içeriyor; `playwright --list` de
yalnız desktop, compact ve preferences testlerini listeliyor. Default route
fixture'ında seçilen Urla konuşmasında yalnız dört mesaj var
(`message-fixtures.ts:146-149`) ve thread page size 30
(`messages-query.ts:11`), dolayısıyla gerçek route üzerinde older-page düğümü
hiç oluşmuyor. Prepend anchor ve jump-to-latest davranışları E2E kapısından
geçmiyor.

### Yüksek — Mesaj visual baseline'ları üretilmemiş

Spec üç screenshot bekliyor (`messages.spec.ts:121`, `:138`, `:175`), fakat
`apps/web/e2e/messages.spec.ts-snapshots/` yok. Çalışabilir bir ortamda bu
assertion'lar missing-snapshot nedeniyle başarısız olur; Task 11 Step 4
tamamlanmamış.

### Orta — Ekran okuyucu bölümü doğrulama kaydı değil

`rules.md:279-290` gerekli altı VoiceOver/NVDA maddesini doğru biçimde sayıyor
ve otomasyonun manuel smoke yerine geçmediğini belirtiyor. Ancak tarih,
AT/tarayıcı/platform, uygulayan kişi ya da pass/fail sonucu bulunmadığından bu,
planın istediği “manuel doğrulama kaydı” değil; henüz yürütülmemiş checklist.

### Orta — %200 metin zoom assertion'ı işlev kaybını yeterince kanıtlamıyor

Test gerçekçi bir text-only zoom seam'i olarak `:root { font-size: 200% }`
kullanıyor (`messages.spec.ts:254-255`), ancak sonrasında yalnız h1 görünürlüğü,
textarea'ya programatik `fill`, send düğmesinin `enabled` olması ve document
yatay overflow'unu denetliyor (`:257-266`). `toBeEnabled()` görünürlük veya
Dock tarafından örtülmeme garantisi vermez; gönderim de yapılmıyor. Bu nedenle
“%200 zoom altında işlevini korur” iddiası, compact testteki bounding-box
sözleşmesi kadar güçlü değil.

### Orta — Visual testler uzak görsellere bağlı

Gerçek route fixture'ları Unsplash URL'leri kullanıyor
(`message-fixtures.ts:31-36`). Özellikle compact-list screenshot'ı yalnız route
hydration ve clock stabilizasyonunu bekliyor; görseller için deterministik local
asset veya açık bir load assertion'ı yok. CI ağ durumu/yükleme yarışı baseline
farkı üretebilir.

## Doğrulanan doğru noktalar

- Selector ve sayılar DOM ile uyumlu: hydration sonrası tek
  `.shell-dock-variant`, tek `main#main-content`, iki flat ve sıfır glass content
  surface var.
- `a` + `Okunmamış` filtresi default fixture'da gerçekten dört sonuç üretir.
- Conversation URL'si yalnız opaque `konusma` taşır; seçim push, temizleme
  replace davranışıyla browser Back rail'e döner. Search/filter/scroll state'i
  route component state'inde kalır.
- Dock overlap ölçümü viewport `boundingBox()` koordinatlarını karşılaştırıyor;
  erişilebilir adı verilen nav kutusu padding ve glass yüzeyi de içerdiğinden
  assertion anlamlı.
- Reduced-motion assertion'ı planın istediği feature transition-duration
  sözleşmesiyle uyumlu. Playwright config tüm projede zaten `reducedMotion:
  'reduce'` kullanıyor.
- Production route'a hidden test flag'i veya timer eklenmemiş.
  `stabilizeClock()` yalnız test içi screenshot normalizasyonu; `waitForTimeout`
  veya production `setTimeout` yok.

## Çalıştırılan kapılar

- `npx playwright test apps/web/e2e/messages.spec.ts --list` — PASS, 3 test.
- `npx oxlint apps/web/e2e/messages.spec.ts` — PASS.
- `npx tsc --ignoreConfig --noEmit --strict --skipLibCheck --target ES2023 --module ESNext --moduleResolution Bundler --lib ES2023,DOM --types node apps/web/e2e/messages.spec.ts` — PASS.
- Runtime denemesi başlamadı: local web server `listen EPERM 127.0.0.1`
  (ardından watcher `EMFILE`) ile kapandı. Bu ortamda davranış/screenshot sonucu
  veya baseline üretimi doğrulanamadı.

