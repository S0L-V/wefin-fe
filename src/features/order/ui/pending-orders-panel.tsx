import { useNavigate } from 'react-router-dom'

import { routes } from '@/shared/config/routes'

import type { OrderHistoryResponse } from '../api/fetch-order'
import { useCancelOrderMutation } from '../model/use-order-mutations'
import { usePendingOrdersQuery } from '../model/use-order-queries'

interface PendingOrdersPanelProps {
  currentStockCode?: string
  onModify?: (order: OrderHistoryResponse) => void
}

export default function PendingOrdersPanel({
  currentStockCode,
  onModify
}: PendingOrdersPanelProps) {
  const navigate = useNavigate()
  const { data: orders = [], isLoading } = usePendingOrdersQuery()
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrderMutation()

  if (isLoading) {
    return (
      <div>
        <div className="flex h-11 items-center px-3">
          <span className="text-sm font-semibold text-wefin-text">미체결</span>
        </div>
        <p className="py-4 text-center text-xs text-wefin-subtle">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex h-11 items-center justify-between px-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-wefin-text">미체결</span>
          {orders.length > 0 && (
            <span className="text-xs font-bold text-amber-500 tabular-nums">{orders.length}</span>
          )}
        </div>
      </div>
      {orders.length === 0 ? (
        <p className="py-4 text-center text-xs text-wefin-subtle">미체결 주문이 없어요</p>
      ) : (
        <div className="divide-y divide-wefin-line">
          {orders.map((order) => {
            const isBuy = order.side === 'BUY'
            const sideColor = isBuy ? 'text-wefin-red' : 'text-wefin-blue'
            const sideLabel = isBuy ? '매수' : '매도'
            const stockCode = order.stockCode ?? ''
            const stockName = order.stockName ?? stockCode
            const totalAmount = Math.trunc((order.requestPrice ?? 0) * order.quantity)

            return (
              <div
                key={order.orderNo}
                onClick={() => {
                  if (stockCode && stockCode !== currentStockCode) {
                    navigate(routes.stockDetail(stockCode))
                  }
                  onModify?.(order)
                }}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-wefin-bg"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-base font-semibold text-wefin-text">
                      <span className={`mr-1.5 text-xs font-bold ${sideColor}`}>{sideLabel}</span>
                      {stockName}
                      <span className="ml-1.5 text-sm font-bold text-amber-500">
                        {order.quantity.toLocaleString()}주
                      </span>
                    </span>
                    <span className="shrink-0 text-base font-semibold text-wefin-text tabular-nums">
                      {totalAmount.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm tabular-nums">
                    <span className="font-medium text-wefin-subtle">
                      주문가 {Math.trunc(order.requestPrice ?? 0).toLocaleString()}원
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        cancelOrder(order.orderNo)
                      }}
                      disabled={isCancelling}
                      className="text-[10px] font-medium text-wefin-subtle transition-colors hover:text-rose-500"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
