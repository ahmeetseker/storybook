import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  FiltreVaryantlari,
  VaryantCam,
  VaryantDokunmatik,
  VaryantKagit,
  VaryantKompakt,
  VaryantReferans,
} from './FiltreVaryantlari'

const meta = {
  title: 'Sayfalar/Demo/Filtre Varyantları',
  component: FiltreVaryantlari,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FiltreVaryantlari>

export default meta
type Story = StoryObj<typeof meta>

/** Beş yön yan yana — karar bunun üstünden verilir. */
export const Karsilastirma: Story = { name: 'Karşılaştırma' }

export const AReferans: Story = { name: 'A · Referans çevirisi', render: () => <VaryantReferans /> }
export const BKagit: Story = { name: 'B · Kağıt teması', render: () => <VaryantKagit /> }
export const CCam: Story = { name: 'C · Cam yaprak', render: () => <VaryantCam /> }
export const DKompakt: Story = { name: 'D · Masaüstü rayı', render: () => <VaryantKompakt /> }
export const EDokunmatik: Story = { name: 'E · Dokunmatik öncelikli', render: () => <VaryantDokunmatik /> }
