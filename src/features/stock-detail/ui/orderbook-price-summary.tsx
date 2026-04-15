interface PriceSummaryProps {
  price: {
    openPrice: number
    highPrice: number
    lowPrice: number
    volume: number
    changePrice: number
    changeRate: number
  }
}

function formatTradingValue(won: number): string {
  if (won >= 1_0000_0000) return `${(won / 1_0000_0000).toFixed(0)}억`
  if (won >= 1_0000) return `${(won / 1_0000).toFixed(0)}만`
  return won.toLocaleString()
}

export default function OrderbookPriceSummary({ price }: PriceSummaryProps) {
  const changeColor =
    price.changePrice > 0
      ? 'text-red-500'
      : price.changePrice < 0
        ? 'text-blue-500'
        : 'text-wefin-subtle'
  const sign = price.changePrice > 0 ? '+' : ''

  return (
    <div className="border-t border-wefin-line px-3 py-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Row label="시가" value={price.openPrice.toLocaleString()} />
        <Row label="고가" value={price.highPrice.toLocaleString()} valueClass="text-red-500" />
        <Row label="저가" value={price.lowPrice.toLocaleString()} valueClass="text-blue-500" />
        <Row
          label="전일비"
          value={`${sign}${price.changeRate.toFixed(2)}%`}
          valueClass={changeColor}
        />
        <Row label="거래량" value={price.volume.toLocaleString()} />
        <Row label="거래대금" value={formatTradingValue(price.openPrice * price.volume)} />
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  valueClass = 'text-wefin-text'
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-wefin-subtle">{label}</span>
      <span className={`font-medium tabular-nums ${valueClass}`}>{value}</span>
    </div>
  )
}
