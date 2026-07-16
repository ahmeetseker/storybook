// Mağaza vitrini (/magaza/{slug}) — kurumsal hesabın kamuya açık portföy sayfası.
// KurumsalTanitim'ın vaat ettiği vitrin: firma başlığı + hakkında + portföy grid'i.
// Cam yalnız kabuk ve butonlarda; içerik düz token zemini.
import type { CSSProperties } from 'react'
import { GlassAvatar } from '../components/GlassAvatar'
import { GlassBadge } from '../components/GlassBadge'
import { GlassButton } from '../components/GlassButton'
import { GlassListingCard } from '../components/GlassListingCard'
import { PublicShell } from './shared/shells'
import { EidsBadge } from './shared/forms'
import { magaza } from './shared/data'

const noop = () => {}

const flatCard: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: '20px 24px',
  boxSizing: 'border-box',
}

export function MagazaVitrin() {
  return (
    <PublicShell title="Mağaza" onBack={noop}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <header style={{ ...flatCard, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <GlassAvatar name={magaza.ad} size="xl" shape="rounded" />
          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 'var(--lg-text-display, 28px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
                {magaza.ad}
              </h1>
              {magaza.dogrulanmis ? (
                <GlassBadge material="flat" tint="var(--lg-success)">Doğrulanmış Kurumsal</GlassBadge>
              ) : null}
            </span>
            <span style={{ color: 'var(--lg-label-secondary)', fontSize: 15 }}>{magaza.slogan}</span>
            <span style={{ color: 'var(--lg-label-secondary)', fontSize: 13 }}>
              {magaza.uyelik} · {magaza.portfoy.length} ilan · {magaza.sehirler.join(' · ')}
            </span>
          </div>
          <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <GlassButton prominent onClick={noop}>Mesaj Gönder</GlassButton>
            <GlassButton onClick={noop}>{magaza.telefon}</GlassButton>
          </span>
        </header>

        <section style={{ ...flatCard, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>Hakkında</h2>
          <p style={{ margin: 0, lineHeight: 1.55, color: 'var(--lg-label-secondary)' }}>{magaza.hakkinda}</p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>
            Portföy ({magaza.portfoy.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {magaza.portfoy.map((ilan) => (
              <GlassListingCard
                key={ilan.id}
                image={ilan.gorsel}
                title={ilan.baslik}
                price={ilan.fiyat}
                location={`${ilan.konum} · ${ilan.m2}`}
                badge={ilan.eidsDogrulandi ? <EidsBadge dogrulandi /> : undefined}
                onClick={noop}
                material="flat"
              />
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
