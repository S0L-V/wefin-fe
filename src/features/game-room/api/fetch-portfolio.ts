import { baseApi } from '@/shared/api/base-api'

import { holdingsResponseSchema, portfolioResponseSchema } from '../model/portfolio.schema'

// 포트폴리오 요약 조회
export async function fetchPortfolio(roomId: string) {
  const response = await baseApi.get(`/rooms/${roomId}/portfolio`)
  return portfolioResponseSchema.parse(response.data)
}

// 보유종목 상세 조회
export async function fetchHoldings(roomId: string) {
  const response = await baseApi.get(`/rooms/${roomId}/holdings`)
  return holdingsResponseSchema.parse(response.data)
}
