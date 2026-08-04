import { useEffect, useRef, useState, type UIEvent } from 'react'
import { GlassGallery, GlassModal } from '@repo/ui'

import { REPRESENTATIVE_IMAGE_NOTE } from '@/features/listings/data/listing-photos'
import type {
  ListingDetail,
  ListingMediaItem,
  ListingMediaPreview,
} from '../domain/listing-detail-types'
import { formatDate } from '../format'
import styles from './ListingGallery.module.css'

export interface ListingGalleryProps {
  detail: ListingDetail
}

/** Bento ızgarasında kapağın yanında açılan kare sayısı (kapak hariç). */
const TILE_LIMIT = 3

const SHARE_COPIED = 'İlan bağlantısı panoya kopyalandı.'
const SHARE_FAILED = 'Bağlantı kopyalanamadı; adres çubuğundaki adresi paylaşabilirsiniz.'

/** Temsili karesi olan kalem — yalnız bunlar görsel olarak çizilir. */
type PhotoItem = ListingMediaItem & { representative: ListingMediaPreview }

function isPhoto(item: ListingMediaItem): item is PhotoItem {
  return item.representative !== undefined
}

/**
 * Karenin erişilebilir adı.
 *
 * Sıra numarası ada bilinçli olarak girer: yansıtılmış kayıtta bütün kareler
 * aynı nötr etiketi taşır (kare başına künye uydurulmaz), dolayısıyla konum
 * bilgisi olmadan dört buton ekran okuyucuda ayırt edilemezdi. Numara kayıttan
 * gelen bir iddia değil, ızgaradaki yerdir.
 */
function frameLabel(item: ListingMediaItem, index: number, total: number): string {
  return `Görseli büyüt: ${item.label} (temsili) · ${index + 1}/${total}`
}

/** Kalemin künyesi: çekim tarihi ve varsa yapay zekâ düzenleme etiketi. */
function itemMeta(item: ListingMediaItem): string {
  const capture = item.capturedAt
    ? `Çekim: ${formatDate(item.capturedAt)}`
    : 'Çekim tarihi bildirilmedi'
  return item.aiEdited ? `${capture} · yapay zekâ ile düzenlendi` : capture
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" />
  </svg>
)

const ShareIcon = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5" />
    <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
  </svg>
)

/**
 * Görsel karesi olmayan kalemlerin dökümü.
 *
 * Kanıt kuralı (bkz. `rules.md` §1c): parsel görünümü ve plan notu fotoğraf
 * DEĞİLDİR; onlara temsili bir kare iliştirilmez. Buna karşılık kalem
 * gizlenmez de — künyesiyle (tür, çekim tarihi, yapay zekâ etiketi) birlikte
 * derli toplu bir blokta durur.
 */
