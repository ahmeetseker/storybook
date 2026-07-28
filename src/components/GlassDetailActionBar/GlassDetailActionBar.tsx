import type { HTMLAttributes } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassDetailActionBar.module.css'

export interface GlassDetailAction {
  /** React `key` ve test/hata ayıklama için tekil kimlik */
  id: string
  /** Butonun görünür ve erişilebilir metni */
  label: string
  /** Tıklama/aktivasyon geri çağırımı */
  onSelect: () => void
  disabled?: boolean
}

export interface GlassDetailUtilityAction extends GlassDetailAction {
  /** Toggle davranışı olan utility'ler için (ör. "Kaydet") — `aria-pressed`'e yansır */
  pressed?: boolean
}

export interface GlassDetailActionBarProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'role' | 'aria-label'> {
  /**
   * Grubun erişilebilir adı — zorunlu. `role="group"` ile birlikte duyurulur;
   * `role`/`aria-label` tip düzeyinde dışarıdan geçirilemez, grubun adı
   * her zaman `label`'dan gelir.
   */
  label: string
  /** Sayfadaki tek prominent CTA */
  primary: GlassDetailAction
  /** En fazla bir tane — ikinci bir prominent eylem yoktur */
  secondary?: GlassDetailAction
  /** Kaydet/paylaş gibi eşit ağırlıklı sessiz eylemler */
  utilities?: GlassDetailUtilityAction[]
  /** Eylemlerin altında küçük bağlam notu (ör. yanıt süresi) */
  note?: string
  /** `rail`: desktop dikey ray · `bar`: mobil alt çubuk (safe-area) — aynı sayfada ikisi birden olmaz */
  layout?: 'rail' | 'bar'
  material?: 'glass' | 'flat'
}

/**
 * İlan detayının karar/iletişim eylem grubu.
 *
 * Cam üstüne cam yasağı gereği yüzeyi yalnız bu component açar; içindeki
 * butonlar `GlassButton`/`GlassIconButton` değil, kendi yüzeylerini üretmeyen
 * düz kontrollerdir. Sayfada tek örnek: ya `layout="rail"` ya `layout="bar"`,
 * asla ikisi birden.
 */
export function GlassDetailActionBar({
  label,
  primary,
  secondary,
  utilities,
  note,
  layout = 'rail',
  material = 'glass',
  className,
  ...rest
}: GlassDetailActionBarProps) {
  return (
    <GlassSurface
      as="section"
      material={material}
      shape={20}
      thickness={0.5}
      data-layout={layout}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={styles.primary}
        onClick={primary.onSelect}
        disabled={primary.disabled}
      >
        {primary.label}
      </button>

      {secondary ? (
        <button
          type="button"
          className={styles.secondary}
          onClick={secondary.onSelect}
          disabled={secondary.disabled}
        >
          {secondary.label}
        </button>
      ) : null}

      {utilities?.length ? (
        <div className={styles.utilities}>
          {utilities.map((utility) => (
            <button
              key={utility.id}
              type="button"
              className={styles.utility}
              onClick={utility.onSelect}
              disabled={utility.disabled}
              aria-pressed={utility.pressed}
            >
              {utility.label}
            </button>
          ))}
        </div>
      ) : null}

      {note ? <p className={styles.note}>{note}</p> : null}
    </GlassSurface>
  )
}
