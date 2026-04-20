import {
  CandlestickSeries,
  ColorType,
  createChart,
  CrosshairMode,
  HistogramSeries,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  LineStyle
} from 'lightweight-charts'
import { useEffect, useRef } from 'react'

import type { AggregatedCandle, ChartInterval } from './aggregate-candles'

interface UseLightweightChartOptions {
  data: AggregatedCandle[] | null
  interval: ChartInterval
  symbol: string | null
}

/**
 * lightweight-charts 라이프사이클을 캡슐화한 커스텀 훅.
 *
 * 책임 범위:
 *   - 차트 인스턴스 생성/정리 (마운트 시 1회)
 *   - 캔들/볼륨 시리즈 데이터 업데이트
 *   - 뷰포트(visible range) 초기화 — symbol 또는 interval 변경 시에만
 *   - 마지막 종가 점선 마커 갱신
 *   - 컨테이너 크기 변경 대응 (ResizeObserver)
 *
 * 설계 원칙:
 *   - 외부 라이브러리 타입(IChartApi 등)이 UI 레이어로 새어나가지 않는다
 *   - 컴포넌트는 `<div ref={containerRef} />` 하나만 붙이면 됨
 *   - 차트 인스턴스는 1회 생성 후 재사용 → 종목 전환 시 재생성 오버헤드 없음
 */
export function useLightweightChart({ data, interval, symbol }: UseLightweightChartOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const lastPriceLineRef = useRef<IPriceLine | null>(null)
  // 뷰포트 리셋 기준: 심볼 또는 interval이 바뀌었을 때만.
  // 단순 데이터 refresh 시에는 사용자가 스크롤한 위치를 유지한다.
  const prevViewportKeyRef = useRef<string | null>(null)

  // 차트 생성/정리 (마운트 시 1회)
  useEffect(() => {
    if (!containerRef.current) return

    const styles = getComputedStyle(document.documentElement)
    const lineColor = styles.getPropertyValue('--line').trim()
    const textColor = styles.getPropertyValue('--subtle').trim()

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
        fontSize: 13,
        attributionLogo: false
      },
      grid: {
        vertLines: { color: lineColor, style: LineStyle.Dotted },
        horzLines: { color: lineColor, style: LineStyle.Dotted }
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        tickMarkFormatter: (time: string) => {
          const parts = time.split('-')
          return `${parts[1]}/${parts[2]}`
        }
      },
      localization: {
        timeFormatter: (time: string) => {
          const parts = time.split('-')
          return `${parts[1]}/${parts[2]}`
        }
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
      priceFormat: {
        type: 'custom',
        formatter: formatPrice,
        minMove: 0.01
      }
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume'
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      chart.applyOptions({ width, height })
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
      lastPriceLineRef.current = null
      prevViewportKeyRef.current = null
    }
  }, [])

  // 데이터/뷰포트/가격 마커 업데이트
  useEffect(() => {
    const candleSeries = candleSeriesRef.current
    const volumeSeries = volumeSeriesRef.current
    const chart = chartRef.current
    if (!data || !candleSeries || !volumeSeries || !chart) return

    const candleData = data.map((d) => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close
    }))

    const volumeData = data.map((d) => ({
      time: d.time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'
    }))

    candleSeries.setData(candleData)
    volumeSeries.setData(volumeData)

    // 뷰포트 리셋은 심볼/interval이 바뀌었을 때만
    const viewportKey = `${symbol ?? ''}|${interval}`
    if (prevViewportKeyRef.current !== viewportKey) {
      resetViewport(chart, candleData.length, interval)
      prevViewportKeyRef.current = viewportKey
    }

    // 마지막 종가 점선 마커 갱신
    if (lastPriceLineRef.current) {
      candleSeries.removePriceLine(lastPriceLineRef.current)
      lastPriceLineRef.current = null
    }
    const last = candleData[candleData.length - 1]
    if (last) {
      lastPriceLineRef.current = candleSeries.createPriceLine({
        price: last.close,
        color: '#24a8ab',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: ''
      })
    }
  }, [data, interval, symbol])

  return { containerRef }
}

/**
 * 초기 표시 범위 계산:
 *   - 일봉: 최근 60개 (≈3개월 거래일)
 *   - 주봉: 최근 52개 (≈1년)
 *   - 월봉: 전체
 * 데이터가 부족하면 fitContent로 폴백.
 */
function resetViewport(chart: IChartApi, total: number, interval: ChartInterval) {
  const timeScale = chart.timeScale()
  const visibleCount = interval === 'day' ? 60 : interval === 'week' ? 52 : total
  if (total > visibleCount) {
    timeScale.setVisibleLogicalRange({
      from: total - visibleCount - 0.5,
      to: total - 0.5
    })
  } else {
    timeScale.fitContent()
  }
}

/**
 * 가격 축 포맷터: 150000 → "150,000.00"
 */
function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
