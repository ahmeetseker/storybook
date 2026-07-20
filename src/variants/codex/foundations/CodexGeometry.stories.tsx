import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexBadge } from '../controls'
import styles from './CodexFoundations.module.css'

const meta = {
  title: 'Codex Enterprise/01 Temeller/03 Geometri ve Elevation',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const RadiusHierarchy: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>Geometri davranışı anlatır</h1><p>İç öğe dış kapsayıcıdan daha sıkıdır; kapsül yalnız gerçek filtre ve durumuna göre yatay genişleyen kontrol içindir.</p></header><section className={styles.section}><header className={styles.sectionHeader}><h2>Radius ölçeği</h2><p>4 / 8 / 10 / 12 / 16px ve yalnız filtre için capsule.</p></header><div className={styles.radiusSamples}><span className={styles.radiusSample} data-radius="4">4</span><span className={styles.radiusSample} data-radius="8">8</span><span className={styles.radiusSample} data-radius="10">10</span><span className={styles.radiusSample} data-radius="12">12</span><span className={styles.radiusSample} data-radius="16">16</span><span className={styles.radiusSample} data-radius="pill">filter</span></div></section></div>,
}

export const SpacingScale: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>4px tabanlı spacing</h1><p>Kontrol içi ritim sıkı, içerik grupları belirgin, sayfa bölümleri daha cömert aralık kullanır.</p></header><div className={styles.spacingSamples}>{['4', '8', '12', '16', '24', '40'].map((space) => <span key={space} className={styles.spacingSample} data-space={space}>{space}</span>)}</div></div>,
}

export const OneEdgeRule: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>One Edge Rule</h1><p>Bir öğe temel sınırını hairline, tonal separation veya kısa shadow’dan yalnız biriyle kurar.</p></header><div className={styles.edgeSamples}><span className={styles.edgeSample} data-edge="hairline">Hairline</span><span className={styles.edgeSample} data-edge="tonal">Tonal</span><span className={styles.edgeSample} data-edge="raised">Raised</span><span className={styles.edgeSample} data-edge="floating">Floating</span></div><div><CodexBadge tone="warning" dot>Yasak</CodexBadge> 1px border + 16px üzeri dekoratif blur shadow aynı kartta kullanılmaz.</div></div>,
}
