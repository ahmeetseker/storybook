import {
  GlassFooter,
  type GlassFooterColumn,
  type GlassFooterHighlights,
  type GlassFooterProps,
  type GlassFooterSocialLink,
} from "@repo/ui";
import { withBase } from "@/config/base-path";
import { homeVitrinItems } from "@/features/home-concepts/fixtures";
import styles from "./SiteFooter.module.css";

const footerColumns: GlassFooterColumn[] = [
  {
    title: "Keşfet",
    links: [
      { label: "Arsa ara", href: "/arsa-ara" },
      { label: "Bölgeler", href: "/bolgeler" },
      { label: "Emlak ofisleri", href: "/ofisler" },
    ],
  },
  {
    title: "Karar araçları",
    links: [
      { label: "AI danışman", href: "/ai-danisman" },
      { label: "Karşılaştır", href: "/karsilastir" },
      { label: "Favoriler", href: "/favoriler" },
    ],
  },
  {
    title: "İlan ve hesap",
    links: [
      { label: "İlan ver", href: "/ilan-ver" },
      { label: "Paketler", href: "/paketler" },
      { label: "Hesabım", href: "/hesabim" },
      { label: "Mesajlar", href: "/hesabim/mesajlar" },
    ],
  },
];

const slimColumns: GlassFooterColumn[] = [
  {
    title: "Kısa yollar",
    links: [
      { label: "Arsa ara", href: "/arsa-ara" },
      { label: "İlan ver", href: "/ilan-ver" },
      { label: "Favoriler", href: "/favoriler" },
    ],
  },
];

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 4Z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.8 7 8.2 6 8.2-6" />
  </svg>
);

// Sosyal ikonlar dekoratiftir; erişilebilir ad `label`'dan gelir (GlassFooter).
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
    <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.6V4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V10H7.5v3h2.8v8Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
    <path d="M17.2 3h3.1l-6.8 7.7L21.5 21h-6.2l-4.4-5.7L5.7 21H2.6l7.2-8.2L2.5 3h6.3l4 5.3Zm-1.1 16.1h1.7L7.9 4.8H6.1Z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
    <path d="M21.6 7.4a2.5 2.5 0 0 0-1.8-1.8C18.2 5.2 12 5.2 12 5.2s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.4 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.6 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.6ZM10 15V9l5.2 3Z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
    <path d="M6.9 8.7v11.4H3.4V8.7Zm.2-3.4a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm3 3.4h3.3v1.6a3.7 3.7 0 0 1 3.3-1.8c2.5 0 4.3 1.6 4.3 5v6.6h-3.5v-6.1c0-1.6-.6-2.6-2-2.6-1.1 0-1.7.7-2 1.4-.1.3-.1.6-.1 1v6.3h-3.5s.1-10.3 0-11.4Z" />
  </svg>
);

const socialLinks: GlassFooterSocialLink[] = [
  { id: "facebook", label: "Facebook", href: "https://facebook.com/arsamnet", icon: <FacebookIcon /> },
  { id: "instagram", label: "Instagram", href: "https://instagram.com/arsamnet", icon: <InstagramIcon /> },
  { id: "x", label: "X", href: "https://x.com/arsamnet", icon: <XIcon /> },
  { id: "youtube", label: "YouTube", href: "https://youtube.com/@arsamnet", icon: <YoutubeIcon /> },
  { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/company/arsamnet", icon: <LinkedinIcon /> },
];

// Footer'ın son kolonu: portföyün başındaki dört ilan. Vitrin verisiyle aynı
// kaynaktan beslenir; ayrı bir "footer ilanları" listesi tutulmaz.
// Bugün fixture'dan okur — ilan ucu açıldığında `highlights` prop'u üzerinden
// gerçek "son eklenenler" sorgusu bağlanır, bileşen değişmez.
const defaultHighlights: GlassFooterHighlights = {
  title: "Son eklenen ilanlar",
  items: homeVitrinItems.slice(0, 4).map((item) => ({
    id: item.id,
    label: item.title,
    meta: item.price,
    image: item.image,
    href: withBase(`/ilan/${item.id}`),
  })),
};

export type SiteFooterProps = Pick<
  GlassFooterProps,
  "variant" | "cta" | "newsletter" | "social"
> & {
  /** Son kolondaki ilan listesi; verilmezse vitrin verisinin ilk dördü. */
  highlights?: GlassFooterHighlights;
};

/**
 * Sitenin ortak footer'ı.
 *
 * `MarketplaceShell` tarafından her pazar yeri sayfasında çizilir — sayfaların
 * kendi footer'ı yoktur. Kabuğun kendi gezinmesini kuran odaklı akışlar
 * (ilan verme sihirbazı, hesap panosu, mesajlar) ve kimlik doğrulama
 * sayfaları bunun dışındadır: oralarda ikinci bir gezinme katmanı, akıştan
 * çıkmayı kolaylaştırdığı için istenmez.
 */
export function SiteFooter({
  variant = "columns",
  cta,
  newsletter,
  social,
  highlights = defaultHighlights,
}: SiteFooterProps) {
  const isSlim = variant === "slim";
  const baseColumns = isSlim ? slimColumns : footerColumns;
  const columns = baseColumns.map((column) => ({
    ...column,
    links: column.links.map((link) =>
      link.href ? { ...link, href: withBase(link.href) } : link,
    ),
  }));

  return (
    <GlassFooter
      variant={variant}
      columns={columns}
      // Slim varyant tek satırlık bir şerittir; vitrin ve iletişim bloğu oraya
      // sığmaz, yalnız geniş footer'da görünür.
      highlights={isSlim ? undefined : highlights}
      socialLinks={isSlim ? undefined : socialLinks}
      brand={
        <span className={styles.brandBlock}>
          <a className={styles.brandLink} href={withBase("/")}>
            arsam.net
          </a>
          <span className={styles.brandDescription}>
            Arsayı konum, imar ve doğrulama verileriyle keşfet.
          </span>
          <span className={styles.contactList}>
            <span className={styles.contactRow}>
              <PinIcon />
              Çankaya, Ankara
            </span>
            <a className={styles.contactLink} href="tel:+908500000000">
              <PhoneIcon />
              0 850 000 00 00
            </a>
            <a className={styles.contactLink} href="mailto:destek@arsam.net">
              <MailIcon />
              destek@arsam.net
            </a>
          </span>
          <span className={styles.trustLine}>
            <span aria-hidden>✓</span>
            Doğrulama durumu her ilanda görünür.
          </span>
        </span>
      }
      legal={
        <span className={styles.legalCopy}>
          © 2026 arsam.net
          <span aria-hidden>·</span>
          Tüm hakları saklıdır.
        </span>
      }
      cta={cta}
      newsletter={newsletter}
      social={social}
    />
  );
}
