// Zoom'a bağlı kümeleme (GlassMap v3). Kümeleme PİKSEL uzayında yapılır: aynı
// coğrafi yarıçap yakınlaştıkça ayrışsın diye eşik ekranda sabit bir mesafedir
// (Leaflet.markercluster'ın `maxClusterRadius` davranışı). Böylece kullanıcı
// yaklaştıkça kümeler kendiliğinden çözülür ve tek tek fiyat pinlerine iner.
//
// Kümeleme DETERMİNİSTİK'tir: aynı girdi sırası her zaman aynı kümeleri verir
// (Math.random YASAK — bkz. GlassMap.tsx başlığı). Sıra bağımlılığını ortadan
// kaldırmak için noktalar önce id'ye göre sıralanır; çağıranın dizi sırası
// (API cevabı, filtre) sonucu değiştirmez.

/** Kümelemeye giren nokta: coğrafi kaynak + o anki piksel izdüşümü. */
export interface ClusterPoint {
  id: string
  lat: number
  lng: number
  left: number
  top: number
}

/** Coğrafi sınır `[[güneyEnlem, batıBoylam], [kuzeyEnlem, doğuBoylam]]`. */
export type LatLngBounds = [[number, number], [number, number]]

/**
 * Kümeleme sonucu. `memberIds.length === 1` ise bu bir küme değil, tekil pindir
 * ve GlassMap onu fiyat kapsülü olarak çizer.
 */
export interface ClusterNode {
  /** Küme için türetilmiş kararlı id, tekil pin için pinin kendi id'si */
  id: string
  /** Kapsayıcıya göre piksel konumu (üyelerin ağırlık merkezi) */
  left: number
  top: number
  /** Kümedeki pin id'leri — tekil pinde tek elemanlı */
  memberIds: string[]
  /** Üyeleri saran coğrafi sınır — kümeye tıklanınca kadraj buraya oturur */
  bounds: LatLngBounds
}

/** Kümenin kendi id'si üyelerinden türetilir: aynı üye kümesi → aynı id. */
function clusterId(memberIds: string[]): string {
  return `lg-cluster:${memberIds[0]}+${memberIds.length}`
}

function boundsOf(members: ClusterPoint[]): LatLngBounds {
  let south = members[0].lat
  let north = members[0].lat
  let west = members[0].lng
  let east = members[0].lng
  for (const member of members) {
    if (member.lat < south) south = member.lat
    if (member.lat > north) north = member.lat
    if (member.lng < west) west = member.lng
    if (member.lng > east) east = member.lng
  }
  return [
    [south, west],
    [north, east],
  ]
}

/**
 * Noktaları ekran üzerinde `radius` pikselden yakın olanları tek rozette
 * toplayacak şekilde kümeler.
 *
 * Yöntem: id'ye göre sıralı tarama; henüz sahiplenilmemiş her nokta yeni bir
 * küme çekirdeği olur ve yarıçap içindeki sahipsiz noktaları toplar. Toplama
 * çekirdeğe göre yapılır (ağırlık merkezine göre değil): merkez kaydıkça
 * kümenin zincirleme büyüyüp haritanın yarısını yutması engellenir.
 *
 * @param points Piksel izdüşümü hesaplanmış noktalar
 * @param radius Aynı kümeye girme eşiği, piksel. 0 veya negatifse kümeleme yapılmaz.
 */
export function clusterPoints(points: ClusterPoint[], radius: number): ClusterNode[] {
  const usable = points.filter(
    (point) =>
      Number.isFinite(point.left) &&
      Number.isFinite(point.top) &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng),
  )
  const ordered = [...usable].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

  if (!(radius > 0)) {
    return ordered.map((point) => ({
      id: point.id,
      left: point.left,
      top: point.top,
      memberIds: [point.id],
      bounds: boundsOf([point]),
    }))
  }

  const radiusSquared = radius * radius
  const claimed = new Set<string>()
  const nodes: ClusterNode[] = []

  for (const seed of ordered) {
    if (claimed.has(seed.id)) continue
    claimed.add(seed.id)
    const members: ClusterPoint[] = [seed]
    for (const candidate of ordered) {
      if (claimed.has(candidate.id)) continue
      const dx = candidate.left - seed.left
      const dy = candidate.top - seed.top
      if (dx * dx + dy * dy <= radiusSquared) {
        claimed.add(candidate.id)
        members.push(candidate)
      }
    }
    const memberIds = members.map((member) => member.id)
    if (members.length === 1) {
      nodes.push({
        id: seed.id,
        left: seed.left,
        top: seed.top,
        memberIds,
        bounds: boundsOf(members),
      })
      continue
    }
    // Rozet üyelerin ağırlık merkezine oturur — çekirdeğin üstünde dursaydı
    // kümenin görsel konumu, hangi noktanın id sırasında önce geldiğine bağlı
    // olurdu ve veri sırası değişince rozet zıplardı.
    let sumLeft = 0
    let sumTop = 0
    for (const member of members) {
      sumLeft += member.left
      sumTop += member.top
    }
    nodes.push({
      id: clusterId(memberIds),
      left: sumLeft / members.length,
      top: sumTop / members.length,
      memberIds,
      bounds: boundsOf(members),
    })
  }

  return nodes
}

/**
 * Sınır kutusunun tek bir noktaya çökmüş olup olmadığı. Üst üste binen
 * ilanlarda `fitBounds` sonsuz yakınlaşmaya gider; çağıran bu durumda
 * kadrajı sabit bir adım yaklaştırmayı seçer (bkz. GlassMap `openCluster`).
 */
export function isDegenerateBounds(bounds: LatLngBounds, epsilon = 1e-4): boolean {
  const [[south, west], [north, east]] = bounds
  return north - south < epsilon && east - west < epsilon
}
