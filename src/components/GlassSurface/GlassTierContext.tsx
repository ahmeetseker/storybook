import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { detectTier, type GlassTier } from '../../core/tier'

const GlassTierContext = createContext<GlassTier | null>(null)

export function GlassTierProvider({ tier, children }: { tier: GlassTier; children: ReactNode }) {
  return <GlassTierContext.Provider value={tier}>{children}</GlassTierContext.Provider>
}

export function useGlassTier(): GlassTier {
  const fromContext = useContext(GlassTierContext)
  const detected = useMemo(() => (typeof navigator === 'undefined' ? 'fallback' : detectTier()), [])
  return fromContext ?? detected
}
