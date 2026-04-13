import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const myGroupSchema = z.object({
  groupId: z.number(),
  groupName: z.string(),
  isHomeGroup: z.boolean()
})

export type MyGroup = z.infer<typeof myGroupSchema>

export async function getMyGroup() {
  const res = await baseApi.get('/users/me/group')

  const parsed = apiResponseSchema(myGroupSchema).parse(res.data)
  return parsed.data
}
