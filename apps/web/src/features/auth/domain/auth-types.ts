import type { TelefonUlkeKodu } from './telefon-ulkeler'
// Yalnız tip: paket kimliğinin tek kaynağı fiyat verisidir, kopyalanmaz.
// `import type` derlemede silinir; auth alanı çalışma zamanında pricing'e bağlanmaz.
import type { OfficePlanId } from '@/features/pricing/data/office-plans'

export type { TelefonUlkeKodu }

/**
 * Kullanıcının kimliğini kanıtlamak için seçtiği yol.
 *
 * `'baglanti'` (magic link) 2026-08-04'te kaldırıldı — karar K1,
 * `docs/auth-eksikler-plani-2026-08-04.md`. `'google'` henüz UI'da yok,
 * İP-7 ile bağlanacak.
 */
export type GirisYontemi = 'telefon' | 'parola' | 'google'

/** Hesabın bireysel mi emlak ofisi mi olduğu — kayıt akışında belirlenir. */
export type HesapTipi = 'bireysel' | 'kurumsal'

/** EİDS (Emlak İlan Doğrulama Sistemi) durumu. */
export type EidsDurumu = 'yok' | 'beklemede' | 'dogrulandi'

/**
 * Kullanıcının bir organizasyondaki yetkisi.
 *
 * GEÇİCİ ve asgari model: ürün tarafında tam rol/yetki matrisi henüz
 * tanımlı değil. Üç kademe, `/yetkisiz` sayfasının tetiklenebilmesi ve
 * davet akışının davet edileni bir role bağlayabilmesi için yeterli.
 * Gerçek yetki modeli geldiğinde burası genişler; sayfalar rolü yalnız
 * GÖSTERİR, karar vermez.
 */
export type OrganizasyonRolu = 'sahip' | 'yonetici' | 'danisman'

export interface Organizasyon {
  id: string
  ad: string
  rol: OrganizasyonRolu
}

/** Davet bağlantısının arkasındaki özet — kabul ekranında gösterilir. */
export interface DavetOzeti {
  organizasyonAdi: string
  davetEden: string
  rol: OrganizasyonRolu
}

export interface Oturum {
  kullaniciId: string
  adSoyad: string
  telefon: string
  ePosta: string
  hesapTipi: HesapTipi
  eidsDurumu: EidsDurumu
  /**
   * Kullanıcının o an üzerinde çalıştığı organizasyon. Bireysel hesaplarda
   * ve henüz seçim yapılmamışken yoktur — bu yüzden opsiyonel.
   */
  organizasyon?: Organizasyon
}

/**
 * Oturumun çözülmüş hâli. Boolean bir `girisYapildi` YETMEZ çünkü üç ayrı
 * durum vardır ve ikisi boolean'da aynı değere (`false`) çöker:
 *
 * - `bilinmiyor` — henüz cevaplanamaz. Sunucuda render edilirken (SSR ve
 *   statik prerender) oturum `sessionStorage`'da olduğu için görülemez.
 *   Hidrasyonun eşleşmesi için istemcinin İLK render'ı da bu durumda olmalıdır.
 * - `anonim` — kesin olarak oturum yok. Guard bu durumda yönlendirir.
 * - `kimlikli` — oturum var.
 *
 * `bilinmiyor` ile `anonim`'i ayırmak, `KorumaliSayfa`'daki `hidrasyonTamam`
 * bayrağının ve `/hesabim`'deki kopyasının varlık sebebini ortadan kaldırır:
 * hidrasyon güvenliği artık ayrı bir bayrak değil, modelin kendisidir.
 */
export type OturumCozumu =
  | { durum: 'bilinmiyor' }
  | { durum: 'anonim' }
  | { durum: 'kimlikli'; oturum: Oturum }

export type AuthHataKodu =
  | 'gecersiz-kimlik'
  | 'gecersiz-kod'
  | 'kod-suresi-doldu'
  | 'hesap-askida'
  | 'ag-hatasi'
  | 'hesap-zaten-var'
  | 'eksik-alan'
  | 'eids-reddedildi'
  /** Parola sıfırlama bağlantısındaki token tanınmadı. */
  | 'gecersiz-token'
  /** Token tanındı ama geçerlilik süresi doldu. */
  | 'token-suresi-doldu'
  /** Hız sınırı: çok fazla kod isteği veya deneme. */
  | 'cok-fazla-deneme'
  /** Oturum var ama bu kaynak için yetki yok. */
  | 'yetkisiz'
  /** Oturumun geçerlilik süresi doldu. */
  | 'oturum-suresi-doldu'
  /** Parola değiştirmede mevcut parola yanlış. */
  | 'parola-yanlis'

export type AuthSonuc<T> =
  | { durum: 'basarili'; veri: T }
  | { durum: 'hata'; kod: AuthHataKodu; mesaj: string }

