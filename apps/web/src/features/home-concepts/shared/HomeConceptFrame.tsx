import type { HTMLAttributes, ReactNode } from "react";
import { PageContainer } from "@/components/PageContainer";
import styles from "./HomeConceptFrame.module.css";

/**
 * Ana sayfa deneyimlerinin ortak sayfa çerçevesi: container + içerik sütunu +
 * footer yuvası.
 *
 * Eskiden burada beş konsept arasında gezinen bir `nav` vardı. `/konseptler`
 * seçim ekranı ve konsept rotaları kaldırıldığında o gezinme hiçbir yere
 * gidemez hâle geldiği için söküldü — çerçeve artık yalnız yerleşim sağlar.
 */
export interface HomeConceptFrameProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "id"
> {
  children: ReactNode;
  footer?: ReactNode;
}

export function HomeConceptFrame({
  children,
  footer,
  className,
  ...rest
}: HomeConceptFrameProps) {
  return (
    <>
      <PageContainer
        {...rest}
        className={[styles.main, className].filter(Boolean).join(" ")}
      >
        <div className={styles.inner}>
          <div className={styles.content}>{children}</div>
        </div>
      </PageContainer>
      {footer}
    </>
  );
}
