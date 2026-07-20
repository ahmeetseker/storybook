import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexButton } from '../controls'
import { CodexAgencyCard, CodexReviewCard, CodexSellerCard } from './CodexMarketplace'
import styles from './CodexMarketplace.stories.module.css'

const meta = {
  title: 'Codex Enterprise/05 İçerik ve Pazar Yeri/02 Satıcı ve Mağaza',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <div className={styles.page}><header className={styles.header}><h1>{title}</h1><p>{description}</p></header>{children}</div>
}

export const AgencyVariants: Story = {
  render: () => (
    <Page title="Kurumsal mağaza kartları" description="Doğrulama, performans ve iletişim bilgileri reklam rozetinden ayrıştırılır.">
      <div className={styles.grid}>
        <CodexAgencyCard
          name="Ege Parsel Gayrimenkul"
          location="Urla, İzmir · 3 şube"
          description="Arsa, tarla ve kırsal yatırım portföylerinde uzmanlaşmış lisanslı emlak işletmesi."
          verified premium responseTime="18 dakika" activeSince="Mart 2014"
          stats={[{ label: 'Aktif ilan', value: '184' }, { label: 'Son 12 ay satış', value: '47' }, { label: 'Mağaza puanı', value: '4,8/5' }]}
          onViewStore={() => undefined} onContact={() => undefined}
        />
        <div className={styles.stack}>
          <CodexAgencyCard name="Başkent Arazi" location="Gölbaşı, Ankara" verified responseTime="42 dakika" activeSince="Eylül 2019" compact onViewStore={() => undefined} onContact={() => undefined} />
          <CodexAgencyCard name="Likya Emlak Ofisi" location="Kaş, Antalya" responseTime="2 saat" activeSince="Ocak 2021" compact onViewStore={() => undefined} />
        </div>
      </div>
    </Page>
  ),
}

export const IndividualAndProfessionalSeller: Story = {
  render: () => (
    <Page title="İlan sahibi güven özeti" description="Kurumsal mağaza ile bireysel satıcı aynı kartmış gibi gösterilmez; yetki ve doğrulama açıkça ayrılır.">
      <div className={styles.grid}>
        <CodexSellerCard name="Mert Deniz" joinedAt="Mayıs 2018’den beri üye" verified phoneVerified identityVerified responseRate="%96" responseTime="24 dakika" onMessage={() => undefined} onRevealPhone={() => undefined} />
        <CodexSellerCard name="Ege Parsel Danışmanı" accountType="professional" joinedAt="Mart 2014’ten beri üye" verified phoneVerified identityVerified responseRate="%99" responseTime="12 dakika" onMessage={() => undefined} onRevealPhone={() => undefined} />
        <CodexSellerCard name="S. K." joinedAt="Temmuz 2026’dan beri üye" phoneVerified responseRate="Yeni hesap" onMessage={() => undefined} onRevealPhone={() => undefined} />
      </div>
    </Page>
  ),
}

export const ReviewAndResponse: Story = {
  render: () => (
    <Page title="Değerlendirme ve mağaza yanıtı" description="Doğrulanmış işlem, zaman ve mağaza yanıtı asıl yorumun hiyerarşisini bozmadan görünür.">
      <div className={styles.grid}>
        <CodexReviewCard
          author="Selin Akay" role="Alıcı" rating={5} date="12 Temmuz 2026" datetime="2026-07-12"
          title="Belgeler sorulmadan paylaşıldı"
          body="Parselin güncel imar belgesini ve yol durumunu ilk görüşmeden önce ilettiler. Yer gösterme sırasında vaat edilen bilgilerle sahadaki durum eşleşti."
          verifiedTransaction
          response={{ author: 'Ege Parsel Gayrimenkul', body: 'Geri bildiriminiz için teşekkür ederiz. Belge paketini diğer ilanlarımızda da standart hale getirdik.', date: '13 Temmuz 2026' }}
        />
        <CodexReviewCard author="Barış Yalın" role="Kiracı adayı" rating={3} date="7 Temmuz 2026" title="Yanıt süresi uzundu" body="İlan bilgileri doğruydu fakat hafta sonu gönderdiğim mesaja iki gün sonra dönüş yapıldı." />
      </div>
      <div className={styles.row}><CodexButton variant="secondary">Tüm 128 değerlendirmeyi gör</CodexButton></div>
    </Page>
  ),
}
