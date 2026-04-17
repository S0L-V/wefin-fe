import { X } from 'lucide-react'
import { useState } from 'react'

import { useStockSearchQuery } from '@/features/stock-search/model/use-stock-search-query'
import {
  useAddWatchlist,
  useDeleteWatchlist,
  useWatchlistQuery
} from '@/features/watchlist/model/use-watchlist-queries'

const MAX_WATCHLIST_ITEMS = 10

export default function InterestStocksPanel() {
  const { data: watchlist = [], isLoading } = useWatchlistQuery()
  const addMutation = useAddWatchlist()
  const deleteMutation = useDeleteWatchlist()
  const [keyword, setKeyword] = useState('')
  const { data: searchResults = [], isFetching } = useStockSearchQuery(keyword)

  const registeredCodes = new Set(watchlist.map((w) => w.stockCode))
  const isLimitReached = watchlist.length >= MAX_WATCHLIST_ITEMS

  function handleAddStock(stockCode: string) {
    // 서버 제한과 동일한 상한선을 클라이언트에서 선제 차단 — 쓸모없는 실패 요청을 예방한다
    if (isLimitReached) return
    addMutation.mutate(stockCode)
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-bold text-wefin-text">등록한 관심 종목</h2>
          <span className="text-xs text-wefin-subtle">
            {watchlist.length} / {MAX_WATCHLIST_ITEMS}
          </span>
        </div>
        {isLoading ? (
          <SkeletonRows count={3} />
        ) : watchlist.length === 0 ? (
          <EmptyState message="아직 등록한 종목이 없습니다. 아래에서 검색해서 추가해보세요." />
        ) : (
          <ul className="flex flex-col gap-2">
            {watchlist.map((item) => (
              <li
                key={item.stockCode}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-wefin-text">
                    {item.stockName || item.stockCode}
                  </span>
                  <span className="text-xs text-wefin-subtle">{item.stockCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(item.stockCode)}
                  aria-label={`${item.stockName || item.stockCode} 해제`}
                  className="rounded-full p-1 text-wefin-subtle transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-wefin-text">종목 검색해서 추가</h2>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="종목명 또는 종목코드"
          className="mb-3 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-wefin-mint focus:outline-none"
        />
        {keyword.trim().length === 0 ? (
          <p className="text-xs text-wefin-subtle">종목명을 입력하면 결과가 표시됩니다.</p>
        ) : isFetching ? (
          <SkeletonRows count={2} />
        ) : searchResults.length === 0 ? (
          <EmptyState message="검색 결과가 없습니다." />
        ) : (
          <ul className="flex flex-col gap-2">
            {searchResults.map((s) => {
              const registered = registeredCodes.has(s.stockCode)
              return (
                <li
                  key={s.stockCode}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-wefin-text">{s.stockName}</span>
                    <span className="text-xs text-wefin-subtle">
                      {s.stockCode} · {s.market}
                      {s.sector ? ` · ${s.sector}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={registered || isLimitReached || addMutation.isPending}
                    onClick={() => handleAddStock(s.stockCode)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      registered
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-wefin-mint text-white hover:bg-wefin-mint/90 disabled:opacity-60'
                    }`}
                  >
                    {registered ? '등록됨' : '추가'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="h-14 animate-pulse rounded-xl bg-gray-50" />
      ))}
    </ul>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-wefin-subtle">
      {message}
    </div>
  )
}
