import { Area, AreaChart, YAxis } from 'recharts'

import type { ChangeDirection, SparklinePoint } from '../api/fetch-market-indices'

interface IndexSparklineProps {
  points: SparklinePoint[]
  direction: ChangeDirection
  width?: number
  height?: number
}

const STROKE: Record<ChangeDirection, string> = {
  UP: '#ef4444',
  DOWN: '#3b82f6',
  FLAT: '#9ca3af'
}

export default function IndexSparkline({
  points,
  direction,
  width = 80,
  height = 36
}: IndexSparklineProps) {
  if (points.length < 2) {
    return <div style={{ width, height }} aria-hidden />
  }

  const stroke = STROKE[direction]
  const gradId = `index-sparkline-grad-${direction}`
  const data = points.map((p) => ({ v: p.v }))

  return (
    <AreaChart
      width={width}
      height={height}
      data={data}
      margin={{ top: 2, right: 0, left: 0, bottom: 2 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <YAxis
        hide
        width={0}
        domain={[
          (dataMin: number) => dataMin - dataMin * 0.001,
          (dataMax: number) => dataMax + dataMax * 0.001
        ]}
      />
      <Area
        type="monotone"
        dataKey="v"
        stroke={stroke}
        strokeWidth={1.5}
        fill={`url(#${gradId})`}
        isAnimationActive={false}
        dot={false}
        activeDot={false}
      />
    </AreaChart>
  )
}
