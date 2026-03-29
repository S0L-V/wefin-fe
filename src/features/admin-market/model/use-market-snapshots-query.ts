import { useQuery } from '@tanstack/react-query'

import { fetchMarketSnapshots } from '../api/fetch-market-snapshots'

export function useMarketSnapshotsQuery() {
  return useQuery({
    queryKey: ['market', 'snapshots'],
    queryFn: fetchMarketSnapshots
  })
}
