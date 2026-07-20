import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexBadge, CodexButton } from '../controls'
import {
  CodexDatePicker,
  CodexFileUpload,
  CodexProgress,
  CodexRadioGroup,
  CodexSearchField,
  CodexSegmentedControl,
  CodexSlider,
  CodexStepper,
  CodexTextarea,
} from './index'
import styles from './CodexForms.module.css'

const meta = {
  title: 'Codex Enterprise/02 Aksiyon ve Formlar/02 Gelişmiş Formlar',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { defaultTheme: 'paper' },
    docs: {
      description: {
        component:
          'Türkçe ilan ve pazar yeri akışları için native semantiği koruyan; kontrollü/kontrolsüz API, eksiksiz durumlar, klavye kullanımı ve dar ekran davranışı sunan gelişmiş form ailesi.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function StoryPage({ children }: { children: ReactNode }) {
  return <main className={styles.storyPage}>{children}</main>
}

function StoryHero({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header className={styles.storyHero}>
      <h1 className={styles.storyTitle}>{title}</h1>
      <p className={styles.storyIntro}>{children}</p>
    </header>
  )
}

function Section({ title, copy, children }: { title: string; copy: string; children: ReactNode }) {
  return (
    <section className={styles.storySection}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionCopy}>{copy}</p>
      </header>
      {children}
    </section>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className={styles.storyPanel}>
      <h3 className={styles.storyPanelTitle}>{title}</h3>
      {children}
    </article>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="2" y="2" width="4.5" height="4.5" rx=".7" />
      <rect x="9.5" y="2" width="4.5" height="4.5" rx=".7" />
      <rect x="2" y="9.5" width="4.5" height="4.5" rx=".7" />
      <rect x="9.5" y="9.5" width="4.5" height="4.5" rx=".7" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <path d="M5 3h9M5 8h9M5 13h9" />
      <circle cx="2" cy="3" r=".6" fill="currentColor" stroke="none" />
      <circle cx="2" cy="8" r=".6" fill="currentColor" stroke="none" />
      <circle cx="2" cy="13" r=".6" fill="currentColor" stroke="none" />
    </svg>
  )
}

const propertyOptions = [
  { value: 'daire', label: 'Daire', description: 'Apartman veya rezidans bağımsız bölümü' },
  { value: 'villa', label: 'Villa', description: 'Müstakil, ikiz veya sıra ev' },
  { value: 'arsa', label: 'Arsa', description: 'İmarlı veya tarla niteliğinde parsel' },
]

const listingTypeOptions = [
  { value: 'satilik', label: 'Satılık' },
  { value: 'kiralik', label: 'Kiralık' },
  { value: 'devren', label: 'Devren' },
]

function ListingFormDemo() {
  const [query, setQuery] = useState('Urla İskele')
  const [listingType, setListingType] = useState('satilik')
  const [propertyType, setPropertyType] = useState('villa')
  const [area, setArea] = useState(180)
  const [rooms, setRooms] = useState(4)
  const [description, setDescription] = useState(
    'Denize yürüme mesafesinde, müstakil bahçeli ve gün boyu ışık alan yenilenmiş villa.',
  )
  const [date, setDate] = useState('2026-07-24')
  const [progress, setProgress] = useState(72)

  return (
    <StoryPage>
      <StoryHero title="İlan oluşturma araçları">
        Dokuz bileşen aynı etiket, açıklama, hata ve focus sözlüğünü paylaşır. Örnek; emlak profesyonelinin arama bağlamından ilan yayınına ilerlediği gerçek bir akışı gösterir.
      </StoryHero>
      <Section title="Konum ve ilan türü" copy="Önce arama bağlamı, ardından tek seçimli ilan türü ve taşınmaz sınıfı belirlenir.">
        <div className={styles.storyStack}>
          <CodexSearchField
            label="İlan konumu"
            description="Mahalle, sokak veya ilan numarasıyla arayın."
            value={query}
            onValueChange={setQuery}
            onSearch={() => setProgress(78)}
          />
          <CodexSegmentedControl
            label="İlan türü"
            options={listingTypeOptions}
            value={listingType}
            onValueChange={setListingType}
            fullWidth
          />
          <CodexRadioGroup
            label="Taşınmaz tipi"
            description="Doğru kategori, ilgili özellik alanlarını otomatik açar."
            options={propertyOptions}
            value={propertyType}
            onValueChange={setPropertyType}
            orientation="horizontal"
            required
          />
        </div>
      </Section>
      <Section title="Temel nitelikler" copy="Doğrudan manipülasyon kontrolleri anlık değeri metin olarak da iletir; anlam yalnız renge bırakılmaz.">
        <div className={styles.storyGrid}>
          <Panel title="Brüt alan">
            <CodexSlider
              label="Metrekare"
              description="Tapudaki brüt alanı girin."
              min={40}
              max={500}
              step={5}
              value={area}
              onValueChange={setArea}
              formatValue={(value) => `${value} m²`}
            />
          </Panel>
          <Panel title="Oda sayısı">
            <CodexStepper
              label="Toplam oda"
              description="Salon dahil, mutfak hariç."
              min={1}
              max={12}
              value={rooms}
              onValueChange={setRooms}
              formatValue={(value) => `${value} oda`}
            />
          </Panel>
          <Panel title="Yayın tarihi">
            <CodexDatePicker
              label="Yayına alınacağı gün"
              description="Tarih daha sonra değiştirilebilir."
              min="2026-07-18"
              value={date}
              onValueChange={setDate}
              required
            />
          </Panel>
        </div>
      </Section>
      <Section title="Açıklama ve medya" copy="Uzun metin ve dosya yükleme alanları sınır, kabul edilen tür ve seçilen dosyaları görünür tutar.">
        <div className={styles.storyGrid}>
          <Panel title="İlan açıklaması">
            <CodexTextarea
              label="Öne çıkan özellikler"
              description="Konum, yapı durumu ve yaşam avantajlarını somut cümlelerle anlatın."
              value={description}
              onValueChange={setDescription}
              maxLength={500}
              showCount
              rows={6}
            />
          </Panel>
          <Panel title="Fotoğraflar">
            <CodexFileUpload
              label="İlan fotoğrafları"
              description="İlk görsel kapak fotoğrafı olarak kullanılır."
              accept="image/jpeg,image/png,image/webp"
              maxSize={8 * 1024 * 1024}
              maxFiles={12}
              multiple
            />
          </Panel>
        </div>
      </Section>
      <Section title="Yayın hazırlığı" copy="Determinate ilerleme değeri, durum değiştiğinde yardımcı teknolojiye de aynı anlamla ulaşır.">
        <div className={styles.storyStack}>
          <CodexProgress
            label="İlan kalitesi"
            description="Fotoğraf, konum ve açıklama tamamlandığında görünürlük puanı yükselir."
            value={progress}
            tone={progress >= 90 ? 'success' : 'accent'}
          />
          <div className={styles.storyActions}>
            <CodexButton variant="secondary" onClick={() => setProgress(84)}>Taslak kaydet</CodexButton>
            <CodexButton onClick={() => setProgress(100)}>Kontrole gönder</CodexButton>
          </div>
        </div>
      </Section>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <ListingFormDemo /> }

export const TextAndSearchStates: Story = {
  render: () => (
    <StoryPage>
      <StoryHero title="Metin ve arama durumları">
        Default, sınırlandırılmış, invalid, disabled ve loading durumları gerçek Türkçe içerikle yan yana karşılaştırılır.
      </StoryHero>
      <Section title="Textarea" copy="Sayaç yalnız görsel bir rozet değildir; karakter değerini canlı ve metinsel olarak da sunar.">
        <div className={styles.storyGrid}>
          <Panel title="Default + sayaç">
            <CodexTextarea label="Site olanakları" defaultValue="Açık havuz, kapalı otopark ve 7/24 güvenlik." maxLength={240} showCount />
          </Panel>
          <Panel title="Invalid">
            <CodexTextarea label="İlan açıklaması" defaultValue="Güzel ev" error="En az 20 karakterle daha açıklayıcı bilgi verin." aria-invalid />
          </Panel>
          <Panel title="Disabled">
            <CodexTextarea label="Ekspertiz notu" defaultValue="Rapor tamamlandıktan sonra düzenlenemez." disabled />
          </Panel>
          <Panel title="Loading">
            <CodexTextarea label="AI açıklama önerisi" defaultValue="Konum verileri inceleniyor…" loading />
          </Panel>
        </div>
      </Section>
      <Section title="Search field" copy="Arama; clear, submit ve loading işlemlerinde tek erişilebilir adını korur.">
        <div className={styles.storyGrid}>
          <Panel title="Default">
            <CodexSearchField label="Bölge ara" defaultValue="Kadıköy, İstanbul" />
          </Panel>
          <Panel title="Invalid">
            <CodexSearchField label="İlan numarası" defaultValue="12" error="İlan numarası en az 8 haneli olmalıdır." />
          </Panel>
          <Panel title="Disabled">
            <CodexSearchField label="Portföyde ara" defaultValue="Yetki bekleniyor" disabled />
          </Panel>
          <Panel title="Loading">
            <CodexSearchField label="Benzer ilan ara" defaultValue="3+1 deniz manzaralı" loading />
          </Panel>
        </div>
      </Section>
    </StoryPage>
  ),
}

export const ChoiceStates: Story = {
  render: () => (
    <StoryPage>
      <StoryHero title="Tek seçim ve segmentler">
        Native radio temeli sayesinde seçili, disabled ve required sözleşmeleri klavye ve form gönderimiyle uyumlu kalır.
      </StoryHero>
      <Section title="Radio group" copy="Uzun açıklamalar yatay düzende alan bulur, dar ekranda tek sütuna döner.">
        <div className={styles.storyGrid}>
          <Panel title="Selected">
            <CodexRadioGroup label="Isıtma tipi" options={[
              { value: 'kombi', label: 'Kombi', description: 'Doğalgazlı bağımsız sistem' },
              { value: 'merkezi', label: 'Merkezi', description: 'Pay ölçerli ortak sistem' },
            ]} defaultValue="kombi" />
          </Panel>
          <Panel title="Option disabled">
            <CodexRadioGroup label="Tapu durumu" options={[
              { value: 'kat', label: 'Kat mülkiyeti' },
              { value: 'hisseli', label: 'Hisseli tapu', disabled: true },
            ]} defaultValue="kat" />
          </Panel>
          <Panel title="Invalid">
            <CodexRadioGroup label="Kullanım durumu" options={[
              { value: 'bos', label: 'Boş' },
              { value: 'kiraci', label: 'Kiracılı' },
            ]} error="İlanı yayımlamak için kullanım durumunu seçin." required />
          </Panel>
          <Panel title="Loading">
            <CodexRadioGroup label="Yapı sınıfı" options={propertyOptions} defaultValue="daire" loading />
          </Panel>
        </div>
      </Section>
      <Section title="Segmented control" copy="Kısa ve birbirini dışlayan görünüm seçenekleri için; genel filtre etiketi yerine kullanılmaz.">
        <div className={styles.storyGrid}>
          <Panel title="Liste görünümü">
            <CodexSegmentedControl label="Sonuç düzeni" options={[
              { value: 'grid', label: 'Kart', icon: <GridIcon /> },
              { value: 'list', label: 'Liste', icon: <ListIcon /> },
            ]} defaultValue="grid" fullWidth />
          </Panel>
          <Panel title="Disabled + selected">
            <CodexSegmentedControl label="İlan türü" options={listingTypeOptions} defaultValue="kiralik" disabled fullWidth />
          </Panel>
          <Panel title="Invalid">
            <CodexSegmentedControl label="Yetki türü" options={[
              { value: 'tek', label: 'Tek yetki' },
              { value: 'coklu', label: 'Çoklu yetki' },
            ]} error="Yetkilendirme modelini seçin." fullWidth />
          </Panel>
          <Panel title="Loading">
            <CodexSegmentedControl label="Fiyat dönemi" options={[
              { value: 'aylik', label: 'Aylık' },
              { value: 'yillik', label: 'Yıllık' },
            ]} defaultValue="aylik" loading fullWidth />
          </Panel>
        </div>
      </Section>
    </StoryPage>
  ),
}

export const RangeStepperAndProgress: Story = {
  render: () => (
    <StoryPage>
      <StoryHero title="Sayısal giriş ve ilerleme">
        Range ve stepper sayısal sınırları native kontrollerle uygular; progress determinate ve indeterminate süreçleri ayırır.
      </StoryHero>
      <Section title="Slider ve stepper" copy="Birimler aria-valuetext üzerinden de okunur, min/max sınırında stepper aksiyonu kapanır.">
        <div className={styles.storyGrid}>
          <Panel title="Fiyat aralığı">
            <CodexSlider label="Üst bütçe" min={1_000_000} max={25_000_000} step={250_000} defaultValue={8_500_000} formatValue={(value) => `${new Intl.NumberFormat('tr-TR').format(value)} TL`} />
          </Panel>
          <Panel title="Invalid slider">
            <CodexSlider label="Kredi oranı" min={10} max={90} defaultValue={90} formatValue={(value) => `%${value}`} error="Bu gelir düzeyi için oran %70’i aşamaz." />
          </Panel>
          <Panel title="Disabled slider">
            <CodexSlider label="Bina yaşı" min={0} max={50} defaultValue={12} formatValue={(value) => `${value} yıl`} disabled />
          </Panel>
          <Panel title="Loading slider">
            <CodexSlider label="AI fiyat hassasiyeti" defaultValue={64} loading />
          </Panel>
          <Panel title="Kat sayısı">
            <CodexStepper label="Bulunduğu kat" min={-2} max={30} defaultValue={4} />
          </Panel>
          <Panel title="Sınır durumu">
            <CodexStepper label="Banyo sayısı" min={1} max={5} defaultValue={5} formatValue={(value) => `${value} banyo`} />
          </Panel>
          <Panel title="Invalid stepper">
            <CodexStepper label="Fotoğraf sayısı" min={0} max={24} defaultValue={0} error="En az üç fotoğraf ekleyin." />
          </Panel>
          <Panel title="Loading stepper">
            <CodexStepper label="AI öneri sayısı" min={1} max={5} defaultValue={3} loading />
          </Panel>
        </div>
      </Section>
      <Section title="Progress" copy="Renk birincil anlam taşımaz; label, yüzde ve açıklama birlikte görünür.">
        <div className={styles.storyGrid}>
          <Panel title="Determinate"><CodexProgress label="Fotoğraf yükleme" value={46} description="6 / 12 fotoğraf hazır" /></Panel>
          <Panel title="Information"><CodexProgress label="Tapu verisi eşleşmesi" value={68} tone="info" /></Panel>
          <Panel title="Success"><CodexProgress label="İlan doğrulama" value={100} tone="success" /></Panel>
          <Panel title="Error"><CodexProgress label="Veri aktarımı" value={32} tone="danger" description="Bağlantı kesildi; yeniden deneyin." /></Panel>
          <Panel title="Indeterminate"><CodexProgress label="AI fiyat analizi" description="Yakındaki emsaller karşılaştırılıyor." /></Panel>
        </div>
      </Section>
    </StoryPage>
  ),
}

function SelectedFilePanel() {
  const [files, setFiles] = useState<File[]>(() => [
    new File(['kapak'], 'urla-villa-kapak.webp', { type: 'image/webp', lastModified: 1 }),
    new File(['salon'], 'salon-gun-isigi.jpg', { type: 'image/jpeg', lastModified: 2 }),
  ])

  return (
    <CodexFileUpload
      label="Seçili ilan fotoğrafları"
      files={files}
      onFilesChange={setFiles}
      accept="image/jpeg,image/png,image/webp"
      multiple
    />
  )
}

export const FileAndDateStates: Story = {
  render: () => (
    <StoryPage>
      <StoryHero title="Dosya ve tarih durumları">
        Yükleyici sürükle-bırak, tür/boyut/adet doğrulaması ve dosya kaldırmayı; tarih alanı native takvim ve min/max sınırlarını kapsar.
      </StoryHero>
      <Section title="File upload" copy="Seçilen dosya adı ve boyutu metin olarak kalır; hata yalnız dropzone sınır rengine bırakılmaz.">
        <div className={styles.storyGrid}>
          <Panel title="Default">
            <CodexFileUpload label="Tapu belgesi" description="PDF veya JPEG, en fazla 12 MB." accept="application/pdf,image/jpeg" maxSize={12 * 1024 * 1024} />
          </Panel>
          <Panel title="Selected"><SelectedFilePanel /></Panel>
          <Panel title="Invalid">
            <CodexFileUpload label="Enerji kimlik belgesi" error="Belge yüklenmeden doğrulama başlatılamaz." accept="application/pdf" required />
          </Panel>
          <Panel title="Disabled">
            <CodexFileUpload label="Ekspertiz raporu" description="Rapor uzman tarafından yüklenecek." disabled />
          </Panel>
          <Panel title="Loading">
            <CodexFileUpload label="Fotoğraflar" loading />
          </Panel>
        </div>
      </Section>
      <Section title="Date picker" copy="Tarih biçimi işletim sistemi yereline bırakılır; veri sözleşmesi ISO tarih değerini korur.">
        <div className={styles.storyGrid}>
          <Panel title="Default"><CodexDatePicker label="Randevu tarihi" defaultValue="2026-07-24" min="2026-07-18" /></Panel>
          <Panel title="Required"><CodexDatePicker label="Yetki bitiş tarihi" description="Sözleşmede yer alan son gün." required /></Panel>
          <Panel title="Invalid"><CodexDatePicker label="Açık ev günü" defaultValue="2026-07-10" error="Bugünden önce bir tarih seçilemez." /></Panel>
          <Panel title="Disabled"><CodexDatePicker label="Tapu randevusu" defaultValue="2026-08-03" disabled /></Panel>
          <Panel title="Loading"><CodexDatePicker label="Uygun randevu" loading /></Panel>
        </div>
      </Section>
    </StoryPage>
  ),
}

export const MobileListingFlow: Story = {
  globals: { viewport: 'mobile1' },
  render: () => (
    <StoryPage>
      <StoryHero title="Dar ekran ilan filtresi">
        390px örneğinde dokunma hedefleri büyür, yatay radio grupları dikeye döner ve arama aksiyonu tam satır kullanır.
      </StoryHero>
      <div className={styles.mobileFrame}>
        <div className={styles.storyStack}>
          <CodexSearchField label="Nerede arıyorsunuz?" defaultValue="Çeşme, İzmir" />
          <CodexSegmentedControl label="İlan türü" options={listingTypeOptions} defaultValue="satilik" fullWidth />
          <CodexRadioGroup label="Konut tipi" options={propertyOptions.slice(0, 2)} defaultValue="daire" orientation="horizontal" />
          <CodexSlider label="En yüksek fiyat" min={2_000_000} max={20_000_000} step={500_000} defaultValue={9_000_000} formatValue={(value) => `${new Intl.NumberFormat('tr-TR').format(value)} TL`} />
          <CodexStepper label="En az oda" min={1} max={8} defaultValue={3} />
          <CodexDatePicker label="Taşınma tarihi" defaultValue="2026-09-01" />
          <CodexButton fullWidth>1.248 ilanı göster</CodexButton>
          <CodexBadge tone="info">Filtreler otomatik kaydedildi</CodexBadge>
        </div>
      </div>
    </StoryPage>
  ),
}
