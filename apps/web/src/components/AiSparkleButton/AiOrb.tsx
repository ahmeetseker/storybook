// AI küresi — OrbInput'taki ORİJİNAL animasyonlu küre gif'i, CSS filtresiyle
// marka kahvesine ("Görüşme talep et" CTA tonu) boyanır: görünüm/animasyon
// aynı, yalnız renk değişir. Gif yüklenemezse alttaki token türevi kahve
// küre yedek olarak görünür. Salt dekoratif — GlassChatDock'un
// composerOrnament yuvası kapsayıcıyı zaten aria-hidden işaretler.
import styles from './AiOrb.module.css'

export function AiOrb() {
  return (
    <span className={styles.orb}>
      <img
        className={styles.gif}
        src="https://media.giphy.com/media/26gsuUjoEBmLrNBxC/giphy.gif"
        alt=""
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    </span>
  )
}
