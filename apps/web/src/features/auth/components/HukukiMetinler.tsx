import { useState } from 'react'
import { GlassButton, GlassModal } from '@repo/ui'
import styles from './HukukiMetinler.module.css'

/**
 * Onay adımının hukuki metinleri: KVKK aydınlatma metni ve kullanım
 * koşulları.
 *
 * WCAG 2.2 gerekçesi (2026-08-13 denetimi):
 *
 * - **2.4.4 Link Purpose / 4.1.2 Name, Role, Value** — Onay kutusu
 *   "okudum, onaylıyorum" diyordu ama metinler HİÇBİR yere bağlanmıyordu;
 *   kullanıcı okuyamadığı bir şeyi onaylıyordu. Metinler artık bitişik iki
 *   kontrolle açılır. Kontroller `<a>` DEĞİL `<button>`'dur: hedef başka
 *   bir sayfa değil, aynı sayfada açılan bir dialog'dur — rol gerçeği
 *   söylemeli, `aria-haspopup="dialog"` da davranışı önceden duyurur.
 * - **Etikete gömme yasağı** — Düğmeler onay kutusunun `<label>`'ının
 *   İÇİNE konmaz: etikete gömülü etkileşimli öğe, etiket tıklamasıyla
 *   (kutuyu işaretleme) düğme tıklamasını çakıştırır ve kutunun
 *   erişilebilir adını düğme metniyle şişirir. Etiket yalnız kutuyu
 *   adlandırır; düğmeler bitişik durur ve klavye sırasında etiketi izler.
 * - **2.5.8 Target Size (Minimum)** — Düğme hedefi `--lg-control-md`
 *   yüksekliğindedir (≥24px), bkz. modül CSS'i.
 * - **2.4.3 / 2.4.7** — Odak yönetimi `GlassModal`'ındır: açılışta odak
 *   panele girer (focus trap), kapanışta tetikleyen düğmeye geri döner.
 *
 * Metinlerin kendisi HUKUKİ TASLAKTIR — yayına çıkmadan önce hukuk
 * incelemesinden geçmelidir; taslak notu içerikte açıkça durur.
 */
export type HukukiMetinTuru = 'aydinlatma' | 'kosullar'

const METINLER: Record<HukukiMetinTuru, { dugme: string; baslik: string }> = {
  aydinlatma: {
    dugme: 'Aydınlatma metnini görüntüle',
    baslik: 'Kişisel Verilerin Korunmasına İlişkin Aydınlatma Metni',
  },
  kosullar: {
    dugme: 'Kullanım koşullarını görüntüle',
    baslik: 'Kullanım Koşulları',
  },
}

/** Yayın öncesi hukuk incelemesi şartını okuyucuya da söyleyen not. */
function TaslakNotu() {
  return (
    <p className={styles.taslakNotu}>
      Bu metin arsam.net için hazırlanmış bir hukuki taslaktır; yürürlükteki
      sürüm yayına alınmadan önce hukuk incelemesinden geçirilir.
    </p>
  )
}

function AydinlatmaMetni() {
  return (
    <>
      <TaslakNotu />
      <p>
        Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu
        (&ldquo;KVKK&rdquo;) m.10 uyarınca, arsam.net üzerinden hesap oluşturan
        kullanıcıları kişisel verilerinin işlenmesi hakkında bilgilendirmek
        için hazırlanmıştır.
      </p>

      <h3>1. Veri sorumlusu</h3>
      <p>
        Kişisel verileriniz, veri sorumlusu sıfatıyla Arsam Gayrimenkul
        Teknolojileri A.Ş. (&ldquo;Arsam&rdquo;) tarafından işlenir. İletişim:
        kvkk@arsam.net.
      </p>

      <h3>2. İşlenen kişisel veriler</h3>
      <ul>
        <li>Kimlik bilgileri: ad soyad, hesap tipi.</li>
        <li>İletişim bilgileri: e-posta adresi, telefon numarası.</li>
        <li>
          Hesap güvenliği bilgileri: parolanızın geri döndürülemez özeti
          (parolanız açık hâlde saklanmaz), oturum ve giriş kayıtları.
        </li>
        <li>
          Emlak ofisi başvurusunda ayrıca: işletme kimliği, yetki belgesi ve
          sorumlu danışman bilgileri ile ofis iletişim bilgileri.
        </li>
      </ul>

      <h3>3. İşleme amaçları ve hukuki sebepler</h3>
      <ul>
        <li>
          Üyelik sözleşmesinin kurulması ve ifası: hesabınızın açılması, ilan
          ve mesajlaşma hizmetlerinin sunulması (KVKK m.5/2-c).
        </li>
        <li>
          Hukuki yükümlülüklerin yerine getirilmesi: taşınmaz ticareti
          mevzuatı kapsamındaki doğrulamalar ve resmî taleplerin karşılanması
          (KVKK m.5/2-ç).
        </li>
        <li>
          Meşru menfaat: hesap güvenliğinin sağlanması ve dolandırıcılığın
          önlenmesi (KVKK m.5/2-f).
        </li>
        <li>
          Açık rıza: yalnız ayrıca onay verdiğiniz ticari elektronik iletiler
          için (KVKK m.5/1).
        </li>
      </ul>

      <h3>4. Verilerin aktarılması</h3>
      <p>
        Verileriniz, yukarıdaki amaçlarla sınırlı olarak barındırma ve ileti
        gönderim hizmeti alınan iş ortaklarına ve hukuken yetkili kurumlara
        aktarılabilir; bunun dışında üçüncü kişilerle paylaşılmaz.
      </p>

      <h3>5. Saklama süresi</h3>
      <p>
        Verileriniz üyeliğiniz süresince, üyelik sona erdikten sonra ise
        ilgili mevzuatta öngörülen zamanaşımı süreleri boyunca saklanır ve
        sürenin sonunda silinir, yok edilir veya anonim hâle getirilir.
      </p>

      <h3>6. KVKK m.11 kapsamındaki haklarınız</h3>
      <p>
        Verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya
        silinmesini isteme, işlemeye itiraz etme ve zarara uğramanız hâlinde
        giderim talep etme haklarına sahipsiniz. Başvurularınızı
        kvkk@arsam.net adresine iletebilirsiniz; başvurular en geç 30 gün
        içinde yanıtlanır.
      </p>
    </>
  )
}

