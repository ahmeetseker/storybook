// /yasal/kvkk — yasal doküman merkezi: solda sayfa listesi (flat kart nav),
// sağda seçili dokümanın başlıklı uzun metni. Seçim useState ile.
import { useState, type CSSProperties } from 'react'
import { PublicShell } from './shared/shells'

const kart: CSSProperties = {
  boxSizing: 'border-box',
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
}

export type YasalSayfaId = 'kvkk' | 'acik-riza' | 'cerez' | 'kosullar' | 'ilan-kurallari'

interface YasalSayfa {
  id: YasalSayfaId
  baslik: string
  guncelleme: string
  paragraflar: string[]
}

const sayfalar: YasalSayfa[] = [
  {
    id: 'kvkk',
    baslik: 'KVKK Aydınlatma Metni',
    guncelleme: '1 Haziran 2026',
    paragraflar: [
      'ArsaPazar Bilgi Teknolojileri A.Ş. ("ArsaPazar") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket ediyoruz. Üyelik oluşturduğunuzda ad-soyad, e-posta ve telefon bilgileriniz; ilan verdiğinizde taşınmaz numarası, ada/parsel ve konum bilgileri; platformu kullandığınız sürece ise işlem güvenliğine ilişkin trafik kayıtlarınız işlenmektedir.',
      'Kişisel verileriniz; üyelik sözleşmesinin kurulması ve ifası, ilanların EİDS (Elektronik İlan Doğrulama Sistemi) üzerinden doğrulanması, moderasyon süreçlerinin yürütülmesi, 5651 sayılı Kanun başta olmak üzere hukuki yükümlülüklerin yerine getirilmesi ve platform güvenliğinin sağlanması amaçlarıyla sınırlı olarak işlenir. Verileriniz, yasal zorunluluklar dışında açık rızanız olmaksızın üçüncü kişilerle paylaşılmaz; EİDS doğrulaması için yalnızca taşınmaz numarası ilgili kamu sistemine iletilir.',
      "KVKK'nın 11. maddesi uyarınca; kişisel verilerinize erişme, düzeltilmesini veya silinmesini isteme, işleme faaliyetine itiraz etme ve zarara uğramanız hâlinde giderilmesini talep etme haklarına sahipsiniz. Taleplerinizi kvkk@arsapazar.com adresine veya hesabınızdaki başvuru formu üzerinden iletebilirsiniz; başvurular en geç 30 gün içinde ücretsiz olarak yanıtlanır.",
    ],
  },
  {
    id: 'acik-riza',
    baslik: 'Açık Rıza Metni',
    guncelleme: '1 Haziran 2026',
    paragraflar: [
      'Bu metni onaylayarak; tarafınıza özel ilan önerileri sunulması, arama alarmlarınıza uygun yeni ilanların bildirilmesi ve platform deneyiminizin kişiselleştirilmesi amacıyla kullanım verilerinizin işlenmesine açık rıza vermiş olursunuz. Açık rıza, üyelik için zorunlu olmayan işleme faaliyetlerini kapsar.',
      'Açık rızanızı dilediğiniz an, hiçbir gerekçe göstermeksizin "Profil ve Ayarlar" sayfasından veya kvkk@arsapazar.com adresine yazarak geri çekebilirsiniz. Rızanın geri çekilmesi, geri çekme anına kadar yapılan işlemelerin hukuka uygunluğunu etkilemez.',
    ],
  },
  {
    id: 'cerez',
    baslik: 'Çerez Politikası',
    guncelleme: '15 Mayıs 2026',
    paragraflar: [
      'ArsaPazar; oturumunuzu açık tutmak ve dil tercihinizi hatırlamak için zorunlu çerezler, site kullanımını anonim olarak ölçmek için ise isteğe bağlı analitik çerezler kullanır. Zorunlu çerezler platformun çalışması için gereklidir ve kapatılamaz.',
      'İsteğe bağlı çerezleri, sayfa altbilgisindeki "Çerez Tercihleri" bağlantısından dilediğiniz an açıp kapatabilirsiniz. Tarayıcı ayarlarınızdan tüm çerezleri silmeniz hâlinde oturumunuz sonlanır ve tercihlerinizin yeniden sorulması gerekir.',
    ],
  },
  {
    id: 'kosullar',
    baslik: 'Kullanım Koşulları',
    guncelleme: '1 Haziran 2026',
    paragraflar: [
      'ArsaPazar, arsa ve tarla kategorisindeki taşınmazlar için alıcı ile satıcıyı buluşturan bir ilan platformudur; satış sözleşmesinin tarafı değildir. İlanlarda yer alan bilgilerin doğruluğundan ilan sahibi sorumludur; ArsaPazar, EİDS doğrulaması ve moderasyon süreçleriyle yalnızca asgari doğruluk denetimi yapar.',
      'Üyeler; başkasına ait taşınmazı yetkisiz şekilde ilana koymamayı, yanıltıcı fiyat ve nitelik bilgisi vermemeyi ve platform içi mesajlaşmayı hukuka aykırı amaçlarla kullanmamayı kabul eder. Aykırılık hâlinde ilan yayından kaldırılabilir, üyelik askıya alınabilir veya sonlandırılabilir.',
    ],
  },
  {
    id: 'ilan-kurallari',
    baslik: 'İlan Yayınlama Kuralları',
    guncelleme: '20 Haziran 2026',
    paragraflar: [
      'Her ilan tek bir taşınmaza ait olmalı ve ilan sihirbazında beyan edilen taşınmaz numarası EİDS doğrulamasından geçmelidir. Doğrulanamayan ilanlar "EİDS Başarısız" durumuna alınır ve yayınlanmaz. Aynı parsel için mükerrer ilan verilemez.',
      'Fotoğraflar taşınmazın güncel hâlini yansıtmalı; üzerinde telefon numarası, logo veya başka platformlara yönlendirme bulunmamalıdır. Fiyat alanına TL cinsinden net rakam yazılır; açıklamada "fiyat sorunuz" gibi ifadeler moderasyonda değişiklik talebiyle sonuçlanır.',
    ],
  },
]

