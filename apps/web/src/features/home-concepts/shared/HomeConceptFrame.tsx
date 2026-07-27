import type { HTMLAttributes, ReactNode } from "react";
import { homeConcepts, type HomeConceptId } from "../concepts";
import styles from "./HomeConceptFrame.module.css";

export interface HomeConceptFrameProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "id"
> {
  children: ReactNode;
  footer?: ReactNode;
  activeConcept?: HomeConceptId;
  showConceptNavigation?: boolean;
}

export function HomeConceptFrame({
  children,
  footer,
  activeConcept,
  showConceptNavigation,
  className,
  ...rest
}: HomeConceptFrameProps) {
  const navigationVisible =
    showConceptNavigation ?? activeConcept !== undefined;

  return (
    <>
      <main
        {...rest}
        id="main-content"
        className={[styles.main, className].filter(Boolean).join(" ")}
      >
        <div className={styles.inner}>
          {navigationVisible ? (
            <nav
              className={styles.conceptNavigation}
              aria-label="Ana sayfa konseptleri"
            >
              <ul className={styles.conceptList}>
                {homeConcepts.map((concept) => {
                  const isActive = concept.id === activeConcept;

                  return (
                    <li key={concept.id}>
                      <a
                        className={[
                          styles.conceptLink,
                          isActive ? styles.conceptLinkActive : undefined,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        href={concept.href}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {concept.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : null}
          <div className={styles.content}>{children}</div>
        </div>
      </main>
      {footer}
    </>
  );
}
