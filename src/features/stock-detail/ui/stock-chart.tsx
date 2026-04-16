import { useQuery } from '@tanstack/react-query'
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type Time
} from 'lightweight-charts'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { CandleData } from '@/features/stock-detail/api/fetch-stock-detail'
import {
  fetchCandles,
  fetchCandlesByRange,
  formatSeoulDate
} from '@/features/stock-detail/api/fetch-stock-detail'
import type { CandleMessage } from '@/features/stock-detail/api/stock-socket-messages'
import { useStockPriceQuery } from '@/features/stock-detail/model/use-stock-detail-queries'

interface StockChartProps {
  code: string
  height?: number
}

type PeriodTab = { label: string; code: string }

const periods: PeriodTab[] = [
  { label: '1분', code: '1' },
  { label: '5분', code: '5' },
  { label: '15분', code: '15' },
  { label: '30분', code: '30' },
  { label: '1시간', code: '60' }
]

const datePeriods: PeriodTab[] = [
  { label: '일', code: 'D' },
  { label: '주', code: 'W' },
  { label: '월', code: 'M' }
]

const TOOLBAR_HEIGHT = 32
const MINUTE_PERIODS = new Set(['1', '5', '15', '30', '60'])

/** 분봉이면 Unix timestamp (KST 보정), 일봉이면 "YYYY-MM-DD" 문자열 반환 */
function toChartTime(date: string, periodCode: string): Time {
  if (MINUTE_PERIODS.has(periodCode)) {
    // "2026-04-13T15:01:00" → KST 시간을 UTC 기준 변환 후 offset 적용하여 차트에 KST로 표시
    const utcString = date.length >= 19 ? date.substring(0, 19) + '+00:00' : date + '+00:00'
    return Math.floor(new Date(utcString).getTime() / 1000) as Time
  }
  // 일봉: "2026-04-13T00:00:00" → "2026-04-13"
  return date.substring(0, 10) as Time
}

interface OhlcInfo {
  open: number
  high: number
  low: number
  close: number
}

