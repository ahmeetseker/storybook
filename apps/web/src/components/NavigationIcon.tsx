import type { SVGProps } from 'react'
import type { AppRouteDefinition } from '@/config/routes'

export interface NavigationIconProps
  extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: AppRouteDefinition['icon'] | 'clock' | 'theme' | 'image' | 'mic'
  size?: number
}

const paths: Record<NavigationIconProps['name'], string[]> = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h5v-6h4v6h5V9.5'],
  search: ['M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z', 'm16 16 5 5'],
  building: ['M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16', 'M4 21h16', 'M9 7h2M9 11h2M9 15h2'],
  pin: ['M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z', 'M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  book: ['M12 5.5C10.5 4 8.5 3.5 6 3.5v14c2.5 0 4.5.5 6 2 1.5-1.5 3.5-2 6-2v-14c-2.5 0-4.5.5-6 2Z', 'M12 5.5v14'],
  sparkles: ['M9 2.5c.4 3.6 2.4 5.6 6 6-3.6.4-5.6 2.4-6 6-.4-3.6-2.4-5.6-6-6 3.6-.4 5.6-2.4 6-6Z', 'M18 14c.2 2 1.3 3.1 3.3 3.3-2 .2-3.1 1.3-3.3 3.3-.2-2-1.3-3.1-3.3-3.3 2-.2 3.1-1.3 3.3-3.3Z'],
  compare: ['M7 4v10m0 0-3-3m3 3 3-3m7 9V7m0 0-3 3m3-3 3 3'],
  heart: ['M12 20.5s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 5.7-8 11-8 11Z'],
  plus: ['M12 5v14', 'M5 12h14'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M5 21a7 7 0 0 1 14 0'],
  message: ['M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  theme: ['M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  image: ['M4 5.5h16v13H4z', 'm4 15.5 4.5-4.5 3.5 3.5 3-3 5 5', 'M9.2 10.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z'],
  mic: ['M12 3.5a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-5 0V6A2.5 2.5 0 0 1 12 3.5Z', 'M6.5 11a5.5 5.5 0 0 0 11 0', 'M12 16.5V20'],
}

export function NavigationIcon({
  name,
  size = 20,
  ...props
}: NavigationIconProps) {
  return (
    <svg
      {...props}
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
      {paths[name].map((path, index) => (
        <path key={`${name}-${index}`} d={path} />
      ))}
    </svg>
  )
}
