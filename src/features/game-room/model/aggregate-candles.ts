import type { ChartItem } from './stock.schema'

export type ChartInterval = 'day' | 'week' | 'month'

export interface AggregatedCandle {
  time: string // YYYY-MM-DD (버킷 마지막 거래일)
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * 일봉 ChartItem[]을 interval에 맞춰 OHLCV로 집계한다.
 *
 * 규칙:
 *   - open: 버킷 첫 거래일의 시가
 *   - close: 버킷 마지막 거래일의 종가
 *   - high: 버킷 내 최고가
 *   - low: 버킷 내 최저가
 *   - volume: 버킷 거래량 합계
 *   - time: 버킷 마지막 거래일 (lightweight-charts 정렬 안정성)
 *
 * 주봉 버킷 키: ISO 주(월요일 시작) → 'YYYY-WW'
 * 월봉 버킷 키: 'YYYY-MM'
 *
 * 입력은 tradeDate 오름차순으로 정렬되어 있다고 가정한다 (백엔드가 ASC로 반환).
 */
export function aggregateCandles(daily: ChartItem[], interval: ChartInterval): AggregatedCandle[] {
  if (interval === 'day') {
    return daily.map((d) => ({
      time: d.tradeDate,
      open: d.openPrice,
      high: d.highPrice,
      low: d.lowPrice,
      close: d.closePrice,
      volume: d.volume
    }))
  }

  const bucketKeyOf = interval === 'week' ? isoWeekKey : monthKey
  const byKey = new Map<string, ChartItem[]>()

  for (const row of daily) {
    const key = bucketKeyOf(row.tradeDate)
    const bucket = byKey.get(key)
    if (bucket) {
      bucket.push(row)
    } else {
      byKey.set(key, [row])
    }
  }

  const result: AggregatedCandle[] = []
  for (const bucket of byKey.values()) {
    const first = bucket[0]
    const last = bucket[bucket.length - 1]
    let high = first.highPrice
    let low = first.lowPrice
    let volume = 0
    for (const row of bucket) {
      if (row.highPrice > high) high = row.highPrice
      if (row.lowPrice < low) low = row.lowPrice
      volume += row.volume
    }
    result.push({
      time: last.tradeDate,
      open: first.openPrice,
      high,
      low,
      close: last.closePrice,
      volume
    })
  }

  // 버킷 삽입 순서가 곧 시간 순서 (입력이 ASC이므로)
  return result
}

/**
 * ISO 8601 주 번호 (월요일 시작).
 * 예: '2023-04-18' → '2023-16'
 */
function isoWeekKey(tradeDate: string): string {
  const [y, m, d] = tradeDate.split('-').map(Number)
  // UTC 기준 Date — 시간대 시프트 방지
  const date = new Date(Date.UTC(y, m - 1, d))
  // ISO 주: 목요일이 속한 주의 연도
  const dayOfWeek = date.getUTCDay() || 7 // 일=0 → 7
  date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`
}

function monthKey(tradeDate: string): string {
  // 'YYYY-MM-DD' → 'YYYY-MM'
  return tradeDate.slice(0, 7)
}
