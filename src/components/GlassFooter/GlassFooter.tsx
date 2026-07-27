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

export interface GlassFooterProps {
  /** columns/cta/newsletter varyantlarında sütun grupları; slim/centered'da satıra düzleştirilir */
  columns?: GlassFooterColumn[];
  /** Telif + yasal satır — zorunlu */
  legal: ReactNode;
  /** Yalnız variant="cta": üst bant içeriği */
  cta?: ReactNode;
  /** Logo/marka bloğu */
  brand?: ReactNode;
  /** Sosyal linkler satırı */
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

export function GlassFooter({
  columns = [],
  legal,
  cta,
  brand,
  social,
  newsletter,
  variant = "columns",
}: GlassFooterProps) {
  const flatLinks = columns.flatMap((c) => c.links);

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
          {social ? <span className={styles.social}>{social}</span> : null}
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
              <div className={styles.columnsGrid}>
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
        </div>
        <div className={styles.legalRow}>
          <span className={styles.legal}>{legal}</span>
          {social ? <span className={styles.social}>{social}</span> : null}
        </div>
      </div>
    </footer>
  );
}
