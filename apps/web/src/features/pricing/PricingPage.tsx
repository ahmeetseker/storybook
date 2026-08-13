import { useNavigate } from '@tanstack/react-router'
import { GlassFaqMarquee, GlassPricingTable, type GlassFaqMarqueeRow } from '@repo/ui'
import { PageContainer } from '@/components/PageContainer'
import { defaultSeats, toPricingPlans, type OfficePlanId } from './data/office-plans'
import styles from './PricingPage.module.css'

/* SSS rafları: satırlar zıt yönde döner, cevaplar 1-3 cümlede kalır
   (uzunları statik dokümantasyona aittir — bkz. GlassFaqMarquee/rules.md). */
const faqRows: GlassFaqMarqueeRow[] = [
  {
    id: 'sss-1',
    speed: 32,
    direction: 'start',
    items: [
      {
        id: 'koltuk',
        question: 'Koltuk ne demek?',
        answer:
          'Ofis panelinde kendi hesabıyla çalışan her danışman bir koltuktur. Paketin dahil ettiği sayıyı aştığınızda ek koltuk aylık ücrete eklenir; boşalttığınızda bir sonraki dönemden düşer.',
      },
      {
        id: 'degisim',
        question: 'Paket değiştirirsem ne olur?',
        answer:
          'Yükseltme anında geçerli olur, kalan süreniz yeni pakete oranlanarak işlenir. Düşürme bir sonraki fatura döneminde başlar; o döneme kadar mevcut kontenjanınız korunur.',
      },
      {
        id: 'vitrin',
        question: 'Vitrin kontenjanı nedir?',
        answer:
          'Vitrin, ilanın arama sonuçlarında ve anasayfada öne çıkarıldığı yerdir. Kontenjan aylıktır ve kullanılmayan hak bir sonraki aya devretmez.',
      },
    ],
  },
  {
    id: 'sss-2',
    speed: 24,
    direction: 'end',
    items: [
      {
        id: 'belge',
        question: 'Yetki belgem yoksa başvurabilir miyim?',
        answer:
          'Hayır. Taşınmaz ticareti yetki belgesi ve sorumlu danışmanın MYK Seviye 5 belgesi başvurunun ön koşuludur; ikisi de başvuru sırasında doğrulanır.',
      },
      {
        id: 'odeme',
        question: 'Ödeme ne zaman alınır?',
        answer:
          'Başvurunuz onaylandıktan sonra alınır. Paket fiyatlarına KDV dahil değildir.',
      },
      {
        id: 'iade',
        question: 'Yıllık ödemede iade var mı?',
        answer: 'Var — yıllık ödemede 14 gün koşulsuz iade hakkınız bulunur.',
      },
    ],
  },
]

/**
 * Genel paket sayfası (`/paketler`).
 *
 * Ofis başvurusundan ÖNCE gelen yüzey: bir emlak ofisi neyi ne kadara aldığını
 * burada görür, sonra başvuruya girer. Bu yüzden birincil eylem "satın al"
 * değil, seçilen paketle başvuruyu açmaktır — ödeme başvuru onayından sonra
 * alınır.
 *
 * Sayfa `indexable`dır: paket adları ve fiyatlar arama motoruna açıktır.
 */
export function PricingPage() {
  const navigate = useNavigate()

  const startApplication = (planId: OfficePlanId) => {
    void navigate({ to: '/kayit/kurumsal', search: { paket: planId } as never })
  }

  const plans = toPricingPlans({
    actionLabel: 'Bu paketle başvur',
    onSelect: startApplication,
    secondaryActionLabel: 'Satışla görüş',
    onSecondarySelect: () => void navigate({ to: '/ofisler' }),
  })

  return (
    <PageContainer className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Emlak ofisleri için</p>
        <h1>Ofisiniz büyüdükçe ölçeklenen paketler</h1>
        <p className={styles.lede}>
          Paketler danışman koltuğuna göre kademelenir: kadronuz büyüdükçe koltuk eklersiniz,
          ilan ve vitrin kontenjanı da onunla açılır. Yetki belgesi doğrulaması her pakette
          vardır — EİDS kontrolü ücretli bir eklenti değildir.
        </p>
      </header>

      <GlassPricingTable
        plans={plans}
        defaultSeats={defaultSeats()}
        className={styles.table}
        compactActionLabel="{plan} ile başvur"
        footnote={
          <>
            <span>Fiyatlara KDV dahil değildir. Ödeme, başvurunuz onaylandıktan sonra alınır.</span>
            <span>Yıllık ödemede 14 gün koşulsuz iade.</span>
          </>
        }
      />

      <GlassFaqMarquee
        className={styles.faq}
        title="Sık sorulanlar"
        subtitle="Aradığınız cevabı bulamadıysanız satış ekibine yazın — paket seçiminde birlikte bakarız."
        rows={faqRows}
      />
    </PageContainer>
  )
}
