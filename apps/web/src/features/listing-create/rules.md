---
name: ListingCreateWorkspace
category: içerik
status: hazır
lastReviewed: 2026-07-25
---

# ListingCreateWorkspace Kuralları

## 1. Amaç

Arsa, konut, iş yeri ve bina ilanlarını beş doğrulanabilir adımda taslak hâlinden
yayın kararına taşır. Tek alan düzenlemek veya hızlı ilan aramak için kullanılmaz.
`ListingEntryChoice` başlangıç, `VerificationReviewStep` ise güvenli yayın kapısıdır.

## 2. Semantik sözleşme

Kök element `main` olur. İlerleme göstergesi etiketli `nav`, adımlar sıralı liste,
form bölümleri `section`, son kontrol satırları `article` kullanır. Hata mesajları
alanla `aria-describedby` üzerinden bağlı ve adım başındaki bağlantılı hata
özetinde tekrarlanır. EİDS bekleme durumu `aria-busy`,
başarısız durumlar `role="alert"` ve yayın sonucu odaklanabilir `role="status"`
kullanır. Portal yoktur.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Entry | Evet | AI veya manuel başlangıç | AI önerisi ayrı incelenir |
| Header | Evet | Taslak ve kayıt durumu | Hedefli canlı bölge |
| Progress | Evet | Beş adım | Gelecek adımlar doğrulanmadan açılmaz |
| Workspace | Evet | Aktif adım formu | İçerik yüzeyi flat |
| Select | Gerektikçe | Temalı `GlassSelect` listbox | Formda `material="flat"`; mobil ilerlemede glass; native OS menüsü yok |
| Context | İlk 3 adım | Adım yardımı | Formu tekrar etmez |
| Action bar | Evet | Geri, kayıt kurtarma ve birincil eylem | Sticky flat kontrol rayı |

## 4. Public API

| Ad | Tür | Default | Controlled | Açıklama |
|---|---|---|---|---|
| `adapterDelayMs` | `number` | `450` | Hayır | Demo adaptör gecikmesi |
| `adapterScenario` | `ListingAdapterScenario` | başarılı durumlar | Hayır | Hata ve EİDS senaryosu |
| `initialDraft` | `ListingDraft` | boş taslak | Hayır | Yalnız ilk render için Story/test başlangıç verisi |

Ref hedefi N/A — sayfa düzeyi orkestratör. Dış event N/A — demo yayın yerel state ile
sonuçlanır.

## 5. Seçenek eksenleri

`material`, `tone`, `size`, `variant`, `thickness`, `tint`, `prominent` eksenleri
N/A — bu bir sayfa akışıdır. Altındaki `GlassButton` kendi eksen sözleşmesini
korur. Hover/focus/active prop değildir.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| entry | `entryMode=null` | Form | Bölge başlığı |
| editing | `activeStep` | Entry | `aria-current=step` |
| saving | adaptör isteği | saved | `role=status` |
| checking | EİDS isteği | yayın | `aria-busy` |
| unauthorized/unavailable | EİDS sonucu | verified | `role=alert` |
| published | `meta.published` | düzenleme | Odaklı `role=status` |

Katman sırası: yayınlandı → entry → aktif adım → alan etkileşimi.

## 7. Davranış

- Tab sırası görsel sırayı izler; Enter/Space tüm butonlarda native davranır.
- Geçersiz “Devam et” ilk hatalı alana odak verir.
- Adım geçişi yeni adım başlığına odak ve scroll taşır.
- Son kontrolden açılan bölüm geçerliyse doğrudan son kontrole döner.
- Rol veya taşınmaz kimliği değişince önceki EİDS sonucu geçersizleşir.
- Taslak değişiklikleri gecikmeli ve yarış güvenli biçimde kaydedilir; hata
  durumunda alt raydan açıkça yeniden denenir; son EİDS sonucu kaydolmadan yayın
  eylemi açılmaz.
- Fotoğraf blob URL’leri yalnız kaldırmada veya tüm workspace kapanırken iptal edilir.
- Hatalı fotoğraf yerinde değiştirilir ve geçersiz medya kapak yapılamaz.

## 8. İçerik kuralları

Başlık en fazla 70 karakter, önerilen karar cümlesi ilk 50 karakterdir. AI metni
hiçbir zaman doğrudan forma yazmaz; “Metni uygula” gerekir. EİDS her zaman demo
olarak etiketlenir ve gerçek kamu bağlantısı izlenimi verilmez. Uzun Türkçe içerik
kartları büyütür; navigasyon etiketleri kontrollü olarak kısalır.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| Sayfa | background/color | `--lg-bg`, `--lg-label` | Tema token’ı |
| Kart | surface/border/radius | `--lg-surface`, `--lg-hairline`, `--lg-radius-card` | Accent `color-mix` |
| Kontrol | height/radius | `--lg-control-lg`, `--lg-radius-chip` | danger/accent |
| CTA | color/radius | `--lg-accent`, `--lg-accent-contrast`, `--lg-radius-capsule` | disabled flat |
| Focus | outline | `--lg-focus-ring-width`, `--lg-focus-ring-offset` | N/A |

