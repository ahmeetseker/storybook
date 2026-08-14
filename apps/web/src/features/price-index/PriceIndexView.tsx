/**
 * Emlak Endeksi görünümü — dört coğrafi seviye TEK şablonu paylaşır.
 * Seviye yalnız hangi blokların render edileceğini belirler (plan §B):
 *   · alt bölge tablosu + iç linkleme → mahalle hariç her seviyede
 *   · benchmark serileri → üst bölgeler, yakından uzağa sıralı
 *
 * Blok sırası sektörde doğrulanmış kalıp: fiyat → güven → eğilim → dağılım →
 * arz → getiri → alt bölgeler → metodoloji → iç linkleme.
 */
import { Fragment, useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  GlassAccordion,
  GlassBadge,
  GlassBarList,
  GlassDataProvenance,
  GlassDistributionChart,
  GlassMetricStrip,
  GlassScoreMeter,
  GlassSegmentedControl,
  GlassSeoDiscovery,
  GlassSparkline,
  GlassSpecTable,
  GlassTable,
  GlassTabs,
  GlassTrendChart,
  type GlassTableSortDirection,
  type GlassTrendSeries,
} from '@repo/ui'
import type {
  BreakdownRow,
  Period,
  PriceBasis,
  PriceIndexResult,
  SubRegionRow,
  TransactionType,
} from './domain/price-index-types'
import { buildPriceIndexHref, type PriceIndexPath } from './data/price-index-adapter'
import { PageContainer } from '@/components/PageContainer'
import { CountUp, Reveal } from './components/IpekMotion'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import styles from './PriceIndexView.module.css'

const tl = (n: number) => n.toLocaleString('tr-TR')
const bir = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const yuzde = (n: number) => `${n > 0 ? '+' : ''}${bir(n)}%`

/** İpek bölüm kicker'ları — sayfa akış sırasına göre Roma rakamı. */
const ROMA = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']

/** Konut özelliği kırılım tablosu — segment medyanları + stok payı. */
function kirilimTablosu(rows: BreakdownRow[], ilkBaslik: string, kiralik: boolean) {
  return (
    <GlassTable
      aria-label={`${ilkBaslik} kırılımı`}
      columns={[
        { key: 'segment', label: ilkBaslik },
        { key: 'm2', label: kiralik ? 'Medyan m² kira' : 'Medyan m²', align: 'end' },
        { key: 'fiyat', label: kiralik ? 'Medyan ilan kirası' : 'Medyan ilan fiyatı', align: 'end' },
        { key: 'degisim', label: 'Yıllık nominal', align: 'end' },
        { key: 'ilan', label: 'İlan', align: 'end' },
        { key: 'pay', label: 'Pay', align: 'end' },
      ]}
      rows={rows.map((r) => ({
        id: r.id,
        segment: r.label,
        m2: `${tl(r.pricePerSqm)} TL`,
        fiyat: `${tl(r.medianPrice)} TL`,
        degisim: yuzde(r.changeNominal),
        ilan: tl(r.listings),
        pay: `%${r.sharePct}`,
      }))}
    />
  )
}

export interface PriceIndexViewProps {
  result: PriceIndexResult
  path: PriceIndexPath
}

