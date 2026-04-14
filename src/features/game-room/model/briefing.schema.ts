import { z } from 'zod'

export const briefingDataSchema = z.object({
  targetDate: z.iso.date(),
  marketOverview: z.string().min(1),
  keyIssues: z.string().min(1),
  investmentHint: z.string().min(1)
})

export const briefingResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: briefingDataSchema
})

export type BriefingData = z.infer<typeof briefingDataSchema>
export type BriefingResponse = z.infer<typeof briefingResponseSchema>
