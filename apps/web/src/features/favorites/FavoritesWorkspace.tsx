import { useMemo, useState } from 'react'
import { GlassAiSummaryCard, GlassButton, GlassChip, GlassCompareBar, GlassDrawer, GlassEmptyState, GlassListingCard, GlassPersonalNote, GlassRibbon, GlassSelect, type GlassListingCardStatus } from '@repo/ui'
import { LISTING_FIXTURES } from '../listings/data/listing-adapter'
import type { ListingSummary } from '../listings/data/listing-adapter'
import { PageContainer } from '@/components/PageContainer'
import styles from './FavoritesWorkspace.module.css'

type FavoriteFilter = 'all' | 'price-drop' | 'new' | 'verified'
const SORTS = [{ value:'recent', label:'En son eklenen' }, { value:'price', label:'En düşük fiyat' }, { value:'area', label:'En geniş alan' }]
const FAVORITE_IDS = LISTING_FIXTURES.slice(0, 8).map((item) => item.id)
const PRICE_DROPS = new Set(FAVORITE_IDS.filter((_, index) => index === 1 || index === 4))
const sayi = (value: number) => value.toLocaleString('tr-TR')

/**
 * Favori kartı /emlak ızgarasıyla AYNI ilan kartını kullanır
 * (GlassListingCard `propertyOverlay`): poster görsel, doğrulama köşe
 * kurdelesi, opak statü kapsülleri, alt künye. Favorilere özgü işlevler kart
 * dilini bozmadan iki yerde yaşar: sağ üst kalp (favoriden hızlı çıkarma,
 * ızgara kartıyla aynı glif) ve kartın altına bağlı aksiyon şeridi
 * (kişisel not + karşılaştır + favoriden çıkar).
 */
function FavoriteCard({ listing, priceDrop, compared, onSelect, onRemove, onCompare }: { listing: ListingSummary; priceDrop: boolean; compared: boolean; onSelect(): void; onRemove(): void; onCompare(): void }) {
  // Doğrulama kurdele, geri kalan her statü opak kapsül (kart standardı,
  // 2026-08-13): 'İnceleniyor' uyarı, 'Fiyat düştü' olumlu tonda.
  const statuses: GlassListingCardStatus[] = [
    ...(listing.verified ? [] : [{ label: 'İnceleniyor', tone: 'warning' as const }]),
    ...(priceDrop ? [{ label: 'Fiyat düştü', tone: 'success' as const }] : []),
  ]
  const price = `${sayi(listing.price)} TL${listing.transaction === 'rent' ? ' / ay' : ''}`
  return (
    <article className={styles.card} aria-label={`${listing.title} favorisi`}>
      <div className={styles.cardShell}>
        <GlassListingCard
          variant="propertyOverlay"
          material="flat"
          image={{ src: listing.image.src, alt: listing.image.alt }}
          badge={listing.verified ? <GlassRibbon label="Doğrulanmış" note="Temsili görsel" /> : undefined}
          badgePlacement="corner"
          statuses={statuses.length > 0 ? statuses : undefined}
          pricePrefix={listing.transaction === 'sale' ? 'Liste:' : 'Kira:'}
          price={price}
          title={listing.title}
          location={`${listing.city.toLocaleUpperCase('tr-TR')} · ${listing.district.toLocaleUpperCase('tr-TR')}`}
          metrics={[
            { value: `${sayi(listing.area)} m²`, label: 'Alan' },
            { value: `${sayi(listing.unitPrice)} TL`, label: 'm² fiyatı' },
          ]}
          seller={listing.sellerName}
          listedAt={`${listing.publishedDays} gün önce`}
          onClick={onSelect}
          style={{ width: '100%' }}
        />
        {/* Kart tek bir <button> olduğundan kalp kabukta yaşar (buton içinde
            buton olmaz — GlassListingCard rules.md §1); /emlak ızgara
            kabuğuyla aynı desen ve aynı kalp glifi. */}
        <span className={styles.overlayActions} aria-label="Favori eylemleri">
          <button
            type="button"
            aria-label="Favorilerden çıkar"
            aria-pressed
            title="Favorilerden çıkar"
            onClick={onRemove}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20.2 4.9 13.3a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.7 0l.4.4.4-.4a4.8 4.8 0 0 1 6.7 0 4.6 4.6 0 0 1 0 6.6Z" />
            </svg>
          </button>
        </span>
      </div>
      <div className={styles.cardFooter}>
        <GlassPersonalNote defaultValue="" placeholder="Bu ilan hakkında özel not al" />
        <div className={styles.cardActions}>
          <GlassButton size="sm" aria-pressed={compared} onClick={onCompare}>{compared ? 'Karşılaştırmada' : 'Karşılaştır'}</GlassButton>
          <button type="button" className={styles.removeButton} onClick={onRemove}>Favoriden çıkar</button>
        </div>
      </div>
    </article>
  )
}

