// Arama sonuçları (/ara) — AI filtre çipleri, liste/harita/bölünmüş görünüm,
// sol filtre paneli ve stilize harita placeholder'ı. Cam yalnız kontrol katmanında.
import { useState, type CSSProperties } from 'react'
import { GlassButton } from '../components/GlassButton'
import { GlassListingCard } from '../components/GlassListingCard'
import { PublicShell } from './shared/shells'
import { EidsBadge, Field, Select, CheckRow, TextInput } from './shared/forms'
import { ilanlar } from './shared/data'

const noop = () => {}

export type AramaGorunumu = 'liste' | 'harita' | 'bolunmus'

const flatCard: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  boxSizing: 'border-box',
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.8-3.8" />
  </svg>
)

/** AI'ın sorgudan ürettiği, kaldırılabilir görünümlü filtre çipi */
function FiltreCipi({ children }: { children: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 6px 5px 12px',
        borderRadius: 'var(--lg-radius-capsule, 999px)',
        border: '1px solid var(--lg-hairline)',
        background: 'var(--lg-surface)',
        fontSize: 'var(--lg-text-footnote, 13px)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
      <button
        type="button"
        aria-label={`Filtreyi kaldır: ${children}`}
        onClick={noop}
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          border: 'none',
          background: 'transparent',
          color: 'var(--lg-label-secondary)',
          font: 'inherit',
          fontSize: 13,
          lineHeight: 1,
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        ×
      </button>
    </span>
  )
}

/** Stilize harita placeholder'ı — gerçek harita yok, GlassLocationCard deseninde ızgara */
function HaritaPlaceholder({ yukseklik = '100%' }: { yukseklik?: number | string }) {
  const pinler = [
    { left: '22%', top: '30%', fiyat: '4.25M' },
    { left: '58%', top: '46%', fiyat: '6.9M' },
    { left: '40%', top: '64%', fiyat: '1.85M' },
    { left: '72%', top: '24%', fiyat: '3.1M' },
  ]
  return (
    <div
      role="img"
      aria-label="Harita görünümü (temsilî)"
      style={{
        position: 'relative',
        height: yukseklik,
        minHeight: 320,
        borderRadius: 'var(--lg-radius-card, 20px)',
        border: '1px solid var(--lg-hairline)',
        overflow: 'hidden',
        background:
          'repeating-linear-gradient(0deg, transparent 0 34px, rgba(255,255,255,0.16) 34px 36px),' +
          'repeating-linear-gradient(90deg, transparent 0 46px, rgba(255,255,255,0.16) 46px 48px),' +
          'linear-gradient(135deg, #4a7a63, #2f5546)',
      }}
    >
      {pinler.map((p) => (
        <span
          key={p.fiyat}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            transform: 'translate(-50%, -50%)',
            padding: '4px 10px',
            borderRadius: 999,
            background: 'var(--lg-surface)',
            border: '1px solid var(--lg-hairline)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--lg-label)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          {p.fiyat} TL
        </span>
      ))}
      <span
        style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          padding: '3px 10px',
          borderRadius: 999,
          background: 'rgba(0,0,0,0.45)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        Temsilî harita — konumlar yaklaşıktır
      </span>
    </div>
  )
}

