import type { Meta, StoryObj } from '@storybook/react-vite'
import styles from './CodexFoundations.module.css'

const meta = {
  title: 'Codex Enterprise/01 Temeller/04 Motion ve İkon',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const icons = [
  ['Ara', <svg key="search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>, 'Doğrudan görev metaforu'],
  ['Kaydet', <svg key="save" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden><path d="M20.8 5.8a5.4 5.4 0 0 0-7.7 0L12 6.9l-1.1-1.1a5.4 5.4 0 1 0-7.7 7.7L12 22l8.8-8.5a5.4 5.4 0 0 0 0-7.7Z" /></svg>, 'Toggle’da aria-pressed'],
  ['Doğrula', <svg key="verify" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="m7.5 12 3 3 6-7" /></svg>, 'Durum metniyle birlikte'],
  ['Kanıt', <svg key="evidence" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M6 3h9l3 3v15H6z" /><path d="M9 11h6M9 15h4M15 3v4h4" /></svg>, 'Kaynak ve belge bağlamı'],
] as const

export const IconVocabulary: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>1.8px çizgi, 20px optik kutu</h1><p>İkonlar dekoratifse gizlenir; tek başına aksiyonsa zorunlu accessible name taşır. Cliché AI simgeleri yerine görev metaforu kullanılır.</p></header><div className={styles.iconGrid}>{icons.map(([label, icon, note]) => <article key={label} className={styles.iconCell}><span>{icon}</span><span><strong>{label}</strong><small>{note}</small></span></article>)}</div></div>,
}

export const MotionContract: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>120–240ms durum hareketi</h1><p>Hover en fazla −1px yükselir; active .985 ölçeğe iner. Reduced motion’da transform kapanır ve içerik hiçbir zaman animasyona bağlı görünmez olmaz.</p></header><div className={styles.motionDemo}><span className={styles.motionTarget}>Hover / press</span></div></div>,
}
