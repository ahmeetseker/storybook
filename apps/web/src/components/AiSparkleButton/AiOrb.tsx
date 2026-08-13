// AI küresi — composer kapsülünün solundaki marka küresi. Dış asset (gif)
// yerine tamamen token türevi renklerle CSS'te çizilir: zemin `--lg-accent`
// kahvesinin radyal degradesi, üstünde yavaşça dönen bir parlama şeridi
// (yalnız transform animasyonu; prefers-reduced-motion'da durağan).
// Salt dekoratif — GlassChatDock'un composerOrnament yuvası kapsayıcıyı
// zaten aria-hidden işaretler.
import styles from './AiOrb.module.css'

export function AiOrb() {
  return (
    <span className={styles.orb}>
      <span className={styles.sheen} />
    </span>
  )
}
