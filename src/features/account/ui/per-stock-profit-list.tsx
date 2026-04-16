import { Link } from 'react-router-dom'

import type { PortfolioItem } from '@/features/portfolio/api/fetch-portfolio'
import type { TradeHistoryResponse } from '@/features/trade/api/fetch-trade'
import { routes } from '@/shared/config/routes'
import StockLogo from '@/shared/ui/stock-logo'

interface PerStockProfitListProps {
  portfolio: PortfolioItem[]
  trades: TradeHistoryResponse[]
  cutoffDate: string | null
}

interface StockProfit {
  code: string
  name: string
  unrealized: number
  realized: number
  total: number
}

export default function PerStockProfitList({
  portfolio,
  trades,
  cutoffDate
}: PerStockProfitListProps) {
  const map = new Map<string, StockProfit>()

  for (const item of portfolio) {
    const code = item.stockCode ?? ''
    if (!code) continue
    map.set(code, {
      code,
      name: item.stockName ?? code,
      unrealized: Math.trunc(item.profitLoss ?? 0),
      realized: 0,
      total: 0
    })
  }

  for (const trade of trades) {
    if (trade.side !== 'SELL') continue
    const code = trade.stockCode ?? ''
    if (!code) continue
    if (cutoffDate && (trade.createdAt ?? '').substring(0, 10) < cutoffDate) continue
    const existing = map.get(code) ?? {
      code,
      name: trade.stockName ?? code,
      unrealized: 0,
      realized: 0,
      total: 0
    }
    existing.realized += trade.realizedProfit ?? 0
    map.set(code, existing)
  }

  const rows = Array.from(map.values())
    .map((row) => ({ ...row, total: row.unrealized + row.realized }))
    .filter((row) => row.unrealized !== 0 || row.realized !== 0)
    .sort((a, b) => b.total - a.total)

  if (rows.length === 0) {
    return <p className="py-6 text-center text-xs text-wefin-subtle">손익이 발생한 종목이 없어요</p>
  }

  return (
    <ul className="divide-y divide-wefin-line">
      {rows.map((row) => {
        const totalColor = row.total >= 0 ? 'text-red-500' : 'text-blue-600'
        return (
          <li key={row.code}>
            <Link
              to={routes.stockDetail(row.code)}
              className="flex items-center gap-3 px-1 py-2.5 transition-colors hover:bg-wefin-bg"
            >
              <StockLogo code={row.code} name={row.name} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-wefin-text">{row.name}</div>
                <div className="text-[11px] text-wefin-subtle tabular-nums">
                  미실현 {row.unrealized >= 0 ? '+' : ''}
                  {row.unrealized.toLocaleString()} · 실현 {row.realized >= 0 ? '+' : ''}
                  {Math.trunc(row.realized).toLocaleString()}
                </div>
              </div>
              <div className={`text-sm font-semibold tabular-nums ${totalColor}`}>
                {row.total >= 0 ? '+' : ''}
                {Math.trunc(row.total).toLocaleString()}원
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