function MediaInventory({ items, title }: { items: ListingMediaItem[]; title: string }) {
  return (
    <div className={styles.inventory}>
      <p className={styles.inventoryTitle}>{title}</p>
      <ul className={styles.inventoryList}>
        {items.map((item) => (
          <li key={item.id}>
            <span className={styles.inventoryLabel}>{item.label}</span>
            <span className={styles.inventoryMeta}>{itemMeta(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * İlanın hero galerisi — bento ızgarası.
 *
 * Tek markup, iki yerleşim ve kırılma `@container` ile gelir (kap `page`,
 * `PageContainer`), viewport breakpoint'i yoktur:
 *
 * - **Dar kap** — yatay kaydırmalı tek şerit (snap) + sayaç.
 * - **Geniş kap (≥52rem)** — solda büyük kapak, sağda iki küçük kare ve
 *   altlarında geniş bir kare; son karenin üstünde `Tümünü gör (N)` örtüsü.
 *
 * Görseller **temsilidir** — taşınmazın kendi fotoğrafı değildir — ve bu
 * gizlenmez: ızgaranın altında tek kaynaklı cümle (`REPRESENTATIVE_IMAGE_NOTE`)
 * görünür durur. Yalnız `representative` taşıyan kalemler kare olarak çizilir;
 * fotoğraf olmayanlar (parsel görünümü, plan notu) döküm satırı olarak kalır.
 *
 * Yansıtılmış kayıtta kareler **temsili havuzdan çoğaltılır** ama kare başına
 * künye uydurulmaz: hepsi aynı nötr etiketi taşır ve çekim tarihi yazılmaz
 * (bkz. `rules.md` §1c). İlanda bildirilen görsel sayısı kare olarak değil,
 * ızgaranın altındaki künye satırında metin olarak durur.
 *
 * Tam ekran görünüm kütüphaneden gelir: `GlassModal` + `GlassGallery`
 * (kendi ok/thumbnail/klavye sözleşmeleriyle). Bu sayfada yeni bir overlay
 * bileşeni yazılmaz.
 */
export function ListingGallery({ detail }: ListingGalleryProps) {
  const photos = detail.media.filter(isPhoto)
  const others = detail.media.filter((item) => !item.representative)

  const [failed, setFailed] = useState<string[]>([])
  const [openAt, setOpenAt] = useState<number | undefined>(undefined)
  const [slide, setSlide] = useState(0)
  const [saved, setSaved] = useState(false)
  const [shareNote, setShareNote] = useState<string | undefined>(undefined)
  const viewerRef = useRef<HTMLDivElement>(null)

  /**
   * Tam ekran görünümde ok tuşlarıyla gezinme.
   *
   * `GlassGallery` ok tuşlarını yalnız kendi iç lightbox'ında dinler; bizim
   * modalımızın içindeyken gezinme ok **butonlarıyla** yapılır. Dinleyici
   * pencere düzeyindedir (odak modalın neresinde olursa olsun çalışsın diye)
   * ve indeksi kendisi tutmaz: kütüphanenin kendi kontrolünü tetikler, böylece
   * hangi karede olduğumuzun tek kaynağı yine galeridir. Buton yoksa (tek
   * kare) hiçbir şey olmaz.
   */
  useEffect(() => {
    if (openAt === undefined) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
      const label = event.key === 'ArrowRight' ? 'Sonraki görsel' : 'Önceki görsel'
      const control = viewerRef.current?.querySelector<HTMLButtonElement>(
        `button[aria-label="${label}"]`,
      )
      if (!control) return
      event.preventDefault()
      control.click()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openAt])

  const markFailed = (src: string) =>
    setFailed((current) => (current.includes(src) ? current : [...current, src]))
  // Yüklenemeyen kare sessizce kaybolmaz: kategori zeminli yer tutucuya düşer.
  const sourceOf = (preview: ListingMediaPreview) =>
    failed.includes(preview.src) ? preview.fallbackSrc : preview.src

  if (photos.length === 0) {
    // Kayıtta hiç fotoğraf yoksa eski dürüst gerileme korunur: döküm metin
    // olarak, derli toplu bir blokta durur.
    if (detail.media.length === 0) {
      return <p className={styles.inventoryTitle}>Bu kayıtta medya bilgisi bulunmuyor.</p>
    }
    return (
      <MediaInventory
        items={detail.media}
        title="Görsel dosyaları bu kayıtta bulunmuyor. İlanda listelenen medya:"
      />
    )
  }

  const cover = photos[0]
  const tiles = photos.slice(1, TILE_LIMIT + 1)

  /** Şeritte hangi karenin ortada olduğunu kaydırma konumundan okur. */
  const onStripScroll = (event: UIEvent<HTMLDivElement>) => {
    const strip = event.currentTarget
    const width = strip.clientWidth || 1
    const next = Math.max(0, Math.min(photos.length - 1, Math.round(strip.scrollLeft / width)))
    setSlide((current) => (current === next ? current : next))
  }

  const onShare = async () => {
    const url = typeof window === 'undefined' ? '' : window.location.href
    if (typeof navigator !== 'undefined' && navigator.share) {
      // Kullanıcı paylaşımdan vazgeçerse bu bir hata değildir; mesaj yazılmaz.
      try {
        await navigator.share({ title: detail.title, url })
      } catch {
        /* vazgeçildi */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareNote(SHARE_COPIED)
    } catch {
      setShareNote(SHARE_FAILED)
    }
  }

  return (
    <section className={styles.gallery} aria-label="İlan görselleri">
      <div className={styles.viewport}>
        <div
          className={styles.frames}
          data-tiles={tiles.length}
          onScroll={onStripScroll}
        >
          <div className={`${styles.frame} ${styles.cover}`}>
            <button
              type="button"
              className={styles.frameButton}
              onClick={() => setOpenAt(0)}
              aria-label={frameLabel(cover, 0, photos.length)}
            >
              <img
                className={styles.image}
                src={sourceOf(cover.representative)}
                alt={cover.representative.alt}
                onError={() => markFailed(cover.representative.src)}
              />
            </button>

            <span className={styles.number}>{`İlan no ${detail.listingNumber}`}</span>

            {/* İkon-tek kontroller tek bir kapsülde yaşar: fotoğrafın üstünde
                tek cam yüzey açılır, cam üstüne cam gelmez. */}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.action}
                aria-pressed={saved}
                aria-label={saved ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                onClick={() => setSaved((current) => !current)}
              >
                <HeartIcon filled={saved} />
              </button>
              <button
                type="button"
                className={styles.action}
                aria-label="İlan bağlantısını paylaş"
                onClick={onShare}
              >
                <ShareIcon />
              </button>
            </div>
          </div>

          {tiles.map((item, i) => {
            const last = i === tiles.length - 1
            const label = last
              ? `Tüm görselleri gör: ${photos.length} görsel`
              : frameLabel(item, i + 1, photos.length)
            return (
              <div key={item.id} className={`${styles.frame} ${styles.tile}`}>
                <button
                  type="button"
                  className={styles.frameButton}
                  onClick={() => setOpenAt(i + 1)}
                  aria-label={label}
                >
                  <img
                    className={styles.image}
                    src={sourceOf(item.representative)}
                    alt=""
                    loading="lazy"
                    onError={() => markFailed(item.representative.src)}
                  />
                  {/* Örtü dekoratiftir: aynı bilgi butonun erişilebilir
                      adındadır, iç içe buton açılmaz. */}
                  {last ? (
                    <span className={styles.more} aria-hidden="true">
                      {`Tümünü gör (${photos.length})`}
                    </span>
                  ) : null}
                </button>
              </div>
            )
          })}
        </div>

        {/* Sayaç yalnız dar yerleşimdeki şeritte görünür; aynı bilgi kare
            butonlarının adında zaten vardır, bu yüzden dekoratiftir. */}
        {photos.length > 1 ? (
          <p className={styles.counter} aria-hidden="true">
            {`${slide + 1} / ${photos.length}`}
          </p>
        ) : null}
      </div>

      <p className={styles.note}>{REPRESENTATIVE_IMAGE_NOTE}</p>
      {/* İlanda bildirilen görsel sayısı bir KARE değil, künye satırıdır: sayı
          kadar kare çizmek gösterilmeyen dosyaları gösteriliyormuş gibi
          yapardı. Gösterilen kare sayısı da aynı satırda yazılır ki iki sayı
          birbirinin yerine okunmasın (bkz. rules.md §1c). */}
      {detail.declaredMediaCount !== undefined ? (
        <p className={styles.note} data-part="declared-count">
          {`İlanda ${detail.declaredMediaCount} görsel bildirildi; kaydın kendi görselleri bulunmadığı için burada ${photos.length} temsili kare gösteriliyor.`}
        </p>
      ) : null}
      <p className={styles.status} role="status">
        {shareNote}
      </p>

      {others.length > 0 ? (
        <MediaInventory
          items={others}
          title="Bu kayıtta ayrıca görsel dosyası olmayan kalemler listelendi:"
        />
      ) : null}

      {/* Tam ekran görünüm kütüphanenin sözleşmesidir: portal + focus trap +
          scroll kilidi + kapanışta tetikleyiciye focus dönüşü GlassModal'da,
          ok/thumbnail/klavye gezinmesi GlassGallery'de yaşar. Modal panelinin
          kendisi cam olduğu için galerinin sahnesi `flat` verilir. */}
      <GlassModal
        open={openAt !== undefined}
        onClose={() => setOpenAt(undefined)}
        title={`İlan görselleri (${photos.length})`}
        description={REPRESENTATIVE_IMAGE_NOTE}
        size="lg"
      >
        <div ref={viewerRef}>
          <GlassGallery
            images={photos.map((item) => ({
              src: sourceOf(item.representative),
              alt: item.representative.alt,
            }))}
            initialIndex={openAt ?? 0}
            material="flat"
          />
        </div>
      </GlassModal>
    </section>
  )
}
