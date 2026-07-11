import type { Preview } from '@storybook/react-vite'
import { DemoBackground } from './DemoBackground'
import { GlassTierProvider } from '../src/components/GlassSurface/GlassTierContext'
import { detectTier, type GlassTier } from '../src/core/tier'

const preview: Preview = {
  globalTypes: {
    backgroundKey: {
      description: 'Demo arka planı',
      toolbar: { title: 'Arka plan', icon: 'photo', items: ['blinds', 'vivid', 'dark', 'mono'], dynamicTitle: true },
    },
    forceTier: {
      description: 'Cam katmanını zorla',
      toolbar: { title: 'Tier', icon: 'beaker', items: ['auto', 'refraction', 'fallback'], dynamicTitle: true },
    },
  },
  initialGlobals: { backgroundKey: 'mono', forceTier: 'auto' },
  decorators: [
    (Story, ctx) => {
      const forced = ctx.globals.forceTier as string
      const tier: GlassTier = forced === 'auto' ? detectTier() : (forced as GlassTier)
      return (
        <GlassTierProvider tier={tier}>
          <DemoBackground variant={ctx.globals.backgroundKey as string}>
            <Story />
          </DemoBackground>
        </GlassTierProvider>
      )
    },
  ],
  parameters: { layout: 'fullscreen' },
}
export default preview