function FiltrePaneli() {
  return (
    <aside
      aria-label="Filtreler"
      style={{ ...flatCard, padding: 'var(--lg-space-5, 20px)', display: 'flex', flexDirection: 'column', gap: 16, width: 248, flex: 'none', position: 'sticky', top: 16 }}
    >
      <h2 style={{ margin: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>Filtreler</h2>
      <Field label="İmar durumu">
        {(id) => (
          <Select id={id} defaultValue="konut">
            <option value="hepsi">Tümü</option>
            <option value="konut">Konut İmarlı</option>
            <option value="villa">Villa İmarlı</option>
            <option value="turizm">Turizm İmarlı</option>
            <option value="sanayi">Sanayi İmarlı</option>
            <option value="tarla">Tarla</option>
          </Select>
        )}
      </Field>
      <Field label="Tapu durumu">
        {(id) => (
          <Select id={id} defaultValue="hepsi">
            <option value="hepsi">Tümü</option>
            <option value="mustakil">Müstakil Parsel</option>
            <option value="hisseli">Hisseli</option>
            <option value="kat-irtifaki">Kat İrtifakı</option>
          </Select>
        )}
      </Field>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', fontWeight: 600 }}>Fiyat aralığı (TL)</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <TextInput inputMode="numeric" placeholder="Min" aria-label="En düşük fiyat" />
          <TextInput inputMode="numeric" placeholder="Maks" aria-label="En yüksek fiyat" defaultValue="3.000.000" />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <CheckRow label="Yalnız EİDS doğrulanmış ilanlar" defaultChecked />
        <CheckRow label="Yol cepheli" />
        <CheckRow label="Krediye uygun" />
      </div>
      <GlassButton size="sm" onClick={noop}>Filtreleri Uygula</GlassButton>
    </aside>
  )
}

export function Arama({ baslangicGorunumu = 'liste' }: { baslangicGorunumu?: AramaGorunumu }) {
  const [gorunum, setGorunum] = useState<AramaGorunumu>(baslangicGorunumu)
  const sonuclar = ilanlar.filter((i) => i.durum === 'yayinda' || i.durum === 'suresi-doldu' || i.durum === 'eids-bekliyor')

  const gorunumler: { id: AramaGorunumu; label: string }[] = [
    { id: 'liste', label: 'Liste' },
    { id: 'harita', label: 'Harita' },
    { id: 'bolunmus', label: 'Bölünmüş' },
  ]

  const listePaneli = (
    <div style={{ display: 'grid', gridTemplateColumns: gorunum === 'bolunmus' ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, alignContent: 'start' }}>
      {sonuclar.map((ilan) => (
        <GlassListingCard
          key={ilan.id}
          image={ilan.gorsel}
          title={ilan.baslik}
          price={ilan.fiyat}
          location={`${ilan.konum} · ${ilan.m2} · ${ilan.m2Fiyat}`}
          badge={ilan.eidsDogrulandi ? <EidsBadge dogrulandi /> : undefined}
          onClick={noop}
          material="flat"
        />
      ))}
    </div>
  )

  return (
    <PublicShell title="Arsa Ara">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Arama çubuğu + AI sorgusu */}
        <form role="search" onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--lg-label-secondary)', display: 'flex' }} aria-hidden>
              <SearchIcon />
            </span>
            <input
              type="search"
              aria-label="Arsa ara"
              defaultValue={'İzmir\'de 3 milyon altı imarlı arsa, en az 500 metrekare'}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                height: 'var(--lg-control-lg, 48px)',
                padding: '0 16px 0 40px',
                borderRadius: 'var(--lg-radius-capsule, 999px)',
                border: '1px solid var(--lg-hairline)',
                background: 'var(--lg-surface)',
                color: 'var(--lg-label)',
                font: 'inherit',
                fontSize: 'var(--lg-text-body, 15px)',
                outline: 'none',
              }}
            />
          </div>
          <GlassButton type="submit" size="lg" prominent onClick={noop}>Ara</GlassButton>
        </form>

        {/* AI'ın ürettiği filtre çipleri */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--lg-text-caption, 12px)', fontWeight: 600, color: 'var(--lg-label-secondary)' }}>
            Sorgudan anlaşılan filtreler:
          </span>
          <FiltreCipi>Konum: İzmir</FiltreCipi>
          <FiltreCipi>Fiyat: ≤ 3.000.000 TL</FiltreCipi>
          <FiltreCipi>İmar: Konut İmarlı</FiltreCipi>
          <FiltreCipi>Alan: ≥ 500 m²</FiltreCipi>
        </div>

        {/* Araç çubuğu: görünüm geçişi + sıralama + aramayı kaydet */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div role="group" aria-label="Görünüm seçimi" style={{ display: 'flex', gap: 8 }}>
            {gorunumler.map((g) => (
              <GlassButton
                key={g.id}
                size="sm"
                prominent={gorunum === g.id}
                aria-pressed={gorunum === g.id}
                onClick={() => setGorunum(g.id)}
              >
                {g.label}
              </GlassButton>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
              {sonuclar.length} sonuç bulundu
            </span>
            <Select aria-label="Sıralama" defaultValue="akilli" style={{ width: 200, minHeight: 'var(--lg-control-sm, 32px)' }}>
              <option value="akilli">Akıllı sıralama</option>
              <option value="fiyat-artan">Fiyat (önce en düşük)</option>
              <option value="fiyat-azalan">Fiyat (önce en yüksek)</option>
              <option value="m2-fiyat">m² fiyatına göre</option>
              <option value="tarih">Önce en yeni</option>
            </Select>
            <GlassButton size="sm" onClick={noop}>Aramayı Kaydet</GlassButton>
          </div>
        </div>

        {/* İçerik: filtre paneli + sonuçlar / harita */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <FiltrePaneli />
          <div style={{ flex: 1, minWidth: 0 }}>
            {gorunum === 'liste' ? (
              listePaneli
            ) : gorunum === 'harita' ? (
              <HaritaPlaceholder yukseklik={560} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 6fr)', gap: 16, alignItems: 'stretch' }}>
                <div style={{ maxHeight: 640, overflowY: 'auto', paddingRight: 4 }}>{listePaneli}</div>
                <HaritaPlaceholder />
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicShell>
  )
}
