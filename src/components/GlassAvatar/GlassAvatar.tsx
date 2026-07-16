import { useEffect, useState, type HTMLAttributes } from 'react'
import styles from './GlassAvatar.module.css'

export interface GlassAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Görsel URL'i; yüklenemezse baş harf fallback'ine düşülür */
  src?: string
  /** Görsel alternatif metni; verilmezse `name`'den türetilir. İkisi de yoksa dekoratif sayılır */
  alt?: string
  /** Baş harf fallback'i + alt türetme kaynağı (Türkçe locale ile büyütülür) */
  name?: string
  /** Boyutlar sabittir: 24/32/40/56/72px — responsive DEĞİL (bkz. rules.md) */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'rounded'
  /** Baş harf zemini; verilmezse `name`'den deterministik pastel üretilir */
  tint?: string
  /** Sağ altta durum noktası */
  status?: 'online' | 'offline' | 'busy'
}

const STATUS_LABEL: Record<NonNullable<GlassAvatarProps['status']>, string> = {
  online: 'çevrim içi',
  offline: 'çevrim dışı',
  busy: 'meşgul',
}

/** İlk ve son kelimenin baş harfi — Türkçe locale (i → İ) ile büyütülür */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = words[0][0] ?? ''
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : ''
  return (first + last).toLocaleUpperCase('tr')
}

/** name'den deterministik pastel: basit hash → hue; doygunluk/açıklık sabit (her zaman açık zemin) */
function pastelOf(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  const hue = Math.abs(h) % 360
  return `hsl(${hue} 48% 74%)`
}

export function GlassAvatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  tint,
  status,
  className,
  style,
  ...rest
}: GlassAvatarProps) {
  const [failed, setFailed] = useState(false)
  // src değişirse yükleme hatası durumu sıfırlanır (yeni görsel yeniden denenir)
  useEffect(() => setFailed(false), [src])

  const showImage = Boolean(src) && !failed
  const accessibleAlt = alt ?? name ?? ''
  const initials = name ? initialsOf(name) : ''
  const fallbackBg = tint ?? (name ? pastelOf(name) : undefined)

  const classes = [
    styles.avatar,
    styles[size],
    shape === 'rounded' ? styles.rounded : styles.circle,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} style={style} {...rest}>
      {showImage ? (
        <img className={styles.image} src={src} alt={accessibleAlt} onError={() => setFailed(true)} />
      ) : (
        <span
          className={styles.initials}
          // Dekoratif değilse (alt/name var) resim rolüyle isimlendirilir; yoksa AT'den gizlenir
          role={accessibleAlt ? 'img' : undefined}
          aria-label={accessibleAlt || undefined}
          aria-hidden={accessibleAlt ? undefined : true}
          style={fallbackBg ? { backgroundColor: fallbackBg } : undefined}
        >
          <span aria-hidden="true">{initials}</span>
        </span>
      )}
      {status ? (
        <>
          <span className={[styles.status, styles[status]].join(' ')} aria-hidden="true" />
          <span className={styles.srOnly}>{STATUS_LABEL[status]}</span>
        </>
      ) : null}
    </span>
  )
}
