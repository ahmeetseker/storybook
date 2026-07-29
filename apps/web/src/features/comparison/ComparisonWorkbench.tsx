import { useMemo, useState } from 'react'
import {
  GlassAiSummaryCard,
  GlassButton,
  GlassChip,
  GlassCompareTable,
  GlassEmptyState,
  GlassSelect,
  type GlassCompareField,
} from '@repo/ui'
import { REPRESENTATIVE_IMAGE_NOTE } from '../listings/data/listing-photos'
import {
  createComparisonListings,
  type CompareProperty,
} from './comparison-listing-adapter'
import { PageContainer } from '@/components/PageContainer'
import styles from './ComparisonWorkbench.module.css'

const START: CompareProperty[] = [
  {
    id: 'kozlu',
    title: 'Kozlu Fatih Sitesi 3+1',
    image:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=640&q=82',
    city: 'Zonguldak · Kozlu',
    score: 92,
    risk: 'Düşük',
    verification: 'EİDS + tapu doğrulandı',
    values: {
      konum: 'Zonguldak · Kozlu',
      fiyat: '5.490.000 TL',
      m2: 145,
      m2fiyat: '37.862 TL',
      oda: '3+1',
      kat: '4 / 8',
      yas: 6,
      aidat: '1.450 TL',
      isitma: 'Doğalgaz kombi',
      imar: 'Konut alanı',
      eids: 'Doğrulandı',
    },
  },
  {
    id: 'merkez',
    title: 'Merkez Deniz Manzaralı 3+1',
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=640&q=82',
    city: 'Zonguldak · Merkez',
    score: 86,
    risk: 'Düşük',
    verification: 'EİDS doğrulandı',
    values: {
      konum: 'Zonguldak · Merkez',
      fiyat: '6.200.000 TL',
      m2: 140,
      m2fiyat: '44.286 TL',
      oda: '3+1',
      kat: '7 / 10',
      yas: 3,
      aidat: '2.100 TL',
      isitma: 'Merkezi pay ölçer',
      imar: 'Konut alanı',
      eids: 'Doğrulandı',
    },
  },
  {
    id: 'dubleks',
    title: 'Kozlu Site İçinde 4+1 Dubleks',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=640&q=82',
    city: 'Zonguldak · Kozlu',
    score: 78,
    risk: 'Orta',
    verification: 'Profil doğrulandı',
    values: {
      konum: 'Zonguldak · Kozlu',
      fiyat: '7.900.000 TL',
      m2: 185,
      m2fiyat: '42.703 TL',
      oda: '4+1',
      kat: '5-6 / 6',
      yas: 9,
      aidat: '1.800 TL',
      isitma: 'Doğalgaz kombi',
      imar: 'Konut alanı',
      eids: 'Eksik belge',
    },
  },
]

const FIELDS: GlassCompareField[] = [
  { key: 'konum', label: 'Konum' },
  { key: 'fiyat', label: 'Fiyat', higherIsBetter: false },
  { key: 'm2', label: 'Brüt m²', higherIsBetter: true },
  { key: 'm2fiyat', label: 'm² fiyatı', higherIsBetter: false },
  { key: 'oda', label: 'Oda sayısı' },
  { key: 'kat', label: 'Bulunduğu kat' },
  { key: 'yas', label: 'Bina yaşı', higherIsBetter: false },
  { key: 'aidat', label: 'Aidat', higherIsBetter: false },
  { key: 'isitma', label: 'Isıtma' },
  { key: 'imar', label: 'İmar durumu' },
  { key: 'eids', label: 'EİDS doğrulama' },
]

const SORTS = [
  { value: 'score', label: 'AI uygunluğu' },
  { value: 'price', label: 'En düşük fiyat' },
  { value: 'area', label: 'En geniş alan' },
]

const ROUTE_SORTS = [
  { value: 'selected', label: 'Seçim sırası' },
  ...SORTS,
]

function sortableNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return 0
  return Number(value.replace(/\D/g, ''))
}

export interface ComparisonWorkbenchProps {
  /** URL üzerinden bir kez alınan ilan kimlikleri; undefined demo görünümüdür. */
  initialIds?: string[]
}

