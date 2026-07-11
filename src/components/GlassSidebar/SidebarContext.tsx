import { createContext, useContext } from 'react'

export interface SidebarContextValue {
  selected?: string
  onSelect?: (id: string) => void
  /** layoutId — highlight kapsülünün satırlar arasında süzülmesi için sidebar örneğine özgü kimlik */
  highlightId: string
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebarContext(component: string): SidebarContextValue {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error(`${component}, GlassSidebar içinde kullanılmalı`)
  return ctx
}

/** HIG: en fazla iki seviye — iç içe Group tespiti için derinlik sayacı */
export const GroupDepthContext = createContext(0)
