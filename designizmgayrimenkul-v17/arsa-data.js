// emlaktr.com — ortak ilan verisi (Döşemealtı / Yeniköy imarlı arsa)
export const FIYAT = 8450000;
export const D = {
  fiyat: 8450000, eskiFiyat: 8900000, m2: 1320, m2Fiyat: 6401,
  baslik: "Yeniköy'de 24 m yol cepheli, konut imarlı köşe parsel",
  konum: "Antalya · Döşemealtı · Yeniköy Mah.",
  ilanNo: "2470931", yayin: "12 Haz 2026", guncelleme: "3 Tem 2026",
  telefon: "0532 481 07 00",
  rozetler: ["Doğrulanmış ilan", "Yetkili portföy", "Fiyat düştü", "Ekspertiz var", "AI analizli"],
  hizli: [
    {k:"Alan", v:"1.320 m²"}, {k:"m² fiyatı", v:"₺6.401"},
    {k:"İmar durumu", v:"Konut imarlı"}, {k:"Emsal (KAKS)", v:"0,30"},
    {k:"TAKS", v:"0,15"}, {k:"Gabari", v:"6,50 m · 2 kat"},
    {k:"Ada / Parsel", v:"214 / 8"}, {k:"Yola cephe", v:"24 m · köşe"},
    {k:"Tapu", v:"Müstakil parsel"}, {k:"Krediye uygun", v:"Evet"}
  ],
  medya: [
    {ad:"Drone görünümü", kat:"Dış", bg:"repeating-linear-gradient(45deg,#C7D2BF 0 16px,#BCC9B3 16px 32px)"},
    {ad:"Parsel sınırı — uydu", kat:"Harita", bg:"repeating-linear-gradient(0deg,#CBD5CE 0 18px,#C0CCC4 18px 36px)"},
    {ad:"Yol cephesi", kat:"Dış", bg:"repeating-linear-gradient(135deg,#D6CFC0 0 16px,#CCC4B2 16px 32px)"},
    {ad:"Vaziyet planı", kat:"Plan", bg:"repeating-linear-gradient(90deg,#CFD4DC 0 14px,#C4CAD4 14px 28px)"},
    {ad:"İmar çapı", kat:"Belge", bg:"repeating-linear-gradient(45deg,#D8D2C6 0 22px,#CFC8BA 22px 44px)"}
  ],
  gruplar: [
    {baslik:"Genel bilgiler", satirlar:[
      {k:"İlan tipi", v:"Satılık arsa"}, {k:"Arsa tipi", v:"Konut imarlı parsel"},
      {k:"Alan", v:"1.320 m²"}, {k:"m² fiyatı", v:"₺6.401"},
      {k:"Takas", v:"Hayır"}, {k:"Pazarlık", v:"Sınırlı (%3–5 tahmini)"}]},
    {baslik:"İmar ve yapılaşma", satirlar:[
      {k:"İmar durumu", v:"Konut imarlı · ayrık nizam"}, {k:"Emsal (KAKS)", v:"0,30"},
      {k:"TAKS", v:"0,15"}, {k:"Gabari", v:"6,50 m · 2 kat"},
      {k:"Emsal inşaat hakkı", v:"≈396 m²"}, {k:"Zemin oturumu", v:"≈198 m²"},
      {k:"Ada / Parsel / Pafta", v:"214 / 8 / N25-c"}]},
    {baslik:"Altyapı", satirlar:[
      {k:"Elektrik", v:"Parselde"}, {k:"Su", v:"Parselde"},
      {k:"Kanalizasyon", v:"Var"}, {k:"Doğalgaz", v:"Ana hatta 400 m"},
      {k:"Yol", v:"24 m asfalt cephe · köşe parsel"}, {k:"Zemin", v:"ZC sınıfı · eğim %4"}]},
    {baslik:"Tapu ve hukuki", satirlar:[
      {k:"Tapu durumu", v:"Müstakil parsel"}, {k:"Krediye uygunluk", v:"Uygun (beyan)"},
      {k:"İpotek / şerh", v:"Yok — tapu özeti 28 Haz"}, {k:"Koordinat", v:"37.0021, 30.5983"},
      {k:"Belediye son durum", v:"Plan onaylı · 2025 revizyonu"}]}
  ],
  aciklama: "Döşemealtı Yeniköy'de, D650 kavşağına 2,4 km mesafede köşe parsel. 24 m asfalt yol cephesi ile projelendirmesi kolay, dikdörtgene yakın geometri. Konut imarlı (E: 0,30 · TAKS: 0,15 · 2 kat); müstakil veya ikiz villa tipolojisine uygun. Elektrik, su ve kanalizasyon parsel sınırında; doğalgaz ana hattı 400 m. Tapu müstakil, ipotek ve şerh yoktur; ekspertiz raporu 12 Haziran 2026 tarihlidir. Bölge son iki yılda üniversite ve organize sanayi yatırımlarıyla değer kazanmaktadır. Ciddi alıcılarla yerinde gösterim yapılır; kapora talebimiz yoktur, ödeme tapuda gerçekleşir.",
  poi: [
    {ad:"D650 kavşağı", tip:"Ulaşım", mesafe:"2,4 km · 4 dk"},
    {ad:"Yeniköy İlkokulu", tip:"Okul", mesafe:"1,2 km · 15 dk yürüyüş"},
    {ad:"Zincir market", tip:"Market", mesafe:"800 m · 10 dk yürüyüş"},
    {ad:"Döşemealtı Devlet Hastanesi", tip:"Sağlık", mesafe:"6 km · 9 dk"},
    {ad:"Antalya merkez", tip:"Merkez", mesafe:"22 km · 26 dk"},
    {ad:"AYT Havalimanı", tip:"Havalimanı", mesafe:"28 km · 31 dk"}
  ],
  skorlar: [
    {k:"Gelişim potansiyeli", v:"8,4", p:84}, {k:"Ulaşım", v:"6,8", p:68},
    {k:"Yeşil alan", v:"7,2", p:72}, {k:"Sessizlik", v:"8,9", p:89}
  ],
  riskler: [
    {k:"Deprem", v:"Orta · ZC zemin", n:2}, {k:"Sel", v:"Düşük", n:1},
    {k:"Heyelan", v:"Düşük", n:1}, {k:"İmar riski", v:"Düşük · plan onaylı", n:1}
  ],
  piyasa: {
    medyan:"₺6.900", min:"₺5.200", max:"₺9.100", trend:"+%12",
    sure:"74 gün", arz:"23 aktif ilan", yas:"26 gün", pay:"%3–5",
    konumYorum:"Bu ilan mahalle medyanının %7 altında"
  },
  benzer: [
    {ad:"Çıplaklı'da imarlı arsa", m2:"980 m²", fiyat:"₺6.150.000", m2f:"₺6.276/m²", not:"Aynı ilçe · benzer imar", rozet:"Doğrulanmış", bg:"repeating-linear-gradient(45deg,#CBD3C2 0 12px,#C0C9B6 12px 24px)"},
    {ad:"Yeniköy'de yatırımlık parsel", m2:"1.450 m²", fiyat:"₺9.800.000", m2f:"₺6.759/m²", not:"Aynı mahalle", rozet:"Yeni", bg:"repeating-linear-gradient(135deg,#CDD2DA 0 12px,#C2C8D2 12px 24px)"},
    {ad:"Aşağıoba'da tarla vasıflı arsa", m2:"2.100 m²", fiyat:"₺11.550.000", m2f:"₺5.500/m²", not:"İmarsız · geniş alan", rozet:"", bg:"repeating-linear-gradient(0deg,#D6D0C2 0 12px,#CCC5B5 12px 24px)"},
    {ad:"Yeniköy'de köşe parsel", m2:"1.100 m²", fiyat:"₺7.590.000", m2f:"₺6.900/m²", not:"Aynı mahalle · köşe", rozet:"Fiyat düştü", bg:"repeating-linear-gradient(90deg,#C9CFC9 0 12px,#BEC6BE 12px 24px)"}
  ],
  belgeler: [
    {ad:"Tapu özeti", durum:"Doğrulandı", tarih:"28 Haz 2026", kilit:false, aksiyon:"Görüntüle"},
    {ad:"İmar çapı", durum:"Doğrulandı", tarih:"28 Haz 2026", kilit:false, aksiyon:"Görüntüle"},
    {ad:"Aplikasyon krokisi", durum:"Doğrulandı", tarih:"12 Haz 2026", kilit:true, aksiyon:"Giriş gerekli"},
    {ad:"Ekspertiz raporu", durum:"Doğrulandı", tarih:"12 Haz 2026", kilit:true, aksiyon:"Giriş gerekli"},
    {ad:"Zemin etüdü", durum:"Talep edilebilir", tarih:"", kilit:false, aksiyon:"Danışmandan iste"}
  ],
  sorular: [
    {q:"İmar durumu nedir?", a:"Parsel konut imarlı, ayrık nizam. Emsal (KAKS) 0,30 ve TAKS 0,15; gabari 6,50 m (2 kat). 1.320 m² × 0,30 ≈ 396 m² emsal inşaat hakkı verir.", kaynak:"Belgeler → İmar çapı · 28 Haz 2026"},
    {q:"Krediye uygun mu?", a:"İlan \"krediye uygun\" beyanlı ve tapu müstakil. İmarlı arsalarda bankalar tipik olarak ekspertiz değerinin ~%50'sine kadar kredi kullandırır; Finansal analiz bölümünde senaryo hazır.", kaynak:"İlan alanı + platform kredi kuralları"},
    {q:"Benzer arsalardan pahalı mı?", a:"m² fiyatı ₺6.401; Yeniköy medyanı ₺6.900. Bu ilan medyanın ~%7 altında. Son 90 günde bölge m² fiyatı +%12 yükseldi.", kaynak:"Piyasa verisi · 1 Tem 2026"},
    {q:"Altyapı ne durumda?", a:"Elektrik, su ve kanalizasyon parsel sınırında mevcut. Doğalgaz ana hattı ≈400 m mesafede — bağlantı maliyetini danışmana sorun.", kaynak:"İlan alanı — danışman beyanı"},
    {q:"Bu arsaya ne inşa edebilirim?", a:"Mevcut imarla ≈396 m² toplam inşaat, ≈198 m² zemin oturumu ve 2 kat mümkün: müstakil ya da ikiz villa tipolojisi. Kesin hak için belediyeden güncel imar çapı alınmalı.", kaynak:"Hesap — imar çapı verileri"}
  ],
  fallback: {a:"İlan verisinde bu sorunun net karşılığı yok. Soruyu danışmana iletebilirim — ortalama yanıt süresi 28 dk.", kaynak:"Yönlendirme — danışman"},
  ozet: {
    bullets:[
      "24 m yol cepheli köşe parsel; 0,30 emsal ile ≈396 m² inşaat hakkı (2 kat).",
      "m² fiyatı ₺6.401 — mahalle medyanının %7 altında; bölge 90 günde +%12.",
      "Elektrik, su, kanalizasyon parselde; doğalgaz hattına 400 m."
    ],
    uygun:"Konut geliştirme (müstakil / ikiz villa) ve 2–4 yıllık değer artışı yatırımı.",
    dikkat:"Doğalgaz bağlantı maliyeti; imar çapının belediyeden güncel teyidi önerilir."
  },
  senaryolar: [
    {ad:"Kötümser", yil:"+%15/yıl", deger:"₺12,9M", not:"3 yıl bileşik"},
    {ad:"Baz", yil:"+%28/yıl", deger:"₺17,7M", not:"3 yıl bileşik"},
    {ad:"İyimser", yil:"+%42/yıl", deger:"₺24,2M", not:"3 yıl bileşik"}
  ],
  masraflar: [
    {k:"Tapu harcı (%4)", v:"₺338.000"}, {k:"Döner sermaye + kadastro", v:"₺4.320"},
    {k:"Ekspertiz", v:"₺14.500"}, {k:"Emlak komisyonu (%2 + KDV)", v:"₺202.800"},
    {k:"Toplam ek maliyet", v:"≈₺559.620"}
  ],
  danisman: {
    ad:"Ayşe Demir", ofis:"Akdeniz Gayrimenkul",
    yetki:"TB Yetki Belgesi No: 0700123 · EİDS kayıtlı",
    uye:"Üyelik: 2019", portfoy:"46 aktif portföy", yanit:"~28 dk yanıt",
    puan:"4,8", yorum:"212 değerlendirme", uzman:"Döşemealtı & Kepez arsa portföyü",
    adres:"Yeniköy Mah. Atatürk Cad. No:41, Döşemealtı",
    saat:"Hafta içi 09.00–18.30 · Cmt 10.00–16.00"
  },
  seo: {
    aramalar:["Döşemealtı satılık arsa","Antalya imarlı arsa","Yeniköy arsa fiyatları","Antalya yatırımlık arsa","Döşemealtı köşe parsel"],
    rehber:["Döşemealtı yatırım rehberi","Arsa alırken tapu kontrol listesi","İmar çapı nasıl okunur?","Arsa kredisi şartları 2026"]
  }
};
export default D;
