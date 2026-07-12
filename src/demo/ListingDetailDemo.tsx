// Sahibinden tarzı ilan detay sayfası — kütüphanedeki parçaların gerçek bir
// senaryoda birlikte çalışmasını gösterir. Veriler tamamen örnek.
import { useState, type CSSProperties } from 'react'
import { GlassNavbar } from '../components/GlassNavbar'
import { GlassBreadcrumb } from '../components/GlassBreadcrumb'
import { GlassGallery } from '../components/GlassGallery'
import { GlassPriceHeader } from '../components/GlassPriceHeader'
import { GlassBadge } from '../components/GlassBadge'
import { GlassIconButton } from '../components/GlassIconButton'
import { GlassSpecTable } from '../components/GlassSpecTable'
import { GlassTabs } from '../components/GlassTabs'
import { GlassSellerCard } from '../components/GlassSellerCard'
import { GlassLocationCard } from '../components/GlassLocationCard'
import { GlassListingCard } from '../components/GlassListingCard'
import { GlassCarousel } from '../components/GlassCarousel'
import { placeholderImage } from './placeholderImage'

const noop = () => {}

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.4 4.5 6 4.5c2 0 3.4 1 4.5 2.6h3c1.1-1.6 2.5-2.6 4.5-2.6 3.6 0 5.5 3.5 4 7.2C19.5 16.3 12 21 12 21z" transform="scale(0.9) translate(1.3 1.3)" />
  </svg>
)

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
  </svg>
)

const FlagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 21V4m0 1h12l-2.5 4L17 13H5" />
  </svg>
)

const galleryImages = [
  { src: placeholderImage('Ön Görünüm', '#3a5f8a', '#1f3a5f'), alt: 'Aracın önden görünümü' },
  { src: placeholderImage('Yan Görünüm', '#5f3a8a', '#3a1f5f'), alt: 'Aracın yandan görünümü' },
  { src: placeholderImage('Arka Görünüm', '#8a5f3a', '#5f3a1f'), alt: 'Aracın arkadan görünümü' },
  { src: placeholderImage('İç Mekan', '#3a8a5f', '#1f5f3a'), alt: 'Araç iç mekanı' },
  { src: placeholderImage('Motor', '#8a3a3a', '#5f1f1f'), alt: 'Motor bölmesi' },
]

const specs = [
  { label: 'Marka', value: 'Volkswagen' },
  { label: 'Seri', value: 'Golf' },
  { label: 'Model', value: '1.6 TDI Comfortline' },
  { label: 'Yıl', value: '2019' },
  { label: 'Kilometre', value: '87.500 km' },
  { label: 'Vites', value: 'Otomatik' },
  { label: 'Yakıt', value: 'Dizel' },
  { label: 'Kasa Tipi', value: 'Hatchback 5 Kapı' },
  { label: 'Renk', value: 'Beyaz' },
  { label: 'Hasar Kaydı', value: 'Yok' },
  { label: 'Takas', value: 'Evet' },
  { label: 'Kimden', value: 'Sahibinden' },
]

const similar = [
  { title: 'Renault Clio 1.0 TCe Touch', price: '785.000 TL', location: 'İstanbul, Maltepe', from: '#3a5f8a', to: '#1f3a5f' },
  { title: 'Ford Focus 1.5 EcoBlue Titanium', price: '1.050.000 TL', location: 'Ankara, Çankaya', from: '#5f3a8a', to: '#3a1f5f' },
  { title: 'Toyota Corolla 1.8 Hybrid Dream', price: '1.320.000 TL', location: 'İzmir, Bornova', from: '#3a8a5f', to: '#1f5f3a' },
  { title: 'Honda Civic 1.5 VTEC Executive', price: '1.410.000 TL', location: 'Bursa, Nilüfer', from: '#8a5f3a', to: '#5f3a1f' },
  { title: 'Peugeot 308 1.2 PureTech Allure', price: '960.000 TL', location: 'Antalya, Muratpaşa', from: '#8a3a3a', to: '#5f1f1f' },
  { title: 'Fiat Egea 1.4 Fire Urban', price: '690.000 TL', location: 'Konya, Selçuklu', from: '#3a7a8a', to: '#1f4a5f' },
]

const columnStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 }

export function ListingDetailDemo() {
  const [favorite, setFavorite] = useState(false)

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto' }}>
      <GlassNavbar
        title="İlan Detayı"
        onBack={noop}
        backLabel="Arama Sonuçları"
        actions={
          <>
            <GlassIconButton label="Paylaş" onClick={noop}>
              <ShareIcon />
            </GlassIconButton>
            <GlassIconButton label="Şikayet et" onClick={noop}>
              <FlagIcon />
            </GlassIconButton>
          </>
        }
      />

      <main style={{ maxWidth: 1060, margin: '0 auto', padding: '16px 20px 64px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GlassBreadcrumb
          items={[
            { label: 'Vasıta', onClick: noop },
            { label: 'Otomobil', onClick: noop },
            { label: 'Volkswagen', onClick: noop },
            { label: 'Golf 1.6 TDI' },
          ]}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 16, alignItems: 'start' }}>
          <div style={columnStyle}>
            <GlassGallery images={galleryImages} />
            <GlassTabs
              tabs={[
                {
                  id: 'aciklama',
                  label: 'Açıklama',
                  content: (
                    <>
                      <p style={{ margin: '0 0 12px' }}>
                        Aracımız ilk sahibinden olup tüm bakımları yetkili serviste yapılmıştır.
                        Değişeni ve boyası yoktur; ekspertiz raporu mevcuttur.
                      </p>
                      <p style={{ margin: 0 }}>
                        Sunroof, geri görüş kamerası, şerit takip asistanı ve ısıtmalı koltuk gibi
                        donanımlara sahiptir. Görmeden karar vermeyin, ciddi alıcılar arasın lütfen.
                      </p>
                    </>
                  ),
                },
                {
                  id: 'ozellikler',
                  label: 'İlan Bilgileri',
                  content: <GlassSpecTable items={specs} columns={2} />,
                },
                {
                  id: 'konum',
                  label: 'Konum',
                  content: (
                    <GlassLocationCard
                      address="İstanbul, Kadıköy — Fenerbahçe Mah."
                      note="Güvenlik nedeniyle konum yaklaşık gösterilir."
                      onOpenMap={noop}
                    />
                  ),
                },
              ]}
            />
          </div>

          <div style={columnStyle}>
            <GlassPriceHeader
              title="Volkswagen Golf 1.6 TDI Comfortline — İlk Sahibinden, Hatasız"
              price="1.185.000 TL"
              priceTint="#ffd60a"
              meta="İstanbul, Kadıköy · 12 Temmuz 2026 · İlan No: 1084526631"
              badges={
                <>
                  <GlassBadge tint="#ff453a">Acil</GlassBadge>
                  <GlassBadge tint="#ff9f0a">Öne Çıkan</GlassBadge>
                </>
              }
              actions={
                <GlassIconButton
                  label={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  active={favorite}
                  tint="#ff453a"
                  onClick={() => setFavorite((f) => !f)}
                >
                  <HeartIcon />
                </GlassIconButton>
              }
            />
            <GlassSellerCard
              name="Mehmet Yılmaz"
              memberSince="Üyelik: Ocak 2019"
              phone="0 (532) 123 45 67"
              verified
              onMessage={noop}
            />
            <GlassSpecTable title="İlan Özeti" items={specs.slice(3, 8)} />
          </div>
        </div>

        <section style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>Benzer İlanlar</h3>
          <GlassCarousel label="Benzer ilanlar">
            {similar.map((car) => (
              <GlassListingCard
                key={car.title}
                image={{ src: placeholderImage(car.title.split(' ')[0], car.from, car.to, 480, 360), alt: car.title }}
                title={car.title}
                price={car.price}
                location={car.location}
                onClick={noop}
              />
            ))}
          </GlassCarousel>
        </section>
      </main>
    </div>
  )
}
