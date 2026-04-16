import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import type { TradeHistoryResponse } from '@/features/trade/api/fetch-trade'

interface DailyRealizedChartProps {
  trades: TradeHistoryResponse[]
  cutoffDate: string | null
  height?: number
}

interface DailyPoint {
  date: string
  amount: number
  label: string
}

function formatDateLabel(date: string): string {
  const parts = date.split('-')
  if (parts.length < 3) return date
  return `${Number(parts[1])}/${Number(parts[2])}`
}

function formatAmountTick(value: number): string {
  if (value === 0) return '0'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(1)}억`
  if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(0)}만`
  return value.toLocaleString()
}

export default function DailyRealizedChart({
  trades,
  cutoffDate,
  height = 180
}: DailyRealizedChartProps) {
  const aggregated = new Map<string, number>()
  for (const trade of trades) {
    if (trade.side !== 'SELL') continue
    if (!trade.createdAt) continue
    const date = trade.createdAt.substring(0, 10)
    if (cutoffDate && date < cutoffDate) continue
    aggregated.set(date, (aggregated.get(date) ?? 0) + (trade.realizedProfit ?? 0))
  }

  const data: DailyPoint[] = Array.from(aggregated.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount: Math.trunc(amount), label: formatDateLabel(date) }))

  if (data.length === 0) {
    return <p className="py-6 text-center text-xs text-wefin-subtle">실현 거래가 없어요</p>
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid stroke="#e6ecf2" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#637282', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#dbe5ee' }}
            minTickGap={20}
          />
          <YAxis
            tick={{ fill: '#637282', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatAmountTick}
            width={56}
          />
          <Tooltip
            contentStyle={{
              border: '1px solid #dbe5ee',
              borderRadius: 8,
              fontSize: 12,
              padding: '6px 10px'
            }}
            labelStyle={{ color: '#637282', marginBottom: 2 }}
            formatter={(value) => {
              const v = Math.trunc(Number(value))
              return [`${v >= 0 ? '+' : ''}${v.toLocaleString()}원`, '실현손익']
            }}
          />
          <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.date} fill={entry.amount >= 0 ? '#ef4444' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
