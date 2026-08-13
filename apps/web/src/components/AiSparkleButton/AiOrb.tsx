// AI küresi — composer kapsülünün solundaki kimlik göstergesi. Gif tamamen
// kaldırıldı; yerine thinking-orbs'un noktalı durum orb'u çizilir (canvas,
// tek renk, arka plansız — Kağıt temasına sabit koyu mürekkep).
// Boştayken sakin 'breathing' durur; sohbet motoru yanıt üretirken çağıran
// taraf niyetin durumunu geçirir (searching/solving/connecting…) ve küre
// o animasyona geçer. Reduced-motion'u paket kendisi ele alır (statik kare).
// Salt dekoratif — GlassChatDock'un composerOrnament yuvası kapsayıcıyı
// zaten aria-hidden işaretler.
import { ThinkingOrb, type OrbState } from 'thinking-orbs'
import styles from './AiOrb.module.css'

export function AiOrb({ state = 'breathing' }: { state?: OrbState }) {
  return (
    <span className={styles.orb}>
      <ThinkingOrb state={state} size={64} theme="light" style={{ width: '100%', height: '100%' }} />
    </span>
  )
}
