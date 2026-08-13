// AI kıvılcım butonu — ahmeetseker/ai-btn-deneme laboratuvarındaki #3
// ("Sparkle · Animated Star") butonunun siteye uyarlanmış hâli: sağ altta
// yüzen, cam küre içinde WebGL ızgara dalgası + nabız atan dört uçlu yıldız.
// Tıklayınca yıldız patlama animasyonu oynar ve AI danışmana gidilir.
//
// Reduced-motion: shader hiç kurulmaz, nabız/parıltı animasyonları durur —
// buton statik cam küre + yıldız olarak kalır; patlama beklenmeden gidilir.
import { useEffect, useState } from 'react'
import RippleGrid from './RippleGrid'
import styles from './AiSparkleButton.module.css'

const STAR_PATH = 'M50 4 L57 43 L96 50 L57 57 L50 96 L43 57 L4 50 L43 43 Z'

function FourPointStar({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden focusable="false">
      <path d={STAR_PATH} fill={color} />
    </svg>
  )
}

export interface AiSparkleButtonProps {
  /** Tıklanınca (patlama animasyonunun tepe anında) — kabuk sohbeti açar */
  onActivate: () => void
  /** Sohbet kapanınca odağın geri döneceği düğme referansı */
  buttonRef?: React.Ref<HTMLButtonElement>
}

export function AiSparkleButton({ onActivate, buttonRef }: AiSparkleButtonProps) {
  const [bursting, setBursting] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const sorgu = window.matchMedia('(prefers-reduced-motion: reduce)')
    const guncelle = () => setReduced(sorgu.matches)
    guncelle()
    sorgu.addEventListener('change', guncelle)
    return () => sorgu.removeEventListener('change', guncelle)
  }, [])

  const handleClick = () => {
    if (reduced) {
      onActivate()
      return
    }
    setBursting(true)
    // Patlama animasyonunun tepe anında yönlendir — bekletme hissi vermeden
    // tıklamanın ödülü görünür (lab'daki 900ms döngünün ilk perdesi).
    window.setTimeout(onActivate, 350)
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label="AI danışman"
      title="AI danışman"
      aria-haspopup="dialog"
      className={[styles.root, bursting ? styles.bursting : ''].filter(Boolean).join(' ')}
    >
      <span aria-hidden className={styles.dots}>
        {!reduced ? (
          <RippleGrid
            gridColor="#ece2d0"
            gridSize={12}
            gridThickness={14}
            rippleIntensity={0.04}
            glowIntensity={0.15}
            fadeDistance={1.5}
            vignetteStrength={2.2}
            opacity={0.55}
            mouseInteraction={false}
          />
        ) : null}
      </span>

      <span aria-hidden className={styles.glass} />
      <span aria-hidden className={styles.ring} />

      <span className={styles.content} aria-hidden>
        <span className={styles.halo} />
        <span className={`${styles.satellite} ${styles.satelliteTl}`}>
          <FourPointStar size={9} color="#b9a98a" />
        </span>
        <span className={`${styles.satellite} ${styles.satelliteBr}`}>
          <FourPointStar size={11} color="#b9a98a" />
        </span>
        <span className={styles.star}>
          <FourPointStar size={34} color="#8a6b3f" />
        </span>
      </span>
    </button>
  )
}
