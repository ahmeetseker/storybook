# arsam.net web

TanStack Start üzerinde çalışan SSR uygulamasıdır. Componentler kopyalanmaz;
Vite alias’ları doğrudan workspace kökündeki `src/index.ts` ve `src/index.css`
kaynaklarını kullanır. Bu nedenle bir Glass componentinde yapılan değişiklik
hem Storybook’ta hem web uygulamasında HMR ile görünür.

## Çalıştırma

Workspace kökünden:

```bash
npm run dev
```

- Web: `http://localhost:3000`
- Storybook: `http://localhost:6006`

Yalnız web uygulaması için `npm run dev:web`, production build için
`npm run build:web`, build çıktısını çalıştırmak için `npm run start:web`
kullanılır.

## Docker

Workspace kökünden:

```bash
docker build \
  --build-arg APP_ORIGIN=https://arsam.net \
  -f apps/web/Dockerfile \
  -t arsam-web .
docker run --rm -p 3000:3000 arsam-web
```

Health endpoint’i `GET /health` adresindedir. İlk teslimattaki rota
placeholder’ları hem meta robots hem de `robots.txt` üzerinden index’e
kapalıdır.
