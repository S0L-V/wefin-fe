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
      queryClient.setQueryData<SectorInterest[]>(SECTOR_INTERESTS_KEY, (old) => {
        const current = old ?? []
        // code는 고유 키. 이미 존재하면 그대로 두어 rapid click·동시 호출로 중복이 쌓이지 않게 한다
        if (current.some((item) => item.code === code)) return current
        return [...current, { code, name: code }]
      })
      return { previous }
    },
    onError: (error, _code, context) => {
      // context.previous가 undefined일 수도 있으므로 property 존재 여부로 판단한다 (undefined 복구 포함)
      if (context && 'previous' in context) {
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
      // context.previous가 undefined일 수도 있으므로 property 존재 여부로 판단한다 (undefined 복구 포함)
      if (context && 'previous' in context) {
        queryClient.setQueryData(SECTOR_INTERESTS_KEY, context.previous)
      }
      if (error instanceof ApiError) window.alert(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SECTOR_INTERESTS_KEY })
    }
  })
}
