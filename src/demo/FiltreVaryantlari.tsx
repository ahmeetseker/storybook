// Filtre yaprağı — YÖN DENEMELERİ (karar öncesi).
//
// Beş varyant da referanstaki AYNI bileşen setini kullanır: segmentli oda/banyo
// satırları (GlassSegmentedControl), dağılım histogramlı fiyat aralığı
// (GlassPriceRange), anahtar satırları (GlassSwitch), sonucu sayan birincil
// eylem (GlassButton) ve bunları taşıyan landmark (GlassFilterPanel).
// Fark bileşenlerde değil; hiyerarşi, yoğunluk, malzeme ve vurgu rengindedir.
//
// Seçilen yön component sözleşmesine taşınacak; bu dosya o zaman atılır.
import { useState, type ReactNode } from 'react'
import { GlassButton } from '../components/GlassButton'
import { GlassFilterPanel } from '../components/GlassFilterPanel'
import { GlassPriceRange, type GlassPriceRangeValue } from '../components/GlassPriceRange'
import { GlassSegmentedControl } from '../components/GlassSegmentedControl'
import { GlassSwitch } from '../components/GlassSwitch'
import { placeholderImage } from './placeholderImage'
import styles from './FiltreVaryantlari.module.css'

/** Sağa çarpık kira dağılımı — referanstaki gibi ince, çok sayıda sütun */
const BANTLAR = [
  2, 3, 4, 6, 8, 11, 14, 18, 23, 29, 36, 44, 53, 62, 71, 79, 86, 91, 94, 95, 93, 89, 84, 78, 71, 64, 57, 50, 44,
  38, 33, 28, 24, 20, 17, 14, 12, 10, 8, 7, 6, 5, 4, 3,
]
const KIRA_MIN = 300
const KIRA_MAX = 12000
const BANT = (KIRA_MAX - KIRA_MIN) / BANTLAR.length
const ODA = [
  { value: 'hepsi', label: 'Hepsi' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4+' },
]
const TL = (v: number) => `${v.toLocaleString('tr-TR')} ₺`
const INK = 'var(--lg-label)'

const ARKA_PLAN = placeholderImage('', '#bcd3e6', '#e8dfd2', 800, 1400)

interface FiltreDurumu {
  aralik: GlassPriceRangeValue
  oda: string
  banyo: string
}

const useFiltre = () => {
  const [durum, setDurum] = useState<FiltreDurumu>({ aralik: [850, 7400], oda: 'hepsi', banyo: '2' })
  const bandaDusen = BANTLAR.reduce((sum, count, i) => {
    const bas = KIRA_MIN + i * BANT
    return bas + BANT > durum.aralik[0] && bas < durum.aralik[1] ? sum + count : sum
  }, 0)
  const sonuc = Math.round(
    bandaDusen * (durum.oda === 'hepsi' ? 0.06 : 0.028) * (durum.banyo === 'hepsi' ? 1 : 0.68),
  )
  return { durum, setDurum, sonuc }
}

interface IcerikProps {
  durum: FiltreDurumu
  setDurum: (d: FiltreDurumu) => void
  /** Vurgu rengi: marka (amber, varsayılan) ya da nötr ink */
  tint?: string
  /** Segment kapsülünün malzemesi — cam varyantında kontroller cam kalır */
  segmentTone?: 'light' | 'dark' | 'auto'
}

/** Beş varyantın ortak gövdesi — kontrol seti her yerde birebir aynı */
function FiltreIcerik({ durum, setDurum, tint, segmentTone = 'auto' }: IcerikProps) {
  return (
    <>
      <div className={styles.group}>
        <span className={styles.groupLabel}>Oda sayısı</span>
        <GlassSegmentedControl
          className={styles.segmentRow}
          label="Oda sayısı"
          options={ODA}
          tone={segmentTone}
          value={durum.oda}
          onChange={(oda) => setDurum({ ...durum, oda })}
        />
      </div>
      <div className={styles.group}>
        <span className={styles.groupLabel}>Banyo</span>
        <GlassSegmentedControl
          className={styles.segmentRow}
          label="Banyo"
          options={ODA}
          tone={segmentTone}
          value={durum.banyo}
          onChange={(banyo) => setDurum({ ...durum, banyo })}
        />
      </div>
      <GlassPriceRange
        label="Fiyat aralığı"
        hint="Ortalama 1.200 ₺"
        min={KIRA_MIN}
        max={KIRA_MAX}
        step={50}
        bins={BANTLAR}
        tint={tint}
        value={durum.aralik}
        onChange={(aralik) => setDurum({ ...durum, aralik })}
        formatValue={TL}
      />
      <div className={styles.group}>
        <span className={styles.groupLabel}>Diğer seçenekler</span>
        <div className={styles.switchRow}>
          <span className={styles.switchLabel}>Krediye uygun</span>
          <GlassSwitch label="Krediye uygun" defaultChecked tint={tint} />
        </div>
        <div className={styles.switchRow}>
          <span className={styles.switchLabel}>Tek katlı</span>
          <GlassSwitch label="Tek katlı" tint={tint} />
        </div>
      </div>
    </>
  )
}

function Telefon({ children }: { children: ReactNode }) {
  return (
    <div className={styles.phone}>
      <div className={styles.screen}>
        <img className={styles.photo} src={ARKA_PLAN} alt="" />
        {children}
      </div>
    </div>
  )
}

const Cta = ({ sonuc, tint }: { sonuc: number; tint?: string }) => (
  <GlassButton className={styles.cta} size="lg" prominent tint={tint}>
    {sonuc.toLocaleString('tr-TR')} ilanı göster
  </GlassButton>
)

/** A · Referans çevirisi: nötr ink vurgu, sıfırlama yok, sayan tek eylem */
export function VaryantReferans() {
  const { durum, setDurum, sonuc } = useFiltre()
  return (
    <Telefon>
      <GlassFilterPanel
        className={styles.sheet}
        label="Filtreler"
        title={
          <>
            <span className={styles.handle} aria-hidden="true" />
            Filtreler
          </>
        }
        footer={<Cta sonuc={sonuc} tint={INK} />}
      >
        <FiltreIcerik durum={durum} setDurum={setDurum} tint={INK} />
      </GlassFilterPanel>
    </Telefon>
  )
}

/** B · Kağıt teması: aynı yerleşim, marka amber vurgusu + sıfırlama */
export function VaryantKagit() {
  const { durum, setDurum, sonuc } = useFiltre()
  return (
    <Telefon>
      <GlassFilterPanel
        className={styles.sheet}
        label="Filtreler"
        title={
          <>
            <span className={styles.handle} aria-hidden="true" />
            Filtreler
          </>
        }
        onReset={() => setDurum({ aralik: [KIRA_MIN, KIRA_MAX], oda: 'hepsi', banyo: 'hepsi' })}
        resetLabel="Temizle"
        footer={<Cta sonuc={sonuc} />}
      >
        <FiltreIcerik durum={durum} setDurum={setDurum} />
      </GlassFilterPanel>
    </Telefon>
  )
}

/** C · Cam yaprak: harita/fotoğraf üstünde cam katman, kontroller cam kalır */
export function VaryantCam() {
  const { durum, setDurum, sonuc } = useFiltre()
  return (
    <Telefon>
      <GlassFilterPanel
        className={styles.sheet}
        material="glass"
        label="Filtreler"
        title={
          <>
            <span className={styles.handle} aria-hidden="true" />
            Filtreler
          </>
        }
        resultCount={sonuc}
        resultLabel={(n) => `${n.toLocaleString('tr-TR')} ilan bulundu`}
        footer={<Cta sonuc={sonuc} />}
      >
        <FiltreIcerik durum={durum} setDurum={setDurum} segmentTone="light" />
      </GlassFilterPanel>
    </Telefon>
  )
}

/** D · Masaüstü rayı: aynı set, sonuç ızgarasının yanında sabit sütun */
export function VaryantKompakt() {
  const { durum, setDurum, sonuc } = useFiltre()
  return (
    <div className={styles.railStage}>
      <GlassFilterPanel
        className={styles.rail}
        label="Filtreler"
        resultCount={sonuc}
        resultLabel={(n) => `${n.toLocaleString('tr-TR')} ilan`}
        onReset={() => setDurum({ aralik: [KIRA_MIN, KIRA_MAX], oda: 'hepsi', banyo: 'hepsi' })}
        resetLabel="Temizle"
        footer={<Cta sonuc={sonuc} />}
      >
        <FiltreIcerik durum={durum} setDurum={setDurum} />
      </GlassFilterPanel>
      <div className={styles.railResults}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={styles.resultCard} />
        ))}
      </div>
    </div>
  )
}

