// /hesabim/ilanlar/yeni — 13 adımlı ilan oluşturma sihirbazı.
// AccountShell kullanılmaz: odaklı yerleşim (üstte GlassNavbar, solda dikey stepper, ortada form).
// Cam yalnız navbar + aksiyon butonlarında; stepper ve form panelleri flat.
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { GlassNavbar } from '../components/GlassNavbar'
import { GlassButton } from '../components/GlassButton'
import { GlassSpecTable } from '../components/GlassSpecTable'
import { CheckRow, Field, Select, TextArea, TextInput } from './shared/forms'
import { dopingPaketleri, sihirbazAdimlari } from './shared/data'

const noop = () => {}

const panel: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: 20,
  boxSizing: 'border-box',
}

const bilgiKutusu = (renk: string): CSSProperties => ({
  borderRadius: 'var(--lg-radius-media, 14px)',
  border: `1px solid color-mix(in srgb, ${renk} 35%, transparent)`,
  background: `color-mix(in srgb, ${renk} 9%, var(--lg-surface))`,
  padding: '12px 14px',
  fontSize: 'var(--lg-text-footnote, 13px)',
  lineHeight: 1.55,
})

/* ---------- Sol stepper ---------- */

function Stepper({ aktif, onSec }: { aktif: number; onSec: (adim: number) => void }) {
  return (
    <nav aria-label="Sihirbaz adımları" style={{ ...panel, padding: 12, position: 'sticky', top: 76 }}>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
        {sihirbazAdimlari.map((etiket, i) => {
          const no = i + 1
          const tamamlandi = no < aktif
          const seciliMi = no === aktif
          return (
            <li key={etiket}>
              <button
                type="button"
                onClick={() => (tamamlandi ? onSec(no) : undefined)}
                disabled={!tamamlandi && !seciliMi}
                aria-current={seciliMi ? 'step' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '8px 10px',
                  border: 'none',
                  borderRadius: 'var(--lg-radius-chip, 10px)',
                  background: seciliMi ? 'color-mix(in srgb, var(--lg-accent) 12%, transparent)' : 'transparent',
                  color: seciliMi ? 'var(--lg-label)' : tamamlandi ? 'var(--lg-label)' : 'var(--lg-label-secondary)',
                  opacity: !tamamlandi && !seciliMi ? 0.55 : 1,
                  font: 'inherit',
                  fontSize: 'var(--lg-text-footnote, 13px)',
                  fontWeight: seciliMi ? 600 : 400,
                  textAlign: 'left',
                  cursor: tamamlandi ? 'pointer' : 'default',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: 'none',
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    background: tamamlandi
                      ? 'var(--lg-success)'
                      : seciliMi
                        ? 'var(--lg-accent)'
                        : 'transparent',
                    color: tamamlandi || seciliMi ? '#fff' : 'var(--lg-label-secondary)',
                    border: tamamlandi || seciliMi ? 'none' : '1px solid var(--lg-hairline)',
                  }}
                >
                  {tamamlandi ? '✓' : no}
                </span>
                {etiket}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ---------- Adım içerikleri ---------- */

function AdimOnizleme({ doping }: { doping: string }) {
  const paket = dopingPaketleri.find((p) => p.id === doping) ?? dopingPaketleri[0]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <GlassSpecTable
        material="flat"
        title="İlan Önizlemesi"
        items={[
          { label: 'Başlık', value: 'İzmir Urla Denize 900 m — İmarlı Köşe Parsel' },
          { label: 'Fiyat', value: '4.250.000 TL' },
          { label: 'Konum', value: 'İzmir, Urla — İskele Mah.' },
          { label: 'Öne çıkarma', value: `${paket.ad} — ${paket.fiyat}` },
        ]}
      />
      <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
        Yayına alınmadan önce ilan moderasyon ekibince incelenir. Ücretli paket seçtiysen ödeme,
        gönderimden sonraki adımda alınır.
      </span>
    </div>
  )
}

function AdimPlaceholder({ baslik }: { baslik: string }) {
  return (
    <div
      style={{
        border: '1px dashed var(--lg-hairline)',
        borderRadius: 'var(--lg-radius-media, 14px)',
        padding: '28px 20px',
        textAlign: 'center',
        color: 'var(--lg-label-secondary)',
        fontSize: 'var(--lg-text-body, 15px)',
      }}
    >
      <strong style={{ display: 'block', marginBottom: 6, color: 'var(--lg-label)', fontWeight: 600 }}>{baslik}</strong>
      Bu adım demoda özetlendi.
    </div>
  )
}

function AdimEids({ sonuc }: { sonuc: 'basarili' | 'basarisiz' }) {
  const [numara, setNumara] = useState(sonuc === 'basarili' ? '2984571126' : '2984571000')
  const [sorgulandi, setSorgulandi] = useState(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field
        label="Taşınmaz numarası"
        hint="Tapu senedinin üst bölümünde yer alan 10 haneli numara."
      >
        {(id) => (
          <TextInput
            id={id}
            inputMode="numeric"
            value={numara}
            onChange={(e) => {
              setNumara(e.target.value)
              setSorgulandi(false)
            }}
            placeholder="Örn. 2984571126"
          />
        )}
      </Field>
      <div>
        <GlassButton size="sm" onClick={() => setSorgulandi(true)}>
          EİDS ile Sorgula
        </GlassButton>
      </div>
      {sorgulandi ? (
        sonuc === 'basarili' ? (
          <div role="status" style={bilgiKutusu('var(--lg-success)')}>
            <strong style={{ display: 'block', marginBottom: 4, color: 'var(--lg-success)' }}>✓ Doğrulama başarılı</strong>
            Taşınmaz kaydı bulundu: <strong>İzmir / Urla — Ada 152, Parsel 8</strong> · 512 m² · Arsa niteliğinde.
            Malik bilgisi hesabındaki kimlik bilgisiyle eşleşti. Sonraki adımlarda konum ve ada/parsel alanları
            bu kayıttan otomatik dolduruldu.
          </div>
        ) : (
          <div role="alert" style={bilgiKutusu('var(--lg-danger)')}>
            <strong style={{ display: 'block', marginBottom: 4, color: 'var(--lg-danger)' }}>✕ Doğrulama başarısız</strong>
            Bu taşınmaz numarasıyla eşleşen kayıt bulunamadı ya da malik bilgisi hesabınla eşleşmedi.
            Numarayı tapu senedinden kontrol edip yeniden dene. Vekâleten ilan veriyorsan
            "İlan verme sıfatı" adımından yetki belgesi yüklemen gerekir. Doğrulama tamamlanmadan
            ilan moderasyona gönderilemez.
          </div>
        )
      ) : null}
    </div>
  )
}

function AdimImarTapu() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      <Field label="İmar durumu">
        {(id) => (
          <Select id={id} defaultValue="konut">
            <option value="konut">Konut İmarlı</option>
            <option value="villa">Villa İmarlı</option>
            <option value="ticari">Ticari İmarlı</option>
            <option value="turizm">Turizm İmarlı</option>
            <option value="sanayi">Sanayi İmarlı</option>
            <option value="tarla">Tarla</option>
            <option value="bag">Bağ / Bahçe</option>
          </Select>
        )}
      </Field>
      <Field label="Tapu durumu">
        {(id) => (
          <Select id={id} defaultValue="mustakil">
            <option value="mustakil">Müstakil Parsel</option>
            <option value="hisseli">Hisseli Tapu</option>
            <option value="tahsis">Tahsis</option>
            <option value="kat-irtifaki">Kat İrtifakı Kurulmuş</option>
          </Select>
        )}
      </Field>
      <Field label="Kaks (Emsal)" hint="Bilinmiyorsa boş bırakılabilir.">
        {(id) => (
          <Select id={id} defaultValue="0.30">
            <option value="">Belirtilmedi</option>
            <option value="0.20">0.20</option>
            <option value="0.30">0.30</option>
            <option value="0.40">0.40</option>
            <option value="0.60">0.60</option>
          </Select>
        )}
      </Field>
      <Field label="Gabari">
        {(id) => (
          <Select id={id} defaultValue="6.50">
            <option value="">Belirtilmedi</option>
            <option value="3.50">3.50 m</option>
            <option value="6.50">6.50 m</option>
            <option value="9.50">9.50 m</option>
          </Select>
        )}
      </Field>
    </div>
  )
}

function AdimFiyat({ doping, onDopingChange }: { doping: string; onDopingChange: (id: string) => void }) {
  const [fiyat, setFiyat] = useState('4250000')
  const m2 = 512
  const sayi = Number(fiyat.replace(/[^\d]/g, ''))
  const m2Fiyat = sayi > 0 ? Math.round(sayi / m2) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="İlan fiyatı (TL)" hint="Nokta ve boşluk olmadan yalnız rakam gir.">
        {(id) => (
          <TextInput
            id={id}
            inputMode="numeric"
            value={fiyat}
            onChange={(e) => setFiyat(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Örn. 4250000"
          />
        )}
      </Field>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          borderRadius: 'var(--lg-radius-media, 14px)',
          border: '1px solid var(--lg-hairline)',
          padding: '14px 16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 'var(--lg-text-caption, 12px)', fontWeight: 500, color: 'var(--lg-label-secondary)' }}>
            Yüzölçümü (EİDS)
          </span>
          <strong style={{ fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>{m2.toLocaleString('tr-TR')} m²</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 'var(--lg-text-caption, 12px)', fontWeight: 500, color: 'var(--lg-label-secondary)' }}>
            m² birim fiyatı (otomatik)
          </span>
          <strong style={{ fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600, color: 'var(--lg-accent)' }}>
            {m2Fiyat > 0 ? `${m2Fiyat.toLocaleString('tr-TR')} TL/m²` : '—'}
          </strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 'var(--lg-text-caption, 12px)', fontWeight: 500, color: 'var(--lg-label-secondary)' }}>
            Bölge ortalaması
          </span>
          <strong style={{ fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>7.850 TL/m²</strong>
        </div>
      </div>
      <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
        m² fiyatın bölge ortalamasının %20 üzerindeyse ilanın "pazarlıklı" filtresinde daha az gösterilebilir.
      </span>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <legend style={{ padding: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 700 }}>
          Öne çıkarma paketleri
        </legend>
        <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
          Doping yalnız sıralama önceliği verir; ilanın hangi aramalarda listeleneceğini değiştirmez.
          Ücretli paketler ödeme onayından sonra aktifleşir.
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {dopingPaketleri.map((paket) => {
            const secili = doping === paket.id
            return (
              <label
                key={paket.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '14px 16px',
                  borderRadius: 'var(--lg-radius-media, 14px)',
                  border: secili ? '2px solid var(--lg-accent)' : '1px solid var(--lg-hairline)',
                  background: 'var(--lg-surface)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="radio"
                    name="doping-paketi"
                    value={paket.id}
                    checked={secili}
                    onChange={() => onDopingChange(paket.id)}
                    style={{ accentColor: 'var(--lg-accent)' }}
                  />
                  <strong style={{ fontSize: 15 }}>{paket.ad}</strong>
                  <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: 'var(--lg-accent)' }}>
                    {paket.fiyat}
                  </span>
                </span>
                <span style={{ fontSize: 13, color: 'var(--lg-label-secondary)', lineHeight: 1.45 }}>{paket.aciklama}</span>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--lg-label-secondary)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {paket.avantajlar.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </label>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}

function AdimAciklama() {
  const [metin, setMetin] = useState(
    'Urla merkeze 8 dk, denize 900 m mesafede köşe parsel. Elektrik ve su parsel sınırında, yol açık. ' +
      'Detaylı bilgi için 0532 123 45 67 numaradan Mehmet Bey’i arayabilirsiniz.',
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 16, alignItems: 'start' }}>
      <Field label="İlan açıklaması" hint={`${metin.length}/4000 karakter`}>
        {(id) => <TextArea id={id} rows={10} value={metin} onChange={(e) => setMetin(e.target.value)} />}
      </Field>

      {/* AI İlan Asistanı — flat panel */}
      <aside
        aria-label="AI İlan Asistanı"
        style={{
          border: '1px solid var(--lg-hairline)',
          borderRadius: 'var(--lg-radius-media, 14px)',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <strong style={{ fontSize: 'var(--lg-text-footnote, 13px)', fontWeight: 600, color: 'var(--lg-accent)' }}>
          ✦ AI İlan Asistanı
        </strong>
        <div style={bilgiKutusu('var(--lg-accent)')}>
          <strong style={{ display: 'block', marginBottom: 2 }}>Başlık önerisi</strong>
          “İzmir Urla Denize 900 m — İmarlı Köşe Parsel”
        </div>
        <div style={bilgiKutusu('var(--lg-warning)')}>
          <strong style={{ display: 'block', marginBottom: 2, color: 'var(--lg-warning)' }}>Eksik bilgi</strong>
          Açıklamada yola cephe uzunluğu ve doğalgaz durumu geçmiyor; bu alanlar alıcıların en sık sorduğu iki bilgi.
        </div>
        <div style={bilgiKutusu('var(--lg-danger)')}>
          <strong style={{ display: 'block', marginBottom: 2, color: 'var(--lg-danger)' }}>Kişisel veri tespiti</strong>
          <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <li>Telefon numarası: “0532 123 45 67”</li>
            <li>Ad-soyad: “Mehmet Bey”</li>
          </ul>
          İletişim bilgileri açıklamadan kaldırılmalı; alıcılar sana platform üzerinden ulaşır.
        </div>
      </aside>
    </div>
  )
}

function AdimBeyan({ onGonder }: { onGonder: () => void }) {
  const [onay, setOnay] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={bilgiKutusu('var(--lg-accent)')}>
        İlanın moderasyona gönderilmeden önce son kez kontrol edilir. Onaylandığında 60 gün süreyle yayında kalır;
        değişiklik istenirse bildirim alırsın.
      </div>
      <CheckRow
        checked={onay}
        onChange={(e) => setOnay(e.target.checked)}
        label={
          <>
            İlanda verdiğim tüm bilgilerin doğru olduğunu, taşınmaz üzerinde ilan vermeye yetkili olduğumu ve{' '}
            <a href="#ilan-kurallari" style={{ color: 'var(--lg-accent)' }}>İlan Yayınlama Kuralları</a>’nı okuyup
            kabul ettiğimi beyan ederim.
          </>
        }
      />
      <div>
        <GlassButton prominent size="lg" disabled={!onay} onClick={onGonder}>
          Moderasyona Gönder
        </GlassButton>
      </div>
    </div>
  )
}

/* ---------- Sayfa ---------- */

export interface YeniIlanSihirbaziProps {
  /** Adım 3'teki EİDS sorgusunun sonucu (demo senaryosu) */
  eidsSonucu?: 'basarili' | 'basarisiz'
  /** Sihirbazın açılacağı adım (1–13) */
  baslangicAdimi?: number
}

export function YeniIlanSihirbazi({ eidsSonucu = 'basarili', baslangicAdimi = 3 }: YeniIlanSihirbaziProps) {
  const [adim, setAdim] = useState(Math.min(Math.max(baslangicAdimi, 1), 13))
  const [gonderildi, setGonderildi] = useState(false)
  const [doping, setDoping] = useState('standart')

  const icerik: ReactNode = useMemo(() => {
    switch (adim) {
      case 3:
        return <AdimEids sonuc={eidsSonucu} />
      case 6:
        return <AdimImarTapu />
      case 8:
        return <AdimFiyat doping={doping} onDopingChange={setDoping} />
      case 10:
        return <AdimAciklama />
      case 12:
        return <AdimOnizleme doping={doping} />
      case 13:
        return <AdimBeyan onGonder={() => setGonderildi(true)} />
      default:
        return <AdimPlaceholder baslik={sihirbazAdimlari[adim - 1]} />
    }
  }, [adim, eidsSonucu, doping])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlassNavbar
        title="Yeni İlan"
        onBack={noop}
        backLabel="İlanlarım"
        actions={
          <span
            role="status"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 12px',
              fontSize: 'var(--lg-text-caption, 12px)',
              fontWeight: 600,
              color: 'var(--lg-success)',
              whiteSpace: 'nowrap',
            }}
          >
            Taslak kaydedildi ✓
          </span>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '264px minmax(0, 1fr)',
          gap: 20,
          alignItems: 'start',
          width: '100%',
          maxWidth: 1080,
          margin: '0 auto',
          padding: '16px 20px 64px',
          boxSizing: 'border-box',
        }}
      >
        <Stepper aktif={adim} onSec={setAdim} />

        <main style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 'var(--lg-text-caption, 12px)', fontWeight: 500, color: 'var(--lg-label-secondary)' }}>
              Adım {adim} / {sihirbazAdimlari.length}
            </span>
            <h1 style={{ margin: 0, fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
              {sihirbazAdimlari[adim - 1]}
            </h1>
          </header>

          <section style={panel}>
            {gonderildi && adim === 13 ? (
              <div role="status" style={bilgiKutusu('var(--lg-success)')}>
                <strong style={{ display: 'block', marginBottom: 4, color: 'var(--lg-success)' }}>✓ İlan moderasyona gönderildi</strong>
                İnceleme ortalama 4 iş saati sürer; sonuç bildirim ve e-posta ile iletilir.
              </div>
            ) : (
              icerik
            )}
          </section>

          <footer style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <GlassButton size="md" disabled={adim === 1} onClick={() => setAdim((a) => Math.max(1, a - 1))}>
              ← Geri
            </GlassButton>
            {adim < 13 ? (
              <GlassButton prominent size="md" onClick={() => setAdim((a) => Math.min(13, a + 1))}>
                İleri →
              </GlassButton>
            ) : null}
          </footer>
        </main>
      </div>
    </div>
  )
}
