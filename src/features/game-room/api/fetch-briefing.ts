import { baseApi } from '@/shared/api/base-api'

import { briefingResponseSchema } from '../model/briefing.schema'

// 캐시 미스 시 네이버 크롤링 + OpenAI 호출까지 발생하므로
// 전역 5초 타임아웃을 120초로 오버라이드한다
const BRIEFING_TIMEOUT_MS = 120_000

export async function fetchBriefing(roomId: string) {
  const response = await baseApi.get(`/rooms/${roomId}/briefing`, {
    timeout: BRIEFING_TIMEOUT_MS
  })
  return briefingResponseSchema.parse(response.data)
}
