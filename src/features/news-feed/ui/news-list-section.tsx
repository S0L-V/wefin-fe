import { ChevronDown, RefreshCw } from 'lucide-react'
import { useMemo } from 'react'

import type { PopularTag } from '../api/fetch-popular-tags'
import { useFilteredFeedQuery } from '../model/use-filtered-feed-query'
import { useNewsListStore } from '../model/use-news-list-store'
import { usePopularTagsQuery } from '../model/use-popular-tags-query'
import type { FilterMode } from './news-filter-bar'
import NewsFilterBar from './news-filter-bar'
import NewsListCard from './news-list-card'

const PAGE_SIZE = 10

export default function NewsListSection() {
  const mode = useNewsListStore((s) => s.mode)
  const selectedTags = useNewsListStore((s) => s.selectedTags)
  const cursors = useNewsListStore((s) => s.cursors)
  const loadedItems = useNewsListStore((s) => s.loadedItems)
  const setMode = useNewsListStore((s) => s.setMode)
  const setSelectedTags = useNewsListStore((s) => s.setSelectedTags)
  const setCursors = useNewsListStore((s) => s.setCursors)
  const setLoadedItems = useNewsListStore((s) => s.setLoadedItems)
  const resetPagination = useNewsListStore((s) => s.resetPagination)

  const { data: sectorTags = [] } = usePopularTagsQuery('SECTOR')
  const { data: stockTags = [] } = usePopularTagsQuery('STOCK')

  const latestCursor = cursors[cursors.length - 1] ?? null
  const tagCodesKey = selectedTags.map((t) => t.code).join(',')
  const feedParams = useMemo(
    () => ({
      size: PAGE_SIZE,
      cursor: latestCursor,
      ...(tagCodesKey && mode !== 'ALL'
        ? { tagType: mode as 'SECTOR' | 'STOCK', tagCodes: tagCodesKey.split(',') }
        : {})
    }),
    [latestCursor, mode, tagCodesKey]
  )

  const { data, isLoading, isError, isFetching, isPlaceholderData } =
    useFilteredFeedQuery(feedParams)

  const freshItems = isPlaceholderData ? [] : (data?.items ?? [])
  const currentItems = cursors.length === 1 ? freshItems : [...loadedItems, ...freshItems]

  function handleModeChange(newMode: FilterMode) {
    setMode(newMode)
    setSelectedTags([])
    resetPagination()
  }

  function handleTagsChange(tags: PopularTag[]) {
    setSelectedTags(tags)
    resetPagination()
  }

  function handleLoadMore() {
    if (!data?.hasNext || !data.nextCursor) return
    const nextCursor = data.nextCursor
    setLoadedItems(currentItems)
    setCursors((prev) => [...prev, nextCursor])
  }

  return (
    <div className="mt-6 border-t border-wefin-line pt-6">
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
        ) : isError && currentItems.length === 0 ? (
          <p className="py-16 text-center text-sm text-wefin-subtle">뉴스를 불러오지 못했습니다</p>
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
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-wefin-line px-3 py-1.5 text-xs font-medium text-wefin-subtle transition-colors hover:bg-wefin-bg disabled:opacity-50"
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
