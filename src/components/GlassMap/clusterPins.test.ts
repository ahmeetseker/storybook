import { describe, expect, it } from 'vitest'
import { clusterPoints, isDegenerateBounds, type ClusterPoint } from './clusterPins'

function point(id: string, left: number, top: number, lat = left / 10, lng = top / 10): ClusterPoint {
  return { id, left, top, lat, lng }
}

describe('clusterPoints', () => {
  it('yarıçap içindeki noktaları tek düğümde toplar', () => {
    const nodes = clusterPoints([point('a', 0, 0), point('b', 10, 0), point('c', 400, 400)], 64)
    expect(nodes).toHaveLength(2)
    const cluster = nodes.find((node) => node.memberIds.length > 1)
    expect(cluster?.memberIds.sort()).toEqual(['a', 'b'])
    expect(nodes.find((node) => node.memberIds.length === 1)?.id).toBe('c')
  })

  it('yarıçap dışındaki noktalar ayrı kalır — yaklaştıkça kümeler çözülür', () => {
    const points = [point('a', 0, 0), point('b', 80, 0)]
    expect(clusterPoints(points, 64)).toHaveLength(2)
    // Aynı noktalar daha geniş eşikte tek rozete iner (uzaklaşma karşılığı).
    expect(clusterPoints(points, 120)).toHaveLength(1)
  })

  it('yarıçap 0 verilince hiç kümelenmez, her nokta kendi pinidir', () => {
    const nodes = clusterPoints([point('a', 0, 0), point('b', 1, 1)], 0)
    expect(nodes).toHaveLength(2)
    expect(nodes.every((node) => node.memberIds.length === 1)).toBe(true)
  })

  // Veri sırası (API cevabı, filtre) sonucu değiştirmemeli: rozet aynı yerde
  // aynı sayıyla durmalı, aksi halde her yenilemede harita zıplar.
  it('girdi sırasından bağımsız aynı sonucu verir', () => {
    const points = [point('a', 0, 0), point('b', 10, 5), point('c', 300, 300)]
    const forward = clusterPoints(points, 64)
    const reversed = clusterPoints([...points].reverse(), 64)
    expect(reversed).toEqual(forward)
  })

  it('rozet üyelerin ağırlık merkezine oturur', () => {
    const nodes = clusterPoints([point('a', 0, 0), point('b', 20, 40)], 64)
    expect(nodes).toHaveLength(1)
    expect(nodes[0].left).toBe(10)
    expect(nodes[0].top).toBe(20)
  })

  it('kümenin sınırı bütün üyeleri sarar', () => {
    const nodes = clusterPoints(
      [point('a', 0, 0, 39, 26), point('b', 20, 20, 41, 29)],
      64,
    )
    expect(nodes[0].bounds).toEqual([
      [39, 26],
      [41, 29],
    ])
  })

  it('sonlu olmayan koordinatlar elenir', () => {
    const nodes = clusterPoints(
      [point('a', 0, 0), { id: 'bozuk', left: Number.NaN, top: 0, lat: 1, lng: 1 }],
      64,
    )
    expect(nodes).toHaveLength(1)
    expect(nodes[0].id).toBe('a')
  })
})

describe('isDegenerateBounds', () => {
  it('üst üste binen ilanlarda sınırın çöktüğünü bildirir', () => {
    expect(
      isDegenerateBounds([
        [39, 26],
        [39, 26],
      ]),
    ).toBe(true)
  })

  it('gerçek bir alan kaplayan sınır çökmüş sayılmaz', () => {
    expect(
      isDegenerateBounds([
        [39, 26],
        [41, 29],
      ]),
    ).toBe(false)
  })
})
