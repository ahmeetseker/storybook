// Karşılaştır (/karsilastir) — kaydedilen ilanların yan yana kıyası.
// GlassCompareTable'ın sayfa bağlamı; gap raporu sayfa eksiği: "Karşılaştır akışı yok".
import { useState } from 'react'
import { GlassCompareTable, type GlassCompareListing } from '../components/GlassCompareTable'
import { GlassEmptyState } from '../components/GlassEmptyState'
import { GlassButton } from '../components/GlassButton'
import { placeholderImage } from '../demo/placeholderImage'
import { PublicShell } from './shared/shells'

const noop = () => {}

const alanlar = [
  { key: 'fiyat', label: 'Fiyat', higherIsBetter: false },
  { key: 'm2', label: 'Brüt m²', higherIsBetter: true },
  { key: 'm2fiyat', label: 'm² Fiyatı', higherIsBetter: false },
  { key: 'oda', label: 'Oda Sayısı' },
  { key: 'kat', label: 'Bulunduğu Kat' },
  { key: 'yas', label: 'Bina Yaşı', higherIsBetter: false },
  { key: 'aidat', label: 'Aidat', higherIsBetter: false },
  { key: 'isitma', label: 'Isıtma' },
  { key: 'eids', label: 'EİDS Doğrulama' },
]

const baslangicIlanlari: GlassCompareListing[] = [
  {
    id: 'kozlu',
    title: "Kozlu Fatih Sitesi 3+1",
    image: placeholderImage('Kozlu', '#7a5a3a', '#4a331c', 320, 200),
    values: {
      fiyat: '5.490.000 TL', m2: 145, m2fiyat: '37.862 TL', oda: '3+1',
      kat: '4 / 8', yas: 6, aidat: '1.450 TL', isitma: 'Doğalgaz Kombi', eids: '✓ Doğrulandı',
    },
  },
  {
    id: 'merkez',
    title: 'Merkez Deniz Manzaralı 3+1',
    image: placeholderImage('Merkez', '#3a7a8a', '#1f4a5f', 320, 200),
    values: {
      fiyat: '6.200.000 TL', m2: 140, m2fiyat: '44.286 TL', oda: '3+1',
      kat: '7 / 10', yas: 3, aidat: '2.100 TL', isitma: 'Merkezi (Pay Ölçer)', eids: '✓ Doğrulandı',
    },
  },
  {
    id: 'dubleks',
    title: 'Kozlu Site İçinde 4+1 Dubleks',
    image: placeholderImage('Dubleks', '#8a6f3a', '#5f4a1f', 320, 200),
    values: {
      fiyat: '7.900.000 TL', m2: 185, m2fiyat: '42.703 TL', oda: '4+1',
      kat: '5-6 / 6', yas: 9, aidat: '1.800 TL', isitma: 'Doğalgaz Kombi', eids: '—',
    },
  },
]

export function Karsilastir() {
  const [ilanlar, setIlanlar] = useState(baslangicIlanlari)

  return (
    <PublicShell title="Karşılaştır" onBack={noop}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ margin: '4px 0 4px', fontSize: 'var(--lg-text-display, 28px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
            İlan Karşılaştırma
          </h1>
          <p style={{ margin: 0, color: 'var(--lg-label-secondary)', fontSize: 14 }}>
            Kaydettiklerinden en fazla 4 ilanı yan yana kıyasla — en iyi değerler yeşil işaretlenir.
          </p>
        </div>

        {ilanlar.length > 0 ? (
          <GlassCompareTable
            fields={alanlar}
            listings={ilanlar}
            highlightDifferences
            onRemove={(id) => setIlanlar((mevcut) => mevcut.filter((i) => i.id !== id))}
            aria-label="İlan karşılaştırma tablosu"
          />
        ) : (
          <GlassEmptyState
            title="Karşılaştırılacak ilan kalmadı"
            description="Kaydettiklerim sayfasından ilan seçerek karşılaştırmaya ekleyebilirsin."
            action={<GlassButton prominent onClick={noop}>Kaydettiklerime Git</GlassButton>}
          />
        )}
      </div>
    </PublicShell>
  )
}
