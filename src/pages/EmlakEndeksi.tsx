// Emlak Endeksi — mahalle endeks sayfası örneği.
// Blok sırası sektörde doğrulanmış kalıba uyar: fiyat → güven → eğilim → dağılım
// → arz → getiri → komşu bölgeler → metodoloji → iç linkleme. Arz'ın talepten
// önce gelmesi bilinçlidir: "kaç seçenek var" sorusu "ne kadar hızlı satılıyor"dan
// önce cevaplanır (bkz. docs/emlak-endeksi-arastirma-ve-plan-2026-08-05.md §C).
//
// Yerleşim kuralı: zemin fildişi olduğu için okunacak hiçbir veri doğrudan zeminde
// bırakılmaz — beyaz kart yüzeyine oturur. Kendi kartını çizen component'ler
// (GlassChart, GlassTable, GlassAccordion, GlassSeoDiscovery) tekrar sarılmaz.
//
// Kalan eksikler (bu sayfada hâlâ vekil kullanılan bloklar):
//   · Komşu mahalleler → GlassChoroplethMap yerine tablo (GlassMap polygon bilmiyor)
//   · Güven bandı     → GlassConfidencePanel yerine GlassScoreMeter + künye satırı
import { useMemo, useState } from 'react'
import { GlassBreadcrumb } from '../components/GlassBreadcrumb'
import { GlassSegmentedControl } from '../components/GlassSegmentedControl'
import { GlassMetricStrip } from '../components/GlassMetricStrip'
import { GlassTrendChart, type GlassTrendSeries } from '../components/GlassTrendChart'
import { GlassDistributionChart } from '../components/GlassDistributionChart'
import { GlassSparkline } from '../components/GlassSparkline'
import { GlassTable, type GlassTableSortDirection } from '../components/GlassTable'
import { GlassSpecTable } from '../components/GlassSpecTable'
import { GlassScoreMeter } from '../components/GlassScoreMeter'
import { GlassTabs } from '../components/GlassTabs'
import { GlassAccordion } from '../components/GlassAccordion'
import { GlassBadge } from '../components/GlassBadge'
import { GlassDataProvenance } from '../components/GlassDataProvenance'
import { GlassSeoDiscovery } from '../components/GlassSeoDiscovery'
import { PublicShell } from './shared/shells'
import styles from './EmlakEndeksi.module.css'

const noop = () => {}

/* ── Veri (fixture) ─────────────────────────────────────────────────────── */

type Islem = 'satilik' | 'kiralik'
type Donem = '1y' | '3y' | '5y'
type Baz = 'nominal' | 'reel'

/**
 * Aylık medyan m² ilan fiyatı. Her dönem üç seri taşır: mahalle (kendi ölçümümüz),
 * ilçe ortalaması ve TCMB Konut Fiyat Endeksi — ikincisi ve üçüncüsü benchmark'tır.
 * `reel` sütunları TÜFE'den arındırılmış, Temmuz 2026 fiyatlarıyla.
 */
interface SeriNoktasi {
  x: string
  nominal: number
  reel: number
  ilceNominal: number
  ilceReel: number
  tcmbNominal: number
  tcmbReel: number
}

