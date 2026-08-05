// Haritaların ortak zemini. Tek kaynak olmasının nedeni tutarlılık değil,
// karşılaştırılabilirlik: ana sayfa hero'su, arama sonucu haritası ve bölge
// rehberi aynı tile setini ve aynı kadraj sınırlarını kullanmazsa kullanıcı
// bir haritadan diğerine geçtiğinde aynı ülkeyi tanıyamaz.
//
// Tile seti açık gri ("light") bir temel haritadır: ilan pinleri zeminden
// ayrışsın diye zemin bilinçli olarak sessizdir. Ton/filtre GlassMap'in
// `tone` ekseninde uygulanır, burada değil.
import type { GlassMapBasemap } from '@repo/ui'

const CARTO_LIGHT_TILE = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

/** Lisans gereği görünür kalması zorunlu atıf — her harita bunu render eder. */
export const BASEMAP_ATTRIBUTION = (
  <>
    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
      © OpenStreetMap
    </a>
    {' · '}
    <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">
      CARTO
    </a>
  </>
)

/** Türkiye'yi kadraja oturtan sınır — sabit zoom dar panelde ülkeyi kırpıyordu. */
export const TURKIYE_BOUNDS: [[number, number], [number, number]] = [
  [35.9, 25.7],
  [42.2, 44.6],
]

export const TURKIYE_CENTER: [number, number] = [39.1, 35.3]

/**
 * Keşif haritalarının zemini: kullanıcı ülkeden ilana kadar inebilsin diye
 * sürüklenebilir ve yakınlaştırılabilir.
 *
 * `minZoom` ülkeden daha uzağa çıkmayı engeller — Türkiye kadrajı dışına
 * çıkıldığında harita boş okyanusa dönüşüyor ve kullanıcı yönünü kaybediyordu.
 */
export const EXPLORE_BASEMAP: GlassMapBasemap = {
  tileUrl: CARTO_LIGHT_TILE,
  attribution: BASEMAP_ATTRIBUTION,
  center: TURKIYE_CENTER,
  zoom: 5.4,
  bounds: TURKIYE_BOUNDS,
  minZoom: 5,
  maxZoom: 18,
  pannable: true,
  tone: 'quiet',
}

/**
 * Tek bir konumu gösteren haritaların zemini (ilan detayı, konum seçici):
 * kadraj o noktaya kilitlidir, kümeleme yoktur.
 */
export function pointBasemap(center: [number, number], zoom = 13): GlassMapBasemap {
  return {
    tileUrl: CARTO_LIGHT_TILE,
    attribution: BASEMAP_ATTRIBUTION,
    center,
    zoom,
    maxZoom: 18,
    pannable: true,
    tone: 'quiet',
  }
}

/** Ham tile şablonu — kendi Leaflet örneğini kuran ekranlar için (konum seçici). */
export const BASEMAP_TILE_URL = CARTO_LIGHT_TILE
