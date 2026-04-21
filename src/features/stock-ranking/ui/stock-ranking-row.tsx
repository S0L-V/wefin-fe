import { Heart, TrendingDown, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useToggleWatchlist } from '@/features/watchlist/model/use-watchlist-queries'
import { routes } from '@/shared/config/routes'
import StockLogo from '@/shared/ui/stock-logo'

import type { StockRankingItem } from '../api/fetch-stock-ranking'

interface StockRankingRowProps {
  stock: StockRankingItem
}

function formatTradingValue(won: number): string {
  if (won >= 1_0000_0000_0000) {
    const jo = Math.floor(won / 1_0000_0000_0000)
    const eok = Math.floor((won % 1_0000_0000_0000) / 1_0000_0000)
    return eok > 0 ? `${jo}조 ${eok.toLocaleString()}억원` : `${jo}조원`
  }
  if (won >= 1_0000_0000) return `${(won / 1_0000_0000).toFixed(0)}억원`
  if (won >= 1_0000) return `${(won / 1_0000).toFixed(0)}만원`
  return `${won.toLocaleString()}원`
}

export default function StockRankingRow({ stock }: StockRankingRowProps) {
  const navigate = useNavigate()
  const { isWatchlisted, toggle, isPending } = useToggleWatchlist(stock.stockCode, stock.stockName)

  const isUp = stock.changeRate > 0
  const isDown = stock.changeRate < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : null
  const rateTextColor = isUp ? 'text-wefin-red' : isDown ? 'text-wefin-blue' : 'text-wefin-subtle'
  const rateBgColor = isUp ? 'bg-wefin-red-soft' : isDown ? 'bg-wefin-surface-2' : 'bg-transparent'
  const signedChangeAmount = `${stock.changeAmount >= 0 ? '+' : ''}${Math.trunc(stock.changeAmount).toLocaleString()}`
  const tradingValue = stock.currentPrice * stock.volume

  const handleRowClick = () => navigate(routes.stockDetail(stock.stockCode))
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggle()
  }

  return (
    <div
      onClick={handleRowClick}
      className="flex cursor-pointer items-center px-4 py-3 transition-colors hover:bg-wefin-bg sm:px-5 sm:py-3 xl:px-7 xl:py-4"
    >
      <button
        type="button"
        onClick={handleHeartClick}
        disabled={isPending}
        className={`mr-2 hidden rounded-md p-1 transition-colors sm:block ${
          isWatchlisted
            ? 'text-rose-500 hover:text-rose-600'
            : 'text-wefin-subtle hover:text-rose-400'
        } ${isPending ? 'opacity-50' : ''}`}
        aria-label={isWatchlisted ? '관심종목 해제' : '관심종목 추가'}
      >
        <Heart className={`h-4 w-4 ${isWatchlisted ? 'fill-current' : ''}`} />
      </button>
      <div className="w-7 text-[13px] font-extrabold text-wefin-text sm:w-7 sm:text-[13px] xl:w-9 xl:text-[15px]">
        {stock.rank}
      </div>
      <div className="mr-2 hidden sm:mr-2.5 sm:block xl:mr-3">
        <StockLogo code={stock.stockCode} name={stock.stockName} size={28} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-semibold text-wefin-text sm:text-[13px] xl:text-[14.5px]">
          {stock.stockName}
        </span>
        <span className="hidden text-[11px] text-wefin-subtle sm:block xl:text-[12px]">
          {stock.stockCode}
        </span>
      </div>
      <div className="flex w-auto flex-col items-end sm:w-28 xl:w-36">
        <span className="font-num text-[13px] font-bold text-wefin-text tabular-nums sm:text-[13px] xl:text-[15px]">
          {stock.currentPrice.toLocaleString()}원
        </span>
        <span
          className={`font-num hidden text-[11px] font-medium sm:block xl:text-[12.5px] ${rateTextColor} tabular-nums`}
        >
          {signedChangeAmount}원
        </span>
      </div>
      <div className="ml-2 flex w-auto justify-end sm:ml-0 sm:w-24 xl:w-32">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums sm:text-[12px] xl:gap-1.5 xl:rounded-lg xl:px-2.5 xl:py-1 xl:text-[13.5px] ${rateTextColor} ${rateBgColor}`}
        >
          {TrendIcon && <TrendIcon className="h-3 w-3 xl:h-3.5 xl:w-3.5" />}
          {isUp ? '+' : ''}
          {stock.changeRate.toFixed(2)}%
        </span>
      </div>
      <div className="font-num ml-2 w-auto text-right text-[11px] font-semibold text-wefin-text tabular-nums sm:ml-0 sm:w-28 sm:text-[12px] xl:w-36 xl:text-[13.5px]">
        {formatTradingValue(tradingValue)}
      </div>
      <div className="font-num hidden w-28 text-right text-[12px] text-wefin-subtle tabular-nums sm:block xl:w-36 xl:text-[13.5px]">
        {stock.volume.toLocaleString()}
      </div>
    </div>
  )
}
