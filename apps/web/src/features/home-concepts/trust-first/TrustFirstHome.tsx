import { useNavigate } from "@tanstack/react-router";
import {
  GlassAgencyCard,
  GlassAiEvidenceList,
  GlassButton,
  GlassCarousel,
  GlassHero,
  GlassListingCard,
  GlassMetricStrip,
  GlassTrustSignalPanel,
  type GlassAiEvidenceItem,
} from "@repo/ui";
import {
  agencyFixtures,
  homeListings,
  homeVitrinItems,
  trustSignals,
} from "../fixtures";
import { HomeConceptFrame } from "../shared/HomeConceptFrame";
import { HomeFooter } from "../shared/HomeFooter";
import styles from "./TrustFirstHome.module.css";

const evidence: GlassAiEvidenceItem[] = [
  {
    id: "eids",
    title: "EİDS taşınmaz ve ilan sahibi eşleşmesi",
    sourceType: "official",
    verified: true,
    excerpt:
      "Demo akışında taşınmaz yetkisi, diğer ilan beyanlarından ayrı bir kontrol olarak gösterilir.",
  },
  {
    id: "parcel",
    title: "Ada, parsel ve yüzölçümü kaydı",
    sourceType: "document",
    verified: true,
    excerpt:
      "Parsel kimliği ve yüzölçümü, ilan kartındaki beyanla yan yana okunur.",
  },
  {
    id: "zoning",
    title: "Belediye imar bilgisi ve sorgu tarihi",
    sourceType: "official",
    verified: false,
    excerpt:
      "Kaynağı doğrulanmamış imar beyanı açıkça işaretlenir ve kesin bilgi gibi sunulmaz.",
  },
  {
    id: "moderation",
    title: "AI destekli içerik incelemesi",
    sourceType: "listing",
    verified: true,
    excerpt:
      "AI sonucu kendi etiketiyle görünür; resmî kayıt veya insan onayı yerine geçmez.",
  },
];

const verifiedListingIds = new Set(
  homeVitrinItems.filter((item) => item.eids).map((item) => item.id),
);

const verifiedListings = homeListings.filter(
  (listing) =>
    typeof listing.id === "string" && verifiedListingIds.has(listing.id),
);

export function TrustFirstHome() {
  const navigate = useNavigate();
  const goToSearch = () => {
    void navigate({ to: "/arsa-ara" });
  };
  const goToAgencies = () => {
    void navigate({ to: "/ofisler" });
  };

  return (
    <HomeConceptFrame
      activeConcept="guven-merkezi"
      className={styles.page}
      footer={
        <HomeFooter
          variant="cta"
          cta={
            <section
              className={styles.sellerCta}
              aria-labelledby="seller-verification-title"
            >
              <div>
                <h2 id="seller-verification-title">
                  İlanını doğrulama adımlarıyla yayınla
                </h2>
                <p>
                  Yetki, tapu ve parsel bilgilerini ilan akışında ayrı ayrı
                  kontrol et.
                </p>
              </div>
              <a href="/ilan-ver">Doğrulanmış ilan ver</a>
            </section>
          }
        />
      }
    >
      <GlassHero
        variant="centered"
        titleAs="h1"
        title="Arsa kararında kanıtı öne al"
        subtitle="EİDS, tapu, imar ve AI kaynaklarını ilanla birlikte gör; doğrulanmamış bilgiyi açıkça ayır."
        actions={
          <a className={styles.heroAction} href="/arsa-ara?eids=true">
            Doğrulanmış ilanları ara
          </a>
        }
      />

      <section
        className={styles.metricSection}
        aria-labelledby="trust-overview-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="trust-overview-title">Demo güven özeti</h2>
          <p>
            Bu sayılar ürün yönünü göstermek için ortak fixture setinden
            türetilir; pazar başarısı iddiası değildir.
          </p>
        </header>
        <div className={styles.metricPanel}>
          <GlassMetricStrip
            label="Demo güven göstergeleri"
            items={[
              {
                id: "checks",
                label: "Güven kontrolü",
                value: String(trustSignals.length),
                hint: "EİDS, tapu, imar ve AI",
              },
              {
                id: "verified-listings",
                label: "EİDS işaretli demo ilan",
                value: String(verifiedListings.length),
                hint: "Ortak fixture setinde",
              },
              {
                id: "evidence",
                label: "Gösterilen dayanak",
                value: String(evidence.length),
                hint: "Kaynak türü ve durumuyla",
              },
            ]}
          />
        </div>
      </section>

      <section
        className={styles.section}
        aria-labelledby="trust-evidence-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="trust-evidence-title">İlanın arkasındaki kayıtları gör</h2>
          <p>
            Doğrulama sonucu ile AI açıklamasının dayanakları aynı bölümde,
            farklı sorumluluklarla sunulur.
          </p>
        </header>
        <div className={styles.evidenceGrid}>
          <GlassTrustSignalPanel
            title="Güven Kontrolleri"
            signals={trustSignals}
            variant="panel"
          />
          <GlassAiEvidenceList
            title="AI Yanıtının Dayanakları"
            evidence={evidence}
          />
        </div>
      </section>

      <section
        className={styles.section}
        aria-labelledby="trust-listings-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="trust-listings-title">Yalnız doğrulanmış demo ilanlar</h2>
          <p>
            Bu şeritte yalnız ortak fixture setinde EİDS işareti taşıyan düz
            ilan kartları yer alır.
          </p>
        </header>
        <GlassCarousel label="Yalnız doğrulanmış demo ilanlar">
          {verifiedListings.map((listing) => (
            <GlassListingCard
              {...listing}
              key={listing.id ?? listing.title}
              material="flat"
              aria-label={`${listing.title} ilanını aç`}
              onClick={goToSearch}
            />
          ))}
        </GlassCarousel>
      </section>

      <section
        className={styles.section}
        aria-labelledby="trust-agencies-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="trust-agencies-title">Doğrulanmış kurumsal ofisler</h2>
          <p>
            Kurumsal durum, uzmanlık alanı ve doğrudan telefon bağlantısı
            birlikte görünür.
          </p>
        </header>
        <div className={styles.agencyGrid}>
          {agencyFixtures.slice(0, 2).map((agency) => (
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
