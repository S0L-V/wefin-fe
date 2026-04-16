import { ExternalLink, FileText, Newspaper } from 'lucide-react'

import type {
  StockDisclosureItem,
  StockNewsItem
} from '@/features/stock-detail/api/fetch-stock-news-disclosure'
import {
  useStockDisclosuresQuery,
  useStockNewsQuery
} from '@/features/stock-detail/model/use-stock-detail-queries'

interface StockNewsDisclosurePanelProps {
  code: string
  enabled?: boolean
}

export default function StockNewsDisclosurePanel({
  code,
  enabled = true
}: StockNewsDisclosurePanelProps) {
  const newsQuery = useStockNewsQuery(code, enabled)
  const disclosuresQuery = useStockDisclosuresQuery(code, enabled)

  return (
    <div className="grid h-full grid-cols-1 gap-3 overflow-y-auto p-5 lg:grid-cols-2">
      <NewsSection
        items={newsQuery.data?.items ?? []}
        isLoading={newsQuery.isLoading}
        isError={newsQuery.isError}
      />
      <DisclosureSection
        items={disclosuresQuery.data?.items ?? []}
        totalCount={disclosuresQuery.data?.totalCount ?? null}
        isLoading={disclosuresQuery.isLoading}
        isError={disclosuresQuery.isError}
      />
    </div>
  )
}

// ---- 공통 유틸 ----

function fmtPublishedAt(iso: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) return '방금 전'
    if (diffHours < 24) return `${diffHours}시간 전`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}일 전`
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return iso
  }
}

function fmtReceiptDate(yyyymmdd: string | null): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd ?? ''
  return `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}`
}

// ---- 섹션 공통 레이아웃 ----

function Section({
  title,
  icon,
  count,
  children
}: {
  title: string
  icon: React.ReactNode
  count?: number | null
  children: React.ReactNode
}) {
  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-wefin-line bg-white">
      <header className="flex items-center justify-between border-b border-wefin-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-wefin-fg">{title}</h3>
        </div>
        {count !== undefined && count !== null && (
          <span className="text-xs text-wefin-subtle">총 {count.toLocaleString('ko-KR')}건</span>
        )}
      </header>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </section>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center p-6 text-xs text-wefin-subtle">{message}</div>
  )
}

// ---- 뉴스 ----

function NewsSection({
  items,
  isLoading,
  isError
}: {
  items: StockNewsItem[]
  isLoading: boolean
  isError: boolean
}) {
  return (
    <Section title="뉴스" icon={<Newspaper className="h-4 w-4 text-wefin-subtle" />}>
      {isLoading ? (
        <EmptyRow message="불러오는 중…" />
      ) : isError ? (
        <EmptyRow message="뉴스를 불러오지 못했습니다" />
      ) : items.length === 0 ? (
        <EmptyRow message="관련 뉴스가 없습니다" />
      ) : (
        <ul className="flex flex-col divide-y divide-wefin-line/60">
          {items.map((item, idx) => (
            <NewsRow key={item.clusterId ?? idx} item={item} />
          ))}
        </ul>
      )}
    </Section>
  )
}

function NewsRow({ item }: { item: StockNewsItem }) {
  const firstSource = item.sources[0]
  const extraCount = (item.sourceCount ?? item.sources.length) - 1
  const primaryUrl = firstSource?.url

  const content = (
    <div className="flex gap-3 p-3 transition-colors hover:bg-wefin-bg">
      {item.thumbnailUrl ? (
        <img
          src={item.thumbnailUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-md object-cover"
          loading="lazy"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-wefin-bg">
          <Newspaper className="h-5 w-5 text-wefin-subtle" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="line-clamp-2 text-sm font-medium text-wefin-fg">{item.title ?? '-'}</p>
        {item.summary && <p className="line-clamp-2 text-xs text-wefin-subtle">{item.summary}</p>}
        <div className="mt-auto flex items-center gap-1.5 text-[11px] text-wefin-subtle">
          {firstSource?.publisherName && (
            <>
              <span className="truncate">{firstSource.publisherName}</span>
              {extraCount > 0 && <span className="shrink-0">외 {extraCount}건</span>}
              <span className="shrink-0">·</span>
            </>
          )}
          <span className="shrink-0">{fmtPublishedAt(item.publishedAt)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <li>
      {primaryUrl ? (
        <a href={primaryUrl} target="_blank" rel="noreferrer" className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  )
}

// ---- 공시 ----

function DisclosureSection({
  items,
  totalCount,
  isLoading,
  isError
}: {
  items: StockDisclosureItem[]
  totalCount: number | null
  isLoading: boolean
  isError: boolean
}) {
  return (
    <Section
      title="공시"
      icon={<FileText className="h-4 w-4 text-wefin-subtle" />}
      count={totalCount}
    >
      {isLoading ? (
        <EmptyRow message="불러오는 중…" />
      ) : isError ? (
        <EmptyRow message="공시를 불러오지 못했습니다" />
      ) : items.length === 0 ? (
        <EmptyRow message="최근 3개월 공시가 없습니다" />
      ) : (
        <ul className="flex flex-col divide-y divide-wefin-line/60">
          {items.map((item, idx) => (
            <DisclosureRow key={item.receiptNo ?? idx} item={item} />
          ))}
        </ul>
      )}
    </Section>
  )
}

function DisclosureRow({ item }: { item: StockDisclosureItem }) {
  const content = (
    <div className="flex gap-3 p-3 transition-colors hover:bg-wefin-bg">
      <div className="flex w-[72px] shrink-0 flex-col items-start text-[11px] text-wefin-subtle">
        {fmtReceiptDate(item.receiptDate)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="flex items-center gap-1 text-sm font-medium text-wefin-fg">
          <span className="truncate">{item.reportName ?? '-'}</span>
          {item.viewerUrl && <ExternalLink className="h-3.5 w-3.5 shrink-0 text-wefin-subtle" />}
        </p>
        {item.filerName && <p className="text-[11px] text-wefin-subtle">{item.filerName}</p>}
      </div>
    </div>
  )
  return (
    <li>
      {item.viewerUrl ? (
        <a href={item.viewerUrl} target="_blank" rel="noreferrer" className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  )
}