export function ComparisonWorkbench({
  initialIds,
}: ComparisonWorkbenchProps) {
  const routeDriven = initialIds !== undefined
  const [items, setItems] = useState<CompareProperty[]>(() =>
    initialIds === undefined
      ? START
      : createComparisonListings(initialIds),
  )
  const [sort, setSort] = useState(
    initialIds === undefined ? 'score' : 'selected',
  )
  const [onlyDiff, setOnlyDiff] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const ordered = useMemo(() => {
    const next = [...items]
    if (sort === 'selected') return next
    if (sort === 'price') {
      return next.sort(
        (left, right) =>
          sortableNumber(left.values.fiyat) -
          sortableNumber(right.values.fiyat),
      )
    }
    if (sort === 'area') {
      return next.sort(
        (left, right) =>
          sortableNumber(right.values.m2) -
          sortableNumber(left.values.m2),
      )
    }
    return next.sort(
      (left, right) =>
        sortableNumber(right.score) - sortableNumber(left.score),
    )
  }, [items, sort])
  const listings = ordered.map(
    ({ id, title, image, imageFallback, values }) => ({
      id,
      title,
      image,
      imageFallback,
      values,
    }),
  )
  const fields = onlyDiff
    ? FIELDS.filter(
        (field) =>
          new Set(
            listings.map((item) =>
              String(item.values[field.key] ?? '—'),
            ),
          ).size > 1,
      )
    : FIELDS

  return (
    <PageContainer className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>KARAR DESTEK WORKSPACE</p>
          <h1>İlanları yalnızca değil, kararınızı karşılaştırın.</h1>
          <p>
            {items.length} mülkü fiyat, imar, güven ve yatırım
            potansiyeliyle yan yana inceleyin.
          </p>
        </div>
        <div className={styles.heroActions}>
          <GlassButton>Paylaş</GlassButton>
          <GlassButton prominent>PDF raporu oluştur</GlassButton>
        </div>
      </header>

      <section className={styles.aiSection}>
        {routeDriven ? (
          <article className={styles.criteria}>
            <p className={styles.eyebrow}>SEÇİLEN İLANLAR</p>
            <strong>Karşılaştırma URL seçiminizden hazırlandı.</strong>
            <p>
              Kaynakta bulunmayan alanlar Bilgi sağlanmadı olarak
              gösterilir.
            </p>
            {/* Metin tek kaynaktan gelir; ilan detayı da aynı cümleyi yazar. */}
            <p>{REPRESENTATIVE_IMAGE_NOTE}</p>
          </article>
        ) : (
          <GlassAiSummaryCard
            summary="Kozlu Fatih Sitesi, daha düşük m² maliyeti ve tam doğrulama nedeniyle bu karşılaştırmada en dengeli seçenek görünüyor. Merkez ilanı daha yeni; dubleks ise daha geniş ancak belge riski taşıyor."
            pros={[
              'En dengeli fiyat / alan oranı: Kozlu Fatih Sitesi',
              'İki ilanda EİDS doğrulaması tamamlandı',
              'Merkez ilanında bina yaşı avantajı',
            ]}
            cons={[
              'Dubleks ilanda eksik doğrulama belgesi',
              'Merkez seçeneğinde daha yüksek m² fiyatı',
            ]}
            confidence={91}
            sourceNote="İlan verisi, doğrulama kayıtları ve bölge sinyalleri"
          />
        )}
        <div className={styles.criteria}>
          <p className={styles.eyebrow}>KRİTERİNİZİ YAZIN</p>
          <div className={styles.criteriaRow}>
            <input
              value={aiInput}
              onChange={(event) => setAiInput(event.target.value)}
              placeholder="Örn. düşük risk ve kira getirisi öncelikli"
            />
            <GlassButton
              size="sm"
              onClick={() =>
                setAiInput('Risk ve kira getirisi kriterleri uygulandı')
              }
            >
              Uygula
            </GlassButton>
          </div>
        </div>
      </section>

      <section
        className={styles.toolbar}
        aria-label="Karşılaştırma kontrolleri"
      >
        <div>
          <strong>{items.length} ilan</strong>
          <span>
            {' · '}
            {onlyDiff ? 'yalnız farklılıklar' : 'tüm özellikler'}
          </span>
        </div>
        <div className={styles.toolbarActions}>
          <GlassChip
            size="sm"
            selected={onlyDiff}
            onSelectedChange={setOnlyDiff}
          >
            Yalnız farklılıklar
          </GlassChip>
          <GlassSelect
            size="sm"
            aria-label="Karşılaştırma sıralaması"
            options={routeDriven ? ROUTE_SORTS : SORTS}
            value={sort}
            onChange={setSort}
          />
        </div>
      </section>

      <section className={styles.tableSection}>
        {items.length > 0 ? (
          <GlassCompareTable
            fields={fields}
            listings={listings}
            highlightDifferences
            onRemove={(id) =>
              setItems((current) =>
                current.filter((item) => item.id !== id),
              )
            }
            aria-label="Enterprise ilan karşılaştırma tablosu"
          />
        ) : (
          <GlassEmptyState
            title={
              routeDriven
                ? 'Seçtiğiniz ilanlar artık bulunamıyor'
                : 'Karşılaştırılacak ilan kalmadı'
            }
            description={
              routeDriven
                ? 'Seçiminizdeki ilanlar güncel kaynakta bulunamadı.'
                : 'Emlak aramasından yeni ilanlar ekleyebilirsiniz.'
            }
            action={<GlassButton prominent>İlan ara</GlassButton>}
          />
        )}
      </section>

      <section
        className={styles.signalGrid}
        aria-label="Güven ve karar sinyalleri"
      >
        {ordered.map((item) => (
          <article key={item.id} className={styles.signalCard}>
            <div>
              <span className={styles.score}>
                {typeof item.score === 'number'
                  ? `%${item.score}`
                  : item.score}
              </span>
              <p>AI uygunluk</p>
            </div>
            <div>
              <strong>{item.title}</strong>
              <span>{item.city}</span>
            </div>
            <dl>
              <div>
                <dt>Risk</dt>
                <dd
                  data-tone={
                    item.risk === 'Düşük'
                      ? 'positive'
                      : item.risk === 'Orta'
                        ? 'caution'
                        : undefined
                  }
                >
                  {item.risk}
                </dd>
              </div>
              <div>
                <dt>Doğrulama</dt>
                <dd>{item.verification}</dd>
              </div>
            </dl>
            <div className={styles.cardActions}>
              <GlassButton size="sm">İlanı aç</GlassButton>
              <GlassButton size="sm">Ofisle görüş</GlassButton>
            </div>
          </article>
        ))}
      </section>
    </PageContainer>
  )
}
