import { z, type ZodType } from 'zod'

export function apiResponseSchema<T extends ZodType>(dataSchema: T) {
  return z.object({
    status: z.number(),
    code: z.string().nullable(),
    message: z.string().nullable(),
    data: dataSchema
  })
}

export type ApiResponse<T> = {
  status: number
  code: string | null
  message: string | null
  data: T
}
