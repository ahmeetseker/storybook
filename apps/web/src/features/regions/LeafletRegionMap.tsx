import { useEffect, useRef, useState } from 'react'
import type { RegionSummary } from './domain/region-types'
import styles from './LeafletRegionMap.module.css'

interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap
  remove(): void
  invalidateSize(): void
  on(event: string, handler: () => void): LeafletMap
}
interface LeafletMarker { addTo(map: LeafletMap): LeafletMarker; bindPopup(content: string): LeafletMarker; on(event: string, handler: () => void): LeafletMarker; setStyle?(style: Record<string, string>): LeafletMarker }
interface LeafletApi { map(element: HTMLElement, options?: Record<string, unknown>): LeafletMap; tileLayer(url: string, options: Record<string, unknown>): { addTo(map: LeafletMap): void }; circleMarker(latLng: [number, number], options: Record<string, unknown>): LeafletMarker }
declare global { interface Window { L?: LeafletApi } }

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_SCRIPT = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
let loader: Promise<LeafletApi> | undefined
function loadLeaflet(): Promise<LeafletApi> { if (window.L) return Promise.resolve(window.L); if (loader) return loader; loader = new Promise((resolve, reject) => { if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) { const link = document.createElement('link'); link.rel='stylesheet'; link.href=LEAFLET_CSS; document.head.appendChild(link) } const existing = document.querySelector<HTMLScriptElement>(`script[src="${LEAFLET_SCRIPT}"]`); if (existing) { existing.addEventListener('load', () => window.L ? resolve(window.L) : reject(new Error('Leaflet yüklenemedi'))); existing.addEventListener('error', () => reject(new Error('Leaflet script yüklenemedi'))); return } const script = document.createElement('script'); script.src=LEAFLET_SCRIPT; script.async=true; script.onload=()=>window.L ? resolve(window.L) : reject(new Error('Leaflet yüklenemedi')); script.onerror=()=>reject(new Error('Leaflet script yüklenemedi')); document.head.appendChild(script) }); return loader }

export interface LeafletRegionMapProps { regions: RegionSummary[]; selectedId?: string; onSelect(id: string): void; }
export function LeafletRegionMap({ regions, selectedId, onSelect }: LeafletRegionMapProps) { const rootRef=useRef<HTMLDivElement>(null); const mapRef=useRef<LeafletMap | undefined>(undefined); const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading'); useEffect(()=>{ let disposed=false; void loadLeaflet().then((L)=>{ if(disposed||!rootRef.current) return; const map=L.map(rootRef.current,{zoomControl:false,scrollWheelZoom:true,attributionControl:true}).setView([39.0,35.2],5.5); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map); mapRef.current=map; regions.forEach((region)=>{ const marker=L.circleMarker([region.coordinates.lat,region.coordinates.lng],{radius:Math.max(8,Math.min(17,8+region.activeListings/40)),color:'var(--lg-accent)',weight:2,fillColor:'var(--lg-accent)',fillOpacity:.9}); marker.bindPopup(`<strong>${region.title}</strong><br>${region.activeListings} aktif ilan<br>${region.pricePerSqm.toLocaleString('tr-TR')} ₺/m²`).addTo(map).on('click',()=>onSelect(region.id)) }); setStatus('ready'); setTimeout(()=>map.invalidateSize(),0) }).catch(()=>{ if(!disposed) setStatus('error') }); return ()=>{disposed=true; mapRef.current?.remove(); mapRef.current=undefined} },[onSelect,regions]); useEffect(()=>{ if(!mapRef.current||!selectedId) return; const selected=regions.find((region)=>region.id===selectedId); if(selected) mapRef.current.setView([selected.coordinates.lat,selected.coordinates.lng],8) },[regions,selectedId]); return <div className={styles.root} aria-label="OpenStreetMap bölge haritası"><div ref={rootRef} className={styles.map}/>{status==='loading'?<div className={styles.status}>Harita yükleniyor…</div>:null}{status==='error'?<div className={styles.status}>Harita yüklenemedi. Liste görünümünü kullanabilirsiniz.</div>:null}<div className={styles.attributionNote}>OpenStreetMap · Leaflet</div></div> }
