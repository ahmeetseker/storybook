import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  GlassAiAgentActivity,
  GlassAiEvidenceList,
  GlassAiSearchBar,
  GlassAiSummaryCard,
  GlassHero,
  GlassListingCard,
  GlassMatchScore,
  GlassVitrin,
  type GlassAgentActivityEntry,
  type GlassAiEvidenceItem,
  type GlassAiSearchBarFilter,
} from "@repo/ui";
import { withBase } from "@/config/base-path";
import { homeListings, homeVitrinItems } from "../fixtures";
import { HomeConceptFrame } from "../shared/HomeConceptFrame";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./AiAdvisorHome.module.css";

const parsedFilters: GlassAiSearchBarFilter[] = [
  { id: "location", label: "Konum", value: "İzmir, Urla" },
  { id: "budget", label: "Bütçe", value: "5 milyon TL altı" },
  { id: "zoning", label: "İmar", value: "Konut imarlı" },
];

const initialAgentEntries: GlassAgentActivityEntry[] = [
  {
    id: "preferences",
    title: "Tercihler ayrıştırıldı",
    status: "done",
    detail: "Konum, bütçe ve imar ölçütleri ayrı ayrı kaydedildi.",
    toolLabel: "İhtiyaç analizi",
  },
  {
    id: "recommendations",
    title: "Demo ilanlar ölçütlerle eşleştirildi",
    status: "done",
    detail: "Üç önerinin eşleşen ve doğrulanması gereken yönleri çıkarıldı.",
    toolLabel: "İlan eşleştirme",
  },
  {
    id: "seller-message",
    title: "Satıcıya bilgi talebi taslağı",
    status: "needsApproval",
    detail:
      "İmar belgesini istemek için taslak hazır. Sen onaylamadan hiçbir mesaj gönderilmez.",
    toolLabel: "Mesaj taslağı",
  },
];

const matchProfiles = [
  { value: 90, title: "Demo uyumu: güçlü" },
  { value: 82, title: "Demo uyumu: yüksek" },
  { value: 74, title: "Demo uyumu: dengeli" },
] as const;

const evidence: GlassAiEvidenceItem[] = [
  {
    id: "eids",
    title: "EİDS taşınmaz yetkisi",
    sourceType: "official",
    verified: true,
    relevance: 96,
    excerpt: "İlk demo ilan, ortak fixture setinde EİDS doğrulaması taşıyor.",
  },
  {
    id: "zoning",
    title: "İlan metnindeki konut imarı beyanı",
    sourceType: "listing",
    verified: false,
    relevance: 88,
    excerpt:
      "İmar bilgisi satıcı beyanından geliyor ve resmî belgeyle ayrıca doğrulanmalı.",
  },
  {
    id: "preferences",
    title: "Kullanıcının bütçe ve konum tercihleri",
    sourceType: "user",
    verified: true,
    relevance: 100,
    excerpt:
      "Öneri sırası yalnız bu demo oturumunda belirtilen ölçütlere dayanıyor.",
  },
];

