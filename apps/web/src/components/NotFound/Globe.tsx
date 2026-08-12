// 404 sayfasının dönen küresi — `cobe` (WebGL) üstünde ince bir sarmalayıcı.
//
// Neden feature kodunda: Glass DS'te karşılığı olan bir kontrol değil, tek
// kullanımlık dekoratif bir sahne öğesi. Kütüphaneye taşımak, tek sayfada
// yaşayan bir süse sözleşme/story/rules yükü bindirirdi.
import createGlobe, { type COBEOptions } from 'cobe'
import { useEffect, useRef } from 'react'
import styles from './NotFound.module.css'

/** `--lg-accent` (#b45309) — cobe RGB'yi 0–1 aralığında ister. */
const ACCENT_RGB: [number, number, number] = [180 / 255, 83 / 255, 9 / 255]

// Kağıt temaya uygun açık küre; işaretçiler pazarın şehirlerinde.
const GLOBE_CONFIG: COBEOptions = {
  width: 600,
  height: 600,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: ACCENT_RGB,
  glowColor: [1, 1, 1],
  // Tek işaretçi: İstanbul — kaybolan adresin evi belli olsun.
  markers: [{ location: [41.0082, 28.9784], size: 0.08 }],
}

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Sürekli dönüş vestibüler bir hareket: reduced-motion'da küre sabit durur.
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = canvas.offsetWidth
    const handleResize = () => {
      width = canvas.offsetWidth
    }
    window.addEventListener('resize', handleResize)

    let phi = 0
    let raf = 0
    let globe: ReturnType<typeof createGlobe> | undefined
    try {
      globe = createGlobe(canvas, {
        ...GLOBE_CONFIG,
        width: width * 2,
        height: width * 2,
      })

      // cobe v2 kendi kare döngüsünü kurmaz — dönüşü rAF ile biz süreriz.
      // Reduced-motion'da döngü hiç başlamaz; küre tek karesiyle sabit durur.
      if (!reduced) {
        const loop = () => {
          phi += 0.005
          globe?.update({ phi, width: width * 2, height: width * 2 })
          raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
      }
    } catch {
      // WebGL yoksa (eski cihaz, jsdom) sayfa süssüz ama ayakta kalır.
    }

    return () => {
      cancelAnimationFrame(raf)
      globe?.destroy()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={styles.globe} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.globeCanvas} />
    </div>
  )
}