const SERI: Record<Donem, SeriNoktasi[]> = {
  '1y': [
    { x: 'Ağu 25', nominal: 61_600, reel: 84_200, ilceNominal: 70_100, ilceReel: 95_800, tcmbNominal: 64_200, tcmbReel: 87_700 },
    { x: 'Eyl 25', nominal: 63_100, reel: 84_000, ilceNominal: 71_800, ilceReel: 95_600, tcmbNominal: 66_000, tcmbReel: 87_900 },
    { x: 'Eki 25', nominal: 65_400, reel: 84_600, ilceNominal: 73_900, ilceReel: 95_600, tcmbNominal: 68_100, tcmbReel: 88_100 },
    { x: 'Kas 25', nominal: 67_200, reel: 84_300, ilceNominal: 75_400, ilceReel: 94_600, tcmbNominal: 70_000, tcmbReel: 87_800 },
    { x: 'Ara 25', nominal: 69_800, reel: 84_900, ilceNominal: 77_900, ilceReel: 94_700, tcmbNominal: 72_400, tcmbReel: 88_000 },
    { x: 'Oca 26', nominal: 72_100, reel: 85_100, ilceNominal: 80_200, ilceReel: 94_600, tcmbNominal: 74_800, tcmbReel: 88_300 },
    { x: 'Şub 26', nominal: 74_000, reel: 84_800, ilceNominal: 82_000, ilceReel: 93_900, tcmbNominal: 76_500, tcmbReel: 87_600 },
    { x: 'Mar 26', nominal: 75_900, reel: 84_500, ilceNominal: 83_800, ilceReel: 93_300, tcmbNominal: 78_100, tcmbReel: 86_900 },
    { x: 'Nis 26', nominal: 77_600, reel: 84_100, ilceNominal: 85_100, ilceReel: 92_200, tcmbNominal: 79_600, tcmbReel: 86_300 },
    { x: 'May 26', nominal: 79_400, reel: 83_700, ilceNominal: 86_900, ilceReel: 91_600, tcmbNominal: 81_000, tcmbReel: 85_400 },
    { x: 'Haz 26', nominal: 81_200, reel: 83_400, ilceNominal: 88_400, ilceReel: 90_800, tcmbNominal: 82_300, tcmbReel: 84_500 },
    { x: 'Tem 26', nominal: 82_500, reel: 82_500, ilceNominal: 89_600, ilceReel: 89_600, tcmbNominal: 83_400, tcmbReel: 83_400 },
  ],
  '3y': [
    { x: '2023 Ç3', nominal: 31_400, reel: 79_100, ilceNominal: 36_800, ilceReel: 92_700, tcmbNominal: 33_900, tcmbReel: 85_400 },
    { x: '2024 Ç1', nominal: 39_800, reel: 81_600, ilceNominal: 45_900, ilceReel: 94_100, tcmbNominal: 42_100, tcmbReel: 86_300 },
    { x: '2024 Ç3', nominal: 48_200, reel: 83_200, ilceNominal: 55_100, ilceReel: 95_100, tcmbNominal: 50_400, tcmbReel: 87_000 },
    { x: '2025 Ç1', nominal: 55_700, reel: 84_400, ilceNominal: 63_200, ilceReel: 95_800, tcmbNominal: 57_900, tcmbReel: 87_700 },
    { x: '2025 Ç3', nominal: 63_100, reel: 84_000, ilceNominal: 71_800, ilceReel: 95_600, tcmbNominal: 66_000, tcmbReel: 87_900 },
    { x: '2026 Ç1', nominal: 72_100, reel: 85_100, ilceNominal: 80_200, ilceReel: 94_600, tcmbNominal: 74_800, tcmbReel: 88_300 },
    { x: '2026 Ç3', nominal: 82_500, reel: 82_500, ilceNominal: 89_600, ilceReel: 89_600, tcmbNominal: 83_400, tcmbReel: 83_400 },
  ],
  '5y': [
    { x: '2021', nominal: 11_900, reel: 71_400, ilceNominal: 14_200, ilceReel: 85_200, tcmbNominal: 12_800, tcmbReel: 76_800 },
    { x: '2022', nominal: 21_300, reel: 76_800, ilceNominal: 25_100, ilceReel: 90_500, tcmbNominal: 22_700, tcmbReel: 81_800 },
    { x: '2023', nominal: 33_600, reel: 80_200, ilceNominal: 39_400, ilceReel: 94_000, tcmbNominal: 36_100, tcmbReel: 86_100 },
    { x: '2024', nominal: 51_400, reel: 83_500, ilceNominal: 58_700, ilceReel: 95_400, tcmbNominal: 53_800, tcmbReel: 87_400 },
    { x: '2025', nominal: 66_900, reel: 84_300, ilceNominal: 75_600, ilceReel: 95_200, tcmbNominal: 69_700, tcmbReel: 87_800 },
    { x: '2026', nominal: 82_500, reel: 82_500, ilceNominal: 89_600, ilceReel: 89_600, tcmbNominal: 83_400, tcmbReel: 83_400 },
  ],
}

/** m² fiyat dağılımı — bant başına ilan adedi; medyan 80–90 bin bandına düşüyor. */
const DAGILIM = [
  { id: 'b1', label: '< 60 bin', count: 8 },
  { id: 'b2', label: '60–70 bin', count: 21 },
  { id: 'b3', label: '70–80 bin', count: 34 },
  { id: 'b4', label: '80–90 bin', count: 29, containsMedian: true },
  { id: 'b5', label: '90–100 bin', count: 17 },
  { id: 'b6', label: '100 bin +', count: 11 },
]

