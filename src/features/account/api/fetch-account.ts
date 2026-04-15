import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

export const accountResponseSchema = z.object({
  balance: z.number().nullable(),
  initialBalance: z.number().nullable(),
  totalRealizedProfit: z.number().nullable()
})

export const buyingPowerResponseSchema = z.object({
  maxQuantity: z.number().nullable()
})

export const assetHistoryItemSchema = z.object({
  date: z.string().nullable(),
  totalAsset: z.number().nullable(),
  balance: z.number().nullable(),
  evaluationAmount: z.number().nullable(),
  realizedProfit: z.number().nullable()
})

export const assetHistoryResponseSchema = z.object({
  history: z.array(assetHistoryItemSchema)
})

export type AccountResponse = z.infer<typeof accountResponseSchema>
export type BuyingPowerResponse = z.infer<typeof buyingPowerResponseSchema>
export type AssetHistoryItem = z.infer<typeof assetHistoryItemSchema>
export type AssetHistoryResponse = z.infer<typeof assetHistoryResponseSchema>

export async function fetchAccount(): Promise<AccountResponse> {
  const response = await baseApi.get('/account')
  return apiResponseSchema(accountResponseSchema).parse(response.data).data
}

export async function fetchBuyingPower(price: number): Promise<BuyingPowerResponse> {
  const response = await baseApi.get('/account/buying-power', { params: { price } })
  return apiResponseSchema(buyingPowerResponseSchema).parse(response.data).data
}

export interface AssetHistoryParams {
  from?: string
  to?: string
}

export async function fetchAssetHistory(
  params: AssetHistoryParams = {}
): Promise<AssetHistoryResponse> {
  const response = await baseApi.get('/account/asset-history', { params })
  return apiResponseSchema(assetHistoryResponseSchema).parse(response.data).data
}
