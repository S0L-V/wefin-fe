import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const CHART_DATA = [
  { label: '시작', value: 50000000 },
  { label: '2023.01.16', value: 50200000 },
  { label: '2023.01.23', value: 49800000 },
  { label: '2023.02.06', value: 51500000 },
  { label: '2023.02.20', value: 50800000 },
  { label: '2023.03.06', value: 52300000 },
  { label: '2023.03.20', value: 53100000 },
  { label: '2023.04.03', value: 52500000 },
  { label: '2023.04.17', value: 54200000 },
  { label: '2023.05.01', value: 55100000 },
  { label: '2023.05.15', value: 54600000 },
  { label: '2023.05.29', value: 55800000 },
  { label: '2023.06.12', value: 56225000 }
]

function formatAmountTick(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만`
  return value.toLocaleString()
}

export default function StepResult() {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(520px,50%)]">
        {/* Left: Header + Chart */}
        <div className="flex flex-col gap-5">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base overflow-hidden"
          >
            <div className="bg-gradient-to-r from-wefin-mint-deep to-wefin-mint px-5 py-5 text-white sm:px-6 sm:py-6">
              <h1 className="text-lg font-extrabold sm:text-xl">투자 시뮬레이션 종료</h1>
              <p className="mt-1 text-xs text-white/80 sm:text-sm">당신의 투자 성적표입니다</p>
            </div>
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
              <div className="flex items-center gap-5 sm:gap-8">
                <div>
                  <p className="text-xs font-bold text-wefin-subtle">최종 수익률</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="font-num mt-1 text-2xl font-extrabold text-wefin-red sm:text-3xl"
                  >
                    +12.45%
                  </motion.p>
                </div>
                <div className="h-10 w-px bg-wefin-line" />
                <div>
                  <p className="text-xs font-bold text-wefin-subtle">최종 자산</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="font-num mt-1 text-xl font-bold text-wefin-text sm:text-2xl"
                  >
                    56,225,000원
                  </motion.p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg bg-wefin-mint px-4 py-2.5 text-center text-sm font-bold text-white sm:flex-none">
                  게임 이력
                </div>
                <div className="flex-1 rounded-lg border border-wefin-line bg-wefin-surface px-4 py-2.5 text-center text-sm font-bold text-wefin-text sm:flex-none">
                  홈으로
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chart placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base p-6"
          >
            <h3 className="mb-4 text-sm font-bold text-wefin-text">자산 변동 그래프</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
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
          </motion.div>

          {/* Trade History snippet */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-base p-5 sm:p-6"
          >
            <h3 className="mb-4 text-[15px] font-bold text-wefin-text">전체 매매 내역</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-wefin-line text-[11px] font-bold text-wefin-subtle sm:text-[13px]">
                  <th className="whitespace-nowrap pb-3.5">날짜</th>
                  <th className="whitespace-nowrap pb-3.5">종목</th>
                  <th className="whitespace-nowrap pb-3.5">구분</th>
                  <th className="whitespace-nowrap pb-3.5 text-right">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wefin-line/50">
                {[
                  { date: '2023.01.16', name: '삼성전자', type: 'BUY', amount: '5,920,000' },
                  { date: '2023.02.06', name: 'LG에너지솔루션', type: 'BUY', amount: '3,650,000' },
                  { date: '2023.05.15', name: '삼성전자', type: 'SELL', amount: '6,550,000' }
                ].map((o, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-[12px] sm:text-[14px]"
                  >
                    <td className="font-num whitespace-nowrap py-3.5 text-wefin-subtle">
                      {o.date}
                    </td>
                    <td className="whitespace-nowrap py-3.5 font-semibold text-wefin-text">
                      {o.name}
                    </td>
                    <td className="whitespace-nowrap py-3.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold sm:px-2.5 sm:py-1 sm:text-[11px] ${
                          o.type === 'BUY'
                            ? 'bg-wefin-red-soft text-wefin-red'
                            : 'bg-wefin-surface-2 text-wefin-blue'
                        }`}
                      >
                        {o.type === 'BUY' ? '매수' : '매도'}
                      </span>
                    </td>
                    <td className="font-num whitespace-nowrap py-3.5 text-right font-bold text-wefin-text">
                      {o.amount}원
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>

        {/* Right: Ranking + AI Report */}
        <div className="flex flex-col gap-5">
          {/* Rankings */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base p-5"
          >
            <h3 className="mb-4 text-sm font-bold text-wefin-text">최종 랭킹</h3>
            <div className="space-y-1.5">
              {[
                {
                  rank: 1,
                  name: '김투자',
                  asset: 56225000,
                  isMine: true,
                  colors: ['#0f8385', '#34d399'],
                  medal: 'bg-amber-400 text-white'
                },
                {
                  rank: 2,
                  name: '이재테크',
                  asset: 53100000,
                  isMine: false,
                  colors: ['#2563eb', '#60a5fa'],
                  medal: 'bg-wefin-muted text-white'
                },
                {
                  rank: 3,
                  name: '박워렌',
                  asset: 48750000,
                  isMine: false,
                  colors: ['#7c3aed', '#a78bfa'],
                  medal: 'bg-amber-600 text-white'
                }
              ].map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    r.isMine ? 'bg-wefin-mint-soft' : 'bg-wefin-surface-2'
                  }`}
                >
                  <span
                    className={`font-num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${r.medal}`}
                  >
                    {r.rank}
                  </span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${r.colors[0]}, ${r.colors[1]})`
                    }}
                  >
                    {r.name.charAt(0)}
                  </span>
                  <span className="flex-1 truncate text-[13px] font-semibold text-wefin-text">
                    {r.name}
                    {r.isMine && (
                      <span className="ml-1 text-[11px] text-wefin-mint-deep">(나)</span>
                    )}
                  </span>
                  <span className="font-num text-[13px] font-bold text-wefin-text">
                    {Math.trunc(r.asset).toLocaleString()}원
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Report */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-base p-6"
          >
            <div className="mb-5 flex items-center gap-2.5">
              <MessageCircle size={18} className="text-wefin-mint" />
              <h3 className="text-[16px] font-extrabold text-wefin-text">AI 분석 리포트</h3>
            </div>
            <div className="space-y-5">
              {[
                {
                  title: '성과 분석',
                  body: '반도체 섹터 비중 확대 전략이 주효했습니다. 삼성전자와 SK하이닉스의 상승분이 전체 수익의 68%를 차지했습니다.'
                },
                {
                  title: '투자 패턴',
                  body: '총 12회 매매 중 매수 8회, 매도 4회. 적극적인 매수 성향을 보였으며 평균 보유 기간은 3.2턴입니다.'
                },
                {
                  title: '제안',
                  body: '포트폴리오 분산을 고려해보세요. 섹터 집중도가 높아 리스크 관리가 필요합니다.'
                }
              ].map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="rounded-xl border-l-[3px] border-wefin-mint bg-wefin-surface-2 py-5 pr-6 pl-5"
                >
                  <h4 className="text-[15px] font-extrabold text-wefin-text">{section.title}</h4>
                  <p className="mt-3 text-[14px] leading-[1.85] text-wefin-text">{section.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