const PERSENTILLER = [
  { id: 'p10', label: 'P10', value: '64.200 TL/m²' },
  { id: 'p25', label: 'P25', value: '72.900 TL/m²' },
  { id: 'p50', label: 'Medyan', value: '82.500 TL/m²', prominent: true },
  { id: 'p75', label: 'P75', value: '91.400 TL/m²' },
  { id: 'p90', label: 'P90', value: '103.800 TL/m²' },
  { id: 'mm', label: 'Min – Maks', value: '54.100 – 128.600' },
]

interface Komsu {
  id: string
  mahalle: string
  m2: number
  degisimNominal: number
  degisimReel: number
  getiri: number
  amortisman: number
  ilan: number
  sure: number
  kalite: 'A' | 'B' | 'C'
  /** Son 12 ayın medyan m² fiyatı — satır içi sparkline serisi */
  seri: number[]
}

/**
 * 12 aylık seriyi son değerden ve yıllık değişimden geriye doğru üretir.
 * `faz` her mahalleye farklı bir dalgalanma deseni verir — gerçek veride
 * satırların seyri birbirinin kopyası olmaz.
 */
const seriUret = (son: number, yillikYuzde: number, faz: number) => {
  const n = 12
  const bas = son / (1 + yillikYuzde / 100)
  return Array.from({ length: n }, (_, i) => {
    const dogrusal = bas + ((son - bas) * i) / (n - 1)
    const dalga = Math.sin((i / (n - 1)) * Math.PI * 2 + faz) * 0.012 + Math.sin(i * 1.7 + faz) * 0.005
    // Son nokta her zaman tam değere oturur (yayımlanan medyanla çelişmesin).
    return Math.round(i === n - 1 ? son : dogrusal * (1 + dalga))
  })
}

const KOMSULAR: Komsu[] = [
  { id: 'feneryolu', mahalle: 'Feneryolu', m2: 82_500, degisimNominal: 34.0, degisimReel: -2.2, getiri: 4.9, amortisman: 20, ilan: 121, sure: 54, kalite: 'A', seri: seriUret(82_500, 34.0, 0) },
  { id: 'goztepe', mahalle: 'Göztepe', m2: 91_200, degisimNominal: 31.4, degisimReel: -4.1, getiri: 4.4, amortisman: 23, ilan: 168, sure: 61, kalite: 'A', seri: seriUret(91_200, 31.4, 1.1) },
  { id: 'caddebostan', mahalle: 'Caddebostan', m2: 128_700, degisimNominal: 28.9, degisimReel: -5.9, getiri: 3.6, amortisman: 28, ilan: 94, sure: 78, kalite: 'A', seri: seriUret(128_700, 28.9, 2.3) },
  { id: 'erenkoy', mahalle: 'Erenköy', m2: 88_400, degisimNominal: 35.6, degisimReel: -1.0, getiri: 4.7, amortisman: 21, ilan: 143, sure: 58, kalite: 'A', seri: seriUret(88_400, 35.6, 3.4) },
  { id: 'sahrayicedit', mahalle: 'Sahrayıcedit', m2: 74_900, degisimNominal: 38.2, degisimReel: 0.9, getiri: 5.3, amortisman: 19, ilan: 87, sure: 49, kalite: 'B', seri: seriUret(74_900, 38.2, 4.6) },
  { id: 'fikirtepe', mahalle: 'Fikirtepe', m2: 61_300, degisimNominal: 44.1, degisimReel: 5.3, getiri: 6.1, amortisman: 16, ilan: 52, sure: 41, kalite: 'B', seri: seriUret(61_300, 44.1, 5.2) },
  { id: 'merdivenkoy', mahalle: 'Merdivenköy', m2: 69_800, degisimNominal: 33.1, degisimReel: -2.9, getiri: 5.5, amortisman: 18, ilan: 76, sure: 52, kalite: 'B', seri: seriUret(69_800, 33.1, 0.7) },
  // Etkin örneklem 10'un altında: seri de yayımlanmaz, sparkline "yeterli veri yok" der.
  { id: 'dumlupinar', mahalle: 'Dumlupınar', m2: 0, degisimNominal: 0, degisimReel: 0, getiri: 0, amortisman: 0, ilan: 14, sure: 0, kalite: 'C', seri: [] },
]

/** Kırılım satırı — segment adı sekmeye göre değişir (oda sayısı, bina yaşı…). */
interface KirilimSatiri {
  id: string
  segment: string
  m2: number
  fiyat: string
  degisim: string
  ilan: number
  pay: string
}

