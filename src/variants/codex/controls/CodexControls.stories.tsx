import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CodexBadge,
  CodexButton,
  CodexCheckbox,
  CodexChip,
  CodexField,
  CodexIconButton,
  CodexInput,
  CodexSelect,
  CodexSwitch,
  CodexTabs,
  type CodexButtonVariant,
  type CodexTabItem,
} from './CodexControls'
import styles from './CodexControls.module.css'

const meta = {
  title: 'Codex Enterprise/02 Aksiyon ve Formlar/01 Çekirdek Kontroller',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { defaultTheme: 'paper' },
    docs: {
      description: {
        component:
          'Mevcut Glass component’lere dokunmadan karşılaştırma için eklenen, sakin hareketli ve WCAG 2.2 AA odaklı Codex kontrol ailesi.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.8 5.8a5.4 5.4 0 0 0-7.7 0L12 6.9l-1.1-1.1a5.4 5.4 0 1 0-7.7 7.7L12 22l8.8-8.5a5.4 5.4 0 0 0 0-7.7Z" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

function StoryPage({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={`${styles.storyPage} ${dark ? styles.storyDark : ''}`}>
      <header className={styles.storyHeader}>
        <h1 className={styles.storyTitle}>Codex kontrol sistemi</h1>
        <p className={styles.storyIntro}>
          Kareye yakın kontrol geometrisi, yalnız filtrelerde gerçek pill kullanımı ve tüm etkileşimlerde aynı güçlü odak halkası.
        </p>
      </header>
      <div className={styles.storyStack}>{children}</div>
    </div>
  )
}

function Section({ title, copy, children }: { title: string; copy?: string; children: ReactNode }) {
  return (
    <section className={styles.storySection}>
      <header className={styles.storySectionHeader}>
        <h2 className={styles.storySectionTitle}>{title}</h2>
        {copy ? <p className={styles.storySectionCopy}>{copy}</p> : null}
      </header>
      {children}
    </section>
  )
}

function StateCell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.storyCell}>
      <h3 className={styles.storyStateTitle}>{title}</h3>
      <div className={styles.storyRow}>{children}</div>
    </div>
  )
}

const tabItems: CodexTabItem[] = [
  {
    id: 'ozet',
    label: 'Özet',
    panel: <p className={styles.storyPanelCopy}>İlanın temel bilgileri ve doğrulama durumu tek bakışta gösterilir.</p>,
  },
  {
    id: 'konum',
    label: 'Konum',
    panel: <p className={styles.storyPanelCopy}>Parsel konumu, yakın çevre ve ulaşım notları burada yer alır.</p>,
  },
  {
    id: 'gecmis',
    label: 'Fiyat geçmişi',
    panel: <p className={styles.storyPanelCopy}>Son iki fiyat güncellemesi ve değişim yüzdeleri listelenir.</p>,
  },
  {
    id: 'arsiv',
    label: 'Arşiv',
    panel: <p className={styles.storyPanelCopy}>Arşiv bölümü şu anda kullanılamıyor.</p>,
    disabled: true,
  },
]

