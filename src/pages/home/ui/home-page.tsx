import { useCallback, useEffect, useRef, useState } from 'react'

import MarketTrendsSection from '@/features/market-trends/ui/market-trends-section'
import NewsFeedSection from '@/features/news-feed/ui/news-feed-section'
import NewsListSection from '@/features/news-feed/ui/news-list-section'
import ResizeHandle from '@/features/stock-detail/ui/resize-handle'
import RecommendedNewsSection from '@/features/recommended-news/ui/recommended-news-section'

import HomeSidebar from '@/widgets/home-sidebar/ui/home-sidebar'

const SIDEBAR_WIDTH_STORAGE_KEY = 'home-sidebar-width'
const DEFAULT_SIDEBAR_WIDTH = 380
const MIN_SIDEBAR_WIDTH = 340
const MAX_SIDEBAR_WIDTH = 520

function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_SIDEBAR_WIDTH
    }

    const stored = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)
    if (!stored) {
      return DEFAULT_SIDEBAR_WIDTH
    }

    const parsed = Number(stored)
    return Number.isFinite(parsed) ? parsed : DEFAULT_SIDEBAR_WIDTH
  })

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth))
  }, [sidebarWidth])

  const handleResize = useCallback((delta: number) => {
    setSidebarWidth((prev) => {
      const container = containerRef.current
      if (!container) return prev

      const containerWidth = container.getBoundingClientRect().width
      const next = prev - delta
      const maxAllowed = Math.min(MAX_SIDEBAR_WIDTH, containerWidth - 520)

      return Math.max(MIN_SIDEBAR_WIDTH, Math.min(maxAllowed, next))
    })
  }, [])

  return (
    <div ref={containerRef} className="flex flex-col gap-2 lg:flex-row lg:gap-0">
      <section className="min-w-0 flex-1">
        <div className="flex flex-col gap-2">
          <div className="rounded-xl border border-wefin-line bg-white p-4 shadow-sm">
            <NewsFeedSection />
          </div>
          <div className="rounded-xl border border-wefin-line bg-white p-4 shadow-sm">
            <MarketTrendsSection />
          </div>
          <RecommendedNewsSection />
          <div className="rounded-xl border border-wefin-line bg-white p-4 shadow-sm">
            <NewsListSection />
          </div>
        </div>
      </section>
      <div className="hidden px-0.5 lg:flex">
        <ResizeHandle onResize={handleResize} />
      </div>
      <aside
        className="lg:sticky lg:top-[76px] lg:h-[calc(100vh-92px)] lg:shrink-0"
        style={{ width: `${sidebarWidth}px` }}
      >
        <HomeSidebar />
      </aside>
    </div>
  )

}

export default HomePage
