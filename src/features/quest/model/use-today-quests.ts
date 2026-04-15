import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/shared/api/base-api'

import { claimQuestReward } from '../api/claim-quest-reward'
import { fetchTodayQuests } from '../api/fetch-today-quests'

function getTodayQuestQueryKey(userId: string) {
  return ['quests', 'today', userId]
}

export function useTodayQuests(userId: string) {
  return useQuery({
    queryKey: getTodayQuestQueryKey(userId),
    queryFn: fetchTodayQuests,
    enabled: !!userId
  })
}

export function useClaimQuestReward(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questId: number) => claimQuestReward(questId),
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: getTodayQuestQueryKey(userId) })
        return
      }

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
