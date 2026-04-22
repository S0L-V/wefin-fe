import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAccountQuery, useBuyingPowerQuery } from '@/features/account/model/use-account-queries'
import type { OrderHistoryResponse } from '@/features/order/api/fetch-order'
import { usePendingOrdersQuery } from '@/features/order/model/use-order-queries'
import OrderForm from '@/features/order/ui/order-form'
import PendingOrdersPanel from '@/features/order/ui/pending-orders-panel'
import { usePortfolioQuery } from '@/features/portfolio/model/use-portfolio-queries'
import HoldingsPanel from '@/features/portfolio/ui/holdings-panel'
import { useStockPriceQuery } from '@/features/stock-detail/model/use-stock-detail-queries'
import { useStockSocket } from '@/features/stock-detail/model/use-stock-socket'
import OrderbookPanel from '@/features/stock-detail/ui/orderbook-panel'
import ResizeHandle from '@/features/stock-detail/ui/resize-handle'
import StockChart from '@/features/stock-detail/ui/stock-chart'
import StockInfoPanel from '@/features/stock-detail/ui/stock-info-panel'
import StockNewsDisclosurePanel from '@/features/stock-detail/ui/stock-news-disclosure-panel'
import StockPriceHeader, { type DetailTab } from '@/features/stock-detail/ui/stock-price-header'
import StockPriceTable from '@/features/stock-detail/ui/stock-price-table'
import { routes } from '@/shared/config/routes'
import StockLayout from '@/widgets/stock-layout/ui/stock-layout'

type MobileTab = 'chart' | 'orderbook' | 'order' | 'info' | 'news'
type RightPanelTab = 'holdings' | 'pending'

function StockDetailPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<DetailTab>('chart')
  const [mobileTab, setMobileTab] = useState<MobileTab>('chart')
  const [rightTab, setRightTab] = useState<RightPanelTab>('holdings')

  const [chartRatio, setChartRatio] = useState(0.55)
  const [chartH, setChartH] = useState(360)
  const chartColumnRef = useRef<HTMLDivElement>(null)
  const [priceFromOrderbook, setPriceFromOrderbook] = useState<number | null>(null)
  const [modifyTarget, setModifyTarget] = useState<{
    order: OrderHistoryResponse
    ts: number
  } | null>(null)
  const [prevCode, setPrevCode] = useState(code)
  if (code !== prevCode) {
    setPrevCode(code)
    setModifyTarget(null)
  }
  const handleModify = useCallback((order: OrderHistoryResponse) => {
    setModifyTarget({ order, ts: Date.now() })
  }, [])

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('accessToken'))

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem('accessToken'))
    window.addEventListener('auth-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('auth-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useStockSocket(code)
  const {
    data: price,
    isError: isPriceError,
    isLoading: isPriceLoading
  } = useStockPriceQuery(code ?? '')
  const { data: account } = useAccountQuery()
  const { data: buyingPower } = useBuyingPowerQuery(price?.currentPrice ?? 0)
  const { data: portfolio, isLoading: isPortfolioLoading } = usePortfolioQuery()
  const { data: pendingOrders = [] } = usePendingOrdersQuery()

  useEffect(() => {
    const el = chartColumnRef.current
    if (!el) return
    const update = () => {
      const totalH = el.clientHeight
      if (totalH <= 0) return
      const next = Math.round(totalH * chartRatio)
      setChartH((prev) => (prev === next ? prev : next))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [chartRatio])

  const handleChartResize = useCallback((delta: number) => {
    const el = chartColumnRef.current
    if (!el) return
    const totalH = el.clientHeight
    if (totalH <= 0) return
    setChartRatio((r) => Math.max(0.3, Math.min(0.85, r + delta / totalH)))
  }, [])

  if (!code) return null

  if (isPriceError && !isPriceLoading) {
    return (
      <StockLayout sidebarWidth="narrow">
        <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
          <svg
            width="120"
            height="80"
            viewBox="0 0 120 80"
            fill="none"
            className="mb-4 text-wefin-muted"
          >
            <polyline
              points="10,20 30,30 50,25 70,50 90,45 110,65"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <line
              x1="60"
              y1="0"
              x2="60"
              y2="80"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.3"
            />
          </svg>
          <h2 className="text-lg font-extrabold text-wefin-text">존재하지 않는 종목입니다</h2>
          <p className="mt-1.5 text-sm text-wefin-subtle">
            종목코드 <span className="font-bold text-wefin-text">{code}</span>에 해당하는 종목을
            찾을 수 없어요.
          </p>
          <button
            type="button"
            onClick={() => navigate('/stocks')}
            className="mt-6 rounded-xl bg-wefin-mint px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-wefin-mint-deep"
          >
            종목 목록으로
          </button>
        </div>
      </StockLayout>
    )
  }

  return (
    <StockLayout sidebarWidth="narrow">
      {/* 데스크탑 레이아웃 */}
      <div className="hidden h-[calc(100dvh-120px)] flex-col gap-2 xl:flex">
        <div className="shrink-0 rounded-2xl bg-wefin-surface px-3 pt-2 pb-2">
          <StockPriceHeader code={code} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="flex min-h-0 flex-1 gap-2">
          <div className="flex min-w-0 flex-[1] flex-col">
            {activeTab === 'chart' && (
              <div className="flex min-h-0 flex-1 gap-2">
                <div
                  ref={chartColumnRef}
                  className="flex min-w-0 flex-[1] flex-col overflow-hidden"
                >
                  <div
                    className="shrink-0 overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface"
                    style={{ height: chartH }}
                  >
                    <StockChart code={code} height={chartH} />
                  </div>
                  <ResizeHandle direction="vertical" onResize={handleChartResize} />
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <StockPriceTable code={code} />
                  </div>
                </div>

                <div className="relative min-w-0 flex-[0.35] overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
                  <OrderbookPanel
                    code={code}
                    onPriceClick={isLoggedIn ? setPriceFromOrderbook : undefined}
                  />
                  {!isLoggedIn && <BlurOverlay />}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="flex flex-1 overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
                <StockInfoPanel code={code} enabled={activeTab === 'info'} />
              </div>
            )}

            {activeTab === 'news' && (
              <div className="flex flex-1 overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
                <StockNewsDisclosurePanel code={code} enabled={activeTab === 'news'} />
              </div>
            )}
          </div>

          <div className="relative flex min-w-0 flex-[0.3] flex-col gap-2 overflow-y-auto">
            <div className="rounded-xl border border-wefin-line bg-wefin-surface">
              <OrderForm
                key={`${code}-${modifyTarget?.ts ?? 0}`}
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
                modifyTarget={modifyTarget?.order ?? null}
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-wefin-line bg-wefin-surface">
              <div className="flex shrink-0 gap-1 border-b border-wefin-line px-3 pt-2">
                {[
                  {
                    key: 'holdings' as RightPanelTab,
                    label: '보유',
                    count: portfolio?.length ?? 0
                  },
                  { key: 'pending' as RightPanelTab, label: '미체결', count: pendingOrders.length }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRightTab(key)}
                    className={`flex items-center gap-1 border-b-2 px-2 pb-2 text-sm font-bold transition-colors ${
                      rightTab === key
                        ? 'border-wefin-mint text-wefin-text'
                        : 'border-transparent text-wefin-subtle hover:text-wefin-text'
                    }`}
                  >
                    {label}
                    {count > 0 && (
                      <span
                        className={`text-xs font-bold tabular-nums ${
                          key === 'holdings' ? 'text-wefin-mint-deep' : 'text-amber-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {rightTab === 'holdings' ? (
                  <HoldingsPanel
                    currentStockCode={code}
                    portfolio={portfolio}
                    isLoading={isPortfolioLoading}
                    balance={account?.balance}
                    hideHeader
                  />
                ) : (
                  <PendingOrdersPanel currentStockCode={code} onModify={handleModify} hideHeader />
                )}
              </div>
            </div>
            <Link
              to={routes.accountTab('order-history')}
              className="block shrink-0 rounded-xl border border-wefin-line bg-wefin-surface px-3 py-2.5 text-center text-xs text-wefin-subtle transition-colors hover:bg-wefin-bg"
            >
              주문내역 보기 →
            </Link>
            {!isLoggedIn && <BlurOverlay />}
          </div>
        </div>
      </div>

      {/* 모바일 레이아웃 */}
      <div className="flex flex-col xl:hidden" style={{ height: 'calc(100dvh - 56px)' }}>
        <div className="shrink-0 bg-wefin-surface px-3 pt-2 pb-2">
          <StockPriceHeader code={code} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-wefin-line bg-wefin-surface px-3 pb-2 scrollbar-thin">
          {[
            { key: 'chart' as MobileTab, label: '차트' },
            { key: 'orderbook' as MobileTab, label: '호가' },
            { key: 'order' as MobileTab, label: '주문' },
            { key: 'info' as MobileTab, label: '정보' },
            { key: 'news' as MobileTab, label: '뉴스·공시' }
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMobileTab(key)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-bold transition-colors ${
                mobileTab === key
                  ? 'bg-wefin-mint text-white'
                  : 'text-wefin-subtle hover:text-wefin-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {mobileTab === 'chart' && (
            <div className="flex flex-col">
              <div className="h-[300px] bg-wefin-surface">
                <StockChart code={code} height={300} />
              </div>
              <div className="border-t border-wefin-line">
                <StockPriceTable code={code} />
              </div>
            </div>
          )}

          {mobileTab === 'orderbook' && (
            <div className="relative h-full">
              <OrderbookPanel
                code={code}
                onPriceClick={isLoggedIn ? setPriceFromOrderbook : undefined}
              />
              {!isLoggedIn && <BlurOverlay />}
            </div>
          )}

          {mobileTab === 'order' && (
            <div className="flex flex-col gap-2 p-3">
              <div className="rounded-xl border border-wefin-line bg-wefin-surface">
                <OrderForm
                  key={`${code}-mobile-${modifyTarget?.ts ?? 0}`}
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
                  modifyTarget={modifyTarget?.order ?? null}
                />
              </div>
              <div className="rounded-xl border border-wefin-line bg-wefin-surface">
                <HoldingsPanel
                  currentStockCode={code}
                  portfolio={portfolio}
                  isLoading={isPortfolioLoading}
                  balance={account?.balance}
                />
              </div>
              <div className="rounded-xl border border-wefin-line bg-wefin-surface">
                <PendingOrdersPanel currentStockCode={code} onModify={handleModify} />
              </div>
            </div>
          )}

          {mobileTab === 'info' && (
            <div className="flex flex-1 overflow-hidden bg-wefin-surface">
              <StockInfoPanel code={code} enabled={mobileTab === 'info'} />
            </div>
          )}

          {mobileTab === 'news' && (
            <div className="flex flex-1 overflow-hidden bg-wefin-surface">
              <StockNewsDisclosurePanel code={code} enabled={mobileTab === 'news'} />
            </div>
          )}
        </div>

        {mobileTab !== 'order' && mobileTab !== 'info' && mobileTab !== 'news' && (
          <div className="flex shrink-0 gap-2 border-t border-wefin-line bg-wefin-surface p-3">
            <button
              type="button"
              onClick={() => setMobileTab('order')}
              className="flex-1 rounded-xl bg-wefin-red py-3 text-[15px] font-bold text-white transition-colors hover:opacity-90"
            >
              매수
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('order')}
              className="flex-1 rounded-xl bg-wefin-blue py-3 text-[15px] font-bold text-white transition-colors hover:opacity-90"
            >
              매도
            </button>
          </div>
        )}
      </div>
    </StockLayout>
  )
}

function BlurOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 rounded-xl"
      style={{
        background: 'color-mix(in srgb, var(--surface) 75%, transparent)',
        backdropFilter: 'blur(12px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.2)'
      }}
    />
  )
}

export default StockDetailPage
