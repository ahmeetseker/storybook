import type { CSSProperties, ReactNode } from 'react'
import { GradientBlinds } from '../src/demo/GradientBlinds'

// light/dark: Apple'ın düz sistem arka planları (iOS systemGroupedBackground / systemBackground).
// blinds/vivid: kırılmanın gözle test edilebildiği canlı arka planlar (toolbar'dan seçilir).
const FLAT: Record<string, { bg: string; label: string; scheme: 'light' | 'dark' }> = {
  light: { bg: '#f2f2f7', label: '#1d1d1f', scheme: 'light' },
  dark: { bg: '#000000', label: '#f5f5f7', scheme: 'dark' },
}

const vividGradient =
  'linear-gradient(135deg,#ff9a9e 0%,#fad0c4 25%,#a18cd1 50%,#fbc2eb 75%,#8fd3f4 100%)'

const blindsColors = ['#FF9FFC', '#5227FF', '#50dee5']

const blob = (size: number, color: string, top: string, left: string): CSSProperties => ({
  position: 'absolute', width: size, height: size, top, left,
  borderRadius: '50%', background: color, filter: 'blur(2px)',
})

export function DemoBackground({ variant, children }: { variant: string; children: ReactNode }) {
  const flat = FLAT[variant]

  if (flat) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: flat.bg, color: flat.label, colorScheme: flat.scheme, padding: '4rem 2rem' }}>
        {children}
      </div>
    )
  }

  const isBlinds = variant === 'blinds'
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: isBlinds ? '#0b0b14' : vividGradient, color: isBlinds ? '#f5f5f7' : '#1d1d1f', padding: '4rem 2rem' }}>
      {isBlinds ? (
        <div style={{ position: 'absolute', inset: 0 }}>
          <GradientBlinds
            gradientColors={blindsColors}
            angle={37}
            noise={0.2}
            blindCount={16}
            blindMinWidth={60}
            spotlightRadius={0.6}
            spotlightSoftness={1}
            spotlightOpacity={0.9}
            mouseDampening={0.25}
          />
        </div>
      ) : (
        <>
          <div style={blob(180, '#ff5e62', '8%', '12%')} />
          <div style={blob(240, '#36d1dc', '55%', '65%')} />
          <div style={blob(120, '#f9d423', '70%', '20%')} />
        </>
      )}
      <p style={{ position: 'absolute', top: '30%', left: '8%', maxWidth: 420, fontSize: 22, lineHeight: 1.5, color: isBlinds ? 'rgba(255,255,255,0.85)' : '#37474f' }}>
        Liquid Glass, arkasındaki içeriği mercek gibi kırar. Bu metin ve renkli
        şekiller, kırılmanın gözle görülmesi için buradadır. Kaydırınca camın
        kenarlarındaki bükülmeye dikkat edin.
      </p>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
