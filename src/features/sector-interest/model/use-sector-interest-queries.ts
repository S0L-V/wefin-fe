import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addSectorInterest,
  deleteSectorInterest,
  fetchSectorInterests,
  type SectorInterest
} from '@/features/sector-interest/api/fetch-sector-interest'
import { ApiError } from '@/shared/api/base-api'

const SECTOR_INTERESTS_KEY = ['interests', 'sectors'] as const

export function useSectorInterestsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: SECTOR_INTERESTS_KEY,
    queryFn: fetchSectorInterests,
    staleTime: 30_000,
    enabled
  })
}

export function useAddSectorInterest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addSectorInterest,
    onMutate: async (code) => {
      await queryClient.cancelQueries({ queryKey: SECTOR_INTERESTS_KEY })
      const previous = queryClient.getQueryData<SectorInterest[]>(SECTOR_INTERESTS_KEY)
      queryClient.setQueryData<SectorInterest[]>(SECTOR_INTERESTS_KEY, (old) => [
        ...(old ?? []),
        { code, name: code }
      ])
      return { previous }
    },
    onError: (error, _code, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SECTOR_INTERESTS_KEY, context.previous)
      }
      if (error instanceof ApiError) window.alert(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SECTOR_INTERESTS_KEY })
    }
  })
}

export function useDeleteSectorInterest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSectorInterest,
    onMutate: async (code) => {
      await queryClient.cancelQueries({ queryKey: SECTOR_INTERESTS_KEY })
      const previous = queryClient.getQueryData<SectorInterest[]>(SECTOR_INTERESTS_KEY)
      queryClient.setQueryData<SectorInterest[]>(
        SECTOR_INTERESTS_KEY,
        (old) => old?.filter((item) => item.code !== code) ?? []
      )
      return { previous }
    },
    onError: (error, _code, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SECTOR_INTERESTS_KEY, context.previous)
      }
      if (error instanceof ApiError) window.alert(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SECTOR_INTERESTS_KEY })
    }
  })
}