function DetailPanel({ listing, onClose }: { listing?: ListingSummary; onClose(): void }) { if (!listing) return null; return <aside className={styles.detail}><div className={styles.detailHeading}><div><p className={styles.eyebrow}>İLAN DETAYI</p><h2>{listing.title}</h2></div><button type="button" className={styles.closeButton} onClick={onClose} aria-label="İlan detayını kapat">×</button></div><img className={styles.detailImage} src={listing.image.src} alt={listing.image.alt}/><p className={styles.detailLocation}>{listing.city} · {listing.district}</p><strong className={styles.detailPrice}>{listing.price.toLocaleString('tr-TR')} TL</strong><dl className={styles.detailFacts}><div><dt>Alan</dt><dd>{listing.area.toLocaleString('tr-TR')} m²</dd></div><div><dt>m² fiyatı</dt><dd>{listing.unitPrice.toLocaleString('tr-TR')} TL</dd></div><div><dt>İlan yaşı</dt><dd>{listing.publishedDays} gün</dd></div><div><dt>Doğrulama</dt><dd>{listing.verified ? 'EİDS doğrulandı' : 'İnceleme bekliyor'}</dd></div></dl><div className={styles.detailActions}><GlassButton prominent>İlanı aç</GlassButton><GlassButton>Ofisle görüş</GlassButton></div></aside> }

export function FavoritesWorkspace() { const [filter,setFilter]=useState<FavoriteFilter>('all'); const [sort,setSort]=useState('recent'); const [savedIds,setSavedIds]=useState(FAVORITE_IDS); const [selectedId,setSelectedId]=useState<string>(); const [compareIds,setCompareIds]=useState<string[]>([]); const saved=LISTING_FIXTURES.filter((item)=>savedIds.includes(item.id)); const filtered=useMemo(()=>saved.filter((item)=>filter==='all'||filter==='verified'&&item.verified||filter==='price-drop'&&PRICE_DROPS.has(item.id)||filter==='new'&&item.publishedDays<=3).sort((a,b)=>sort==='price'?a.price-b.price:sort==='area'?b.area-a.area:a.publishedDays-b.publishedDays),[saved,filter,sort]); const selected=saved.find((item)=>item.id===selectedId); const remove=(id:string)=>setSavedIds((ids)=>ids.filter((item)=>item!==id)); return <PageContainer className={styles.page}><header className={styles.hero}><div><p className={styles.eyebrow}>KİŞİSEL PORTFÖY</p><h1>Favorilerinizi karar listesine dönüştürün.</h1><p>Kaydettiğiniz ilanları fiyat değişimleri, doğrulama durumu ve AI önceliğiyle takip edin.</p></div><div className={styles.heroActions}><GlassButton>Aramaya git</GlassButton><GlassButton prominent>Yeni alarm oluştur</GlassButton></div></header><section className={styles.metrics}><div><strong>{saved.length}</strong><span>toplam favori</span></div><div><strong>{saved.filter((item)=>PRICE_DROPS.has(item.id)).length}</strong><span>fiyatı değişen</span></div><div><strong>{saved.filter((item)=>item.verified).length}</strong><span>doğrulanmış</span></div><div><strong>{saved.filter((item)=>item.publishedDays<=3).length}</strong><span>yeni ilan</span></div></section><section className={styles.ai}><GlassAiSummaryCard summary="Favorileriniz içinde Urla ilanı en düşük m² maliyetine, Kadıköy ilanı ise en yüksek talep sinyaline sahip. Fiyatı düşen ilanları ve doğrulaması tamamlananları önce incelemeniz önerilir." pros={['2 ilanda fiyat avantajı oluştu','Doğrulaması tamamlanan ilanlar ayrıştırıldı']} cons={['1 ilanda belge incelemesi sürüyor']} confidence={89} sourceNote="Favori listeniz ve ilan verilerinden üretildi"/><div className={styles.alertCard}><p className={styles.eyebrow}>TAKİP ÖNERİSİ</p><strong>Fiyatı düşen ilanları kaçırmayın</strong><span>Yeni değişiklik olduğunda size bildirelim.</span><GlassButton size="sm" prominent>Alarmı etkinleştir</GlassButton></div></section><section className={styles.toolbar}><div className={styles.tabs} aria-label="Favori filtreleri">{[['all','Tümü'],['price-drop','Fiyatı değişen'],['new','Yeni eklenen'],['verified','Doğrulanmış']] .map(([value,label])=><GlassChip key={value} selected={filter===value} onSelectedChange={()=>setFilter(value as FavoriteFilter)}>{label}</GlassChip>)}</div><GlassSelect size="sm" aria-label="Favori sıralaması" options={SORTS} value={sort} onChange={setSort}/></section>{filtered.length===0?<GlassEmptyState title="Bu görünümde ilan yok" description="Filtreyi değiştirerek favorilerinizi genişletebilirsiniz." action={<GlassButton onClick={()=>setFilter('all')}>Tüm favorileri göster</GlassButton>}/>:<section className={styles.grid} aria-label="Favori ilanlar">{filtered.map((listing)=><FavoriteCard key={listing.id} listing={listing} priceDrop={PRICE_DROPS.has(listing.id)} compared={compareIds.includes(listing.id)} onSelect={()=>setSelectedId(listing.id)} onRemove={()=>remove(listing.id)} onCompare={()=>setCompareIds((ids)=>ids.includes(listing.id)?ids.filter((id)=>id!==listing.id):ids.length<3?[...ids,listing.id]:ids)}/>)}</section>}<GlassCompareBar items={saved.filter((item)=>compareIds.includes(item.id)).map((item)=>({id:item.id,title:item.title,image:item.image.src}))} maxItems={3} onRemove={(id)=>setCompareIds((ids)=>ids.filter((item)=>item!==id))} onClear={()=>setCompareIds([])} onCompare={()=>{}}/><GlassDrawer open={Boolean(selected)} onClose={()=>setSelectedId(undefined)} title="Favori ilan detayı" side="right" size="lg"><DetailPanel listing={selected} onClose={()=>setSelectedId(undefined)}/></GlassDrawer></PageContainer> }
