import { ChevronDown, RefreshCw } from 'lucide-react'
import { useState } from 'react'

import type { ClusterItem } from '../api/fetch-news-clusters'
import type { PopularTag } from '../api/fetch-popular-tags'
import { useFilteredFeedQuery } from '../model/use-filtered-feed-query'
import { usePopularTagsQuery } from '../model/use-popular-tags-query'
import type { FilterMode } from './news-filter-bar'
import NewsFilterBar from './news-filter-bar'
import NewsListCard from './news-list-card'

const PAGE_SIZE = 10

export default function NewsListSection() {
  const [mode, setMode] = useState<FilterMode>('ALL')
  const [selectedTags, setSelectedTags] = useState<PopularTag[]>([])
  const [cursors, setCursors] = useState<(string | null)[]>([null])
  const [loadedItems, setLoadedItems] = useState<ClusterItem[]>([])

  const { data: sectorTags = [] } = usePopularTagsQuery('SECTOR')
  const { data: stockTags = [] } = usePopularTagsQuery('STOCK')

  const latestCursor = cursors[cursors.length - 1] ?? null
  const feedParams = {
    size: PAGE_SIZE,
    cursor: latestCursor,
    ...(selectedTags.length > 0 && mode !== 'ALL'
      ? { tagType: mode as 'SECTOR' | 'STOCK', tagCodes: selectedTags.map((t) => t.code) }
      : {})
  }

  const { data, isLoading, isFetching, isPlaceholderData } = useFilteredFeedQuery(feedParams)

  const currentItems =
    cursors.length === 1
      ? (data?.items ?? [])
      : [...loadedItems, ...(isPlaceholderData ? [] : (data?.items ?? []))]

  function handleModeChange(newMode: FilterMode) {
    setMode(newMode)
    setSelectedTags([])
    resetPagination()
  }

  function handleTagsChange(tags: PopularTag[]) {
    setSelectedTags(tags)
    resetPagination()
  }

  function resetPagination() {
    setCursors([null])
    setLoadedItems([])
  }

  function handleLoadMore() {
    if (!data?.hasNext || !data.nextCursor) return
    setLoadedItems(currentItems)
    setCursors((prev) => [...prev, data.nextCursor])
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <NewsFilterBar
        mode={mode}
        onModeChange={handleModeChange}
        selectedTags={selectedTags}
        onTagsChange={handleTagsChange}
        sectorTags={sectorTags}
        stockTags={stockTags}
      />

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-5 py-5">
                <div className="h-[140px] w-[220px] shrink-0 animate-pulse rounded-xl bg-gray-100" />
                <div className="flex flex-1 flex-col gap-3">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : !currentItems.length ? (
          <p className="py-16 text-center text-sm text-wefin-subtle">뉴스가 없습니다</p>
        ) : (
          <>
            <div>
              {currentItems.map((cluster) => (
                <NewsListCard key={cluster.clusterId} cluster={cluster} />
              ))}
            </div>

            {data?.hasNext && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-wefin-line px-3 py-1.5 text-xs font-medium text-wefin-subtle transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  {isFetching ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  더보기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
