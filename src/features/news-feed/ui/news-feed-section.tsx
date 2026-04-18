import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'

import { useNewsFeedQuery } from '../model/use-news-feed-query'
import { useNewsFeedStore } from '../model/use-news-feed-store'
import NewsCard from './news-card'
import NewsCategoryTabs from './news-category-tabs'

const PAGE_SIZE = 6

export default function NewsFeedSection() {
  const tab = useNewsFeedStore((s) => s.tab)
  const cursors = useNewsFeedStore((s) => s.cursors)
  const loadedItems = useNewsFeedStore((s) => s.loadedItems)
  const setTab = useNewsFeedStore((s) => s.setTab)
  const resetPagination = useNewsFeedStore((s) => s.resetPagination)

  const latestCursor = cursors[cursors.length - 1] ?? null
  const { data, isLoading, isError, isPlaceholderData } = useNewsFeedQuery(
    tab,
    PAGE_SIZE,
    latestCursor
  )

  const freshItems = isPlaceholderData ? [] : (data?.items ?? [])
  const currentItems = cursors.length === 1 ? freshItems : [...loadedItems, ...freshItems]

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const hasMultipleCards = currentItems.length > 2

  function updateScrollState() {
    const el = scrollRef.current
    if (!el) return
    const hasOverflow = el.scrollWidth > el.clientWidth + 4
    setCanScrollLeft(hasOverflow && el.scrollLeft > 4)
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  function handleTabChange(newTab: typeof tab) {
    setTab(newTab)
    resetPagination()
  }

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.clientWidth * 0.52
    el.scrollBy({ left: dir === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' })
  }

  if (isError && currentItems.length === 0) {
    return (
      <div>
        <SectionHeader activeTab={tab} onTabChange={handleTabChange} />
        <p className="py-12 text-center text-sm text-wefin-subtle">뉴스를 불러오지 못했습니다</p>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader activeTab={tab} onTabChange={handleTabChange} />

      {isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[160px] w-[48%] shrink-0 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : !currentItems.length ? (
        <p className="py-12 text-center text-sm text-wefin-subtle">아직 뉴스가 없습니다</p>
      ) : (
        <div className="group/carousel relative">
          <div
            ref={(el) => {
              ;(scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el
              if (el) {
                const hasOverflow = el.scrollWidth > el.clientWidth + 4
                setCanScrollRight(hasOverflow)
              }
            }}
            onScroll={updateScrollState}
            className="flex gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {currentItems.map((cluster) => (
              <div key={cluster.clusterId} className="w-[48%] shrink-0">
                <NewsCard cluster={cluster} />
              </div>
            ))}
          </div>
          {hasMultipleCards && canScrollLeft && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
              <button
                type="button"
                onClick={() => scroll('left')}
                className="absolute -left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-wefin-line bg-white text-wefin-text shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
          {hasMultipleCards && canScrollRight && (
            <>
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
              <button
                type="button"
                onClick={() => scroll('right')}
                className="absolute -right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-wefin-line bg-white text-wefin-text shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function SectionHeader({
  activeTab,
  onTabChange
}: {
  activeTab: Parameters<typeof NewsCategoryTabs>[0]['activeTab']
  onTabChange: Parameters<typeof NewsCategoryTabs>[0]['onTabChange']
}) {
  return (
    <div className="mb-5 flex flex-col gap-3">
      <h2 className="text-lg font-bold text-wefin-text">이 시각 주요 뉴스</h2>
      <NewsCategoryTabs activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