Raw px/hex yoktur. İçerik yüzeylerinde backdrop-filter ve gölge kullanılmaz.
Form select’leri flat olduğu için mobilde ilerleme select’i ve açık paneli
dahil cam bütçesi iki yüzeyi aşmaz.

## 10. Storybook kapsamı

- Genel Bakış / Default: var
- Playground / Controls: var
- Variants / Materials: N/A — sayfa ekseni yok
- Sizes: N/A — responsive container ile türetilir
- States: kayıt hatası, AI servis hatası, doğrulanıyor, yetkisiz, servis yok,
  medya kalite durumları ve yayınlandı var
- Uzun içerik: var
- Responsive: mobil story var
- Temalar: Grafit toolbar story var
- Erişilebilirlik: hata odağı/ARIA ve reduced-motion story’leri var

## 11. Test kabul kriterleri

- Tam beş adım ve kilitli gelecek navigasyonu.
- Kategoriye bağlı alanlar ile konum bağımlılıklarının sıfırlanması.
- Fotoğraf ekleme, kapak, sıra, kaldırma ve URL temizliği.
- AI önerisinin açık onaydan önce taslağı değiştirmemesi.
- Taşınmaz numarası ve rol değişiminde doğrulamanın bayat sayılması.
- EİDS verified/unauthorized/unavailable durumları.
- Yayının tüm adımlar ve güncel doğrulama olmadan etkinleşmemesi.
- Typecheck, feature testleri, lint, build ve gerçek rota görsel denetimi.

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

**Do:** doğrulanabilir kopya, açık geri kazanım eylemi, tek ana CTA kullan.

**Don't:** AI’ı otomatik uygulatma, EİDS’yi gerçek bağlantı gibi gösterme, cam
yüzeyleri içerik kartlarında tekrarlama veya alt kontrol rayını başka navigasyonla
örtme.

Bilinen kısıt: adaptörler deterministik demo katmanıdır; gerçek API ve kalıcı dosya
yükleme yoktur. Açık karar: gerçek entegrasyonda taşınmaz numarası sunucuda
maskelenerek saklanacaktır.

Changelog: 2026-07-25 — Beş adımlı enterprise akış, medya stüdyosu, kontrollü AI,
EİDS demo kapısı, otomatik kayıt ve yayın sonrası durum eklendi.

Changelog: 2026-07-30 — Giriş ekranındaki dikey şişkinlik giderildi: `.entry`
sabit `min-height` ve ikiye katlanmış boşluk kaldırıldı; giriş kartlarının
`min-height: 22rem` kuralı ve fazla dolgusu kaldırılarak içerik yüksekliği
belirleyici oldu; ikon rozeti dokunma hedefi token'ından (`--lg-control-xl`)
saf boyut token'ına (`--lg-space-8`) taşındı. "İlan amacı" seçim kartları
(`.segmentChoice`) ortalanmış/tam sütun genişliğindeki hizadan "Yayınlama
yetkisi" kartlarıyla (`.roleChoice`) aynı sola hizalı, içerik genişliğinde
dile taşındı. Etkileşimsiz rozetlerdeki (`.demoTag`, `.requiredNote`,
`.privacyNote`, `.mediaOrder`, `.coverBadge`) dokunma hedefi yüksekliği
(`--lg-control-sm`) kaldırıldı — bunlar `<span>` olup asla dokunma hedefi
değildi.

Changelog: 2026-07-31 — İlerleme şeridindeki iki kalan `--lg-control-*` yanlış
kullanımı giderildi (denetim A5, "adım numarası" ve "adım şeridi 76px"):
`.progressIndex` (`aria-hidden` dekoratif adım numarası `<span>`'i) dokunma
hedefi ölçeğinden (`--lg-control-sm`, 44px) saf boyut token'ına
(`--lg-space-7`, 32px) taşındı; `.progressButton` off-scale birleşik
yüksekliği (`calc(var(--lg-control-xl) + var(--lg-space-5))`, 76px) tek
token'a (`--lg-control-xl`, 56px) indirildi. `.progressButton` gerçek bir
`<button>` olduğu için kontrol yüksekliği token'ı burada doğru kullanım.
