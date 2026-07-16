import type { Meta, StoryObj } from '@storybook/react-vite'
import { SifreSifirla } from './SifreSifirla'

const meta = {
  title: 'Sayfalar/Public/Şifre Sıfırla',
  component: SifreSifirla,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SifreSifirla>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Form gönderildikten sonraki başarı hâli */
export const BaglantiGonderildi: Story = {
  args: { baslangicGonderildi: true },
}
