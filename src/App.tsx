import { GlassButton, GlassNavbar } from './index'
import './App.css'

// Arka plan düz Apple sistem rengi (index.css'teki --lg-bg); light/dark otomatik.
export default function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <GlassNavbar title="liquid-glass-ui" onBack={() => history.back()} backLabel="Geri" actions={<button>Paylaş</button>} />
      <div style={{ display: 'grid', placeItems: 'center', height: '70vh' }}>
        <GlassButton size="xl" onClick={() => {}}>Bas ve sıvılaşmayı izle</GlassButton>
      </div>
    </div>
  )
}
