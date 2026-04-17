import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import AppHeader from './app-header'

vi.mock('../../../features/auth-dialog/model/use-login-dialog-query', () => ({
  useLoginDialogQuery: () => ({
    data: {
      title: '로그인 모달 기본 세팅',
      description: '로그인 폼 위치',
      stack: [
        { label: 'Data layer', value: 'Axios + Zod' },
        { label: 'Server state', value: 'TanStack Query' },
        { label: 'UI state', value: 'Zustand' }
      ]
    }
  })
}))

describe('AppHeader', () => {
  it('renders active navigation and login trigger', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/stocks']}>
          <AppHeader />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('wefin')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '실시간 투자' })).toHaveClass('text-wefin-mint-deep')
  })
})
