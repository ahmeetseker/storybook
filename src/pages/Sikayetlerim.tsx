// /hesabim/sikayetlerim — kullanıcının gönderdiği şikâyetler: konu, hedef, tarih,
// durum rozeti ve aç-kapa (details) karar açıklaması. İçerik flat; cam yalnız kabukta.
import type { CSSProperties } from 'react'
import { AccountShell } from './shared/shells'
import { StatusBadge } from './shared/forms'

interface Sikayet {
  id: string
  konu: 'İlan' | 'Kullanıcı'
  hedef: string
  neden: string
  tarih: string
  durum: 'incelemede' | 'sonuclandi' | 'reddedildi'
  karar: string
}

const durumEtiket: Record<Sikayet['durum'], string> = {
  incelemede: 'İncelemede',
  sonuclandi: 'Sonuçlandı',
  reddedildi: 'Reddedildi',
}

const durumTon: Record<Sikayet['durum'], 'warning' | 'success' | 'neutral'> = {
  incelemede: 'warning',
  sonuclandi: 'success',
  reddedildi: 'neutral',
}

const ornekSikayetler: Sikayet[] = [
  {
    id: 's1',
    konu: 'İlan',
    hedef: '"Çanakkale Merkez Denize Sıfır Arsa" — İlan No: 1084991204',
    neden: 'Yanıltıcı fiyat / ilanda yazan fiyatla söylenen fiyat farklı',
    tarih: '13 Temmuz 2026',
    durum: 'incelemede',
    karar: 'Şikâyetiniz moderasyon ekibine iletildi. İnceleme genellikle 2 iş günü içinde tamamlanır.',
  },
  {
    id: 's2',
    konu: 'Kullanıcı',
    hedef: 'Hakan T. (üye no: 481022)',
    neden: 'Mesajlaşmada uygunsuz dil ve ısrarlı arama',
    tarih: '6 Temmuz 2026',
    durum: 'sonuclandi',
    karar:
      'Şikâyetiniz haklı bulundu. İlgili kullanıcıya mesajlaşma kısıtlaması uygulandı ve profiliniz bu kullanıcıya kapatıldı. Bildiriminiz için teşekkür ederiz.',
  },
  {
    id: 's3',
    konu: 'İlan',
    hedef: '"Muğla Bodrum Yatırım Fırsatı" — İlan No: 1084733570',
    neden: 'Fotoğrafların başka ilana ait olduğu şüphesi',
    tarih: '28 Haziran 2026',
    durum: 'reddedildi',
    karar:
      'Yapılan incelemede fotoğrafların ilan sahibine ait olduğu ve tapu bilgileriyle uyumlu olduğu doğrulandı. Şikâyet gerekçesi yerinde görülmedi.',
  },
]

const card: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  overflow: 'hidden',
}

function SikayetSatiri({ sikayet, ilk }: { sikayet: Sikayet; ilk: boolean }) {
  return (
    <details style={{ borderTop: ilk ? 'none' : '1px solid var(--lg-hairline)' }}>
      <summary
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          cursor: 'pointer',
          listStyle: 'none',
        }}
      >
        <span
          style={{
            flex: 'none',
            padding: '3px 10px',
            borderRadius: 'var(--lg-radius-chip, 10px)',
            border: '1px solid var(--lg-hairline)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--lg-label-secondary)',
          }}
        >
          {sikayet.konu}
        </span>
        <span style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sikayet.hedef}</span>
          <span style={{ fontSize: 12, color: 'var(--lg-label-secondary)' }}>{sikayet.neden} · {sikayet.tarih}</span>
        </span>
        <StatusBadge tone={durumTon[sikayet.durum]}>{durumEtiket[sikayet.durum]}</StatusBadge>
        <span aria-hidden style={{ color: 'var(--lg-label-secondary)', fontSize: 12 }}>▾</span>
      </summary>
      <div style={{ padding: '0 20px 16px 20px' }}>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--lg-radius-media, 14px)',
            background: 'var(--lg-bg)',
            border: '1px solid var(--lg-hairline)',
            fontSize: 'var(--lg-text-footnote, 13px)',
            lineHeight: 1.55,
          }}
        >
          <strong style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Karar açıklaması</strong>
          <span style={{ color: 'var(--lg-label-secondary)' }}>{sikayet.karar}</span>
        </div>
      </div>
    </details>
  )
}

function BosDurum() {
  return (
    <div style={{ ...card, textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span aria-hidden style={{ fontSize: 28 }}>🛡️</span>
      <strong style={{ fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>Gönderilmiş şikâyetiniz yok</strong>
      <p style={{ margin: 0, maxWidth: 440, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>
        Kurallara aykırı bir ilan veya kullanıcı gördüğünüzde ilan sayfasındaki “Şikâyet Et”
        bağlantısıyla bize bildirebilirsiniz. Bildirimlerinizin durumunu buradan takip edersiniz.
      </p>
    </div>
  )
}

export function Sikayetlerim({ sikayetler = ornekSikayetler }: { sikayetler?: Sikayet[] }) {
  return (
    <AccountShell selected="sikayetler" title="Şikâyetlerim">
      {sikayetler.length === 0 ? (
        <BosDurum />
      ) : (
        <>
          <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
            Gönderdiğiniz şikâyetler ve moderasyon kararları. Satıra tıklayarak karar açıklamasını görün.
          </p>
          <div style={card}>
            {sikayetler.map((sikayet, i) => (
              <SikayetSatiri key={sikayet.id} sikayet={sikayet} ilk={i === 0} />
            ))}
          </div>
        </>
      )}
    </AccountShell>
  )
}
