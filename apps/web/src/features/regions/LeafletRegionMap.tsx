// Bölge rehberinin haritası. Artık kendi Leaflet örneğini kurmuyor: tüm
// haritalar `GlassMap` üzerinden aynı zemini, aynı pin dilini ve aynı iniş
// mantığını paylaşır (ülke → bölge → ilan).
//
// Eski uygulama marker rengini `color: 'var(--lg-accent)'` diye veriyordu;
// CSS değişkeni SVG attribute'una yazılamaz, bu yüzden daireler token rengiyle
// değil tarayıcı varsayılanıyla çiziliyordu. `GlassMap` pinleri gerçek DOM
// butonları olduğu için renk tasarım sisteminden gelir (bkz. useBasemap.ts).
import { useMemo } from 'react'
import { GlassMap } from '@repo/ui'
import { EXPLORE_BASEMAP } from '@/config/basemap'
import type { RegionSummary } from './domain/region-types'
import styles from './LeafletRegionMap.module.css'

export interface LeafletRegionMapProps {
  regions: RegionSummary[]
  selectedId?: string
  onSelect(id: string): void
}

export function LeafletRegionMap({ regions, selectedId, onSelect }: LeafletRegionMapProps) {
  // Her bölge kendi aktif ilan sayısıyla bir yoğunluk rozetidir. Birbirine
  // yakın bölgeler ülke kadrajında tek rozette toplanır; yaklaştıkça ayrışır.
  const pins = useMemo(
    () =>
      regions.map((region) => ({
        id: region.id,
        lat: region.coordinates.lat,
        lng: region.coordinates.lng,
        // Zemin yüklenemezse şematik yüzeye düşülür.
        x: region.coordinates.x,
        y: region.coordinates.y,
        count: region.activeListings,
      })),
    [regions],
  )

  return (
    <div className={styles.root}>
      <GlassMap
        className={styles.map}
        variant="panel"
        label="Bölge yoğunluk haritası"
        pins={pins}
        basemap={EXPLORE_BASEMAP}
        cluster
        selectedId={selectedId ?? null}
        // Rozet açıldığında kadraj o bölgeye iner; tek bölgeye inildiğinde
        // sağdaki içgörü paneli de o bölgeye geçer — harita ile panel aynı
        // seçimi gösterir.
        onClusterOpen={(memberIds) => {
          if (memberIds.length === 1) onSelect(memberIds[0])
        }}
      />
    </div>
  )
}
