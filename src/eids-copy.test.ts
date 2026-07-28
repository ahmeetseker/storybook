import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * EİDS, kimlik ve taşınmazı ilan etme yetkisini doğrular; tapu niteliği,
 * imar doğruluğu, fiziksel durum veya fiyat için toplu garanti vermez.
 * Bu test o kapsamı aşan ifadelerin repoya geri sızmasını engeller.
 */
const FORBIDDEN = [
  /tapu\s+kaydıyla\s+EİDS/i,
  /tapu\s+(ve\s+imar\s+)?durumu\s+EİDS/i,
  /İmar\s+EİDS\s+ile\s+doğrulan/i,
  /Tapu\s+EİDS\s+ile\s+doğrulan/i,
  /Tam\s+doğrulanmış\s+ilan/i,
  /Fiyatı\s+doğrulandı/i,
  /Sorunsuz\s+taşınmaz/i,
  /EİDS\s+tapu\s+eşleşmesi/i,
  /tapu\s+kaydıyla\s+eşleşti/i,
  /Her\s+ilan\s+tapu\s+kaydıyla\s+EİDS/i,
]

const ROOTS = ['src', 'apps/web/src']
const EXTENSIONS = ['.ts', '.tsx', '.md', '.mdx']
const SKIP_FILES = ['eids-copy.test.ts']

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === '.output') continue
      walk(full, files)
      continue
    }
    if (EXTENSIONS.some((ext) => entry.endsWith(ext)) && !SKIP_FILES.includes(entry)) {
      files.push(full)
    }
  }
  return files
}

describe('EİDS kapsam metni', () => {
  const files = ROOTS.flatMap((root) => walk(root))

  it('kapsam dışı doğrulama iddiası içeren metin bırakmaz', () => {
    const offenders: string[] = []
    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      for (const pattern of FORBIDDEN) {
        if (pattern.test(content)) offenders.push(`${file} → ${pattern}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
