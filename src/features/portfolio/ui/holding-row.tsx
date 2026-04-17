import { Link } from 'react-router-dom'

import { routes } from '@/shared/config/routes'

import type { PortfolioItem } from '../api/fetch-portfolio'

interface HoldingRowProps {
  holding: PortfolioItem
  isCurrent?: boolean
}

export default function HoldingRow({ holding, isCurrent = false }: HoldingRowProps) {
  const code = holding.stockCode ?? ''
  const name = holding.stockName ?? code
  const quantity = holding.quantity ?? 0
  const avgPrice = Math.trunc(holding.avgPrice ?? 0)
  const evaluationAmount = Math.trunc(holding.evaluationAmount ?? 0)
  const profitLoss = Math.trunc(holding.profitLoss ?? 0)
  const profitRate = holding.profitRate ?? 0
  const profitColor = profitLoss >= 0 ? 'text-red-500' : 'text-blue-500'

  return (
    <Link
      to={code ? routes.stockDetail(code) : '#'}
      className={`relative block px-3 py-2 transition-colors ${
        isCurrent
          ? 'bg-gradient-to-r from-wefin-mint-soft/70 via-wefin-mint-soft/20 to-transparent'
          : 'hover:bg-wefin-bg'
      }`}
    >
      {isCurrent && (
        <span
          aria-hidden
          className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-wefin-mint-deep"
        />
      )}
      <div className="flex items-center justify-between">
        <span className="truncate text-base font-semibold text-wefin-text">
          {name}
          <span className="ml-1.5 text-sm font-bold text-wefin-mint-deep">
            {quantity.toLocaleString()}주
          </span>
        </span>
        <span className="shrink-0 text-base font-semibold text-wefin-text tabular-nums">
          {evaluationAmount.toLocaleString()}원
        </span>
      </div>
      <div className="flex items-center justify-between text-sm tabular-nums">
        <span className="text-wefin-subtle">평단 {avgPrice.toLocaleString()}원</span>
        <span className={`font-medium ${profitColor}`}>
          {profitLoss >= 0 ? '+' : ''}
          {profitLoss.toLocaleString()} ({profitRate >= 0 ? '+' : ''}
          {profitRate.toFixed(2)}%)
        </span>
      </div>
    </Link>
  )
}
