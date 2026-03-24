import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import App from './App'

vi.mock('./features/app-shell/use-app-shell-query', () => ({
  useAppShellQuery: () => ({
    data: {
      market: 'KRX',
      environment: 'Sandbox',
      status: 'Connected',
      updatedAt: '2026-03-25T10:00:00+09:00'
    }
  })
}))

describe('App', () => {
  it('renders the header navigation on section routes', () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/stocks']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('wefin')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: '실시간 주식'
      })
    ).toHaveClass('bg-wefin-mint-soft', 'text-wefin-mint')
  })
})
