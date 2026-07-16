# Eksik Bölümler — Doping, Ödeme, Vitrin ve İlan Detay Eklemeleri

**Tarih:** 2026-07-16
**Durum:** Onaylandı
**Kaynak:** actionplan spec karşılaştırması (`dist-sahibinden` WBS 76, `s-classifieds` WBS 5,
`s-marketplace` WBS 87 `marketplace-listing` yönergesi, `k-surface-consumer` WBS 12.11).

## Amaç

Sahibinden tarzı arsa ilan platformu demosunun (src/pages) actionplan spec'ine göre eksik
kalan bölümlerini tamamlamak. Tümü Storybook story'si olarak eklenir; gerçek backend yok,
tüm akışlar `shared/data.ts` sahte verisiyle görsel demo düzeyindedir.

Yaklaşım kararı: **yeni Glass component üretilmez** — mevcut 47 component ile sayfa içi
kompozisyon yapılır (CLAUDE.md tam component seti zorunluluğu tetiklenmez).

## Kapsam

### 1. İlan detay eklemeleri (`src/pages/ArsaIlanDetay.tsx`)

- **Fiyat geçmişi sekmesi.** Mevcut GlassTabs'a ("Açıklama · İmar ve Tapu · Konum")
  dördüncü sekme: "Fiyat Geçmişi". Veri modeli: `ArsaIlan`'a opsiyonel
  `fiyatGecmisi?: { tarih: string; fiyat: string; degisim?: string }[]` alanı.
  Append-only spec'ine uygun: yalnız kronolojik geçmiş listelenir, düzenleme yoktur.
  Render: `GlassSpecTable` satırları; `degisim` varsa `GlassBadge` (artış `danger`,
  düşüş `success` tonu). Geçmişi olmayan ilanlar için sekmede kısa boş-durum metni.
- **İlanı bildir.** Paylaş butonunun yanına bayrak ikonlu `GlassIconButton`
  (`label="İlanı bildir"`) → `GlassModal`: `GlassRadioGroup` (yanıltıcı bilgi /
  sahte ilan / yanlış kategori / dolandırıcılık şüphesi) + `GlassTextarea` (opsiyonel
  açıklama) + "Gönder" → `GlassToast` onayı. Sikayetlerim sayfasının veri diliyle uyumlu.
- **Görüntülenme sayısı.** `GlassPriceHeader.meta` satırına mevcut `goruntulenme`
  verisinden "1.243 görüntülenme" eklenir.

### 2. Doping adımı (`src/pages/YeniIlanSihirbazi.tsx`)

Adım sayısı ve stepper değişmez (13 adım). Mevcut **Adım 8 "Fiyat" (AdimFiyat)**
genişletilir: fiyat girişinin altına "Öne çıkarma paketleri" bölümü.

- Paketler: **Standart (ücretsiz) · Öne Çıkan · Vitrin** — flat seçilebilir kartlar,
  fiyat etiketli. Erişilebilirlik: her kart, görünür gerçek `<input type="radio">` içeren
  bir `<label>`'dır (tek `fieldset` + `legend`); native focus halkası radio üzerinde görünür.
- Veri: `dopingPaketleri` dizisi `shared/data.ts`'e
  (`{ id, ad, fiyat, aciklama, avantajlar[] }`).
- Adım 12 "Önizleme" seçilen paketi özet satırı olarak gösterir.
- Bu değişiklikle `YardimMerkezi.tsx:52`'deki "güncel fiyat listesini ilan sihirbazının
  fiyat adımında görebilirsiniz" cümlesi kendiliğinden doğrulanır; YardimMerkezi'ne
  dokunulmaz.

### 3. Mağaza/vitrin sayfası (yeni: `src/pages/MagazaVitrin.tsx` + `.stories.tsx`)

KurumsalTanitim'ın vaat ettiği kamuya açık firma vitrini. `PublicShell` içinde:

- Firma başlığı: `GlassAvatar` (logo), firma adı, "Doğrulanmış Kurumsal" rozeti
  (`GlassBadge`), üyelik yılı, "Mesaj Gönder" (`GlassButton`) + telefon göster.
- Kısa "Hakkında" metni (flat kart).
- Özet satırı: ilan sayısı · şehirler.
- Portföy grid'i: `GlassListingCard` listesi.
- Veri: `magaza` nesnesi `shared/data.ts`'e; portföy mevcut `ilanlar`'dan alt küme.

### 4. Ödeme/faturalama (yeni: `src/pages/DopingOdeme.tsx` + `src/pages/Faturalarim.tsx` + stories)

- **DopingOdeme** — sihirbazdan bağımsız checkout demosu. Sol: sipariş özeti (paket,
  ilan başlığı, tutar, KDV, toplam). Sağ: kart formu (`GlassField`/`GlassInput` — kart no,
  son kullanma, CVC, ad soyad) + "Ödemeyi Onayla" → başarı durumu. Başarı ekranında
  "Doping, ödeme onayından sonra aktifleşir" notu (spec'in reserve→charge→boost sırası).
- **Faturalarim** — hesap tarafında fatura listesi: `GlassList` satırları (tarih,
  açıklama, tutar) + "PDF indir" aksiyonu (noop). Veri: `faturalar` dizisi `data.ts`'e.
- `KurumsalTanitim`'daki "fiyatlandırma post-MVP" notu **kurumsal üyelik paketleri**
  kararıdır; doping ödemesi ayrı akış olduğundan o sayfaya dokunulmaz.

## Kapsam dışı

- Moderasyon admin kuyruğu (tüketici demosu değil).
- Yeni Glass component üretimi.
- Gerçek ödeme/backend entegrasyonu; tüm akışlar görsel demo.

## Tasarım sistemi bağları

- Cam yalnız navigasyon/kontrol katmanında; tüm yeni içerik `material="flat"`.
  Sayfa başına ≤ 6 cam yüzey korunur.
- Raw px/hex yasak — yalnız `--lg-*` token'ları (mevcut sayfa desenleriyle aynı).
- Dokunma hedefleri ≥ 44px; focus halkası yalnız `:focus-visible`
  (`k-surface-consumer` PDP kuralları: 320px+ duyarlılık, tap hedefleri).
- Modal: mevcut `GlassModal` sözleşmesi (portal + focus trap + kapanışta tetikleyiciye
  focus dönüşü).

## Doğrulama

- `npm test` (vitest), `npx tsc -b`, `npm run lint` (oxlint) yeşil.
- Storybook'ta görsel kontrol: yeni story'ler (`MagazaVitrin`, `DopingOdeme`,
  `Faturalarim`) ve güncellenen story'ler (`ArsaIlanDetay`, `YeniIlanSihirbazi`)
  Kağıt/Grafit temalarda ve dar (320px) genişlikte gözle doğrulanır.
