import type { Meta, StoryObj } from '@storybook/react-vite'
import { AramaAlarmlari } from './AramaAlarmlari'

const meta = {
  title: 'Sayfalar/Hesabım/Arama Alarmları',
  component: AramaAlarmlari,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AramaAlarmlari>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Hiç alarm kaydı yokken gösterilen boş durum. */
export const BosDurum: Story = {
  args: { alarmlar: [] },
}