export function PriceIndexView({ result, path }: PriceIndexViewProps) {
  const { snapshot, discovery } = result
  const { region } = snapshot
  const navigate = useNavigate()
  const kiralik = path.transactionType === 'kiralik'

  const [donem, setDonem] = useState<Period>('1y')
  const [baz, setBaz] = useState<PriceBasis>('nominal')
  const [siraKey, setSiraKey] = useState('pricePerSqm')
  const [siraYon, setSiraYon] = useState<GlassTableSortDirection>('desc')
  const [arama, setArama] = useState('')

  const seriler = useMemo<GlassTrendSeries[]>(() => {
    const kaynak = snapshot.series[donem][baz]
    return [
      { id: 'own', label: region.name, points: kaynak.own.map((p) => ({ x: p.period, y: p.value })) },
      ...kaynak.benchmarks.map((b) => ({
        id: b.id,
        label: b.label,
        kind: 'benchmark' as const,
        points: b.points.map((p) => ({ x: p.period, y: p.value })),
      })),
    ]
  }, [snapshot.series, donem, baz, region.name])

  const altBolgeler = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr-TR')
    const filtreli = q ? snapshot.subRegions.filter((r) => r.name.toLocaleLowerCase('tr-TR').includes(q)) : snapshot.subRegions
    const yeterli = filtreli.filter((r) => r.quality !== 'INSUFFICIENT')
    const eksik = filtreli.filter((r) => r.quality === 'INSUFFICIENT')
    const yon = siraYon === 'asc' ? 1 : -1
    const sirali = [...yeterli].sort((a, b) => {
      const al = a[siraKey as keyof SubRegionRow]
      const bl = b[siraKey as keyof SubRegionRow]
      if (typeof al === 'number' && typeof bl === 'number') return (al - bl) * yon
      return String(al).localeCompare(String(bl), 'tr') * yon
    })
    return [...sirali, ...eksik]
  }, [snapshot.subRegions, arama, siraKey, siraYon])

  const satirlar = useMemo(
    () =>
      altBolgeler.map((r) => {
        const bos = <span className={styles.suppressed}>—</span>
        return {
          id: r.id,
          name: (
            <Link to={buildPriceIndexHref(path, [...path.segments, r.slug])} className={styles.regionLink}>
              {r.name}
            </Link>
          ),
          pricePerSqm: r.pricePerSqm === null ? bos : `${tl(r.pricePerSqm)} TL`,
          trend: <GlassSparkline points={r.trend} label={`${r.name} · son 12 ay medyan m² fiyatı`} width={64} height={22} />,
          change:
            r.changeNominal === null ? (
              bos
            ) : (
              <span>
                {yuzde(r.changeNominal)}
                <span className={styles.muted}> · reel {yuzde(r.changeReal ?? 0)}</span>
              </span>
            ),
          payback:
            r.paybackYears === null ? (
              bos
            ) : (
              <span>
                {tl(r.paybackYears)} yıl
                <span className={styles.muted}> · %{bir(r.yieldPct ?? 0)}</span>
              </span>
            ),
          fromPeak: r.fromPeak ? (
            <span>
              {r.fromPeak.pct === 0 ? 'zirvede' : yuzde(r.fromPeak.pct)}
              <span className={styles.muted}> · {r.fromPeak.period}</span>
            </span>
          ) : (
            bos
          ),
          listings:
            r.quality === 'INSUFFICIENT' ? (
              <span className={styles.muted}>{tl(r.listings)} ilan · yetersiz</span>
            ) : (
              tl(r.listings)
            ),
        }
      }),
    [altBolgeler, path],
  )

  const yetersiz = snapshot.confidence.grade === 'INSUFFICIENT'
  const baslik = `${region.name} ${path.transactionType === 'satilik' ? 'satılık' : 'kiralık'} konut fiyatları ve emlak endeksi`

  // Bölüm kicker'ları render sırasına göre numaralanır — koşullu bölümlerde
  // (yetersiz veri, mahalle) boşluk kalmaz.
  let bolumNo = 0
  const roma = () => `Bölüm ${ROMA[bolumNo++]}`

  return (
    // Kabuk yolu kapalı: sayfa kendi bölge breadcrumb'ını (il › ilçe › mahalle)
    // taşır — üstüne bir de 'Anasayfa › Emlak Endeksi' basmak çift yol olurdu.
    <PageContainer className={styles.page} breadcrumb={false}>
      {/* 1 — Breadcrumb + veri kimliği */}
      <div className={styles.topBar}>
        <Breadcrumb aria-label="Kategori yolu">
          <BreadcrumbList>
            {region.path.map((p, index) => {
              const last = index === region.path.length - 1
              // Atanın segmentleri: kök (Türkiye) hariç, kendisine kadar olan sluglar.
              const ataSegments = region.path.slice(1, index + 1).map((a) => a.slug)
              return (
                <Fragment key={p.name}>
                  <BreadcrumbItem>
                    {last ? (
                      <BreadcrumbPage>{p.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={buildPriceIndexHref(path, ataSegments)}>{p.name}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!last ? <BreadcrumbSeparator /> : null}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <span className={styles.stamp}>
          İlan verilerine göre · {snapshot.dataAsOf} · {snapshot.updateCadence}
        </span>
      </div>

      {/* 2 — İpek hero: eyebrow → serif başlık → dev numeral → italik standfirst */}
      <header className={styles.hero}>
        <Reveal className={styles.heroInner}>
          <p className={styles.eyebrow}>
            {region.level === 'country' ? 'Türkiye Endeksi' : region.level === 'province' ? 'İl Endeksi' : region.level === 'district' ? 'İlçe Endeksi' : 'Mahalle Endeksi'}
            {' · '}
            {snapshot.dataAsOf}
          </p>
          <h1 className={styles.title}>{baslik}</h1>
          {yetersiz ? (
            <p className={styles.standfirst}>
              {region.name} için etkin örneklem 10&apos;un altında. Az sayıda ilandan üretilen medyan yanıltıcı olacağı
              için <strong>hiçbir fiyat metriği yayımlanmadı</strong>. Üst bölgenin endeksini inceleyebilirsiniz.
            </p>
          ) : (
            <>
              <p className={styles.numeral}>
                <CountUp
                  value={snapshot.headline.medianPricePerSqm.value ?? 0}
                  durationMs={1000}
                  data-testid="hero-medyan"
                />
                <span className={styles.numeralUnit}>TL/m²</span>
              </p>
              <p className={styles.standfirst}>
                {kiralik ? 'Kiralar' : 'Fiyatlar'} son on iki ayda nominal{' '}
                <strong className={styles.pos}>{yuzde(snapshot.change.nominal)}</strong> yükseldi; satın alma gücü
                cinsinden{' '}
                <strong className={snapshot.change.real < 0 ? styles.neg : styles.pos}>
                  {yuzde(snapshot.change.real)}
                </strong>{' '}
                {snapshot.change.real < 0 ? 'geriledi' : 'arttı'}.
              </p>
            </>
          )}
          <hr className={styles.hrule} />
        </Reveal>
      </header>

      {/* Kontrol çubuğu */}
      <div className={styles.controls}>
        <GlassSegmentedControl
          label="İşlem türü"
          value={path.transactionType}
          onChange={(v) => {
            // İşlem türü sayfa state'i değil URL ekseni: aynı bölgenin kiralık
            // endeksi ayrı (paylaşılabilir) bir sayfadır.
            void navigate({ to: buildPriceIndexHref({ ...path, transactionType: v as TransactionType }) })
          }}
          options={[
            { value: 'satilik', label: 'Satılık' },
            { value: 'kiralik', label: 'Kiralık' },
          ]}
        />
        <GlassSegmentedControl
          label="Dönem"
          value={donem}
          onChange={(v) => setDonem(v as Period)}
          options={[
            { value: '1y', label: '1 Yıl' },
            { value: '3y', label: '3 Yıl' },
            { value: '5y', label: '5 Yıl' },
          ]}
        />
        <GlassSegmentedControl
          label="Fiyat bazı"
          value={baz}
          onChange={(v) => setBaz(v as PriceBasis)}
          options={[
            { value: 'nominal', label: 'Nominal' },
            { value: 'reel', label: 'Reel (TÜFE arındırılmış)' },
          ]}
        />
      </div>

      {!yetersiz ? (
        <>
          {/* 3 — Veri bandı: hairline'la ayrılmış dört tipografik nokta (kart yok) */}
          <section aria-labelledby="ozet-baslik" className={styles.band}>
            <h2 id="ozet-baslik" className={styles.srOnly}>
              Endeks özeti
            </h2>
            <Reveal className={styles.bandGrid}>
              <div className={styles.point}>
                <span className={styles.pointKey}>{kiralik ? 'Medyan ilan kirası' : 'Medyan ilan fiyatı'}</span>
                <span className={styles.pointValue}>
                  <CountUp value={snapshot.headline.medianPrice.value ?? 0} />
                </span>
                <span className={styles.pointHint}>TL · ortalama 106 m²</span>
              </div>
              <div className={styles.point}>
                <span className={styles.pointKey}>Brüt kira getirisi</span>
                <span className={styles.pointValue}>
                  %<CountUp value={snapshot.investment.grossYield} decimals={1} />
                </span>
                <span className={styles.pointHint}>amortisman {snapshot.investment.paybackYears} yıl</span>
              </div>
              <div className={styles.point}>
                <span className={styles.pointKey}>Veri güveni</span>
                <span className={styles.pointValue}>
                  <CountUp value={snapshot.confidence.score} />
                  <span className={styles.pointValueSub}>∕100</span>
                </span>
                <span className={styles.pointHint}>etkin örneklem {tl(snapshot.confidence.effectiveSample)}</span>
              </div>
              <div className={styles.point}>
                <span className={styles.pointKey}>Pazarlama süresi</span>
                <span className={styles.pointValue}>
                  <CountUp value={snapshot.headline.daysOnMarket.value ?? 0} />
                  <span className={styles.pointValueSub}> gün</span>
                </span>
                <span className={styles.pointHint}>ilan kapanma hızı</span>
              </div>
            </Reveal>
          </section>

          {/* Bölüm I — Fiyatın seyri */}
          <Reveal as="section" aria-labelledby="seyir-baslik" className={styles.section}>
            <p className={styles.kicker}>{roma()}</p>
            <h2 id="seyir-baslik" className={styles.sectionTitle}>
              Fiyatın on iki aylık seyri
            </h2>
            <div className={styles.wide}>
              <GlassTrendChart
                series={seriler}
                valueSuffix=" TL/m²"
                height={280}
                showGrid
                title={baz === 'nominal' ? 'Medyan ilan m² fiyatı — nominal' : `Medyan ilan m² fiyatı — reel (${snapshot.dataAsOf} fiyatlarıyla)`}
              />
            </div>
            <p className={styles.note}>
              %95 güven aralığı {tl(snapshot.confidence.interval.lower)}–{tl(snapshot.confidence.interval.upper)} TL.{' '}
              {seriler.length > 1
                ? 'Kesikli çizgiler referans serilerdir; kesik yoğunluğu bölgenin uzaklığını gösterir.'
                : snapshot.confidence.windowLabel}
            </p>
          </Reveal>

          {/* 6 — Fiyat dağılımı */}
          <Reveal as="section" aria-labelledby="dagilim-baslik" className={styles.section}>
            <p className={styles.kicker}>{roma()}</p>
            <h2 id="dagilim-baslik" className={styles.sectionTitle}>
              Fiyatlar hangi aralıkta?
            </h2>
            <GlassDistributionChart
              title="m² fiyatına göre ilan dağılımı"
              bins={snapshot.distribution.bins}
              markers={snapshot.distribution.percentiles}
              sampleSize={snapshot.distribution.sampleSize}
              countLabel="ilan"
              height={200}
            />
            <p className={styles.note}>
              Vurgulanan sütun medyanın düştüğü banttır. Dağılımın sağ kuyruğu uzun olduğu için sayfada ortalama değil{' '}
              <strong>medyan</strong> gösterilir.
            </p>
          </Reveal>

          {/* 8 — Konut özelliği kırılımları (oda sayısı · bina yaşı) */}
          <Reveal as="section" aria-labelledby="kirilim-baslik" className={styles.section}>
            <p className={styles.kicker}>{roma()}</p>
            <h2 id="kirilim-baslik" className={styles.sectionTitle}>
              Konut özelliklerine göre fiyatlar
            </h2>
            <GlassTabs
              material="flat"
              tabs={[
                { id: 'oda', label: 'Oda sayısı', content: kirilimTablosu(snapshot.breakdowns.rooms, 'Oda', kiralik) },
                { id: 'yas', label: 'Bina yaşı', content: kirilimTablosu(snapshot.breakdowns.buildingAge, 'Bina yaşı', kiralik) },
              ]}
            />
            <p className={styles.note}>
              Segment medyanları bölge medyanından ayrı hesaplanır; pay, segmentin aktif ilan stoğundaki oranıdır.
            </p>
          </Reveal>

          {/* 9 — Arz ve piyasa hareketi */}
          <Reveal as="section" aria-labelledby="arz-baslik" className={styles.section}>
            <p className={styles.kicker}>{roma()}</p>
            <h2 id="arz-baslik" className={styles.sectionTitle}>
              İlan piyasası ne kadar hareketli?
            </h2>
            <div className={styles.narrow}>
              <GlassMetricStrip
                size="sm"
                label="Arz göstergeleri"
                items={[
                  { id: 'aktif', label: 'Aktif tekil ilan', value: tl(snapshot.supply.activeListings) },
                  { id: 'yeni', label: 'Yeni ilan (30 gün)', value: tl(snapshot.supply.newListings) },
                  { id: 'stok', label: 'Stok oranı', value: `%${bir(snapshot.supply.stockRatio)}`, hint: 'bölgedeki toplam konuta oran' },
                  { id: 'indirim', label: 'Fiyat indirimi yapılan ilan', value: `%${snapshot.supply.priceCutShare}` },
                ]}
              />
            </div>
          </Reveal>

          {/* 10 — Kira getirisi ve yatırım */}
          <Reveal as="section" aria-labelledby="getiri-baslik" className={styles.section}>
            <p className={styles.kicker}>{roma()}</p>
            <h2 id="getiri-baslik" className={styles.sectionTitle}>
              Kira getirisi ve yatırım görünümü
            </h2>
            <div className={`${styles.narrow} ${styles.yield}`}>
              <div className={styles.yieldMeter}>
                <GlassScoreMeter
                  value={snapshot.investment.liquidityScore}
                  label="Likidite skoru"
                  description="Değer artışından ayrı: çıkışın ne kadar kolay olduğu"
                  variant="ring"
                />
              </div>
              <div className={styles.yieldSpecs}>
                <GlassSpecTable
                  columns={2}
                  items={[
                    { label: 'Brüt kira getirisi', value: `%${bir(snapshot.investment.grossYield)}` },
                    { label: 'Amortisman (brüt)', value: `${snapshot.investment.paybackYears} yıl` },
                    { label: 'Kira çarpanı', value: `${snapshot.investment.rentMultiplier} ay` },
                    { label: 'Medyan kira m²', value: `${tl(snapshot.investment.medianRentPerSqm)} TL` },
                  ]}
                />
              </div>
            </div>
            <p className={styles.note}>
              Getiri, satılık ve kiralık <strong>ilan</strong> medyanlarının oranıdır — gerçekleşen işlem verisi değildir.
              Aidat, vergi, bakım ve boş kalma düşülmemiştir.
            </p>
          </Reveal>
        </>
      ) : null}

      {/* 12 — Demografi: fiyattan bağımsız resmî veridir, yetersiz örneklemli
          bölgede de gösterilir — "veri yok" sayfasında bile bölge anlatılır. */}
      <Reveal as="section" aria-labelledby="demografi-baslik" className={styles.section}>
        <p className={styles.kicker}>{roma()}</p>
        <h2 id="demografi-baslik" className={styles.sectionTitle}>
          Bölgede kim yaşıyor?
        </h2>
        <div className={styles.narrow}>
          <GlassMetricStrip
            size="sm"
            label={`${region.name} demografik özeti`}
            items={[
              { id: 'nufus', label: 'Nüfus', value: tl(snapshot.demographics.population) },
              { id: 'yas', label: 'Ortalama yaş', value: bir(snapshot.demographics.averageAge) },
              {
                id: 'cinsiyet',
                label: 'Cinsiyet dağılımı',
                value: `%${bir(snapshot.demographics.femalePct)} kadın`,
                hint: `%${bir(snapshot.demographics.malePct)} erkek`,
              },
              {
                id: 'medeni',
                label: 'Medeni durum',
                value: `%${snapshot.demographics.marriedPct} evli`,
                hint: `%${snapshot.demographics.singlePct} bekar`,
              },
            ]}
          />
          <div className={styles.demoGrid}>
            <div>
              <h3 className={styles.demoTitle}>Yaş dağılımı</h3>
              <GlassBarList
                label="Yaş dağılımı"
                items={snapshot.demographics.ageBands.map((b) => ({ id: b.id, label: b.label, value: b.pct }))}
              />
            </div>
            <div>
              <h3 className={styles.demoTitle}>Eğitim durumu</h3>
              <GlassBarList
                label="Eğitim durumu"
                tint="var(--lg-warning)"
                items={snapshot.demographics.education.map((b) => ({ id: b.id, label: b.label, value: b.pct }))}
              />
            </div>
          </div>
          {snapshot.demographics.subRegionPopulation.items.length ? (
            <div className={styles.demoSub}>
              <h3 className={styles.demoTitle}>
                {snapshot.demographics.subRegionPopulation.label.charAt(0).toLocaleUpperCase('tr-TR') +
                  snapshot.demographics.subRegionPopulation.label.slice(1)}
              </h3>
              <GlassBarList
                label={snapshot.demographics.subRegionPopulation.label}
                scale="max"
                formatValue={(v) => tl(v)}
                items={snapshot.demographics.subRegionPopulation.items.map((i) => ({
                  id: i.id,
                  label: i.label,
                  value: i.population,
                  prominent: i.prominent,
                }))}
              />
            </div>
          ) : null}
        </div>
        <p className={styles.note}>
          Demografik veriler <strong>{snapshot.demographics.sourceLabel}</strong> kaynaklıdır; fiyat serilerinden
          bağımsızdır ve yılda bir güncellenir. Vurgulu satır bu sayfanın bölgesidir.
        </p>
      </Reveal>

      {/* 11 — Alt bölge sıralaması (mahalle seviyesinde render edilmez) */}
      {snapshot.subRegions.length ? (
        <Reveal as="section" aria-labelledby="alt-baslik" className={styles.section}>
          <p className={styles.kicker}>{roma()}</p>
          <h2 id="alt-baslik" className={styles.sectionTitle}>
            {region.name} {snapshot.subRegionLabel.toLocaleLowerCase('tr-TR')} fiyat sıralaması
          </h2>
          {/* Sayfalama yok — üç rakip sitenin de kararı; yerine tablo içi arama (plan §C.7a) */}
          <div className={styles.tableSearch}>
            <input
              type="search"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder={`${snapshot.subRegionLabel} içinde ara…`}
              aria-label={`${snapshot.subRegionLabel} içinde ara`}
            />
            <span className={styles.tableCount}>
              {altBolgeler.length} / {snapshot.subRegions.length}
            </span>
          </div>
          <GlassTable
            aria-label={`${region.name} ${snapshot.subRegionLabel.toLocaleLowerCase('tr-TR')} endeks karşılaştırması`}
            sortKey={siraKey}
            sortDirection={siraYon}
            onSortChange={(key, yon) => {
              setSiraKey(key)
              setSiraYon(yon)
            }}
            columns={[
              { key: 'name', label: snapshot.subRegionLabel, sortable: true },
              { key: 'pricePerSqm', label: 'Medyan m²', align: 'end', sortable: true },
              { key: 'trend', label: '12 ay', align: 'end' },
              { key: 'change', label: 'Yıllık değişim', align: 'end', sortable: true },
              { key: 'payback', label: 'Amortisman · getiri', align: 'end', sortable: true },
              { key: 'fromPeak', label: 'Zirveye uzaklık', align: 'end', sortable: true },
              { key: 'listings', label: 'İlan', align: 'end', sortable: true },
            ]}
            rows={satirlar}
          />
          <p className={styles.note}>
            Etkin örneklemi 10&apos;un altında kalan bölgelerde hiçbir fiyat metriği ve trend serisi yayımlanmaz.
            <strong> Zirveye uzaklık</strong>, bölgenin kendi tarihsel zirvesine göre bugünkü konumudur.
          </p>
        </Reveal>
      ) : null}

      {/* 14 — Metodoloji ve SSS */}
      <Reveal as="section" aria-labelledby="yontem-baslik" className={styles.section}>
        <p className={styles.kicker}>{roma()}</p>
        <h2 id="yontem-baslik" className={styles.sectionTitle}>
          Bu veriler nasıl hesaplanıyor?
        </h2>
        <GlassDataProvenance
          fieldLabel="Medyan ilan m² fiyatı"
          sourceLabel="ArsaPazar ilan veri tabanı"
          sourceClass="platform_derived"
          retrievedAt="5 Ağustos 2026"
          effectiveAt={snapshot.dataAsOf}
          freshness="current"
          scopeLabel={region.level === 'neighborhood' ? 'mahalle' : region.level === 'district' ? 'ilçe' : 'il'}
          geographicResolution={region.path.map((p) => p.name).join(' · ')}
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
                  Bu sayfadaki tüm fiyatlar satıcının <strong>talep ettiği</strong> fiyattır. Tapu işlem verimiz olmadığı
                  için pazarlık payı yayımlamıyoruz — yalnızca ilanın yayın süresince yaptığı{' '}
                  <strong>fiyat indirimi</strong> oranını gösteriyoruz.
                </p>
              ),
            },
            {
              id: 'reel',
              title: 'Nominal ve reel değişim neden farklı?',
              content: (
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  Reel değişim <code>(1 + nominal) / (1 + TÜFE) − 1</code> formülüyle hesaplanır. {region.name}&apos;de
                  fiyatlar nominal {yuzde(snapshot.change.nominal)} arttı ama aynı dönemde TÜFE %{bir(snapshot.change.cpi)}{' '}
                  olduğu için satın alma gücü cinsinden {yuzde(snapshot.change.real)}{' '}
                  <strong>{snapshot.change.real < 0 ? 'geriledi' : 'arttı'}</strong>.
                </p>
              ),
            },
            {
              id: 'yetersiz',
              title: 'Bazı bölgelerde neden veri göremiyorum?',
              content: (
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  Etkin örneklemi 10 ilanın altında kalan bölgelerde hiçbir fiyat metriği yayımlamıyoruz. 10–29 aralığında
                  yalnız geniş bir fiyat aralığı ve güven aralığı gösteriyoruz.
                </p>
              ),
            },
          ]}
        />
      </Reveal>

      {/* 15 — İç linkleme rafı */}
      <GlassSeoDiscovery
        variant="plain"
        columnCount={3}
        columns={discovery.map((c) => ({
          id: c.id,
          title: c.title,
          href: c.href,
          hubLabel: c.hubLabel,
          links: c.links,
        }))}
      />
    </PageContainer>
  )
}

/** Yetersiz veri rozetiyle bölge adı — tabloda ve başlıkta ortak kullanım. */
export function RegionBadge({ label }: { label: string }) {
  return (
    <span className={styles.rowSelf}>
      {label}
      <GlassBadge material="flat" tint="var(--lg-accent)">
        bu sayfa
      </GlassBadge>
    </span>
  )
}
