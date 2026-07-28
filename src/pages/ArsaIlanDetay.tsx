// İlan detay sayfası (/ilan/{id}) — ListingDetailDemo deseni arsa içeriğiyle.
// Cam yalnız kabuk, sekme çubuğu ve butonlarda; tüm içerik material="flat".
import { useState, type CSSProperties } from 'react'
import { GlassBreadcrumb } from '../components/GlassBreadcrumb'
import { GlassGallery } from '../components/GlassGallery'
import { GlassPriceHeader } from '../components/GlassPriceHeader'
import { GlassIconButton } from '../components/GlassIconButton'
import { GlassSpecTable } from '../components/GlassSpecTable'
import { GlassTabs } from '../components/GlassTabs'
import { GlassSellerCard } from '../components/GlassSellerCard'
import { GlassLocationCard } from '../components/GlassLocationCard'
import { GlassListingCard } from '../components/GlassListingCard'
import { GlassCarousel } from '../components/GlassCarousel'
import { GlassModal } from '../components/GlassModal'
import { GlassRadioGroup } from '../components/GlassRadioGroup'
import { GlassToastProvider, useGlassToast } from '../components/GlassToast'
import { GlassBadge } from '../components/GlassBadge'
import { GlassButton } from '../components/GlassButton'
import { placeholderImage } from '../demo/placeholderImage'
import { PublicShell } from './shared/shells'
import { EidsBadge, TextArea } from './shared/forms'
import { ilanlar } from './shared/data'

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
    <path d="M5 21V4a1 1 0 0 1 1-1h11.6a.5.5 0 0 1 .4.8L15 8l3 4.2a.5.5 0 0 1-.4.8H6" />
  </svg>
)

const ilan = ilanlar[0] // İzmir Urla — yayında, EİDS doğrulanmış

const galeriGorselleri = [
  { src: placeholderImage('Parsel Genel', '#3a6f5f', '#1f4a3a'), alt: 'Parselin drone ile çekilmiş genel görünümü' },
  { src: placeholderImage('Yol Cephesi', '#5f6f3a', '#3a4a1f'), alt: 'Parselin yol cephesinden görünümü' },
  { src: placeholderImage('Deniz Yönü', '#3a7a8a', '#1f4a5f'), alt: 'Parselden deniz yönüne bakış' },
  { src: placeholderImage('İmar Planı', '#8a6f3a', '#5f4a1f'), alt: 'İmar planı paftası' },
  { src: placeholderImage('Çevre Doku', '#6f3a5f', '#4a1f3a'), alt: 'Çevredeki yapılaşma dokusu' },
]

const arsaOzellikleri = [
  { label: 'İlan No', value: ilan.id },
  { label: 'İmar Durumu', value: ilan.imar },
  { label: 'Ada No', value: '1284' },
  { label: 'Parsel No', value: '7' },
  { label: 'Tapu Durumu', value: ilan.tapu },
  { label: 'Yüzölçümü', value: ilan.m2 },
  { label: 'm² Fiyatı', value: ilan.m2Fiyat },
  { label: 'KAKS (Emsal)', value: '0.30' },
  { label: 'TAKS', value: '0.15' },
  { label: 'Gabari', value: '6.50 m' },
  { label: 'Yol Cephesi', value: 'Var — köşe parsel, iki cephe' },
  { label: 'Altyapı', value: 'Elektrik, su, doğalgaz hattı mevcut' },
  { label: 'Krediye Uygunluk', value: 'Uygun' },
  { label: 'Kimden', value: 'Sahibinden' },
]

