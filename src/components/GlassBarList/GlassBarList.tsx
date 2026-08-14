// GlassBarList — etiket + yatay yüzde barı + değer satırlarından oluşan
// dağılım listesi (yaş dağılımı, eğitim durumu, alt bölge nüfusu…).
// GlassDistributionChart'ın alternatifi DEĞİLDİR: orada eksenli histogram ve
// medyan bandı vardır; burada her satır adıyla okunan kategorik paylar vardır.
//
// Erişilebilirlik kararı: bilgi tamamen metinde taşınır (etiket + değer);
// bar salt görsel orandır ve `aria-hidden` ile ağaçtan çıkarılır. Böylece
// ekran okuyucu her satırı "Üniversite, %42" diye okur, genişlik yüzdesiyle
// boğulmaz.
import type { HTMLAttributes } from 'react'
import styles from './GlassBarList.module.css'

export interface GlassBarListItem {
  id: string
  label: string
  /** Ham değer — yüzde ya da mutlak sayı; genişlik `scale`e göre türetilir */
  value: number
  /** Görünür değer metnini tek öğe için ezer ("veri yok" gibi) */
  valueLabel?: string
  /** Vurgulu satır — ör. alt bölge dağılımında sayfanın kendi bölgesi */
  prominent?: boolean
}

export interface GlassBarListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: GlassBarListItem[]
  /** Erişilebilir liste adı — zorunlu ("Yaş dağılımı") */
  label: string
  /**
   * Genişlik ölçeği: `total` değerin toplam içindeki payı (yüzde verisinde
   * genişlik = değerin kendisi), `max` en büyük değeri %100'e oturtur
   * (mutlak sayılarda sıralamayı okutur).
   */
  scale?: 'total' | 'max'
  /** Bar rengi; verilmezse vurgu token'ı */
  tint?: string
  /** Görünür değer biçimi; varsayılan `%{value}` (tr-TR) */
  formatValue?: (value: number) => string
}

const defaultFormat = (value: number) => `%${value.toLocaleString('tr-TR')}`

/**
 * Kategorik payları satır satır okutan yatay bar listesi. İçerik katmanıdır:
 * kendi cam yüzeyi yoktur, içine konduğu kartın zeminini kullanır.
 */
export function GlassBarList({
  items,
  label,
  scale = 'total',
  tint,
  formatValue = defaultFormat,
  className,
  style,
  ...rest
}: GlassBarListProps) {
  const denominator =
    scale === 'max'
      ? Math.max(...items.map((i) => i.value), 0)
      : items.reduce((sum, i) => sum + i.value, 0)

  const classes = [styles.root, className].filter(Boolean).join(' ')
  const rootStyle = tint ? ({ ...style, '--bar-tint': tint } as React.CSSProperties) : style

  return (
    <div role="list" aria-label={label} className={classes} style={rootStyle} {...rest}>
      {items.map((item) => {
        const pct = denominator > 0 ? (item.value / denominator) * 100 : 0
        return (
          <div
            key={item.id}
            role="listitem"
            className={styles.row}
            data-prominent={item.prominent ? 'true' : undefined}
          >
            <span className={styles.label}>{item.label}</span>
            <span className={styles.track} data-part="track" aria-hidden="true">
              <span className={styles.fill} data-part="fill" style={{ width: `${pct}%` }} />
            </span>
            <span className={styles.value}>{item.valueLabel ?? formatValue(item.value)}</span>
          </div>
        )
      })}
    </div>
  )
}
