import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

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
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '16px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 8px 32px -8px rgba(36,168,171,0.25)',
            border: '1px solid rgba(36,168,171,0.15)'
          },
          classNames: {
            success: '!bg-[#f0fafa] !text-[#1a7a7c] !border-[#24a8ab]/20',
            error: '!bg-rose-50 !text-rose-600 !border-rose-200',
            default: '!bg-white !text-[#1a2b3c]'
          }
        }}
        offset={20}
      />
    </QueryClientProvider>
  )
}

export default AppProviders
