import { ChevronDown, RefreshCw } from 'lucide-react'
import { useState } from 'react'

import type { ClusterItem } from '../api/fetch-news-clusters'
import { useNewsFeedQuery } from '../model/use-news-feed-query'
import { useNewsFeedStore } from '../model/use-news-feed-store'
import NewsCard from './news-card'
import NewsCategoryTabs from './news-category-tabs'

const PAGE_SIZE = 6
const INITIAL_VISIBLE = 2

export default function NewsFeedSection() {
  const { tab, setTab } = useNewsFeedStore()
  const [cursors, setCursors] = useState<(string | null)[]>([null])
  const [loadedItems, setLoadedItems] = useState<ClusterItem[]>([])
  const [expanded, setExpanded] = useState(false)

  const latestCursor = cursors[cursors.length - 1] ?? null
  const { data, isLoading, isError, isFetching } = useNewsFeedQuery(tab, PAGE_SIZE, latestCursor)

  const currentItems =
    cursors.length === 1 ? (data?.items ?? []) : [...loadedItems, ...(data?.items ?? [])]

  const visibleItems = expanded ? currentItems : currentItems.slice(0, INITIAL_VISIBLE)
  const canExpand = !expanded && currentItems.length > INITIAL_VISIBLE
  const canLoadMore = expanded && data?.hasNext

  function handleTabChange(newTab: typeof tab) {
    setTab(newTab)
    setCursors([null])
    setLoadedItems([])
    setExpanded(false)
  }

  function handleExpand() {
    setExpanded(true)
  }

  function handleLoadMore() {
    if (!data?.hasNext || !data.nextCursor) return
    setLoadedItems(currentItems)
    setCursors((prev) => [...prev, data.nextCursor])
  }

  if (isError) {
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
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: INITIAL_VISIBLE }).map((_, i) => (
            <div key={i} className="h-[140px] animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : !currentItems.length ? (
        <p className="py-12 text-center text-sm text-wefin-subtle">아직 뉴스가 없습니다</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {visibleItems.map((cluster) => (
              <NewsCard key={cluster.clusterId} cluster={cluster} />
            ))}
          </div>

          {(canExpand || canLoadMore) && (
            <div className="flex justify-center pt-3">
              <button
                onClick={canExpand ? handleExpand : handleLoadMore}
                disabled={isFetching}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-wefin-line px-3 py-1.5 text-xs font-medium text-wefin-subtle transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {isFetching ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                뉴스 더보기
              </button>
            </div>
          )}
        </>
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
    <div className="mb-5 flex items-center justify-between">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-wefin-text">이 시각 주요 뉴스</h2>
        <NewsCategoryTabs activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}
