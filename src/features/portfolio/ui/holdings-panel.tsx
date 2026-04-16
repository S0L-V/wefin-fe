import type { PortfolioItem } from '../api/fetch-portfolio'
import HoldingRow from './holding-row'

interface HoldingsPanelProps {
  currentStockCode: string
  portfolio: PortfolioItem[] | undefined
  isLoading: boolean
}

export default function HoldingsPanel({
  currentStockCode,
  portfolio,
  isLoading
}: HoldingsPanelProps) {
  const list = portfolio ?? []
  const sorted = [...list].sort((a, b) => {
    if (a.stockCode === currentStockCode) return -1
    if (b.stockCode === currentStockCode) return 1
    return 0
  })
  const hasCurrent = list.some((item) => item.stockCode === currentStockCode)

  return (
    <div>
      <div className="flex h-11 items-center justify-between border-b border-wefin-line px-3">
        <span className="text-sm font-semibold text-wefin-text">내 보유</span>
        {list.length > 0 && <span className="text-xs text-wefin-subtle">{list.length}종목</span>}
      </div>

      {isLoading ? (
        <p className="py-4 text-center text-xs text-wefin-subtle">불러오는 중...</p>
      ) : list.length === 0 ? (
        <p className="py-4 text-center text-xs text-wefin-subtle">보유 중인 주식이 없어요</p>
      ) : (
        <>
          {!hasCurrent && (
            <p className="border-b border-wefin-line px-3 py-2 text-xs text-wefin-subtle">
              이 종목은 보유하고 있지 않아요
            </p>
          )}
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
