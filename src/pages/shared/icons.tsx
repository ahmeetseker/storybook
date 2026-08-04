// Hesap kabuğunun navigasyon simgeleri — tek stroke ailesi (24 viewBox, 1.8 kalınlık).
// Dekoratiftir: erişilebilir ad her zaman komşu metinden gelir.
import type { SVGProps } from 'react'

export type PageIconName =
  | 'ara'
  | 'ozet'
  | 'mesaj'
  | 'bildirim'
  | 'arsa'
  | 'konut'
  | 'liste'
  | 'doping'
  | 'fatura'
  | 'kalp'
  | 'alarm'
  | 'karsilastir'
  | 'ai'
  | 'vizyon'
  | 'radar'
  | 'kurumsal'
  | 'ayarlar'
  | 'sikayet'
  | 'cikis'
  | 'menu'

const paths: Record<PageIconName, string[]> = {
  ara: ['M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z', 'm16 16 5 5'],
  ozet: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h5v-6h4v6h5V9.5'],
  mesaj: ['M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z'],
  bildirim: ['M6 9.5a6 6 0 1 1 12 0c0 3.7 1.5 5.5 1.5 5.5h-15S6 13.2 6 9.5Z', 'M10 18.5a2 2 0 0 0 4 0'],
  arsa: ['M3 8.5 9 5.5l6 3 6-3v10l-6 3-6-3-6 3v-10Z', 'M9 5.5v10', 'M15 8.5v10'],
  konut: ['M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16', 'M4 21h16', 'M9 7h2M9 11h2M9 15h2'],
  liste: ['M4 7h16', 'M4 12h16', 'M4 17h10'],
  doping: [
    'M12 3.5c2.6 2 4 4.9 4 8.1 0 2.2-1 4-2 5h-4c-1-1-2-2.8-2-5 0-3.2 1.4-6.1 4-8.1Z',
    'M12 11.4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
    'M9.5 19.8c.8-.5 1.6-.8 2.5-.8s1.7.3 2.5.8',
  ],
  fatura: ['M6 3.5h12v17l-2.5-1.5L13 20.5 10.5 19 8 20.5 6 19V3.5Z', 'M9 8.5h6', 'M9 12.5h6'],
  kalp: ['M12 20.5s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 5.7-8 11-8 11Z'],
  alarm: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  karsilastir: ['M7 4v10m0 0-3-3m3 3 3-3m7 9V7m0 0-3 3m3-3 3 3'],
  ai: [
    'M9 2.5c.4 3.6 2.4 5.6 6 6-3.6.4-5.6 2.4-6 6-.4-3.6-2.4-5.6-6-6 3.6-.4 5.6-2.4 6-6Z',
    'M18 14c.2 2 1.3 3.1 3.3 3.3-2 .2-3.1 1.3-3.3 3.3-.2-2-1.3-3.1-3.3-3.3 2-.2 3.1-1.3 3.3-3.3Z',
  ],
  vizyon: [
    'M4 5.5h16v13H4z',
    'm4 15.5 4.5-4.5 3.5 3.5 3-3 5 5',
    'M9.2 10.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z',
  ],
  radar: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 16.5a4.5 4.5 0 1 0-4.5-4.5', 'm12 12 4.5-4.5'],
  kurumsal: ['M12 3.5 19 6v6c0 4.2-3 7-7 8.5-4-1.5-7-4.3-7-8.5V6l7-2.5Z', 'm9 11.8 2.2 2.2 4.3-4.3'],
  ayarlar: [
    'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z',
    'M19.4 13.5a7.6 7.6 0 0 0 0-3l1.8-1.4-2-3.4-2.1.9a7.6 7.6 0 0 0-2.6-1.5L14.2 3H9.8l-.3 2.1a7.6 7.6 0 0 0-2.6 1.5l-2.1-.9-2 3.4 1.8 1.4a7.6 7.6 0 0 0 0 3l-1.8 1.4 2 3.4 2.1-.9a7.6 7.6 0 0 0 2.6 1.5l.3 2.1h4.4l.3-2.1a7.6 7.6 0 0 0 2.6-1.5l2.1.9 2-3.4-1.8-1.4Z',
  ],
  sikayet: ['M6 21V4', 'M6 5h11l-2 3.5L17 12H6'],
  cikis: ['M14 4.5h5v15h-5', 'm9.5 8-4 4 4 4', 'M5.5 12h9'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
}

export interface PageIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: PageIconName
  size?: number
}

export function PageIcon({ name, size = 20, ...rest }: PageIconProps) {
  return (
    <svg
      {...rest}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name].map((d, index) => (
        <path key={`${name}-${index}`} d={d} />
      ))}
    </svg>
  )
}
