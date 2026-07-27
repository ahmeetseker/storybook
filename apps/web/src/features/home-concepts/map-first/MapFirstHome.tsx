import { useNavigate } from "@tanstack/react-router";
import {
  GlassAgencyCard,
  GlassAiSearchBar,
  GlassButton,
  GlassHero,
  GlassMetricStrip,
  GlassVitrin,
} from "@repo/ui";
import { LeafletListingMap, type LeafletListingPoint } from "./LeafletListingMap";
import { agencyFixtures, homeVitrinItems } from "../fixtures";
import { HomeConceptFrame } from "../shared/HomeConceptFrame";
import { HomeFooter } from "../shared/HomeFooter";
import styles from "./MapFirstHome.module.css";

const mapPins: LeafletListingPoint[] = [
  { id: "1084526631", lat: 38.322, lng: 26.764, label: "Urla", popup: "Urla · 4.250.000 TL" },
  { id: "1084526634", lat: 36.20, lng: 29.64, label: "Kaş", popup: "Kaş · 6.900.000 TL" },
  { id: "1084526632", lat: 39.92, lng: 32.85, label: "Gölbaşı", popup: "Gölbaşı · 1.850.000 TL" },
  { id: "ege-cluster", lat: 37.04, lng: 27.43, label: "Bodrum", popup: "Bodrum · 18 ilan" },
  { id: "1084526633", lat: 38.74, lng: 26.18, label: "Çeşme", popup: "Çeşme · 3.100.000 TL" },
  { id: "marmara-cluster", lat: 40.35, lng: 29.06, label: "Bursa", popup: "Bursa · 9 ilan" },
];

const regions = [
  {
    name: "Ege kıyıları",
    detail: "İzmir ve Muğla",
    count: "18 ilan",
    href: "/arsa-ara?bolge=ege",
  },
  {
    name: "Akdeniz hattı",
    detail: "Antalya ve Mersin",
    count: "12 ilan",
    href: "/arsa-ara?bolge=akdeniz",
  },
  {
    name: "İç Anadolu",
    detail: "Ankara ve Eskişehir",
    count: "15 ilan",
    href: "/arsa-ara?bolge=ic-anadolu",
  },
  {
    name: "Marmara çevresi",
    detail: "Bursa ve Tekirdağ",
    count: "9 ilan",
    href: "/arsa-ara?bolge=marmara",
  },
  {
    name: "Kuzey Ege",
    detail: "Çanakkale ve Balıkesir",
    count: "14 ilan",
    href: "/arsa-ara?bolge=kuzey-ege",
  },
  {
    name: "İstanbul çevresi",
    detail: "Silivri ve Çatalca",
    count: "11 ilan",
    href: "/arsa-ara?bolge=istanbul-cevresi",
  },
  {
    name: "Batı Karadeniz",
    detail: "Kocaeli ve Sakarya",
    count: "8 ilan",
    href: "/arsa-ara?bolge=bati-karadeniz",
  },
  {
    name: "Trakya",
    detail: "Edirne ve Kırklareli",
    count: "10 ilan",
    href: "/arsa-ara?bolge=trakya",
  },
] as const;

export interface MapFirstHomeProps {
  showConceptNavigation?: boolean;
}

