import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { HelmetProvider } from 'react-helmet-async'
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
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="top-center"
            style={{ zIndex: 9999 }}
            toastOptions={{
              style: {
                borderRadius: '14px',
                padding: '14px 22px',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                background: 'var(--surface)',
                color: 'var(--text)',
                boxShadow:
                  '0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 40px -8px rgba(0,0,0,0.12), 0 0 0 1px var(--line)',
                border: 'none',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              },
              classNames: {
                success:
                  '!bg-gradient-to-r !from-wefin-mint-deep !to-wefin-mint !text-white !shadow-[0_4px_6px_-1px_rgba(20,184,166,0.15),0_16px_40px_-8px_rgba(20,184,166,0.2)]',
                error:
                  '!bg-gradient-to-r !from-[#dc2626] !to-wefin-red !text-white !shadow-[0_4px_6px_-1px_rgba(229,72,77,0.15),0_16px_40px_-8px_rgba(229,72,77,0.2)]',
                warning:
                  '!bg-gradient-to-r !from-[#d97706] !to-wefin-amber !text-white !shadow-[0_4px_6px_-1px_rgba(232,169,58,0.15),0_16px_40px_-8px_rgba(232,169,58,0.2)]'
              }
            }}
            offset={24}
          />
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default AppProviders
