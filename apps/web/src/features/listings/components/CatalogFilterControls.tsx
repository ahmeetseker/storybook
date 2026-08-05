// Katalog facet'lerini kontrole çeviren tek render noktası.
//
// Kenar çubuğu ve "Tüm Seçenekler" modalı AYNI bileşeni kullanır; ikisi
// arasındaki tek fark hangi facet'lerin geçirildiğidir. Kontrolleri iki yerde
// ayrı ayrı yazmak, iki yerin kaçınılmaz olarak birbirinden ayrılması demekti
// (modalda çalışan bir filtre kenar çubuğunda farklı davranıyordu).
import { useId } from 'react'
import { GlassCheckbox, GlassChip } from '@repo/ui'
import type { FilterFacet } from '../domain/filter-catalog-types'
import type { ListingSearchState, NumericRange } from '../domain/search-state'
import styles from './CatalogFilterControls.module.css'

export interface CatalogFilterControlsProps {
  facets: FilterFacet[]
  state: ListingSearchState
  onChange: (state: ListingSearchState) => void
}

/** Bir değeri çoklu seçim listesinde açar/kapatır. */
function toggle(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

export function CatalogFilterControls({
  facets,
  state,
  onChange,
}: CatalogFilterControlsProps) {
  const baseId = useId()

  const setValues = (key: string, values: string[]) => {
    const next = { ...state.categoryFilters }
    // Boş seçim anahtarı sözlükte BIRAKILMAZ: aksi halde URL'de `f_x=` gibi
    // anlamsız bir iz kalır ve "filtre uygulandı" görüntüsü verir.
    if (values.length === 0) delete next[key]
    else next[key] = values
    onChange({ ...state, categoryFilters: next, page: 1 })
  }

  const setRange = (key: string, bounds: NumericRange | undefined) => {
    const next = { ...state.categoryRanges }
    if (!bounds || (bounds.min === undefined && bounds.max === undefined)) delete next[key]
    else next[key] = bounds
    onChange({ ...state, categoryRanges: next, page: 1 })
  }

  const readRangeEdge = (key: string, edge: 'min' | 'max', raw: string) => {
    const current = state.categoryRanges[key] ?? {}
    const parsed = raw === '' ? undefined : Number(raw)
    setRange(key, {
      ...current,
      [edge]: parsed !== undefined && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined,
    })
  }

  return (
    <div className={styles.stack}>
      {facets.map((facet) => {
        const fieldId = `${baseId}-${facet.key}`
        const selected = state.categoryFilters[facet.key] ?? []

        if (facet.type === 'boolean') {
          return (
            <div key={facet.key} className={styles.facet}>
              <GlassCheckbox
                label={facet.label}
                checked={selected.includes('1')}
                onChange={() => setValues(facet.key, selected.includes('1') ? [] : ['1'])}
              />
            </div>
          )
        }

        if (facet.type === 'range') {
          const bounds = state.categoryRanges[facet.key] ?? {}
          return (
            <fieldset key={facet.key} className={styles.facet}>
              <legend className={styles.legend}>
                {facet.label}
                {facet.unit ? <span className={styles.unit}> ({facet.unit})</span> : null}
              </legend>
              <div className={styles.rangeRow}>
                <input
                  className={styles.rangeInput}
                  id={`${fieldId}-min`}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="En az"
                  aria-label={`${facet.label} en az`}
                  value={bounds.min ?? ''}
                  onChange={(event) => readRangeEdge(facet.key, 'min', event.target.value)}
                />
                <span aria-hidden="true" className={styles.rangeDash}>
                  –
                </span>
                <input
                  className={styles.rangeInput}
                  id={`${fieldId}-max`}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="En çok"
                  aria-label={`${facet.label} en çok`}
                  value={bounds.max ?? ''}
                  onChange={(event) => readRangeEdge(facet.key, 'max', event.target.value)}
                />
              </div>
            </fieldset>
          )
        }

        // select — `single` olduğunda seçim tekil davranır (radyo gibi), ama
        // aynı değere tekrar tıklamak seçimi kaldırır: kullanıcı tek seçimli
        // bir filtreyi temizlemek için "hepsi" seçeneği aramak zorunda kalmaz.
        //
        // Gösterim seçenek sayısına göre değişir: kısa etiketli seçenekler
        // KAPSÜL olarak sarmalanır (10 seçenek bir kolonda 10 satır yerine iki
        // satıra sığar ve göz tek bakışta tarar); uzun etiketliler okunabilir
        // kalsın diye onay kutusu olarak alt alta durur.
        const options = facet.options ?? []
        const asPills = options.every((option) => option.label.length <= 18)
        const setOption = (value: string, checked: boolean) =>
          setValues(
            facet.key,
            facet.single ? (checked ? [] : [value]) : toggle(selected, value),
          )

        return (
          <fieldset key={facet.key} className={styles.facet}>
            <legend className={styles.legend}>
              {facet.label}
              {selected.length > 0 ? (
                <span className={styles.count}>{selected.length}</span>
              ) : null}
            </legend>
            <div className={asPills ? styles.pills : styles.options}>
              {options.map((option) => {
                const checked = selected.includes(option.value)
                return asPills ? (
                  <GlassChip
                    key={option.value}
                    size="sm"
                    selected={checked}
                    onSelectedChange={() => setOption(option.value, checked)}
                  >
                    {option.label}
                  </GlassChip>
                ) : (
                  <GlassCheckbox
                    key={option.value}
                    label={option.label}
                    checked={checked}
                    onChange={() => setOption(option.value, checked)}
                  />
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
