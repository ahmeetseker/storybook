import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { useGlassFieldContext } from '../GlassField'
import styles from './GlassSelect.module.css'

export interface GlassSelectOption {
  value: string
  label: string
  disabled?: boolean
}

// 'onChange' değer imzasıyla değiştirilir; 'defaultValue' HTMLAttributes'ta farklı tiple var → Omit
export interface GlassSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: GlassSelectOption[]
  /** Controlled değer */
  value?: string
  /** Uncontrolled başlangıç değeri */
  defaultValue?: string
  onChange?: (value: string) => void
  /** Seçim yokken trigger'da görünen metin */
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark' | 'auto'
  /** aria-invalid + --lg-danger çerçeve. Verilmezse GlassField context'inden türetilir */
  invalid?: boolean
  disabled?: boolean
}

export function GlassSelect({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Seçin',
  size = 'md',
  tone = 'auto',
  invalid,
  disabled = false,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: GlassSelectProps) {
  const field = useGlassFieldContext()
  const baseId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const typeahead = useRef({ buffer: '', timer: 0 })
  const reduced = prefersReducedMotion()

  const [innerValue, setInnerValue] = useState(defaultValue)
  const current = value !== undefined ? value : innerValue
  const selected = options.find((o) => o.value === current)

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const isInvalid = invalid ?? field?.invalid ?? false
  const triggerId = id ?? field?.id ?? `${baseId}-trigger`
  const listboxId = `${baseId}-listbox`
  const optionId = (index: number) => `${baseId}-option-${index}`
  const describedBy = [ariaDescribedBy, field?.describedBy].filter(Boolean).join(' ') || undefined

  const focusTrigger = () => document.getElementById(triggerId)?.focus()

  const openPanel = () => {
    if (disabled) return
    const selectedIndex = options.findIndex((o) => o.value === current && !o.disabled)
    const firstEnabled = options.findIndex((o) => !o.disabled)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setActiveIndex(-1)
  }

  const select = (option: GlassSelectOption) => {
    if (option.disabled) return
    if (value === undefined) setInnerValue(option.value)
    onChange?.(option.value)
    close()
    focusTrigger()
  }

  const moveActive = (dir: 1 | -1) => {
    if (options.length === 0) return
    let i = activeIndex
    for (let step = 0; step < options.length; step += 1) {
      i = (i + dir + options.length) % options.length
      if (!options[i].disabled) {
        setActiveIndex(i)
        return
      }
    }
  }

  const edgeActive = (which: 'first' | 'last') => {
    const list = which === 'first' ? options : [...options].reverse()
    const found = list.find((o) => !o.disabled)
    if (found) setActiveIndex(options.indexOf(found))
  }

  // Yazarak ilk eşleşene atlama: kapalıyken doğrudan seçer, açıkken aktif öğeyi taşır
  const handleTypeahead = (key: string) => {
    const state = typeahead.current
    window.clearTimeout(state.timer)
    state.buffer += key.toLowerCase()
    state.timer = window.setTimeout(() => {
      state.buffer = ''
    }, 500)
    const index = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(state.buffer))
    if (index < 0) return
    if (open) setActiveIndex(index)
    else select(options[index])
  }

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) openPanel()
        else moveActive(1)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) openPanel()
        else moveActive(-1)
        break
      case 'Home':
        if (open) {
          e.preventDefault()
          edgeActive('first')
        }
        break
      case 'End':
        if (open) {
          e.preventDefault()
          edgeActive('last')
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!open) openPanel()
        else if (activeIndex >= 0) select(options[activeIndex])
        break
      case 'Escape':
        if (open) {
          e.preventDefault()
          close()
        }
        break
      case 'Tab':
        close()
        break
      default:
        if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) handleTypeahead(e.key)
    }
  }

  // Dış tıklama kapatır
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Aktif seçenek görünür kalsın (panel scroll'unda)
  useEffect(() => {
    if (!open || activeIndex < 0) return
    document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex])

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(' ')} {...rest}>
      <GlassSurface
        as="button"
        material="glass"
        shape={12}
        thickness={0.25}
        tone={tone}
        interactive={!disabled}
        className={[
          styles.trigger,
          styles[size],
          isInvalid ? styles.invalid : '',
          disabled ? styles.disabled : '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...({
          type: 'button',
          id: triggerId,
          role: 'combobox',
          disabled,
          'aria-expanded': open,
          'aria-haspopup': 'listbox',
          'aria-controls': open ? listboxId : undefined,
          'aria-activedescendant': open && activeIndex >= 0 ? optionId(activeIndex) : undefined,
          'aria-invalid': isInvalid || undefined,
          'aria-describedby': describedBy,
          onClick: () => (open ? close() : openPanel()),
          onKeyDown: onTriggerKeyDown,
        } as unknown as GlassSurfaceProps)}
      >
        <span className={[styles.value, selected ? '' : styles.placeholder].filter(Boolean).join(' ')}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={styles.chevron}
          data-open={open || undefined}
          viewBox="0 0 12 12"
          width="12"
          height="12"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </GlassSurface>

      {/* Overlay kalıbı: portal yok — relative kök içinde absolute panel */}
      <div className={styles.panelSlot}>
        <AnimatePresence>
          {open ? (
            <motion.div
              className={styles.panelMotion}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              <GlassSurface material="glass" shape={12} thickness={0.5} tone={tone} className={styles.panel}>
                <div role="listbox" id={listboxId} aria-labelledby={triggerId} className={styles.list}>
                  {options.map((option, index) => {
                    const isSelected = option.value === current
                    return (
                      <div
                        key={option.value}
                        id={optionId(index)}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        data-active={index === activeIndex || undefined}
                        className={[
                          styles.option,
                          isSelected ? styles.optionSelected : '',
                          option.disabled ? styles.optionDisabled : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => select(option)}
                        onPointerEnter={() => {
                          if (!option.disabled) setActiveIndex(index)
                        }}
                      >
                        <span className={styles.optionLabel}>{option.label}</span>
                        {isSelected ? (
                          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
                            <path d="M2 6.5L4.8 9L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </GlassSurface>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
