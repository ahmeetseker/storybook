import { GlassButton, GlassNavbar } from './index'
import { GradientBlinds } from './demo/GradientBlinds'
import './App.css'

const blindsColors = ['#FF9FFC', '#5227FF', '#50dee5']

export default function App() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#0b0b14' }}>
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
      <div style={{ position: 'relative' }}>
        <GlassNavbar title="liquid-glass-ui" onBack={() => history.back()} backLabel="Geri" actions={<button>Paylaş</button>} />
        <div style={{ display: 'grid', placeItems: 'center', height: '70vh' }}>
          <GlassButton size="xl" tone="light" onClick={() => {}}>Bas ve sıvılaşmayı izle</GlassButton>
        </div>
      </div>
    </div>
  )
}
