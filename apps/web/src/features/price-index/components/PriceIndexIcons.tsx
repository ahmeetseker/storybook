/**
 * Emlak Endeksi ikon seti — 24px ızgara, 1.7 stroke, yuvarlak uç.
 * Bento hücreleri ve özet kapsülü için; renk her zaman `currentColor`dan
 * gelir, hücre kendi vurgu tonunu CSS'te belirler. İkonlar dekoratiftir
 * (yanlarındaki etiket bilgiyi taşır) — hepsi `aria-hidden`.
 */
import type { SVGProps } from 'react'

function base(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: '0 0 24 24',
    width: 20,
    height: 20,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  } as const
}

export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s-6.5-5.6-6.5-10.4A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.6C18.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </svg>
  )
}

export function TrendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 17.5 9 11.5l3.5 3L20.5 6" />
      <path d="M15.5 6h5v5" />
    </svg>
  )
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 10.2 12 4l7.5 6.2V19a1.2 1.2 0 0 1-1.2 1.2H5.7A1.2 1.2 0 0 1 4.5 19Z" />
      <path d="M9.8 20v-5.6h4.4V20" />
    </svg>
  )
}

export function PeopleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.8 19.2c.5-3 2.6-4.7 5.2-4.7s4.7 1.7 5.2 4.7" />
      <path d="M15.4 6.1a2.8 2.8 0 1 1 1.3 5.3M17.3 13.9c2 .4 3.4 1.9 3.8 4.3" />
    </svg>
  )
}

export function CoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M13.8 8.6a3 3 0 0 0-4 2.9c0 2 1.4 3.4 4.1 3.9M9 11h5M9 13.4h5" strokeWidth={1.55} />
    </svg>
  )
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 5.5 6v5.5c0 4.4 2.9 7.4 6.5 9 3.6-1.6 6.5-4.6 6.5-9V6Z" />
      <path d="m9.3 11.8 2 2 3.6-3.9" />
    </svg>
  )
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5V12l3 2.2" />
    </svg>
  )
}
