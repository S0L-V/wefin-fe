import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/shared/api/base-api'

import { claimQuestReward } from '../api/claim-quest-reward'
import { fetchTodayQuests } from '../api/fetch-today-quests'

const todayQuestQueryKey = ['quests', 'today'] as const

export function getTodayQuestQueryKey(userId: string) {
  return [...todayQuestQueryKey, userId] as const
}

export function invalidateTodayQuests(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: todayQuestQueryKey })
}

export function refreshTodayQuestsAfterRealtimeAction(queryClient: QueryClient) {
  void invalidateTodayQuests(queryClient)
  window.setTimeout(() => {
    void invalidateTodayQuests(queryClient)
  }, 500)
}

export function useTodayQuests(userId: string) {
  return useQuery({
    queryKey: getTodayQuestQueryKey(userId),
    queryFn: fetchTodayQuests,
    enabled: !!userId,
    refetchInterval: 60_000
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

      void invalidateTodayQuests(queryClient)
    }
  })
}

export function getQuestErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return '퀘스트 정보를 불러오지 못했습니다.'
}
