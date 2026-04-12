import { z } from 'zod'

// 백엔드 dto/TradeResponse, OrderbookResponse와 1:1 매칭되는 WS payload 스키마.
// /topic/stocks/{code} 계열로 push되는 메시지를 검증/타입화하는 데 사용한다.

export const tradeMessageSchema = z.object({
  type: z.literal('TRADE'),
  stockCode: z.string(),
  currentPrice: z.number().finite(),
  changePrice: z.number().finite(),
  changeRate: z.number().finite(),
  openPrice: z.number().finite(),
  highPrice: z.number().finite(),
  lowPrice: z.number().finite(),
  tradeVolume: z.number().finite(),
  totalVolume: z.number().finite(),
  tradeTime: z.string(),
  tradeSide: z.string() // "1": 매수, "5": 매도
})

export type TradeMessage = z.infer<typeof tradeMessageSchema>

const orderbookEntrySchema = z.object({
  price: z.number().finite(),
  quantity: z.number().finite()
})

export const orderbookMessageSchema = z.object({
  type: z.literal('ORDERBOOK'),
  asks: z.array(orderbookEntrySchema),
  bids: z.array(orderbookEntrySchema),
  totalAskQuantity: z.number().finite(),
  totalBidQuantity: z.number().finite()
})

export type OrderbookMessage = z.infer<typeof orderbookMessageSchema>

export const candleMessageSchema = z.object({
  type: z.literal('CANDLE'),
  stockCode: z.string(),
  time: z.string(),
  openPrice: z.number().finite(),
  highPrice: z.number().finite(),
  lowPrice: z.number().finite(),
  closePrice: z.number().finite(),
  volume: z.number().finite(),
  periodCode: z.string()
})

export type CandleMessage = z.infer<typeof candleMessageSchema>
