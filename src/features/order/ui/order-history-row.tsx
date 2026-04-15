import type { OrderHistoryResponse } from '../api/fetch-order'

interface OrderHistoryRowProps {
  order: OrderHistoryResponse
}

export default function OrderHistoryRow({ order }: OrderHistoryRowProps) {
  const sideLabel = order.side === 'BUY' ? '매수' : '매도'
  const statusLabel = getStatusLabel(order.status)
  const orderTypeLabel = order.orderType === 'MARKET' ? '시장가' : '지정가'
  const requestPrice = order.requestPrice ?? 0
  const totalAmount = requestPrice * order.quantity
  const statusColor = getStatusColor(order.status)
  const dateLabel = formatDateLabel(order.createdAt)

  return (
    <div className="flex items-start justify-between py-3">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-wefin-subtle">{dateLabel}</span>
          <span className="text-sm font-medium text-wefin-text">
            {order.stockName ?? order.stockCode ?? '-'}
          </span>
          <span className={`text-[11px] ${statusColor}`}>
            {sideLabel} {statusLabel}
          </span>
        </div>
        <div className="mt-0.5 text-[11px] text-wefin-subtle">
          {orderTypeLabel} · {order.quantity}주
          {order.requestPrice !== null && ` · ${requestPrice.toLocaleString()}원`}
        </div>
      </div>
      <div className="text-right">
        {totalAmount > 0 && (
          <div className="text-sm font-medium text-wefin-text">
            {totalAmount.toLocaleString()}원
          </div>
        )}
        <div className="mt-0.5 text-[11px] text-wefin-subtle">
          수수료 {(order.fee ?? 0).toLocaleString()}원
        </div>
      </div>
    </div>
  )
}

function getStatusLabel(status: OrderHistoryResponse['status']): string {
  if (status === 'PENDING') return '대기'
  if (status === 'PARTIAL') return '부분체결'
  if (status === 'FILLED') return '체결'
  return '취소'
}

function getStatusColor(status: OrderHistoryResponse['status']): string {
  if (status === 'FILLED' || status === 'PARTIAL') return 'text-red-500'
  if (status === 'CANCELLED') return 'text-wefin-subtle'
  return 'text-wefin-subtle'
}

function formatDateLabel(createdAt: string | null): string {
  if (!createdAt || createdAt.length < 10) return '-'
  const month = Number(createdAt.slice(5, 7))
  const day = Number(createdAt.slice(8, 10))
  return `${month}.${day}`
}
