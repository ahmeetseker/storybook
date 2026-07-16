import type { Meta, StoryObj } from '@storybook/react-vite'
import { YeniIlanSihirbazi } from './YeniIlanSihirbazi'

const meta = {
  title: 'Sayfalar/Hesabım/Yeni İlan Sihirbazı',
  component: YeniIlanSihirbazi,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof YeniIlanSihirbazi>

export default meta
type Story = StoryObj<typeof meta>

/** Adım 3'ten başlar; EİDS sorgusu başarılı senaryosu. İleri/Geri ile tüm adımlar gezilebilir. */
export const Default: Story = {}

/** EİDS doğrulaması başarısız senaryosu — adım 3'te hata kutusu görünür. */
export const EidsBasarisiz: Story = {
  args: { eidsSonucu: 'basarisiz', baslangicAdimi: 3 },
}
