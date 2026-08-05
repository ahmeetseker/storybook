import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { varsayilanAuthAdapters } from './features/auth/data/auth-adapters'

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })

  return createRouter({
    routeTree,
    // Vite `base`'i ile aynı kaynaktan beslenir; alt yolda servis edilen
    // statik dağıtımlarda (GitHub Pages) linkler bu önekle üretilir.
    basepath: import.meta.env.BASE_URL,
    context: {
      queryClient,
      adapters: varsayilanAuthAdapters,
      // `__root`'un `beforeLoad`'u bunu ilk navigasyonda gerçek çözümle
      // değiştirir; o ana kadar dürüst cevap "bilinmiyor".
      oturum: { durum: 'bilinmiyor' },
    },
    defaultPreload: 'intent',
    scrollRestoration: true,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
