import { z } from 'zod'

export const appShellSchema = z.object({
  market: z.string(),
  environment: z.string(),
  status: z.string(),
  updatedAt: z.string()
})

export type AppShell = z.infer<typeof appShellSchema>
