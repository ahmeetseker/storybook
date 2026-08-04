// Sayfa kabukları: PublicShell (üst navigasyon + footer) ve AccountShell (GlassSidebar'lı).
// Cam yalnız navigasyon katmanında; içerik alanı düz zemin (token'lardan).
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { GlassNavbar } from '../../components/GlassNavbar'
import { GlassButton } from '../../components/GlassButton'
import { GlassSidebar } from '../../components/GlassSidebar'
import { GlassDrawer } from '../../components/GlassDrawer'
import { GlassCommandPalette } from '../../components/GlassCommandPalette'
import { bildirimler, konusmalar, ilanlar } from './data'
import { PageIcon, type PageIconName } from './icons'
import styles from './shells.module.css'

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
  icon: PageIconName
  badge?: number
  /** Dekoratif kısayol ipucu */
  hint?: string
  /** Rozetin anlamı — ekran okuyucuya okunur */
  badgeLabel?: string
}

/** Düz gezinme listesi (kabuğun üst bloğu + eski tüketiciler için geriye dönük dizin). */
export const accountNav: AccountNavItem[] = [
  { id: 'ozet', label: 'Hesap Özeti', icon: 'ozet' },
  { id: 'ilanlar', label: 'İlanlarım', icon: 'arsa' },
  { id: 'faturalar', label: 'Faturalarım', icon: 'fatura' },
  { id: 'mesajlar', label: 'Mesajlar', icon: 'mesaj', badge: 2, badgeLabel: 'okunmamış mesaj' },
  { id: 'kaydettiklerim', label: 'Kaydettiklerim', icon: 'kalp' },
  { id: 'alarmlar', label: 'Arama Alarmları', icon: 'alarm' },
  { id: 'bildirimler', label: 'Bildirimler', icon: 'bildirim', badge: 2, badgeLabel: 'okunmamış bildirim' },
  { id: 'ayarlar', label: 'Profil ve Ayarlar', icon: 'ayarlar' },
  { id: 'kurumsal', label: 'Kurumsal Doğrulama', icon: 'kurumsal' },
  { id: 'sikayetler', label: 'Şikâyetlerim', icon: 'sikayet' },
]

/** Hesap değiştirici seçenekleri — bireysel hesap ile emlak ofisi mağazaları arasında geçiş. */
const hesaplar = [
  { id: 'bireysel', label: 'Mehmet Yılmaz', meta: 'Bireysel hesap · Doğrulanmış' },
  { id: 'ege-arsa', label: 'Ege Arsa Ofisi', meta: 'Kurumsal mağaza · Pro üyelik' },
  { id: 'yatirim', label: 'Arsa Yatırım A.Ş.', meta: 'Kurumsal mağaza · Beklemede' },
]

/** İlan alt kırılımları — grup, seçili öğe içerideyse açık başlar. */
const ilanAltIdler = ['ilanlar', 'ilanlar-yayinda', 'ilanlar-moderasyon', 'ilanlar-suresi-dolan']

