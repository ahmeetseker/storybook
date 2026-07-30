# AnaSayfa Hero — Arsam Yerleşimine Geçiş

Tarih: 2026-07-30 · Durum: Onaylandı (içerik: arsa'ya uyarla · arama: yapılandırılmış kart)

## Amaç

`src/pages/AnaSayfa.tsx` hero bölümünü, Arsam projesinin (github.com/aliiball/Arsam)
ana sayfa hero yerleşimine taşımak — ancak liquid-glass-ui componentleriyle ve
ArsaPazar'ın arsa odaklı içeriğiyle. Referans ekran görüntüsündeki yapı:

1. Eyebrow: küçük, harf aralıklı, büyük harf tanıtım satırı
2. Büyük başlık; bir kelime koyu zeminli yuvarlatılmış çip içinde vurgulu
3. Alt başlık paragrafı
4. Arama kartı: segmentli sekmeler + iki açılır liste + belirgin CTA butonu
5. Kart altında istatistik şeridi

## Yaklaşım

Elle kurulmuş hero `<section>` yerine **`GlassHero variant="search"`** kullanılır
(`titleAs="h1"`, `ambient` açık — görseldeki yumuşak zemin ışıması karşılığı).
Slot eşlemesi:

| Görseldeki öğe | Slot | Component / içerik |
|---|---|---|
| "TÜRKİYE'NİN EMLAK REHBERİ" | `eyebrow` | düz span → "TÜRKİYE'NİN ARSA REHBERİ" |
| "Hayal ettiğin **ev** seni bekliyor." | `title` | "Hayal ettiğin **arsa** seni bekliyor." — "arsa" koyu çip (`--lg-label` zemin, `--lg-bg` metin, `--lg-radius-chip`) |
| Alt başlık | `subtitle` | "Türkiye genelinde 50.900+ ilan… Her ilanda, ilan verme yetkisi EİDS ile doğrulanır." |
| Satılık/Kiralık/Yeni Proje | arama kartı 1. satır | `GlassSegmentedControl` — Tümü · Konut İmarlı · Tarla · Turizm · Sanayi |
| Tüm Türkiye · Oda sayısı | arama kartı 2. satır | 2× `GlassSelect` (material="flat", lg) — Konum ("Tüm Türkiye") + m² aralığı |
| İlanları Gör | arama kartı 2. satır | `GlassButton prominent size="lg"` + arama ikonu |
| 36+ ilan · 5 şehir · … | `quickLinks` | ikonlu istatistikler: 50.900+ ilan · 81 il · 4 kategori · EİDS yetki kontrolü |

Arama kartı düz yüzeydir (`--lg-surface` + hairline + `--lg-radius-card`) —
katman modeline uygun: cam yalnız kontrol katmanında, kart zemini flat.

## İçerik kuralları

- EİDS kapsam cümleleri mevcut onaylı biçimlerinden aynen alınır
  ("Her ilanda, ilan verme yetkisi EİDS ile doğrulanır." + kapsam dışı uyarısı).
  `eids-copy.test.ts` yasak kalıplarına yeni metin sokulmaz.
- Kapsam uyarısı istatistik şeridinin altında caption olarak kalır.
- Mevcut AI doğal dil arama alanı hero'dan çıkar (header'daki GlassAiComposer
  bu işlevi taşımaya devam eder).

## Kapsam

Yalnız hero bölümü değişir; "Hızlı kategoriler", "Doğrulanmış ilanlar" ve EİDS
CTA şeridi olduğu gibi kalır. Arsam reposuna dokunulmaz.

## Doğrulama

`npm test` (eids-copy dahil) · `npx tsc -b` · `npm run lint` · AnaSayfa story'si
Storybook'ta görsel kontrol.
