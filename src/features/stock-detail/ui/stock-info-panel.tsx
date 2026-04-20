import { FileSearch, Info } from 'lucide-react'

import type {
  DartCompanyInfo,
  DartDividendInfo,
  DartFinancialPeriod,
  DartFinancialSummary,
  StockBasicInfo,
  StockIndicatorInfo
} from '@/features/stock-detail/api/fetch-stock-info-detail'
import { useStockInfoDetailQuery } from '@/features/stock-detail/model/use-stock-detail-queries'
import { ApiError } from '@/shared/api/base-api'

interface StockInfoPanelProps {
  code: string
  enabled?: boolean
}

export default function StockInfoPanel({ code, enabled = true }: StockInfoPanelProps) {
  const { data, isLoading, isError, error } = useStockInfoDetailQuery(code, enabled)

  if (isLoading) {
    return <EmptyState icon={<Info className="h-8 w-8 text-wefin-subtle" />} title="불러오는 중…" />
  }

  if (isError) {
    const isNotFound = error instanceof ApiError && error.code === 'MARKET_STOCK_NOT_FOUND'
    return (
      <EmptyState
        icon={<FileSearch className="h-8 w-8 text-wefin-subtle" />}
        title={
          isNotFound ? '종목정보를 제공하지 않는 종목입니다' : '종목정보를 불러오지 못했습니다'
        }
        description={
          isNotFound
            ? 'ETF·우선주·신주 등 일부 종목은 기업 공시 정보가 제공되지 않습니다.'
            : error instanceof Error
              ? error.message
              : '잠시 후 다시 시도해주세요.'
        }
      />
    )
  }

  if (!data) return null

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      <CompanyHeader company={data.company} />
      <KeyMetricsGrid
        basic={data.basic}
        indicator={data.indicator}
        financial={data.financial}
        dividend={data.dividend}
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <BasicInfoSection basic={data.basic} />
        <IndicatorSection indicator={data.indicator} />
      </div>
      <FinancialSection financial={data.financial} />
    </div>
  )
}

// --- Empty / Loading 공용 상태 ---

function EmptyState({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-wefin-bg">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-wefin-fg">{title}</p>
        {description && <p className="text-xs text-wefin-subtle">{description}</p>}
      </div>
    </div>
  )
}

// --- 공통 유틸 ---

const DASH = '-'

function fmtNumber(v: number | null | undefined, digits = 0): string {
  if (v === null || v === undefined) return DASH
  return v.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function fmtDecimal(v: number | null | undefined, digits = 2): string {
  return fmtNumber(v, digits)
}

function fmtPercent(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined) return DASH
  return `${fmtDecimal(v, digits)}%`
}

/** 시가총액 전체 금액 한 줄 표기: "1,271조 5,656억원" */
function fmtMarketCapFull(inHundredMillion: number | null | undefined): string {
  if (inHundredMillion === null || inHundredMillion === undefined) return DASH
  if (inHundredMillion >= 10_000) {
    const 조 = Math.floor(inHundredMillion / 10_000)
    const 억 = inHundredMillion % 10_000
    if (억 === 0) return `${조.toLocaleString('ko-KR')}조원`
    return `${조.toLocaleString('ko-KR')}조 ${억.toLocaleString('ko-KR')}억원`
  }
  return `${inHundredMillion.toLocaleString('ko-KR')}억원`
}

/** 시가총액 "1,271조 5,656억" 분리 (primary/secondary) */
function splitMarketCap(inHundredMillion: number | null | undefined): {
  primary: string
  secondary: string
} {
  if (inHundredMillion === null || inHundredMillion === undefined) {
    return { primary: DASH, secondary: '' }
  }
  if (inHundredMillion >= 10_000) {
    const 조 = Math.floor(inHundredMillion / 10_000)
    const 억 = inHundredMillion % 10_000
    return {
      primary: `${조.toLocaleString('ko-KR')}조`,
      secondary: 억 > 0 ? `${억.toLocaleString('ko-KR')}억원` : '원'
    }
  }
  return { primary: `${inHundredMillion.toLocaleString('ko-KR')}억원`, secondary: '' }
}

/**
 * 원 단위 금액을 큰 단위로 축약.
 * - |v| >= 1조 → "N.N조"
 * - |v| >= 1억 → "NNN억원"
 * - 그 외     → "N원"
 */
function fmtJo(v: number | null | undefined): string {
  if (v === null || v === undefined) return DASH
  const abs = Math.abs(v)
  if (abs >= 1_000_000_000_000) {
    const 조 = v / 1_000_000_000_000
    return `${조.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}조`
  }
  if (abs >= 100_000_000) {
    const 억 = Math.round(v / 100_000_000)
    return `${억.toLocaleString('ko-KR')}억원`
  }
  return `${v.toLocaleString('ko-KR')}원`
}

