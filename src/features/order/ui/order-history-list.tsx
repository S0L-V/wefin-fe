import type { OrderStatus } from '../api/mutate-order'
import { useOrderHistoryQuery } from '../model/use-order-queries'
import OrderHistoryRow from './order-history-row'

interface OrderHistoryListProps {
  statuses: OrderStatus[]
}

export default function OrderHistoryList({ statuses }: OrderHistoryListProps) {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useOrderHistoryQuery({ status: statuses })

  if (isLoading) return <Message text="불러오는 중..." />
  if (isError) return <Message text="주문내역을 불러올 수 없어요" />

  const orders = data?.pages.flatMap((page) => page.content) ?? []
  if (orders.length === 0) return <Message text="주문 내역이 없어요" />

  return (
    <div>
      <div className="divide-y divide-wefin-line">
        {orders.map((order) => (
          <OrderHistoryRow key={order.orderId} order={order} />
        ))}
      </div>

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
