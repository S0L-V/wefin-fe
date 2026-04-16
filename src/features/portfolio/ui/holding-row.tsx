import { Link } from 'react-router-dom'

import { routes } from '@/shared/config/routes'
import StockLogo from '@/shared/ui/stock-logo'

import type { PortfolioItem } from '../api/fetch-portfolio'

interface HoldingRowProps {
  holding: PortfolioItem
  isCurrent?: boolean
}

export default function HoldingRow({ holding, isCurrent = false }: HoldingRowProps) {
  const code = holding.stockCode ?? ''
  const name = holding.stockName ?? code
  const quantity = holding.quantity ?? 0
  const evaluationAmount = Math.trunc(holding.evaluationAmount ?? 0)
  const profitLoss = Math.trunc(holding.profitLoss ?? 0)
  const profitRate = holding.profitRate ?? 0
  const profitColor = profitLoss >= 0 ? 'text-red-500' : 'text-blue-500'

  return (
    <Link
      to={code ? routes.stockDetail(code) : '#'}
      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
        isCurrent ? 'bg-wefin-mint-soft' : 'hover:bg-wefin-bg'
      }`}
    >
      <StockLogo code={code} name={name} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-wefin-text">{name}</span>
          {isCurrent && (
            <span className="rounded-full bg-wefin-mint px-1.5 py-0.5 text-[9px] font-medium text-white">
              현재
            </span>
          )}
        </div>
        <div className="text-xs text-wefin-subtle tabular-nums">{quantity.toLocaleString()}주</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-wefin-text tabular-nums">
          {evaluationAmount.toLocaleString()}원
        </div>
        <div className={`text-xs font-medium tabular-nums ${profitColor}`}>
          {profitLoss >= 0 ? '+' : ''}
          {profitLoss.toLocaleString()} ({profitRate >= 0 ? '+' : ''}
          {profitRate.toFixed(2)}%)
        </div>
      </div>
    </Link>
  )
}