function KullanimKosullari() {
  return (
    <>
      <TaslakNotu />
      <h3>1. Taraflar ve konu</h3>
      <p>
        Bu koşullar, arsam.net platformunu işleten Arsam Gayrimenkul
        Teknolojileri A.Ş. ile platformda hesap oluşturan kullanıcı arasında,
        platformun kullanımına ilişkin hak ve yükümlülükleri düzenler. Hesap
        oluşturarak bu koşulları kabul etmiş olursunuz.
      </p>

      <h3>2. Üyelik</h3>
      <p>
        Üyelik için verdiğiniz bilgilerin doğru ve güncel olması sizin
        sorumluluğunuzdadır. Hesabınız kişiseldir; giriş bilgilerinizi üçüncü
        kişilerle paylaşamazsınız. Emlak ofisi hesapları ayrıca taşınmaz
        ticareti mevzuatının aradığı yetki belgesi doğrulamasına tabidir.
      </p>

      <h3>3. Platformun kullanımı ve ilan kuralları</h3>
      <ul>
        <li>İlanlar gerçek, güncel ve hukuka uygun olmalıdır.</li>
        <li>
          Yanıltıcı ilan vermek, başkasına ait taşınmazı yetkisiz ilan etmek
          ve platformu amacı dışında kullanmak yasaktır.
        </li>
        <li>
          Arsam, kurallara aykırı içeriği yayından kaldırma ve tekrarında
          hesabı askıya alma hakkını saklı tutar.
        </li>
      </ul>

      <h3>4. Fikri mülkiyet</h3>
      <p>
        Platformun tasarımı, yazılımı ve markaları Arsam'a aittir. Kullanıcı,
        yüklediği içerik üzerindeki haklarını korur; içeriğin platformda
        yayımlanması için Arsam'a sınırlı bir kullanım izni verir.
      </p>

      <h3>5. Sorumluluğun sınırlandırılması</h3>
      <p>
        Arsam bir ilan platformudur; taraflar arasındaki alım-satım ve
        kiralama işlemlerinin tarafı değildir. İlan içeriklerinin
        doğruluğundan ilan sahibi sorumludur.
      </p>

      <h3>6. Değişiklik ve fesih</h3>
      <p>
        Arsam bu koşulları güncelleyebilir; esaslı değişiklikler yürürlüğe
        girmeden önce üyelere duyurulur. Hesabınızı dilediğiniz zaman
        kapatabilirsiniz.
      </p>

      <h3>7. Uygulanacak hukuk</h3>
      <p>
        Bu koşullar Türk hukukuna tabidir; uyuşmazlıklarda İzmir mahkemeleri
        ve icra daireleri yetkilidir.
      </p>
    </>
  )
}

export interface HukukiMetinDugmeleriProps {
  /**
   * Gösterilecek metinler. Bireysel kayıt her ikisini ister; kurumsal
   * başvurunun onay kutusu yalnız aydınlatma metnini andığı için orada
   * yalnız o verilir.
   */
  metinler?: readonly HukukiMetinTuru[]
}

/**
 * Onay kutusunun BİTİŞİĞİNDE duran metin düğmeleri + dialog'ları.
 *
 * Durum bileşenin içindedir: aynı anda en fazla bir metin açık olur.
 * Kapanışta odak tetikleyen düğmeye `GlassModal` tarafından geri taşınır.
 */
export function HukukiMetinDugmeleri({
  metinler = ['aydinlatma', 'kosullar'],
}: HukukiMetinDugmeleriProps) {
  const [acik, setAcik] = useState<HukukiMetinTuru | null>(null)

  return (
    <>
      <div className={styles.baglantilar}>
        {metinler.map((tur) => (
          <button
            key={tur}
            type="button"
            className={styles.baglanti}
            aria-haspopup="dialog"
            onClick={() => setAcik(tur)}
          >
            {METINLER[tur].dugme}
          </button>
        ))}
      </div>

      {metinler.map((tur) => (
        <GlassModal
          key={tur}
          open={acik === tur}
          onClose={() => setAcik(null)}
          title={METINLER[tur].baslik}
          size="md"
          footer={
            <GlassButton type="button" size="md" onClick={() => setAcik(null)}>
              Kapat
            </GlassButton>
          }
        >
          {/* Başlık hiyerarşisi dialog başlığının (h2) altından h3 ile sürer. */}
          <div className={styles.metin}>
            {tur === 'aydinlatma' ? <AydinlatmaMetni /> : <KullanimKosullari />}
          </div>
        </GlassModal>
      ))}
    </>
  )
}
