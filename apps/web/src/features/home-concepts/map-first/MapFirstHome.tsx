import { useState, useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  GlassAiSearchBar,
  GlassButton,
  GlassChip,
  GlassHero,
  GlassHighlightCard,
  GlassMap,
  GlassMapPopupCard,
  GlassMarquee,
  type GlassMarqueeItem,
  GlassMetricStrip,
  GlassSegmentedControl,
  GlassSelect,
  GlassSeoDiscovery,
  GlassVitrin,
} from "@repo/ui";
import { withBase } from "@/config/base-path";
import { EXPLORE_BASEMAP } from "@/config/basemap";
import { agencyHighlightFixtures, homeVitrinItems } from "../fixtures";
import { buildSeoDiscoveryColumns } from "../shared/seo-discovery-links";
import { HERO_TABS, heroTab, type HeroTabId, type HeroParsedFilter } from "./heroTabs";
import { HomeConceptFrame } from "../shared/HomeConceptFrame";
import styles from "./MapFirstHome.module.css";

// Zemin sabit referans: her render'da yeni nesne üretilirse harita yeniden
// kurulur. Ortak `EXPLORE_BASEMAP` kullanılır — hero, arama sonucu ve bölge
// rehberi aynı zemini ve aynı kadraj sınırlarını paylaşır.
//
// Kadraj artık SÜRÜKLENEBİLİR (`pannable: true`): harita bir vitrin resmi değil
// bir keşif aracı. Kullanıcı yoğunluk rozetine tıklayıp ülkeden bölgeye,
// bölgeden ilçeye, oradan tek ilana iniyor; kilitli kadraj bu zinciri ilk
// adımda kesiyordu.
const HERO_BASEMAP = EXPLORE_BASEMAP;

// Footer üstü SEO rafı — `withBase` derleme zamanı sabitine bağlı, render
// başına yeniden kurulmasın diye modül düzeyinde çözülür.
const seoDiscoveryColumns = buildSeoDiscoveryColumns(withBase);

// Footer'ın hemen üstünde dönen şerit: önce vitrin (doping) ilanları, sonra
// portföyün başı — 10 öğe bir turu makul tutar (bkz. GlassMarquee rules §8).
const marqueeListings: GlassMarqueeItem[] = [
  ...homeVitrinItems.filter((item) => item.featured),
  ...homeVitrinItems.filter((item) => !item.featured),
]
  .slice(0, 10)
  .map((item) => ({
    id: item.id,
    label: item.title,
    meta: item.price,
    href: withBase(`/ilan/${item.id}`),
  }));

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

// Arama hero'sundaki konum seçici — bölge bağlantılarıyla aynı kaynaktan beslenir.
const heroKonumSecenekleri = [
  { value: "tumu", label: "Tüm Türkiye" },
  ...regions.map((region) => ({ value: region.href, label: region.name })),
];

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.8-3.8" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CityIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 21h18M5 21V7l7-4v18M12 21V11l7 4v6" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3Z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

/* Dar ekranda arama kartının sekme şeridi `fill="content"` ile sola kümelenip
   sağda ölü boşluk bırakıyor (geniş şeritte ise eşit paylaşım devasa seçim
   damlası üretir — bkz. GlassSegmentedControl rules §6). `fill` bir prop
   olduğu için kırılma CSS'te değil burada: şerit dar viewport'ta eşit üçe
   bölünür. Eşik, hero'nun dar kap sorgusuyla aynı (32rem). */
const DAR_EKRAN_SORGUSU = "(max-width: 32rem)";
const subscribeDarEkran = (onChange: () => void) => {
  const mql = window.matchMedia(DAR_EKRAN_SORGUSU);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};
const darEkranMi = () => window.matchMedia(DAR_EKRAN_SORGUSU).matches;

export interface MapFirstHomeProps {
  /**
   * Hero yerleşimi — "map": haritalı split hero (konsept galerisi),
   * "search": Arsam yerleşimi (eyebrow + vurgulu başlık + yapılandırılmış arama kartı).
   */
  heroVariant?: "map" | "search";
  /** Controlled sekme */
  tab?: HeroTabId;
  /** Uncontrolled başlangıç sekmesi */
  defaultTab?: HeroTabId;
  onTabChange?: (tab: HeroTabId) => void;
}

