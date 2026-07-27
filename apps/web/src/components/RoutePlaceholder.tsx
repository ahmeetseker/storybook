import { getRouteByKey, type AppRouteKey } from '@/config/routes'

export interface RoutePlaceholderProps {
  routeKey: AppRouteKey
}

export function RoutePlaceholder({ routeKey }: RoutePlaceholderProps) {
  const route = getRouteByKey(routeKey)

  return (
    <main id="main-content" className="route-stage">
      <section className="route-intro" aria-labelledby="route-heading">
        <span className="route-rule" aria-hidden="true" />
        <p className="route-context">Glass navigasyon kabuğu hazır</p>
        <h1 id="route-heading">{route.label}</h1>
        <p className="route-description">{route.description}</p>
        <p className="route-next">
          Sayfa içeriği, Header ve Dock görsel onayından sonraki tasarım turunda
          bu alana yerleşecek.
        </p>
        <ul className="route-capabilities" aria-label="Hazır altyapı">
          <li>SSR</li>
          <li>Gerçek URL</li>
          <li>Storybook HMR</li>
        </ul>
      </section>
    </main>
  )
}
