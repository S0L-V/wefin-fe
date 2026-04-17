import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import type { GameHistoryItem } from '@/features/game-room/model/game-room.schema'
import { useGameHistoryQuery } from '@/features/game-room/model/use-game-room-query'

const PAGE_SIZE = 10

function ArchivePage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useGameHistoryQuery(page, PAGE_SIZE)

  const items = data?.data.content ?? []
  const pageInfo = data?.data.pageInfo

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/history" className="text-sm text-wefin-subtle hover:text-wefin-text">
          &larr; 로비로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-wefin-text mt-2">과거 게임 이력</h1>
        {pageInfo && (
          <p className="text-sm text-wefin-subtle mt-1">총 {pageInfo.totalElements}건</p>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-wefin-subtle">로딩 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-wefin-subtle">
          <p className="text-lg font-medium">게임 이력이 없습니다</p>
          <p className="mt-1">게임을 완료하면 여기에 표시됩니다</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <ArchiveCard key={item.roomId} item={item} />
            ))}
          </div>

          {pageInfo && pageInfo.totalPages > 1 && (
            <Pagination
              page={pageInfo.page}
              totalPages={pageInfo.totalPages}
              hasNext={pageInfo.hasNext}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}

function ArchiveCard({ item }: { item: GameHistoryItem }) {
  const seedLabel = `시드 ${(item.seedMoney / 10000).toLocaleString()}만원`
  const periodLabel = `${item.periodMonths}개월`
  const isPositive = item.profitRate >= 0
  const profitColor = isPositive ? 'text-red-500' : 'text-blue-500'
  const profitSign = isPositive ? '+' : ''
  const rankLabel = item.finalRank != null ? `${item.finalRank}등` : '-'
  const finishedDate = item.finishedAt.split('T')[0]

  return (
    <Link
      to={`/history/room/${item.roomId}/result`}
      className="block bg-white rounded-xl border border-wefin-line p-5 hover:border-wefin-mint transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-gray-100 text-wefin-subtle px-2 py-0.5 rounded">완료</span>
            <span className="font-semibold text-wefin-text">
              {seedLabel} · {periodLabel}
            </span>
          </div>
          <p className="text-sm text-wefin-subtle">
            {item.startDate} ~ {item.endDate} · {item.participantCount}명 참여
          </p>
          <p className="text-xs text-wefin-subtle mt-1">
            완료일: {finishedDate} · 거래 {item.totalTrades}회
          </p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${profitColor}`}>
            {profitSign}
            {item.profitRate.toFixed(2)}%
          </p>
          <p className="text-sm text-wefin-subtle">
            {rankLabel} / {item.participantCount}명
          </p>
          <p className="text-xs text-wefin-subtle">
            {(item.finalAsset / 10000).toLocaleString()}만원
          </p>
        </div>
      </div>
    </Link>
  )
}

function Pagination({
  page,
  totalPages,
  hasNext,
  onPageChange
}: {
  page: number
  totalPages: number
  hasNext: boolean
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="flex items-center gap-1 text-sm text-wefin-subtle hover:text-wefin-text disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        이전
      </button>
      <span className="text-sm text-wefin-text">
        {page + 1} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="flex items-center gap-1 text-sm text-wefin-subtle hover:text-wefin-text disabled:opacity-30 disabled:cursor-not-allowed"
      >
        다음
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default ArchivePage
