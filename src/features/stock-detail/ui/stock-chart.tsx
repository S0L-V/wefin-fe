import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi
} from 'lightweight-charts'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { CandleData } from '@/features/stock-detail/api/fetch-stock-detail'
import { fetchCandles } from '@/features/stock-detail/api/fetch-stock-detail'

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

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function StockChart({ code, height = 340 }: StockChartProps) {
  const [periodCode, setPeriodCode] = useState('D')
  const [allCandles, setAllCandles] = useState<CandleData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const loadingMore = useRef(false)
  const oldestDate = useRef<string | null>(null)
  const hasMoreData = useRef(true)

  // 초기 데이터 로딩
  const loadInitialData = useCallback(async () => {
    setIsLoading(true)
    setAllCandles([])
    oldestDate.current = null
    hasMoreData.current = true
    try {
      const data = await fetchCandles(code, periodCode)
      const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
      setAllCandles(sorted)
      if (sorted.length > 0) {
        oldestDate.current = sorted[0].date
      }
    } catch {
      // 에러 시 빈 상태 유지
    } finally {
      setIsLoading(false)
    }
  }, [code, periodCode])

  // 과거 데이터 추가 로딩
  const loadMoreData = useCallback(async () => {
    if (loadingMore.current || !oldestDate.current || !hasMoreData.current) return
    loadingMore.current = true

    try {
      const endDate = new Date(oldestDate.current)
      endDate.setDate(endDate.getDate() - 1)
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

      const { baseApi } = await import('@/shared/api/base-api')
      const { apiResponseSchema } = await import('@/shared/api/api-response')
      const { z } = await import('zod')
      const { candleSchema } = await import('@/features/stock-detail/api/fetch-stock-detail')

      const response = await baseApi.get(`/stocks/${code}/candles`, {
        params: {
          periodCode,
          start: formatDate(startDate),
          end: formatDate(endDate)
        }
      })
      const parsed = apiResponseSchema(z.array(candleSchema)).parse(response.data)
      const newData = parsed.data

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
      timeScale: { borderColor: '#e0e0e0', timeVisible: true, rightOffset: 5, fixRightEdge: true },
      rightPriceScale: { borderColor: '#e0e0e0' }
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderDownColor: '#3b82f6',
      borderUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
      wickUpColor: '#ef4444'
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
        loadMoreData()
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

  // 데이터 업데이트
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || allCandles.length === 0) return

    const candleData = allCandles.map((c) => ({
      time: c.date as string,
      open: c.openPrice,
      high: c.highPrice,
      low: c.lowPrice,
      close: c.closePrice
    }))

    const volumeData = allCandles.map((c) => ({
      time: c.date as string,
      value: c.volume,
      color: c.closePrice >= c.openPrice ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'
    }))

    candleSeriesRef.current.setData(candleData)
    volumeSeriesRef.current.setData(volumeData)

    // 초기 로딩일 때만 fitContent
    if (allCandles.length <= 100) {
      chartRef.current?.timeScale().fitContent()
    }
  }, [allCandles])

  return (
    <div className="flex h-full flex-col">
      {/* 기간 탭 */}
      <div className="flex shrink-0 items-center gap-0.5 border-b border-gray-100 px-2 py-1">
        {periods.map((p) => (
          <PeriodButton
            key={p.code}
            label={p.label}
            active={periodCode === p.code}
            onClick={() => setPeriodCode(p.code)}
          />
        ))}
        <div className="mx-1.5 h-3 w-px bg-gray-200" />
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
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <span className="text-xs text-gray-400">로딩 중...</span>
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
      className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
        active ? 'bg-wefin-mint text-white' : 'text-wefin-subtle hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}
