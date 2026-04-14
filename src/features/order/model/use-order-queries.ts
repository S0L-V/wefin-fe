import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import {
  fetchOrderHistory,
  fetchPendingOrders,
  fetchTodayOrders,
  type OrderHistoryParams
} from '../api/fetch-order'

export function usePendingOrdersQuery() {
  return useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: fetchPendingOrders
  })
}

export function useTodayOrdersQuery() {
  return useQuery({
    queryKey: ['orders', 'today'],
    queryFn: fetchTodayOrders
  })
}

export function useOrderHistoryQuery(
  params: Omit<OrderHistoryParams, 'cursor' | 'size'> = {},
  size = 20
) {
  return useInfiniteQuery({
    queryKey: ['orders', 'history', { ...params, size }],
    queryFn: ({ pageParam }) =>
      fetchOrderHistory({ ...params, cursor: pageParam as number | undefined, size }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined
  })
}