/** Kayıt formunun topladığı bilgiler. */
export interface KayitBilgileri {
  adSoyad: string
  ePosta: string
  /**
   * Telefonun ULUSAL kısmı — ülke kodu olmadan, yalnız rakam
   * (`5321234567`). Ülke `telefonUlke`'de ayrı durur; ikisi birlikte
   * numaranın tamamını verir (`telefonuUluslararasiGoster`).
   */
  telefon: string
  /**
   * Numaranın ülkesi (ISO 3166-1 alpha-2). AYRI alan çünkü doğrulama
   * kuralı ülkeye bağlıdır ve tek bir metne gömülü ülke kodunu geri
   * ayrıştırmak belirsizdir (+1 → ABD mi Kanada mı, +7 → Rusya mı
   * Kazakistan mı).
   */
  telefonUlke: TelefonUlkeKodu
  parola: string
  hesapTipi: HesapTipi
  /** KVKK aydınlatma metni ve kullanım koşulları onayı — zorunlu. */
  kvkkOnayi: boolean
}

/**
 * İşletmenin hukuki biçimi. Hangi kayıt alanlarının ZORUNLU olduğunu bu
 * belirler: şahıs işletmesinin MERSİS/ticaret sicil kaydı ve KEP adresi
 * olmayabilir, tüzel kişinin üçü de vardır.
 */
export type IsletmeTuru = 'sahis' | 'limited' | 'anonim' | 'sube'

/**
 * Emlak ofisi başvurusunun topladığı bilgiler.
 *
 * Alanlar dört aşamaya bölünür (bkz. `kurumsal-adimlari.ts`); bu arayüz
 * aşamalardan bağımsız TEK veri sözleşmesidir, adım eşlemesi ayrı modülde
 * durur.
 */
export interface KurumsalBasvuruBilgileri {
  // — Aşama 1: işletme kimliği —
  isletmeTuru: IsletmeTuru
  /** Yetki belgesindeki unvan; ilanlarda bu gösterilir. */
  ticaretUnvani: string
  /**
   * Tüzel kişide 10 haneli vergi kimlik numarası, şahıs işletmesinde
   * 11 haneli T.C. kimlik numarası. İkisi tek alanda toplanır çünkü vergi
   * levhası hangisi geçerliyse onu taşır.
   */
  vergiNumarasi: string
  vergiDairesi: string
  /** 16 hane. Tüzel kişide zorunlu, şahıs işletmesinde opsiyonel. */
  mersisNo: string
  /** Tüzel kişide zorunlu. */
  ticaretSicilNo: string

  // — Aşama 2: yetki ve yeterlilik —
  /** Taşınmaz ticareti yetki belgesi numarası. */
  yetkiBelgesiNo: string
  /**
   * Yetki belgesi geçerlilik bitişi (yyyy-aa-gg). Belge süreli olduğu için
   * saklanır: süresi dolan işletmenin ilan yayınlama yetkisi düşer ve bu
   * tarih olmadan platform bunu kendiliğinden uygulayamaz.
   */
  yetkiBelgesiBitis: string
  /** Sorumlu emlak danışmanı — yetki belgesinin yasal ön koşuludur. */
  sorumluDanismanAdSoyad: string
  sorumluDanismanTckn: string
  /** Sorumlu danışmanın MYK Seviye 5 mesleki yeterlilik belge numarası. */
  mykBelgeNo: string
  mykBelgeBitis: string

  // — Aşama 3: ofis ve iletişim —
  il: string
  ilce: string
  acikAdres: string
  postaKodu: string
  /** Ofisin sabit veya mobil hattı; yetkilinin kişisel hattından ayrıdır. */
  ofisTelefonu: string
  /** Kayıtlı elektronik posta — tüzel kişide zorunlu. */
  kepAdresi: string
  webSitesi: string
  yetkiliAdSoyad: string
  yetkiliEPosta: string
  yetkiliTelefon: string

  // — Aşama 4: paket —
  /**
   * Seçilen ofis paketi (`OFFICE_PLANS` kimliği). Ödeme başvuru onaylandıktan
   * sonra alınır; burada saklanan yalnız ofisin BEYAN ettiği tercihtir.
   */
  paketId: OfficePlanId
  /**
   * Danışman koltuğu adedi. Paketin dahil ettiğinden az olamaz; fazlası ek
   * koltuk olarak faturaya girer, bu yüzden başvuruyla birlikte saklanır.
   */
  paketKoltuk: number

  // — Aşama 5: onaylar —
  /**
   * İşletme ve yetkili kişi verilerinin işlenmesine ilişkin aydınlatma
   * onayı — zorunlu. Bireysel kayıttaki onay yalnız KİŞİSEL verileri
   * kapsar; bu başvuru ayrıca işletme kayıtlarını topladığı için kendi
   * onayını gerektirir.
   */
  kvkkOnayi: boolean
  /** İşletmeyi temsile yetkili olma ve bilgilerin doğruluğu beyanı — zorunlu. */
  temsilBeyani: boolean
  /** Ticari elektronik ileti izni — İSTEĞE BAĞLI, zorunlu tutulamaz. */
  iysOnayi: boolean
}

export type KayitAlanHatalari = Partial<Record<keyof KayitBilgileri, string>>
export type KurumsalAlanHatalari = Partial<Record<keyof KurumsalBasvuruBilgileri, string>>
