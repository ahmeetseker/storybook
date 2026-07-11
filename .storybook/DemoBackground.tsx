import type { CSSProperties, ReactNode } from 'react'

const palettes: Record<string, string> = {
  vivid: 'linear-gradient(135deg,#ff9a9e 0%,#fad0c4 25%,#a18cd1 50%,#fbc2eb 75%,#8fd3f4 100%)',
  dark: 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)',
  mono: 'linear-gradient(135deg,#e0e0e0 0%,#f5f5f5 100%)',
}

const blob = (size: number, color: string, top: string, left: string): CSSProperties => ({
  position: 'absolute', width: size, height: size, top, left,
  borderRadius: '50%', background: color, filter: 'blur(2px)',
})

export function DemoBackground({ variant, children }: { variant: string; children: ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: palettes[variant] ?? palettes.vivid, padding: '4rem 2rem' }}>
      <div style={blob(180, '#ff5e62', '8%', '12%')} />
      <div style={blob(240, '#36d1dc', '55%', '65%')} />
      <div style={blob(120, '#f9d423', '70%', '20%')} />
      <p style={{ position: 'absolute', top: '30%', left: '8%', maxWidth: 420, fontSize: 22, lineHeight: 1.5, color: variant === 'dark' ? '#cfd8dc' : '#37474f' }}>
        Liquid Glass, arkasındaki içeriği mercek gibi kırar. Bu metin ve renkli
        şekiller, kırılmanın gözle görülmesi için buradadır. Kaydırınca camın
        kenarlarındaki bükülmeye dikkat edin.
      </p>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
