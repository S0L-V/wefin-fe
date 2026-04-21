import { Loader2, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { useAnalysisReportQuery } from '@/features/game-room/model/use-analysis-report-query'
import {
  useGameResultQuery,
  useOrderHistoryQuery,
  useSnapshotsQuery
} from '@/features/game-room/model/use-game-result-query'

function formatProfit(rate: number): string {
  const sign = rate >= 0 ? '+' : ''
  return `${sign}${rate.toFixed(2)}%`
}

function formatAmountTick(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만`
  return value.toLocaleString()
}

function ResultPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const resultQuery = useGameResultQuery(roomId ?? '')
  const snapshotsQuery = useSnapshotsQuery(roomId ?? '')
  const ordersQuery = useOrderHistoryQuery(roomId ?? '')
  const reportQuery = useAnalysisReportQuery(roomId ?? '')
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL')
  const [orderPage, setOrderPage] = useState(1)

  if (!roomId) {
    return <div className="py-20 text-center text-wefin-subtle">잘못된 접근입니다</div>
  }

  if (resultQuery.isLoading || snapshotsQuery.isLoading || ordersQuery.isLoading) {
    return <div className="py-20 text-center text-wefin-subtle">결과 불러오는 중...</div>
  }

  if (resultQuery.isError || snapshotsQuery.isError || ordersQuery.isError) {
    return <div className="py-20 text-center text-wefin-red">결과를 불러오지 못했습니다.</div>
  }

  const result = resultQuery.data?.data
  const snapshots = snapshotsQuery.data?.data ?? []
  const orders = ordersQuery.data?.data ?? []

  if (!result) {
    return <div className="py-20 text-center text-wefin-subtle">결과 데이터가 없습니다.</div>
  }

  const ORDERS_PER_PAGE = 10

  const lastSnapshot = snapshots.at(-1)
  const finalAsset = lastSnapshot?.totalAsset ?? 0
  const finalProfitRate = lastSnapshot?.profitRate ?? 0
  const isWin = finalProfitRate >= 0
  const profitColor = isWin ? 'text-wefin-red' : 'text-wefin-blue'

  const chartData = snapshots.map((s, idx) => ({
    label: idx === 0 ? '시작' : s.turnDate?.replaceAll('-', '.'),
    value: s.totalAsset
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1fr_minmax(520px,50%)]">
        {/* 좌측: 차트 + 매매내역 */}
        <div className="flex flex-col gap-5">
          {/* 헤더 카드 */}
          <div className="card-base overflow-hidden">
            <div className="bg-gradient-to-r from-wefin-mint-deep to-wefin-mint px-5 py-5 text-white sm:px-6 sm:py-6">
              <h1 className="text-lg font-extrabold sm:text-xl">투자 시뮬레이션 종료</h1>
              <p className="mt-1 text-xs text-white/80 sm:text-sm">당신의 투자 성적표입니다</p>
            </div>
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
              <div className="flex items-center gap-5 sm:gap-8">
                <div>
                  <p className="text-xs font-bold text-wefin-subtle">최종 수익률</p>
                  <p className={`font-num mt-1 text-2xl font-extrabold sm:text-3xl ${profitColor}`}>
                    {formatProfit(finalProfitRate)}
                  </p>
                </div>
                <div className="h-10 w-px bg-wefin-line" />
                <div>
                  <p className="text-xs font-bold text-wefin-subtle">최종 자산</p>
                  <p className="font-num mt-1 text-xl font-bold text-wefin-text sm:text-2xl">
                    {Math.trunc(finalAsset).toLocaleString()}원
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  className="flex-1 rounded-lg bg-wefin-mint px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-wefin-mint-deep sm:flex-none"
                >
                  게임 이력
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 rounded-lg border border-wefin-line bg-wefin-surface px-4 py-2.5 text-sm font-bold text-wefin-text transition-colors hover:bg-wefin-surface-2 sm:flex-none"
                >
                  홈으로
                </button>
              </div>
            </div>
          </div>

          {/* 자산 변동 그래프 */}
          <div className="card-base p-6">
            <h3 className="mb-4 text-sm font-bold text-wefin-text">자산 변동 그래프</h3>
            {chartData.length === 0 ? (
              <p className="py-8 text-center text-xs text-wefin-subtle">
                기록된 자산 변동이 없습니다.
              </p>
            ) : (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="resultGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E6DF" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#5E6A66', fontWeight: 600 }}
                      minTickGap={30}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#5E6A66', fontWeight: 600 }}
                      tickFormatter={formatAmountTick}
                      domain={['auto', 'auto']}
                      width={56}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null
                        return (
                          <div className="card-base px-3.5 py-2.5 text-sm">
                            <p className="font-bold text-wefin-text">{payload[0].payload.label}</p>
                            <p className="font-num font-extrabold text-wefin-mint">
                              {Math.trunc(Number(payload[0].value)).toLocaleString()}원
                            </p>
                          </div>
                        )
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#14B8A6"
                      strokeWidth={2.5}
                      fill="url(#resultGrad)"
                      dot={{ r: 3, fill: '#14B8A6', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 전체 매매 내역 */}
          <div className="card-base p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-[15px] font-bold text-wefin-text">전체 매매 내역</h3>
              <div className="flex gap-1 rounded-lg bg-wefin-surface-2 p-1">
                {(
                  [
                    ['ALL', '전체'],
                    ['BUY', '매수'],
                    ['SELL', '매도']
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setOrderFilter(value)
                      setOrderPage(1)
                    }}
                    className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-colors ${
                      orderFilter === value
                        ? 'bg-white text-wefin-text shadow-sm'
                        : 'text-wefin-muted hover:text-wefin-text'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const filtered =
                orderFilter === 'ALL' ? orders : orders.filter((o) => o.orderType === orderFilter)
              const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_PER_PAGE))
              const paginated = filtered.slice(
                (orderPage - 1) * ORDERS_PER_PAGE,
                orderPage * ORDERS_PER_PAGE
              )

              return (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-wefin-line text-[13px] font-bold text-wefin-subtle">
                          <th className="pb-3.5">날짜</th>
                          <th className="pb-3.5">종목</th>
                          <th className="pb-3.5">구분</th>
                          <th className="pb-3.5 text-right">수량</th>
                          <th className="hidden pb-3.5 text-right sm:table-cell">단가</th>
                          <th className="pb-3.5 text-right">금액</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wefin-line/50">
                        {paginated.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-sm text-wefin-subtle">
                              매매 내역이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          paginated.map((o) => {
                            const isBuy = o.orderType === 'BUY'
                            return (
                              <tr key={o.orderId} className="text-[14px]">
                                <td className="py-4 font-num text-wefin-subtle">
                                  {o.turnDate?.replaceAll('-', '.')}
                                </td>
                                <td className="py-4">
                                  <p className="font-semibold text-wefin-text">{o.stockName}</p>
                                  <p className="text-[11px] text-wefin-muted">{o.symbol}</p>
                                </td>
                                <td className="py-4">
                                  <span
                                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${isBuy ? 'bg-wefin-red-soft text-wefin-red' : 'bg-wefin-surface-2 text-wefin-blue'}`}
                                  >
                                    {isBuy ? '매수' : '매도'}
                                  </span>
                                </td>
                                <td className="font-num py-4 text-right font-semibold text-wefin-text">
                                  {o.quantity.toLocaleString()}주
                                </td>
                                <td className="font-num hidden py-4 text-right text-wefin-text sm:table-cell">
                                  {Math.trunc(o.price).toLocaleString()}원
                                </td>
                                <td className="font-num py-4 text-right font-bold text-wefin-text">
                                  {Math.trunc(o.price * o.quantity).toLocaleString()}원
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                        disabled={orderPage === 1}
                        className="rounded-md px-2.5 py-1.5 text-xs font-bold text-wefin-muted transition-colors hover:text-wefin-text disabled:opacity-30"
                      >
                        이전
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setOrderPage(page)}
                          className={`font-num h-8 w-8 rounded-md text-xs font-bold transition-colors ${
                            page === orderPage
                              ? 'bg-wefin-mint text-white'
                              : 'text-wefin-muted hover:bg-wefin-surface-2 hover:text-wefin-text'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setOrderPage((p) => Math.min(totalPages, p + 1))}
                        disabled={orderPage === totalPages}
                        className="rounded-md px-2.5 py-1.5 text-xs font-bold text-wefin-muted transition-colors hover:text-wefin-text disabled:opacity-30"
                      >
                        다음
                      </button>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>

        {/* 우측: 랭킹 + AI 리포트 */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
          {/* 최종 랭킹 */}
          <div className="card-base p-5">
            <h3 className="mb-4 text-sm font-bold text-wefin-text">최종 랭킹</h3>
            {!result.roomFinished ? (
              <div className="py-6 text-center">
                <p className="text-xs text-wefin-subtle">다른 참가자의 게임이 진행 중입니다.</p>
                <p className="mt-1 text-[10px] text-wefin-muted">
                  모두 종료하면 랭킹이 공개됩니다.
                </p>
              </div>
            ) : result.rankings.length === 0 ? (
              <p className="py-6 text-center text-xs text-wefin-subtle">랭킹 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-1.5">
                {result.rankings.map((r) => (
                  <div
                    key={`${r.rank}-${r.userName}`}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.isMine ? 'bg-wefin-mint-soft' : 'hover:bg-wefin-surface-2'}`}
                  >
                    <span
                      className={`font-num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                        r.rank === 1
                          ? 'bg-amber-400 text-white'
                          : r.rank === 2
                            ? 'bg-wefin-muted text-white'
                            : r.rank === 3
                              ? 'bg-amber-600 text-white'
                              : 'bg-wefin-surface-2 text-wefin-muted'
                      }`}
                    >
                      {r.rank}
                    </span>
                    <span className="flex-1 truncate text-[13px] font-semibold text-wefin-text">
                      {r.userName}
                      {r.isMine && (
                        <span className="ml-1 text-[11px] text-wefin-mint-deep">(나)</span>
                      )}
                    </span>
                    <span className="font-num text-[13px] font-bold tabular-nums text-wefin-text">
                      {Math.trunc(r.finalAsset).toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI 분석 리포트 */}
          <div className="card-base p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <MessageCircle size={18} className="text-wefin-mint" />
              <h3 className="text-[16px] font-extrabold text-wefin-text">AI 분석 리포트</h3>
            </div>
            {reportQuery.isLoading ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <Loader2 className="h-8 w-8 animate-spin text-wefin-mint" />
                <p className="text-sm text-wefin-subtle">분석 중...</p>
              </div>
            ) : reportQuery.isError ? (
              <div className="py-6 text-center">
                <p className="text-sm text-wefin-red">리포트를 불러오지 못했습니다.</p>
                <button
                  type="button"
                  onClick={() => reportQuery.refetch()}
                  className="mt-2 rounded-lg bg-wefin-mint px-4 py-2 text-sm font-bold text-white"
                >
                  다시 시도
                </button>
              </div>
            ) : reportQuery.data?.data ? (
              <div className="space-y-5">
                {[
                  { title: '성과 분석', body: reportQuery.data.data.performance },
                  { title: '투자 패턴', body: reportQuery.data.data.pattern },
                  { title: '제안', body: reportQuery.data.data.suggestion }
                ].map((s) => (
                  <div
                    key={s.title}
                    className="rounded-xl border-l-[3px] border-wefin-mint bg-wefin-surface-2 py-5 pr-6 pl-5"
                  >
                    <h4 className="text-[15px] font-extrabold text-wefin-text">{s.title}</h4>
                    <p className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.85] text-wefin-text">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultPage
