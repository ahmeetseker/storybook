// Doping ödeme (/hesabim/doping-odeme) — reserve→charge→boost akışının charge adımı demosu.
// Doping ödeme onayından sonra aktifleşir; süre bitince etkisi otomatik düşer.
// Cam yalnız kabuk ve butonlarda; form ve özet düz token zemini.
import { useState, type CSSProperties } from 'react'
import { GlassButton } from '../components/GlassButton'
import { GlassSpecTable } from '../components/GlassSpecTable'
import { PublicShell } from './shared/shells'
import { Field, TextInput } from './shared/forms'
import { dopingPaketleri, ilanlar } from './shared/data'

const noop = () => {}

const flatCard: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: '20px 24px',
  boxSizing: 'border-box',
}

const paket = dopingPaketleri.find((p) => p.id === 'one-cikan') ?? dopingPaketleri[0]
const ilan = ilanlar[0]

export function DopingOdeme() {
  const [odendi, setOdendi] = useState(false)

  return (
    <PublicShell title="Doping Satın Al" onBack={noop} cta={null}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
          alignItems: 'start',
          maxWidth: 880,
          margin: '0 auto',
        }}
      >
        <GlassSpecTable
          material="flat"
          title="Sipariş Özeti"
          items={[
            { label: 'İlan', value: ilan.baslik },
            { label: 'Paket', value: `${paket.ad} (2 hafta)` },
            { label: 'Tutar', value: '290,83 TL' },
            { label: 'KDV (%20)', value: '58,17 TL' },
            { label: 'Toplam', value: <strong>349,00 TL</strong> },
          ]}
        />

        {odendi ? (
          <div style={{ ...flatCard, display: 'flex', flexDirection: 'column', gap: 10 }} role="status">
            <strong style={{ fontSize: 19, color: 'var(--lg-success)' }}>✓ Ödeme alındı</strong>
            <p style={{ margin: 0, lineHeight: 1.55, color: 'var(--lg-label-secondary)' }}>
              Doping, ödeme onayından sonra aktifleşir; "{ilan.baslik}" ilanı 2 hafta boyunca
              arama sonuçlarında öncelikli gösterilir. Süre bitiminde etkisi otomatik düşer.
              Faturanı Faturalarım sayfasından indirebilirsin.
            </p>
            <div>
              <GlassButton onClick={noop}>Faturalarım'a git</GlassButton>
            </div>
          </div>
        ) : (
          <form
            style={{ ...flatCard, display: 'flex', flexDirection: 'column', gap: 14 }}
            onSubmit={(e) => {
              e.preventDefault()
              setOdendi(true)
            }}
          >
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>Kart Bilgileri</h2>
            <Field label="Kart üzerindeki ad">
              {(id) => <TextInput id={id} autoComplete="cc-name" placeholder="Mehmet Yılmaz" required />}
            </Field>
            <Field label="Kart numarası">
              {(id) => (
                <TextInput id={id} inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" maxLength={19} required />
              )}
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Son kullanma">
                {(id) => <TextInput id={id} inputMode="numeric" autoComplete="cc-exp" placeholder="AA/YY" maxLength={5} required />}
              </Field>
              <Field label="CVC">
                {(id) => <TextInput id={id} inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} required />}
              </Field>
            </div>
            <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
              Ödeme 3D Secure ile doğrulanır. Doping ücreti iade edilmez; ödeme reddedilirse
              boost uygulanmaz ve ilan mevcut haliyle yayında kalır.
            </span>
            <div>
              <GlassButton prominent size="lg" type="submit">
                Ödemeyi Onayla — 349,00 TL
              </GlassButton>
            </div>
          </form>
        )}
      </div>
    </PublicShell>
  )
}
