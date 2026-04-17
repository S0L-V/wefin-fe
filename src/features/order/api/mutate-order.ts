import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

export const orderSideSchema = z.enum(['BUY', 'SELL'])
export const orderTypeSchema = z.enum(['MARKET', 'LIMIT'])
export const orderStatusSchema = z.enum(['PENDING', 'FILLED', 'PARTIAL', 'CANCELLED'])

export type OrderSide = z.infer<typeof orderSideSchema>
export type OrderType = z.infer<typeof orderTypeSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>

export const orderResponseSchema = z.object({
  orderNo: z.string(),
  stockCode: z.string().nullable(),
  stockName: z.string().nullable(),
  side: orderSideSchema,
  orderType: orderTypeSchema,
  quantity: z.number(),
  price: z.number().nullable(),
  status: orderStatusSchema,
  totalAmount: z.number().nullable(),
  fee: z.number().nullable(),
  tax: z.number().nullable(),
  realizedProfit: z.number().nullable(),
  balance: z.number().nullable(),
  createdAt: z.string().nullable()
})

export const orderCancelResponseSchema = z.object({
  orderNo: z.string(),
  status: orderStatusSchema,
  refundedAmount: z.number().nullable(),
  cancelledAt: z.string().nullable()
})

export type OrderResponse = z.infer<typeof orderResponseSchema>
export type OrderCancelResponse = z.infer<typeof orderCancelResponseSchema>

export interface BuyOrderParams {
  stockCode: string
  quantity: number
}

export interface SellOrderParams {
  stockCode: string
  quantity: number
}

export interface LimitBuyOrderParams {
  stockCode: string
  quantity: number
  requestPrice: number
}

export interface LimitSellOrderParams {
  stockCode: string
  quantity: number
  requestPrice: number
}

export interface ModifyOrderParams {
  orderNo: string
  requestPrice: number
  quantity: number
}

export async function buyOrder(params: BuyOrderParams): Promise<OrderResponse> {
  const response = await baseApi.post('/order/buy', params)
  return apiResponseSchema(orderResponseSchema).parse(response.data).data
}

export async function sellOrder(params: SellOrderParams): Promise<OrderResponse> {
  const response = await baseApi.post('/order/sell', params)
  return apiResponseSchema(orderResponseSchema).parse(response.data).data
}

export async function limitBuyOrder(params: LimitBuyOrderParams): Promise<OrderResponse> {
  const response = await baseApi.post('/order/limit/buy', params)
  return apiResponseSchema(orderResponseSchema).parse(response.data).data
}

export async function limitSellOrder(params: LimitSellOrderParams): Promise<OrderResponse> {
  const response = await baseApi.post('/order/limit/sell', params)
  return apiResponseSchema(orderResponseSchema).parse(response.data).data
}

export async function modifyOrder({ orderNo, ...body }: ModifyOrderParams): Promise<OrderResponse> {
  const response = await baseApi.put(`/order/${orderNo}`, body)
  return apiResponseSchema(orderResponseSchema).parse(response.data).data
}

export async function cancelOrder(orderNo: string): Promise<OrderCancelResponse> {
  const response = await baseApi.delete(`/order/${orderNo}`)
  return apiResponseSchema(orderCancelResponseSchema).parse(response.data).data
}
