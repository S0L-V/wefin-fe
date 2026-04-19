import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { PopularTag } from '../api/fetch-popular-tags'
import { useFilteredFeedQuery } from '../model/use-filtered-feed-query'
import { useNewsListStore } from '../model/use-news-list-store'
import { usePopularTagsQuery } from '../model/use-popular-tags-query'
import type { FilterMode } from './news-filter-bar'
import NewsFilterBar from './news-filter-bar'
import NewsListCard from './news-list-card'

const PAGE_SIZE = 5

export default function NewsListSection() {
  const mode = useNewsListStore((s) => s.mode)
  const selectedTags = useNewsListStore((s) => s.selectedTags)
  const setMode = useNewsListStore((s) => s.setMode)
  const setSelectedTags = useNewsListStore((s) => s.setSelectedTags)
  const resetPagination = useNewsListStore((s) => s.resetPagination)

  const [pageIndex, setPageIndex] = useState(0)
  const [cursorHistory, setCursorHistory] = useState<(number | null)[]>([null])

  const { data: sectorTags = [] } = usePopularTagsQuery('SECTOR')
  const { data: stockTags = [] } = usePopularTagsQuery('STOCK')

  const currentCursor = cursorHistory[pageIndex] ?? null
  const tagCodesKey = selectedTags.map((t) => t.code).join(',')
  const feedParams = useMemo(
    () => ({
      size: PAGE_SIZE,
      cursor: currentCursor,
      ...(tagCodesKey && mode !== 'ALL'
        ? { tagType: mode as 'SECTOR' | 'STOCK', tagCodes: tagCodesKey.split(',') }
        : {})
    }),
    [currentCursor, mode, tagCodesKey]
  )

  const { data, isLoading, isError, isPlaceholderData } = useFilteredFeedQuery(feedParams)

  const items = isPlaceholderData ? [] : (data?.items ?? [])
  const hasNext = data?.hasNext ?? false
  const totalPages = cursorHistory.length + (hasNext ? 1 : 0)

  function handleModeChange(newMode: FilterMode) {
    setMode(newMode)
    setSelectedTags([])
    resetPagination()
    setPageIndex(0)
    setCursorHistory([null])
  }

  function handleTagsChange(tags: PopularTag[]) {
    setSelectedTags(tags)
    resetPagination()
    setPageIndex(0)
    setCursorHistory([null])
  }

  function handleNext() {
    if (hasNext && data?.nextCursor) {
      const nextPage = pageIndex + 1
      if (nextPage >= cursorHistory.length) {
        setCursorHistory((prev) => [...prev, data.nextCursor])
      }
      setPageIndex(nextPage)
    } else if (cursorHistory.length > 1) {
      setPageIndex(0)
    }
  }

  function handlePrev() {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1)
    } else if (cursorHistory.length > 1) {
      setPageIndex(cursorHistory.length - 1)
    }
  }

  return (
    <div>
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
          <div className="space-y-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-2xl p-3">
                <div className="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-gray-100" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : isError && items.length === 0 ? (
          <p className="py-16 text-center text-sm text-wefin-subtle">뉴스를 불러오지 못했습니다</p>
        ) : !items.length ? (
          <p className="py-16 text-center text-sm text-wefin-subtle">뉴스가 없습니다</p>
        ) : (
          <>
            <div>
              {items.map((cluster) => (
                <NewsListCard key={cluster.clusterId} cluster={cluster} />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={pageIndex === 0}
                aria-label="이전 페이지"
                className="flex h-7 w-7 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-bg hover:text-wefin-text disabled:cursor-not-allowed disabled:text-wefin-line"
              >
                <ChevronLeft size={14} />
              </button>
              {[pageIndex - 1, pageIndex, pageIndex + 1].map((i) => (
                <span key={i} className="flex h-7 w-7 items-center justify-center">
                  {i >= 0 && i < totalPages ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (i < cursorHistory.length) setPageIndex(i)
                        else if (i === cursorHistory.length) handleNext()
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-all ${
                        i === pageIndex
                          ? 'bg-wefin-mint-deep text-white'
                          : i < cursorHistory.length
                            ? 'text-wefin-subtle hover:bg-wefin-bg hover:text-wefin-text'
                            : 'text-wefin-line hover:text-wefin-subtle'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ) : null}
                </span>
              ))}
              <button
                type="button"
                onClick={handleNext}
                disabled={!hasNext && pageIndex >= totalPages - 1}
                aria-label="다음 페이지"
                className="flex h-7 w-7 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-bg hover:text-wefin-text disabled:cursor-not-allowed disabled:text-wefin-line"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
