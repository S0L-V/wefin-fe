import { baseApi } from '@/shared/api/base-api'

export interface ShareProfitParams {
  stockName: string
  profitAmount: number
  userNickname: string
}

export async function shareProfitToChat(params: ShareProfitParams): Promise<void> {
  await baseApi.post('/chat/global/profit-share', params)
}