export function Yasal({ baslangicSayfa = 'kvkk' }: { baslangicSayfa?: YasalSayfaId }) {
  const [secili, setSecili] = useState<YasalSayfaId>(baslangicSayfa)
  const sayfa = sayfalar.find((s) => s.id === secili) ?? sayfalar[0]

  return (
    <PublicShell>
      <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: 20, alignItems: 'start', paddingTop: 8 }}>
        <nav aria-label="Yasal sayfalar" style={{ ...kart, padding: 8, position: 'sticky', top: 16 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sayfalar.map((s) => {
              const aktif = s.id === secili
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSecili(s.id)}
                    aria-current={aktif ? 'page' : undefined}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: 0,
                      cursor: 'pointer',
                      font: 'inherit',
                      fontSize: 'var(--lg-text-body, 15px)',
                      fontWeight: aktif ? 600 : 400,
                      color: aktif ? 'var(--lg-accent)' : 'var(--lg-label)',
                      background: aktif ? 'var(--lg-bg)' : 'transparent',
                      borderRadius: 'var(--lg-radius-chip, 10px)',
                      padding: '10px 12px',
                    }}
                  >
                    {s.baslik}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <article style={{ ...kart, padding: 'var(--lg-space-7, 32px)' }}>
          <header style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--lg-hairline)' }}>
            <h1 style={{ margin: 0, fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>{sayfa.baslik}</h1>
            <span style={{ fontSize: 'var(--lg-text-caption, 12px)', fontWeight: 500, color: 'var(--lg-label-secondary)' }}>
              Son güncelleme: {sayfa.guncelleme}
            </span>
          </header>
          {sayfa.paragraflar.map((p, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : '14px 0 0', fontSize: 'var(--lg-text-body, 15px)', lineHeight: 1.65 }}>
              {p}
            </p>
          ))}
        </article>
      </div>
    </PublicShell>
  )
}
