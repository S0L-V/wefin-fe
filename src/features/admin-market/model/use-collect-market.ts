import { useMutation, useQueryClient } from '@tanstack/react-query'

import { collectMarketData } from '../api/collect-market-data'

export function useCollectMarket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: collectMarketData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'snapshots'] })
    }
  })
}
