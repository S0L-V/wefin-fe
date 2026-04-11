import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useStockSocket } from '@/features/stock-detail/model/use-stock-socket'
import HoldingsPanel from '@/features/stock-detail/ui/holdings-panel'
import OrderForm from '@/features/stock-detail/ui/order-form'
import OrderHistoryPanel from '@/features/stock-detail/ui/order-history-panel'
import OrderbookPanel from '@/features/stock-detail/ui/orderbook-panel'
import ResizeHandle from '@/features/stock-detail/ui/resize-handle'
import StockChart from '@/features/stock-detail/ui/stock-chart'
import StockPriceHeader, { type DetailTab } from '@/features/stock-detail/ui/stock-price-header'
import StockPriceTable from '@/features/stock-detail/ui/stock-price-table'
import StockLayout from '@/widgets/stock-layout/ui/stock-layout'

function StockDetailPage() {
  const { code } = useParams<{ code: string }>()
  const [activeTab, setActiveTab] = useState<DetailTab>('chart')

  const [orderbookW, setOrderbookW] = useState(220)
  const [orderW, setOrderW] = useState(200)
  const [chartH, setChartH] = useState(340)

  useStockSocket(code)

  // 드래그 오른쪽 → 왼쪽 패널 커짐 → 오른쪽 패널 줄어듦 (w - delta)
  const handleResize1 = useCallback(
    (delta: number) => setOrderbookW((w) => Math.max(160, Math.min(340, w - delta))),
    []
  )
  const handleResize2 = useCallback(
    (delta: number) => setOrderW((w) => Math.max(150, Math.min(320, w - delta))),
    []
  )
  const handleChartResize = useCallback(
    (delta: number) => setChartH((h) => Math.max(150, Math.min(600, h + delta))),
    []
  )

  if (!code) return null

  return (
    <StockLayout sidebarWidth="narrow">
      <div className="flex h-[calc(100vh-80px)] flex-col rounded-2xl border border-gray-200 bg-white px-3 pt-2 pb-2 shadow-sm">
        <StockPriceHeader code={code} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'chart' && (
          <div className="mt-1.5 flex min-h-0 flex-1">
            {/* 좌측: 차트 + 시세 */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <div className="shrink-0 overflow-hidden" style={{ height: chartH }}>
                <StockChart code={code} height={chartH} />
              </div>
              <ResizeHandle direction="vertical" onResize={handleChartResize} />
              <div className="min-h-0 flex-1 overflow-hidden">
                <StockPriceTable code={code} />
              </div>
            </div>

            <ResizeHandle onResize={handleResize1} />

            {/* 중앙: 호가창 */}
            <div
              className="shrink-0 overflow-hidden rounded-lg border border-gray-100"
              style={{ width: orderbookW }}
            >
              <OrderbookPanel code={code} />
            </div>

            <ResizeHandle onResize={handleResize2} />

            {/* 우측: 주문 + 보유 + 주문내역 */}
            <div className="shrink-0 space-y-1.5 overflow-y-auto" style={{ width: orderW }}>
              <div className="rounded-lg border border-gray-100">
                <OrderForm code={code} />
              </div>
              <div className="rounded-lg border border-gray-100">
                <HoldingsPanel code={code} />
              </div>
              <div className="rounded-lg border border-gray-100">
                <OrderHistoryPanel />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="mt-1.5 flex flex-1 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">종목정보 (추후 구현)</p>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="mt-1.5 flex flex-1 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">뉴스·공시 (추후 구현)</p>
          </div>
        )}
      </div>
    </StockLayout>
  )
}

export default StockDetailPage