const imarTapuDetaylari = [
  { label: 'Plan Türü', value: '1/1000 Uygulama İmar Planı' },
  { label: 'Kullanım Amacı', value: 'Konut Alanı' },
  { label: 'Ada / Parsel', value: '1284 / 7' },
  { label: 'Pafta', value: 'L17-B-23-C' },
  { label: 'Tapu Tipi', value: 'Müstakil Parsel (Kat mülkiyetsiz)' },
  { label: 'Taşınmaz No', value: '2841937465' },
  { label: 'EİDS Durumu', value: 'İlan verme yetkisi doğrulandı — 12 Temmuz 2026' },
  { label: 'EİDS Kapsamı', value: 'Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.' },
]

const columnStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 }

export function ArsaIlanDetay() {
  return (
    <GlassToastProvider>
      <ArsaIlanDetayIcerik />
    </GlassToastProvider>
  )
}

function ArsaIlanDetayIcerik() {
  const [favori, setFavori] = useState(false)
  const benzerler = ilanlar.filter((i) => i.id !== ilan.id)

  const toast = useGlassToast()
  const [bildirAcik, setBildirAcik] = useState(false)
  const [bildirNeden, setBildirNeden] = useState<string | undefined>(undefined)
  const [bildirAciklama, setBildirAciklama] = useState('')

  const bildirGonder = () => {
    setBildirAcik(false)
    setBildirNeden(undefined)
    setBildirAciklama('')
    toast({
      title: 'Şikâyetin alındı',
      description: 'Moderasyon ekibi ilanı 24 saat içinde inceleyecek. Sonucu Şikâyetlerim sayfasından izleyebilirsin.',
      severity: 'success',
    })
  }

  return (
    <PublicShell title="İlan Detayı" onBack={noop}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <GlassBreadcrumb
            items={[
              { label: 'Emlak', onClick: noop },
              { label: 'Arsa', onClick: noop },
              { label: 'İzmir', onClick: noop },
              { label: 'Urla' },
            ]}
          />
          <span style={{ display: 'flex', gap: 8 }}>
            <GlassIconButton label="İlanı paylaş" onClick={noop}>
              <ShareIcon />
            </GlassIconButton>
            <GlassIconButton label="İlanı bildir" onClick={() => setBildirAcik(true)}>
              <FlagIcon />
            </GlassIconButton>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 16, alignItems: 'start' }}>
          <div style={columnStyle}>
            <GlassGallery images={galeriGorselleri} material="flat" />
            <GlassTabs
              material="flat"
              tabs={[
                {
                  id: 'aciklama',
                  label: 'Açıklama',
                  content: (
                    <>
                      <p style={{ margin: '0 0 12px' }}>
                        Urla İskele mahallesinde, denize kuş uçuşu 900 metre mesafede köşe parsel.
                        İki cepheli olup her iki yola da yasal giriş hakkı vardır. Elektrik, su ve
                        doğalgaz hattı parsel sınırına kadar gelmiştir.
                      </p>
                      <p style={{ margin: 0 }}>
                        1/1000 uygulama imar planında konut alanında kalmaktadır; 0.30 emsal ile
                        yaklaşık 150 m² taban oturumlu, iki katlı yapı yapılabilir. Bu taşınmaz için
                        ilan verme yetkisi EİDS ile doğrulanmıştır. Bu kontrol tapu niteliğini,
                        takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.
                      </p>
                    </>
                  ),
                },
                {
                  id: 'imar-tapu',
                  label: 'İmar ve Tapu',
                  content: <GlassSpecTable items={imarTapuDetaylari} material="flat" />,
                },
                {
                  id: 'konum',
                  label: 'Konum',
                  content: (
                    <GlassLocationCard
                      address="İzmir, Urla — İskele Mah."
                      note="Kesin konum, satıcı onayı sonrası paylaşılır."
                      onOpenMap={noop}
                      material="flat"
                    />
                  ),
                },
                {
                  id: 'fiyat-gecmisi',
                  label: 'Fiyat Geçmişi',
                  content: ilan.fiyatGecmisi?.length ? (
                    <GlassSpecTable
                      material="flat"
                      items={ilan.fiyatGecmisi.map((k) => ({
                        label: k.tarih,
                        value: (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            {k.fiyat}
                            {k.degisim ? (
                              <GlassBadge material="flat" tint={k.yon === 'artis' ? 'var(--lg-danger)' : 'var(--lg-success)'}>
                                {k.degisim}
                              </GlassBadge>
                            ) : null}
                          </span>
                        ),
                      }))}
                    />
                  ) : (
                    <p style={{ margin: 0, color: 'var(--lg-label-secondary)' }}>
                      Bu ilanda henüz fiyat değişikliği kaydı yok.
                    </p>
                  ),
                },
              ]}
            />
            <GlassSpecTable title="Arsa Özellikleri" items={arsaOzellikleri} columns={2} material="flat" />
          </div>

          <div style={columnStyle}>
            <GlassPriceHeader
              material="flat"
              title={ilan.baslik}
              price={ilan.fiyat}
              priceTint="var(--lg-accent, #b45309)"
              meta={`${ilan.konum} · ${ilan.m2} · ${ilan.m2Fiyat} · ${ilan.tarih} · İlan No: ${ilan.id} · ${ilan.goruntulenme.toLocaleString('tr-TR')} görüntülenme`}
              badges={<EidsBadge dogrulandi={ilan.eidsDogrulandi} />}
              actions={
                <GlassIconButton
                  label={favori ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  active={favori}
                  tint="#ff453a"
                  onClick={() => setFavori((f) => !f)}
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
              material="flat"
            />
            <GlassLocationCard
              address="İzmir, Urla — İskele Mah."
              note="Güvenlik nedeniyle konum yaklaşık gösterilir."
              onOpenMap={noop}
              material="flat"
            />
            <GlassSpecTable title="İlan Özeti" items={arsaOzellikleri.slice(1, 7)} material="flat" />
          </div>
        </div>

        <section style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>Benzer İlanlar</h2>
          <GlassCarousel label="Benzer arsa ilanları">
            {benzerler.map((b) => (
              <GlassListingCard
                key={b.id}
                image={b.gorsel}
                title={b.baslik}
                price={b.fiyat}
                location={`${b.konum} · ${b.m2}`}
                badge={b.eidsDogrulandi ? <EidsBadge dogrulandi /> : undefined}
                onClick={noop}
                material="flat"
              />
            ))}
          </GlassCarousel>
        </section>

        <GlassModal
          open={bildirAcik}
          onClose={() => setBildirAcik(false)}
          title="İlanı bildir"
          description="Bildirimin moderasyon ekibine iletilir; ilan sahibi kimliğini göremez."
          size="sm"
          footer={
            <>
              <GlassButton onClick={() => setBildirAcik(false)}>Vazgeç</GlassButton>
              <GlassButton prominent disabled={!bildirNeden} onClick={bildirGonder}>
                Gönder
              </GlassButton>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <GlassRadioGroup
              label="Bildirim nedeni"
              options={[
                { value: 'yaniltici', label: 'Yanıltıcı bilgi', description: 'Fiyat, konum veya özellikler gerçeği yansıtmıyor' },
                { value: 'sahte', label: 'Sahte ilan', description: 'İlan gerçek bir taşınmaza ait değil' },
                { value: 'kategori', label: 'Yanlış kategori', description: 'İlan arsa kategorisine ait değil' },
                { value: 'dolandiricilik', label: 'Dolandırıcılık şüphesi', description: 'Kapora talebi, harici ödeme yönlendirmesi vb.' },
              ]}
              value={bildirNeden}
              onChange={setBildirNeden}
            />
            <TextArea
              aria-label="Ek açıklama (isteğe bağlı)"
              placeholder="Ek açıklama (isteğe bağlı)"
              value={bildirAciklama}
              onChange={(e) => setBildirAciklama(e.target.value)}
              rows={3}
            />
          </div>
        </GlassModal>
      </div>
    </PublicShell>
  )
}
