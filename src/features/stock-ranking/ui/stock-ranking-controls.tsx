import { Search } from 'lucide-react'

import SegmentedTabs from '@/shared/ui/segmented-tabs'

import { RANKING_TABS, type RankingTab } from '../lib/ranking-data'

interface StockRankingControlsProps {
  activeTab: RankingTab
  onTabChange: (tab: RankingTab) => void
  onSearchClick: () => void
}

export default function StockRankingControls({
  activeTab,
  onTabChange,
  onSearchClick
}: StockRankingControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-wefin-text">실시간 거래 랭킹</h1>
        <button
          onClick={onSearchClick}
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
      <SegmentedTabs items={RANKING_TABS} activeKey={activeTab} onChange={onTabChange} size="md" />
    </div>
  )
}
