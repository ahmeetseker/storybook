export interface MessageDraftStorageBackend {
  readonly length: number
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  key(index: number): string | null
}

export interface MessageDraftStorage {
  loadDraft(conversationId: string): string
  saveDraft(conversationId: string, text: string): void
  removeDraft(conversationId: string): void
  clearAllDrafts(): void
}

const DRAFT_KEY_PREFIX = 'message-draft:v1:'

const encodeKeyPart = (value: string) => encodeURIComponent(value)

export const createMessageDraftStorage = (
  storage: MessageDraftStorageBackend,
  namespace: string,
): MessageDraftStorage => {
  const namespacePrefix = `${DRAFT_KEY_PREFIX}${encodeKeyPart(namespace)}:`
  const keyFor = (conversationId: string) => `${namespacePrefix}${encodeKeyPart(conversationId)}`

  const safelyRemove = (key: string) => {
    try {
      storage.removeItem(key)
    } catch {
      // Tarayıcı depolamasına erişimin engellenmesi taslak deneyimini bozmamalıdır.
    }
  }

  const removeDraft = (conversationId: string) => {
    safelyRemove(keyFor(conversationId))
  }

  const loadDraft = (conversationId: string) => {
    const key = keyFor(conversationId)
    let value: string | null

    try {
      value = storage.getItem(key)
    } catch {
      return ''
    }

    if (value === null) return ''

    try {
      const parsed: unknown = JSON.parse(value)
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('text' in parsed) ||
        typeof parsed.text !== 'string' ||
        parsed.text.trim() === ''
      ) {
        safelyRemove(key)
        return ''
      }

      return parsed.text
    } catch {
      safelyRemove(key)
      return ''
    }
  }

  const saveDraft = (conversationId: string, text: string) => {
    if (typeof text !== 'string' || text.trim() === '') {
      removeDraft(conversationId)
      return
    }

    try {
      storage.setItem(keyFor(conversationId), JSON.stringify({ text }))
    } catch {
      // SecurityError ve quota hataları yazma alanını kullanılamaz kılmamalıdır.
    }
  }

  const clearAllDrafts = () => {
    const keys: string[] = []

    try {
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index)
        if (key?.startsWith(namespacePrefix)) keys.push(key)
      }
    } catch {
      return
    }

    for (const key of keys) safelyRemove(key)
  }

  return { loadDraft, saveDraft, removeDraft, clearAllDrafts }
}
