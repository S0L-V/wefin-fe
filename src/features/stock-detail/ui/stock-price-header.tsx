import { Heart, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import MarketIndicesStrip from '@/features/market-indices/ui/market-indices-strip'
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
        {/* 1행: 종목명 + 코드 + 관심 ... 검색 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
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
                  ? 'text-rose-500 hover:text-rose-600'
                  : 'text-wefin-subtle hover:text-rose-400'
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

        {/* 2행: 현재가 + 등락 ... 우측 지수 strip */}
        <div className="flex items-end justify-between gap-8">
          {isLoading ? (
            <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
          ) : price ? (
            <PriceDisplay price={price} />
          ) : null}
          <MarketIndicesStrip />
        </div>

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
  const pillClass = isPositive
    ? 'bg-red-50 text-red-600'
    : isNegative
      ? 'bg-blue-50 text-blue-600'
      : 'bg-wefin-bg text-wefin-subtle'
  const sign = isPositive ? '+' : ''
  const arrow = isPositive ? '▲' : isNegative ? '▼' : ''

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-2xl font-bold text-wefin-text tabular-nums">
        {price.currentPrice.toLocaleString()}원
      </span>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${pillClass}`}
      >
        {arrow && <span className="text-[10px]">{arrow}</span>}
        {sign}
        {price.changePrice.toLocaleString()}원<span className="opacity-70">·</span>
        {sign}
        {price.changeRate.toFixed(2)}%
      </span>
    </div>
  )
}
