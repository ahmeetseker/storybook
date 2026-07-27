import { describe, expect, it } from 'vitest'

import { createMessageDraftStorage } from './message-draft-storage'

class MemorySessionStorage implements Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'> {
  private readonly entries = new Map<string, string>()

  get length() {
    return this.entries.size
  }

  getItem(key: string) {
    return this.entries.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.entries.set(key, value)
  }

  removeItem(key: string) {
    this.entries.delete(key)
  }

  key(index: number) {
    return [...this.entries.keys()][index] ?? null
  }

  read(key: string) {
    return this.entries.get(key)
  }

  write(key: string, value: string) {
    this.entries.set(key, value)
  }

  keys() {
    return [...this.entries.keys()]
  }
}

const makeStorage = (namespace = 'enterprise-messages') => {
  const sessionStorage = new MemorySessionStorage()
  return { sessionStorage, drafts: createMessageDraftStorage(sessionStorage, namespace) }
}

describe('createMessageDraftStorage', () => {
  it('keeps drafts isolated by conversation', () => {
    const { drafts } = makeStorage()

    drafts.saveDraft('conversation-izmir-1', 'Alsancak için yarın uygun musunuz?')
    drafts.saveDraft('conversation-urla-2', 'Urla için teklifinizi bekliyorum.')

    expect(drafts.loadDraft('conversation-izmir-1')).toBe('Alsancak için yarın uygun musunuz?')
    expect(drafts.loadDraft('conversation-urla-2')).toBe('Urla için teklifinizi bekliyorum.')
  })

  it('removes a draft when its text is blank after trimming', () => {
    const { drafts } = makeStorage()
    drafts.saveDraft('conversation-izmir-1', 'Silinecek taslak')

    drafts.saveDraft('conversation-izmir-1', '  \n\t ')

    expect(drafts.loadDraft('conversation-izmir-1')).toBe('')
  })

  it('uses an opaque encoded key for conversation ids', () => {
    const { sessionStorage, drafts } = makeStorage()

    drafts.saveDraft('conversation:İzmir/1?private=true', 'Özel taslak')

    expect(sessionStorage.keys()).toHaveLength(1)
    expect(sessionStorage.keys()[0]).not.toContain('conversation:İzmir/1?private=true')
  })

  it('returns an empty draft for malformed stored JSON and removes it safely', () => {
    const { sessionStorage, drafts } = makeStorage()
    drafts.saveDraft('conversation-izmir-1', 'Önce geçerli')
    const key = sessionStorage.keys()[0]
    if (!key) throw new Error('Taslak anahtarı yazılmalı.')
    sessionStorage.write(key, '{not-json')

    expect(drafts.loadDraft('conversation-izmir-1')).toBe('')
    expect(sessionStorage.read(key)).toBeUndefined()
  })

  it('does not persist attachment, history, or participant data supplied instead of text', () => {
    const { sessionStorage, drafts } = makeStorage()
    const unsafeValue = {
      text: 'Bu yazılmamalı',
      attachments: [{ name: 'sözleşme.pdf', blob: new Blob(['özel veri']) }],
      messageHistory: [{ body: 'Eski mesaj' }],
      participant: { id: 'person-1', name: 'Ayşe' },
    }

    drafts.saveDraft('conversation-izmir-1', unsafeValue as never)

    expect(drafts.loadDraft('conversation-izmir-1')).toBe('')
    expect(sessionStorage.length).toBe(0)
  })

  it('does not throw when storage reads, writes, or removals are denied', () => {
    const deniedStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'> = {
      get length(): number {
        throw new DOMException('Blocked', 'SecurityError')
      },
      getItem() {
        throw new DOMException('Blocked', 'SecurityError')
      },
      setItem() {
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      },
      removeItem() {
        throw new DOMException('Blocked', 'SecurityError')
      },
      key() {
        throw new DOMException('Blocked', 'SecurityError')
      },
    }
    const drafts = createMessageDraftStorage(deniedStorage, 'enterprise-messages')

    expect(() => drafts.loadDraft('conversation-1')).not.toThrow()
    expect(() => drafts.saveDraft('conversation-1', 'Taslak')).not.toThrow()
    expect(() => drafts.removeDraft('conversation-1')).not.toThrow()
    expect(() => drafts.clearAllDrafts()).not.toThrow()
  })

  it('clears only its own namespace even while storage keys shift during removal', () => {
    const sessionStorage = new MemorySessionStorage()
    const enterpriseDrafts = createMessageDraftStorage(sessionStorage, 'enterprise-messages')
    const supportDrafts = createMessageDraftStorage(sessionStorage, 'support-messages')
    enterpriseDrafts.saveDraft('conversation-1', 'Birinci')
    enterpriseDrafts.saveDraft('conversation-2', 'İkinci')
    supportDrafts.saveDraft('conversation-1', 'Destek taslağı')
    sessionStorage.setItem('unrelated-preference', 'dark')

    enterpriseDrafts.clearAllDrafts()

    expect(enterpriseDrafts.loadDraft('conversation-1')).toBe('')
    expect(enterpriseDrafts.loadDraft('conversation-2')).toBe('')
    expect(supportDrafts.loadDraft('conversation-1')).toBe('Destek taslağı')
    expect(sessionStorage.getItem('unrelated-preference')).toBe('dark')
  })
})
