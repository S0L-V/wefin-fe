import { ChevronRight, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

import SourceBadge from '@/shared/ui/source-badge'

import type { ClusterItem, ClusterTab } from '../api/fetch-news-clusters'
import { getTimeAgo } from '../lib/get-time-ago'
import { useNewsFeedQuery } from '../model/use-news-feed-query'
import { useNewsFeedStore } from '../model/use-news-feed-store'

const PAGE_SIZE = 6

const TABS: { value: ClusterTab; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'FINANCE', label: '경제' },
  { value: 'TECH', label: 'IT/과학' },
  { value: 'INDUSTRY', label: '산업' },
  { value: 'ENERGY', label: '에너지' },
  { value: 'BIO', label: '바이오' },
  { value: 'CRYPTO', label: '암호화폐' }
]

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
  const displayItems = currentItems.slice(0, 3)

  function handleTabChange(newTab: ClusterTab) {
    setTab(newTab)
    resetPagination()
  }

  function scrollToNewsList() {
    const el = document.getElementById('news-list-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-wefin-text sm:text-lg">이 시각 주요 뉴스</h2>
          <button
            type="button"
            onClick={scrollToNewsList}
            className="flex items-center gap-0.5 text-xs font-medium text-wefin-subtle transition-colors hover:text-wefin-mint-deep"
          >
            더보기
            <ChevronRight size={13} />
          </button>
        </div>
        <div className="inline-flex overflow-x-auto rounded-full border border-wefin-line bg-wefin-surface p-1 scrollbar-thin">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTabChange(t.value)}
              className={`shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold transition-colors sm:px-3 sm:py-1.5 sm:text-[13px] ${
                tab === t.value
                  ? 'bg-wefin-mint text-white shadow-sm'
                  : 'text-wefin-subtle hover:text-wefin-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || isPlaceholderData ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-[18px] border border-wefin-line bg-wefin-surface"
            >
              <div className="aspect-[16/10] bg-wefin-surface-2" />
              <div className="space-y-2.5 p-4">
                <div className="h-5 w-3/4 rounded bg-wefin-surface-2" />
                <div className="h-4 w-full rounded bg-wefin-surface-2" />
                <div className="h-3 w-1/3 rounded bg-wefin-surface-2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError && !displayItems.length ? (
        <p className="py-12 text-center text-sm text-wefin-subtle">뉴스를 불러오지 못했습니다</p>
      ) : !displayItems.length ? (
        <p className="py-12 text-center text-sm text-wefin-subtle">아직 뉴스가 없습니다</p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((cluster) => (
            <MainNewsCard key={cluster.clusterId} cluster={cluster} />
          ))}
        </div>
      )}
    </section>
  )
}

function MainNewsCard({ cluster }: { cluster: ClusterItem }) {
  return (
    <Link
      to={`/news/${cluster.clusterId}`}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-wefin-line bg-wefin-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-wefin-muted hover:shadow-[0_20px_40px_-24px_rgba(14,21,18,0.18)]"
    >
      <div className="aspect-[16/10] overflow-hidden bg-wefin-surface-2">
        {cluster.thumbnailUrl ? (
          <img
            src={cluster.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-wefin-surface-2 to-wefin-line">
            <Layers className="h-8 w-8 text-wefin-muted" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 pb-5">
        <h3 className="line-clamp-2 text-[16.5px] font-bold leading-snug transition-colors group-hover:text-wefin-mint-deep">
          {cluster.title}
        </h3>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-wefin-subtle">
          {cluster.summary}
        </p>
        <div className="mt-auto flex items-center gap-3 text-xs text-wefin-muted">
          <span>{getTimeAgo(cluster.publishedAt)}</span>
          <SourceBadge sources={cluster.sources} sourceCount={cluster.sourceCount} />
        </div>
      </div>
    </Link>
  )
}
