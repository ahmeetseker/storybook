import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnaSayfa } from '../../../pages/AnaSayfa'
import { Giris } from '../../../pages/Giris'
import { HesapDogrula } from '../../../pages/HesapDogrula'
import { Kayit } from '../../../pages/Kayit'
import { SifreSifirla } from '../../../pages/SifreSifirla'
import { YardimMerkezi } from '../../../pages/YardimMerkezi'
import { Yasal } from '../../../pages/Yasal'

const meta = {
  title: 'Codex Enterprise/10 Sayfalar/01 Kamusal',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true, defaultTheme: 'paper' },
    docs: {
      description: {
        component:
          'Ziyaretçi edinimi, üyelik, kimlik doğrulama, destek ve yasal içerik yüzeyleri. Her ekran gerçek üretim sayfasını Codex Paper teması içinde, masaüstü ve mobil kırılımlarıyla gösterir.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const desktopGlobals = { designTheme: 'codex-paper', forceTier: 'fallback' } as const
const mobileGlobals = { ...desktopGlobals, viewport: 'mobile1' } as const

export const AnaSayfaMasaustu: Story = {
  name: 'Ana Sayfa · Masaüstü',
  globals: desktopGlobals,
  render: () => <AnaSayfa />,
}

export const AnaSayfaMobil: Story = {
  name: 'Ana Sayfa · Mobil',
  globals: mobileGlobals,
  render: () => <AnaSayfa />,
}

export const GirisVarsayilan: Story = {
  name: 'Giriş · Varsayılan',
  globals: desktopGlobals,
  render: () => <Giris />,
}

export const GirisMobil: Story = {
  name: 'Giriş · Mobil',
  globals: mobileGlobals,
  render: () => <Giris />,
}

export const GirisHata: Story = {
  name: 'Giriş · Hatalı kimlik bilgisi',
  globals: desktopGlobals,
  render: () => <Giris hata />,
}

export const GirisHataMobil: Story = {
  name: 'Giriş · Hata · Mobil',
  globals: mobileGlobals,
  render: () => <Giris hata />,
}

export const KayitMasaustu: Story = {
  name: 'Kayıt · Masaüstü',
  globals: desktopGlobals,
  render: () => <Kayit />,
}

export const KayitMobil: Story = {
  name: 'Kayıt · Mobil',
  globals: mobileGlobals,
  render: () => <Kayit />,
}

export const HesapDogrulaDogrulaniyor: Story = {
  name: 'Hesap Doğrula · Doğrulanıyor',
  globals: desktopGlobals,
  render: () => <HesapDogrula baslangicDurumu="dogrulaniyor" />,
}

export const HesapDogrulaDogrulaniyorMobil: Story = {
  name: 'Hesap Doğrula · Doğrulanıyor · Mobil',
  globals: mobileGlobals,
  render: () => <HesapDogrula baslangicDurumu="dogrulaniyor" />,
}

export const HesapDogrulaBasarili: Story = {
  name: 'Hesap Doğrula · Başarılı',
  globals: desktopGlobals,
  render: () => <HesapDogrula baslangicDurumu="basarili" />,
}

export const HesapDogrulaBasariliMobil: Story = {
  name: 'Hesap Doğrula · Başarılı · Mobil',
  globals: mobileGlobals,
  render: () => <HesapDogrula baslangicDurumu="basarili" />,
}

export const HesapDogrulaSuresiDoldu: Story = {
  name: 'Hesap Doğrula · Süresi doldu',
  globals: desktopGlobals,
  render: () => <HesapDogrula baslangicDurumu="suresi-doldu" />,
}

export const HesapDogrulaSuresiDolduMobil: Story = {
  name: 'Hesap Doğrula · Süresi doldu · Mobil',
  globals: mobileGlobals,
  render: () => <HesapDogrula baslangicDurumu="suresi-doldu" />,
}

export const SifreSifirlaForm: Story = {
  name: 'Şifre Sıfırla · Form',
  globals: desktopGlobals,
  render: () => <SifreSifirla />,
}

export const SifreSifirlaFormMobil: Story = {
  name: 'Şifre Sıfırla · Form · Mobil',
  globals: mobileGlobals,
  render: () => <SifreSifirla />,
}

export const SifreBaglantisiGonderildi: Story = {
  name: 'Şifre Sıfırla · Bağlantı gönderildi',
  globals: desktopGlobals,
  render: () => <SifreSifirla baslangicGonderildi />,
}

export const SifreBaglantisiGonderildiMobil: Story = {
  name: 'Şifre Sıfırla · Bağlantı gönderildi · Mobil',
  globals: mobileGlobals,
  render: () => <SifreSifirla baslangicGonderildi />,
}

export const YardimMerkeziMasaustu: Story = {
  name: 'Yardım Merkezi · Masaüstü',
  globals: desktopGlobals,
  render: () => <YardimMerkezi />,
}

export const YardimMerkeziMobil: Story = {
  name: 'Yardım Merkezi · Mobil',
  globals: mobileGlobals,
  render: () => <YardimMerkezi />,
}

export const YasalKvkk: Story = {
  name: 'Yasal · KVKK',
  globals: desktopGlobals,
  render: () => <Yasal baslangicSayfa="kvkk" />,
}

export const YasalAcikRiza: Story = {
  name: 'Yasal · Açık rıza',
  globals: desktopGlobals,
  render: () => <Yasal baslangicSayfa="acik-riza" />,
}

export const YasalCerez: Story = {
  name: 'Yasal · Çerez politikası',
  globals: desktopGlobals,
  render: () => <Yasal baslangicSayfa="cerez" />,
}

export const YasalKosullar: Story = {
  name: 'Yasal · Kullanım koşulları',
  globals: desktopGlobals,
  render: () => <Yasal baslangicSayfa="kosullar" />,
}

export const YasalIlanKurallari: Story = {
  name: 'Yasal · İlan kuralları',
  globals: desktopGlobals,
  render: () => <Yasal baslangicSayfa="ilan-kurallari" />,
}

export const YasalMobil: Story = {
  name: 'Yasal · Mobil',
  globals: mobileGlobals,
  render: () => <Yasal baslangicSayfa="kvkk" />,
}
