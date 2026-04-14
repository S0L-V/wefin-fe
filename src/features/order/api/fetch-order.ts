import { z, type ZodType } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

import {
  orderSideSchema,
  type OrderStatus,
  orderStatusSchema,
  orderTypeSchema
} from './mutate-order'

export const orderHistoryResponseSchema = z.object({
  orderId: z.number(),
  orderNo: z.string(),
  stockCode: z.string().nullable(),
  stockName: z.string().nullable(),
  side: orderSideSchema,
  orderType: orderTypeSchema,
  quantity: z.number(),
  requestPrice: z.number().nullable(),
  status: orderStatusSchema,
  fee: z.number().nullable(),
  tax: z.number().nullable(),
  createdAt: z.string().nullable()
})

export type OrderHistoryResponse = z.infer<typeof orderHistoryResponseSchema>

export function cursorResponseSchema<T extends ZodType>(itemSchema: T) {
  return z.object({
    content: z.array(itemSchema),
    nextCursor: z.number().nullable(),
    hasNext: z.boolean()
  })
}

export interface CursorResponse<T> {
  content: T[]
  nextCursor: number | null
  hasNext: boolean
}

export interface OrderHistoryParams {
  status?: OrderStatus[]
  stockCode?: string
  startDate?: string
  endDate?: string
  cursor?: number
  size?: number
}

export async function fetchPendingOrders(): Promise<OrderHistoryResponse[]> {
  const response = await baseApi.get('/order/pending')
  return apiResponseSchema(z.array(orderHistoryResponseSchema)).parse(response.data).data
}

export async function fetchTodayOrders(): Promise<OrderHistoryResponse[]> {
  const response = await baseApi.get('/order/today')
  return apiResponseSchema(z.array(orderHistoryResponseSchema)).parse(response.data).data
}

export async function fetchOrderHistory(
  params: OrderHistoryParams = {}
): Promise<CursorResponse<OrderHistoryResponse>> {
  const response = await baseApi.get('/order/history', {
    params,
    paramsSerializer: { indexes: null }
  })
  return apiResponseSchema(cursorResponseSchema(orderHistoryResponseSchema)).parse(response.data)
    .data
}
