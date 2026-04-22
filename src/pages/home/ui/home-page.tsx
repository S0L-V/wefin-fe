import { useCallback, useEffect, useRef, useState } from 'react'

import HeroSection from '@/features/market-trends/ui/hero-section'
import MarketTrendsSection from '@/features/market-trends/ui/market-trends-section'
import NewsFeedSection from '@/features/news-feed/ui/news-feed-section'
import NewsListSection from '@/features/news-feed/ui/news-list-section'
import DailyQuestPanel from '@/features/quest/ui/daily-quest-panel'
import RecommendedNewsSection from '@/features/recommended-news/ui/recommended-news-section'
import ResizeHandle from '@/features/stock-detail/ui/resize-handle'
import SeoHead from '@/shared/ui/seo-head'
import HomeSidebar from '@/widgets/home-sidebar/ui/home-sidebar'

const SIDEBAR_WIDTH_STORAGE_KEY = 'home-sidebar-width'
const SIDEBAR_RATIO = 0.22
const MIN_SIDEBAR_WIDTH = 260
const MAX_SIDEBAR_WIDTH = 440

function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 320

    const stored = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)
    if (stored) {
      const parsed = Number(stored)
      if (Number.isFinite(parsed))
        return Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, parsed))
    }

    return Math.max(
      MIN_SIDEBAR_WIDTH,
      Math.min(MAX_SIDEBAR_WIDTH, Math.round(window.innerWidth * SIDEBAR_RATIO))
    )
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
    <div ref={containerRef} className="flex flex-col gap-[var(--gutter)] xl:flex-row">
      <SeoHead path="/" />
      <div className="xl:hidden">
        <DailyQuestPanel />
      </div>
      <section className="min-w-0 flex-1">
        <div className="flex flex-col gap-[var(--gutter)]">
          <HeroSection />
          <NewsFeedSection />
          <div className="card-base overflow-hidden">
            <MarketTrendsSection />
          </div>
          <RecommendedNewsSection />
          <div className="card-base p-[var(--card-pad)]">
            <NewsListSection />
          </div>
        </div>
      </section>
      <div className="hidden px-0.5 xl:flex">
        <ResizeHandle onResize={handleResize} />
      </div>
      <aside
        className="hidden xl:sticky xl:top-[105px] xl:block 2xl:h-[calc(100dvh-140px)] xl:shrink-0 xl:overflow-hidden"
        style={{ width: `${sidebarWidth}px` }}
      >
        <HomeSidebar />
      </aside>
    </div>
  )
}

export default HomePage
