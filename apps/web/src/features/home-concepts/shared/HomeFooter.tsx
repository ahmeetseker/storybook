import {
  GlassFooter,
  type GlassFooterColumn,
  type GlassFooterProps,
} from "@repo/ui";
import { withBase } from "@/config/base-path";
import styles from "./HomeFooter.module.css";

const footerColumns: GlassFooterColumn[] = [
  {
    title: "Keşfet",
    links: [
      { label: "Arsa ara", href: "/arsa-ara" },
      { label: "Bölgeler", href: "/bolgeler" },
      { label: "Emlak ofisleri", href: "/ofisler" },
      { label: "Blog", href: "/blog" },
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
    ],
  },
];

export interface HomeFooterProps extends Pick<
  GlassFooterProps,
  "variant" | "cta" | "newsletter" | "social"
> {}

export function HomeFooter({
  variant = "columns",
  cta,
  newsletter,
  social,
}: HomeFooterProps) {
  const baseColumns = variant === "slim" ? slimColumns : footerColumns;
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
      brand={
        <span className={styles.brandBlock}>
          <a className={styles.brandLink} href={withBase("/")}>
            arsam.net
          </a>
          <span className={styles.brandDescription}>
            Arsayı konum, imar ve doğrulama verileriyle keşfet.
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
