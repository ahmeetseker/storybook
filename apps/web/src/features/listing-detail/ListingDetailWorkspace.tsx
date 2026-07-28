import type { ListingDetailResult } from './data/listing-detail-adapter'

export interface ListingDetailWorkspaceProps {
  result: ListingDetailResult
}

export function ListingDetailWorkspace({ result }: ListingDetailWorkspaceProps) {
  return (
    <main>
      <h1>{result.detail.title}</h1>
    </main>
  )
}
