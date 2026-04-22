import type { PortfolioItem } from '../api/fetch-portfolio'
import HoldingRow from './holding-row'

interface HoldingsPanelProps {
  currentStockCode: string
  portfolio: PortfolioItem[] | undefined
  isLoading: boolean
  balance?: number | null
  hideHeader?: boolean
}

export default function HoldingsPanel({
  currentStockCode,
  portfolio,
  isLoading,
  balance,
  hideHeader
}: HoldingsPanelProps) {
  const list = portfolio ?? []
  const sorted = [...list].sort((a, b) => {
    if (a.stockCode === currentStockCode) return -1
    if (b.stockCode === currentStockCode) return 1
    return 0
  })
  const totalEval = Math.trunc(list.reduce((sum, item) => sum + (item.evaluationAmount ?? 0), 0))
  const totalBalance = balance != null ? Math.trunc(balance) + totalEval : null

  return (
    <div>
      {!hideHeader && (
        <div className="flex h-11 items-center justify-between px-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-wefin-text">보유</span>
            {list.length > 0 && (
              <span
                className="text-xs font-bold text-wefin-mint-deep tabular-nums"
                aria-label={`${list.length}종목 보유`}
              >
                {list.length}
              </span>
            )}
          </div>
          {totalBalance != null && (
            <span className="text-xs font-semibold text-wefin-text tabular-nums">
              {totalBalance.toLocaleString()}원
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <p className="py-4 text-center text-xs text-wefin-subtle">불러오는 중...</p>
      ) : list.length === 0 ? (
        <p className="py-4 text-center text-xs text-wefin-subtle">보유 중인 주식이 없어요</p>
      ) : (
        <>
          <div className="divide-y divide-wefin-line">
            {sorted.map((item) => (
              <HoldingRow
                key={item.stockCode ?? item.stockName}
                holding={item}
                isCurrent={item.stockCode === currentStockCode}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
