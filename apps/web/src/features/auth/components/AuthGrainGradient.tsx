import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { grainRampasi, type Rgb } from './grain-rampasi'

/**
 * Auth marka panelinin animasyonlu grain-gradient zemini.
 *
 * Fragment shader'ı Paper Design'ın açık kaynak `@paper-design/shaders`
 * paketindeki `grain-gradient` (Apache-2.0) uyarlamasıdır: referans tasarımın
 * kullandığı efektin ta kendisi. Paketi bağımlılık olarak eklemek yerine
 * shader'ın yalnız gereken dalı (`corners`) buraya taşındı — projede zaten
 * `ogl` var (bkz. `src/demo/GradientBlinds.tsx`), ikinci bir WebGL çalışma
 * zamanı taşımanın anlamı yok. İki sapma:
 *
 * 1. Özgün shader rastgeleliği önceden hesaplanmış bir gürültü DOKUSUNDAN
 *    okur; burada prosedürel `hash21` kullanılır — panel için ek bir ikili
 *    varlık indirtmemek adına.
 * 2. Sizing uniform'ları (fit/scale/offset/rotation) atıldı: panel her zaman
 *    kabı kaplar, kısa kenar [-0.5, 0.5] aralığına eşlenir ("cover").
 *
 * Renkler prop olarak GEÇİLMEZ, `--lg-accent` token'ından türetilir
 * (`grainRampasi`): panelin rengi temaya ve markaya tek kaynaktan bağlı kalır.
 *
 * Canvas DEKORATİFTİR — `aria-hidden` taşıyan panelin içinde durur ve kendisi
 * de erişilebilirlik ağacına girmez. WebGL2 yoksa hiç çizilmez; altındaki CSS
 * degrade görünür kalır (bkz. AuthBrandPanel.module.css `.panel`).
 */

const vertexShader = /* glsl */ `#version 300 es
in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = /* glsl */ `#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;
uniform vec3 u_colors[4];
uniform float u_softness;
uniform float u_intensity;
uniform float u_noise;

out vec4 fragColor;

const float COLOR_COUNT = 4.0;

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Özgün shader'daki doku tabanlı randomizer'ın prosedürel karşılığı.
float randomR(vec2 p) {
  vec2 q = fract(floor(p) * vec2(0.3183099, 0.3678794)) + 0.1;
  q += dot(q, q + 19.19);
  return fract(q.x * q.y);
}

