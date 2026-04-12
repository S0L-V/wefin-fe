import { baseApi } from '@/shared/api/base-api'

import {
  chartResponseSchema,
  orderResponseSchema,
  type OrderType,
  stockSearchResponseSchema
} from '../model/stock.schema'

// 종목 검색
export async function searchStocks(roomId: string, keyword: string) {
  const response = await baseApi.get(`/rooms/${roomId}/stocks/search`, {
    params: { keyword }
  })
  return stockSearchResponseSchema.parse(response.data)
}

// 차트 조회
export async function fetchChart(symbol: string, roomId: string) {
  const response = await baseApi.get(`/stocks/${symbol}/chart`, {
    params: { roomId }
  })
  return chartResponseSchema.parse(response.data)
}

// 매수/매도 주문
export interface PlaceOrderParams {
  roomId: string
  symbol: string
  orderType: OrderType
  quantity: number
}

export async function placeOrder({ roomId, symbol, orderType, quantity }: PlaceOrderParams) {
  const response = await baseApi.post(`/rooms/${roomId}/orders`, {
    symbol,
    orderType,
    quantity
  })
  return orderResponseSchema.parse(response.data)
}
