import { useState } from 'react'

import StockRankingTable from '@/features/stock-ranking/ui/stock-ranking-table'
import StockSearchModal from '@/features/stock-search/ui/stock-search-modal'
import StockLayout from '@/widgets/stock-layout/ui/stock-layout'

function StocksPage() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <StockLayout>
      <section className="h-[calc(100vh-80px)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm scrollbar-thin">
        <StockRankingTable onSearchClick={() => setSearchOpen(true)} />
      </section>

      <StockSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </StockLayout>
  )
}

export default StocksPage