export function MapFirstHome({
  heroVariant = "map",
  tab,
  defaultTab = "arsa",
  onTabChange,
}: MapFirstHomeProps) {
  const navigate = useNavigate();
  const darEkran = useSyncExternalStore(subscribeDarEkran, darEkranMi, () => false);
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
      className={styles.page}
      footer={
        /* Şerit sayfa container'ının dışında yaşar: tam genişlikte bant
           kırpılmadan footer'a yaslanır. Footer'ın KENDİSİ burada değil:
           artık `MarketplaceShell` her sayfada çiziyor (bkz. SiteFooter). */
        <GlassMarquee
          items={marqueeListings}
          label="Öne çıkan ilanlar"
          variant="accent"
        />
      }
    >
      <div className={styles.hero}>
        {heroVariant === "search" ? (
          <GlassHero
            variant="search"
            titleAs="h1"
            ambient
            eyebrow={<span className={styles.heroEyebrow}>Türkiye'nin Arsa Rehberi</span>}
            title={
              <>
                Hayal ettiğin{" "}
                <span className={styles.heroWord}>{active.heroWord}</span> seni
                bekliyor.
              </>
            }
            subtitle={active.subtitle}
            search={
              <form
                className={styles.searchCard}
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  goToSearch();
                }}
              >
                <GlassSegmentedControl
                  label="İlan türü"
                  variant="bar"
                  fill={darEkran ? "equal" : "content"}
                  options={HERO_TABS.map((item) => ({ value: item.id, label: item.label }))}
                  value={activeTabId}
                  onChange={selectTab}
                />
                <div className={styles.searchRow}>
                  <div className={styles.searchField}>
                    <GlassSelect
                      aria-label="Konum"
                      options={heroKonumSecenekleri}
                      defaultValue="tumu"
                      material="flat"
                      size="md"
                    />
                  </div>
                  <div className={styles.searchField}>
                    <GlassSelect
                      key={active.id}
                      aria-label={active.detailFilter.label}
                      placeholder={active.detailFilter.placeholder ?? active.detailFilter.label}
                      options={active.detailFilter.options}
                      material="flat"
                      size="md"
                    />
                  </div>
                  <GlassButton className={styles.searchSubmit} type="submit" size="md" prominent>
                    <SearchIcon />
                    İlanları Gör
                  </GlassButton>
                </div>
              </form>
            }
            quickLinks={
              <>
                <span className={styles.heroStat}>
                  <PinIcon /> {active.verifiedCount} {active.verifiedLabel}
                </span>
                <span className={styles.heroStat}>
                  <CityIcon /> 81 il
                </span>
                <span className={styles.heroStat}>
                  <GridIcon /> {regions.length} bölge
                </span>
                <span className={styles.heroStat}>
                  <ShieldIcon /> EİDS yetki kontrolü
                </span>
              </>
            }
          />
        ) : (
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
                // Yoğunluk rozetine tıklamak kadrajı o bölgeye indirir; alt
                // kümeler açılır ve zincir tek ilanın fiyat kapsülüne kadar
                // sürer (bkz. GlassMap rules §10).
                cluster
                popupContent={(id) => {
                  const pin = active.pins.find((item) => item.id === id);
                  if (!pin) return null;
                  return (
                    <GlassMapPopupCard
                      title={pin.title ?? active.label}
                      meta={pin.meta}
                      price={pin.price ?? `${pin.count} ilan`}
                      href={pin.href ?? withBase("/arsa-ara")}
                      actionLabel="İlanları gör"
                    />
                  );
                }}
              />
            </div>
          }
        />
        )}
        {heroVariant === "map" ? (
          <div className={styles.trustBand}>
            <GlassMetricStrip
              size="sm"
              label="Doğrulama göstergeleri"
              items={[
                { id: "verified", label: "Doğrulanmış", value: active.verifiedCount, hint: active.verifiedLabel },
                { id: "today", label: "Bugün doğrulanan", value: "12", hint: "EİDS ilan verme yetkisi" },
                { id: "cities", label: "İl", value: "81", hint: "Türkiye geneli" },
              ]}
            />
          </div>
        ) : null}
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
              href={withBase(region.href)}
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
            variant="gradient"
            label="Arsa pazarı göstergeleri"
            items={[
              {
                id: "listing-count",
                label: "Aktif ilan",
                value: String(homeVitrinItems.length),
                hint: "Ana sayfa portföyü",
                tone: "accent",
                motif: "parcels",
                action: { label: "Portföyü gör", href: withBase("/emlak") },
              },
              {
                id: "verified-count",
                label: "EİDS işaretli",
                value: String(verifiedListingCount),
                hint: "Kaynağı görünür",
                tone: "success",
                motif: "seal",
                action: {
                  // `verified` gerçek bir arama filtresi (search-state.ts)
                  label: "Doğrulanmışları süz",
                  href: withBase("/emlak?verified=1"),
                },
              },
              {
                id: "region-count",
                label: "Bölge",
                value: String(regions.length),
                hint: "Hızlı keşif bağlantısı",
                tone: "neutral",
                motif: "pins",
                action: {
                  label: "Bölgeleri keşfet",
                  href: withBase("/bolgeler"),
                },
              },
              {
                id: "featured-count",
                label: "Vitrin ilanı",
                value: String(
                  homeVitrinItems.filter((item) => item.featured).length,
                ),
                hint: "Öne çıkan seçim",
                tone: "warning",
                motif: "star",
                // Aksiyon yok: arama durumunda "vitrin/featured" filtresi
                // bulunmuyor (search-state.ts). Filtre eklenene kadar
                // yanlış hedefe götüren bir bağlantı koymuyoruz.
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
          {agencyHighlightFixtures.slice(0, 3).map((agency) => (
            <GlassHighlightCard
              {...agency}
              key={agency.title}
              href={withBase("/ofisler")}
              onNavigate={goToAgencies}
            />
          ))}
        </div>
        {/* Kabuktaki "İlan ver" ile aynı reçete: sm + prominent (tek kaynak
            --lg-action-prominent, bkz. tasarim-guardlari) */}
        <GlassButton
          size="sm"
          prominent
          className={styles.agencyCta}
          onClick={goToAgencies}
        >
          Tüm doğrulanmış ofisleri gör
        </GlassButton>
      </section>

      {/* Sayfanın son bandı: arama niyetine göre kümelenmiş uzun kuyruk açılış
          sayfaları. Footer'ın hemen üstünde durur — okuma biten yerde bir
          sonraki niyeti önerir, aynı zamanda bu sayfaları taranabilir kılar. */}
      <section
        className={`${styles.section} ${styles.seoSection}`}
        aria-labelledby="map-seo-discovery-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="map-seo-discovery-title">En çok aranan arsa sayfaları</h2>
          <p>
            Bölge, arazi tipi ve yatırım amacına göre hazırlanmış rehberler.
            Aradığın cümleyi seç, doğrudan sonuçlara git.
          </p>
        </header>
        <GlassSeoDiscovery columns={seoDiscoveryColumns} columnCount={4} />
      </section>
    </HomeConceptFrame>
  );
}
