import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import SourceBadge from '@/shared/ui/source-badge'

import type { ClusterItem } from '../api/fetch-news-clusters'
import type { PopularTag } from '../api/fetch-popular-tags'
import { getTimeAgo } from '../lib/get-time-ago'
import { useFilteredFeedQuery } from '../model/use-filtered-feed-query'
import { useNewsListStore } from '../model/use-news-list-store'
import { usePopularTagsQuery } from '../model/use-popular-tags-query'
import type { FilterMode } from './news-filter-bar'
import NewsFilterBar from './news-filter-bar'

const PAGE_SIZE = 5

export default function NewsListSection() {
  const mode = useNewsListStore((s) => s.mode)
  const selectedTags = useNewsListStore((s) => s.selectedTags)
  const setMode = useNewsListStore((s) => s.setMode)
  const setSelectedTags = useNewsListStore((s) => s.setSelectedTags)
  const resetPagination = useNewsListStore((s) => s.resetPagination)

  const [pageIndex, setPageIndex] = useState(0)
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null])

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
    }
  }

  function handlePrev() {
    if (pageIndex > 0) setPageIndex(pageIndex - 1)
  }

  function goToPage(i: number) {
    if (i < cursorHistory.length) setPageIndex(i)
    else if (i === cursorHistory.length && hasNext) handleNext()
  }

  return (
    <div id="news-list-section">
      <NewsFilterBar
        mode={mode}
        onModeChange={handleModeChange}
        selectedTags={selectedTags}
        onTagsChange={handleTagsChange}
        sectorTags={sectorTags}
        stockTags={stockTags}
      />

      <div className="mt-2">
        {isLoading ? (
          <div>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-wefin-line p-4">
                <div className="h-6 w-11 animate-pulse rounded bg-wefin-surface-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-wefin-surface-2" />
                  <div className="h-4 w-full animate-pulse rounded bg-wefin-surface-2" />
                </div>
                <div className="h-[104px] w-[180px] animate-pulse rounded-xl bg-wefin-surface-2" />
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
              {items.map((cluster, i) => (
                <NewsListItem
                  key={cluster.clusterId}
                  cluster={cluster}
                  isHot={i < 2 && pageIndex === 0}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 pb-1.5 pt-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={pageIndex === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-wefin-subtle transition-colors hover:bg-wefin-surface-2 hover:text-wefin-text disabled:text-wefin-line"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToPage(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-num text-[13px] font-bold transition-colors ${
                    i === pageIndex
                      ? 'bg-wefin-text text-white'
                      : 'text-wefin-subtle hover:bg-wefin-surface-2 hover:text-wefin-text'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={handleNext}
                disabled={!hasNext}
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-wefin-subtle transition-colors hover:bg-wefin-surface-2 hover:text-wefin-text disabled:text-wefin-line"
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

function NewsListItem({ cluster, isHot }: { cluster: ClusterItem; isHot: boolean }) {
  return (
    <Link
      to={`/news/${cluster.clusterId}`}
      className="group grid grid-cols-1 items-center gap-3 border-b border-wefin-line px-1 py-4 transition-all hover:translate-x-0.5 hover:rounded-xl hover:bg-wefin-surface-2 sm:grid-cols-[1fr_180px] sm:gap-4"
    >
      <div>
        {isHot && (
          <div className="mb-1">
            <span className="inline-flex items-center rounded-md bg-wefin-red-soft px-2 py-0.5 text-[11px] font-bold tracking-wide text-wefin-red">
              HOT
            </span>
          </div>
        )}
        <h4 className="text-base font-bold leading-snug">{cluster.title}</h4>
        <p className="mt-1 line-clamp-1 text-[13px] leading-relaxed text-wefin-subtle">
          {cluster.summary}
        </p>
        <div className="mt-2 flex items-center gap-2.5 text-xs text-wefin-muted">
          <span>{getTimeAgo(cluster.publishedAt)}</span>
          <SourceBadge sources={cluster.sources} sourceCount={cluster.sourceCount} />
        </div>
      </div>

      <div className="hidden h-[104px] w-[180px] overflow-hidden rounded-xl bg-wefin-surface-2 sm:block">
        {cluster.thumbnailUrl ? (
          <img src={cluster.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Layers size={20} className="text-wefin-muted" />
          </div>
        )}
      </div>
    </Link>
  )
}
