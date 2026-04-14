import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

import { type Quest, questSchema } from './fetch-today-quests'

export async function claimQuestReward(questId: number): Promise<Quest> {
  const response = await baseApi.post(`/quests/${questId}/reward`)
  const parsed = apiResponseSchema(questSchema).parse(response.data)
  return parsed.data
}