const KIRILIM_ODA: KirilimSatiri[] = [
  { id: '1+1', segment: '1+1', m2: 96_400, fiyat: '4.820.000 TL', degisim: '%37,2', ilan: 24, pay: '%20' },
  { id: '2+1', segment: '2+1', m2: 85_100, fiyat: '7.660.000 TL', degisim: '%34,8', ilan: 48, pay: '%40' },
  { id: '3+1', segment: '3+1', m2: 79_300, fiyat: '10.700.000 TL', degisim: '%32,9', ilan: 37, pay: '%31' },
  { id: '4+1', segment: '4+1', m2: 76_800, fiyat: '14.600.000 TL', degisim: '%30,1', ilan: 12, pay: '%9' },
]

const KIRILIM_YAS: KirilimSatiri[] = [
  { id: '0-4', segment: '0–4 yaş', m2: 98_200, fiyat: '9.820.000 TL', degisim: '%31,4', ilan: 19, pay: '%16' },
  { id: '5-10', segment: '5–10 yaş', m2: 88_600, fiyat: '8.420.000 TL', degisim: '%33,8', ilan: 33, pay: '%27' },
  { id: '11-20', segment: '11–20 yaş', m2: 79_400, fiyat: '7.540.000 TL', degisim: '%35,2', ilan: 41, pay: '%34' },
  { id: '21+', segment: '21 yaş +', m2: 68_900, fiyat: '6.890.000 TL', degisim: '%36,7', ilan: 28, pay: '%23' },
]

const tl = (n: number) => n.toLocaleString('tr-TR')
const bir = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const yuzde = (n: number) => `${n > 0 ? '+' : ''}${bir(n)}%`

/* ── Sayfa ──────────────────────────────────────────────────────────────── */

