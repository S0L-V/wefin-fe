import { z } from 'zod'

// === 게임 결과 조회 (GET /rooms/{roomId}/result) ===
// 백엔드: GameResultInfo.RankingEntry — 슬림화된 4필드 (rank, userName, finalAsset, isMine)
// 다른 참가자의 시드/수익률/거래횟수는 비공개 정책

export const rankingEntrySchema = z.object({
  rank: z.number().int().positive(),
  userName: z.string(),
  finalAsset: z.number(),
  isMine: z.boolean()
})

// roomFinished:
//  - false → 본인은 종료했지만 방은 IN_PROGRESS → rankings는 항상 빈 배열
//  - true  → 방 FINISHED → rankings에 전체 참가자
export const gameResultDataSchema = z.object({
  roomId: z.string().uuid(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  roomFinished: z.boolean(),
  rankings: z.array(rankingEntrySchema)
})

export const gameResultResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: gameResultDataSchema
})

// === 자산 변동 스냅샷 (GET /rooms/{roomId}/snapshots) ===

export const snapshotItemSchema = z.object({
  turnNumber: z.number().int().positive(),
  turnDate: z.iso.date(),
  totalAsset: z.number(),
  cash: z.number(),
  stockValue: z.number(),
  profitRate: z.number()
})

export const snapshotsResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.array(snapshotItemSchema)
})

// === 매매 내역 (GET /rooms/{roomId}/orders) ===

export const orderTypeSchema = z.enum(['BUY', 'SELL'])

export const orderHistoryItemSchema = z.object({
  orderId: z.string().uuid(),
  turnNumber: z.number().int().positive(),
  turnDate: z.iso.date(),
  symbol: z.string(),
  stockName: z.string(),
  orderType: orderTypeSchema,
  quantity: z.number().int().positive(),
  price: z.number(),
  fee: z.number(),
  tax: z.number()
})

export const orderHistoryResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.array(orderHistoryItemSchema)
})

// === Type exports ===

export type RankingEntry = z.infer<typeof rankingEntrySchema>
export type GameResultData = z.infer<typeof gameResultDataSchema>
export type SnapshotItem = z.infer<typeof snapshotItemSchema>
export type OrderType = z.infer<typeof orderTypeSchema>
export type OrderHistoryItem = z.infer<typeof orderHistoryItemSchema>
