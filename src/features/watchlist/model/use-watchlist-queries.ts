import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addWatchlistItem,
  deleteWatchlistItem,
  fetchWatchlist,
  type WatchlistItem
} from '@/features/watchlist/api/fetch-watchlist'
import { ApiError } from '@/shared/api/base-api'

const WATCHLIST_KEY = ['watchlist'] as const

export function useWatchlistQuery() {
  return useQuery({
    queryKey: WATCHLIST_KEY,
    queryFn: fetchWatchlist,
    staleTime: 30_000
  })
}

export function useIsWatchlisted(code: string) {
  const { data } = useWatchlistQuery()
  return data?.some((item) => item.stockCode === code) ?? false
}

export function useAddWatchlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addWatchlistItem,
    onMutate: async (code) => {
      await queryClient.cancelQueries({ queryKey: WATCHLIST_KEY })
      const previous = queryClient.getQueryData<WatchlistItem[]>(WATCHLIST_KEY)
      queryClient.setQueryData<WatchlistItem[]>(WATCHLIST_KEY, (old) => [
        ...(old ?? []),
        { stockCode: code, stockName: '', currentPrice: 0, changeRate: 0 }
      ])
      return { previous }
    },
    onError: (error, _code, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WATCHLIST_KEY, context.previous)
      }
      if (error instanceof ApiError) {
        window.alert(error.message)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY })
    }
  })
}

export function useDeleteWatchlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteWatchlistItem,
    onMutate: async (code) => {
      await queryClient.cancelQueries({ queryKey: WATCHLIST_KEY })
      const previous = queryClient.getQueryData<WatchlistItem[]>(WATCHLIST_KEY)
      queryClient.setQueryData<WatchlistItem[]>(
        WATCHLIST_KEY,
        (old) => old?.filter((item) => item.stockCode !== code) ?? []
      )
      return { previous }
    },
    onError: (error, _code, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WATCHLIST_KEY, context.previous)
      }
      if (error instanceof ApiError) {
        window.alert(error.message)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY })
    }
  })
}

export function useToggleWatchlist(code: string) {
  const isWatchlisted = useIsWatchlisted(code)
  const addMutation = useAddWatchlist()
  const deleteMutation = useDeleteWatchlist()

  const isPending = addMutation.isPending || deleteMutation.isPending

  function toggle() {
    if (isPending) return
    if (isWatchlisted) {
      deleteMutation.mutate(code)
    } else {
      addMutation.mutate(code)
    }
  }

  return { isWatchlisted, toggle, isPending }
}
