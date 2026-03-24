import { z } from 'zod'

export const loginDialogSchema = z.object({
  title: z.string(),
  description: z.string(),
  stack: z.array(
    z.object({
      label: z.string(),
      value: z.string()
    })
  )
})

export type LoginDialogData = z.infer<typeof loginDialogSchema>
