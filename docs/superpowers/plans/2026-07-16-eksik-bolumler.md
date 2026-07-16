# Eksik Bölümler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sahibinden tarzı arsa platformu demosuna eksik bölümleri eklemek: fiyat geçmişi + ilanı bildir + görüntülenme (ilan detay), doping paketleri (sihirbaz), mağaza vitrini, doping ödeme ve faturalar sayfaları.

**Architecture:** Yeni Glass component üretilmez; her şey mevcut component'ler ve `src/pages/shared/` yardımcılarıyla sayfa içi kompozisyondur. Yeni sayfalar `PublicShell`/`AccountShell` desenini izler, tüm veri `shared/data.ts`'ten gelir. Her sayfa bir Storybook story'sidir.

**Tech Stack:** React 19, CSS inline style + `--lg-*` token'ları, Storybook (`@storybook/react-vite`), vitest (yalnız component testleri — sayfaların test dosyası yoktur, bu konvansiyon korunur).

**Spec:** `docs/superpowers/specs/2026-07-16-eksik-bolumler-design.md`

## Global Constraints

- Cam yalnız navigasyon/kontrol katmanında; tüm yeni içerik `material="flat"` veya düz token zemini. Sayfa başına ≤ 6 cam yüzey.
- Component CSS'inde ve sayfa stillerinde raw hex yasak; yalnız `var(--lg-*)` token'ları (token fallback'i serbest, ör. `var(--lg-radius-media, 14px)`).
- Dokunma hedefleri ≥ 44px; ikon-tek butonlarda `label` zorunlu.
- Dil: UI metinleri Türkçe, kod tanımlayıcıları İngilizce değil — bu projede sayfa kodu Türkçe tanımlayıcı kullanıyor (`ilanlar`, `fiyatGecmisi`); mevcut konvansiyona uy.
- Doğrulama komutları: `npx tsc -b` (typecheck), `npm run lint` (oxlint), `npm test` (vitest). Üçü de her task sonunda yeşil olmalı.
- Sayfaların test dosyası yoktur; task doğrulaması typecheck + lint + Storybook görsel kontroldür. `npm test` yalnız regresyon (component testleri) için koşulur.

---

### Task 1: Paylaşılan veri eklemeleri (`shared/data.ts`)

**Files:**
- Modify: `src/pages/shared/data.ts`

**Interfaces:**
- Consumes: mevcut `ArsaIlan` interface'i ve `ilanlar` dizisi.
- Produces (sonraki task'lar bunlara bağlıdır):
  - `interface FiyatKaydi { tarih: string; fiyat: string; degisim?: string; yon?: 'artis' | 'dusus' }`
  - `ArsaIlan.fiyatGecmisi?: FiyatKaydi[]` (opsiyonel alan)
  - `interface DopingPaketi { id: string; ad: string; fiyat: string; aciklama: string; avantajlar: string[] }` ve `dopingPaketleri: DopingPaketi[]` (3 paket: `standart`, `one-cikan`, `vitrin`)
  - `interface Magaza { ad: string; slogan: string; dogrulanmis: boolean; uyelik: string; telefon: string; sehirler: string[]; hakkinda: string; portfoy: ArsaIlan[] }` ve `magaza: Magaza`
  - `interface Fatura { id: string; tarih: string; aciklama: string; tutar: string }` ve `faturalar: Fatura[]`

- [ ] **Step 1: `FiyatKaydi` interface'ini ve `ArsaIlan.fiyatGecmisi` alanını ekle**

`src/pages/shared/data.ts` içinde `ArsaIlan` interface'inin hemen üstüne:

```ts
/** Append-only fiyat geçmişi kaydı — geçmiş kayıt düzenlenmez/silinmez, yalnız yeni kayıt eklenir. */
export interface FiyatKaydi {
  tarih: string
  fiyat: string
  /** Önceki kayda göre değişim etiketi, ör. "+%12,8" */
  degisim?: string
  yon?: 'artis' | 'dusus'
}
```

`ArsaIlan` interface'ine, `gorsel` alanından sonra:

```ts
  /** Kronolojik fiyat geçmişi (eskiden yeniye). Yoksa sekmede boş-durum metni gösterilir. */
  fiyatGecmisi?: FiyatKaydi[]
```

- [ ] **Step 2: İki ilana fiyat geçmişi verisi ekle**

`ilanlar` dizisinde `id: '1084526631'` (Urla) kaydına, `gorsel` alanından sonra:

```ts
fiyatGecmisi: [
  { tarih: '2 Mayıs 2026', fiyat: '3.900.000 TL' },
  { tarih: '9 Haziran 2026', fiyat: '4.400.000 TL', degisim: '+%12,8', yon: 'artis' },
  { tarih: '12 Temmuz 2026', fiyat: '4.250.000 TL', degisim: '−%3,4', yon: 'dusus' },
],
```

`id: '1084526634'` (Kaş) kaydına, `gorsel` alanından sonra:

```ts
fiyatGecmisi: [{ tarih: '8 Temmuz 2026', fiyat: '6.900.000 TL' }],
```

- [ ] **Step 3: Doping paketlerini ekle**

Dosyanın sonuna (`sihirbazAdimlari`'ndan sonra):

```ts
/** Öne çıkarma (doping) paketleri — sihirbazın Fiyat adımında ve DopingOdeme sayfasında kullanılır. */
export interface DopingPaketi {
  id: string
  ad: string
  fiyat: string
  aciklama: string
  avantajlar: string[]
}

export const dopingPaketleri: DopingPaketi[] = [
  {
    id: 'standart',
    ad: 'Standart',
    fiyat: 'Ücretsiz',
    aciklama: 'İlan, arama sonuçlarında normal sırasında listelenir.',
    avantajlar: ['30 gün yayın süresi', 'Sınırsız mesajlaşma'],
  },
  {
    id: 'one-cikan',
    ad: 'Öne Çıkan',
    fiyat: '349 TL / 2 hafta',
    aciklama: 'Arama sonuçlarında üst sırada, "Öne Çıkan" rozetiyle gösterilir.',
    avantajlar: ['Arama sonuçlarında öncelik', '"Öne Çıkan" rozeti', 'Ortalama 3× daha fazla görüntülenme'],
  },
  {
    id: 'vitrin',
    ad: 'Vitrin',
    fiyat: '749 TL / 2 hafta',
    aciklama: 'Ana sayfa vitrininde ve kategori başında sergilenir.',
    avantajlar: ['Ana sayfa vitrini', 'Kategori başı yerleşim', '"Öne Çıkan" avantajları dahil'],
  },
]
```

- [ ] **Step 4: Mağaza ve fatura verilerini ekle**

Doping paketlerinin altına:

```ts
/** Kamuya açık mağaza vitrini verisi — MagazaVitrin sayfası kullanır. */
export interface Magaza {
  ad: string
  slogan: string
  dogrulanmis: boolean
  uyelik: string
  telefon: string
  sehirler: string[]
  hakkinda: string
  portfoy: ArsaIlan[]
}

export const magaza: Magaza = {
  ad: 'Ege Arsa Ofisi',
  slogan: 'İzmir ve çevresinde imarlı arsa portföyü',
  dogrulanmis: true,
  uyelik: 'Üyelik: Mart 2021',
  telefon: '0 (232) 456 78 90',
  sehirler: ['İzmir', 'Antalya', 'Bursa'],
  hakkinda:
    'Ege Arsa Ofisi, 2021 yılından bu yana İzmir ve çevresinde imarlı arsa alım-satımına aracılık eder. ' +
    'Portföydeki tüm ilanlar EİDS üzerinden tapu kaydıyla doğrulanır; ekspertiz eşliğinde yerinde gösterim yapılır.',
  portfoy: [ilanlar[0], ilanlar[3], ilanlar[2], ilanlar[4]],
}

/** Doping/ek hizmet faturaları — Faturalarim sayfası kullanır. */
export interface Fatura {
  id: string
  tarih: string
  aciklama: string
  tutar: string
}

export const faturalar: Fatura[] = [
  { id: 'F-2026-0412', tarih: '12 Temmuz 2026', aciklama: 'Öne Çıkan dopingi — İzmir Urla parseli (2 hafta)', tutar: '349 TL' },
  { id: 'F-2026-0298', tarih: '8 Haziran 2026', aciklama: 'Vitrin dopingi — Antalya Kaş arsası (2 hafta)', tutar: '749 TL' },
  { id: 'F-2026-0141', tarih: '3 Mayıs 2026', aciklama: 'Ek ilan hakkı (1 ilan)', tutar: '129 TL' },
]
```

- [ ] **Step 5: Doğrula**

Run: `npx tsc -b && npm run lint`
Expected: ikisi de hatasız çıkar.

- [ ] **Step 6: Commit**

```bash
git add src/pages/shared/data.ts
git commit -m "feat: fiyat geçmişi, doping paketi, mağaza ve fatura demo verileri"
```

---

### Task 2: İlan detay eklemeleri (fiyat geçmişi sekmesi, ilanı bildir, görüntülenme)

**Files:**
- Modify: `src/pages/ArsaIlanDetay.tsx`

**Interfaces:**
- Consumes: Task 1'den `ilan.fiyatGecmisi` (`FiyatKaydi[]`); mevcut `GlassModal` (`open`, `onClose`, `title`, `description?`, `footer?`), `GlassRadioGroup` (`options: {value, label, description?}[]`, `value`, `onChange`, `label`), `useGlassToast`/`GlassToastProvider`, `GlassBadge` (`tint`, `material`), `TextArea` (shared/forms).
- Produces: yok (yaprak sayfa).

- [ ] **Step 1: Import'ları ve bildir ikonunu ekle**

`ArsaIlanDetay.tsx` başındaki import bloğuna:

```tsx
import { GlassModal } from '../components/GlassModal'
import { GlassRadioGroup } from '../components/GlassRadioGroup'
import { GlassToastProvider, useGlassToast } from '../components/GlassToast'
import { GlassBadge } from '../components/GlassBadge'
import { GlassButton } from '../components/GlassButton'
import { TextArea } from './shared/forms'
```

`ShareIcon`'un altına bayrak ikonu:

```tsx
const FlagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 21V4a1 1 0 0 1 1-1h11.6a.5.5 0 0 1 .4.8L15 8l3 4.2a.5.5 0 0 1-.4.8H6" />
  </svg>
)
```

- [ ] **Step 2: Bileşeni ToastProvider ile sar**

Mevcut `export function ArsaIlanDetay()` gövdesini `ArsaIlanDetayIcerik` adlı (export edilmeyen) fonksiyona taşı; dışa açılan bileşen sarmalayıcı olsun:

```tsx
export function ArsaIlanDetay() {
  return (
    <GlassToastProvider>
      <ArsaIlanDetayIcerik />
    </GlassToastProvider>
  )
}

function ArsaIlanDetayIcerik() {
  // ... mevcut gövde buraya ...
}
```

- [ ] **Step 3: Görüntülenme sayısını meta satırına ekle**

`GlassPriceHeader`'ın `meta` prop'unu güncelle:

```tsx
meta={`${ilan.konum} · ${ilan.m2} · ${ilan.m2Fiyat} · ${ilan.tarih} · İlan No: ${ilan.id} · ${ilan.goruntulenme.toLocaleString('tr-TR')} görüntülenme`}
```

- [ ] **Step 4: Fiyat Geçmişi sekmesini ekle**

`GlassTabs`'ın `tabs` dizisine, `konum` sekmesinden sonra dördüncü öğe:

```tsx
{
  id: 'fiyat-gecmisi',
  label: 'Fiyat Geçmişi',
  content: ilan.fiyatGecmisi?.length ? (
    <GlassSpecTable
      material="flat"
      items={ilan.fiyatGecmisi.map((k) => ({
        label: k.tarih,
        value: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {k.fiyat}
            {k.degisim ? (
              <GlassBadge material="flat" tint={k.yon === 'artis' ? 'var(--lg-danger)' : 'var(--lg-success)'}>
                {k.degisim}
              </GlassBadge>
            ) : null}
          </span>
        ),
      }))}
    />
  ) : (
    <p style={{ margin: 0, color: 'var(--lg-label-secondary)' }}>
      Bu ilanda henüz fiyat değişikliği kaydı yok.
    </p>
  ),
},
```

- [ ] **Step 5: "İlanı bildir" aksiyonu ve modalı ekle**

`ArsaIlanDetayIcerik` içine state ve toast:

```tsx
const toast = useGlassToast()
const [bildirAcik, setBildirAcik] = useState(false)
const [bildirNeden, setBildirNeden] = useState<string | undefined>(undefined)
const [bildirAciklama, setBildirAciklama] = useState('')

const bildirGonder = () => {
  setBildirAcik(false)
  setBildirNeden(undefined)
  setBildirAciklama('')
  toast({
    title: 'Şikâyetin alındı',
    description: 'Moderasyon ekibi ilanı 24 saat içinde inceleyecek. Sonucu Şikâyetlerim sayfasından izleyebilirsin.',
    severity: 'success',
  })
}
```

Breadcrumb satırındaki paylaş butonunun yanına (aynı flex kapsayıcıda, `GlassIconButton`'ları bir `<span style={{ display: 'flex', gap: 8 }}>` içine al):

```tsx
<span style={{ display: 'flex', gap: 8 }}>
  <GlassIconButton label="İlanı paylaş" onClick={noop}>
    <ShareIcon />
  </GlassIconButton>
  <GlassIconButton label="İlanı bildir" onClick={() => setBildirAcik(true)}>
    <FlagIcon />
  </GlassIconButton>
</span>
```

Sayfanın kök `<div>`'inin sonuna (Benzer İlanlar section'ından sonra) modal:

```tsx
<GlassModal
  open={bildirAcik}
  onClose={() => setBildirAcik(false)}
  title="İlanı bildir"
  description="Bildirimin moderasyon ekibine iletilir; ilan sahibi kimliğini göremez."
  size="sm"
  footer={
    <>
      <GlassButton onClick={() => setBildirAcik(false)}>Vazgeç</GlassButton>
      <GlassButton prominent disabled={!bildirNeden} onClick={bildirGonder}>
        Gönder
      </GlassButton>
    </>
  }
>
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <GlassRadioGroup
      label="Bildirim nedeni"
      options={[
        { value: 'yaniltici', label: 'Yanıltıcı bilgi', description: 'Fiyat, konum veya özellikler gerçeği yansıtmıyor' },
        { value: 'sahte', label: 'Sahte ilan', description: 'İlan gerçek bir taşınmaza ait değil' },
        { value: 'kategori', label: 'Yanlış kategori', description: 'İlan arsa kategorisine ait değil' },
        { value: 'dolandiricilik', label: 'Dolandırıcılık şüphesi', description: 'Kapora talebi, harici ödeme yönlendirmesi vb.' },
      ]}
      value={bildirNeden}
      onChange={setBildirNeden}
    />
    <TextArea
      aria-label="Ek açıklama (isteğe bağlı)"
      placeholder="Ek açıklama (isteğe bağlı)"
      value={bildirAciklama}
      onChange={(e) => setBildirAciklama(e.target.value)}
      rows={3}
    />
  </div>
</GlassModal>
```

- [ ] **Step 6: Doğrula**

Run: `npx tsc -b && npm run lint && npm test`
Expected: üçü de yeşil.

Run: `npm run dev` → Storybook'ta `Sayfalar/Public/İlan Detay (Arsa)`:
- Meta satırında "1.243 görüntülenme" görünür.
- "Fiyat Geçmişi" sekmesi 3 kayıt gösterir; +%12,8 danger, −%3,4 success rozetli.
- Bayrak butonu modalı açar; neden seçilmeden "Gönder" disabled; gönderince toast çıkar; kapanışta focus bayrak butonuna döner.

- [ ] **Step 7: Commit**

```bash
git add src/pages/ArsaIlanDetay.tsx
git commit -m "feat: ilan detayına fiyat geçmişi sekmesi, ilanı bildir akışı ve görüntülenme sayısı"
```

---

### Task 3: Sihirbaza doping paketleri bölümü + önizleme özeti

**Files:**
- Modify: `src/pages/YeniIlanSihirbazi.tsx`
- Modify: `docs/superpowers/specs/2026-07-16-eksik-bolumler-design.md` (radio görünürlüğü notu)

**Interfaces:**
- Consumes: Task 1'den `dopingPaketleri: DopingPaketi[]`.
- Produces: `AdimFiyat({ doping, onDopingChange }: { doping: string; onDopingChange: (id: string) => void })`, `AdimOnizleme({ doping }: { doping: string })` — yalnız bu dosya içinde kullanılır.

- [ ] **Step 1: Import ve state**

`shared/data` import'una `dopingPaketleri`'ni ekle:

```tsx
import { dopingPaketleri, sihirbazAdimlari } from './shared/data'
```

`YeniIlanSihirbazi` gövdesine (`gonderildi` state'inin altına):

```tsx
const [doping, setDoping] = useState('standart')
```

`useMemo` switch'ini güncelle:

```tsx
case 8:
  return <AdimFiyat doping={doping} onDopingChange={setDoping} />
case 12:
  return <AdimOnizleme doping={doping} />
```

ve `useMemo` bağımlılık dizisine `doping`'i ekle: `[adim, eidsSonucu, doping]`.

- [ ] **Step 2: `AdimFiyat`'a doping bölümünü ekle**

İmzayı değiştir:

```tsx
function AdimFiyat({ doping, onDopingChange }: { doping: string; onDopingChange: (id: string) => void }) {
```

Mevcut kapanış `</div>`'inden önce (bölge ortalaması notundan sonra) doping bölümü:

```tsx
<fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
  <legend style={{ padding: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 700 }}>
    Öne çıkarma paketleri
  </legend>
  <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
    Doping yalnız sıralama önceliği verir; ilanın hangi aramalarda listeleneceğini değiştirmez.
    Ücretli paketler ödeme onayından sonra aktifleşir.
  </span>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
    {dopingPaketleri.map((paket) => {
      const secili = doping === paket.id
      return (
        <label
          key={paket.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '14px 16px',
            borderRadius: 'var(--lg-radius-media, 14px)',
            border: secili ? '2px solid var(--lg-accent)' : '1px solid var(--lg-hairline)',
            background: 'var(--lg-surface)',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="radio"
              name="doping-paketi"
              value={paket.id}
              checked={secili}
              onChange={() => onDopingChange(paket.id)}
              style={{ accentColor: 'var(--lg-accent)' }}
            />
            <strong style={{ fontSize: 15 }}>{paket.ad}</strong>
            <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: 'var(--lg-accent)' }}>
              {paket.fiyat}
            </span>
          </span>
          <span style={{ fontSize: 13, color: 'var(--lg-label-secondary)', lineHeight: 1.45 }}>{paket.aciklama}</span>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--lg-label-secondary)', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {paket.avantajlar.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </label>
      )
    })}
  </div>
</fieldset>
```

- [ ] **Step 3: `AdimOnizleme` bileşenini ekle**

`AdimPlaceholder`'ın üstüne:

```tsx
function AdimOnizleme({ doping }: { doping: string }) {
  const paket = dopingPaketleri.find((p) => p.id === doping) ?? dopingPaketleri[0]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <GlassSpecTable
        material="flat"
        title="İlan Önizlemesi"
        items={[
          { label: 'Başlık', value: 'İzmir Urla Denize 900 m — İmarlı Köşe Parsel' },
          { label: 'Fiyat', value: '4.250.000 TL' },
          { label: 'Konum', value: 'İzmir, Urla — İskele Mah.' },
          { label: 'Öne çıkarma', value: `${paket.ad} — ${paket.fiyat}` },
        ]}
      />
      <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
        Yayına alınmadan önce ilan moderasyon ekibince incelenir. Ücretli paket seçtiysen ödeme,
        gönderimden sonraki adımda alınır.
      </span>
    </div>
  )
}
```

Dosya başına import ekle:

```tsx
import { GlassSpecTable } from '../components/GlassSpecTable'
```

- [ ] **Step 4: Spec'i görünür radio kararıyla güncelle**

`docs/superpowers/specs/2026-07-16-eksik-bolumler-design.md` içindeki
"Erişilebilirlik: her kart görsel olarak gizlenmiş gerçek `<input type=\"radio\">` içerir"
cümlesini şununla değiştir (inline-style sayfalarında `:focus-visible` kart stili verilemediği için
radio görünür bırakılır — daha basit ve eşit derecede erişilebilir):

```
  fiyat etiketli. Erişilebilirlik: her kart, görünür gerçek `<input type="radio">` içeren
  bir `<label>`'dır (tek `fieldset` + `legend`); native focus halkası radio üzerinde görünür.
```

- [ ] **Step 5: Doğrula**

Run: `npx tsc -b && npm run lint && npm test`
Expected: üçü de yeşil.

Storybook `Sayfalar/Hesabım/Yeni İlan Sihirbazı`: Adım 8'de üç paket kartı görünür, seçim
klavye ok tuşlarıyla değişir (native radio grubu), seçili kart accent çerçeveli. Adım 12
önizlemede seçilen paket adı görünür.

- [ ] **Step 6: Commit**

```bash
git add src/pages/YeniIlanSihirbazi.tsx docs/superpowers/specs/2026-07-16-eksik-bolumler-design.md
git commit -m "feat: sihirbazın fiyat adımına doping paketleri, önizlemeye paket özeti"
```

---

### Task 4: Mağaza vitrini sayfası

**Files:**
- Create: `src/pages/MagazaVitrin.tsx`
- Create: `src/pages/MagazaVitrin.stories.tsx`

**Interfaces:**
- Consumes: Task 1'den `magaza: Magaza`; mevcut `PublicShell`, `GlassAvatar` (`name`, `size`, `shape`), `GlassBadge`, `GlassButton`, `GlassListingCard` (`image`, `title`, `price`, `location`, `badge?`, `onClick`, `material`), `EidsBadge`.
- Produces: `export function MagazaVitrin()`.

- [ ] **Step 1: Sayfayı yaz**

`src/pages/MagazaVitrin.tsx`:

```tsx
// Mağaza vitrini (/magaza/{slug}) — kurumsal hesabın kamuya açık portföy sayfası.
// KurumsalTanitim'ın vaat ettiği vitrin: firma başlığı + hakkında + portföy grid'i.
// Cam yalnız kabuk ve butonlarda; içerik düz token zemini.
import type { CSSProperties } from 'react'
import { GlassAvatar } from '../components/GlassAvatar'
import { GlassBadge } from '../components/GlassBadge'
import { GlassButton } from '../components/GlassButton'
import { GlassListingCard } from '../components/GlassListingCard'
import { PublicShell } from './shared/shells'
import { EidsBadge } from './shared/forms'
import { magaza } from './shared/data'

const noop = () => {}

const flatCard: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: '20px 24px',
  boxSizing: 'border-box',
}

export function MagazaVitrin() {
  return (
    <PublicShell title="Mağaza" onBack={noop}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <header style={{ ...flatCard, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <GlassAvatar name={magaza.ad} size="xl" shape="rounded" />
          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 'var(--lg-text-display, 28px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
                {magaza.ad}
              </h1>
              {magaza.dogrulanmis ? (
                <GlassBadge material="flat" tint="var(--lg-success)">Doğrulanmış Kurumsal</GlassBadge>
              ) : null}
            </span>
            <span style={{ color: 'var(--lg-label-secondary)', fontSize: 15 }}>{magaza.slogan}</span>
            <span style={{ color: 'var(--lg-label-secondary)', fontSize: 13 }}>
              {magaza.uyelik} · {magaza.portfoy.length} ilan · {magaza.sehirler.join(' · ')}
            </span>
          </div>
          <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <GlassButton prominent onClick={noop}>Mesaj Gönder</GlassButton>
            <GlassButton onClick={noop}>{magaza.telefon}</GlassButton>
          </span>
        </header>

        <section style={{ ...flatCard, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>Hakkında</h2>
          <p style={{ margin: 0, lineHeight: 1.55, color: 'var(--lg-label-secondary)' }}>{magaza.hakkinda}</p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>
            Portföy ({magaza.portfoy.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {magaza.portfoy.map((ilan) => (
              <GlassListingCard
                key={ilan.id}
                image={ilan.gorsel}
                title={ilan.baslik}
                price={ilan.fiyat}
                location={`${ilan.konum} · ${ilan.m2}`}
                badge={ilan.eidsDogrulandi ? <EidsBadge dogrulandi /> : undefined}
                onClick={noop}
                material="flat"
              />
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
```

- [ ] **Step 2: Story'yi yaz**

`src/pages/MagazaVitrin.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MagazaVitrin } from './MagazaVitrin'

const meta = {
  title: 'Sayfalar/Public/Mağaza Vitrini',
  component: MagazaVitrin,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MagazaVitrin>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
```

- [ ] **Step 3: Doğrula**

Run: `npx tsc -b && npm run lint && npm test`
Expected: üçü de yeşil.

Storybook `Sayfalar/Public/Mağaza Vitrini`: başlık kartı (avatar + rozet + iki buton),
hakkında ve 4 kartlık portföy grid'i; 320px genişlikte grid tek sütuna düşer, yatay taşma yok.

- [ ] **Step 4: Commit**

```bash
git add src/pages/MagazaVitrin.tsx src/pages/MagazaVitrin.stories.tsx
git commit -m "feat: mağaza vitrini sayfası — firma başlığı, hakkında, portföy grid'i"
```

---

### Task 5: Doping ödeme sayfası

**Files:**
- Create: `src/pages/DopingOdeme.tsx`
- Create: `src/pages/DopingOdeme.stories.tsx`

**Interfaces:**
- Consumes: Task 1'den `dopingPaketleri` (`one-cikan` paketi), `ilanlar[0]`; `PublicShell`, `GlassButton`, `GlassSpecTable`, `Field`/`TextInput` (shared/forms).
- Produces: `export function DopingOdeme()`.

- [ ] **Step 1: Sayfayı yaz**

`src/pages/DopingOdeme.tsx`:

```tsx
// Doping ödeme (/hesabim/doping-odeme) — reserve→charge→boost akışının charge adımı demosu.
// Doping ödeme onayından sonra aktifleşir; süre bitince etkisi otomatik düşer.
// Cam yalnız kabuk ve butonlarda; form ve özet düz token zemini.
import { useState, type CSSProperties } from 'react'
import { GlassButton } from '../components/GlassButton'
import { GlassSpecTable } from '../components/GlassSpecTable'
import { PublicShell } from './shared/shells'
import { Field, TextInput } from './shared/forms'
import { dopingPaketleri, ilanlar } from './shared/data'

const noop = () => {}

const flatCard: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: '20px 24px',
  boxSizing: 'border-box',
}

const paket = dopingPaketleri.find((p) => p.id === 'one-cikan') ?? dopingPaketleri[0]
const ilan = ilanlar[0]

export function DopingOdeme() {
  const [odendi, setOdendi] = useState(false)

  return (
    <PublicShell title="Doping Satın Al" onBack={noop} cta={null}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
          alignItems: 'start',
          maxWidth: 880,
          margin: '0 auto',
        }}
      >
        <GlassSpecTable
          material="flat"
          title="Sipariş Özeti"
          items={[
            { label: 'İlan', value: ilan.baslik },
            { label: 'Paket', value: `${paket.ad} (2 hafta)` },
            { label: 'Tutar', value: '290,83 TL' },
            { label: 'KDV (%20)', value: '58,17 TL' },
            { label: 'Toplam', value: <strong>349,00 TL</strong> },
          ]}
        />

        {odendi ? (
          <div style={{ ...flatCard, display: 'flex', flexDirection: 'column', gap: 10 }} role="status">
            <strong style={{ fontSize: 19, color: 'var(--lg-success)' }}>✓ Ödeme alındı</strong>
            <p style={{ margin: 0, lineHeight: 1.55, color: 'var(--lg-label-secondary)' }}>
              Doping, ödeme onayından sonra aktifleşir; "{ilan.baslik}" ilanı 2 hafta boyunca
              arama sonuçlarında öncelikli gösterilir. Süre bitiminde etkisi otomatik düşer.
              Faturanı Faturalarım sayfasından indirebilirsin.
            </p>
            <div>
              <GlassButton onClick={noop}>Faturalarım'a git</GlassButton>
            </div>
          </div>
        ) : (
          <form
            style={{ ...flatCard, display: 'flex', flexDirection: 'column', gap: 14 }}
            onSubmit={(e) => {
              e.preventDefault()
              setOdendi(true)
            }}
          >
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>Kart Bilgileri</h2>
            <Field label="Kart üzerindeki ad">
              {(id) => <TextInput id={id} autoComplete="cc-name" placeholder="Mehmet Yılmaz" required />}
            </Field>
            <Field label="Kart numarası">
              {(id) => (
                <TextInput id={id} inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" maxLength={19} required />
              )}
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Son kullanma">
                {(id) => <TextInput id={id} inputMode="numeric" autoComplete="cc-exp" placeholder="AA/YY" maxLength={5} required />}
              </Field>
              <Field label="CVC">
                {(id) => <TextInput id={id} inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} required />}
              </Field>
            </div>
            <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
              Ödeme 3D Secure ile doğrulanır. Doping ücreti iade edilmez; ödeme reddedilirse
              boost uygulanmaz ve ilan mevcut haliyle yayında kalır.
            </span>
            <div>
              <GlassButton prominent size="lg" type="submit">
                Ödemeyi Onayla — 349,00 TL
              </GlassButton>
            </div>
          </form>
        )}
      </div>
    </PublicShell>
  )
}
```

- [ ] **Step 2: Story'yi yaz**

`src/pages/DopingOdeme.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DopingOdeme } from './DopingOdeme'

const meta = {
  title: 'Sayfalar/Hesabım/Doping Ödeme',
  component: DopingOdeme,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DopingOdeme>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
```

- [ ] **Step 3: Doğrula**

Run: `npx tsc -b && npm run lint && npm test`
Expected: üçü de yeşil.

Storybook `Sayfalar/Hesabım/Doping Ödeme`: özet + kart formu yan yana (dar ekranda alt alta);
zorunlu alanlar boşken tarayıcı doğrulaması engeller; onayla → başarı kartı görünür.

- [ ] **Step 4: Commit**

```bash
git add src/pages/DopingOdeme.tsx src/pages/DopingOdeme.stories.tsx
git commit -m "feat: doping ödeme sayfası — sipariş özeti, kart formu, başarı durumu"
```

---

### Task 6: Faturalarım sayfası

**Files:**
- Create: `src/pages/Faturalarim.tsx`
- Create: `src/pages/Faturalarim.stories.tsx`
- Modify: `src/pages/shared/shells.tsx` (accountNav'a "Faturalarım" öğesi)

**Interfaces:**
- Consumes: Task 1'den `faturalar: Fatura[]`; `AccountShell` (`selected`, `title`), `GlassList`/`GlassListItem` (`title`, `subtitle`, `detail`), `GlassButton`.
- Produces: `export function Faturalarim()`.

- [ ] **Step 1: accountNav'a öğe ekle**

`src/pages/shared/shells.tsx` içindeki `accountNav` dizisinde `{ id: 'ilanlar', ... }` satırından sonra:

```ts
  { id: 'faturalar', label: 'Faturalarım' },
```

- [ ] **Step 2: Sayfayı yaz**

`src/pages/Faturalarim.tsx`:

```tsx
// /hesabim/faturalarim — doping ve ek hizmet faturaları listesi.
// Cam yalnız sidebar'da; liste düz token zemini.
import { GlassList, GlassListItem } from '../components/GlassList'
import { GlassButton } from '../components/GlassButton'
import { AccountShell } from './shared/shells'
import { faturalar } from './shared/data'

const noop = () => {}

export function Faturalarim() {
  return (
    <AccountShell selected="faturalar" title="Faturalarım">
      <p style={{ margin: 0, color: 'var(--lg-label-secondary)', fontSize: 14 }}>
        Doping ve ek hizmet ödemelerinin faturaları burada listelenir. Fatura, ödeme onayından
        sonraki 24 saat içinde e-posta adresine de gönderilir.
      </p>
      <GlassList>
        {faturalar.map((f) => (
          <GlassListItem
            key={f.id}
            title={f.aciklama}
            subtitle={`${f.tarih} · ${f.id}`}
            detail={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                <strong>{f.tutar}</strong>
                <GlassButton size="sm" onClick={noop}>PDF indir</GlassButton>
              </span>
            }
          />
        ))}
      </GlassList>
    </AccountShell>
  )
}
```

- [ ] **Step 3: Story'yi yaz**

`src/pages/Faturalarim.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Faturalarim } from './Faturalarim'

const meta = {
  title: 'Sayfalar/Hesabım/Faturalarım',
  component: Faturalarim,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Faturalarim>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
```

- [ ] **Step 4: Doğrula**

Run: `npx tsc -b && npm run lint && npm test`
Expected: üçü de yeşil.

Storybook `Sayfalar/Hesabım/Faturalarım`: sidebar'da "Faturalarım" seçili, 3 fatura satırı,
her satırda tutar + "PDF indir". Diğer hesap sayfalarının sidebar'ında da "Faturalarım"
öğesi görünür (accountNav paylaşımlı — beklenen etki).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Faturalarim.tsx src/pages/Faturalarim.stories.tsx src/pages/shared/shells.tsx
git commit -m "feat: faturalarım sayfası + hesap navigasyonuna Faturalarım öğesi"
```

---

### Task 7: Son doğrulama

**Files:** yok (yalnız komutlar).

- [ ] **Step 1: Tam doğrulama**

Run: `npm test && npx tsc -b && npm run lint && npm run build`
Expected: dördü de yeşil; `npm run build` Storybook build'ini hatasız tamamlar.

- [ ] **Step 2: Görsel tur**

`npm run dev` → beş story'yi Kağıt ve Grafit temada gez:
İlan Detay (sekme + modal + toast), Yeni İlan Sihirbazı (Adım 8 ve 12), Mağaza Vitrini,
Doping Ödeme (form + başarı), Faturalarım. 320px genişlikte yatay taşma olmamalı.

- [ ] **Step 3: Commit (gerekirse)**

Görsel turda düzeltme çıktıysa ilgili dosyayla birlikte commit'le; çıkmadıysa bu task commit üretmez.
