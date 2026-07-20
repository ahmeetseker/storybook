import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexButton, CodexCheckbox, CodexChip, CodexField, CodexInput, CodexSelect, CodexSwitch } from '../controls'
import { CodexProgress } from '../forms'
import { CodexEmptyState, CodexNotice } from '../content'
import { CodexSkeletonBlock } from '../data'
import styles from './CodexFoundations.module.css'

const meta = {
  title: 'Codex Enterprise/12 Durumlar ve Erişilebilirlik/01 State Matrisi',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Cell({ title, children }: { title: string; children: ReactNode }) {
  return <section className={styles.stateCell}><h3>{title}</h3>{children}</section>
}

export const ControlStates: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>Kontrol state sözlüğü</h1><p>Default, focus, selected, loading, disabled ve invalid durumları her control ailesinde aynı geometri ve semantik kanalları kullanır.</p></header><div className={styles.stateGrid}><Cell title="Default"><CodexButton>Devam et</CodexButton></Cell><Cell title="Focus visible"><CodexButton className={styles.forcedFocus}>Devam et</CodexButton></Cell><Cell title="Loading"><CodexButton loading>Kaydediliyor</CodexButton></Cell><Cell title="Disabled"><CodexButton disabled>Devam et</CodexButton></Cell><Cell title="Selected"><CodexChip selected>EİDS doğrulamalı</CodexChip></Cell><Cell title="Invalid"><CodexField label="İlan fiyatı" error="Geçerli bir fiyat girin."><CodexInput defaultValue="0" /></CodexField></Cell><Cell title="Mixed"><CodexCheckbox label="Bazı ilanlar seçili" indeterminate /></Cell><Cell title="Switch on"><CodexSwitch label="Fiyat alarmı" defaultChecked /></Cell></div></div>,
}

export const LoadingEmptyError: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>İçerik durumları</h1><p>Yükleme gerçek geometriyi korur; empty state ilk değeri öğretir; hata mesajı neden ve çözüm sunar.</p></header><div className={styles.sampleGrid}><CodexSkeletonBlock variant="listing" /><CodexEmptyState title="Bu ölçütlerde ilan yok" description="Bütçe üst sınırını değiştirin veya yakın ilçeleri aramaya ekleyin." action={<CodexButton>Aramayı genişlet</CodexButton>} /><div className={styles.sampleCard}><CodexNotice tone="danger" title="İlanlar yüklenemedi" action={<CodexButton variant="quiet" size="sm">Yeniden dene</CodexButton>}>Bağlantıyı kontrol edip tekrar deneyin.</CodexNotice><CodexProgress label="Belge yükleme" value={64} tone="info" /></div></div></div>,
}

export const KeyboardJourney: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>Klavye yolculuğu</h1><p>Tab sırası DOM ve görsel sırayla eşleşir; bütün aksiyonlar Enter/Space ile çalışır ve focus kaybolmaz.</p></header><section className={styles.journey}><ol><li>Arama alanına Tab ile ulaşın ve sorgu girin.</li><li>Şehir seçimini native combobox ile değiştirin.</li><li>Checkbox ve switch’i Space ile değiştirin.</li><li>Ana aksiyonu Enter ile çalıştırın.</li></ol><CodexField label="Doğal dil araması"><CodexInput placeholder="Urla’da imarlı parsel" /></CodexField><CodexField label="Şehir"><CodexSelect defaultValue="izmir"><option value="izmir">İzmir</option><option value="ankara">Ankara</option></CodexSelect></CodexField><CodexCheckbox label="Yalnız doğrulanmış ilanlar" /><CodexSwitch label="Yeni ilan alarmı" /><div className={styles.journeyActions}><CodexButton>128 ilanı göster</CodexButton><CodexButton variant="secondary">Aramayı kaydet</CodexButton></div></section></div>,
}

export const MobileStateMatrix: Story = {
  render: () => (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Mobil touch ve reflow</h1>
        <p>Ana hedefler coarse pointer’da en az 44px, yatay tab ve chip grupları kontrollü scroll kullanır.</p>
      </header>
      <div className={styles.stateGrid}>
        <Cell title="Primary"><CodexButton fullWidth>İlanı aç</CodexButton></Cell>
        <Cell title="Form"><CodexField label="Konum"><CodexInput placeholder="İlçe veya mahalle" /></CodexField></Cell>
        <Cell title="Filters"><div className={styles.themeActions}><CodexChip selected>Urla</CodexChip><CodexChip>Konut</CodexChip><CodexChip>≤ 5 Mn</CodexChip></div></Cell>
      </div>
    </div>
  ),
  globals: { viewport: 'mobile1' },
}
