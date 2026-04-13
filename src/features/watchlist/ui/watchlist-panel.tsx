import { useNavigate } from 'react-router-dom'

import { type WatchlistItem } from '@/features/watchlist/api/fetch-watchlist'
import { useWatchlistQuery } from '@/features/watchlist/model/use-watchlist-queries'
import { routes } from '@/shared/config/routes'

export default function WatchlistPanel() {
  const { data: items, isLoading } = useWatchlistQuery()

  if (isLoading) {
    return (
      <div className="space-y-3 p-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return <div className="p-4 text-center text-xs text-gray-400">관심 종목이 없습니다.</div>
  }

  return (
    <div className="scrollbar-thin space-y-1 overflow-y-auto p-2">
      {items.map((item) => (
        <WatchlistRow key={item.stockCode} item={item} />
      ))}
    </div>
  )
}

function WatchlistRow({ item }: { item: WatchlistItem }) {
  const navigate = useNavigate()
  const isPositive = item.changeRate > 0
  const isNegative = item.changeRate < 0
  const colorClass = isPositive ? 'text-red-500' : isNegative ? 'text-blue-500' : 'text-gray-600'
  const sign = isPositive ? '+' : ''

  return (
    <button
      onClick={() => navigate(routes.stockDetail(item.stockCode))}
      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-gray-50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-wefin-text">{item.stockName}</p>
        <p className="text-xs text-wefin-subtle">{item.stockCode}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-wefin-text">
          {item.currentPrice.toLocaleString()}원
        </p>
        <p className={`text-xs font-medium ${colorClass}`}>
          {sign}
          {item.changeRate.toFixed(2)}%
        </p>
      </div>
    </button>
  )
}
