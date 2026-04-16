import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import type { AssetHistoryItem } from '../api/fetch-account'

interface AssetHistoryChartProps {
  history: AssetHistoryItem[]
  height?: number
}

interface ChartPoint {
  date: string
  totalAsset: number
  label: string
}

function formatDateLabel(date: string): string {
  // "YYYY-MM-DD" → "M/D"
  const parts = date.split('-')
  if (parts.length < 3) return date
  return `${Number(parts[1])}/${Number(parts[2])}`
}

function formatAmountTick(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만`
  return value.toLocaleString()
}

export default function AssetHistoryChart({ history, height = 240 }: AssetHistoryChartProps) {
  const data: ChartPoint[] = history
    .filter((item) => item.date && item.totalAsset !== null)
    .map((item) => ({
      date: item.date as string,
      totalAsset: item.totalAsset as number,
      label: formatDateLabel(item.date as string)
    }))

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
          <defs>
            <linearGradient id="assetAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#24a8ab" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#24a8ab" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip
            contentStyle={{
              border: '1px solid #dbe5ee',
              borderRadius: 8,
              fontSize: 12,
              padding: '6px 10px'
            }}
            labelStyle={{ color: '#637282', marginBottom: 2 }}
            formatter={(value: number) => [`${Math.trunc(value).toLocaleString()}원`, '총 자산']}
          />
          <Area
            type="monotone"
            dataKey="totalAsset"
            stroke="#24a8ab"
            strokeWidth={2}
            fill="url(#assetAreaGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
