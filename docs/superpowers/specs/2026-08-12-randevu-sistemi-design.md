# Randevu sistemi + ofis kartı yenileme — tasarım

**Tarih:** 2026-08-12 · **Durum:** Onaylandı (kullanıcı, sohbet içi)

## Amaç

Emlak ofisleriyle takvimden tarih seçerek görüşme talep etme ve talep edilen
randevuları takip etme. Mevcut "Görüşme talep et" düğmeleri yalnız metin özeti
üretiyor (`createActionDraft`); tarih/saat seçimi ve takip yok. Ayrıca
`/ofisler` sonuç kartı randevu odaklı sıkılaştırılacak.

Kullanıcının önerdiği shadcn tabanlı `MeetingScheduler` bileşeni **kopyalanmaz**
(Tailwind/date-fns/lucide projede bilinçli olarak yok); onun iki panelli UX'i
Glass design system bileşenleriyle yeniden inşa edilir. Karar: kullanıcı onayı.

## Kararlar

| Karar | Seçim |
|---|---|
| Teknoloji | Glass bileşenleriyle yeniden yapım (shadcn/Tailwind eklenmez) |
| Randevu modeli | Tek gün + saat dilimi (aralık değil) |
| Kapsam | Talep akışı + `/hesabim/randevularim` takibi; ofis paneli sonraki faz |
| Ofis kartı | Randevu odaklı kompakt yenileme; müsaitlik önizlemesi |
| Kalıcılık | Oturum içi (modül düzeyi store) — favorites ile aynı mock deseni |

## 1. Randevu talep akışı

`/ofisler` kartındaki ve AI içgörü panelindeki "Görüşme talep et" bir
**GlassModal** açar (iki panel):

- **Sol:** `GlassDatePicker` (min = bugün, max = +30 gün). Ofisin müsait
  olmadığı günler seçilemez değil; gün seçilince sağda slot listesi boşsa
  "Bu gün dolu, sonraki uygun gün: …" önerisi gösterilir.
- **Sağ:** Seçili günün saat dilimleri `GlassChip` grubu (tekli seçim),
  görüşme türü (`Ofiste` / `Video görüşme` — GlassSegmentedControl), isteğe
  bağlı kısa not (`GlassTextarea`), özet satırı
  ("14 Ağu Per 10:00 · Ofiste · <ofis adı>") ve `Vazgeç` / `Randevu talep et`.
- Gönderimde toast: "Randevu talebiniz iletildi" + Randevularım bağlantısı.
- Modal kapatma/ESC/odak tuzağı GlassModal'dan gelir; yeni a11y işi çıkmaz.

## 2. Veri katmanı — `features/appointments/`

Projenin fixture + adapter desenine birebir uyar; gerçek backend yok.

- `domain/appointment-types.ts` — `Appointment { id, officeId, officeName,
  date (ISO gün), slot ('09:00'…), type: 'office' | 'video', note?, status:
  'pending' | 'confirmed' | 'cancelled', createdAt }` ve
  `AppointmentSlot { time, available }`.
- `data/appointment-adapter.ts` —
  - `officeAvailability(officeId, date): AppointmentSlot[]` — ofis id +
    tarihten **deterministik** üretim (Date.now yok; seed = id + gün).
    Hafta sonu kapalı; günde 6–8 slot, bir kısmı dolu.
  - `availabilityPreview(officeId): string` — kart için "Yarın 3 boş saat ·
    İlk uygun 10:00" tarzı özet.
  - `createAppointment(...)`, `cancelAppointment(id)`,
    `listAppointments()` — modül düzeyi store; bileşenler
    `useSyncExternalStore` ile abone olur (React Query'ye yeni sorgu anahtarı
    açılmaz; store senkron ve oturum ömürlüdür).
  - Mock onay akışı: talep `pending` doğar; `listAppointments` çağrısında
    deterministik kural ile (ör. oluşturmadan sonraki ilk sorguda) bir kısmı
    `confirmed` görünür — takip hissi için.
- Geçmiş ayrımı veriden değil görünümden: `date < bugün` olan kayıtlar
  "Geçmiş" grubunda listelenir (ayrı `past` durumu tutulmaz).

## 3. Randevularım — `/hesabim/randevularim`

- `account-navigation.ts` içine "Randevularım" (Mesajlar'dan sonra).
- `AccountAppointmentsPage`: iki grup — **Yaklaşan** (pending "Onay bekliyor"
  rozeti, confirmed "Onaylandı") ve **Geçmiş**. Satırda ofis adı, tarih/saat,
  tür, durum rozeti; bekleyen/onaylıda `İptal et`. İptal edilen kayıt
  Yaklaşan'dan düşer, Geçmiş grubunda "İptal edildi" rozetiyle kalır.
- Boş durum: `GlassEmptyState` + "Ofisleri keşfet" → `/ofisler`.

## 4. Ofis kartı yenileme (`OfficeResultCard`)

Tek parça kompakt karta iner; `GlassAgencyCard` sarmalayıcısı kalkar,
içerik doğrudan kart yüzeyinde düzenlenir:

1. Üst satır: logo, ad + doğrulama, eşleşme rozeti (%x) — "Neden önerildi?"
   rozete tıklamayla açılır (mevcut `onSelect` korunur).
2. İstatistik satırı: Aktif ilan · Yanıt süresi · Puan (mevcut üç değer).
3. **Müsaitlik satırı (yeni):** `availabilityPreview(officeId)` çıktısı.
4. Aksiyon satırı: birincil **Görüşme talep et** (modalı açar), ikincil
   `Mesaj` ve `Karşılaştır`. Kanıt rozeti meta satırına küçülerek taşınır.

İçgörü panelindeki "Görüşme talep et" de aynı modalı açar. Mevcut
`createActionDraft`'ın `meeting` dalı kalkar; `message`/`offer` aynen kalır.

## 5. Test (TDD)

- `appointment-adapter.test.ts`: deterministik müsaitlik (aynı girdi → aynı
  slotlar; hafta sonu boş), create → listede pending, cancel → cancelled,
  onay kuralı.
- `AccountAppointmentsPage.test.tsx`: gruplama, rozetler, iptal, boş durum.
- Randevu modalı testi: gün seç → slot seç → gönder → adapter çağrısı.
- `OfficeDirectoryView.test.tsx` güncellenir (yeni kart yapısı + modal).

## Kapsam dışı (sonraki faz)

Ofis tarafı randevu yönetim paneli, gerçek bildirim/e-posta, mesaj merkezine
randevu kartı düşürme, yeniden planlama (reschedule).
