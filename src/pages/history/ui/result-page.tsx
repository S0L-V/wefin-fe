import { Loader2, MessageCircle, Trophy } from 'lucide-react'
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

const PAGE_ANIMATION = `
  @keyframes resultFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .result-anim-1 { animation: resultFadeUp 0.5s ease-out 0.00s both; }
  .result-anim-2 { animation: resultFadeUp 0.5s ease-out 0.10s both; }
  .result-anim-3 { animation: resultFadeUp 0.5s ease-out 0.20s both; }
  .result-anim-4 { animation: resultFadeUp 0.5s ease-out 0.30s both; }
  .result-anim-5 { animation: resultFadeUp 0.5s ease-out 0.40s both; }
`

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
  // AI 리포트는 첫 호출 시 5~10초 걸리므로 페이지 로딩 차단에 포함하지 않고
  // 해당 섹션에서만 별도 로딩 표시 (다른 영역은 즉시 렌더)
  const reportQuery = useAnalysisReportQuery(roomId ?? '')

  if (!roomId) {
    return <div className="py-20 text-center text-wefin-subtle">잘못된 접근입니다</div>
  }

  if (resultQuery.isLoading || snapshotsQuery.isLoading || ordersQuery.isLoading) {
    return <div className="py-20 text-center text-wefin-subtle">결과 불러오는 중…</div>
  }

  if (resultQuery.isError || snapshotsQuery.isError || ordersQuery.isError) {
    return <div className="py-20 text-center text-red-500">결과를 불러오지 못했습니다.</div>
  }

  const result = resultQuery.data?.data
  const snapshots = snapshotsQuery.data?.data ?? []
  const orders = ordersQuery.data?.data ?? []

  if (!result) {
    return <div className="py-20 text-center text-wefin-subtle">결과 데이터가 없습니다.</div>
  }

  const lastSnapshot = snapshots.at(-1)
  const finalAsset = lastSnapshot?.totalAsset ?? 0
  const finalProfitRate = lastSnapshot?.profitRate ?? 0
  const isWin = finalProfitRate >= 0
  const profitColor = isWin ? 'text-red-500' : 'text-blue-500'

  const chartData = snapshots.map((s, idx) => ({
    label: idx === 0 ? '시작' : s.turnDate,
    value: s.totalAsset
  }))

  return (
    <>
      <style>{PAGE_ANIMATION}</style>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        {/* 1. 헤더 카드: 트로피 + 수익률 + 자산 + 액션 버튼 */}
        <section className="result-anim-1 rounded-[40px] border border-wefin-line/60 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-wefin-text">투자 시뮬레이션 종료!</h1>
          <p className="mb-6 mt-1 text-sm text-wefin-subtle">당신의 투자 성적표입니다</p>

          <div className="mb-6 flex items-center justify-center gap-12">
            <div>
              <div className="mb-1 text-xs text-wefin-subtle">최종 수익률</div>
              <div className={`text-4xl font-black ${profitColor}`}>
                {formatProfit(finalProfitRate)}
              </div>
            </div>
            <div className="h-12 w-px bg-wefin-line" />
            <div>
              <div className="mb-1 text-xs text-wefin-subtle">최종 자산</div>
              <div className="text-2xl font-bold text-wefin-text">
                {Math.trunc(finalAsset).toLocaleString()}원
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="flex-1 rounded-2xl bg-wefin-mint py-4 font-bold text-white shadow-lg shadow-wefin-mint/20 transition hover:bg-wefin-mint-deep"
            >
              과거 게임이력
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 rounded-2xl bg-wefin-bg py-4 font-bold text-wefin-text transition hover:bg-wefin-line/40"
            >
              홈으로 돌아가기
            </button>
          </div>
        </section>

        {/* 2. 자산 변동 그래프 */}
        <section className="result-anim-2 rounded-[32px] border border-wefin-line/60 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-wefin-text">자산 변동 그래프</h3>
          {chartData.length === 0 ? (
            <div className="py-10 text-center text-sm text-wefin-subtle">
              기록된 자산 변동이 없습니다.
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 16, left: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="resultAssetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#24a8ab" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#24a8ab" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    minTickGap={30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={formatAmountTick}
                    domain={['auto', 'auto']}
                    width={56}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null
                      const point = payload[0]
                      return (
                        <div className="rounded-xl border border-wefin-line/60 bg-white px-3 py-2 text-xs shadow-xl">
                          <div className="mb-1 font-bold text-wefin-text">
                            {point.payload.label}
                          </div>
                          <div className="font-bold text-wefin-mint">
                            {Math.trunc(Number(point.value)).toLocaleString()}원
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#24a8ab"
                    strokeWidth={3}
                    fill="url(#resultAssetGradient)"
                    dot={{ r: 4, fill: '#24a8ab', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#24a8ab', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* 3. 위핀 최종 분석 리포트 — 세로 3행 (가로 폭 전체 사용) */}
        <section className="result-anim-3 rounded-[32px] border border-wefin-line/60 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wefin-mint">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-wefin-text">위핀 최종 분석 리포트</h3>
          </div>

          {reportQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-wefin-mint" />
              <div className="text-sm text-wefin-subtle">위피니가 게임 기록을 분석 중입니다…</div>
              <div className="text-xs text-wefin-subtle/70">5~10초 정도 소요될 수 있어요</div>
            </div>
          ) : reportQuery.isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="text-sm text-red-500">분석 리포트를 불러오지 못했습니다.</div>
              <button
                type="button"
                onClick={() => reportQuery.refetch()}
                className="rounded-xl bg-wefin-mint px-4 py-2 text-sm font-bold text-white transition hover:bg-wefin-mint-deep"
              >
                다시 시도
              </button>
            </div>
          ) : reportQuery.data?.data ? (
            <div className="space-y-4">
              {[
                { title: '성과 분석', body: reportQuery.data.data.performance },
                { title: '투자 패턴 분석', body: reportQuery.data.data.pattern },
                { title: '위피니 제안', body: reportQuery.data.data.suggestion }
              ].map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl border border-wefin-line/40 bg-wefin-bg/60 p-6"
                >
                  <h4 className="mb-3 flex items-center gap-2 font-black text-wefin-mint-deep">
                    <span className="h-1.5 w-1.5 rounded-full bg-wefin-mint-deep" />
                    {section.title}
                  </h4>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-wefin-subtle">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* 4. 전체 매매 내역 (테이블) */}
        <section className="result-anim-4 overflow-hidden rounded-[32px] border border-wefin-line/60 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-wefin-text">전체 매매 내역</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-wefin-line/40 text-xs text-wefin-subtle">
                  <th className="pb-4 font-medium">날짜</th>
                  <th className="pb-4 font-medium">종목</th>
                  <th className="pb-4 font-medium">구분</th>
                  <th className="pb-4 text-right font-medium">수량</th>
                  <th className="pb-4 text-right font-medium">단가</th>
                  <th className="pb-4 text-right font-medium">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wefin-line/40">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-wefin-subtle">
                      매매 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const total = Math.trunc(o.price * o.quantity)
                    const isBuy = o.orderType === 'BUY'
                    return (
                      <tr key={o.orderId} className="text-sm">
                        <td className="py-4 text-wefin-subtle">{o.turnDate}</td>
                        <td className="py-4">
                          <div className="font-bold text-wefin-text">{o.stockName}</div>
                          <div className="text-[10px] text-wefin-subtle">{o.symbol}</div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                              isBuy ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                            }`}
                          >
                            {isBuy ? '매수' : '매도'}
                          </span>
                        </td>
                        <td className="py-4 text-right font-medium text-wefin-text">
                          {o.quantity.toLocaleString()}주
                        </td>
                        <td className="py-4 text-right font-medium text-wefin-text">
                          {Math.trunc(o.price).toLocaleString()}원
                        </td>
                        <td className="py-4 text-right font-bold text-wefin-text">
                          {total.toLocaleString()}원
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. 최종 랭킹 */}
        <section className="result-anim-5 rounded-[32px] border border-wefin-line/60 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-wefin-text">최종 랭킹</h3>
          {!result.roomFinished ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <div className="text-sm text-wefin-subtle">
                아직 다른 참가자의 게임이 진행 중입니다.
              </div>
              <div className="text-xs text-wefin-subtle/70">
                모든 참가자가 게임을 종료하면 최종 랭킹이 공개됩니다.
              </div>
            </div>
          ) : result.rankings.length === 0 ? (
            <div className="py-10 text-center text-sm text-wefin-subtle">
              랭킹 데이터가 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-wefin-line/40">
              {result.rankings.map((r) => {
                const trophyColor =
                  r.rank === 1
                    ? 'text-amber-500'
                    : r.rank === 2
                      ? 'text-slate-400'
                      : r.rank === 3
                        ? 'text-orange-700'
                        : ''
                return (
                  <li
                    key={`${r.rank}-${r.userName}`}
                    className={`flex items-center gap-4 py-3 text-sm ${
                      r.isMine ? 'rounded-md bg-wefin-mint-soft px-3 font-semibold' : ''
                    }`}
                  >
                    <span className="flex w-12 items-center gap-1 text-wefin-text">
                      {trophyColor && <Trophy className={`h-3.5 w-3.5 ${trophyColor}`} />}
                      {r.rank}
                    </span>
                    <span className="flex-1 text-wefin-text">
                      {r.userName}
                      {r.isMine && <span className="ml-1 text-xs text-wefin-mint-deep">(나)</span>}
                    </span>
                    <span className="text-right font-bold text-wefin-text">
                      {Math.trunc(r.finalAsset).toLocaleString()}원
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

export default ResultPage
