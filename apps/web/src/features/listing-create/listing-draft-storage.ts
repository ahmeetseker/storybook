/* Taslak kalıcılığı — "kaldığınız yerden devam edin".

   Kapsam bilinçli olarak dardır:
   - Yalnız `sessionStorage` kullanılır. Taslak sekme ömrü boyunca yaşar;
     kalıcı sunucu kaydı bu demo katmanının sözleşmesinde yoktur.
   - `media` DIŞARIDA bırakılır: fotoğraf önizlemeleri `blob:` URL'leridir ve
     belge kapanınca geçersizleşir. Geri yüklenen taslakta fotoğraf adımı boş
     döner ve kullanıcıya bu açıkça yazılır.
   - Okuma/yazma her zaman try/catch ile sarılır: özel pencere, kota dolu veya
     SSR ortamında akış bloklanmaz. */

import {
  createEmptyDraft,
  LISTING_STEPS,
  type ListingDraft,
  type ListingStepId,
} from './listing-create-domain'

export const LISTING_DRAFT_STORAGE_KEY = 'arsam:ilan-taslagi'

export interface StoredListingDraft {
  /** Fotoğraflar hariç taslak. */
  draft: ListingDraft
  /** Kaydedildiği sırada fotoğraf sayısı — geri yüklemede bilgi verilir. */
  droppedMediaCount: number
}

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

function isStepId(value: unknown): value is ListingStepId {
  return LISTING_STEPS.some((step) => step.id === value)
}

/** Yalnız beklenen şekle sahip veriyi kabul eder; şema değişirse sessizce atar. */
function normalize(value: unknown): StoredListingDraft | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const draft = record.draft as ListingDraft | undefined
  if (!draft || typeof draft !== 'object') return null
  if (!draft.entryMode || !draft.meta || !isStepId(draft.meta.activeStep)) {
    return null
  }

  const empty = createEmptyDraft()
  return {
    droppedMediaCount:
      typeof record.droppedMediaCount === 'number' ? record.droppedMediaCount : 0,
    draft: {
      ...empty,
      ...draft,
      media: [],
      property: { ...empty.property, ...draft.property },
      location: { ...empty.location, ...draft.location },
      content: { ...empty.content, ...draft.content },
      verification: { ...empty.verification, ...draft.verification },
      meta: { ...empty.meta, ...draft.meta, published: false },
    },
  }
}

export function readStoredDraft(): StoredListingDraft | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(LISTING_DRAFT_STORAGE_KEY)
    return raw ? normalize(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function writeStoredDraft(draft: ListingDraft): void {
  const store = storage()
  if (!store) return
  try {
    const { media, ...rest } = draft
    store.setItem(
      LISTING_DRAFT_STORAGE_KEY,
      JSON.stringify({
        draft: { ...rest, media: [] },
        droppedMediaCount: media.length,
      }),
    )
  } catch {
    /* Kota dolu ya da erişim engelli: akış otomatik kayıt ile devam eder. */
  }
}

export function clearStoredDraft(): void {
  const store = storage()
  if (!store) return
  try {
    store.removeItem(LISTING_DRAFT_STORAGE_KEY)
  } catch {
    /* yoksayılır */
  }
}
