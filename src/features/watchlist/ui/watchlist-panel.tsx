import { TrendingDown, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { type WatchlistItem } from '@/features/watchlist/api/fetch-watchlist'
import { useWatchlistQuery } from '@/features/watchlist/model/use-watchlist-queries'
import { routes } from '@/shared/config/routes'
import StockLogo from '@/shared/ui/stock-logo'

export default function WatchlistPanel() {
  const { data: items, isLoading, isError, refetch } = useWatchlistQuery()

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-wefin-surface-2" />
        ))}
      </div>
    )
  }

  if (isError) {
    const loggedIn = !!localStorage.getItem('accessToken')
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-xs text-wefin-subtle">
          {loggedIn ? '관심 종목을 불러오지 못했습니다.' : '로그인 후 관심 종목을 관리할 수 있어요'}
        </p>
        {loggedIn && (
          <button
            onClick={() => refetch()}
            className="mt-2 text-xs font-medium text-wefin-mint hover:underline"
          >
            다시 시도
          </button>
        )}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-xs text-wefin-subtle">관심 종목이 없습니다.</p>
        <p className="mt-1 text-[11px] text-wefin-subtle">
          종목 페이지에서 하트를 눌러 추가해보세요.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-wefin-line overflow-y-auto scrollbar-thin">
      {items.map((item) => (
        <WatchlistRow key={item.stockCode} item={item} />
      ))}
    </div>
  )
}

function WatchlistRow({ item }: { item: WatchlistItem }) {
  const navigate = useNavigate()
  const isUp = item.changeRate > 0
  const isDown = item.changeRate < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : null
  const rateColor = isUp ? 'text-wefin-red' : isDown ? 'text-wefin-blue' : 'text-wefin-subtle'
  const sign = isUp ? '+' : ''

  return (
    <button
      onClick={() => navigate(routes.stockDetail(item.stockCode))}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-wefin-bg"
    >
      <StockLogo code={item.stockCode} name={item.stockName || item.stockCode} size={32} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-wefin-text">
          {item.stockName || item.stockCode}
        </p>
        <p className="text-[11px] text-wefin-subtle">{item.stockCode}</p>
      </div>
      <div className="text-right">
        <p className="font-num text-[14px] font-bold text-wefin-text tabular-nums">
          {item.currentPrice.toLocaleString()}원
        </p>
        <p
          className={`flex items-center justify-end gap-0.5 text-[12px] font-semibold ${rateColor} tabular-nums`}
        >
          {TrendIcon && <TrendIcon className="h-3 w-3" />}
          {sign}
          {item.changeRate.toFixed(2)}%
        </p>
      </div>
    </button>
  )
}