function fmtEstDate(yyyymmdd: string | null | undefined): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd ?? DASH
  return `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}`
}

/** 당기 vs 전기 증감률 (%) */
function calcChangeRate(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null
  if (previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

/** URL에 protocol 없으면 https:// 부착 */
function normalizeUrl(url: string): string {
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
}

// --- 섹션 컴포넌트 ---

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-wefin-line bg-wefin-bg px-2.5 py-0.5 text-[11px] text-wefin-subtle">
      {children}
    </span>
  )
}

function CompanyHeader({ company }: { company: DartCompanyInfo | null }) {
  if (!company) return null

  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-xl font-bold text-wefin-fg">{company.corpName ?? DASH}</h2>
        {company.corpNameEng && (
          <span className="text-sm text-wefin-subtle">{company.corpNameEng}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {company.ceoName && <Chip>대표: {company.ceoName}</Chip>}
        {company.establishedDate && <Chip>설립 {fmtEstDate(company.establishedDate)}</Chip>}
        {company.accountingMonth && <Chip>결산월 {company.accountingMonth}월</Chip>}
        {company.address && <Chip>{company.address}</Chip>}
        {company.homepageUrl && (
          <a
            href={normalizeUrl(company.homepageUrl)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-wefin-line bg-wefin-bg px-2.5 py-0.5 text-[11px] text-wefin-subtle underline underline-offset-2 hover:text-wefin-fg"
          >
            {company.homepageUrl}
          </a>
        )}
      </div>
    </header>
  )
}

function KeyMetricCard({
  label,
  primary,
  secondary
}: {
  label: string
  primary: React.ReactNode
  secondary?: React.ReactNode
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface p-3 sm:p-4">
      <p className="text-xs text-wefin-subtle">{label}</p>
      <p className="mt-1 truncate text-xl font-bold whitespace-nowrap text-wefin-fg sm:text-2xl">
        {primary}
      </p>
      {secondary && <p className="mt-0.5 text-xs break-keep text-wefin-subtle">{secondary}</p>}
    </div>
  )
}

function KeyMetricsGrid({
  basic,
  indicator,
  financial,
  dividend
}: {
  basic: StockBasicInfo | null
  indicator: StockIndicatorInfo | null
  financial: DartFinancialSummary | null
  dividend: DartDividendInfo | null
}) {
  const mcap = splitMarketCap(basic?.marketCapInHundredMillionKrw ?? null)

  // 영업이익 당기/전기
  const currentOp = financial?.currentPeriod?.operatingIncome ?? null
  const previousOp = financial?.previousPeriod?.operatingIncome ?? null
  const opChange = calcChangeRate(currentOp, previousOp)

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold text-wefin-subtle">핵심 지표</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KeyMetricCard label="시가총액" primary={mcap.primary} secondary={mcap.secondary} />
        <KeyMetricCard
          label="PER / PBR"
          primary={
            <span className="flex items-baseline gap-2">
              <span>{fmtDecimal(indicator?.per ?? null, 2)}</span>
              <span className="text-base font-normal text-wefin-subtle/60">/</span>
              <span>{fmtDecimal(indicator?.pbr ?? null, 2)}</span>
            </span>
          }
        />
        <KeyMetricCard
          label="영업이익"
          primary={fmtJo(currentOp)}
          secondary={
            opChange !== null ? (
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                전기 대비
                <ChangeBadge rate={opChange} />
              </span>
            ) : (
              <span className="whitespace-nowrap">전기 대비 정보 없음</span>
            )
          }
        />
        <KeyMetricCard
          label="배당수익률"
          primary={fmtPercent(dividend?.dividendYieldRate ?? null, 2)}
          secondary={
            dividend && (dividend.dividendPerShare !== null || dividend.payoutRatio !== null) ? (
              <span>
                주당{' '}
                {dividend.dividendPerShare !== null ? fmtNumber(dividend.dividendPerShare) : DASH}원
                {' · '}
                성향 {fmtPercent(dividend.payoutRatio ?? null, 1)}
              </span>
            ) : (
              '배당 정보 없음'
            )
          }
        />
      </div>
    </section>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-wefin-line bg-wefin-surface">
      <h3 className="border-b border-wefin-line px-4 py-2.5 text-sm font-semibold text-wefin-fg">
        {title}
      </h3>
      <div className="p-4">{children}</div>
    </section>
  )
}

function KV({
  label,
  value,
  valueNoWrap = false
}: {
  label: string
  value: React.ReactNode
  valueNoWrap?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-xs">
      <span className="shrink-0 whitespace-nowrap text-wefin-subtle">{label}</span>
      <span
        className={`min-w-0 text-right font-medium break-words text-wefin-fg ${
          valueNoWrap ? 'whitespace-nowrap' : ''
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function IndicatorSection({ indicator }: { indicator: StockIndicatorInfo | null }) {
  if (!indicator) {
    return (
      <Section title="투자 지표">
        <p className="text-xs text-wefin-subtle">정보 없음</p>
      </Section>
    )
  }
  return (
    <Section title="투자 지표">
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        <KV label="PER" value={fmtDecimal(indicator.per, 2)} valueNoWrap />
        <KV label="PBR" value={fmtDecimal(indicator.pbr, 2)} valueNoWrap />
        <KV label="EPS" value={fmtNumber(indicator.eps, 0)} valueNoWrap />
        <KV label="ROE" value={fmtPercent(indicator.roe)} valueNoWrap />
      </div>
    </Section>
  )
}

function BasicInfoSection({ basic }: { basic: StockBasicInfo | null }) {
  if (!basic) {
    return (
      <Section title="기본 정보">
        <p className="text-xs text-wefin-subtle">정보 없음</p>
      </Section>
    )
  }
  return (
    <Section title="기본 정보">
      <div className="flex flex-col gap-0.5">
        <KV
          label="시가총액"
          value={fmtMarketCapFull(basic.marketCapInHundredMillionKrw)}
          valueNoWrap
        />
        <KV label="상장주식수" value={fmtNumber(basic.listedShares)} valueNoWrap />
        <KV label="외국인 소진율" value={fmtPercent(basic.foreignRatio)} valueNoWrap />
      </div>
    </Section>
  )
}

function ChangeBadge({ rate }: { rate: number | null }) {
  if (rate === null || !isFinite(rate)) return null
  const sign = rate > 0 ? '+' : ''
  const colorClass =
    rate > 0
      ? 'bg-wefin-green-soft text-wefin-green'
      : rate < 0
        ? 'bg-wefin-red-soft text-wefin-red'
        : 'bg-wefin-bg text-wefin-subtle'
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${colorClass}`}>
      {sign}
      {Math.abs(rate) < 1 && rate !== 0 ? rate.toFixed(1) : rate.toFixed(0)}%
    </span>
  )
}

type Unit = 'jo' | 'eok'

/** 기업 단위 통일 포맷 */
function fmtByUnit(v: number | null | undefined, unit: Unit): string {
  if (v === null || v === undefined) return DASH
  if (unit === 'jo') {
    const 조 = v / 1_000_000_000_000
    return `${조.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}조`
  }
  const 억 = Math.round(v / 100_000_000)
  return `${억.toLocaleString('ko-KR')}억원`
}

function unitLabel(unit: Unit): string {
  return unit === 'jo' ? '조원' : '억원'
}

/** 매출액·영업이익 추이를 막대그래프로 표시. periods는 오래된→최근 순서 */
function TrendBars({
  title,
  periods,
  colors,
  unit
}: {
  title: string
  periods: { label: string; value: number | null }[]
  colors: string[] // 연한 → 진한 (길이 === periods.length)
  unit: Unit
}) {
  const values = periods.map((p) => p.value).filter((v): v is number => v !== null && v !== 0)
  if (values.length === 0) return null
  const absValues = values.map(Math.abs)
  const max = Math.max(...absValues)

  const latest = periods[periods.length - 1].value
  const prev = periods[periods.length - 2]?.value ?? null
  const change = calcChangeRate(latest, prev)

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-wefin-fg">{title}</h4>
      <div className="flex flex-col gap-1.5">
        {periods.map((p, i) => {
          const ratio =
            p.value !== null && p.value !== 0 ? Math.max(2, (Math.abs(p.value) / max) * 100) : 0
          const isLatest = i === periods.length - 1
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-10 shrink-0 text-wefin-subtle">{p.label}</span>
              <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-wefin-line/40">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${colors[i]}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-right font-medium text-wefin-fg whitespace-nowrap">
                {fmtByUnit(p.value, unit)}
              </span>
              {isLatest && change !== null && (
                <span className="shrink-0">
                  <ChangeBadge rate={change} />
                </span>
              )}
              {!isLatest && <span className="w-12 shrink-0" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FinancialSection({ financial }: { financial: DartFinancialSummary | null }) {
  if (!financial) {
    return (
      <Section title="재무제표 요약">
        <p className="text-xs text-wefin-subtle">정보 없음</p>
      </Section>
    )
  }

  // 표용 (최신 → 오래된 순)
  const periods: { label: string; data: DartFinancialPeriod | null }[] = [
    { label: financial.currentPeriod?.periodName ?? '당기', data: financial.currentPeriod },
    { label: financial.previousPeriod?.periodName ?? '전기', data: financial.previousPeriod },
    {
      label: financial.prePreviousPeriod?.periodName ?? '전전기',
      data: financial.prePreviousPeriod
    }
  ]

  // 추이 그래프용 (오래된 → 최신 순)
  const trendPeriods = [...periods].reverse()
  const revenueTrend = trendPeriods.map((p) => ({
    label: p.label,
    value: p.data?.revenue ?? null
  }))
  const operatingIncomeTrend = trendPeriods.map((p) => ({
    label: p.label,
    value: p.data?.operatingIncome ?? null
  }))

  const rows: {
    key: string
    label: string
    get: (p: DartFinancialPeriod | null) => number | null
  }[] = [
    { key: 'assets', label: '자산총계', get: (p) => p?.totalAssets ?? null },
    { key: 'liab', label: '부채총계', get: (p) => p?.totalLiabilities ?? null },
    { key: 'equity', label: '자본총계', get: (p) => p?.totalEquity ?? null },
    { key: 'revenue', label: '매출액', get: (p) => p?.revenue ?? null },
    { key: 'op', label: '영업이익', get: (p) => p?.operatingIncome ?? null },
    { key: 'ni', label: '당기순이익', get: (p) => p?.netIncome ?? null }
  ]

  // 기업 단위 결정: 모든 값의 최대 절댓값 >= 1조면 '조', 아니면 '억'
  const allValues = periods.flatMap((p) =>
    rows.map((r) => r.get(p.data)).filter((v): v is number => v !== null)
  )
  const maxAbs = allValues.length > 0 ? Math.max(...allValues.map((v) => Math.abs(v))) : 0
  const unit: Unit = maxAbs >= 1_000_000_000_000 ? 'jo' : 'eok'

  const previousLabel = periods[1].label

  return (
    <section className="rounded-xl border border-wefin-line bg-wefin-surface">
      <h3 className="border-b border-wefin-line px-4 py-2.5 text-sm font-semibold text-wefin-fg">
        재무제표 요약{financial.businessYear ? ` (${financial.businessYear} 사업연도)` : ''}
      </h3>
      <div className="flex flex-col gap-6 p-4">
        {/* 추이 그래프 */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <TrendBars
            title="매출액 추이"
            periods={revenueTrend}
            colors={['bg-wefin-blue/60', 'bg-wefin-blue', 'bg-wefin-blue/80']}
            unit={unit}
          />
          <TrendBars
            title="영업이익 추이"
            periods={operatingIncomeTrend}
            colors={['bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700']}
            unit={unit}
          />
        </div>

        {/* 상세 표 — table-fixed + colgroup으로 변화율 칼럼을 57기 금액에 밀착 */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-xs">
            <colgroup>
              <col />
              <col style={{ width: '56px' }} />
              <col style={{ width: '96px' }} />
              <col style={{ width: '110px' }} />
              <col style={{ width: '110px' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-wefin-line text-wefin-subtle">
                <th className="py-2 pr-3 text-left font-normal">항목</th>
                <th aria-hidden />
                <th className="py-2 pl-2 text-right font-normal whitespace-nowrap">
                  {periods[0].label}
                </th>
                <th className="py-2 text-right font-normal whitespace-nowrap">
                  {periods[1].label}
                </th>
                <th className="py-2 text-right font-normal whitespace-nowrap">
                  {periods[2].label}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const current = row.get(periods[0].data)
                const previous = row.get(periods[1].data)
                const change = calcChangeRate(current, previous)
                return (
                  <tr key={row.key} className="border-b border-wefin-line/60 last:border-0">
                    <td className="py-2 pr-3 text-left text-wefin-subtle whitespace-nowrap">
                      {row.label}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {change !== null && <ChangeBadge rate={change} />}
                    </td>
                    <td className="py-2 pl-2 text-right font-semibold text-wefin-fg whitespace-nowrap">
                      {fmtByUnit(current, unit)}
                    </td>
                    <td className="py-2 text-right text-wefin-fg whitespace-nowrap">
                      {fmtByUnit(previous, unit)}
                    </td>
                    <td className="py-2 text-right text-wefin-fg whitespace-nowrap">
                      {fmtByUnit(row.get(periods[2].data), unit)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="text-right text-[10px] text-wefin-subtle">
          단위: {unitLabel(unit)} · 증감률은 전기({previousLabel}) 대비
        </p>
      </div>
    </section>
  )
}
