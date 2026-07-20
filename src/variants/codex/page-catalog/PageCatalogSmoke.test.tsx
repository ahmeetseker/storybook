import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnaSayfa } from '../../../pages/AnaSayfa'
import { Arama } from '../../../pages/Arama'
import { AramaAlarmlari } from '../../../pages/AramaAlarmlari'
import { ArsaIlanDetay } from '../../../pages/ArsaIlanDetay'
import { Ayarlar } from '../../../pages/Ayarlar'
import { Bildirimler } from '../../../pages/Bildirimler'
import { DopingOdeme } from '../../../pages/DopingOdeme'
import { Faturalarim } from '../../../pages/Faturalarim'
import { Giris } from '../../../pages/Giris'
import { HesapDogrula } from '../../../pages/HesapDogrula'
import { HesapOzeti } from '../../../pages/HesapOzeti'
import { IlanVer } from '../../../pages/IlanVer'
import { IlanYonetimi } from '../../../pages/IlanYonetimi'
import { Ilanlarim } from '../../../pages/Ilanlarim'
import { Karsilastir } from '../../../pages/Karsilastir'
import { Kaydettiklerim } from '../../../pages/Kaydettiklerim'
import { Kayit } from '../../../pages/Kayit'
import { KonutIlanDetay } from '../../../pages/KonutIlanDetay'
import { KurumsalBasvuru } from '../../../pages/KurumsalBasvuru'
import { KurumsalDogrulama } from '../../../pages/KurumsalDogrulama'
import { KurumsalTanitim } from '../../../pages/KurumsalTanitim'
import { MagazaVitrin } from '../../../pages/MagazaVitrin'
import { Mesajlar } from '../../../pages/Mesajlar'
import { SifreSifirla } from '../../../pages/SifreSifirla'
import { Sikayetlerim } from '../../../pages/Sikayetlerim'
import { YardimMerkezi } from '../../../pages/YardimMerkezi'
import { Yasal } from '../../../pages/Yasal'
import { YeniIlanSihirbazi } from '../../../pages/YeniIlanSihirbazi'
import { CodexTheme } from '../theme'

const pageCases: ReadonlyArray<{ name: string; makePage: () => ReactNode }> = [
  { name: 'AnaSayfa', makePage: () => <AnaSayfa /> },
  { name: 'Arama', makePage: () => <Arama /> },
  { name: 'AramaAlarmlari', makePage: () => <AramaAlarmlari /> },
  { name: 'ArsaIlanDetay', makePage: () => <ArsaIlanDetay /> },
  { name: 'Ayarlar', makePage: () => <Ayarlar /> },
  { name: 'Bildirimler', makePage: () => <Bildirimler /> },
  { name: 'DopingOdeme', makePage: () => <DopingOdeme /> },
  { name: 'Faturalarim', makePage: () => <Faturalarim /> },
  { name: 'Giris', makePage: () => <Giris /> },
  { name: 'HesapDogrula', makePage: () => <HesapDogrula /> },
  { name: 'HesapOzeti', makePage: () => <HesapOzeti /> },
  { name: 'IlanVer', makePage: () => <IlanVer /> },
  { name: 'IlanYonetimi', makePage: () => <IlanYonetimi /> },
  { name: 'Ilanlarim', makePage: () => <Ilanlarim /> },
  { name: 'Karsilastir', makePage: () => <Karsilastir /> },
  { name: 'Kaydettiklerim', makePage: () => <Kaydettiklerim /> },
  { name: 'Kayit', makePage: () => <Kayit /> },
  { name: 'KonutIlanDetay', makePage: () => <KonutIlanDetay /> },
  { name: 'KurumsalBasvuru', makePage: () => <KurumsalBasvuru /> },
  { name: 'KurumsalDogrulama', makePage: () => <KurumsalDogrulama /> },
  { name: 'KurumsalTanitim', makePage: () => <KurumsalTanitim /> },
  { name: 'MagazaVitrin', makePage: () => <MagazaVitrin /> },
  { name: 'Mesajlar', makePage: () => <Mesajlar /> },
  { name: 'SifreSifirla', makePage: () => <SifreSifirla /> },
  { name: 'Sikayetlerim', makePage: () => <Sikayetlerim /> },
  { name: 'YardimMerkezi', makePage: () => <YardimMerkezi /> },
  { name: 'Yasal', makePage: () => <Yasal /> },
  { name: 'YeniIlanSihirbazi', makePage: () => <YeniIlanSihirbazi /> },
]

describe('Codex Enterprise page catalog', () => {
  it('28 üretim sayfasını eksiksiz kataloglar', () => {
    expect(pageCases).toHaveLength(28)
  })

  it.each(pageCases)('$name Codex Paper tuvalinde smoke render olur', ({ makePage }) => {
    const { container } = render(
      <CodexTheme theme="paper" canvas="full">
        {makePage()}
      </CodexTheme>,
    )

    const themeRoot = container.querySelector('[data-design-system="codex"][data-codex-theme="paper"]')
    expect(themeRoot).not.toBeNull()
    expect(themeRoot?.firstElementChild).not.toBeNull()
  })
})
