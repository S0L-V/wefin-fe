import { ApiError } from '@/shared/api/base-api'

export type OrderTab = 'buy' | 'sell' | 'modify'
export type PriceMode = 'limit' | 'market'

export function priceTick(price: number): number {
  if (price < 2000) return 1
  if (price < 5000) return 5
  if (price < 20000) return 10
  if (price < 50000) return 50
  if (price < 200000) return 100
  if (price < 500000) return 500
  return 1000
}

export function formatAmount(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return value.toLocaleString()
}

export function getSubmitColor(tab: OrderTab): string {
  if (tab === 'buy') return 'bg-red-500 hover:bg-red-600'
  if (tab === 'sell') return 'bg-wefin-blue hover:bg-wefin-blue/80'
  return 'bg-wefin-muted hover:bg-wefin-surface-20'
}

export function getSubmitLabel(tab: OrderTab, isPending: boolean): string {
  if (isPending) return '처리중...'
  if (tab === 'buy') return '매수하기'
  if (tab === 'sell') return '매도하기'
  return '정정하기'
}

export function resolveErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof ApiError) return error.message
  return '주문 처리 중 오류가 발생했어요.'
}
