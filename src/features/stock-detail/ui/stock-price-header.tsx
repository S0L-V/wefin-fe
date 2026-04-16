import { ChevronLeft, Heart, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { PriceData } from '@/features/stock-detail/api/fetch-stock-detail'
import {
  useStockInfoQuery,
  useStockPriceQuery
} from '@/features/stock-detail/model/use-stock-detail-queries'
import StockSearchModal from '@/features/stock-search/ui/stock-search-modal'
import { useToggleWatchlist } from '@/features/watchlist/model/use-watchlist-queries'
import SegmentedTabs, { type SegmentedTabItem } from '@/shared/ui/segmented-tabs'
import StockLogo from '@/shared/ui/stock-logo'

export type DetailTab = 'chart' | 'info' | 'news'

interface StockPriceHeaderProps {
  code: string
  activeTab: DetailTab
  onTabChange: (tab: DetailTab) => void
}

const tabs: SegmentedTabItem<DetailTab>[] = [
  { key: 'chart', label: '차트·호가' },
  { key: 'info', label: '종목정보' },
  { key: 'news', label: '뉴스·공시' }
]

export default function StockPriceHeader({ code, activeTab, onTabChange }: StockPriceHeaderProps) {
  const navigate = useNavigate()
  const { data: stockInfo } = useStockInfoQuery(code)
  const { data: price, isLoading } = useStockPriceQuery(code)
  const [searchOpen, setSearchOpen] = useState(false)
  const { isWatchlisted, toggle, isPending } = useToggleWatchlist(code)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== '/') return
      const target = e.target as HTMLElement | null
      if (target?.matches('input, textarea, [contenteditable="true"]')) return
      e.preventDefault()
      setSearchOpen(true)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <div className="space-y-1.5">
        {/* 1행: 뒤로가기 + 종목명 + 코드 + 관심 ... 검색 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(-1)}
              className="rounded-md p-0.5 text-wefin-subtle transition-colors hover:bg-gray-100 hover:text-wefin-subtle"
              aria-label="뒤로가기"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {isLoading ? (
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            ) : (
              <>
                <StockLogo code={code} name={stockInfo?.stockName ?? code} size={28} />
                <h1 className="text-base font-bold text-wefin-text">
                  {stockInfo?.stockName ?? code}
                </h1>
                <span className="text-xs text-wefin-subtle">{code}</span>
              </>
            )}

            <button
              onClick={toggle}
              disabled={isPending}
              className={`rounded-md p-0.5 transition-colors ${
                isWatchlisted
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-wefin-subtle hover:text-red-400'
              } ${isPending ? 'opacity-50' : ''}`}
              aria-label={isWatchlisted ? '관심종목 해제' : '관심종목 추가'}
              aria-pressed={isWatchlisted}
            >
              <Heart className={`h-4 w-4 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-60 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-wefin-subtle transition-colors hover:bg-gray-200"
          >
            <Search className="h-4 w-4" />
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-wefin-line bg-white px-1.5 font-mono text-xs text-wefin-subtle">
                /
              </kbd>
              를 눌러 검색하세요
            </span>
          </button>
        </div>

        {/* 2행: 현재가 + 등락 */}
        {isLoading ? (
          <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
        ) : price ? (
          <PriceDisplay price={price} />
        ) : null}

        {/* 3행: 탭 */}
        <div>
          <SegmentedTabs items={tabs} activeKey={activeTab} onChange={onTabChange} />
        </div>
      </div>

      <StockSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function PriceDisplay({ price }: { price: PriceData }) {
  const isPositive = price.changePrice > 0
  const isNegative = price.changePrice < 0
  const colorClass = isPositive
    ? 'text-red-500'
    : isNegative
      ? 'text-blue-500'
      : 'text-wefin-subtle'
  const sign = isPositive ? '+' : ''

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-wefin-text">
        {price.currentPrice.toLocaleString()}원
      </span>
      <span className={`flex items-center gap-0.5 text-xs font-medium ${colorClass}`}>
        {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
        {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
        {sign}
        {price.changePrice.toLocaleString()}원 ({sign}
        {price.changeRate.toFixed(2)}%)
      </span>
    </div>
  )
}
