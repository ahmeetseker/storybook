---
name: GlassStarsCard
category: içerik
status: hazır
lastReviewed: 2026-08-09
---

# GlassStarsCard Kuralları

## 1. Amaç

Mürekkep tonlu koyu zeminin tamamını kaplayan, usulca nefes alan yıldız
matrisiyle tek bir özeti "gece göğü" atmosferinde öne çıkaran vitrin kartı.
Kaynağı Aceternity'nin "Glowing Stars Background Card" desenidir; renkler
Kağıt temanın token'larından türetilerek uyarlanmıştır (zemin `--lg-label`,
parıltı `--lg-accent`, metin `--lg-bg`). Bölge dizini kartları gibi veri +
anlatı karışımı içerik `children` olarak serbestçe yerleştirilir ve buzlu
bir okuma paneli içinde yıldızların üstünde durur.

Kullanılmayacağı durumlar ve ilgili component'ler:

- Aydınlık yüzeyli vurgu kartı → `GlassHighlightCard` (tonlu gradyan, rozet).
- İlan kartı → `GlassListingCard`; ofis satırı → `GlassAgencyCard`.
- Cam gereken navigasyon/kontrol katmanı → bu kart cam DEĞİL, içerik
  katmanında koyu düz yüzeydir; sayfa başına cam bütçesini harcamaz.
- Kağıt temada koyu yüzey istisnadır: aynı ekranda az sayıda (vitrin/dizin
  kartı) kullanılır, tüm sayfa zemini asla bu kartla döşenmez.

## 2. Semantik sözleşme

- Kök element default `<div>`; `as` ile `article`/`section` seçilebilir
  (liste öğesi kartlarda `article` önerilir). Accessible name çağıranındır
  (`aria-label`/başlık yapısı).
- Yıldız matrisi tamamen dekoratiftir: `position: absolute` fonda durur,
  `aria-hidden` + `pointer-events: none`; bilgi taşıyan hiçbir içerik
  matrise konmaz.
- İçerik, kartı kenardan kenara kaplayan ŞEFFAF blur panelinde durur:
  zemin boyanmaz, yalnız `backdrop-filter: blur` — parıltılar panelin
  arkasında yumuşak ışık lekeleri olarak görünür, keskin noktalar pusa
  döndüğü için metin her yerde okunur. Kartın kendi padding'i yoktur.
- `GlassStarsCardTitle` `<h3>` çizer; sayfadaki başlık hiyerarşisine uymayan
  yerlerde çağıran kendi başlığını `children` içinde kurar.
- Kart kendisi etkileşimli değildir; tıklama hedefleri (buton/link) içerikte
  durur ve kendi focus halkalarını taşır.

## 3. Eksenler ve durumlar

- Görünüm ekseni yoktur; yıldız fonu her boyutta kartın tamamını doldurur
  (18 sütun × 12 satır = 216 hücre, satırlar `1fr` ile esner).
- hover/focus prop değildir: tutuşma imleç girişinde ve `focus-within`
  eşdeğerinde (içerideki bir aksiyona odaklanınca) kendiliğinden olur;
  ayrılınca söner. Boşta her 3 sn'de 5 rastgele yıldız yavaşça parlar.

## 4. Erişilebilirlik · Motion · Responsive

- Animasyon yalnız transform/opacity oynar; kaynak desendeki
  `background-color` animasyonu bilinçli olarak opaklık rampasına çevrildi.
- Animasyon sakinliği sözleşmedir: genlik küçük (scale ≤ 1.8), süre uzun
  (3 sn), sönük hal görünür kalır (opacity 0.45) — yıldız "yanıp sönmez",
  nefes alır. Sert flaş hissi veren değişiklikler kabul edilmez.
- `prefers-reduced-motion`: kırpışma interval'i hiç kurulmaz, tutuşma
  animasyonsuz (duration 0) uygulanır.
- `prefers-reduced-transparency`: okuma paneli blur yerine düz mürekkep
  zemine düşer; okunurluk aynı kalır.
- Koyu zemin metin renkleri `--lg-bg` (fildişi) ve `color-mix`
  türevleridir; okuma paneli sayesinde kontrast yıldız yoğunluğundan
  bağımsızdır.

## 5. Bilinen borçlar

- Yıldız matrisi 216 `motion.div` üretir; uzun listelerde (>20 kart aynı
  anda) sanallaştırma/`whileInView` ile tutuşmayı erteleme değerlendirilebilir.
- Dokunmatikte hover yoktur; kart yalnız boştaki kırpışmayı gösterir. Bu
  bilinçli bir karardır (tap ile tutuşturmak tıklama hedefleriyle çakışır).
