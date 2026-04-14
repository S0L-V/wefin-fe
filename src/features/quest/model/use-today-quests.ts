import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/shared/api/base-api'

import { claimQuestReward } from '../api/claim-quest-reward'
import { fetchTodayQuests } from '../api/fetch-today-quests'

export function useTodayQuests(enabled: boolean) {
  return useQuery({
    queryKey: ['quests', 'today'],
    queryFn: fetchTodayQuests,
    enabled
  })
}

export function useClaimQuestReward() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questId: number) => claimQuestReward(questId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quests', 'today'] })
    }
  })
}

export function getQuestErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return '퀘스트 정보를 불러오지 못했습니다.'
}
