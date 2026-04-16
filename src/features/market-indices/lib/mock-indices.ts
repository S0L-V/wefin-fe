import type { MarketIndicesResponse } from '../api/fetch-market-indices'

// 정규장 5분 분봉 80개 = 약 6h 40m
function generateSparkline(base: number, drift: number, count = 80, intervalMs = 5 * 60_000) {
  const now = Date.now()
  const points: { t: string; v: number }[] = []
  // 시각적 굴곡: base 대비 ±0.6%의 정현파 + 작은 노이즈 + 끝값이 base+drift로 수렴
  const amplitude = base * 0.006
  for (let i = 0; i < count; i++) {
    const phase = (i / (count - 1)) * Math.PI * 2.5
    const wave = Math.sin(phase) * amplitude
    const noise = (Math.random() - 0.5) * (amplitude * 0.4)
    const trendProgress = i / (count - 1)
    const trendValue = drift * trendProgress
    const v = base - drift + trendValue + wave + noise
    points.push({
      t: new Date(now - (count - i - 1) * intervalMs).toISOString(),
      v: Number(v.toFixed(2))
    })
  }
  return points
}

export const MOCK_MARKET_INDICES: MarketIndicesResponse = {
  updatedAt: new Date().toISOString(),
  indices: [
    {
      code: 'KOSPI',
      name: '코스피',
      currentValue: 2560.23,
      changeValue: 12.45,
      changeRate: 0.49,
      changeDirection: 'UP',
      isDelayed: false,
      marketStatus: 'OPEN',
      sparkline: generateSparkline(2560.23, 12.45)
    },
    {
      code: 'KOSDAQ',
      name: '코스닥',
      currentValue: 735.41,
      changeValue: -3.12,
      changeRate: -0.42,
      changeDirection: 'DOWN',
      isDelayed: false,
      marketStatus: 'OPEN',
      sparkline: generateSparkline(735.41, -3.12)
    },
    {
      code: 'NASDAQ',
      name: '나스닥',
      currentValue: 18302.45,
      changeValue: 24.67,
      changeRate: 0.13,
      changeDirection: 'UP',
      isDelayed: true,
      marketStatus: 'CLOSED',
      sparkline: generateSparkline(18302.45, 24.67)
    },
    {
      code: 'SP500',
      name: 'S&P 500',
      currentValue: 5820.11,
      changeValue: 0,
      changeRate: 0,
      changeDirection: 'FLAT',
      isDelayed: true,
      marketStatus: 'CLOSED',
      sparkline: generateSparkline(5820.11, 0)
    }
  ]
}
