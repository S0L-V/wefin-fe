import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

import ErrorBoundary from './error-boundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60_000
    }
  }
})

function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-center"
          style={{ zIndex: 9999 }}
          toastOptions={{
            style: {
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              background: 'var(--surface)',
              color: 'var(--text)',
              boxShadow: '0 8px 32px -8px rgba(0,0,0,0.2)',
              border: '1px solid var(--line)'
            },
            classNames: {
              success: '!bg-wefin-mint !text-white !border-wefin-mint-deep/30',
              error: '!bg-wefin-red !text-white !border-wefin-red/30',
              warning: '!bg-wefin-amber !text-white !border-wefin-amber/30'
            }
          }}
          offset={20}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default AppProviders
