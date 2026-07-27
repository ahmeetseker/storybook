import { useNavigate } from "@tanstack/react-router";
import {
  GlassAiSearchBar,
  GlassHero,
  GlassMetricStrip,
  GlassSavedSearchCard,
  GlassVitrin,
} from "@repo/ui";
import { withBase } from "@/config/base-path";
import { homeVitrinItems } from "../fixtures";
import { HomeConceptFrame } from "../shared/HomeConceptFrame";
import { HomeFooter } from "../shared/HomeFooter";
import styles from "./MarketplaceShowcaseHome.module.css";

const categories = [
  { label: "Konut imarlı", href: "/arsa-ara?tur=konut-imarli" },
  { label: "Villa imarlı", href: "/arsa-ara?tur=villa-imarli" },
  { label: "Tarla", href: "/arsa-ara?tur=tarla" },
  { label: "Deniz manzaralı", href: "/arsa-ara?ozellik=deniz-manzarali" },
  { label: "Sanayi parseli", href: "/arsa-ara?tur=sanayi" },
  { label: "EİDS doğrulamalı", href: "/arsa-ara?eids=true" },
] as const;

export function MarketplaceShowcaseHome() {
  const navigate = useNavigate();
  const goToSearch = () => {
    void navigate({ to: "/arsa-ara" });
  };
  const interactiveVitrinItems = homeVitrinItems.map((item, index) => ({
    ...item,
    featured: index < 5,
    onClick: goToSearch,
  }));

  return (
    <HomeConceptFrame
      activeConcept="pazar-vitrini"
      className={styles.page}
      footer={<HomeFooter variant="slim" />}
    >
      <GlassHero
        variant="search"
        align="start"
        titleAs="h1"
        title="Türkiye genelinde arsa ilanları"
        subtitle="Öne çıkan fırsatlardan ayrıntılı kataloğa geç; kategori, fiyat ve doğrulama bilgisini hızla tara."
        search={
          <GlassAiSearchBar
            placeholder="Şehir, ilçe, bütçe veya imar tercihini yaz"
            suggestions={[
              "İzmir imarlı arsa",
              "Ankara yatırımlık tarla",
              "Antalya deniz manzaralı arsa",
            ]}
            onSubmit={goToSearch}
          />
        }
      />

      <section
        className={styles.categorySection}
        aria-labelledby="marketplace-categories-title"
      >
        <h2 id="marketplace-categories-title">Hızlı kategoriler</h2>
        <nav className={styles.categoryRail} aria-label="Arsa kategorileri">
          {categories.map((category) => (
            <a key={category.label} href={withBase(category.href)}>
              {category.label}
            </a>
          ))}
        </nav>
      </section>

      <section
        className={styles.section}
        aria-labelledby="marketplace-featured-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="marketplace-featured-title">Öne çıkan demo ilanları</h2>
          <p>
            Bantlı vitrin, doğrulanmış ve öne çıkarılmış ilanları ilk bakışta
            ayırır.
          </p>
        </header>
        <GlassVitrin
          variant="banded"
          columns={7}
          bandCount={5}
          items={interactiveVitrinItems}
        />
      </section>

      <section
        className={styles.section}
        aria-labelledby="marketplace-catalog-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="marketplace-catalog-title">Daha geniş katalog</h2>
          <p>
            Cetvelli görünüm, aynı demo verisini daha yüksek bilgi yoğunluğuyla
            sunar.
          </p>
        </header>
        <GlassVitrin
          variant="ruled"
          columns={7}
          className={styles.ruledCatalog}
          items={[...interactiveVitrinItems].reverse()}
        />
        <a className={styles.compareLink} href={withBase("/karsilastir")}>
          Seçtiklerini karşılaştır
        </a>
      </section>

      <section
        className={styles.section}
        aria-labelledby="marketplace-overview-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="marketplace-overview-title">Pazar özeti ve kayıtlı arama</h2>
          <p>
            Bu göstergeler ve kayıtlı arama sayıları yalnız konsept
            karşılaştırması için demo verisidir.
          </p>
        </header>
        <div className={styles.toolsGrid}>
          <div className={styles.metricPanel}>
            <GlassMetricStrip
              label="Demo pazar göstergeleri"
              items={[
                {
                  id: "listing-count",
                  label: "Demo ilan",
                  value: String(homeVitrinItems.length),
                  hint: "Aynı fixture seti",
                },
                {
                  id: "featured-count",
                  label: "Öne çıkan",
                  value: String(
                    interactiveVitrinItems.filter((item) => item.featured)
                      .length,
                  ),
                  hint: "Bantlı vitrinde",
                },
                {
                  id: "verified-count",
                  label: "EİDS işaretli",
                  value: "4",
                  hint: "Demo doğrulama durumu",
                },
              ]}
            />
          </div>
          <GlassSavedSearchCard
            headingAs="h3"
            title="Ege'de konut imarlı arsa"
            criteria={["İzmir ve Muğla", "Konut imarlı", "7 milyon TL altı"]}
            newResultCount={3}
            lastRunLabel="demo oturumu"
            frequencyLabel="Günlük"
            onOpen={goToSearch}
          />
        </div>
      </section>
    </HomeConceptFrame>
  );
}
