import { z } from 'zod'

// 백엔드 dto/TradeResponse, OrderbookResponse와 1:1 매칭되는 WS payload 스키마.
// /topic/stocks/{code} 계열로 push되는 메시지를 검증/타입화하는 데 사용한다.

export const tradeMessageSchema = z.object({
  type: z.literal('TRADE'),
  stockCode: z.string(),
  currentPrice: z.number(),
  changePrice: z.number(),
  changeRate: z.number(),
  openPrice: z.number(),
  highPrice: z.number(),
  lowPrice: z.number(),
  tradeVolume: z.number(),
  totalVolume: z.number(),
  tradeTime: z.string(),
  tradeSide: z.string() // "1": 매수, "5": 매도
})

export type TradeMessage = z.infer<typeof tradeMessageSchema>

const orderbookEntrySchema = z.object({
  price: z.number(),
  quantity: z.number()
})

export const orderbookMessageSchema = z.object({
  type: z.literal('ORDERBOOK'),
  asks: z.array(orderbookEntrySchema),
  bids: z.array(orderbookEntrySchema),
  totalAskQuantity: z.number(),
  totalBidQuantity: z.number()
})

export type OrderbookMessage = z.infer<typeof orderbookMessageSchema>
