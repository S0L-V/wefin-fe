import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/shared/api/base-api'

import {
  fetchRecommendedNews,
  type RecommendedNews,
  refreshRecommendedNews
} from '../api/fetch-recommended-news'

const RECOMMENDED_NEWS_KEY = ['news', 'recommended'] as const

/**
 * 추천 뉴스 카드를 조회한다
 *
 * 로그인 사용자에 한해 활성화되며, AI 생성 비용이 크므로 staleTime을 길게 잡는다
 */
export function useRecommendedNewsQuery(enabled: boolean) {
  return useQuery({
    queryKey: RECOMMENDED_NEWS_KEY,
    queryFn: fetchRecommendedNews,
    enabled,
    staleTime: 30 * 60 * 1000
  })
}

/**
 * 추천 뉴스 카드를 교체한다 ("다른 뉴스 보기")
 *
 * 성공 시 캐시를 갱신하여 즉시 UI에 반영한다.
 * 서버가 429(일일 제한 초과)를 반환하면 응답의 refreshCount/refreshLimit으로
 * UI가 자동으로 버튼을 비활성화한다
 */
export function useRefreshRecommendedNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: refreshRecommendedNews,
    onSuccess: (data) => {
      queryClient.setQueryData<RecommendedNews>(RECOMMENDED_NEWS_KEY, data)
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 429) {
        // 서버가 제한 초과 시 캐시의 refreshCount를 limit으로 맞춰 UI가 즉시 반영하도록 한다
        queryClient.setQueryData<RecommendedNews>(RECOMMENDED_NEWS_KEY, (old) => {
          if (!old) return old
          return { ...old, refreshCount: old.refreshLimit }
        })
        return
      }
      toast.error('새로운 추천 뉴스를 불러오지 못했어요')
    }
  })
}
