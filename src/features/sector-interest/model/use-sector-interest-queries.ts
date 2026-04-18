import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
    mutationFn: ({ code }: { code: string; name: string }) => addSectorInterest(code),
    onMutate: async ({ code, name }) => {
      await queryClient.cancelQueries({ queryKey: SECTOR_INTERESTS_KEY })
      const previous = queryClient.getQueryData<SectorInterest[]>(SECTOR_INTERESTS_KEY)
      queryClient.setQueryData<SectorInterest[]>(SECTOR_INTERESTS_KEY, (old) => {
        const current = old ?? []
        if (current.some((item) => item.code === code)) return current
        return [...current, { code, name }]
      })
      return { previous }
    },
    onError: (error, _variables, context) => {
      // context.previous가 undefined일 수도 있으므로 property 존재 여부로 판단한다 (undefined 복구 포함)
      if (context && 'previous' in context) {
        queryClient.setQueryData(SECTOR_INTERESTS_KEY, context.previous)
      }
      toast.error(error instanceof ApiError ? error.message : '관심 분야 등록에 실패했어요')
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
      toast.error(error instanceof ApiError ? error.message : '관심 분야 삭제에 실패했어요')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SECTOR_INTERESTS_KEY })
    }
  })
}
