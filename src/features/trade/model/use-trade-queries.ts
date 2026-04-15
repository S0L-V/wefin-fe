import { useInfiniteQuery } from '@tanstack/react-query'

import { fetchTradeHistory, type TradeHistoryParams } from '../api/fetch-trade'

export function useTradeHistoryQuery(
  params: Omit<TradeHistoryParams, 'cursor' | 'size'> = {},
  size = 20
) {
  return useInfiniteQuery({
    queryKey: ['trades', 'history', { ...params, size }],
    queryFn: ({ pageParam }) =>
      fetchTradeHistory({ ...params, cursor: pageParam as number | undefined, size }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => (last.hasNext ? (last.nextCursor ?? undefined) : undefined)
  })
}
