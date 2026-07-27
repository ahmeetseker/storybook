import { useNavigate } from "@tanstack/react-router";
import {
  GlassAgencyCard,
  GlassAiSearchBar,
  GlassBento,
  GlassHero,
  GlassListingCard,
  GlassMatchScore,
  GlassVitrin,
  type GlassAiSearchBarFilter,
} from "@repo/ui";
import { withBase } from "@/config/base-path";
import { agencyFixtures, homeListings, homeVitrinItems } from "../fixtures";
import { HomeConceptFrame } from "../shared/HomeConceptFrame";
import { HomeFooter } from "../shared/HomeFooter";
import styles from "./AiDiscoveryHome.module.css";

const parsedFilters: GlassAiSearchBarFilter[] = [
  { id: "location", label: "Konum", value: "İzmir, Urla" },
  { id: "budget", label: "Bütçe", value: "5 milyon TL altı" },
  { id: "zoning", label: "İmar", value: "Konut imarlı" },
];

export function AiDiscoveryHome() {
  const navigate = useNavigate();
  const goToSearch = () => {
    void navigate({ to: "/arsa-ara" });
  };
  const featured = homeVitrinItems[0];
  const interactiveVitrinItems = homeVitrinItems.map((item) => ({
    ...item,
    onClick: goToSearch,
  }));

  return (
    <HomeConceptFrame
      activeConcept="ai-kesif"
      className={styles.page}
      footer={<HomeFooter variant="columns" />}
    >
      <GlassHero
        variant="search"
        align="start"
        titleAs="h1"
        title="Arsanı tarif et, gerisini birlikte daraltalım"
        subtitle="Örnek sorgunu bütçe, konum ve imar filtrelerine ayırır; kararın kontrolü sende kalır."
        search={
          <GlassAiSearchBar
            defaultValue="Urla'da 5 milyon TL altında imarlı arsa"
            parsedFilters={parsedFilters}
            confidence={89}
            suggestions={[
              "Urla'da denize yakın imarlı parsel",
              "Kaş'ta manzaralı arsa",
              "Gölbaşı'nda yol cepheli tarla",
            ]}
            onSubmit={goToSearch}
          />
        }
      />

      <section
        className={styles.section}
        aria-labelledby="ai-discovery-context-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="ai-discovery-context-title">Sorgudan açıklanabilir keşfe</h2>
          <p>
            Öne çıkan demo ilanı, bölge bağlamı ve doğrulama bilgisi aynı
            bakışta okunur.
          </p>
        </header>

        <GlassBento columns={3}>
          <GlassBento.Feature
            image={featured.image}
            price={featured.price}
            title={featured.title}
            meta={featured.location}
            badge="EİDS doğrulandı"
            onClick={goToSearch}
          />
          <GlassBento.Cell>
            <a className={styles.regionLink} href={withBase("/bolgeler")}>
              <strong>Bölge görünümü</strong>
              <span>
                Urla çevresindeki demo ilanlarını konumla birlikte aç.
              </span>
              <span className={styles.regionAction}>Bölgeleri incele</span>
            </a>
          </GlassBento.Cell>
          <GlassBento.Stat
            value="EİDS"
            label="Tapu ve parsel eşleşmesi görünür"
          />
        </GlassBento>
      </section>

      <section
        className={styles.section}
        aria-labelledby="ai-discovery-match-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="ai-discovery-match-title">Neden bu ilanlar?</h2>
          <p>
            Demo profilindeki her öneri, eşleşen ve eksik kalan ölçütleri
            birlikte gösterir.
          </p>
        </header>

        <div className={styles.recommendationGrid}>
          <div className={styles.listingGrid}>
            {homeListings.slice(0, 2).map((listing) => (
              <GlassListingCard
                {...listing}
                key={listing.id ?? listing.title}
                material="flat"
                className={styles.listingCard}
                aria-label={`${listing.title} ilanını aç`}
                onClick={goToSearch}
              />
            ))}
          </div>
          <div className={styles.matchPanel}>
            <GlassMatchScore
              value={88}
              title="Demo profiline uyum"
              confidence={86}
              explanation="Bütçe ve imar tercihi karşılanıyor. Deniz yakınlığı ilan kaynağından ayrıca doğrulanmalı."
              criteria={[
                { label: "5 milyon TL altı", matched: true },
                { label: "Konut imarlı", matched: true },
                { label: "Urla", matched: true },
                { label: "Denize yürüme mesafesi", matched: false },
              ]}
            />
            <a className={styles.compareLink} href={withBase("/karsilastir")}>
              Önerileri karşılaştır
            </a>
          </div>
        </div>
      </section>

      <section
        className={styles.section}
        aria-labelledby="ai-discovery-listings-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="ai-discovery-listings-title">Keşfi genişlet</h2>
          <p>
            Aynı deterministik demo verisiyle farklı şehir ve arazi tiplerini
            hızlıca tara.
          </p>
        </header>
        <GlassVitrin
          variant="banded"
          columns={7}
          bandCount={3}
          className={styles.discoveryVitrin}
          items={interactiveVitrinItems}
        />
      </section>

      <section
        className={styles.section}
        aria-labelledby="ai-discovery-agencies-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="ai-discovery-agencies-title">Doğrulanmış bölge ofisleri</h2>
          <p>
            Uzmanlık alanı ve doğrudan telefon bağlantısı görünür olan kurumsal
            ofisler.
          </p>
        </header>
        <div className={styles.agencyGrid}>
          {agencyFixtures.slice(0, 2).map((agency) => (
            <GlassAgencyCard {...agency} key={agency.name} variant="inline" />
          ))}
        </div>
      </section>
    </HomeConceptFrame>
  );
}
