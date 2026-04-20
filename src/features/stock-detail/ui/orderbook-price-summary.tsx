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
  if (won >= 1_0000_0000_0000) {
    const jo = Math.floor(won / 1_0000_0000_0000)
    const eok = Math.floor((won - jo * 1_0000_0000_0000) / 1_0000_0000)
    return eok > 0 ? `${jo}조${eok.toLocaleString()}억` : `${jo}조`
  }
  if (won >= 1_0000_0000) return `${Math.floor(won / 1_0000_0000)}억`
  if (won >= 1_0000) return `${Math.floor(won / 1_0000)}만`
  return won.toLocaleString()
}

export default function OrderbookPriceSummary({ price }: PriceSummaryProps) {
  const changeColor =
    price.changePrice > 0
      ? 'text-wefin-red'
      : price.changePrice < 0
        ? 'text-wefin-blue'
        : 'text-wefin-subtle'
  const sign = price.changePrice > 0 ? '+' : ''

  return (
    <div className="border-t border-wefin-line px-3 py-1.5">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <Row label="시가" value={price.openPrice.toLocaleString()} />
        <Row label="고가" value={price.highPrice.toLocaleString()} valueClass="text-wefin-red" />
        <Row label="저가" value={price.lowPrice.toLocaleString()} valueClass="text-wefin-blue" />
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
