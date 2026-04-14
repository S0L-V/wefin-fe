import { useQuery } from '@tanstack/react-query'

import { fetchPortfolio } from '../api/fetch-portfolio'

export function usePortfolioQuery() {
  return useQuery({
    queryKey: ['portfolio', 'list'],
    queryFn: fetchPortfolio
  })
}
