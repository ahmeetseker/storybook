// Dock motorunun veri sözleşmesini (`DockZengin`) DS bileşenlerine çevirir.
// Tek kaynak kuralı: kart/grafik burada YENİDEN çizilmez — GlassListingCard,
// GlassChart, GlassSparkline, GlassMetricStrip aynen kullanılır.
import { GlassChart, GlassListingCard, GlassMetricStrip, GlassSparkline } from '@repo/ui'
import { withBase } from '../../config/base-path'
import type { DockBaglanti, DockZengin } from './ai-dock-engine'
import styles from './AiDockIcerik.module.css'

const fiyat = (value: number) => `${value.toLocaleString('tr-TR')} TL`

/**
 * Zengin içerik + isteğe bağlı sayfa bağlantısı. Kart tıklaması tam sayfa
 * gezinme yapar (`window.location.assign`) — dock, router ağacının dışında da
 * (ör. test, storybook) çalışabilsin diye bilinçli olarak router hook'u
 * kullanılmaz; vitrin kartlarının `href` yaklaşımıyla aynı sözleşme.
 */
export function AiDockIcerik({ zengin, baglanti }: { zengin?: DockZengin; baglanti?: DockBaglanti }) {
  if (!zengin && !baglanti) return null
  return (
    <>
      {zengin ? <ZenginBlok zengin={zengin} /> : null}
      {baglanti ? (
        <a className={styles.baglanti} href={withBase(baglanti.yol)}>
          {baglanti.etiket} →
        </a>
      ) : null}
    </>
  )
}

function ZenginBlok({ zengin }: { zengin: DockZengin }) {
  switch (zengin.tur) {
    case 'ilanlar':
      return (
        <div className={styles.ilanlar}>
          {zengin.ilanlar.map((ilan) => (
            <GlassListingCard
              key={ilan.id}
              variant="compact"
              material="flat"
              image={{ src: ilan.image.src, alt: ilan.image.alt }}
              title={ilan.title}
              price={fiyat(ilan.price)}
              location={`${ilan.city}, ${ilan.district} · ${ilan.area.toLocaleString('tr-TR')} m²`}
              onClick={() => window.location.assign(withBase(`/ilan/${ilan.id}`))}
            />
          ))}
        </div>
      )
    case 'grafik':
      return (
        <GlassChart
          type={zengin.tip}
          title={zengin.baslik}
          points={[...zengin.noktalar]}
          valueSuffix={zengin.sonek}
          height={120}
        />
      )
    case 'egilim':
      return (
        <span className={styles.egilim}>
          <GlassSparkline points={[...zengin.noktalar]} label={zengin.etiket} trend={zengin.trend} width={96} height={28} />
          {zengin.notu ? <span className={styles.egilimNotu}>{zengin.notu}</span> : null}
        </span>
      )
    case 'randevu':
      return (
        <div className={styles.randevu}>
          <span className={styles.randevuBaslik}>{zengin.randevu.officeName}</span>
          <span className={styles.randevuDetay}>
            {new Date(`${zengin.randevu.date}T12:00:00`).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              weekday: 'long',
            })}{' '}
            · {zengin.randevu.slot} · ofiste görüşme
          </span>
          <span className={styles.randevuDurum}>
            {zengin.randevu.status === 'confirmed' ? 'Onaylandı' : 'Onay bekliyor'}
          </span>
        </div>
      )
    case 'metrikler':
      return (
        <GlassMetricStrip
          size="sm"
          items={zengin.ogeler.map((oge) => ({ id: oge.id, label: oge.label, value: oge.value, hint: oge.hint }))}
        />
      )
  }
}