export function EmlakEndeksi() {
  const [islem, setIslem] = useState<Islem>('satilik')
  const [donem, setDonem] = useState<Donem>('1y')
  const [baz, setBaz] = useState<Baz>('nominal')
  const [siraKey, setSiraKey] = useState('m2')
  const [siraYon, setSiraYon] = useState<GlassTableSortDirection>('desc')

  // Üç seri: kendi ölçümümüz + ilçe ortalaması + resmî endeks. İkincisi ve
  // üçüncüsü benchmark'tır; çizgi deseni ve künye rozetiyle ayrılır.
  const seriler = useMemo<GlassTrendSeries[]>(() => {
    const veri = SERI[donem]
    const al = (secici: (p: SeriNoktasi) => number) => veri.map((p) => ({ x: p.x, y: secici(p) }))
    return [
      { id: 'mahalle', label: 'Feneryolu', points: al((p) => (baz === 'nominal' ? p.nominal : p.reel)) },
      {
        id: 'ilce',
        label: 'Kadıköy ortalaması',
        kind: 'benchmark',
        points: al((p) => (baz === 'nominal' ? p.ilceNominal : p.ilceReel)),
      },
      {
        id: 'tcmb',
        label: 'TCMB Konut Fiyat Endeksi',
        kind: 'benchmark',
        points: al((p) => (baz === 'nominal' ? p.tcmbNominal : p.tcmbReel)),
      },
    ]
  }, [donem, baz])

  const komsuSatirlari = useMemo(() => {
    const yeterli = KOMSULAR.filter((k) => k.kalite !== 'C')
    const eksik = KOMSULAR.filter((k) => k.kalite === 'C')
    const sirali = [...yeterli].sort((a, b) => {
      const yon = siraYon === 'asc' ? 1 : -1
      const al = a[siraKey as keyof Komsu]
      const bl = b[siraKey as keyof Komsu]
      if (typeof al === 'number' && typeof bl === 'number') return (al - bl) * yon
      return String(al).localeCompare(String(bl), 'tr') * yon
    })
    // Yetersiz örneklemli mahalleler sıralamaya girmez, listenin sonunda
    // "veri yayımlanmadı" satırı olarak kalır (bkz. plan §F yayın eşikleri).
    return [...sirali, ...eksik].map((k) => ({
      id: k.id,
      mahalle:
        k.id === 'feneryolu' ? (
          <span className={styles.rowSelf}>
            {k.mahalle}
            <GlassBadge material="flat" tint="var(--lg-accent)">bu sayfa</GlassBadge>
          </span>
        ) : (
          k.mahalle
        ),
      m2: k.kalite === 'C' ? <span className={styles.suppressed}>—</span> : `${tl(k.m2)} TL`,
      degisim:
        k.kalite === 'C' ? (
          <span className={styles.suppressed}>—</span>
        ) : (
          <span>
            {yuzde(k.degisimNominal)}
            <span className={styles.muted}> · reel {yuzde(k.degisimReel)}</span>
          </span>
        ),
      getiri:
        k.kalite === 'C' ? (
          <span className={styles.suppressed}>—</span>
        ) : (
          <span>
            {tl(k.amortisman)} yıl
            <span className={styles.muted}> · %{bir(k.getiri)}</span>
          </span>
        ),
      trend: <GlassSparkline points={k.seri} label={`${k.mahalle} · son 12 ay medyan m² fiyatı`} width={64} height={22} />,
      ilan: k.kalite === 'C' ? <span className={styles.muted}>{k.ilan} ilan · yetersiz</span> : `${k.ilan}`,
      sure: k.kalite === 'C' ? <span className={styles.suppressed}>—</span> : `${k.sure} gün`,
    }))
  }, [siraKey, siraYon])

  const kirilimTablosu = (rows: KirilimSatiri[], ilkBaslik: string) => (
    <GlassTable
      aria-label={`${ilkBaslik} kırılımı`}
      columns={[
        { key: 'segment', label: ilkBaslik },
        { key: 'm2', label: 'Medyan m²', align: 'end' },
        { key: 'fiyat', label: 'Medyan ilan fiyatı', align: 'end' },
        { key: 'degisim', label: 'Yıllık nominal', align: 'end' },
        { key: 'ilan', label: 'İlan', align: 'end' },
        { key: 'pay', label: 'Pay', align: 'end' },
      ]}
      rows={rows.map((r) => ({ ...r, m2: `${tl(r.m2)} TL` }))}
    />
  )

  return (
    <PublicShell title="Emlak Endeksi" onBack={noop} cta={null}>
      <div className={styles.page}>
        {/* 1 — Breadcrumb + veri kimliği */}
        <div className={styles.topBar}>
          <GlassBreadcrumb
            items={[
              { label: 'Türkiye', onClick: noop },
              { label: 'İstanbul', onClick: noop },
              { label: 'Kadıköy', onClick: noop },
              { label: 'Feneryolu' },
            ]}
          />
          <span className={styles.stamp}>İlan verilerine göre · Temmuz 2026 · aylık güncellenir</span>
        </div>

        {/* 2 — Başlık + tek cümlelik özet */}
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Mahalle endeksi</p>
          <h1 className={styles.title}>Feneryolu Mahallesi satılık konut fiyatları ve emlak endeksi</h1>
          <p className={styles.lede}>
            Feneryolu&apos;nda satılık konutların medyan ilan m² fiyatı <strong>82.500 TL</strong>. Fiyatlar son 12 ayda
            nominal <strong>%34</strong> artarken, TÜFE&apos;den arındırıldığında reel <strong>%2,2</strong> geriledi.
          </p>
        </header>

        {/* Kontrol çubuğu — işlem türü + dönem + baz */}
        <div className={styles.controls}>
          <GlassSegmentedControl
            label="İşlem türü"
            value={islem}
            onChange={(v) => setIslem(v as Islem)}
            options={[
              { value: 'satilik', label: 'Satılık' },
              { value: 'kiralik', label: 'Kiralık' },
            ]}
          />
          <GlassSegmentedControl
            label="Dönem"
            value={donem}
            onChange={(v) => setDonem(v as Donem)}
            options={[
              { value: '1y', label: '1 Yıl' },
              { value: '3y', label: '3 Yıl' },
              { value: '5y', label: '5 Yıl' },
            ]}
          />
          <GlassSegmentedControl
            label="Fiyat bazı"
            value={baz}
            onChange={(v) => setBaz(v as Baz)}
            options={[
              { value: 'nominal', label: 'Nominal' },
              { value: 'reel', label: 'Reel (TÜFE arındırılmış)' },
            ]}
          />
        </div>

        {/* 3 — KPI şeridi: nominal değer, reel ipucunda */}
        <div className={`${styles.card} ${styles.kpiCard}`}>
          <GlassMetricStrip
            label="Feneryolu endeks özeti"
            items={[
              { id: 'm2', label: 'Medyan ilan m² fiyatı', value: '82.500 TL', change: '%34,0', trend: 'up', hint: 'reel −%2,2' },
              { id: 'fiyat', label: 'Medyan ilan fiyatı', value: '8.740.000 TL', change: '%33,1', trend: 'up', hint: 'ortalama 109 m²' },
              { id: 'getiri', label: 'Brüt kira getirisi', value: '%4,9', change: '0,3 puan', trend: 'up', hint: 'amortisman 20 yıl' },
              { id: 'sure', label: 'Ortalama pazarlama süresi', value: '54 gün', change: '6 gün', trend: 'down', hint: 'ilan kapanma hızı' },
            ]}
          />
        </div>

        {/* 4 — Güven ve kapsam bandı: metodolojik uyarı sayfanın dibine saklanmaz */}
        <section aria-labelledby="guven-baslik" className={styles.trust}>
          <GlassScoreMeter value={78} label="Veri güveni" description="A · yüksek" variant="ring" />
          <div className={styles.trustBody}>
            <h2 id="guven-baslik" className={styles.trustTitle}>
              Bu sonuç ne kadar güvenilir?
            </h2>
            <p className={styles.trustText}>
              121 aktif ilanın tekilleştirilmesinden sonra <strong>etkin örneklem 94</strong>. Medyan m² fiyatının %95 güven
              aralığı <strong>79.800 – 85.100 TL</strong>. Son 30 günlük ilanlar kullanıldı; pencere genişletilmedi.
            </p>
          </div>
        </section>

        {/* 5 — Fiyat eğilimi */}
        <section aria-labelledby="egilim-baslik" className={styles.section}>
          <h2 id="egilim-baslik" className={styles.sectionTitle}>
            Konut fiyatları zaman içinde nasıl değişti?
          </h2>
          <GlassTrendChart
            series={seriler}
            valueSuffix=" TL/m²"
            height={260}
            showGrid
            title={baz === 'nominal' ? 'Medyan ilan m² fiyatı — nominal' : 'Medyan ilan m² fiyatı — reel (Temmuz 2026 fiyatlarıyla)'}
          />
          <p className={styles.note}>
            Kesikli çizgiler referans serilerdir. TCMB endeksi hedonik yöntemle ve banka değerleme raporlarından üretilir;
            bizim serimiz ilan verisinden çıkar — aynı şeyi ölçmezler, birlikte okunmak için konur.
          </p>
        </section>

        {/* 6 — Fiyat dağılımı */}
        <section aria-labelledby="dagilim-baslik" className={styles.section}>
          <h2 id="dagilim-baslik" className={styles.sectionTitle}>
            Mahallede fiyatlar hangi aralıkta?
          </h2>
          <GlassDistributionChart
            title="m² fiyatına göre ilan dağılımı"
            bins={DAGILIM}
            markers={PERSENTILLER}
            sampleSize={120}
            countLabel="ilan"
            height={200}
          />
          <p className={styles.note}>
            Vurgulanan sütun medyanın düştüğü banttır. Dağılımın sağ kuyruğu uzun: ortalama medyanın üstünde kalır,
            bu yüzden sayfada ortalama değil <strong>medyan</strong> gösterilir.
          </p>
        </section>

        {/* 8 — Konut özelliği kırılımları */}
        <section aria-labelledby="kirilim-baslik" className={styles.section}>
          <h2 id="kirilim-baslik" className={styles.sectionTitle}>
            Konut özelliklerine göre fiyatlar
          </h2>
          <GlassTabs
            material="flat"
            tabs={[
              { id: 'oda', label: 'Oda sayısı', content: kirilimTablosu(KIRILIM_ODA, 'Oda') },
              { id: 'yas', label: 'Bina yaşı', content: kirilimTablosu(KIRILIM_YAS, 'Bina yaşı') },
            ]}
          />
        </section>

        {/* 9 — Arz ve piyasa hareketi */}
        <section aria-labelledby="arz-baslik" className={styles.section}>
          <h2 id="arz-baslik" className={styles.sectionTitle}>
            İlan piyasası ne kadar hareketli?
          </h2>
          <div className={styles.card}>
            <GlassMetricStrip
              size="sm"
              label="Arz göstergeleri"
              items={[
                { id: 'aktif', label: 'Aktif tekil ilan', value: '121', change: '%8', trend: 'up' },
                { id: 'yeni', label: 'Yeni ilan (30 gün)', value: '34', change: '%12', trend: 'up' },
                { id: 'stok', label: 'Stok oranı', value: '%1,8', hint: 'bölgedeki toplam konuta oran' },
                { id: 'indirim', label: 'Fiyat indirimi yapılan ilan', value: '%22', change: '3 puan', trend: 'up' },
              ]}
            />
          </div>
        </section>

        {/* 10 — Kira getirisi ve yatırım görünümü */}
        <section aria-labelledby="getiri-baslik" className={styles.section}>
          <h2 id="getiri-baslik" className={styles.sectionTitle}>
            Kira getirisi ve yatırım görünümü
          </h2>
          <div className={styles.card}>
            <div className={styles.yield}>
              <div className={styles.yieldMeter}>
                <GlassScoreMeter
                  value={62}
                  label="Likidite skoru"
                  description="Orta — çıkış süresi ilçe ortalamasının altında"
                  variant="ring"
                />
              </div>
              <div className={styles.yieldSpecs}>
                <GlassSpecTable
                  columns={2}
                  items={[
                    { label: 'Brüt kira getirisi', value: '%4,9' },
                    { label: 'Amortisman (brüt)', value: '20 yıl' },
                    { label: 'Kira çarpanı', value: '245 ay' },
                    { label: 'Medyan kira m²', value: '337 TL' },
                  ]}
                />
              </div>
            </div>
          </div>
          <p className={styles.note}>
            Getiri, satılık ve kiralık <strong>ilan</strong> medyanlarının oranıdır — gerçekleşen işlem verisi değildir.
            Aidat, vergi, bakım ve boş kalma düşülmemiştir.
          </p>
        </section>

        {/* 11 — Yakın mahalleler */}
        <section aria-labelledby="komsu-baslik" className={styles.section}>
          <h2 id="komsu-baslik" className={styles.sectionTitle}>
            Kadıköy&apos;deki diğer mahalleler
          </h2>
          <GlassTable
            aria-label="Kadıköy mahalleleri endeks karşılaştırması"
            sortKey={siraKey}
            sortDirection={siraYon}
            onSortChange={(key, yon) => {
              setSiraKey(key)
              setSiraYon(yon)
            }}
            columns={[
              { key: 'mahalle', label: 'Mahalle', sortable: true },
              { key: 'm2', label: 'Medyan m²', align: 'end', sortable: true },
              { key: 'trend', label: '12 ay', align: 'end' },
              { key: 'degisim', label: 'Yıllık değişim', align: 'end', sortable: true },
              { key: 'getiri', label: 'Amortisman · getiri', align: 'end', sortable: true },
              { key: 'ilan', label: 'İlan', align: 'end', sortable: true },
              { key: 'sure', label: 'Pazarlama', align: 'end', sortable: true },
            ]}
            rows={komsuSatirlari}
          />
          <p className={styles.note}>
            Dumlupınar için etkin örneklem 10&apos;un altında — hiçbir fiyat metriği ve trend serisi yayımlanmadı.
            Bekleyen: bu tablonun yanında choropleth harita (<code>GlassChoroplethMap</code>) ve iki yönlü hover bağı.
          </p>
        </section>

        {/* 14 — Metodoloji ve SSS */}
        <section aria-labelledby="yontem-baslik" className={styles.section}>
          <h2 id="yontem-baslik" className={styles.sectionTitle}>
            Bu veriler nasıl hesaplanıyor?
          </h2>
          <GlassDataProvenance
            fieldLabel="Medyan ilan m² fiyatı"
            sourceLabel="ArsaPazar ilan veri tabanı"
            sourceClass="platform_derived"
            retrievedAt="5 Ağustos 2026"
            effectiveAt="Temmuz 2026"
            freshness="current"
            scopeLabel="mahalle"
            geographicResolution="Mahalle (İstanbul · Kadıköy · Feneryolu)"
            method="Tekilleştirilmiş aktif ilanların net m² birim fiyat medyanı; log birim fiyatta IQR ile aykırı değer temizliği"
            methodVersion="v1.0"
            limitations={[
              'İlan (talep edilen) fiyatıdır — gerçekleşen satış fiyatı değildir.',
              'Kalite-ayarlı değildir: ilan karması değiştiğinde seri etkilenebilir.',
              'Reel seri ulusal TÜFE ile arındırılmıştır, bölgesel yaşam maliyeti kullanılmamıştır.',
              'Son iki dönem geçicidir; geç kapanan ilanlar nedeniyle revize edilebilir.',
            ]}
          />
          <GlassAccordion
            items={[
              {
                id: 'ilan-satis',
                title: 'İlan fiyatı ile satış fiyatı arasındaki fark nedir?',
                content: (
                  <p style={{ margin: 0, lineHeight: 1.6 }}>
                    Bu sayfadaki tüm fiyatlar satıcının <strong>talep ettiği</strong> fiyattır. Gerçekleşen satış fiyatı
                    genellikle daha düşüktür. Tapu işlem verimiz olmadığı için pazarlık payı yayımlamıyoruz — yalnızca
                    ilanın yayın süresince yaptığı <strong>fiyat indirimi</strong> oranını gösteriyoruz.
                  </p>
                ),
              },
              {
                id: 'reel',
                title: 'Nominal ve reel değişim neden farklı?',
                content: (
                  <p style={{ margin: 0, lineHeight: 1.6 }}>
                    Nominal değişim TL cinsinden ham artıştır. Reel değişim enflasyondan arındırılmıştır ve{' '}
                    <code>(1 + nominal) / (1 + TÜFE) − 1</code> formülüyle hesaplanır. Feneryolu&apos;nda fiyatlar nominal
                    %34 arttı ama aynı dönemde TÜFE %37 olduğu için satın alma gücü cinsinden %2,2 <strong>geriledi</strong>.
                  </p>
                ),
              },
              {
                id: 'yetersiz',
                title: 'Bazı mahallelerde neden veri göremiyorum?',
                content: (
                  <p style={{ margin: 0, lineHeight: 1.6 }}>
                    Etkin örneklemi 10 ilanın altında kalan mahallelerde hiçbir fiyat metriği yayımlamıyoruz. Az sayıda
                    ilandan üretilen medyan yanıltıcı olur. 10–29 aralığında yalnız geniş bir fiyat aralığı ve güven
                    aralığı gösteriyoruz.
                  </p>
                ),
              },
            ]}
          />
        </section>

        {/* 15 — İç linkleme rafı */}
        <GlassSeoDiscovery
          variant="plain"
          columnCount={3}
          columns={[
            {
              id: 'kadikoy-mahalleleri',
              title: 'Kadıköy mahalleleri',
              href: '/emlak-endeksi/konut/satilik/istanbul/kadikoy',
              hubLabel: 'Kadıköy endeksinin tamamı',
              links: [
                { id: 'goztepe', label: 'Göztepe konut fiyatları', href: '/emlak-endeksi/konut/satilik/istanbul/kadikoy/goztepe', meta: '91.200 TL/m² · 168 ilan' },
                { id: 'caddebostan', label: 'Caddebostan konut fiyatları', href: '/emlak-endeksi/konut/satilik/istanbul/kadikoy/caddebostan', meta: '128.700 TL/m² · 94 ilan' },
                { id: 'erenkoy', label: 'Erenköy konut fiyatları', href: '/emlak-endeksi/konut/satilik/istanbul/kadikoy/erenkoy', meta: '88.400 TL/m² · 143 ilan' },
                { id: 'fikirtepe', label: 'Fikirtepe konut fiyatları', href: '/emlak-endeksi/konut/satilik/istanbul/kadikoy/fikirtepe', meta: '61.300 TL/m² · 52 ilan' },
              ],
            },
            {
              id: 'komsu-ilceler',
              title: 'Komşu ilçeler',
              href: '/emlak-endeksi/konut/satilik/istanbul',
              hubLabel: 'İstanbul ilçe sıralaması',
              links: [
                { id: 'atasehir', label: 'Ataşehir konut fiyatları', href: '/emlak-endeksi/konut/satilik/istanbul/atasehir', meta: '78.900 TL/m²' },
                { id: 'uskudar', label: 'Üsküdar konut fiyatları', href: '/emlak-endeksi/konut/satilik/istanbul/uskudar', meta: '86.400 TL/m²' },
                { id: 'maltepe', label: 'Maltepe konut fiyatları', href: '/emlak-endeksi/konut/satilik/istanbul/maltepe', meta: '64.700 TL/m²' },
              ],
            },
            {
              id: 'ayni-bolge',
              title: 'Feneryolu — diğer görünümler',
              links: [
                { id: 'kiralik', label: 'Feneryolu kiralık konut endeksi', href: '/emlak-endeksi/konut/kiralik/istanbul/kadikoy/feneryolu', meta: 'medyan 337 TL/m²' },
                { id: 'yatirim', label: 'Feneryolu yatırım getirisi analizi', href: '/emlak-endeksi/yatirim-getirisi/istanbul/kadikoy/feneryolu', meta: '%4,9 brüt getiri' },
                { id: '2-arti-1', label: 'Feneryolu 2+1 daire fiyatları', href: '/emlak-endeksi/konut/satilik/istanbul/kadikoy/feneryolu/2-arti-1', meta: '85.100 TL/m² · 48 ilan' },
              ],
            },
          ]}
        />
      </div>
    </PublicShell>
  )
}
