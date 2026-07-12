/** Dış bağımlılık olmadan (offline) çalışan, gradyanlı SVG data-URI görsel üretir. */
export function placeholderImage(label: string, from: string, to: string, width = 800, height = 600): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.85)" font-family="-apple-system, sans-serif" font-size="${Math.round(height / 12)}" font-weight="700">${label}</text>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
