// Sayfa kabukları: PublicShell (üst navigasyon + footer) ve AccountShell (GlassSidebar'lı).
// Cam yalnız navigasyon katmanında; içerik alanı düz zemin (token'lardan).
import type { CSSProperties, ReactNode } from 'react'
import { GlassNavbar } from '../../components/GlassNavbar'
import { GlassButton } from '../../components/GlassButton'
import { GlassSidebar } from '../../components/GlassSidebar'

const noop = () => {}

const maxW: CSSProperties = { maxWidth: 1120, margin: '0 auto', padding: '0 20px' }

export function PublicShell({ title, onBack, children, cta = 'İlan Ver' }: { title?: string; onBack?: () => void; children: ReactNode; cta?: string | null }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <GlassNavbar
        title={title ?? 'ArsaPazar'}
        onBack={onBack}
        backLabel={onBack ? 'Geri' : undefined}
        actions={cta ? <GlassButton size="sm" prominent onClick={noop}>{cta}</GlassButton> : undefined}
      />
      <main style={{ ...maxW, width: '100%', flex: 1, padding: '20px 20px 64px', boxSizing: 'border-box' }}>{children}</main>
      <footer style={{ borderTop: '1px solid var(--lg-hairline)', padding: '24px 0', marginTop: 24 }}>
        <div style={{ ...maxW, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', fontSize: 13, color: 'var(--lg-label-secondary)' }}>
          <span>© 2026 ArsaPazar — EİDS doğrulamalı arsa ilan platformu</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <a href="#kvkk" style={{ color: 'inherit' }}>KVKK</a>
            <a href="#cerez" style={{ color: 'inherit' }}>Çerez Tercihleri</a>
            <a href="#kosullar" style={{ color: 'inherit' }}>Kullanım Koşulları</a>
            <a href="#yardim" style={{ color: 'inherit' }}>Yardım</a>
          </span>
        </div>
      </footer>
    </div>
  )
}

export interface AccountNavItem {
  id: string
  label: string
  badge?: number
}

export const accountNav: AccountNavItem[] = [
  { id: 'ozet', label: 'Hesap Özeti' },
  { id: 'ilanlar', label: 'İlanlarım' },
  { id: 'faturalar', label: 'Faturalarım' },
  { id: 'mesajlar', label: 'Mesajlar', badge: 2 },
  { id: 'kaydettiklerim', label: 'Kaydettiklerim' },
  { id: 'alarmlar', label: 'Arama Alarmları' },
  { id: 'bildirimler', label: 'Bildirimler', badge: 2 },
  { id: 'ayarlar', label: 'Profil ve Ayarlar' },
  { id: 'kurumsal', label: 'Kurumsal Doğrulama' },
  { id: 'sikayetler', label: 'Şikâyetlerim' },
]

export function AccountShell({ selected, title, children }: { selected: string; title: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', gap: 20, alignItems: 'flex-start', maxWidth: 1200, margin: '0 auto', padding: '16px 20px 64px', boxSizing: 'border-box' }}>
      <div style={{ position: 'sticky', top: 16, flex: 'none' }}>
        <GlassSidebar selected={selected} onSelect={noop}>
          <GlassSidebar.Header title="Hesabım" subtitle="Mehmet Yılmaz" />
          {accountNav.map((item) => (
            <GlassSidebar.Item key={item.id} id={item.id}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%' }}>
                {item.label}
                {item.badge ? (
                  <span style={{ flex: 'none', minWidth: 18, height: 18, borderRadius: 999, background: 'var(--lg-accent)', color: 'var(--lg-accent-contrast)', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', padding: '0 5px' }}>
                    {item.badge}
                  </span>
                ) : null}
              </span>
            </GlassSidebar.Item>
          ))}
        </GlassSidebar>
      </div>
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ margin: '4px 0 0', fontSize: 'var(--lg-text-display, 28px)', fontWeight: 700, letterSpacing: '-0.022em' }}>{title}</h1>
        {children}
      </main>
    </div>
  )
}
