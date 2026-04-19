import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

import {
  confirmPaymentResponseSchema,
  createPaymentResponseSchema,
  mySubscriptionResponseSchema
} from '../model/payment.schema'

const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.union([z.string(), z.number()]),
    code: z.string().nullable(),
    message: z.string().nullable(),
    data: dataSchema
  })

export async function createPayment(planId: number) {
  const response = await baseApi.post('/payments', {
    planId,
    provider: 'TOSS'
  })

  return apiResponseSchema(createPaymentResponseSchema).parse(response.data).data
}

export async function confirmPayment(params: {
  paymentKey: string
  orderId: string
  amount: number
}) {
  const response = await baseApi.post('/payments/confirm', params)

  return apiResponseSchema(confirmPaymentResponseSchema).parse(response.data).data
}

export async function getMySubscription() {
  const response = await baseApi.get('/payments/me/subscription')

  return apiResponseSchema(mySubscriptionResponseSchema).parse(response.data).data
}
