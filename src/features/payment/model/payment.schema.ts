import { z } from 'zod'

export const createPaymentResponseSchema = z.object({
  paymentId: z.number(),
  orderId: z.string(),
  planId: z.number(),
  planName: z.string(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  amount: z.coerce.number(),
  provider: z.enum(['TOSS']),
  status: z.string(),
  requestedAt: z.string()
})

export const confirmPaymentResponseSchema = z.object({
  paymentId: z.number(),
  orderId: z.string(),
  planId: z.number(),
  planName: z.string(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  amount: z.coerce.number(),
  provider: z.enum(['TOSS']),
  status: z.string(),
  providerPaymentKey: z.string(),
  approvedAt: z.string(),
  subscriptionStartedAt: z.string(),
  subscriptionExpiredAt: z.string()
})

export const mySubscriptionResponseSchema = z.object({
  planId: z.number(),
  planName: z.string(),
  price: z.coerce.number(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  description: z.string(),
  subscriptionStatus: z.enum(['ACTIVE', 'CANCELED', 'EXPIRED']),
  active: z.boolean(),
  startedAt: z.string(),
  expiredAt: z.string()
})

export type CreatePaymentResponse = z.infer<typeof createPaymentResponseSchema>
export type ConfirmPaymentResponse = z.infer<typeof confirmPaymentResponseSchema>
export type MySubscriptionResponse = z.infer<typeof mySubscriptionResponseSchema>
