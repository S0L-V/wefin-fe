import { useState } from 'react'

import type { AssetHistoryItem } from '@/features/account/api/fetch-account'
import { useAccountQuery, useAssetHistoryQuery } from '@/features/account/model/use-account-queries'
import AssetHistoryChart from '@/features/account/ui/asset-history-chart'
import DailyRealizedChart from '@/features/account/ui/daily-realized-chart'
import PerStockProfitList from '@/features/account/ui/per-stock-profit-list'
import { usePortfolioQuery } from '@/features/portfolio/model/use-portfolio-queries'
import { useTradeHistoryQuery } from '@/features/trade/model/use-trade-queries'

type ChartPeriod = '1w' | '1m' | '3m' | 'all'

const PERIOD_OPTIONS: { key: ChartPeriod; label: string; days: number | null }[] = [
  { key: '1w', label: '1주', days: 7 },
  { key: '1m', label: '1달', days: 30 },
  { key: '3m', label: '3달', days: 90 },
  { key: 'all', label: '전체', days: null }
]

function todayKstDate(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
}

export default function ProfitAnalysisTab() {
  const [period, setPeriod] = useState<ChartPeriod>('1m')
  const { data: account } = useAccountQuery()
  const { data: portfolio } = usePortfolioQuery()
  const { data: assetHistory, isLoading } = useAssetHistoryQuery()
  const { data: tradeData } = useTradeHistoryQuery({}, 200)
  const trades = tradeData?.pages.flatMap((page) => page.content) ?? []

  const realizedProfit = Math.trunc(account?.totalRealizedProfit ?? 0)
  const balance = Math.trunc(account?.balance ?? 0)
  const initialTotal = Math.trunc(account?.initialBalance ?? 0)
  const evaluationAmount = Math.trunc(
    (portfolio ?? []).reduce((sum, item) => sum + (item.evaluationAmount ?? 0), 0)
  )
  const currentTotal = balance + evaluationAmount
  const history = assetHistory?.history ?? []
  const diff = currentTotal - initialTotal
  const diffRate = initialTotal > 0 ? (diff / initialTotal) * 100 : 0
  const profitColor = realizedProfit >= 0 ? 'text-red-500' : 'text-blue-500'
  const diffColor = diff >= 0 ? 'text-red-500' : 'text-blue-500'

  const today = todayKstDate()
  const lastDate = history[history.length - 1]?.date?.substring(0, 10) ?? null
  const withToday: AssetHistoryItem[] =
    lastDate === today
      ? history
      : [
          ...history,
          {
            date: today,
            totalAsset: currentTotal,
            balance,
            evaluationAmount,
            realizedProfit
          }
        ]

  // 가입 당일이라 1포인트만 있으면 시작점(initialBalance)을 하루 앞에 추가해 평평한 라인으로 표시
  let chartHistory = withToday
  if (withToday.length === 1 && initialTotal > 0) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(yesterday)
    chartHistory = [
      {
        date: yDate,
        totalAsset: initialTotal,
        balance: initialTotal,
        evaluationAmount: 0,
        realizedProfit: 0
      },
      ...withToday
    ]
  }

  const periodDays = PERIOD_OPTIONS.find((o) => o.key === period)?.days ?? null
  const cutoffDate = (() => {
    if (periodDays === null) return null
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - periodDays)
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(cutoff)
  })()
  const filteredHistory =
    cutoffDate === null
      ? chartHistory
      : chartHistory.filter((item) => (item.date ?? '').substring(0, 10) >= cutoffDate)

  return (
    <div className="space-y-6">
      <section className="max-w-md">
        <p className="text-xs text-wefin-subtle">총 실현수익</p>
        <p className={`mt-1 text-2xl font-bold ${profitColor}`}>
          {realizedProfit >= 0 ? '+' : ''}
          {realizedProfit.toLocaleString()}원
        </p>
        <div className="mt-3 flex items-baseline justify-between text-xs">
          <span className="text-wefin-subtle">
            총 자산{' '}
            <span className="font-medium text-wefin-text">{currentTotal.toLocaleString()}원</span>
          </span>
          <span className={diffColor}>
            {diff >= 0 ? '+' : ''}
            {diff.toLocaleString()}원 ({diffRate.toFixed(2)}%)
          </span>
        </div>
      </section>

      <section className="max-w-xl border-t border-wefin-line pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-wefin-text">자산 추이</h3>
          <div className="flex gap-1">
            {PERIOD_OPTIONS.map(({ key, label }) => {
              const isActive = period === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-wefin-mint-soft text-wefin-mint-deep'
                      : 'text-wefin-subtle hover:bg-wefin-bg hover:text-wefin-text'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
        {isLoading && <EmptyText text="불러오는 중..." />}
        {!isLoading && filteredHistory.length === 0 && <EmptyText text="해당 기간 기록이 없어요" />}
        {!isLoading && filteredHistory.length > 0 && (
          <AssetHistoryChart history={filteredHistory} height={180} />
        )}
      </section>

      <section className="max-w-xl border-t border-wefin-line pt-5">
        <h3 className="mb-3 text-sm font-semibold text-wefin-text">일별 실현손익</h3>
        <DailyRealizedChart trades={trades} cutoffDate={cutoffDate} />
      </section>

      <section className="max-w-xl border-t border-wefin-line pt-5">
        <h3 className="mb-3 text-sm font-semibold text-wefin-text">종목별 손익</h3>
        <PerStockProfitList portfolio={portfolio ?? []} trades={trades} cutoffDate={cutoffDate} />
      </section>
    </div>
  )
}

function EmptyText({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-wefin-subtle">{text}</p>
}