export function MapFirstHome({
  showConceptNavigation = true,
}: MapFirstHomeProps) {
  const navigate = useNavigate();
  const goToSearch = () => {
    void navigate({ to: "/arsa-ara" });
  };
  const goToCompare = () => {
    void navigate({ to: "/karsilastir" });
  };
  const goToAgencies = () => {
    void navigate({ to: "/ofisler" });
  };
  const interactiveVitrinItems = homeVitrinItems.map((item) => ({
    ...item,
    onClick: goToSearch,
  }));
  const verifiedListingCount = homeVitrinItems.filter(
    (item) => item.eids,
  ).length;

  return (
    <HomeConceptFrame
      activeConcept={showConceptNavigation ? "harita-kesfi" : undefined}
      showConceptNavigation={showConceptNavigation}
      className={styles.page}
      footer={
        <HomeFooter variant="columns" showConceptLink={showConceptNavigation} />
      }
    >
      <div className={styles.hero}>
        <GlassHero
          variant="split"
          titleAs="h1"
          title="Arsayı önce haritada gör"
          subtitle="Bölgeyi seç, fiyat kümelerini incele ve doğrulanmış ilanlara konum üzerinden ulaş."
          animate={false}
          actions={
            <div className={styles.heroSearch}>
              <GlassAiSearchBar
                placeholder="Bölge, bütçe veya imar tercihini yaz"
                suggestions={[
                  "Urla konut imarlı arsa",
                  "Kaş deniz manzaralı arsa",
                  "Gölbaşı yol cepheli tarla",
                ]}
                onSubmit={goToSearch}
              />
            </div>
          }
          media={
            <section
              className={styles.mapRegion}
              aria-label="Bölgesel arsa haritası"
            >
              <LeafletListingMap points={mapPins} />
            </section>
          }
        />
      </div>

      <section
        className={styles.section}
        aria-labelledby="map-featured-listings-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="map-featured-listings-title">Öne çıkan arsa ilanları</h2>
          <p>Fiyat, konum ve doğrulama bilgisini hızlıca tara.</p>
        </header>
        <GlassVitrin
          variant="banded"
          columns={8}
          bandCount={5}
          items={interactiveVitrinItems.slice(0, 30)}
        />
      </section>

      <section className={styles.section} aria-labelledby="map-regions-title">
        <header className={styles.sectionHeader}>
          <h2 id="map-regions-title">Bölgeye göre keşfet</h2>
          <p>Türkiye'nin öne çıkan arsa bölgelerini tek bakışta karşılaştır.</p>
        </header>
        <nav className={styles.regionGrid} aria-label="Bölge sonuçları">
          {regions.map((region) => (
            <a
              key={region.name}
              className={styles.regionLink}
              href={region.href}
            >
              <span>
                <strong>{region.name}</strong>
                <small>{region.detail}</small>
              </span>
              <b>{region.count}</b>
            </a>
          ))}
        </nav>
      </section>

      <section
        className={`${styles.section} ${styles.metricSection}`}
        aria-labelledby="map-market-summary-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="map-market-summary-title">Pazarın hızlı özeti</h2>
          <p>
            İlanların bölge, doğrulama ve vitrin dağılımını tek bakışta gör.
          </p>
        </header>
        <div className={styles.metricPanel}>
          <GlassMetricStrip
            size="sm"
            label="Arsa pazarı göstergeleri"
            items={[
              {
                id: "listing-count",
                label: "Aktif ilan",
                value: String(homeVitrinItems.length),
                hint: "Ana sayfa portföyü",
              },
              {
                id: "verified-count",
                label: "EİDS işaretli",
                value: String(verifiedListingCount),
                hint: "Kaynağı görünür",
              },
              {
                id: "region-count",
                label: "Bölge",
                value: String(regions.length),
                hint: "Hızlı keşif bağlantısı",
              },
              {
                id: "featured-count",
                label: "Vitrin ilanı",
                value: String(
                  homeVitrinItems.filter((item) => item.featured).length,
                ),
                hint: "Öne çıkan seçim",
              },
            ]}
          />
        </div>
      </section>

      <section
        className={styles.section}
        aria-labelledby="map-new-listings-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="map-new-listings-title">Yeni eklenen ilanlar</h2>
          <p>Farklı şehir ve arazi tiplerindeki son ilanları incele.</p>
        </header>
        <GlassVitrin
          className={styles.newListings}
          variant="list"
          items={interactiveVitrinItems.slice(30, 48)}
        />
      </section>

      <section
        className={styles.compareBand}
        aria-labelledby="map-compare-title"
      >
        <div>
          <h2 id="map-compare-title">Konumu, fiyatı ve imarı yan yana koy</h2>
          <p>
            Haritadan seçtiğin ilanları tek karşılaştırma görünümünde
            değerlendir.
          </p>
        </div>
        <GlassButton
          className={styles.compareCta}
          tint="var(--lg-accent)"
          onClick={goToCompare}
        >
          Karşılaştırmaya geç
        </GlassButton>
      </section>

      <section className={styles.section} aria-labelledby="map-agencies-title">
        <header className={styles.sectionHeader}>
          <h2 id="map-agencies-title">Bölgesini bilen doğrulanmış ofisler</h2>
          <p>
            Uzmanlık alanı, aktif ilan sayısı ve telefon bağlantısı görünür olan
            kurumsal ofisler.
          </p>
        </header>
        <div className={styles.agencyGrid}>
          {agencyFixtures.slice(0, 3).map((agency) => (
            <GlassAgencyCard {...agency} key={agency.name} variant="inline" />
          ))}
        </div>
        <GlassButton className={styles.agencyCta} onClick={goToAgencies}>
          Tüm doğrulanmış ofisleri gör
        </GlassButton>
      </section>
    </HomeConceptFrame>
  );
}
