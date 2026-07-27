import type { ListingSummary } from './listing-adapter'

const IMAGE_BY_CATEGORY = {
  land:
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=84',
  residential:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84',
  commercial:
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=84',
  building:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=84',
  timeshare:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=84',
  touristic:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=84',
} satisfies Record<ListingSummary['category'], string>

export function getRepresentativeListingImage(listing: ListingSummary) {
  return {
    src: IMAGE_BY_CATEGORY[listing.category],
    fallbackSrc: listing.image.src,
    alt: `${listing.title} için temsili ilan fotoğrafı`,
  }
}
