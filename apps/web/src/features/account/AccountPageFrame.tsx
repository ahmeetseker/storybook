import type { ReactNode } from 'react'

import { PageContainer } from '@/components/PageContainer'

import styles from './AccountPageFrame.module.css'

export interface AccountPageFrameProps {
  children: ReactNode
}

/**
 * Hesap alt sayfalarının ortak çerçevesi.
 *
 * Kabuk (`AccountAppShell`) yalnız ray, üst şerit ve dikey nefesi verir;
 * sayfanın `main`'i, yatay ölçüsü ve bölümler arası ritmi buradan gelir.
 * Alt sayfalar yalnız `h1` + `section`'ları döndürür.
 */
export function AccountPageFrame({ children }: AccountPageFrameProps) {
  return (
    <PageContainer shellInsets={false}>
      <div className={styles.frame}>{children}</div>
    </PageContainer>
  )
}