/** E · Dokunmatik öncelikli: seçim cümlesi üstte, hedefler büyük, eylem altta */
export function VaryantDokunmatik() {
  const { durum, setDurum, sonuc } = useFiltre()
  const ozet = [
    durum.oda === 'hepsi' ? 'her oda sayısı' : `${durum.oda}+ oda`,
    durum.banyo === 'hepsi' ? 'her banyo' : `${durum.banyo} banyo`,
    `${TL(durum.aralik[0])} – ${TL(durum.aralik[1])}`,
  ].join(' · ')
  return (
    <Telefon>
      <GlassFilterPanel
        className={styles.sheet}
        label="Filtreler"
        title={
          <>
            <span className={styles.handle} aria-hidden="true" />
            Filtreler
          </>
        }
        onReset={() => setDurum({ aralik: [KIRA_MIN, KIRA_MAX], oda: 'hepsi', banyo: 'hepsi' })}
        resetLabel="Temizle"
        footer={<Cta sonuc={sonuc} tint={INK} />}
      >
        <p className={styles.summary}>{ozet}</p>
        <FiltreIcerik durum={durum} setDurum={setDurum} tint={INK} />
      </GlassFilterPanel>
    </Telefon>
  )
}

const VARYANTLAR = [
  {
    id: 'referans',
    ad: 'A · Referans çevirisi',
    not: 'Nötr ink vurgu, sıfırlama yok, tek sayan eylem. Referansa en yakın.',
    render: <VaryantReferans />,
  },
  {
    id: 'kagit',
    ad: 'B · Kağıt teması',
    not: 'Aynı yerleşim, marka amber vurgusu + "Temizle".',
    render: <VaryantKagit />,
  },
  {
    id: 'cam',
    ad: 'C · Cam yaprak',
    not: 'Fotoğraf/harita üstünde cam katman; sonuç sayısı başlıkta canlı.',
    render: <VaryantCam />,
  },
  {
    id: 'dokunmatik',
    ad: 'E · Dokunmatik öncelikli',
    not: 'Üstte seçim cümlesi, büyük hedefler, altta ink eylem.',
    render: <VaryantDokunmatik />,
  },
  {
    id: 'kompakt',
    ad: 'D · Masaüstü rayı',
    not: 'Sonuç ızgarasının yanında sabit sütun — web arama sayfası için.',
    render: <VaryantKompakt />,
  },
]

/** Beş yön yan yana — karar bunun üstünden verilir */
export function FiltreVaryantlari() {
  return (
    <div className={styles.stage}>
      {VARYANTLAR.map((v) => (
        <div key={v.id} className={styles.case}>
          <div className={styles.caseHead}>
            <span className={styles.caseName}>{v.ad}</span>
            <span className={styles.caseNote}>{v.not}</span>
          </div>
          {v.render}
        </div>
      ))}
    </div>
  )
}
