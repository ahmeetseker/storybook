export type HomeConceptId =
  | 'ai-kesif'
  | 'pazar-vitrini'
  | 'harita-kesfi'
  | 'guven-merkezi'
  | 'ai-danisman'

export interface HomeConceptDefinition {
  id: HomeConceptId
  title: string
  href: `/konseptler/${HomeConceptId}`
  summary: string
  emphasis: string
}

export const homeConcepts: readonly HomeConceptDefinition[] = [
  {
    id: 'ai-kesif',
    title: 'AI Keşif',
    href: '/konseptler/ai-kesif',
    summary: 'Doğal dil araması, eşleşme ve güveni dengeler.',
    emphasis: 'Önerilen ana yön',
  },
  {
    id: 'pazar-vitrini',
    title: 'Pazar Vitrini',
    href: '/konseptler/pazar-vitrini',
    summary: 'Yüksek ilan yoğunluğu ve hızlı tarama sunar.',
    emphasis: 'Sahibinden yoğunluğu',
  },
  {
    id: 'harita-kesfi',
    title: 'Harita Keşfi',
    href: '/konseptler/harita-kesfi',
    summary: 'Bölge ve konum üzerinden arsa keşfini öne alır.',
    emphasis: 'Konum odaklı',
  },
  {
    id: 'guven-merkezi',
    title: 'Güven Merkezi',
    href: '/konseptler/guven-merkezi',
    summary: 'EİDS, tapu, imar ve kaynak şeffaflığını anlatır.',
    emphasis: 'Güven odaklı',
  },
  {
    id: 'ai-danisman',
    title: 'AI Danışman',
    href: '/konseptler/ai-danisman',
    summary: 'İhtiyaçtan öneriye ve karşılaştırmaya ilerler.',
    emphasis: 'AI-first akış',
  },
] as const
