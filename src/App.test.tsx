import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('renders the header navigation on section routes', () => {
    render(
      <MemoryRouter initialEntries={['/stocks']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('wefin')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: '실시간 주식'
      })
    ).toHaveClass('app-nav-link-active')
  })
})
