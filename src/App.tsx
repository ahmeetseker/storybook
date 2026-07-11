import { GlassButton, GlassNavbar } from './index'
import './App.css'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#ff9a9e,#a18cd1,#8fd3f4)' }}>
      <GlassNavbar title="liquid-glass-ui" onBack={() => history.back()} backLabel="Geri" actions={<button>Paylaş</button>} />
      <div style={{ display: 'grid', placeItems: 'center', height: '70vh' }}>
        <GlassButton size="xl" onClick={() => {}}>Bas ve sıvılaşmayı izle</GlassButton>
      </div>
    </div>
  )
}