float valueNoiseR(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec4 fbmR(vec2 n0, vec2 n1, vec2 n2, vec2 n3) {
  float amplitude = 0.2;
  vec4 total = vec4(0.0);
  for (int i = 0; i < 3; i++) {
    n0 = rotate(n0, 0.3);
    n1 = rotate(n1, 0.3);
    n2 = rotate(n2, 0.3);
    n3 = rotate(n3, 0.3);
    total.x += valueNoiseR(n0) * amplitude;
    total.y += valueNoiseR(n1) * amplitude;
    total.z += valueNoiseR(n2) * amplitude;
    total.z += valueNoiseR(n3) * amplitude;
    n0 *= 1.99;
    n1 *= 1.99;
    n2 *= 1.99;
    n3 *= 1.99;
    amplitude *= 0.6;
  }
  return total;
}

void main() {
  // İlk kare tamamen düz bir zemin olmasın diye özgün shader'ın zaman kaydırması.
  float t = 0.1 * (u_time + 7.0);

  // "Cover" eşleme: kısa kenar [-0.5, 0.5]. Uzun kenar taşar — dikey panelde
  // desen ezilmez, kırpılır.
  float shortSide = min(u_resolution.x, u_resolution.y);
  vec2 centered = gl_FragCoord.xy - 0.5 * u_resolution;
  vec2 shape_uv = centered / shortSide;

  // Grain CSS pikseline kilitlenir: cihaz pikseline bağlansaydı retina
  // ekranda dokusu görünmez hâle gelirdi.
  vec2 grain_uv = centered / max(u_pixelRatio, 0.001) * 0.45;

  // --- Şekil: "corners" ---------------------------------------------------
  // Karşılıklı iki köşeye tutunan, birbirinden bağımsız periyotlarla salınan
  // iki yumuşak kütle. Referans panelin dikey turuncu bandı bu.
  shape_uv *= 0.6;
  vec2 outer = vec2(0.5);

  vec2 bl = smoothstep(vec2(0.0), outer, shape_uv + vec2(0.1 + 0.1 * sin(3.0 * t), 0.2 - 0.1 * sin(5.25 * t)));
  vec2 tr = smoothstep(vec2(0.0), outer, 1.0 - shape_uv);
  float shape = 1.0 - bl.x * bl.y * tr.x * tr.y;

  shape_uv = -shape_uv;
  bl = smoothstep(vec2(0.0), outer, shape_uv + vec2(0.1 + 0.1 * sin(3.0 * t), 0.2 - 0.1 * cos(5.25 * t)));
  tr = smoothstep(vec2(0.0), outer, 1.0 - shape_uv);
  shape -= bl.x * bl.y * tr.x * tr.y;

  shape = 1.0 - smoothstep(0.0, 1.0, shape);

  // --- Grain --------------------------------------------------------------
  float baseNoise = snoise(grain_uv * 0.5);
  vec4 fbmVals = fbmR(
    0.002 * grain_uv + 10.0,
    0.003 * grain_uv,
    0.001 * grain_uv,
    rotate(0.4 * grain_uv, 2.0)
  );
  float grainDist = baseNoise * snoise(grain_uv * 0.2) - fbmVals.x - fbmVals.y;
  float rawNoise = 0.75 * baseNoise - fbmVals.w - fbmVals.z;
  float noise = clamp(rawNoise, 0.0, 1.0);

  // Grain ŞEKLİ bozar, üstüne bindirilmez: renk bantlarının sınırı piksel
  // piksel kaydığı için geçiş taranmış gibi görünür — efektin özü budur.
  shape += u_intensity * 2.0 / COLOR_COUNT * (grainDist + 0.5);
  shape += u_noise * 10.0 / COLOR_COUNT * noise;

  float aa = fwidth(shape);

  shape = clamp(shape - 0.5 / COLOR_COUNT, 0.0, 1.0);
  float totalShape = smoothstep(0.0, u_softness + 2.0 * aa, clamp(shape * COLOR_COUNT, 0.0, 1.0));
  float mixer = shape * (COLOR_COUNT - 1.0);

  vec3 gradient = u_colors[0];
  for (int i = 1; i < 4; i++) {
    float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
    localT = smoothstep(0.5 - 0.5 * u_softness - aa, 0.5 + 0.5 * u_softness + aa, localT);
    gradient = mix(gradient, u_colors[i], localT);
  }

  // Zemin ilk duraktır: şekil sıfıra indiğinde panel rampanın dibine düşer,
  // araya ayrı bir arka plan rengi girmez.
  vec3 color = mix(u_colors[0], gradient, totalShape);

  fragColor = vec4(color, 1.0);
}
`

/** Retina'da 2x grain çizmek görsel kazanç sağlamaz, doldurma maliyetini ikiye katlar. */
const MAX_DPR = 1.5

/** `--lg-accent` okunamazsa (test ortamı, token yüklenmemiş) kullanılan amber. */
const VARSAYILAN_ACCENT = '#7c3806'

export interface AuthGrainGradientProps {
  className?: string
}

export function AuthGrainGradient({ className }: AuthGrainGradientProps) {
  const kapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const kap = kapRef.current
    if (!kap) return

    // WebGL2 desteğini bağlam AÇMADAN ele: `getContext` çağırmak jsdom'da
    // "not implemented" gürültüsü, gerçek tarayıcıda ise boşuna bir GPU
    // bağlamı üretir. Shader `#version 300 es` — WebGL1'de zaten derlenmez.
    if (typeof WebGL2RenderingContext === 'undefined') return

    const azalt = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    let renderer: Renderer | null = null
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, MAX_DPR),
        alpha: false,
        antialias: false,
        // Panel sürekli yeniden çizilir; tarayıcının okuma için sakladığı
        // arka tampon kimseye lazım değil.
        preserveDrawingBuffer: false,
      })
    } catch {
      // WebGL yok (eski tarayıcı, GPU engelli, headless). CSS degrade kalır.
      return
    }

    // ogl WebGL1'e düşebilir; shader `#version 300 es`. Düşerse hiç çizme.
    if (!renderer.isWebgl2) {
      renderer.gl?.getExtension('WEBGL_lose_context')?.loseContext()
      return
    }

    const gl = renderer.gl
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.style.inlineSize = '100%'
    canvas.style.blockSize = '100%'
    canvas.style.display = 'block'
    kap.appendChild(canvas)

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue('--lg-accent').trim() ||
      VARSAYILAN_ACCENT
    const rampa = grainRampasi(accent)

    const uniforms = {
      u_resolution: { value: [1, 1] },
      u_pixelRatio: { value: renderer.dpr },
      u_time: { value: 0 },
      u_colors: { value: rampa.flatMap((renk: Rgb) => [...renk]) },
      // Yumuşak geçiş: sert bant kenarı grain'i posterize eder.
      u_softness: { value: 1 },
      // Bant sınırlarının bozulma miktarı — dumanlı kenarı bu üretir.
      u_intensity: { value: 0.32 },
      // Grain yoğunluğu. Referans paneldeki taranmış doku bu değere bağlı.
      u_noise: { value: 0.5 },
    }

    const program = new Program(gl, { vertex: vertexShader, fragment: fragmentShader, uniforms })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    let cizimBekliyor = false
    const ciz = () => {
      cizimBekliyor = false
      renderer.render({ scene: mesh })
    }

    const olcule = () => {
      const { width, height } = kap.getBoundingClientRect()
      if (width < 1 || height < 1) return
      renderer.setSize(width, height)
      uniforms.u_resolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight]
      // Hareket kapalıyken de yeniden boyutlanma tek kare ister; canvas
      // aksi hâlde gerilmiş eski kareyi gösterir.
      if (!cizimBekliyor) {
        cizimBekliyor = true
        requestAnimationFrame(ciz)
      }
    }

    olcule()

    const ro = new ResizeObserver(olcule)
    ro.observe(kap)

    // --- Döngü --------------------------------------------------------------
    // Üç ayrı sebeple durur: hareket tercihi kapalıysa (tek kare), sekme
    // görünmüyorsa, panel görüntü alanının dışındaysa. Sonuncusu uzun kayıt
    // formlarında önemli: `/kayit/kurumsal` sütunu ekranı kat kat aşıyor.
    let rafId: number | null = null
    let gorunur = true
    let baslangic: number | null = null

    const donuyorMu = () => gorunur && !document.hidden && !azalt?.matches

    const dongu = (zaman: number) => {
      if (baslangic === null) baslangic = zaman
      uniforms.u_time.value = (zaman - baslangic) / 1000
      renderer.render({ scene: mesh })
      rafId = requestAnimationFrame(dongu)
    }

    const senkronla = () => {
      if (donuyorMu()) {
        if (rafId === null) rafId = requestAnimationFrame(dongu)
        return
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      // Duruş kararı hangi sebeple verilirse verilsin panel BOŞ kalmamalı:
      // durdurulmuş hâlde son zaman değerinde tek kare çizilir.
      if (!cizimBekliyor) {
        cizimBekliyor = true
        requestAnimationFrame(ciz)
      }
    }

    const io = new IntersectionObserver((girisler) => {
      gorunur = girisler.some((g) => g.isIntersecting)
      senkronla()
    })
    io.observe(kap)

    document.addEventListener('visibilitychange', senkronla)
    azalt?.addEventListener('change', senkronla)

    // Bağlam kaybı (GPU sıfırlama, sekme uykusu): döngüyü durdur, yeniden
    // kurma girişiminde bulunma — CSS degrade zaten altında duruyor.
    const baglamKaybi = (olay: Event) => {
      olay.preventDefault()
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }
    canvas.addEventListener('webglcontextlost', baglamKaybi)

    senkronla()

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', senkronla)
      azalt?.removeEventListener('change', senkronla)
      canvas.removeEventListener('webglcontextlost', baglamKaybi)
      canvas.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <div ref={kapRef} className={className} aria-hidden="true" />
}
