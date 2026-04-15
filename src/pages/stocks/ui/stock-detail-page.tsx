import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAccountQuery, useBuyingPowerQuery } from '@/features/account/model/use-account-queries'
import OrderForm from '@/features/order/ui/order-form'
import { usePortfolioQuery } from '@/features/portfolio/model/use-portfolio-queries'
import HoldingsPanel from '@/features/portfolio/ui/holdings-panel'
import { useStockPriceQuery } from '@/features/stock-detail/model/use-stock-detail-queries'
import { useStockSocket } from '@/features/stock-detail/model/use-stock-socket'
import OrderbookPanel from '@/features/stock-detail/ui/orderbook-panel'
import ResizeHandle from '@/features/stock-detail/ui/resize-handle'
import StockChart from '@/features/stock-detail/ui/stock-chart'
import StockPriceHeader, { type DetailTab } from '@/features/stock-detail/ui/stock-price-header'
import StockPriceTable from '@/features/stock-detail/ui/stock-price-table'
import { routes } from '@/shared/config/routes'
import StockLayout from '@/widgets/stock-layout/ui/stock-layout'

function StockDetailPage() {
  const { code } = useParams<{ code: string }>()
  const [activeTab, setActiveTab] = useState<DetailTab>('chart')

  const [orderbookW, setOrderbookW] = useState(320)
  const [orderW, setOrderW] = useState(300)
  const [chartH, setChartH] = useState(520)
  const [priceFromOrderbook, setPriceFromOrderbook] = useState<number | null>(null)

  useStockSocket(code)
  const { data: price } = useStockPriceQuery(code ?? '')
  const { data: account } = useAccountQuery()
  const { data: buyingPower } = useBuyingPowerQuery(price?.currentPrice ?? 0)
  const { data: portfolio, isLoading: isPortfolioLoading } = usePortfolioQuery()

  const handleResize1 = useCallback(
    (delta: number) => setOrderbookW((w) => Math.max(300, Math.min(420, w - delta))),
    []
  )
  const handleResize2 = useCallback(
    (delta: number) => setOrderW((w) => Math.max(280, Math.min(400, w - delta))),
    []
  )
  const handleChartResize = useCallback(
    (delta: number) => setChartH((h) => Math.max(380, Math.min(800, h + delta))),
    []
  )

  if (!code) return null

  return (
    <StockLayout sidebarWidth="narrow">
      <div className="flex h-[calc(100vh-80px)] flex-col gap-2">
        <div className="shrink-0 rounded-xl border border-wefin-line bg-white px-3 pt-2 pb-2 shadow-sm">
          <StockPriceHeader code={code} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1">
            {activeTab === 'chart' && (
              <>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <div
                    className="shrink-0 overflow-hidden rounded-xl border border-wefin-line bg-white"
                    style={{ height: chartH }}
                  >
                    <StockChart code={code} height={chartH} />
                  </div>
                  <ResizeHandle direction="vertical" onResize={handleChartResize} />
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <StockPriceTable code={code} />
                  </div>
                </div>

                <ResizeHandle onResize={handleResize1} />

                <div
                  className="shrink-0 overflow-hidden rounded-xl border border-wefin-line bg-white"
                  style={{ width: orderbookW }}
                >
                  <OrderbookPanel code={code} onPriceClick={setPriceFromOrderbook} />
                </div>
              </>
            )}

            {activeTab === 'info' && (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-wefin-line bg-white">
                <p className="text-xs text-wefin-subtle">종목정보 (추후 구현)</p>
              </div>
            )}

            {activeTab === 'news' && (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-wefin-line bg-white">
                <p className="text-xs text-wefin-subtle">뉴스·공시 (추후 구현)</p>
              </div>
            )}
          </div>

          <ResizeHandle onResize={handleResize2} />

          <div className="flex shrink-0 flex-col gap-2 overflow-y-auto" style={{ width: orderW }}>
            <div className="rounded-xl border border-wefin-line bg-white">
              <OrderForm
                stockCode={code}
                currentPrice={price?.currentPrice ?? 0}
                accountState={{
                  balance: account?.balance ?? null,
                  maxQuantity: buyingPower?.maxQuantity ?? null
                }}
                holdingQuantity={
                  portfolio?.find((item) => item.stockCode === code)?.quantity ?? null
                }
                priceFromOrderbook={priceFromOrderbook}
              />
            </div>
            <div className="rounded-xl border border-wefin-line bg-white">
              <HoldingsPanel
                currentStockCode={code}
                portfolio={portfolio}
                isLoading={isPortfolioLoading}
              />
            </div>
            <Link
              to={routes.accountTab('order-history')}
              className="block rounded-xl border border-wefin-line bg-white px-3 py-2.5 text-center text-xs text-wefin-subtle transition-colors hover:bg-wefin-bg"
            >
              주문내역 보기 →
            </Link>
          </div>
        </div>
      </div>
    </StockLayout>
  )
}

export default StockDetailPage
