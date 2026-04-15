import type { TradeHistoryResponse } from '../api/fetch-trade'

export interface TradeGroup {
  dateKey: string
  dateLabel: string
  items: TradeHistoryResponse[]
}

export function groupTradesByDate(trades: TradeHistoryResponse[]): TradeGroup[] {
  const groups = new Map<string, TradeHistoryResponse[]>()

  for (const trade of trades) {
    const dateKey = trade.createdAt ? trade.createdAt.slice(0, 10) : 'unknown'
    const existing = groups.get(dateKey) ?? []
    existing.push(trade)
    groups.set(dateKey, existing)
  }

  return Array.from(groups.entries()).map(([dateKey, items]) => ({
    dateKey,
    dateLabel: formatDateLabel(dateKey),
    items
  }))
}

function formatDateLabel(dateKey: string): string {
  if (dateKey === 'unknown' || dateKey.length < 10) return '-'
  const month = Number(dateKey.slice(5, 7))
  const day = Number(dateKey.slice(8, 10))
  return `${month}.${day}`
}
