import type { TradeHistoryResponse } from '../api/fetch-trade'

interface TradeHistoryRowProps {
  trade: TradeHistoryResponse
}

export default function TradeHistoryRow({ trade }: TradeHistoryRowProps) {
  const sideLabel = trade.side === 'BUY' ? '매수' : '매도'
  const totalAmount = Math.trunc(trade.totalAmount ?? 0)
  const amountSign = trade.side === 'BUY' ? '-' : '+'
  const amountColor = trade.side === 'BUY' ? 'text-blue-600' : 'text-red-500'
  const realizedProfit = Math.trunc(trade.realizedProfit ?? 0)
  const profitColor = realizedProfit >= 0 ? 'text-red-500' : 'text-blue-600'

  return (
    <div className="flex items-start justify-between py-3.5">
      <div>
        <div className="text-base font-semibold text-wefin-text">
          {trade.stockName ?? trade.stockCode ?? '-'} {sideLabel}
        </div>
        <div className="mt-0.5 text-xs text-wefin-subtle tabular-nums">
          {trade.quantity}주 · {(trade.price ?? 0).toLocaleString()}원 · 수수료{' '}
          {(trade.fee ?? 0).toLocaleString()}원
        </div>
      </div>
      <div className="text-right">
        <div className={`text-base font-semibold tabular-nums ${amountColor}`}>
          {amountSign}
          {totalAmount.toLocaleString()}원
        </div>
        {trade.side === 'SELL' && realizedProfit !== 0 && (
          <div className={`mt-0.5 text-xs font-medium tabular-nums ${profitColor}`}>
            {realizedProfit >= 0 ? '+' : ''}
            {realizedProfit.toLocaleString()}원
          </div>
        )}
      </div>
    </div>
  )
}
