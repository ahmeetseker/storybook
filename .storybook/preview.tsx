import type { Preview } from '@storybook/react-vite'
import { DemoBackground } from './DemoBackground'

const preview: Preview = {
  globalTypes: {
    backgroundKey: {
      description: 'Demo arka planı',
      toolbar: { title: 'Arka plan', icon: 'photo', items: ['vivid', 'dark', 'mono'], dynamicTitle: true },
    },
  },
  initialGlobals: { backgroundKey: 'vivid' },
  decorators: [
    (Story, ctx) => (
      <DemoBackground variant={ctx.globals.backgroundKey as string}>
        <Story />
      </DemoBackground>
    ),
  ],
  parameters: { layout: 'fullscreen' },
}
export default preview