function OverviewDemo({ dark = false }: { dark?: boolean }) {
  const [selected, setSelected] = useState(true)
  const [switchOn, setSwitchOn] = useState(true)
  const [city, setCity] = useState('izmir')
  const [tab, setTab] = useState('ozet')

  return (
    <StoryPage dark={dark}>
      <Section title="Aksiyonlar" copy="Birincil eylem tek, ikincil eylemler daha sessizdir.">
        <div className={styles.storyRow}>
          <CodexButton>
            İlan oluştur <ArrowIcon />
          </CodexButton>
          <CodexButton variant="secondary">Taslağı kaydet</CodexButton>
          <CodexButton variant="quiet">Vazgeç</CodexButton>
          <CodexIconButton label="İlanı kaydet" icon={<HeartIcon />} pressed />
        </div>
      </Section>

      <Section title="Durum ve filtreler" copy="Badge bilgi verir; chip gerçek bir filtre kontrolüdür.">
        <div className={styles.storyRow}>
          <CodexBadge tone="success" dot>Doğrulandı</CodexBadge>
          <CodexBadge tone="warning" dot>Belge bekleniyor</CodexBadge>
          <CodexChip selected={selected} onSelectedChange={setSelected}>EİDS doğrulamalı</CodexChip>
          <CodexChip onRemove={() => undefined}>Urla</CodexChip>
        </div>
      </Section>

      <Section title="Form alanları" copy="Label, açıklama ve hata ilişkisi alan context’i üzerinden otomatik kurulur.">
        <div className={styles.storyFormGrid}>
          <CodexField label="Arama" hint="İlçe, mahalle veya ilan numarası yazın.">
            <CodexInput placeholder="Örn. Urla" />
          </CodexField>
          <CodexField label="Şehir" required>
            <CodexSelect value={city} onChange={(event) => setCity(event.currentTarget.value)}>
              <option value="izmir">İzmir</option>
              <option value="ankara">Ankara</option>
              <option value="mugla">Muğla</option>
            </CodexSelect>
          </CodexField>
        </div>
      </Section>

      <Section title="Seçimler">
        <div className={styles.storyMatrix}>
          <CodexCheckbox label="Yalnız doğrulanmış ilanlar" description="EİDS doğrulaması tamamlanan sonuçları göster." defaultChecked />
          <CodexSwitch label="Fiyat düşünce bildir" description="Değişiklikleri e-posta ile al." checked={switchOn} onCheckedChange={setSwitchOn} />
        </div>
      </Section>

      <Section title="Sekmeler" copy="Ok tuşları, Home ve End otomatik aktivasyonla çalışır.">
        <CodexTabs items={tabItems} value={tab} onValueChange={setTab} ariaLabel="İlan ayrıntıları" />
      </Section>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <OverviewDemo /> }

const buttonVariants: CodexButtonVariant[] = ['primary', 'secondary', 'quiet', 'danger']

export const ButtonVariants: Story = {
  render: () => (
    <StoryPage>
      <Section title="Button varyantları" copy="Tüm varyantlar aynı 10px geometriyi ve en fazla −1px hover yükselmesini paylaşır.">
        <div className={styles.storyStack}>
          {buttonVariants.map((variant) => (
            <div className={styles.storyRow} key={variant}>
              <CodexBadge>{variant}</CodexBadge>
              <CodexButton variant={variant} size="sm">Küçük</CodexButton>
              <CodexButton variant={variant} size="md">Orta</CodexButton>
              <CodexButton variant={variant} size="lg">Büyük</CodexButton>
            </div>
          ))}
        </div>
      </Section>
    </StoryPage>
  ),
}

export const ButtonStates: Story = {
  render: () => (
    <StoryPage>
      <Section title="Button state matrisi" copy="Forced focus hücresi görsel regresyon incelemesi için gerçek focus-visible halkasını sabitler.">
        <div className={styles.storyMatrix}>
          {buttonVariants.flatMap((variant) => [
            <StateCell key={`${variant}-default`} title={`${variant} · default`}>
              <CodexButton variant={variant}>Devam et</CodexButton>
            </StateCell>,
            <StateCell key={`${variant}-focus`} title={`${variant} · focus-visible`}>
              <CodexButton variant={variant} className={styles.forcedFocus}>Devam et</CodexButton>
            </StateCell>,
            <StateCell key={`${variant}-disabled`} title={`${variant} · disabled`}>
              <CodexButton variant={variant} disabled>Devam et</CodexButton>
            </StateCell>,
            <StateCell key={`${variant}-loading`} title={`${variant} · loading`}>
              <CodexButton variant={variant} loading>Kaydediliyor</CodexButton>
            </StateCell>,
          ])}
        </div>
      </Section>
    </StoryPage>
  ),
}

export const IconButtons: Story = {
  render: () => (
    <StoryPage>
      <Section title="Icon button" copy="Varsayılan soft-square’dır; circle yalnız medya üstü veya yuvarlak araç kümeleri için seçilir.">
        <div className={styles.storyMatrix}>
          <StateCell title="Boyutlar">
            <CodexIconButton label="Ara" icon={<SearchIcon />} size="sm" />
            <CodexIconButton label="Ara" icon={<SearchIcon />} size="md" />
            <CodexIconButton label="Ara" icon={<SearchIcon />} size="lg" />
          </StateCell>
          <StateCell title="Square / circle">
            <CodexIconButton label="Diğer işlemler" icon={<MoreIcon />} />
            <CodexIconButton label="Diğer işlemler" icon={<MoreIcon />} shape="circle" />
          </StateCell>
          <StateCell title="Pressed">
            <CodexIconButton label="İlanı kaydet" icon={<HeartIcon />} pressed={false} />
            <CodexIconButton label="İlanı kaydet" icon={<HeartIcon />} pressed />
          </StateCell>
          <StateCell title="Focus / disabled">
            <CodexIconButton label="Ara" icon={<SearchIcon />} className={styles.forcedFocus} />
            <CodexIconButton label="Ara" icon={<SearchIcon />} disabled />
          </StateCell>
        </div>
      </Section>
    </StoryPage>
  ),
}

function BadgeChipDemo() {
  const [verified, setVerified] = useState(true)
  const [garden, setGarden] = useState(false)
  const [districtVisible, setDistrictVisible] = useState(true)

  return (
    <StoryPage>
      <Section title="Badge tonları" copy="Soft-square biçim metin etiketidir; dot yalnız ek bir durum ipucudur.">
        <div className={styles.storyRow}>
          <CodexBadge tone="neutral" dot>Nötr</CodexBadge>
          <CodexBadge tone="accent" dot>Öne çıkan</CodexBadge>
          <CodexBadge tone="success" dot>Doğrulandı</CodexBadge>
          <CodexBadge tone="warning" dot>İnceleniyor</CodexBadge>
          <CodexBadge tone="danger" dot>İşlem gerekli</CodexBadge>
        </div>
      </Section>
      <Section title="Filter chip state’leri" copy="Seçim ve kaldırma iki ayrı, iç içe olmayan button ile çalışır.">
        <div className={styles.storyRow}>
          <CodexChip selected={verified} onSelectedChange={setVerified}>Doğrulanmış</CodexChip>
          <CodexChip selected={garden} onSelectedChange={setGarden}>Bahçeli</CodexChip>
          {districtVisible ? <CodexChip onRemove={() => setDistrictVisible(false)}>Urla</CodexChip> : null}
          <CodexChip selected disabled>Devre dışı</CodexChip>
        </div>
      </Section>
    </StoryPage>
  )
}

export const BadgesAndChips: Story = { render: () => <BadgeChipDemo /> }

function FormControlsDemo() {
  const [city, setCity] = useState('')

  return (
    <StoryPage>
      <Section title="Input ve Select state matrisi" copy="Native input/select semantiği korunur; Field yalnız erişilebilir ilişkileri ve açıklama katmanını kurar.">
        <div className={styles.storyFormGrid}>
          <CodexField label="İlan başlığı" hint="Konumu ve ayırt edici özelliği kısa yazın." required>
            <CodexInput placeholder="Urla’da deniz manzaralı arsa" />
          </CodexField>
          <CodexField label="E-posta" error="Geçerli bir e-posta adresi girin.">
            <CodexInput type="email" defaultValue="mehmet@" />
          </CodexField>
          <CodexField label="İlan numarası" hint="Bu değer daha sonra değiştirilemez.">
            <CodexInput value="1084526631" readOnly />
          </CodexField>
          <CodexField label="Yetki belgesi">
            <CodexInput value="Belge yükleniyor" disabled readOnly />
          </CodexField>
          <CodexField label="Şehir" required>
            <CodexSelect placeholder="Şehir seçin" value={city} onChange={(event) => setCity(event.currentTarget.value)}>
              <option value="izmir">İzmir</option>
              <option value="ankara">Ankara</option>
              <option value="mugla">Muğla</option>
            </CodexSelect>
          </CodexField>
          <CodexField label="İmar türü" error="Bir imar türü seçin.">
            <CodexSelect placeholder="Seçim yapın" defaultValue="">
              <option value="konut">Konut</option>
              <option value="ticari">Ticari</option>
            </CodexSelect>
          </CodexField>
        </div>
      </Section>
      <Section title="Kontrol boyutları">
        <div className={styles.storyFormGrid}>
          <CodexInput controlSize="sm" aria-label="Küçük input" placeholder="Küçük" />
          <CodexInput controlSize="md" aria-label="Orta input" placeholder="Orta" />
          <CodexInput controlSize="lg" aria-label="Büyük input" placeholder="Büyük" />
        </div>
      </Section>
    </StoryPage>
  )
}

export const FormControls: Story = { render: () => <FormControlsDemo /> }

export const SelectionControls: Story = {
  render: () => (
    <StoryPage>
      <Section title="Checkbox" copy="Native checkbox tabanı checked, mixed ve disabled durumlarını yardımcı teknolojiye taşır.">
        <div className={styles.storyMatrix}>
          <CodexCheckbox label="Doğrulanmış ilanlar" />
          <CodexCheckbox label="Fotoğraflı ilanlar" defaultChecked />
          <CodexCheckbox label="Bazı şehirler seçili" indeterminate />
          <CodexCheckbox label="Kurumsal ilanlar" description="Bu filtre mevcut aramada kullanılamıyor." disabled />
        </div>
      </Section>
      <Section title="Switch" copy="Ayar anında uygulanıyorsa switch, form gönderiminde uygulanıyorsa checkbox kullanılır.">
        <div className={styles.storyMatrix}>
          <CodexSwitch label="Haritada göster" />
          <CodexSwitch label="Fiyat alarmı" defaultChecked />
          <CodexSwitch label="Haftalık özet" description="Her pazartesi e-posta gönder." defaultChecked />
          <CodexSwitch label="SMS bildirimi" disabled />
        </div>
      </Section>
    </StoryPage>
  ),
}

function TabsDemo() {
  const [value, setValue] = useState('ozet')
  return (
    <StoryPage>
      <Section title="Tabs" copy="Disabled tab roving tabindex sırasından çıkar; uzun bar yatay kaydırılabilir.">
        <CodexTabs items={tabItems} value={value} onValueChange={setValue} ariaLabel="İlan ayrıntıları" />
      </Section>
    </StoryPage>
  )
}

export const Tabs: Story = { render: () => <TabsDemo /> }

export const DarkTheme: Story = { render: () => <OverviewDemo dark /> }

export const CompactTouch: Story = {
  globals: { viewport: 'mobile1' },
  render: () => (
    <StoryPage>
      <Section title="Dar ekran ve coarse pointer" copy="Yetenek sorgusu etkileşimli hedefleri en az 44px’e yükseltir.">
        <div className={styles.storyStack}>
          <div className={styles.storyRow}>
            <CodexButton size="sm">Filtreleri uygula</CodexButton>
            <CodexIconButton size="sm" label="Ara" icon={<SearchIcon />} />
          </div>
          <div className={styles.storyRow}>
            <CodexChip defaultSelected>Doğrulanmış</CodexChip>
            <CodexChip onRemove={() => undefined}>Urla</CodexChip>
          </div>
          <CodexField label="Konum" hint="İlçe veya mahalle yazın.">
            <CodexInput placeholder="Urla" />
          </CodexField>
          <CodexCheckbox label="Yalnız fotoğraflı ilanlar" />
          <CodexSwitch label="Fiyat düşünce bildir" />
          <CodexTabs items={tabItems} defaultValue="ozet" ariaLabel="Mobil ilan ayrıntıları" />
        </div>
      </Section>
    </StoryPage>
  ),
}
