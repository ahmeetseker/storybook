import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  GlassAgencyCard,
  GlassAiSearchBar,
  GlassButton,
  GlassChip,
  GlassHero,
  GlassMap,
  GlassMetricStrip,
  GlassSegmentedControl,
  GlassVitrin,
} from "@repo/ui";
import { agencyFixtures, homeVitrinItems } from "../fixtures";
import { HERO_TABS, heroTab, type HeroTabId, type HeroParsedFilter } from "./heroTabs";
import { HomeConceptFrame } from "../shared/HomeConceptFrame";
import { HomeFooter } from "../shared/HomeFooter";
import styles from "./MapFirstHome.module.css";

// Zemin sabit referans: her render'da yeni nesne üretilirse harita yeniden kurulur.
const HERO_BASEMAP = {
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: (
    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
      © OpenStreetMap katkıcıları
    </a>
  ),
  center: [39, 35.2] as [number, number],
  zoom: 5.35,
  maxZoom: 19,
  tone: "quiet" as const,
};

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
  /** Controlled sekme */
  tab?: HeroTabId;
  /** Uncontrolled başlangıç sekmesi */
  defaultTab?: HeroTabId;
  onTabChange?: (tab: HeroTabId) => void;
}

export function MapFirstHome({
  showConceptNavigation = true,
  tab,
  defaultTab = "arsa",
  onTabChange,
}: MapFirstHomeProps) {
  const navigate = useNavigate();
  const [innerTab, setInnerTab] = useState<HeroTabId>(defaultTab);
  const activeTabId = tab ?? innerTab;
  const active = heroTab(activeTabId);
  const [removedFilters, setRemovedFilters] = useState<string[]>([]);
  const parsedFilters: HeroParsedFilter[] = active.parsedFilters.filter(
    (filter) => !removedFilters.includes(`${active.id}:${filter.id}`),
  );

  const selectTab = (next: string) => {
    if (next !== "arsa" && next !== "konut" && next !== "proje") return;
    if (tab === undefined) setInnerTab(next);
    onTabChange?.(next);
  };

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
          eyebrow={
            <GlassSegmentedControl
              label="İlan türü"
              options={HERO_TABS.map((item) => ({ value: item.id, label: item.label }))}
              value={activeTabId}
              onChange={selectTab}
            />
          }
          title={active.title}
          subtitle={active.subtitle}
          search={
            <div className={styles.heroSearch}>
              <GlassAiSearchBar
                placeholder={active.placeholder}
                suggestions={active.suggestions}
                parsedFilters={parsedFilters}
                confidence={active.confidence}
                onRemoveFilter={(id) => setRemovedFilters((prev) => [...prev, `${active.id}:${id}`])}
                onSubmit={goToSearch}
                aria-label="İlanları yapay zekâ ile ara"
              />
            </div>
          }
          actions={
            <div className={styles.quickFilters}>
              {active.quickFilters.map((filter) => (
                <GlassChip key={filter} size="sm">
                  {filter}
                </GlassChip>
              ))}
            </div>
          }
          media={
            <div className={styles.mapRegion}>
              <GlassMap
                className={styles.heroMap}
                variant="panel"
                label={`${active.label} haritası`}
                pins={active.pins}
                basemap={HERO_BASEMAP}
                popupContent={(id) => {
                  const pin = active.pins.find((item) => item.id === id);
                  return pin ? <strong>{pin.price ?? `${pin.count} ilan`}</strong> : null;
                }}
              />
            </div>
          }
        />
        <div className={styles.trustBand}>
          <GlassMetricStrip
            size="sm"
            label="Doğrulama göstergeleri"
            items={[
              { id: "verified", label: "Doğrulanmış", value: active.verifiedCount, hint: active.verifiedLabel },
              { id: "today", label: "Bugün doğrulanan", value: "12", hint: "EİDS tapu eşleşmesi" },
              { id: "cities", label: "İl", value: "81", hint: "Türkiye geneli" },
            ]}
          />
        </div>
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