export function AccountShell({ selected, title, children }: { selected: string; title: string; children: ReactNode }) {
  const [menuAcik, setMenuAcik] = useState(false)
  const [paletAcik, setPaletAcik] = useState(false)
  const [hesap, setHesap] = useState(hesaplar[0].id)

  const okunmamisMesaj = konusmalar.reduce((toplam, k) => toplam + k.okunmadi, 0)
  const okunmamisBildirim = bildirimler.filter((b) => b.okunmadi).length
  const yayindaSayisi = ilanlar.filter((i) => i.durum === 'yayinda').length
  const moderasyondaSayisi = ilanlar.filter((i) => i.durum === 'moderasyon-bekliyor').length
  const bekleyenToplam = okunmamisMesaj + okunmamisBildirim

  // ⌘K / Ctrl+K komut paletini açar — kenar çubuğundaki "Ara" ipucunun karşılığı
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletAcik(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const secim = (id: string) => {
    setMenuAcik(false)
    if (id === 'ara') setPaletAcik(true)
  }

  // Kenar çubuğu iki yerde kullanılır: geniş ekranda cam ray, dar ekranda flat çekmece içeriği.
  const nav = (material: 'glass' | 'flat') => (
    <GlassSidebar
      selected={selected}
      onSelect={secim}
      material={material}
      aria-label="Hesap bölümleri"
      className={material === 'flat' ? styles.drawerNav : undefined}
    >
      <GlassSidebar.Switcher
        options={hesaplar}
        value={hesap}
        onValueChange={setHesap}
        label="Hesap veya mağaza seç"
        action={{ label: 'Yeni mağaza oluştur', onSelect: noop }}
      />

      <GlassSidebar.Item id="ara" icon={<PageIcon name="ara" />} hint="⌘K">
        Ara
      </GlassSidebar.Item>
      <GlassSidebar.Item id="ozet" icon={<PageIcon name="ozet" />}>
        Hesap Özeti
      </GlassSidebar.Item>
      <GlassSidebar.Item
        id="mesajlar"
        icon={<PageIcon name="mesaj" />}
        badge={okunmamisMesaj || undefined}
        badgeLabel="okunmamış mesaj"
      >
        Mesajlar
      </GlassSidebar.Item>
      <GlassSidebar.Item
        id="bildirimler"
        icon={<PageIcon name="bildirim" />}
        badge={okunmamisBildirim || undefined}
        badgeLabel="okunmamış bildirim"
      >
        Bildirimler
      </GlassSidebar.Item>

      <GlassSidebar.Section label="Portföyüm">
        <GlassSidebar.Group
          label="İlanlarım"
          icon={<PageIcon name="arsa" />}
          defaultOpen={ilanAltIdler.includes(selected)}
        >
          <GlassSidebar.Item id="ilanlar">Tüm ilanlarım</GlassSidebar.Item>
          <GlassSidebar.Item id="ilanlar-yayinda" badge={yayindaSayisi} badgeLabel="yayında ilan">
            Yayında
          </GlassSidebar.Item>
          <GlassSidebar.Item id="ilanlar-moderasyon" badge={moderasyondaSayisi} badgeLabel="moderasyonda ilan">
            Onay bekleyen
          </GlassSidebar.Item>
          <GlassSidebar.Item id="ilanlar-suresi-dolan">Süresi dolan</GlassSidebar.Item>
        </GlassSidebar.Group>
        <GlassSidebar.Item id="doping" icon={<PageIcon name="doping" />}>
          Öne Çıkar · Doping
        </GlassSidebar.Item>
        <GlassSidebar.Item id="faturalar" icon={<PageIcon name="fatura" />}>
          Faturalarım
        </GlassSidebar.Item>
      </GlassSidebar.Section>

      <GlassSidebar.Section label="Alıcı tarafım">
        <GlassSidebar.Item id="kaydettiklerim" icon={<PageIcon name="kalp" />}>
          Kaydettiklerim
        </GlassSidebar.Item>
        <GlassSidebar.Item id="alarmlar" icon={<PageIcon name="alarm" />}>
          Arama Alarmları
        </GlassSidebar.Item>
        <GlassSidebar.Item id="karsilastirmalar" icon={<PageIcon name="karsilastir" />}>
          Karşılaştırmalarım
        </GlassSidebar.Item>
      </GlassSidebar.Section>

      <GlassSidebar.Section label="AI vizyon">
        <GlassSidebar.Item id="ai-degerleme" icon={<PageIcon name="ai" />} badge="Yeni">
          AI Değerleme
        </GlassSidebar.Item>
        <GlassSidebar.Item id="ai-vizyon" icon={<PageIcon name="vizyon" />}>
          Uydu ve İmar Analizi
        </GlassSidebar.Item>
        <GlassSidebar.Item id="ai-radar" icon={<PageIcon name="radar" />}>
          Fiyat Radarı
        </GlassSidebar.Item>
      </GlassSidebar.Section>

      <GlassSidebar.Footer>
        <GlassSidebar.Item id="kurumsal" icon={<PageIcon name="kurumsal" />}>
          Kurumsal Doğrulama
        </GlassSidebar.Item>
        <GlassSidebar.Item id="sikayetler" icon={<PageIcon name="sikayet" />}>
          Şikâyetlerim
        </GlassSidebar.Item>
        <GlassSidebar.Item id="ayarlar" icon={<PageIcon name="ayarlar" />} hint="⌘,">
          Profil ve Ayarlar
        </GlassSidebar.Item>
        <GlassSidebar.Item id="cikis" icon={<PageIcon name="cikis" />}>
          Çıkış Yap
        </GlassSidebar.Item>
      </GlassSidebar.Footer>
    </GlassSidebar>
  )

  return (
    <div className={styles.accountShell}>
      <div className={styles.rail}>{nav('glass')}</div>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuAcik}
            aria-label={
              bekleyenToplam
                ? `Hesap menüsü, ${bekleyenToplam} bekleyen bildirim`
                : 'Hesap menüsü'
            }
            onClick={() => setMenuAcik(true)}
          >
            <PageIcon name="menu" size={18} />
            <span aria-hidden>Hesap menüsü</span>
            {bekleyenToplam ? (
              <span className={styles.menuBadge} aria-hidden>
                {bekleyenToplam}
              </span>
            ) : null}
          </button>
          <h1 className={styles.pageTitle}>{title}</h1>
        </div>
        {children}
      </main>

      <GlassDrawer open={menuAcik} onClose={() => setMenuAcik(false)} side="left" size="sm" title="Hesabım">
        {nav('flat')}
      </GlassDrawer>

      <GlassCommandPalette
        open={paletAcik}
        onClose={() => setPaletAcik(false)}
        placeholder="İlan, mesaj veya işlem ara…"
        commands={[
          { id: 'yeni-ilan', label: 'Yeni ilan ver', group: 'Hızlı işlem', hint: '⌘N', onSelect: noop },
          { id: 'degerleme', label: 'AI değerleme başlat', group: 'Hızlı işlem', onSelect: noop },
          { id: 'alarm', label: 'Arama alarmı oluştur', group: 'Hızlı işlem', onSelect: noop },
          { id: 'g-ilanlar', label: 'İlanlarıma git', group: 'Git', onSelect: noop },
          { id: 'g-mesajlar', label: 'Mesajlara git', group: 'Git', onSelect: noop },
          { id: 'g-faturalar', label: 'Faturalarıma git', group: 'Git', onSelect: noop },
          { id: 'g-ayarlar', label: 'Profil ve ayarlara git', group: 'Git', hint: '⌘,', onSelect: noop },
        ]}
      />
    </div>
  )
}