export function AiAdvisorHome() {
  const navigate = useNavigate();
  const [agentEntries, setAgentEntries] =
    useState<GlassAgentActivityEntry[]>(initialAgentEntries);

  const goToSearch = () => {
    void navigate({ to: "/arsa-ara" });
  };

  const resolveApproval = (
    id: string,
    status: Extract<GlassAgentActivityEntry["status"], "done" | "rejected">,
  ) => {
    setAgentEntries((entries) =>
      entries.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status,
              detail:
                status === "done"
                  ? "İzin kaydedildi. Bu prototipte gerçek mesaj gönderilmedi."
                  : "Taslak kapatıldı ve hiçbir mesaj gönderilmedi.",
            }
          : entry,
      ),
    );
  };

  const interactiveVitrinItems = homeVitrinItems.map((item) => ({
    ...item,
    onClick: goToSearch,
  }));

  return (
    <HomeConceptFrame
      className={styles.page}
      footer={<SiteFooter variant="columns" />}
    >
      <GlassHero
        variant="split"
        align="start"
        titleAs="h1"
        title="Nasıl bir arsa aradığını birlikte netleştirelim"
        subtitle="Tercihlerini ayrıştır, önerilerin nedenlerini gör ve yüksek etkili her adımı kendin onayla."
        actions={
          <GlassAiSearchBar
            className={styles.heroSearch}
            defaultValue="Urla'da 5 milyon TL altında konut imarlı arsa arıyorum"
            parsedFilters={parsedFilters}
            confidence={90}
            suggestions={[
              "Urla'da denize yakın imarlı parsel",
              "Kaş'ta manzaralı arsa",
              "Gölbaşı'nda yol cepheli tarla",
            ]}
            onSubmit={goToSearch}
          />
        }
        media={
          <GlassAiAgentActivity
            className={styles.agentActivity}
            title="Karar günlüğü"
            entries={agentEntries}
            onApprove={(id) => resolveApproval(id, "done")}
            onReject={(id) => resolveApproval(id, "rejected")}
            permissionNote="Ajan sen izin vermeden satıcıya mesaj göndermez, teklif oluşturmaz veya ilanı kaydetmez."
          />
        }
      />

      <section
        className={styles.section}
        aria-labelledby="ai-advisor-recommendations-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="ai-advisor-recommendations-title">
            Üç öneri, üç açık uyum gerekçesi
          </h2>
          <p>
            Ortak demo ilanları aynı tercih profiline göre sıralanır; skorlar
            karar yerine açıklanabilir bir başlangıç sunar.
          </p>
        </header>

        <div className={styles.recommendationGrid}>
          {homeListings.slice(0, 3).map((listing, index) => {
            const profile = matchProfiles[index];

            return (
              <article
                className={styles.recommendationItem}
                key={listing.id ?? listing.title}
              >
                <GlassListingCard
                  {...listing}
                  material="flat"
                  className={styles.listingCard}
                  aria-label={`${listing.title} ilanını aç`}
                  onClick={goToSearch}
                />
                <GlassMatchScore
                  className={styles.matchScore}
                  variant="compact"
                  value={profile.value}
                  title={profile.title}
                />
              </article>
            );
          })}
        </div>
      </section>

      <section
        className={styles.section}
        aria-labelledby="ai-advisor-decision-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="ai-advisor-decision-title">
            Öneriyi kanıtlarıyla değerlendir
          </h2>
          <p>
            AI özeti, olumlu yönleri ve doğrulanması gereken bilgileri aynı
            karar alanında birbirinden ayırır.
          </p>
        </header>

        <div className={styles.decisionGrid}>
          <GlassAiSummaryCard
            summary="İlk öneri bütçe, konut imarı ve Urla tercihini karşılıyor. Deniz yakınlığı ilan beyanına dayanıyor; imar ve mesafe bilgisini karar vermeden önce resmî kaynaktan doğrula."
            pros={[
              "Bütçe aralığında",
              "Konut imarı beyanı var",
              "EİDS işaretli demo ilan",
            ]}
            cons={[
              "Deniz mesafesi bağımsız doğrulanmadı",
              "İmar belgesi bu sayfada açılmadı",
            ]}
            confidence={86}
            sourceNote="Ortak demo ilanları ve görünür kullanıcı tercihleriyle üretildi."
          />
          <GlassAiEvidenceList
            title="Önerinin dayanakları"
            evidence={evidence}
          />
        </div>
      </section>

      <section
        className={styles.compareBand}
        aria-labelledby="ai-advisor-compare-title"
      >
        <div>
          <h2 id="ai-advisor-compare-title">
            Kararı yan yana verilerle sürdür
          </h2>
          <p>
            Fiyatı, konumu ve doğrulama durumunu karşılaştır; son seçimi AI
            yerine sen yap.
          </p>
        </div>
        <a className={styles.compareLink} href={withBase("/karsilastir")}>
          Önerileri karşılaştır
        </a>
      </section>

      <section
        className={styles.section}
        aria-labelledby="ai-advisor-more-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="ai-advisor-more-title">Alternatifleri gözden geçir</h2>
          <p>
            Danışman akışına dönmeden önce aynı demo veri setindeki diğer
            ilanları hızlıca tara.
          </p>
        </header>
        <GlassVitrin
          className={styles.advisorVitrin}
          variant="micro"
          columns={7}
          items={interactiveVitrinItems}
        />
      </section>
    </HomeConceptFrame>
  );
}
