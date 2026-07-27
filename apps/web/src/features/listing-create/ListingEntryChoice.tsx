import { useEffect, useRef, useState } from 'react'
import { GlassButton } from '@repo/ui'
import type { AiListingProposal } from './listing-create-domain'
import type { ListingAdapters } from './listing-create-adapters'
import styles from './ListingCreateWorkspace.module.css'

interface ListingEntryChoiceProps {
  adapters: ListingAdapters
  onManualStart: () => void
  onApplyProposal: (proposal: AiListingProposal) => void
}

const familyLabels = {
  land: 'Arsa / Arazi',
  residential: 'Konut',
  commercial: 'İş yeri',
  building: 'Bina',
} as const

const locationLabels: Record<string, string> = {
  izmir: 'İzmir',
  istanbul: 'İstanbul',
  ankara: 'Ankara',
  urla: 'Urla',
  çeşme: 'Çeşme',
  seferihisar: 'Seferihisar',
  kadıköy: 'Kadıköy',
  beşiktaş: 'Beşiktaş',
  sarıyer: 'Sarıyer',
  gölbaşı: 'Gölbaşı',
  çankaya: 'Çankaya',
  iskele: 'İskele',
}

function proposalFamilyLabel(proposal: AiListingProposal): string {
  const family = proposal.property.family
  return family ? familyLabels[family] : 'Belirtilmedi'
}

function proposalLocationLabel(proposal: AiListingProposal): string {
  const values = [
    proposal.location.city,
    proposal.location.district,
    proposal.location.neighborhood,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => locationLabels[value.toLocaleLowerCase('tr-TR')] ?? value)

  return values.length > 0 ? values.join(' · ') : 'Belirtilmedi'
}

function proposalAreaLabel(proposal: AiListingProposal): string {
  const area = proposal.property.area || proposal.property.grossArea
  return area ? `${area} m²` : 'Belirtilmedi'
}

export function ListingEntryChoice({
  adapters,
  onManualStart,
  onApplyProposal,
}: ListingEntryChoiceProps) {
  const [mode, setMode] = useState<'idle' | 'ai'>('idle')
  const [sourceText, setSourceText] = useState('')
  const [proposal, setProposal] = useState<AiListingProposal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestRevision = useRef(0)

  useEffect(
    () => () => {
      requestRevision.current += 1
    },
    [],
  )

  const invalidateProposalRequest = () => {
    requestRevision.current += 1
    setLoading(false)
  }

  const prepareProposal = async () => {
    if (!sourceText.trim()) {
      setError('Mülkünüzü birkaç cümleyle anlatın')
      return
    }
    const request = requestRevision.current + 1
    requestRevision.current = request
    const requestedText = sourceText
    setLoading(true)
    setError('')
    try {
      const nextProposal = await adapters.proposeFromText(requestedText)
      if (request === requestRevision.current) setProposal(nextProposal)
    } catch {
      if (request === requestRevision.current) {
        setError('AI önerisi hazırlanamadı. Bilgileri elle girebilirsiniz.')
      }
    } finally {
      if (request === requestRevision.current) setLoading(false)
    }
  }

  return (
    <section className={styles.entry} aria-labelledby="entry-title">
      <div className={styles.entryIntro}>
        <p className={styles.kicker}>Yeni ilan</p>
        <h1 id="entry-title">İlanınızı güvenle yayına hazırlayın</h1>
        <p>
          Önce en rahat başlangıç yolunu seçin. Girdiğiniz her bilgi taslakta kalır;
          yayın kararı her zaman sizindir.
        </p>
      </div>

      {mode === 'idle' ? (
        <div className={styles.entryChoices}>
          <article className={styles.entryChoicePrimary}>
            <span className={styles.choiceMark} aria-hidden="true">
              ✦
            </span>
            <p className={styles.choiceEyebrow}>Daha hızlı başlangıç</p>
            <h2>Mülkü doğal dille anlatın</h2>
            <p>
              AI; kategori, konum ve öne çıkan özellikleri bir öneri halinde
              hazırlasın. Siz incelemeden hiçbir alan değişmez.
            </p>
            <GlassButton prominent size="lg" onClick={() => setMode('ai')}>
              AI ile hızlı başla
            </GlassButton>
          </article>

          <article className={styles.entryChoiceSecondary}>
            <span className={styles.choiceNumber}>01—05</span>
            <h2>Adım adım ilerleyin</h2>
            <p>
              Mülk türünden EİDS doğrulamasına kadar tüm bilgileri kontrollü
              formlarla kendiniz girin.
            </p>
            <button
              type="button"
              className={styles.textAction}
              onClick={() => {
                invalidateProposalRequest()
                onManualStart()
              }}
            >
              Bilgileri kendim gireceğim
              <span aria-hidden="true">→</span>
            </button>
          </article>
        </div>
      ) : (
        <div className={styles.aiComposer}>
          <div className={styles.aiComposerHeader}>
            <button
              type="button"
              className={styles.backText}
              onClick={() => {
                invalidateProposalRequest()
                setProposal(null)
                setMode('idle')
              }}
            >
              ← Başlangıca dön
            </button>
            <span className={styles.demoTag}>AI demo</span>
          </div>
          <label htmlFor="listing-ai-source">Mülkünüzü kısaca anlatın</label>
          <textarea
            id="listing-ai-source"
            className={styles.flatTextarea}
            value={sourceText}
            onChange={(event) => {
              invalidateProposalRequest()
              setSourceText(event.target.value)
              setProposal(null)
              setError('')
            }}
            placeholder="Örn. Urla İskele’de 512 m², konut imarlı, müstakil tapulu satılık arsa…"
            rows={5}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'listing-ai-error' : 'listing-ai-help'}
          />
          <p id="listing-ai-help" className={styles.fieldHelp}>
            Tapu numarası veya kişisel bilgi yazmayın. Eksik alanları sonraki adımlarda
            tamamlayabilirsiniz.
          </p>
          <p id="listing-ai-error" className={styles.fieldError} aria-live="polite">
            {error}
          </p>
          <div className={styles.composerActions}>
            <GlassButton prominent loading={loading} onClick={prepareProposal}>
              Öneriyi hazırla
            </GlassButton>
            <button
              type="button"
              className={styles.textAction}
              onClick={() => {
                invalidateProposalRequest()
                onManualStart()
              }}
            >
              Elle devam et
            </button>
          </div>

          {proposal ? (
            <div className={styles.proposal} aria-label="AI önerisi">
              <div className={styles.proposalStatus}>
                <span>Öneri hazır, henüz forma uygulanmadı</span>
                <strong>%{proposal.confidence} güven</strong>
              </div>
              <h2>{proposal.content.title}</h2>
              <p>{proposal.content.description}</p>
              <dl className={styles.proposalFacts}>
                <div>
                  <dt>Mülk</dt>
                  <dd>{proposalFamilyLabel(proposal)}</dd>
                </div>
                <div>
                  <dt>Konum</dt>
                  <dd>{proposalLocationLabel(proposal)}</dd>
                </div>
                <div>
                  <dt>Alan</dt>
                  <dd>{proposalAreaLabel(proposal)}</dd>
                </div>
              </dl>
              <GlassButton prominent onClick={() => onApplyProposal(proposal)}>
                Önerileri forma uygula
              </GlassButton>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
