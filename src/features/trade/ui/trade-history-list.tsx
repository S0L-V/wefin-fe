import { useTradeHistoryQuery } from '../model/use-trade-queries'
import TradeHistoryRow from './trade-history-row'
import { groupTradesByDate } from './trade-history-utils'

export default function TradeHistoryList() {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useTradeHistoryQuery()

  if (isLoading) return <Message text="불러오는 중..." />
  if (isError) return <Message text="거래내역을 불러올 수 없어요" />

  const trades = data?.pages.flatMap((page) => page.content) ?? []
  if (trades.length === 0) return <Message text="거래 내역이 없어요" />

  const groups = groupTradesByDate(trades)

  return (
    <div>
      {groups.map(({ dateLabel, items }) => (
        <div key={dateLabel}>
          <div className="border-b border-wefin-line py-2 text-xs font-medium text-wefin-subtle">
            {dateLabel}
          </div>
          <div className="divide-y divide-wefin-line">
            {items.map((trade) => (
              <TradeHistoryRow key={trade.tradeId} trade={trade} />
            ))}
          </div>
        </div>
      ))}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-3 w-full rounded-md border border-wefin-line py-2 text-xs text-wefin-subtle hover:bg-wefin-bg disabled:opacity-50"
        >
          {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
        </button>
      )}
    </div>
  )
}

function Message({ text }: { text: string }) {
  return <p className="py-10 text-center text-xs text-wefin-subtle">{text}</p>
}
