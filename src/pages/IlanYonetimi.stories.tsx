import type { Meta, StoryObj } from '@storybook/react-vite'
import { IlanYonetimi } from './IlanYonetimi'
import { ilanlar } from './shared/data'

const meta = {
  title: 'Sayfalar/Hesabım/İlan Yönetimi',
  component: IlanYonetimi,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof IlanYonetimi>

export default meta
type Story = StoryObj<typeof meta>

/** Yayında olan ilan — tüm süreç aşamaları geçilmiş, istatistikler dolu. */
export const Default: Story = {
  args: { ilan: ilanlar[0] },
}

/** Moderasyondan "değişiklik istendi" notuyla dönen ilan. */
export const DegisiklikIstendi: Story = {
  args: {
    ilan: { ...ilanlar[1], durum: 'degisiklik-istendi' },
    moderasyonNotu:
      'İlan başlığındaki "yatırımlık" ifadesi getiri vaadi olarak değerlendirildi; lütfen başlığı taşınmazın nitelikleriyle sınırlayın. ' +
      'Ayrıca hisseli tapu seçildiği için açıklamaya hisse oranının eklenmesi gerekiyor.',
  },
}
