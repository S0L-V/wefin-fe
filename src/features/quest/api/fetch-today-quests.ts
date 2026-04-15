import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

export const questStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REWARDED'])

export const questSchema = z.object({
  questId: z.number(),
  dailyQuestId: z.number(),
  templateId: z.number(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  status: questStatusSchema,
  progress: z.number(),
  targetValue: z.number(),
  reward: z.number(),
  questDate: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable()
})

const todayQuestListSchema = z.object({
  questDate: z.string(),
  quests: z.array(questSchema)
})

export type Quest = z.infer<typeof questSchema>
export type QuestStatus = z.infer<typeof questStatusSchema>
export type TodayQuestList = z.infer<typeof todayQuestListSchema>

export async function fetchTodayQuests(): Promise<TodayQuestList> {
  const response = await baseApi.get('/quests/today')
  const parsed = apiResponseSchema(todayQuestListSchema).parse(response.data)
  return parsed.data
}
