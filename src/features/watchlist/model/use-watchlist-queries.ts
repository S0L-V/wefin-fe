import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
      toast.error(error instanceof ApiError ? error.message : '관심종목 추가에 실패했어요')
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
      toast.error(error instanceof ApiError ? error.message : '관심종목 제거에 실패했어요')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY })
    }
  })
}

export function useToggleWatchlist(code: string, name?: string) {
  const isWatchlisted = useIsWatchlisted(code)
  const addMutation = useAddWatchlist()
  const deleteMutation = useDeleteWatchlist()

  const isPending = addMutation.isPending || deleteMutation.isPending
  const label = name || code

  function toggle() {
    if (isPending) return
    if (isWatchlisted) {
      deleteMutation.mutate(code, {
        onSuccess: () => toast(`${label} 관심종목에서 제거했어요`)
      })
    } else {
      addMutation.mutate(code, {
        onSuccess: () => toast.success(`${label} 관심종목에 추가했어요`)
      })
    }
  }

  return { isWatchlisted, toggle, isPending }
}