export default function StockChart({ code, height = 340 }: StockChartProps) {
  const [periodCode, setPeriodCode] = useState('D')
  const [allCandles, setAllCandles] = useState<CandleData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [ohlc, setOhlc] = useState<OhlcInfo | null>(null)
  const { data: price } = useStockPriceQuery(code)
  const { data: latestCandle } = useQuery<CandleMessage>({
    queryKey: ['stocks', code, 'candle', 'latest'],
    queryFn: () => undefined as never,
    enabled: false // WS push로만 갱신, fetch 안 함
  })

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const loadingMore = useRef(false)
  const oldestDate = useRef<string | null>(null)
  const hasMoreData = useRef(true)
  const loadMoreRef = useRef<() => void>(() => {})
  const requestId = useRef(0)
  // 진행 중인 분봉 캔들의 OHLCV 추적
  const liveCandle = useRef<{
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
  } | null>(null)
  const prevTotalVolume = useRef<number>(0)
  const isInitialLoad = useRef(true)

  // 초기 데이터 로딩
  const loadInitialData = useCallback(async () => {
    const currentRequestId = ++requestId.current
    isInitialLoad.current = true
    setIsLoading(true)
    setAllCandles([])
    oldestDate.current = null
    hasMoreData.current = true
    liveCandle.current = null
    try {
      const data = await fetchCandles(code, periodCode)
      if (currentRequestId !== requestId.current) return
      const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
      setAllCandles(sorted)
      if (sorted.length > 0) {
        oldestDate.current = sorted[0].date
      }
    } catch {
      // 에러 시 빈 상태 유지
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false)
      }
    }
  }, [code, periodCode])

  // 과거 데이터 추가 로딩
  const loadMoreData = useCallback(async () => {
    if (loadingMore.current || !oldestDate.current || !hasMoreData.current) return
    loadingMore.current = true
    const currentRequestId = requestId.current

    try {
      // YYYY-MM-DD 문자열을 로컬 날짜로 파싱 (UTC 해석 방지)
      const [year, month, day] = oldestDate.current.split('-').map(Number)
      const endDate = new Date(year, month - 1, day - 1)
      const startDate = new Date(endDate)

      // periodCode에 따라 추가 로딩 범위 결정
      switch (periodCode) {
        case '1':
        case '5':
        case '15':
        case '30':
        case '60':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'D':
          startDate.setMonth(endDate.getMonth() - 3)
          break
        case 'W':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        case 'M':
          startDate.setFullYear(endDate.getFullYear() - 3)
          break
      }

      const newData = await fetchCandlesByRange(
        code,
        periodCode,
        formatSeoulDate(startDate),
        formatSeoulDate(endDate)
      )

      if (currentRequestId !== requestId.current) return

      if (newData.length === 0) {
        hasMoreData.current = false
        return
      }

      const sorted = [...newData].sort((a, b) => a.date.localeCompare(b.date))
      oldestDate.current = sorted[0].date

      setAllCandles((prev) => {
        const existingDates = new Set(prev.map((c) => c.date))
        const unique = sorted.filter((c) => !existingDates.has(c.date))
        return [...unique, ...prev]
      })
    } catch {
      // 추가 로딩 실패 시 무시
    } finally {
      loadingMore.current = false
    }
  }, [code, periodCode])

  // ref에 최신 loadMoreData 유지
  useEffect(() => {
    loadMoreRef.current = loadMoreData
  }, [loadMoreData])

  // periodCode나 code 변경 시 초기 로딩
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // 차트 초기화 (한 번만)
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#637282',
        fontSize: 9,
        attributionLogo: false
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' }
      },
      width: chartContainerRef.current.clientWidth,
      height: Math.max(100, height - TOOLBAR_HEIGHT),
      crosshair: { mode: 0 },
      timeScale: {
        borderColor: '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        fixRightEdge: true
      },
      rightPriceScale: { borderColor: '#e0e0e0' }
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderDownColor: '#3b82f6',
      borderUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      priceFormat: { type: 'price', precision: 0, minMove: 1 }
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume'
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 }
    })

    // 왼쪽 끝 도달 감지
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range) return
      if (range.from < 5) {
        loadMoreRef.current()
      }
    })

    // 커서 이동 시 OHLC 정보 표시
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setOhlc(null)
        return
      }
      const data = param.seriesData.get(candleSeries) as
        | {
            open: number
            high: number
            low: number
            close: number
          }
        | undefined
      if (data) {
        setOhlc({ open: data.open, high: data.high, low: data.low, close: data.close })
      } else {
        setOhlc(null)
      }
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width })
      }
    })
    ro.observe(chartContainerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // height 변경 시 차트 높이만 업데이트
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({ height: Math.max(100, height - TOOLBAR_HEIGHT) })
    }
  }, [height])

  // periodCode 변경 시 x축 시간 포맷 업데이트
  useEffect(() => {
    if (!chartRef.current) return

    if (MINUTE_PERIODS.has(periodCode)) {
      chartRef.current.applyOptions({
        timeScale: { timeVisible: true, secondsVisible: false, barSpacing: 44, rightOffset: 2 },
        localization: {
          timeFormatter: (time: number) => {
            const d = new Date(time * 1000)
            const Y = d.getUTCFullYear()
            const M = String(d.getUTCMonth() + 1).padStart(2, '0')
            const D = String(d.getUTCDate()).padStart(2, '0')
            const h = String(d.getUTCHours()).padStart(2, '0')
            const m = String(d.getUTCMinutes()).padStart(2, '0')
            return `${Y}-${M}-${D} ${h}:${m}`
          }
        }
      })
    } else {
      chartRef.current.applyOptions({
        timeScale: { timeVisible: false, secondsVisible: false, barSpacing: 8, rightOffset: 5 },
        localization: {
          timeFormatter: (time: string) => {
            // 일봉: "2026-04-13" 그대로 반환
            return String(time)
          }
        }
      })
    }
  }, [periodCode])

  // 데이터 업데이트
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return

    if (allCandles.length === 0) {
      candleSeriesRef.current.setData([])
      volumeSeriesRef.current.setData([])
      return
    }

    // 중복 시간 제거 (첫 번째 값 유지)
    const seen = new Set<string>()
    const deduped = allCandles.filter((c) => {
      const key = String(toChartTime(c.date, periodCode))
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const candleData = deduped.map((c) => ({
      time: toChartTime(c.date, periodCode),
      open: c.openPrice,
      high: c.highPrice,
      low: c.lowPrice,
      close: c.closePrice
    }))

    const volumeData = deduped.map((c) => ({
      time: toChartTime(c.date, periodCode),
      value: c.volume,
      color: c.closePrice >= c.openPrice ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'
    }))

    try {
      candleSeriesRef.current.setData(candleData)
      volumeSeriesRef.current.setData(volumeData)
    } catch {
      // 시간 순서 충돌 시 무시
    }

    // 최초 로딩 직후엔 레이아웃이 안정된 다음 프레임에 fitContent 재호출
    // (컨테이너 너비 0으로 초기화되는 케이스 대응)
    if (candleData.length > 0 && isInitialLoad.current) {
      const fit = () => chartRef.current?.timeScale().fitContent()
      fit()
      requestAnimationFrame(fit)
      isInitialLoad.current = false
    }
  }, [allCandles, periodCode])

  // 실시간 체결가로 캔들 업데이트
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !price || allCandles.length === 0)
      return

    const currentPrice = price.currentPrice

    if (MINUTE_PERIODS.has(periodCode)) {
      // 분봉: 현재 KST 시간 기준으로 진행 중인 캔들의 OHLCV를 추적
      const KST_OFFSET = 9 * 60 * 60
      const nowSec = Math.floor(Date.now() / 1000) + KST_OFFSET
      const periodSec = parseInt(periodCode) * 60
      const time = Math.floor(nowSec / periodSec) * periodSec

      // 개별 체결량 = 현재 누적 거래량 - 이전 누적 거래량
      const tradeVolume = Math.max(0, price.volume - prevTotalVolume.current)
      prevTotalVolume.current = price.volume

      const live = liveCandle.current
      if (!live || live.time !== time) {
        // 새 분봉 시작 — open 설정
        liveCandle.current = {
          time,
          open: currentPrice,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice,
          volume: tradeVolume
        }
      } else {
        // 기존 분봉 업데이트
        live.high = Math.max(live.high, currentPrice)
        live.low = Math.min(live.low, currentPrice)
        live.close = currentPrice
        live.volume += tradeVolume
      }

      const candle = liveCandle.current
      if (!candle) return
      try {
        candleSeriesRef.current.update({
          time: candle.time as Time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close
        })
        volumeSeriesRef.current.update({
          time: candle.time as Time,
          value: candle.volume,
          color: candle.close >= candle.open ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'
        })
      } catch {
        // 시간 순서 충돌 시 무시
      }
    } else {
      // 일봉/주봉/월봉: REST 데이터의 마지막 캔들 기준
      const lastCandle = allCandles[allCandles.length - 1]
      const time = toChartTime(lastCandle.date, periodCode)

      candleSeriesRef.current.update({
        time,
        open: lastCandle.openPrice,
        high: Math.max(lastCandle.highPrice, currentPrice),
        low: Math.min(lastCandle.lowPrice, currentPrice),
        close: currentPrice
      })

      volumeSeriesRef.current.update({
        time,
        value: price.volume,
        color: currentPrice >= lastCandle.openPrice ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'
      })
    }
  }, [price, allCandles, periodCode])

  // 분봉 WS 메시지로 새 캔들 추가 / 현재 캔들 업데이트
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !latestCandle) return

    const isMinutePeriod = ['1', '5', '15', '30', '60'].includes(periodCode)
    if (!isMinutePeriod) return
    if (latestCandle.periodCode !== periodCode) return

    // KST 시간을 UTC 기준 변환 후 offset 적용하여 차트에 KST로 표시
    const timeStr = latestCandle.time
    const utcString =
      timeStr.length >= 19 ? timeStr.substring(0, 19) + '+00:00' : timeStr + '+00:00'
    const utcTimestamp = Math.floor(new Date(utcString).getTime() / 1000)

    try {
      candleSeriesRef.current.update({
        time: utcTimestamp as Time,
        open: latestCandle.openPrice,
        high: latestCandle.highPrice,
        low: latestCandle.lowPrice,
        close: latestCandle.closePrice
      })

      volumeSeriesRef.current.update({
        time: utcTimestamp as Time,
        value: latestCandle.volume,
        color:
          latestCandle.closePrice >= latestCandle.openPrice
            ? 'rgba(239,68,68,0.3)'
            : 'rgba(59,130,246,0.3)'
      })
    } catch {
      // 시간 순서 충돌 시 무시 — 다음 폴링/WS에서 정상화됨
    }
  }, [latestCandle, periodCode])

  return (
    <div className="flex h-full flex-col">
      {/* 기간 탭 */}
      <div className="flex shrink-0 items-center gap-0 border-b border-wefin-line px-2 py-1">
        {periods.map((p) => (
          <PeriodButton
            key={p.code}
            label={p.label}
            active={periodCode === p.code}
            onClick={() => setPeriodCode(p.code)}
          />
        ))}
        <div className="mx-1 h-3 w-px bg-gray-200" />
        {datePeriods.map((p) => (
          <PeriodButton
            key={p.code}
            label={p.label}
            active={periodCode === p.code}
            onClick={() => setPeriodCode(p.code)}
          />
        ))}
      </div>

      {/* 차트 */}
      <div className="relative min-h-0 flex-1">
        {/* OHLC 정보 — 차트 위에 겹쳐서 표시 */}
        {ohlc && (
          <div className="absolute left-1 top-1 z-10 flex items-center gap-2 rounded bg-white/80 px-2 py-0.5 text-xs">
            <span className="text-wefin-subtle">
              시 <span className="font-medium text-wefin-text">{ohlc.open.toLocaleString()}</span>
            </span>
            <span className="text-wefin-subtle">
              고 <span className="font-medium text-red-500">{ohlc.high.toLocaleString()}</span>
            </span>
            <span className="text-wefin-subtle">
              저 <span className="font-medium text-blue-500">{ohlc.low.toLocaleString()}</span>
            </span>
            <span className="text-wefin-subtle">
              종{' '}
              <span
                className={`font-medium ${ohlc.close >= ohlc.open ? 'text-red-500' : 'text-blue-500'}`}
              >
                {ohlc.close.toLocaleString()}
              </span>
            </span>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <span className="text-xs text-wefin-subtle">로딩 중...</span>
          </div>
        )}
        <div ref={chartContainerRef} />
      </div>
    </div>
  )
}

function PeriodButton({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-1.5 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-wefin-mint text-white' : 'text-wefin-subtle hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}
