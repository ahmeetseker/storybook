import type { Preview } from '@storybook/react-vite'
import { DemoBackground } from './DemoBackground'
import { GlassTierProvider } from '../src/components/GlassSurface/GlassTierContext'
import { detectTier, type GlassTier } from '../src/core/tier'
import { CodexTheme, type CodexThemeName } from '../src/variants/codex/theme'
import '@fontsource-variable/manrope'
import '../src/index.css'

const CODEX_THEME_BY_GLOBAL: Record<string, CodexThemeName> = {
  'codex-paper': 'paper',
  'codex-mineral': 'mineral',
  'codex-graphite': 'graphite',
}

const PRODUCT_VIEWPORTS = {
  mobile1: { name: 'Küçük telefon · 320×568', styles: { width: '320px', height: '568px' }, type: 'mobile' },
  mobile360: { name: 'Android · 360×740', styles: { width: '360px', height: '740px' }, type: 'mobile' },
  mobile375: { name: 'Telefon · 375×812', styles: { width: '375px', height: '812px' }, type: 'mobile' },
  mobile390: { name: 'Standart telefon · 390×844', styles: { width: '390px', height: '844px' }, type: 'mobile' },
  mobile2: { name: 'Geniş telefon · 414×896', styles: { width: '414px', height: '896px' }, type: 'mobile' },
  mobile430: { name: 'Büyük telefon · 430×932', styles: { width: '430px', height: '932px' }, type: 'mobile' },
  mobileLandscape: { name: 'Telefon yatay · 844×390', styles: { width: '844px', height: '390px' }, type: 'mobile' },
  tablet768: { name: 'Kompakt tablet · 768×1024', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
  tabletPortrait: { name: 'Tablet · 834×1112', styles: { width: '834px', height: '1112px' }, type: 'tablet' },
  desktop: { name: 'Masaüstü · 1024×1280', styles: { width: '1024px', height: '1280px' }, type: 'desktop' },
}

const preview: Preview = {
  globalTypes: {
    backgroundKey: {
      description: 'Demo arka planı',
      toolbar: { title: 'Arka plan', icon: 'photo', items: ['light', 'dark', 'blinds', 'vivid'], dynamicTitle: true },
    },
    forceTier: {
      description: 'Cam katmanını zorla',
      toolbar: { title: 'Tier', icon: 'beaker', items: ['auto', 'refraction', 'fallback'], dynamicTitle: true },
    },
    designTheme: {
      description: 'Tasarım sistemi varyantı',
      toolbar: {
        title: 'Tasarım',
        icon: 'paintbrush',
        items: [
          { value: 'original', title: 'Original' },
          { value: 'codex-paper', title: 'Codex · Paper' },
          { value: 'codex-mineral', title: 'Codex · Mineral' },
          { value: 'codex-graphite', title: 'Codex · Graphite' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { backgroundKey: 'light', forceTier: 'auto', designTheme: 'original' },
  decorators: [
    (Story, ctx) => {
      const forced = ctx.globals.forceTier as string
      const tier: GlassTier = forced === 'auto' ? detectTier() : (forced as GlassTier)
      const designTheme = String(ctx.globals.designTheme ?? 'original')
      const defaultCodexTheme = ctx.parameters.codex?.defaultTheme as CodexThemeName | undefined
      const codexTheme = CODEX_THEME_BY_GLOBAL[designTheme]
        ?? (designTheme === 'original' ? defaultCodexTheme : undefined)
      const fullCanvas = Boolean(ctx.parameters.codex?.fullCanvas ?? ctx.parameters.codexFullCanvas)

      if (codexTheme) {
        return (
          <GlassTierProvider tier={tier}>
            <CodexTheme theme={codexTheme} canvas={fullCanvas ? 'full' : 'padded'}>
              <Story />
            </CodexTheme>
          </GlassTierProvider>
        )
      }

      if (fullCanvas) {
        return (
          <GlassTierProvider tier={tier}>
            <Story />
          </GlassTierProvider>
        )
      }

      return (
        <GlassTierProvider tier={tier}>
          <DemoBackground variant={ctx.globals.backgroundKey as string}>
            <Story />
          </DemoBackground>
        </GlassTierProvider>
      )
    },
  ],
  parameters: {
    layout: 'fullscreen',
    viewport: { options: PRODUCT_VIEWPORTS },
  },
}
export default preview
