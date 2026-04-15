import type { PortfolioItem } from '../api/fetch-portfolio'

interface HoldingsPanelProps {
  stockCode: string
  holding: PortfolioItem | null
  isLoading: boolean
}

export default function HoldingsPanel({ holding, isLoading }: HoldingsPanelProps) {
  return (
    <div>
      <div className="border-b border-gray-100 px-3 py-1.5">
        <span className="text-xs font-medium text-wefin-text">보유 주식</span>
      </div>
      <div className="px-3 py-2">
        {isLoading ? <LoadingRow /> : <HoldingContent holding={holding} />}
      </div>
    </div>
  )
}

function LoadingRow() {
  return <p className="py-2 text-center text-[10px] text-gray-400">불러오는 중...</p>
}

function HoldingContent({ holding }: { holding: PortfolioItem | null }) {
  if (!holding || !holding.quantity) {
    return <p className="py-2 text-center text-[10px] text-gray-400">보유 중인 수량이 없어요</p>
  }

  const profitLoss = holding.profitLoss ?? 0
  const profitRate = holding.profitRate ?? 0
  const profitColor = profitLoss >= 0 ? 'text-red-500' : 'text-blue-500'

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
      <InfoRow label="보유 수량" value={`${(holding.quantity ?? 0).toLocaleString()}주`} />
      <InfoRow label="평단가" value={formatPrice(holding.avgPrice)} />
      <InfoRow label="현재가" value={formatPrice(holding.currentPrice)} />
      <InfoRow label="평가금액" value={formatPrice(holding.evaluationAmount)} />
      <InfoRow
        label="평가손익"
        value={`${profitLoss.toLocaleString()}원`}
        valueClassName={profitColor}
      />
      <InfoRow label="수익률" value={`${profitRate.toFixed(2)}%`} valueClassName={profitColor} />
    </div>
  )
}

function InfoRow({
  label,
  value,
  valueClassName = 'text-wefin-text'
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex justify-between">
      <span className="text-wefin-subtle">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  )
}

function formatPrice(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return `${value.toLocaleString()}원`
}
