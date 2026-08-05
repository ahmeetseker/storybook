// "Tüm Seçenekler" — kenar çubuğuna sığmayan derinliğin yaşadığı yer.
//
// Yerleşim iki panelli (usta-ayrıntı): solda bölüm listesi, sağda seçili
// bölümün kontrolleri. sahibinden'in aynı modalı tüm kriterleri tek kolonda
// alt alta diziyor; 30+ kriterde kullanıcı aradığını taramak zorunda kalıyor.
// Bölüm rayı, kaç kriter seçildiğini de gösterdiği için kullanıcı hangi
// bölümde ne bıraktığını modalı kapatmadan görür.
import { useId, useMemo, useState } from 'react'
import { GlassButton, GlassModal } from '@repo/ui'
import { FILTER_SECTIONS } from '../domain/filter-catalog'
import { sectionFacets } from '../domain/filter-catalog-types'
import type { ListingSearchState } from '../domain/search-state'
import { CatalogFilterControls } from './CatalogFilterControls'
import styles from './AllFiltersModal.module.css'

export interface AllFiltersModalProps {
  open: boolean
  onClose: () => void
  state: ListingSearchState
  resultCount: number
  onChange: (state: ListingSearchState) => void
  onReset: () => void
}

export function AllFiltersModal({
  open,
  onClose,
  state,
  resultCount,
  onChange,
  onReset,
}: AllFiltersModalProps) {
  // Yalnız seçili kategoride anlamlı olan bölümler gösterilir: arsada "Oda ve
  // yerleşim" boş kalacağı için hiç çizilmez, boş bir bölüm rayı sunmayız.
  const sections = useMemo(
    () =>
      FILTER_SECTIONS.map((section) => ({
        section,
        facets: sectionFacets(section, state.category),
      })).filter((entry) => entry.facets.length > 0),
    [state.category],
  )

  const searchId = useId()
  // Kriter arama: 12 bölüm ve 50+ kriterde kullanıcı aradığını bölüm bölüm
  // taramak zorunda kalmasın. sahibinden'in aynı modalinde bu yok; kriter
  // adını bilen kullanıcı yine de listeyi gezmek zorunda.
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR')

  const matches = useMemo(() => {
    if (!normalizedQuery) return undefined
    return sections
      .map(({ section, facets }) => ({
        section,
        facets: facets.filter((facet) =>
          facet.label.toLocaleLowerCase('tr-TR').includes(normalizedQuery),
        ),
      }))
      .filter((entry) => entry.facets.length > 0)
  }, [sections, normalizedQuery])

  const [activeId, setActiveId] = useState(sections[0]?.section.id)
  // Kategori değişince eski bölüm kaybolmuş olabilir; ilk geçerli bölüme düşülür.
  const active = sections.find((entry) => entry.section.id === activeId) ?? sections[0]

  /** Bir bölümde kaç kriterin seçili olduğu — ray üzerinde rozet olarak görünür. */
  const selectedCount = (facets: { key: string; type: string }[]) =>
    facets.reduce((total, facet) => {
      if (facet.type === 'range') return total + (state.categoryRanges[facet.key] ? 1 : 0)
      return total + ((state.categoryFilters[facet.key] ?? []).length > 0 ? 1 : 0)
    }, 0)

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      title="Tüm Seçenekler"
      description="Kriterleri bölüm bölüm daraltın; seçtikleriniz anında sonuca yansır."
      size="lg"
      className={styles.modal}
      footer={
        <div className={styles.footer}>
          <button type="button" className={styles.reset} onClick={onReset}>
            Filtreleri sıfırla
          </button>
          <GlassButton prominent onClick={onClose}>
            {resultCount} ilanı gör
          </GlassButton>
        </div>
      }
    >
      <label className={styles.search} htmlFor={searchId}>
        <span className={styles.searchLabel}>Kriter ara</span>
        <input
          id={searchId}
          type="search"
          className={styles.searchInput}
          placeholder="Örn. ısıtma, tapu, bina yaşı"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {/* Arama yazılıyken bölüm rayı devre dışı kalır: kullanıcı zaten
          bölümden bağımsız arıyor, eşleşenler tek listede toplanır. */}
      {matches ? (
        <div className={styles.results}>
          {matches.length === 0 ? (
            <p className={styles.empty}>“{query}” için kriter bulunamadı.</p>
          ) : (
            matches.map(({ section, facets }) => (
              <section key={section.id} className={styles.resultGroup}>
                <h3 className={styles.paneTitle}>{section.title}</h3>
                <CatalogFilterControls facets={facets} state={state} onChange={onChange} />
              </section>
            ))
          )}
        </div>
      ) : (
      <div className={styles.layout}>
        <nav className={styles.rail} aria-label="Filtre bölümleri">
          <ul className={styles.railList}>
            {sections.map(({ section, facets }) => {
              const count = selectedCount(facets)
              const current = section.id === active?.section.id
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    className={styles.railItem}
                    aria-current={current ? 'true' : undefined}
                    onClick={() => setActiveId(section.id)}
                  >
                    <span>{section.title}</span>
                    {count > 0 ? (
                      <span className={styles.badge} aria-label={`${count} kriter seçili`}>
                        {count}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className={styles.pane}>
          {active ? (
            <>
              <h3 className={styles.paneTitle}>{active.section.title}</h3>
              <CatalogFilterControls
                facets={active.facets}
                state={state}
                onChange={onChange}
              />
            </>
          ) : (
            <p className={styles.empty}>Bu kategori için ek kriter yok.</p>
          )}
        </div>
      </div>
      )}
    </GlassModal>
  )
}
