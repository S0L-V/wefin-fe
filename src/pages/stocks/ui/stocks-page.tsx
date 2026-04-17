import { useEffect, useState } from 'react'

import type { RankingTab } from '@/features/stock-ranking/lib/ranking-data'
import StockRankingControls from '@/features/stock-ranking/ui/stock-ranking-controls'
import StockRankingTable from '@/features/stock-ranking/ui/stock-ranking-table'
import StockSearchModal from '@/features/stock-search/ui/stock-search-modal'
import StockLayout from '@/widgets/stock-layout/ui/stock-layout'

function StocksPage() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<RankingTab>('amount')

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
    <StockLayout>
      <div className="flex h-[calc(100vh-80px)] flex-col gap-2">
        <div className="shrink-0 rounded-xl border border-wefin-line bg-white p-5 shadow-sm">
          <StockRankingControls
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSearchClick={() => setSearchOpen(true)}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-wefin-line bg-white shadow-sm">
          <StockRankingTable activeTab={activeTab} />
        </div>
      </div>

      <StockSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </StockLayout>
  )
}

export default StocksPage
