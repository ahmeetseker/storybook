// /hesabim/faturalarim — doping ve ek hizmet faturaları listesi.
// Cam yalnız sidebar'da; liste düz token zemini.
import { GlassList, GlassListItem } from '../components/GlassList'
import { GlassButton } from '../components/GlassButton'
import { AccountShell } from './shared/shells'
import { faturalar } from './shared/data'

const noop = () => {}

export function Faturalarim() {
  return (
    <AccountShell selected="faturalar" title="Faturalarım">
      <p style={{ margin: 0, color: 'var(--lg-label-secondary)', fontSize: 14 }}>
        Doping ve ek hizmet ödemelerinin faturaları burada listelenir. Fatura, ödeme onayından
        sonraki 24 saat içinde e-posta adresine de gönderilir.
      </p>
      <GlassList>
        {faturalar.map((f) => (
          <GlassListItem
            key={f.id}
            title={f.aciklama}
            subtitle={`${f.tarih} · ${f.id}`}
            detail={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                <strong>{f.tutar}</strong>
                <GlassButton size="sm" onClick={noop}>PDF indir</GlassButton>
              </span>
            }
          />
        ))}
      </GlassList>
    </AccountShell>
  )
}
