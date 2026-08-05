// İçerik katmanı footer'ı — her zaman flat. Beş yerleşim varyantı.
import type { MouseEvent, ReactNode } from "react";
import styles from "./GlassFooter.module.css";

export interface GlassFooterLinkItem {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface GlassFooterColumn {
  title: string;
  links: GlassFooterLinkItem[];
}

/** Footer'ın son kolonundaki mini kart (son eklenen ilan, öne çıkan içerik). */
export interface GlassFooterHighlightItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  /** Dekoratif yuvarlak görsel (alt=""); bilgi label/meta ile verilir */
  image?: string;
  /** Güncel değer — fiyat gibi */
  meta?: string;
  /** Eski değer — üstü çizili gösterilir */
  previousMeta?: string;
}

export interface GlassFooterHighlights {
  title: string;
  items: GlassFooterHighlightItem[];
}

/** Alt bardaki yuvarlak sosyal medya bağlantısı. */
export interface GlassFooterSocialLink {
  id: string;
  /** Erişilebilir ad — "Instagram" (ikon dekoratif) */
  label: string;
  href: string;
  icon: ReactNode;
}

export interface GlassFooterProps {
  /** columns/cta/newsletter varyantlarında sütun grupları; slim/centered'da satıra düzleştirilir */
  columns?: GlassFooterColumn[];
  /** Telif + yasal satır — zorunlu */
  legal: ReactNode;
  /** Yalnız variant="cta": üst bant içeriği */
  cta?: ReactNode;
  /** Logo/marka bloğu */
  brand?: ReactNode;
  /** Son kolon: mini kartlı vitrin (son eklenen ilanlar) — yalnız `columns` ailesi */
  highlights?: GlassFooterHighlights;
  /** Alt bardaki yuvarlak sosyal medya bağlantıları */
  socialLinks?: GlassFooterSocialLink[];
  /** Sosyal linkler satırı — serbest slot; `socialLinks` verilirse o kazanır */
  social?: ReactNode;
  /** Yalnız variant="newsletter": kayıt formu slotu */
  newsletter?: ReactNode;
  variant?: "columns" | "slim" | "cta" | "centered" | "newsletter";
}

function FootLink({ link }: { link: GlassFooterLinkItem }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!link.href) e.preventDefault();
    link.onClick?.();
  };
  return (
    <a href={link.href ?? "#"} onClick={onClick} className={styles.link}>
      {link.label}
    </a>
  );
}

function HighlightRow({ item }: { item: GlassFooterHighlightItem }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!item.href) e.preventDefault();
    item.onClick?.();
  };
  return (
    <li>
      <a href={item.href ?? "#"} onClick={onClick} className={styles.highlightLink}>
        {item.image ? (
          <span className={styles.highlightThumb}>
            <img src={item.image} alt="" loading="lazy" decoding="async" />
          </span>
        ) : null}
        <span className={styles.highlightBody}>
          <span className={styles.highlightLabel}>{item.label}</span>
          {item.meta || item.previousMeta ? (
            <span className={styles.highlightMeta}>
              {item.meta}
              {item.previousMeta ? (
                <s className={styles.highlightPreviousMeta}>{item.previousMeta}</s>
              ) : null}
            </span>
          ) : null}
        </span>
      </a>
    </li>
  );
}

export function GlassFooter({
  columns = [],
  legal,
  cta,
  brand,
  highlights,
  socialLinks,
  social,
  newsletter,
  variant = "columns",
}: GlassFooterProps) {
  const flatLinks = columns.flatMap((c) => c.links);

  // İkonlar dekoratif; erişilebilir ad bağlantının `label`'ından gelir.
  const socialRow = socialLinks?.length ? (
    <ul className={styles.socialList}>
      {socialLinks.map((item) => (
        <li key={item.id}>
          <a
            className={styles.socialLink}
            href={item.href}
            aria-label={item.label}
            title={item.label}
          >
            <span aria-hidden>{item.icon}</span>
          </a>
        </li>
      ))}
    </ul>
  ) : (
    social
  );

  const inlineNav = flatLinks.length ? (
    <nav aria-label="Alt bilgi">
      <ul className={styles.inlineList}>
        {flatLinks.map((link) => (
          <li key={link.label}>
            <FootLink link={link} />
          </li>
        ))}
      </ul>
    </nav>
  ) : null;

  if (variant === "slim") {
    return (
      <footer className={styles.root} data-variant={variant}>
        <div className={`${styles.inner} ${styles.slimInner}`}>
          <span className={styles.legal}>{legal}</span>
          {inlineNav}
        </div>
      </footer>
    );
  }

  if (variant === "centered") {
    return (
      <footer className={styles.root} data-variant={variant}>
        <div className={`${styles.inner} ${styles.centeredInner}`}>
          {brand ? <span className={styles.brand}>{brand}</span> : null}
          {inlineNav}
          {socialRow ? <span className={styles.social}>{socialRow}</span> : null}
          <span className={styles.legal}>{legal}</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.root} data-variant={variant}>
      <div className={styles.inner}>
        {variant === "cta" && cta ? (
          <div className={styles.ctaBand} data-footer-cta>
            {cta}
          </div>
        ) : null}
        {variant === "newsletter" && newsletter ? (
          <div className={styles.newsletterBand} data-footer-newsletter>
            {newsletter}
          </div>
        ) : null}
        <div className={styles.top}>
          {brand ? <div className={styles.brandBlock}>{brand}</div> : null}
          {columns.length ? (
            <nav aria-label="Alt bilgi" className={styles.columnsNav}>
              <div
                className={styles.columnsGrid}
                style={{ ["--footer-columns" as string]: columns.length }}
              >
                {columns.map((col) => (
                  <div key={col.title} className={styles.column}>
                    <span className={styles.columnTitle}>{col.title}</span>
                    <ul className={styles.columnList} aria-label={col.title}>
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <FootLink link={link} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          ) : null}
          {highlights?.items.length ? (
            <div className={styles.highlights}>
              <span className={styles.columnTitle}>{highlights.title}</span>
              <ul className={styles.highlightList} aria-label={highlights.title}>
                {highlights.items.map((item) => (
                  <HighlightRow key={item.id} item={item} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className={styles.legalRow}>
          <span className={styles.legal}>{legal}</span>
          {socialRow ? <span className={styles.social}>{socialRow}</span> : null}
        </div>
      </div>
    </footer>
  );
}
