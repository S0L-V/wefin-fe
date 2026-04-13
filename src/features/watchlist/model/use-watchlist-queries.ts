import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addWatchlistItem,
  deleteWatchlistItem,
  fetchWatchlist
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        window.alert(error.message)
      }
    }
  })
}

export function useDeleteWatchlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteWatchlistItem,
    onSuccess: () => {
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
